# email_address - NPM Module

Email Address Validation and Inspection for Javascript and Node.js.
It implements different forms of email addresses: 

* Standard - RFC Compliant, what you think you want, but you don't.
* Conventional - conforms to user account email address, what you
  probably intend (Default).
* Others! See below.

## Quick Start

First, install the module into your project via npm:

    npm install email_address --save

Require the library in the file your are using it.

    const EmailAddress = require("email_address");

You can use the simple form to check validity:

    EmailAddress.isValid("allen@example.com"); //=> true

Note that by default, this validates to a "conventional" email address
syntax as well as the RFC specification. User email accounts,
including role accounts, and any address that generally comes from a
real person to a real person uses an address of this form.

For application-level addresses such as bounce addresses (return paths)
and emails generally sent from or to a program, you may want to validate
per the RFC "standard."

    EmailAddress.isValid("BOUNCE.!#$%&*/^."@ "@example.com", // Bad Quoting for easy reading
      format:"standard"); //=> true

If you are using Node, you can also have it check for a valid
DNS hostname, and that it is configured for email via MX records.
DNS operations are asynchronous, so you'll have to use a callback.
How fun!

    em = new EmailAddress('allen@example.com');
    em.isValid( (ok, err) =>{
      if (!ok) throw err;
    });

This throws a "hostNoMail" error as the example.com domain does not
have any MX records and accepts no email.

You may also instantiate an Email Address object and inspect it. Generally, these
objects are not mutable; it will transform an address into the requested type,
usually by lower casing the letters. The data() method returns the internal
parsed fields in an object.

    em = new EmailAddress('ALLEn+github@example.com');
    em.canonical() //=> allen@example.com
    em.digest()    //=> 301b2924ff92e39a727c85f8c72c5720
    em.data()      //=>
     { original: 'ALLEn+github@example.com',
       format: 'conventional',
       address: 'allen+github@example.com',
       canonical: 'allen@example.com',
       redacted: '{90949f4bbb9bc99a9fa6cea3b40e22f399f58d66}@example.com',
       md5: '301b2924ff92e39a727c85f8c72c5720',
       sha1: '90949f4bbb9bc99a9fa6cea3b40e22f399f58d66',
       local:
        { local: 'ALLEn+github',
          mailbox: 'allen+github',
          account: 'allen',
          tag: 'github',
          valid: true,
          errorCode: null },
       host:
        { name: 'example.com',
          canonicalName: 'example.com',
          ip: [ null, undefined ],
          provider: 'example.com',
          subdomains: undefined,
          registrationName: 'example',
          domainName: 'example.com',
          tld2: 'com',
          tld: 'com',
          valid: true,
          errorCode: null },
       valid: true,
       errorCode: null }

### Command Line Interface

An `emailaddress` CLI command is provided for manually checking addresses.

    $ emailaddress allen@example.com

    Email Address:         allen@example.com
          Canonical:       allen@example.com
          Redacted:        {f24c2fe1b6585a091f912fe475fa233f01290f43}@example.com
          MD5:             6586f3506d674a27413c86c501817e76
          SHA1:            f24c2fe1b6585a091f912fe475fa233f01290f43
    Local:                 allen
          Account:         allen
          Tag:             null
    Host:                  example.com
          Canonical:       example.com
          IP:              null undefined
          Provider:        example.com
          Subdomains:      undefined
          Registration:    example
          Domain Name:     example.com
          TLD2:            com
          TLD:             com
    Syntax:                valid

It returns 0 to the operating system on valid, 1 on error, like most *NIX systems.
It does not verify the DNS yet because the script seems to end before the lookup completes.
Anyone?

## Email Address Forms

This library derives from my philosophy of email addresses: validating to the RFC is
almost as good as not validating at all. It allows a lot of things that we don't put in modern
user email addresses, such as:

* Case Sensitivity. Standard addresses are mixed case, conventional are lower-cased.
* Allows a lot of special characters.
* Allows spaces and @ symbols, when combined with double-quoted sub-strings
* Has optional comments at the start and end of the local and host parts of the address.
* Can use IPv4 and IPv6 addresses instead of a domain name.

The solution: different email address "forms" that allow us to sanely validate and handle
email addresses in different contexts.

### Standard

Addresses that meet or are validated to the RFC specification are in *"standard"* form.
This does not mean the address is a valid user format, only that it conforms to the RFC
standards for email addresses.

### Conventional

The most used context for programs is the user email address, which is referred to as
the *"conventional"* form.
For the largeset email domains, we can finely tune our validation to their formats and
size limits.

Some ISP/ESP's allow for email address tagging, where a symbol
(usually the "+" plus symbol) separates the user account from a tag which is used to track
and filter email.

    allen+github@example.com

Note that an address formatted for a given email host does not guarantee that the address
exists and can accept email. You can only determine that by trying to send an email message.

### Canonical

Canonical addresses attempt to unique-ify the address. This is useful when a user uses
one form of an address to sign up (like specifying a tag), and another form (without) to
later sign in.

Google's gmail service uses dots in email addresses to separate names, but they are not
significant to the account name, so can be removed for a canonical form.

    Given:     Firstname.Last.name+tagdata@gmail.com
    Canonical: firstnamelastname@gmail.com

### Digest

Digests, usually MD5 of the (lower-cased) address are used to specify an address (potentially) known
to two parties, without revealing the address in the case where it was not known.
Gravatar uses this technique to serve a picture for an address given only by the MD5.

Email Addresses should be considered personal information, and should never be shared
openly without the user's consent. The Digest is the simplest way to do this.

    Given:  allen@example.com
    Digest: 6586f3506d674a27413c86c501817e76

### Redacted

As mentioned previously, a user's email address should be considered private information
and should be treated as such. Often, a user wants to remove their address from your database,
but you need to retain history and records that the user should never be emailed again.

Additionally, you can consider the email address with the same secretiveness as a social
security number or other identification-theft information.  Consider that you should never
store the actual email address on your database. Perhaps the actual address can be vaulted
in a secure system much like credit card information. In that case, you should refer to the
account my its digest, or another identifier that ties the digest to the account.

Sometimes, you want to retain a redacted email address in an email address field, so this form
allows you to write the redacted email address as a valid address. Since the domain name is public,
we can keep this to prevent collisions. Redacted addresses are of the form:

    {DIGEST......}@yahoo.com
    DIGEST=yahoo.com@redacted.emailaddress.cc
    DIGEST@yahoo.com.redacted

This library uses the first format. (This may still change.)

### Other forms (Not Implemented)

* munged
* srs/prvs/batv
* verp
