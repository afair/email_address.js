/******************************************************************************
 * Module: email_address
 * Purpose: Email Address Validation and Introspection
 *   using different forms including standard and conventional.
 * Author: Allen Fair <allen.fair@gmail.com>  @allenfair
 *****************************************************************************/

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
    this.string = emailAddressString;
    var at = this.string.lastIndexOf("@");
    if (at === -1) { // No @host
      this.localString = this.string;
      this.hostString = "";
      // Or resolve.conf search parameter?
    } else if (at === 0) { // No local
      this.localString = "";
      this.hostString = this.string.substr(1);
    } else {
      this.localString = this.string.substr(0, at);
      this.hostString = this.string.substr(at + 1);
    }
    // Set host first as it updates config for local part
    this.host = new Host(this.hostString, this.config);
    this.local = new Local(this.localString, this.config);
    debugger;
  }

  get original() {
    return this.original;
  }

  toString() {
    return this.local.toString() + "@" + this.host.toString();
  }

  isValid() {
    this.errorCode = undefined;
    this.valid = this.local.isValid() && this.host.isValid();
    return this.valid;
  }

  // EmailAddress.isValid("allen@example.com");
  static isValid(emailAddressString, config={}) {
    return (new EmailAddress(emailAddressString, config)).isValid();
  }

  // EmailAddress.config({setting:value,...});
  static config(object) {
    if (!globalConfig) globalConfig = {};
    globalConfig = Object.assign(globalConfig, object);
  }
}

module.exports = EmailAddress;
