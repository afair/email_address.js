const CidrAddress = require('cidr-address');
const punycode = require('punycode');
//const LRU = require("lru-cache");
var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");
const dns = isBrowser() ? undefined : require('dns');
const hostnameRegex = /^[\a-z\d]+(?:(?:\-{1,2}|\.)[\a-z\d]+)*$/i;


class Host {
  constructor(hostString, config={}) {
    if (isBrowser()) config.dns = "no";
    this.errorCode = null;
    this.valid = true;
    this.original = hostString;
    this.config = config;
    this.parse();
    this.provider();
    this.isValid();
  }

  /****************************************************************************
  /* Operations and Validations
  /****************************************************************************/

  isValid() {
    let c = this.config;
    if (this.ip) {
      if (!c.hostAllowIp) return this.setError("hostNoIp");
    } else {
      if (!this.hostname.match(hostnameRegex)) return this.setError("hostInvalid")
      if (this.hostname.length < c.hostSize[0]) return this.setError("hostTooShort");
      if (this.hostname.length > c.hostSize[1]) return this.setError("hostTooLong");
      if (c.dns === "a" && !this.aHost) return this.setError("hostNotFound");
    }
    // hostLocal:         false,
    return this.valid
  }

  setError(errorCode) {
    console.log('ERR', this.original, errorCode);
    this.valid = false;
    this.errorCode = errorCode;
    return false;
  }

  error() {
    return this.valid ? null : this.errorCode;
  }

  /****************************************************************************
  /* Private Section
  /****************************************************************************/

  // Takes a string "everything to the right of the @" and sets:
  // * hostname          - cleaned hostname, IDN are in Unicode
  // * family            - null or 4 for IPv4 address, 6 for IPv6 address
  // * ip                - ip address given
  // * canonicalHostname - hostname or punycode name for IDN's
  // * leadingComment    - including parens
  // * trailingComment   - including parens
  parse() {
    this.leadingComment = this.trailingComment = null;
    this.subdomains = this.registrationName = this.tld2 = this.tld = null;
    this.hostname       = this.original;
    this.parseComments();
    if (this.config.hostRemoveSpaces) this.hostname = this.hostname.replace(/\s+/,'');
    if (!this.parseIP()) { // if This is a DNS Name
      // Unicode/Punycode handling. canonicalHostname is used for DNS.
      this.hostname = this.hostname.toLowerCase();
      if (/[^\u0000-\u00ff]/.test(this.hostname)) {
        this.canonicalHostname = punycode.toASCII(this.hostname);
      } else if (/^xn--/.test(this.hostname)) {
        this.canonicalHostname = this.hostname;
        this.hostname = punycode.toUnicode(this.hostname);
      } else {
        this.canonicalHostname = this.hostname;
      }
      this.parseHostname();
    }
  }

  data() {
    return {
      name: this.hostname,
      canonicalName: this.canonicalHostname,
      ip: [ this.family, this.ip ],
      provider: this.provider(),
      subdomains: this.sudomains,
      registrationName: this.registrationName,
      domainName: this.domainName,
      tld2: this.tld2,
      tld: this.tld,
      valid: this.valid,
      errorCode: this.errorCode
    }
  }

  parseComments() {
    var leadingComment = /^((\(.*?)(?:(?<!\\))\))(.*)$/;
    var match = leadingComment.exec(this.mailbox);
    if (match !== null) {
      this.leadingComment = match[1];
      this.hostname      = match[2];
    }

    var trailingComment = /^(.*)(\(\.*?(?:(?<!\\))\))$/;
    match = trailingComment.exec(this.mailbox);
    if (match !== null) {
      this.trailingComment= match[2];
      this.hostname      = match[1];
    }
  }

  // Parses hostname as [1.23.45.67] or [IPv6:aa:::df], returns true if IP given
  parseIP() {
    this.family = null; // null | 4 | 6
    let m = this.hostname.match(/^\[(IPv6:)?(.+)\]$/i);
    if (!m) return false;
    this.family = (m[1] && m[1] > " ") ? 6 : 4;
    this.ip = m[2];
    if (this.family === 4) {
      let n = this.ip.split(".");
      if (n.length !== 4) return this.setError("hostBadIp");
      for (let i of n) {
        if (!i.match(/^\d{1,3}$/) || parseInt(i)>255) return this.setError("hostBadIp");
      }
    } else {
      let n = this.ip.split(":");
      if (n.length > 8) return this.setError("hostBadIp");
      for (let i of n) {
        if (!i.match(/^[\da-f]{0,4}$/)) return this.setError("hostBadIp");
      }
    }
    return true;
  }

