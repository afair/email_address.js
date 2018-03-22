var should = require('chai').should(),
    email_address = require('../index'),
    local = require('../lib/local'),
    host = require('../lib/host');

describe('#isValid', function() {
  it('accepts good', function() {
    var em = new email_address('allen@example.com');
    em.isValid().should.equal(true);
    em = new email_address('allenx+tag@gmail.com');
    em.isValid().should.equal(true);
  });

  it('rejects bad', function() {
    em = new email_address('.allen@example.com');
    em.isValid().should.equal(false);
    em = new email_address('allen@oops@example.com');
    em.isValid().should.equal(false);
  });
});
