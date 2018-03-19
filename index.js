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
  constructor(email_address_string, config={}) {
    if (globalConfig) this.config = Config(globalConfig);
    this.config = Config(config, this.config);

    if (typeof email_address_string !== 'string'
        || email_address_string instanceof String) {
      email_address_string = "";
    }
    this.string = email_address_string;
    var at = this.string.lastIndexOf("@");
    if (at === -1) { // No @host
      this.local_string = this.string;
      this.host_string = "";
      // Or resolve.conf search parameter?
    } else if (at === 0) { // No local
      this.local_string = "";
      this.host_string = this.string.substr(1);
    } else {
      this.local_string = this.string.substr(0, at);
      this.host_string = this.string.substr(at + 1);
    }
    // Set host first as it updates config for local part
    this.host = new Host(this.host_string, this.config);
    this.local = new Local(this.local_string, this.config);
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
  static isValid(email_address_string, config={}) {
    return (new EmailAddress(email_address_string, config)).isValid();
  }

  // EmailAddress.config({setting:value,...});
  static config(object) {
    if (!globalConfig) globalConfig = {};
    globalConfig = Object.assign(globalConfig, object);
  }
}

module.exports = EmailAddress;
