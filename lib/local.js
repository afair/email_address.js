class Local {
  constructor(localString, config={}) {
    this.original = localString;
    this.config = config;
    this.parse();
  }

  get error() { this.errorCode; }
  set error(errorCode) {
    this.valid = false;
    this.errorCode = errorCode;
    return false;
  }

  parse() {
    this.mailbox  = this.original;
    this.tag = undefined;

    var leadingComment  = /^(\(\.*?\))(.*)$/;
    var match = leadingComment.exec(this.mailbox);
    if (match !== null) {
      this.leadingComment = match[1];
      this.mailbox       = match[2];
    }

    var trailingComment = /^(.*)(\(\.*?\))$/;
    match = trailingComment.exec(this.mailbox);
    if (match !== null) {
      this.trailingComment= match[2];
      this.mailbox       = match[1];
    }

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

  toString(format) {
    if (!format) format = this.config.localFormat;
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
    this.errorCode = undefined;
    var str = this.toString();
    if (str.length < this.config.localSize[0]) return this.error("localTooShort");
    if (str.length > this.config.localSize[1]) return this.error("localTooLong");
    var convRegex = /^[\a-z\d]+([\.\-\+\'_][\a-z\d]+)*$/i;
    if (! convRegex.test(this.str)) return this.error("localInvalid");
    return this.valid = true;
  }

}

module.exports = Local;
