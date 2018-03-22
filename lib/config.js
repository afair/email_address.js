var defaults = {

  format:            "conventional", // :conventional, :relaxed, :redacted, :standard, Proc
  dns:               "mx",  // mx, a, no
  sha1Secret:        "",
  mungeString:       "*****",

  localLowercase:    true,
  localFix:          false,
  localEncoding:     "ascii", // :ascii, :unicode, smtputf8?
  localParse:        null,   // nil, Proc
  localSize:         [1,64],
  tagSeparator:      '+', // nil, character
  mailboxSize:       [1,64], // without tag
  mailboxCanonical:  null, // nil,  Proc
  mailboxValidator:  null, // nil,  Proc

  hostEncoding:      "punycode",  // :unicode,
  hostValidation:    "mx", //  || :a || :connect || :syntax,
  hostSize:          [1,253],
  hostAllowIp:       false,
  hostRemoveSpaces:  false,
  hostLocal:         false,

  addressValidation: "parts", // :parts, :smtp, Proc
  addressSize:       [3,254],
  addressFqdnDomain: null, // Fully Qualified Domain Name = [host].[domain.tld]

  providers: {
    aol: {
      hostMatch:       ["aol.","compuserve.","netscape.","aim.","cs."],
    },
    google: {
      hostMatch:       ["gmail.com","googlemail.com"],
      exchangerMatch:  ["google.com","googlemail.com"],
      localSize:       [5,64],
      localPrivateSize: [1,64], // When hostname not in hostMatch (private label)
      mailboxCanonical: function(m) { m.gsub('.','') },
    },
    msn: {
      hostMatch:       ["msn.","hotmail.","outlook.","live."],
      mailboxValidator: function(m,t) { m =~ /\A[a-z][\-\w]*(?:\.[\-\w]+)*\z/i },
    },
    yahoo: {
      hostMatch:       ["yahoo.","ymail.","rocketmail."],
      exchangerMatch:  ["yahoodns","yahoo-inc"],
    },
  },
  errors: {
    invalidAddress:    "Invalid Email Address",
    invalidMailbox:    "Invalid Recipient/Mailbox",
    invalidHost:       "Invalid Host/Domain Name",
    exceedsSize:       "Address too long",
    notAllowed:        "Address is not allowed",
    incompleteDomain:  "Domain name is incomplete",
  }

};

function Config(override={}, base) {
  if (base===undefined) {
    return Object.assign(defaults, override);
  } else {
    return Object.assign(base, override);
  }
}

module.exports = Config;
