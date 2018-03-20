var StandardEmailAddress = require('./standard');
var localRegex = /^[\a-z\d]+([\.\-\+\'_][\a-z\d]+)*$/i;

class ConventionalEmailAddress extends StandardEmailAddress {

  localString() {
    this.local.mailbox;
  }

  isValid() {
    if ( ! this.validParts()) return false;
    if (! localRegex.test(this.str)) {
      return this.setError("localInvalid");
    }
    return true;
  }

}

module.exports = ConventionalEmailAddress;
