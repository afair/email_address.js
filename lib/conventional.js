var StandardEmailAddress = require('./standard');
var localRegex = /^[\a-z\d]+([\.\-\+\'_][\a-z\d]+)*$/i;
var localRegexUTF8 = /^[\p{L}\p{N}]+([\.\-\+\'_][\p{L}\p{N}]+)*$/i;

class ConventionalEmailAddress extends StandardEmailAddress {
  constructor(emailAddress, config={}) {
    super(emailAddress, config);
    this.parse();
    this.isValid();
  }

  parse() {
    if (this.config.localLowercase) {
      this.local.lowerCase();
    }
    if (this.config.tagSeparator) {
      this.local.splitTag();
    }
  }

  localString() {
    return this.local.mailbox;
  }

  hostString() {
    return this.host.hostname;
  }

  isValid() {
    if (this.config.localEncoding === 'unicode') {
      if (! this.localString().match(localRegexUTF8)) {
        return this.setError("localInvalid", "Conv");
      }
    } else {
      if (! this.localString().match(localRegex)) {
        return this.setError("localInvalid", "Conv");
      }
    }
    // ensure no comments passed
    return this.valid;
  }

}

module.exports = ConventionalEmailAddress;
