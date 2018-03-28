/******************************************************************************
/* Module:  email_address
/* Purpose: Email Address Validation and Introspection
/*          using different forms including standard and conventional.
/* Author:  Allen Fair <allen.fair@gmail.com>  @allenfair
/*****************************************************************************/

const md5   = require("md5");
const sha1  = require("sha1");
const Local = require("./lib/local");
const Host  = require("./lib/host");
const Config= require("./lib/config");
const CanonicalEmailAddress= require("./lib/canonical");
const RedactedEmailAddress = require("./lib/redacted");
var   globalConfig = undefined;

class EmailAddress {
  constructor(emailAddressString, config={}) {
    if (globalConfig) this.config = Config(globalConfig);
    this.config = Config(config, this.config);
    if (typeof emailAddressString !== 'string'
        || emailAddressString instanceof String) {
      emailAddressString = "";
    }

    this.original  = emailAddressString;
    this.errorCode = null;
    this.parse();
    this.host  = new Host(this.hostString, this.config); // Must be before local!
    this.local = new Local(this.localString, this.config);
    this.setFormat(this.config.format);
    this.isValid();
  }

  /****************************************************************************
  /* Operations and Validations
  /****************************************************************************/

  data() {
    return {
      original:  this.original,
      format:    this.config.format,
      address:   this.toString(),
      canonical: this.canonical(),
      redacted:  this.redacted(),
      md5:       this.digest('md5'),
      sha1:      this.digest('sha1'),
      local:     this.local.data(),
      host:      this.host.data(),
    //exchangers:this.hostMx['mxers'],
      valid:     this.valid,
      errorCode: this.errorCode
    };
  }

  toString() {
    return this.formatter.toString();
  }

  canonical() {
    var version = new CanonicalEmailAddress(this, this.config);
    return version.toString();
  }

  redacted() {
    var version = new RedactedEmailAddress(this, this.config);
    return version.toString();
  }

  digest(method='md5') {
    let ea = this.toString().toLowerCase();
    if (method === 'md5') {
      return md5(ea);
    } else if (method === 'sha1') {
      return sha1(ea);
    }
  }

  // to perform hostnane DNS validation pass a callback: (valid, errorCode) => {}
  // which should only work under Node, not in the browser, which doesn't support
  // DNS Lookups. The dns check fuction will be called asynchronously.
  isValid(checkDnsFn) {
    this.errorCode =  this.formatter.error();
    this.valid = this.errorCode ? false : true;

    if (checkDnsFn) {
      if (!this.valid) {
        fn(false, this,errorCode);
      } else {
        const HostMx = require("./lib/hostmx");
        this.hostMx  = new HostMx(this.host.hostname, this.config);
        this.hostMx.validMx(checkDnsFn);
      }
    }

    return this.valid;
  }

  error() {
    if (this.isValid()) {
      return null;
    } else {
      return this.config.errors[this.errorCode] || this.errorCode;
    }
  }

  /****************************************************************************
  /* Static Methods and Helpers
  /****************************************************************************/

  // EmailAddress.isValid("allen@example.com");
  static isValid(emailAddressString, config={}) {
    return (new EmailAddress(emailAddressString, config)).isValid();
  }

  static error(emailAddressString, config={}) {
    return (new EmailAddress(emailAddressString, config)).error();
  }

  // EmailAddress.config({setting:value,...});
  static config(object) {
    if (!globalConfig) globalConfig = {};
    globalConfig = Object.assign(globalConfig, object);
  }

  /****************************************************************************
  /* Private and Internals
  /****************************************************************************/

  parse() {
    var at = this.original.lastIndexOf("@");
    if (at === -1) { // No @host
      this.localString = this.original;
      this.hostString = "";
      // Or resolve.conf search parameter?
    } else if (at === 0) { // No local
      this.localString = "";
      this.hostString = this.original.substr(1);
    } else {
      this.localString = this.original.substr(0, at);
      this.hostString = this.original.substr(at + 1);
    }
  }

  setFormat(f) {
    let formatter;
    if (f === 'conventional') {
      formatter = require('./lib/conventional');
    }
    else if (f === 'standard') {
      formatter = require('./lib/standard');
    }
    else {
      throw "EmailAddress formatter " + f + " is not implemented";
    }
    return this.formatter = new formatter(this, this.config);
  }

}

module.exports = EmailAddress;
