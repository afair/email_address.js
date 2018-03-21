var should = require('chai').should(),
    email_address = require('../index'),
    local = require('../lib/local'),
    host = require('../lib/host');

describe('#isValid', function() {
  it('accepts good', function() {
    em = new email_address('allen@example.com');
    em.error().should.equal("hostNoMail");
    em = new email_address('allen+tag@example.com');
    em.isValid().should.equal(true);
  });
  it('rejects bad', function() {
    em = new email_address('.allen@example.com');
    em.isValid().should.equal(false);
    em = new email_address('allen@oops@example.com');
    em.isValid().should.equal(false);
  });
});
