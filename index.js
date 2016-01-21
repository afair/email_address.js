/* Module: email_address
 *
 */

module.exports = {
  isValid: function(address) {
    var lh = address.split("@");
    var validLocal = /^[\a-z\d]+([\.\-\+\'_][\a-z\d]+)*$/i.test(lh[0]);
    var validHost  = /^[\a-z\d]+(?:(?:\-{1,2}|\.)[\a-z\d]+)*$/i.test(lh[1]);
    return lh.length==2 && validLocal && validHost ? true : false;
  },

  isCompliant: function(address) {
    return true;
  },
  normal: function(address) {
    return address;
  },
  redact: function(address) {
    return address;
  },
  munge: function(address) {
    return address;
  },
  reference: function(address) {
    return address;
  },
  matches: function(address) {
    return null;
  },
  error: function(address) {
    return null;
  },
};
