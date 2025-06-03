#!/usr/bin/env node

/**
 * Convert access-control.yml naar environment variables voor Edge middleware
 * Dit draait tijdens build time
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

try {
  // Lees ACL
  const aclPath = path.join(process.cwd(), 'sensitive', 'access-control.yml');
  const aclData = yaml.load(fs.readFileSync(aclPath, 'utf8'));
  
  // Extract users per sectie
  const financeUsers = [];
  const operationUsers = [];
  
  Object.entries(aclData.users).forEach(([username, user]) => {
    if (user.sections?.includes('finance')) {
      financeUsers.push(username);
    }
    if (user.sections?.includes('operation')) {
      operationUsers.push(username);
    }
  });
  
  // Output als environment variables
  console.log(`FINANCE_USERS="${financeUsers.join(',')}"`);
  console.log(`OPERATION_USERS="${operationUsers.join(',')}"`);
  
  // Voor Vercel deployment
  if (process.argv.includes('--vercel')) {
    fs.writeFileSync('.env.acl', `FINANCE_USERS=${financeUsers.join(',')}\nOPERATION_USERS=${operationUsers.join(',')}\n`);
    console.log('✅ ACL environment variables geschreven naar .env.acl');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}