/******************************************************************************
/* Module: email_address
/* Purpose: Email Address Validation and Introspection
/*   using different forms including standard and conventional.
/* Author: Allen Fair <allen.fair@gmail.com>  @allenfair
/*****************************************************************************/

const Local = require("./lib/local");
const Host  = require("./lib/host");
const Config= require("./lib/config");
var   globalConfig = undefined;

class EmailAddress {
  constructor(emailAddressString, config={}) {
    if (globalConfig) this.config = Config(globalConfig);
    this.config = Config(config, this.config);
    if (typeof emailAddressString !== 'string'
        || emailAddressString instanceof String) {
      emailAddressString = "";
    }

    this.original = emailAddressString;
    this.parse();
    this.host = new Host(this.hostString, this.config); // Must be before local!
    this.local = new Local(this.localString, this.config);
    this.setFormat(this.config.format);
    this.isValid();
  }

  /****************************************************************************
  /* Operations and Validations
  /****************************************************************************/

  toString() {
    return this.formatter.toString();
  }

  isValid() {
    this.errorCode =  this.formatter.error();
    return this.valid;
  }

  error() {
    if (this.isValid()) {
      return null;
    } else {
      console.log("err", this.errorCode);
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
    return this.formatter = new formatter(this);
  }

}

module.exports = EmailAddress;
