// Standard Email Address format, follows RFC Specification
// Used as a base class for other formats.

class StandardEmailAddress {
  construct(emailAddress) {
    this.emailAddress = emailAddress;
    this.local = emailAddress.local;
    this.host = emailAddress.host;
  }

  get error() { this.errorCode; }

  setError(errorCode) {
    this.valid = false;
    this.errorCode = errorCode;
    return false;
  }

  localString() {
    this.local.toString();
  }

  toString() {
    this.localString() + "@" + this.host.toString();
  }

  isValid() {
    this.errorCode = undefined;
    if ( ! this.local.isValid()) {
      return this.setError(this.local.error);
    }
    if ( ! this.host.isValid()) {
      return this.setError(this.host.error);
    }
    if (! localRegex.test(this.str)) {
      return this.setError("localInvalid");
    }
    return true;
  }

}

module.exports = ConventionalEmailAddress;