  // Takes a hostname of the general format: mail.example.co.uk, Sets:
  // * subdomains       - mail, or mail.alumni, etc., null if none
  // * registrationName - example
  // * domainName       - example.co.uk
  // * tld2             - co.uk, or same as tld if a single level.
  // * tld              - uk
  parseHostname() {
    // Laterz: handle FQDN
    let h = this.canonicalHostname;
    if (h.indexOf(".") === -1) {
      this.subdomains = h;
    } else {
      let match = /^(.+)\.(\w{3,10})$/.exec(h);
      if (!match) match = /^(.+)\.(\w{1,3}\.\w\w)$/.exec(h);
      if (!match) match = /^(.+)\.(\w\w)$/.exec(h);
      if (match) {
        let withoutTld = match[1]; // example, mail.example
        this.tld2 = match[2]; // com, travel, co.uk
        let tldLevels = this.tld2.split(".");
        if (tldLevels.length == 2) {
          this.tld = tldLevels[1]; // co.uk => uk
        } else {
          this.tld = this.tld2;
        }
        let subPostion = withoutTld.lastIndexOf(".");
        if (subPostion >= 0) {
          this.subdomains = withoutTld.substr(0, subPostion - 1);
          this.registrationName = withoutTld.substr(subPostion + 1);
        } else {
          this.subdomains = "";
          this.registrationName = withoutTld;
        }
        this.domainName = this.registrationName + "." + this.tld2;
      } else { // BadFormat
        this.subdomains = self.tld = self.tld2 = "";
        this.domainName = this.registrationName = h;
      }
    }
    //console.log(h, this.subdomains, this.registrationName, this.tld2, this.tld, this.domainName);
  }

  // Takes an array or space-delimited list of domain match rules and returns boolean on match:
  // * example.       - Matches Registration Name
  // * .com           - Matches TLD (Top Level Domain)
  // * google         - Matches Provider ID
  // * glob*          - Matches a Glob wildcard
  // * IP/bits        - Matches by CIDR subnet (not implemented)
  matches(rule) {0
    if (typeof rule === 'string') rule = rule.split(/\s+/);
    let matched = false;
    rule.forEach(r => {
      if (r === this.domainName) matched = true;
      else if (r === this.registrationName + ".") matched = true;
      else if (r === "." + this.tld) matched = true;
      else if (r === "." + this.tld2) matched = true;
      else if (r.indexOf("*") >= 0) { }
    });
    //console.log(this.hostname, rule, matched);
    return matched;
  }

  // Finds a matching provider, sets config keys for that provider
  provider() {
    if (this._provider) return this._provider;
    this.hostedDomain = false; // private-label service
    Object.keys(this.config.providers).forEach( (k,i)=> {
      if (this.config.providers[k].hostMatch !== undefined) {
        if (this.matches(this.config.providers[k].hostMatch)) {
          this._provider = k;
        }
      }
      //else if (this.config.dns !== 'no') {
      //  if (this.config.providers[k].exchangerMatch !== undefined) {
      //    this.eachMx(mx=>{
      //      let h = new Host(mx.exchanger);
      //      if (h.matches(this.config.providers[k].exchangerMatch)) {
      //        this._provider = k;
      //        this.hostedDomain = true;
      //      }
      //    });
      //  }
      //  if (this.config.providers[k].cidrMatch !== undefined) {
      //    this.eachMx(mx=>{
      //      let h = new Host(mx.exchanger);
      //      if (h.matches(this.config.providers[k].exchangerMatch)) {
      //        this._provider = k;
      //        this.hostedDomain = true;
      //      }
      //    });
      //  }
      //}
    });

    if (this._provider === undefined) {
      this._provider = this.domainName;
    } else {
      Object.keys(this.config.providers[this._provider]).forEach(k => {
        this.config[k] = this.config.providers[this._provider][k];
      });
    }
    //console.log('Le Provider', this._provider);
    return this._provider;
  }

}

module.exports = Host;
