const dns = require('dns');
const punycode = require('punycode');

class Host {
  constructor(hostString, config={}) {
    this.original = hostString;
    this.leadingComment = this.trailingComment = null;
    this.config = config;
    //this.lookupHosRules(config);
    this.parse();
  }

  parse() {
    this.hostname       = this.original;

    var leadingComment  = /^(\(\.*?\))(.*)$/;
    var match = leadingComment.exec(this.hostname);
    if (match !== null) {
      this.leadingComment = match[1];
      this.hostname       = match[2];
    }

    var trailingComment = /^(.*)(\(\.*?\))$/;
    match = trailingComment.exec(this.hostname);
    if (match !== null) {
      this.trailingComment= match[2];
      this.hostname       = match[1];
    }

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

    this.parseHostname(this.canonicalHostname);
  }

  parseHostname(h) {
    this.subdomains = this.registrationName = this.tld2 = this.tld = null;
    if (h.indexOf(".") === -1) {
      this.subdomains = h;
    } else {
      match = /^(.+)\.(\w{3,10})$/.exec(h);
      if (!match) match = /^(.+)\.(\w{1,3}\.\w\w)$/.exec(h);
      if (!match) match = /^(.+)\.(\w\w)$/.exec(h);
      if (match) {
        var withoutTld = match[1]; // example, mail.example
        this.tld2 = match[2]; // com, travel, co.uk
        var tldLevels = this.tld2.split(".");
        if (tldLevels.length == 2) this.tld = tldLevels[1]; // co.uk => uk
        var subPostion = withoutTld.lastIndexOf(".");
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
  }

  isValid() {
    this.errorCode = undefined;
    this.valid = /^[\a-z\d]+(?:(?:\-{1,2}|\.)[\a-z\d]+)*$/i.test(this.hostString);
    return this.valid
  }

  mxRecord() {
    dns.resolveMx(this.hostString, (err, addresses) => {
      // [{priority: 10, exchange: 'mx.example.com'}, ...]
      console.log(addresses);
    });
  }
}

module.exports = Host;
