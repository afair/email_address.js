#!/usr/bin/env node
/*******************************************************************************
 * Command:    emailaddress <address>
 * NPM Module: https://www.npmjs.com/package/email_address
 * Author:     Allen Fair - https://github.com/afair
 * License:    MIT - https://opensource.org/licenses/MIT
 ******************************************************************************/
var argv = require('argv');
var EmailAddress = require('../index');

async function emailAddressCommand(address) {
  let e = new EmailAddress(address);
  let p = e.isValid(true)
  console.log("Email Address:        ", address);
  console.log("      Canonical:      ", e.canonical());
  console.log("      Redacted:       ", e.redacted());
  console.log("      MD5:            ", e.digest('md5'));
  console.log("      SHA1:           ", e.digest('sha1'));
  console.log("Local:                ", e.local.mailbox);
  console.log("      Account:        ", e.local.account);
  console.log("      Tag:            ", e.local.tag);
  console.log("Host:                 ", e.host.hostname);
  console.log("      Canonical:      ", e.host.canonicalHostname);
  console.log("      IP:             ", e.host.family, e.host.ip);
  console.log("      Provider:       ", e.host.provider());
  console.log("      Subdomains:     ", e.host.sudomains);
  console.log("      Registration:   ", e.host.registrationName);
  console.log("      Domain Name:    ", e.host.domainName);
  console.log("      TLD2:           ", e.host.tld2);
  console.log("      TLD:            ", e.host.tld);
  
  console.log("Syntax:               ", e.isValid() ? "valid" : e.errorCode);
  await p
  await e.hostMx.exchangerIps()
  console.log("Data:\n", e.data());
  
  // Sadly, this may never finish before the script ends. FYou Node
  if (e.isValid()) {
    e.isValid((ok, err)=>{
      console.log("      DNS:            ", ok ? "valid" : err);
      e.hostMx.exchangers((mxers)=>{
        console.log("      Exchangeers:", mxers);
        process.exit(ok ? 0 : 1);
      });
    });
  } else {
    process.exit(1);
  }
  process.exit(0);

}
var args = argv.run();
var address = args.targets[0];
emailAddressCommand(address)
  