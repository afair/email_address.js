const dns = require('dns');
const punycode = require('punycode');

class Host {
  constructor(host_string, config={}) {
    this.original = host_string;
    this.leadingComment = this.trailingComment = null;
    this.config = config;
    //this.lookup_host_rules(config);
    this.parse();
  }

  parse() {
    this.hostname       = this.host_string

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

    // Unicode/Punycode handling
    this.hostname = this.hostname.toLowerCase();
    if (/[^\u0000-\u00ff]/.test(this.hostname)) {
      this.canonical_hostname = punycode.toASCII(this.hostname);
    } else if (/^xn--/.test(this.hostname)) {
      this.canonical_hostname = this.hostname;
      this.hostname = punycode.toUnicode(this.hostname);
    } else {
      this.canonical_hostname = this.hostname;
    }
  }

  isValid() {
    this.errorCode = undefined;
    this.valid = /^[\a-z\d]+(?:(?:\-{1,2}|\.)[\a-z\d]+)*$/i.test(this.host_string);
    return this.valid
  }

  mxRecord() {
    dns.resolveMx(this.host_string, (err, addresses) => {
      // [{priority: 10, exchange: 'mx.example.com'}, ...]
      console.log(addresses);
    });
  }
}

module.exports = Host;
