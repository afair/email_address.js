/* Module: email_address
 *
 */

module.exports = {
  isValid: function(address) {
    return true;
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
