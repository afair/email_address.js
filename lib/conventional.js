var StandardEmailAddress = require('./standard');
var localRegex = /^[\a-z\d]+([\.\-\+\'_][\a-z\d]+)*$/i;

class ConventionalEmailAddress extends StandardEmailAddress {

  toString() {
    this.local.mailbox + "@" + this.host.hostname;
  }

  isValid() {
    if ( ! super.isValid()) return false;
    if (! localRegex.test(this.str)) {
      return this.setError("localInvalid");
    }
    return true;
  }

}

module.exports = ConventionalEmailAddress;
