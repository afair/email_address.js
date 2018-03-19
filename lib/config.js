var defaults = {

  dns_lookup:         "mx",  // :mx, :a, :off
  sha1_secret:        "",
  munge_string:       "*****",

  local_lowercase:    true,
  local_fix:          false,
  local_encoding:     "ascii", // :ascii, :unicode,
  local_parse:        undefined,   // nil, Proc
  local_format:       "conventional", // :conventional, :relaxed, :redacted, :standard, Proc
  local_size:         [1,64],
  tag_separator:      '+', // nil, character
  mailbox_size:       [1,64], // without tag
  mailbox_canonical:  undefined, // nil,  Proc
  mailbox_validator:  undefined, // nil,  Proc

  host_encoding:      "punycode",  // :unicode,
  host_validation:    "mx", //  || :a || :connect || :syntax,
  host_size:          [1,253],
  host_allow_ip:      false,
  host_remove_spaces: false,
  host_local:         false,

  address_validation: "parts", // :parts, :smtp, Proc
  address_size:       [3,254],
  address_fqdn_domain: undefined, // Fully Qualified Domain Name = [host].[domain.tld]

  providers: {
    aol: {
      host_match:       ["aol.","compuserve.","netscape.","aim.","cs."],
    },
    google: {
      host_match:       ["gmail.com","googlemail.com"],
      exchanger_match:  ["google.com","googlemail.com"],
      local_size:       [5,64],
      local_private_size: [1,64], // When hostname not in host_match (private label)
      mailbox_canonical: function(m) { m.gsub('.','') },
    },
    msn: {
      host_match:       ["msn.","hotmail.","outlook.","live."],
      mailbox_validator: function(m,t) { m =~ /\A[a-z][\-\w]*(?:\.[\-\w]+)*\z/i },
    },
      yahoo: {
        host_match:       ["yahoo.","ymail.","rocketmail."],
        exchanger_match:  ["yahoodns","yahoo-inc"],
      },
  },
  errors: {
    invalid_address:    "Invalid Email Address",
    invalid_mailbox:    "Invalid Recipient/Mailbox",
    invalid_host:       "Invalid Host/Domain Name",
    exceeds_size:       "Address too long",
    not_allowed:        "Address is not allowed",
    incomplete_domain:  "Domain name is incomplete",
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
