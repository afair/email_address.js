// Standard Email Address format, follows RFC Specification
// Used as a base class for other formats.

class StandardEmailAddress {
  constructor(emailAddress, config={}) {
    this.emailAddress = emailAddress;
    this.config       = config;
    this.local        = emailAddress.local;
    this.host         = emailAddress.host;
    this.errorCode    = null;
    this.valid        = true;
    if (this.local.errorCode) this.setError(this.local.errorCode);
    if (this.host.errorCode)  this.setError(this.host.errorCode);
    this.parseRFC();
  }

  localString() {
    return this.local.original;
  }

  hostString() {
    return this.host.original;
  }

  toString() {
    return this.localString() + "@" + this.hostString();
  }

  isValid() {
    return this.valid
  }

  error() {
    return this.valid ? null : this.errorCode;
  }

  setError(errorCode, hint) {
    console.log('ERR', this.original, errorCode, hint);
    this.valid = false;
    this.errorCode = errorCode;
    return false;
  }

  // Alternate parsing by dotted-tokens by RFC5322
  // local        ::= (comment) mailbox (comment)  NOTE: 64 chars max
  // mailbox      ::= token(.token)*
  // tokenchars   ::= AZ az 09 ! # $ % & ' * + - / = ? ^ _ ` { | } ~ + U+007F..
  // token        ::= " tokenchars space ( ) , : l < > @ [ \\ ] \" "
  parseRFC() {
    let tokenMatch = /^([\w\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\(\)]+)(.*)/i;
    let strMatch   = /^(\"(?:\\[\"\\]|[\x20-\x21\x23-\x2F\x3A-\x40\x5B\x5D-\x60\x7B-\x7E\p{L}\p{N}])+\")(.*)/i;
    let mailbox = this.local.mailbox;
    let m = this.local.mailbox;
    let at = 0;
    while (m.length > 0) {
      if (m[0] === ".") { // can't start or end mailbox with dot
        if (m === mailbox || m.length === 1) {
          return this.setError("localInvalidRFC");
        }
        at += 1;
        m = m.substr(1);
      }
      else if (m[0] === '"') {
        let token = m.match(strMatch); //=> [_, token, rest]
        if (token) {
          at += token[1].length;
          m = token[2];
        } else {
          return this.setError("localInvalidRFC");
        }
      }
      else { // a token of tokenchars
        let token = m.match(tokenMatch); //=> [_, token, rest]
        if (token) {
          m = token[2];
          at += token[1].length;
        } else {
          return this.setError("localInvalidRFC");
        }
      }
    }
    //console.log("RFC VALIDATION GOOD", mailbox);
    return true; // If we made it, we are valid!
  }

}

module.exports = StandardEmailAddress;
