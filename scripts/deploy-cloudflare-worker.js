#!/usr/bin/env node

/**
 * Deploy Cloudflare Worker met ACL uit sensitive/access-control.yml
 * 
 * Usage:
 *   node scripts/deploy-cloudflare-worker.js [environment]
 * 
 * Environments:
 *   production (default) - uses access-control.yml
 *   staging - uses access-control-staging.yml
 * 
 * Dit script:
 * 1. Leest de encrypted access-control.yml (alleen met git-crypt unlocked)
 * 2. Injecteert de ACL in de Worker code
 * 3. Deployed naar Cloudflare
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

// Bepaal environment
const environment = process.argv[2] || 'production';
const validEnvironments = ['production', 'staging'];

if (!validEnvironments.includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.error(`Valid environments: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

console.log(`🌍 Deploying for environment: ${environment}`);

// Bepaal ACL file en worker naam
const aclFileName = environment === 'production' 
  ? 'access-control.yml' 
  : `access-control-${environment}.yml`;
const workerName = environment === 'production'
  ? 'kroescontrol-docs-auth'
  : `kroescontrol-docs-auth-${environment}`;

// Check of git-crypt is unlocked
try {
  const gitCryptStatus = execSync(`git-crypt status sensitive/${aclFileName}`, { encoding: 'utf8' });
  if (gitCryptStatus.includes('not decrypted')) {
    console.error(`❌ Error: sensitive/${aclFileName} is encrypted. Run "git-crypt unlock" first.`);
    process.exit(1);
  }
} catch (e) {
  console.error('❌ Error checking git-crypt status:', e.message);
  process.exit(1);
}

// Lees ACL uit encrypted file
let aclData;
try {
  const aclPath = path.join(process.cwd(), 'sensitive', aclFileName);
  const aclContent = fs.readFileSync(aclPath, 'utf8');
  aclData = yaml.load(aclContent);
  console.log(`✅ ACL loaded from sensitive/${aclFileName}`);
} catch (e) {
  console.error('❌ Error reading ACL:', e.message);
  process.exit(1);
}

// Converteer YAML ACL naar JavaScript object
const aclObject = {};
Object.entries(aclData.users).forEach(([username, user]) => {
  aclObject[username] = user.sections || [];
});

console.log(`📋 ACL contains ${Object.keys(aclObject).length} users`);

// Lees Worker template
let workerTemplate;
try {
  const templatePath = path.join(process.cwd(), 'cloudflare', 'auth-worker-template.js');
  workerTemplate = fs.readFileSync(templatePath, 'utf8');
} catch (e) {
  console.error('❌ Error reading worker template:', e.message);
  process.exit(1);
}

// Inject ACL in Worker code
const aclString = JSON.stringify(aclObject, null, 2);
const workerCode = workerTemplate.replace(
  '// {{ACL_PLACEHOLDER}}',
  `const ACL = ${aclString};`
);

// Schrijf tijdelijke Worker file
const tempWorkerPath = path.join(process.cwd(), '.tmp-worker-deploy.js');
fs.writeFileSync(tempWorkerPath, workerCode);
console.log('✅ Worker code generated with ACL');

// Check of Wrangler is geïnstalleerd
try {
  execSync('npx wrangler --version', { stdio: 'ignore' });
} catch (e) {
  console.log('📦 Installing Wrangler CLI...');
  execSync('npm install -g wrangler', { stdio: 'inherit' });
}

// Deploy met Wrangler
console.log('🚀 Deploying to Cloudflare Workers...');
try {
  // Eerst login check
  try {
    execSync('npx wrangler whoami', { stdio: 'ignore' });
  } catch (e) {
    console.log('🔐 Please login to Cloudflare:');
    execSync('npx wrangler login', { stdio: 'inherit' });
  }

  // Deploy worker
  execSync(`npx wrangler deploy ${tempWorkerPath} --name ${workerName} --compatibility-date 2025-06-03`, {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    }
  });

  console.log('✅ Worker deployed successfully!');
} catch (e) {
  console.error('❌ Deployment failed:', e.message);
  process.exit(1);
} finally {
  // Cleanup
  if (fs.existsSync(tempWorkerPath)) {
    fs.unlinkSync(tempWorkerPath);
  }
}

console.log(`
📌 Next steps for ${environment}:
1. Set environment variables in Cloudflare Dashboard for ${workerName}:
   - GITHUB_CLIENT_ID
   - GITHUB_CLIENT_SECRET
   - JWT_SECRET
   - BACKEND_URL = ${environment === 'production' 
       ? 'https://kroescontrol-docs.vercel.app' 
       : 'https://kroescontrol-docs-staging.vercel.app'}

2. Configure custom domain:
   ${environment === 'production' 
     ? '- Add "docs.kroescontrol.nl" in Worker settings' 
     : '- Add "serge.docs.kroescontrol.nl" (or other staging domains) in Worker settings'}

3. Update GitHub OAuth App callback URL:
   ${environment === 'production'
     ? '- https://docs.kroescontrol.nl/api/auth/callback'
     : '- https://serge.docs.kroescontrol.nl/api/auth/callback'}
`);