var should = require('chai').should(),
    email_address = require('../index'),
    isValid = email_address.isValid,
    isCompliant = email_address;

describe('#isValid', function() {
  it('accepts good', function() {
    isValid('allen@example.com').should.equal(true);
    isValid('allen+tag@example.com').should.equal(true);
  });
  it('rejects bad', function() {
    isValid('.allen@example.com').should.equal(false);
    isValid('allen.at.example.com').should.equal(false);
  });
});
