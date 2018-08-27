const dns = require('dns');

class HostExchanger {
  constructor(hostName, config={}) {
    this.hostName = hostName;
    this.config   = config;
  }

  async validDomain() {
    await this.exchangers()
    return this.a !== undefined
  }

  async validMailhost() {
    await this.exchangers()
    return this.mx.length > 0
  }

  async exchangers() {
    if (this.mx !== undefined ) return this.mx
    this.mx = []
    try {
      [this.mx, this.a] = await this.loadDns()
    } catch (e) {
      this.error = e
    }
    return this.mx
  }
  
  async exchangerIps() {
    await this.exchangers()
    this.mx = await this.lookupIps(this.mx)
    return this.mx
  }

  async loadDns() {
    return Promise.all([this.dnsResolve("MX"), this.dnsResolve("A")])
  }

  // Wraps dns.resolve() in async function
  async dnsResolve(type="MX") {
    return new Promise((resolve, reject)=> {
      dns.resolve(this.hostName, type,
        (err, records) => { 
          if (err) {
            reject(err)
          } else {
            //let records = await this.lookupIps(addresses)
            resolve(records)
          }
        })
    })
  }

  async lookupIps(addresses, keyAttribute='exchange') {
    var ipPromises = [];
    for (let mx of addresses) {
      ipPromises.push(new Promise( (resolve, reject) => {
        dns.lookup(mx[keyAttribute], null,
          (iperr, address, family) => {
            //console.log(mx, mx[keyAttribute], iperr, address, family)
            if (iperr) {
              mx.error = iperr
              reject(mx)
            } else {
              mx.family  = family; // 4 or 6
              mx.address = address; // IP string
              resolve(mx);
            }
        });
      }));
    }
    return Promise.all(ipPromises);
  }

}

module.exports = HostExchanger;

// // Devlopment Code ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// async function loadmx(domain) {
//   mx = new HostExchanger(domain, {})
//   await mx.exchangers()
//   console.log(domain, " a ", await mx.validDomain())
//   console.log(domain, " mx ", await mx.validMailhost())
//   console.log(domain, " xip ", await mx.exchangerIps())
//   return mx
// }
// loadmx("gmail.com")
// //loadmx("asdfsadfasdfsd.com")
