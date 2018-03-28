//var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");
//const dns = isBrowser() ? undefined : require('dns');
const dns = require('dns');
//const LRU = require('lru-cache');

class HostMx {
  constructor(hostName, config={}) {
    this.hostName = hostName;
    this.config   = config;
  }

  // Returns a promise to return the requested DNS records.
  resolve(type="MX") {
    return new Promise((resolve, reject) => {
      try {
        dns.resolve(this.hostName, type, (err, records) => {
          resolve(records);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  lookupMxIps() {
    var ipPromises = [];
    for (let mx of this.mxers) {
      ips.push(new Promise( (resolve, reject) => {
        dns.lookup(mx.exchange, {}, (iperr, address, family) => {
          if (iperr) {
            reject(iperr);
          } else {
            mx.family  = family;
            mx.address = address;
            resolve(address, family);
          }
        });
      }));
    }
    return Promise.all(ipPromises);
  }

  async exchangers(fn) {
    if (this.config.dns === 'off') fn(true);
    try {
      if (! this.mxers) {
        this.mxers    = await this.resolve("MX");
        var ipsResult = await this.lookupMxIps(this.mxers);
      }
      console.log(this.mxers);
      fn(this.mxers);
    } catch (e) {
      return [];
    }
  }

  async validMx(fn) {
    if (this.config.dns === 'off') return fn(true);
    this.exchangers( (mxers)=> {
      this.valid    = this.mxers.length > 0;
      fn(this.valid, this.valid ? null : 'hostNoMail');
    });
  }

  async validDomain(fn) {
    if (this.config.dns === 'off') return fn(true);
    try {
      Promise.all([this.resolve("MX"), this.resolve("A")]).then(p=>{
        //console.log('all', p);
        if (p[0] !== undefined && p[0].length > 0) {
          fn(true, null);
          return true;
        }
        else if (p[1] !== undefined && p[1].length > 0) {
          fn(true, "hostNoMail");
        } else {
          fn(false, "hostUnknown 1");
        }
      });
    } catch (e) {
      console.log(e);
      fn(false, 'hostUnknown 2')
      return false;
    }
  }

  async validMxOrA(fn) {
    if (this.config.dns === 'off') return true;
    try {
      Promise.all([this.resolve("MX"), this.resolve("A")]).then(p=>{
        //console.log('all', p);
        if (p[0] !== undefined && p[0].length > 0) {
          fn(true, null);
          return true;
        }
        else if (p[1] !== undefined && p[1].length > 0) {
          fn(true, "hostNoMail");
        } else {
          fn(false, "hostUnknown 1");
        }
      });
    } catch (e) {
      console.log(e);
      fn(false, 'hostUnknown 2')
      return false;
    }
  }

}

module.exports = HostMx;

//mx = new HostMx("example.com");
//console.log('started', mx.validMxOrA((ok,err)=>{console.log('DONE', ok, err);}));
