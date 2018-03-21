class Local {
  constructor(localString, config={}) {
    this.original  = localString;
    this.config    = config;
    this.valid     = true;
    this.errorCode = null;
    this.parse();
  }

  /****************************************************************************
  /* Operations and Validations
  /****************************************************************************/

  toString(format) {
    if (!format) format = this.config.format;
    if (format === 'conventional') {
      return this.mailbox;
    } else if (format === 'canonical') {
      return this.account;
    } else if (format === 'original') {
      return this.original;
    } else if (format === 'standard') {
      return this.mailbox;
    } else if (format === 'redacted') {
      return this.mailbox.substr(0,2) + this.config.mungeString;
    }
  }

  isValid() {
    this.errorCode = null;
    var str = this.toString();
    if (str.length < this.config.localSize[0]) return this.setError("localTooShort");
    if (str.length > this.config.localSize[1]) return this.setError("localTooLong");
    var convRegex = /^[\a-z\d]+([\.\-\+\'_][\a-z\d]+)*$/i;
    if (! str.match(convRegex)) return this.setError("localInvalid");
    return this.valid = true;
  }

  setError(errorCode) {
    this.valid = false;
    this.errorCode = errorCode;
    return false;
  }

  /****************************************************************************
  /* Operations and Validations
  /****************************************************************************/

  // Parses the original local part (left of @). Sets:
  // * leadingComment    - Includes parens
  // * mailbox           - account+tag, no comments
  // * account           - mailbox without tag
  // * tag               - after tag separator (+)
  // * trailingComment   - Includes parens
  parse() {
    this.mailbox  = this.original;
    this.tag = null;
    this.parseComments();

    if (this.config.localLowercase) {
      this.mailbox = this.mailbox.toLowerCase();
    }

    if (this.config.tagSeparator) {
      var mt = this.mailbox.split(this.config.tagSeparator);
      if (mt.length > 1) {
        this.account = mt[0];
        this.tag = mt[1];
      } else {
        this.account = this.mailbox;
      }
    }
  }

  parseComments() {
    var leadingComment = /^((\(.*?)(?:(?<!\\))\))(.*)$/;
    var match = leadingComment.exec(this.mailbox);
    if (match !== null) {
      this.leadingComment = match[1];
      this.mailbox       = match[2];
    }

    var trailingComment = /^(.*)(\(\.*?(?:(?<!\\))\))$/;
    match = trailingComment.exec(this.mailbox);
    if (match !== null) {
      this.trailingComment= match[2];
      this.mailbox       = match[1];
    }
  }

  // Alternate parsing by dotted-tokens by RFC5322
  // local        ::= (comment) mailbox (comment)  NOTE: 64 chars max
  // mailbox      ::= token(.token)*
  // tokenchars   ::= AZ az 09 ! # $ % & ' * + - / = ? ^ _ ` { | } ~ + U+007F..
  // token        ::= " tokenchars space ( ) , : l < > @ [ \\ ] \" "
  parseRFC() {
    let tokenMatch = /^([\w\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\(\)]+)(.*)/i;
    let strMatch   = /^(\"(?:\\[\"\\]|[\x20-\x21\x23-\x2F\x3A-\x40\x5B\x5D-\x60\x7B-\x7E\p{L}\p{N}])+\")(.*)/i;
    this.mailbox  = this.original;
    this.tag = this.account = null;
    this.parseComments();
    let m = this.mailbox;
    let at = 0;
    let tagAt = null;
    let tagSep = this.config.tagSeparator;
    while (m.length > 0) {
      if (m[0] === ".") { // can't start or end mailbox with dot
        if (m === this.mailbox || m.length === 1) {
          return setError("localInvalid");
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
          return setError("localInvalid");
        }
      }
      else { // a token of tokenchars
        let token = m.match(tokenMatch); //=> [_, token, rest]
        if (token) {
          at += token[1].length;
          m = token[2];
          if (!tagAt && tagSep && token[1].indexOf(tagSep)>=1) {
            tagAt = at + token[1].indexOf(tagSep);
            this.mailbox = m.substr(0, tagAt - 1);
            this.tag     = m.substr(tagAt + 1);
          }
        } else {
          return setError("localInvalid");
        }
      }
    }
    return true; // If we made it, we are valid!
  }

}

module.exports = Local;
