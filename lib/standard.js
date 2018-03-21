// Standard Email Address format, follows RFC Specification
// Used as a base class for other formats.

class StandardEmailAddress {
  constructor(emailAddress) {
    this.emailAddress = emailAddress;
    this.local = emailAddress.local;
    this.host = emailAddress.host;
  }

  setError(errorCode) {
    this.valid = false;
    this.errorCode = errorCode;
    return false;
  }

  toString() {
    this.local.toString();
  }

  toString() {
    this.localString() + "@" + this.host.toString();
  }

  isValid() {
    return this.isValidRFC();
  }

  error() {
    return this.isValid() ? null : this.errorCode;
  }

  isValidRFC() {
    this.errorCode = undefined;
    if ( ! this.local.isValid()) {
      return this.setError(this.local.errorCode);
    }
    if ( ! this.host.isValid()) {
      return this.setError(this.host.errorCode);
    }
    return true;
  }

}

module.exports = StandardEmailAddress;
