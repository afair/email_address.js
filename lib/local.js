class Local {
  constructor(local_string, config={}) {
    this.original = local_string;
    if (config.local_lowercase) {
      this.local_string = local_string.toLowerCase();
    } else {
      this.local_string = local_string;
    }
    this.config = config;
  }

  isValid() {
    this.errorCode = undefined;
    this.valid = /^[\a-z\d]+([\.\-\+\'_][\a-z\d]+)*$/i.test(this.local_string);
    return this.valid
  }
}

module.exports = Local;
