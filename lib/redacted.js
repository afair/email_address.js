var StandardEmailAddress = require('./standard');
var sha1 = require('sha1');
var md5 = require('md5');

// Redacted Adress Form: "{digest}@hostname"
class RedactedEmailAddress extends StandardEmailAddress {
  constructor(emailAddress, config={}) {
    super(emailAddress, config);
    this.parse();
    this.isValid();
  }

  parse() {
  }

  localString() {
    let ea = this.local.mailbox.toLowerCase() + "@" + this.hostString();
    if (this.config.mailboxRedact) {
      var loc = this.config.mailboxRedact(ea);
    } else if (this.config.redactMethod === 'sha1') {
      var loc = "{" + sha1(ea) + "}"
    } else {
      var loc = "{" + md5(ea) + "}"
    }
    return loc;
  }

  hostString() {
    return this.host.canonicalHostname;
  }

  isValid() {
    // {DIGEST}@hostname
    //if (this.config.localEncoding === 'unicode') {
    //  if (! this.localString().match(localRegexUTF8)) {
    //    return this.setError("localInvalid", "Conv");
    //  }
    //} else {
    //  if (! this.localString().match(localRegex)) {
    //    return this.setError("localInvalid", "Conv");
    //  }
    //}
    // ensure no comments passed
    return this.valid;
  }

}

module.exports = RedactedEmailAddress;
