//var argv = require('yargs').argv;
var EmailAddress = require('./index');
var e = new EmailAddress("allen@example.com");
console.log(e.isValid());
process.exit(0);
