var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");
const dns = isBrowser() ? undefined : require('dns');
//const LRU = require('lru-cache');

class HostMx {
  constructor(hostName) {
    this.hostName = hostName;
  }

  // Returns: [{priority: 10, exchange: 'mx.example.com', ip:x, family:4|6}, ...]
  mxHosts() {
    if (this._mxers) return this._mxers;
    this._mxers = [];
    console.log("DNS1", this.hostName);
    let resp = dns.resolveMx(this.hostName, (err, addresses) => {
      for( let i=0; i<addresses.length; i++) {
        dns.lookup(addresses[i].exchange, {}, (iperr, address, family) => {
          addresses[i].ip = address;
          addresses[i].family = family;
          console.log("DNS4", addresses[i].exchange, iperr, address, family);
        });
      }
      this._mxers.push(addresses);
      console.log("DNS3", err,addresses, this._mxers);
    });
    console.log("DNS2", this.hostName, resp, this._mxers);
    return this._mxers;
  }


  // Returns the DNS A-Record IP Address (backup for mis-configured hosts)
  aHost() {
    if (this.config.dns === 'off') return 0;
    if (this._ip) return this._ip;
    dns.lookup(this.canonicalHostname, {}, (iperr, address, family) => {
      this._ip = address; // Handle both i=IPv4 an IPv6 returned?
    });
  }

  eachMx(fn) {
    if (this.config.dns === 'off') return;
    this.mxHosts().forEach(mx => {
      fn(mx);
    });
  }

  mxPromise() {
    return new Promise( (resolve, reject)=> {
      dns.resolveMx(this.hostName, (err, addresses) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            //for( let i=0; i<addresses.length; i++) {
            //  dns.lookup(addresses[i].exchange, {}, (iperr, address, family) => {
            //    addresses[i].ip = address;
            //    addresses[i].family = family;
            //    console.log("DNS4", addresses[i].exchange, iperr, address, family);
            //  });
            //}
            console.log("RESOLVED", addresses);
            resolve(addresses);
          }
      });
    });
  }

  mxIpPromise(exchanger) {
    return new Promise( (resolve, reject)=> {
      for( let i=0; i<addresses.length; i++) {
        dns.lookup(addresses[i].exchange, {}, (iperr, address, family) => {
          addresses[i].ip = address;
          addresses[i].family = family;
          console.log("DNS4", addresses[i].exchange, iperr, address, family);
        });
      }
      console.log("RESOLVED", addresses);
      resolve(addresses);
    });
  }

  mx() {
    var p = this.mxPromise();
    p.then( (result) => {
      console.log("RESULT", result);
    },
    (err) => {
      console.log("ERROR", err);
    });
  }

}

// https://github.com/bighappyworld/email-verify/blob/master/index.js
mx = new HostMx("gmail.com");
console.log(mx.mx());
console.log('FINIS');
