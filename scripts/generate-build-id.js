#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get git commit SHA (short version)
let gitCommit = 'unknown';
try {
  gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch (error) {
  console.warn('Warning: Could not get git commit SHA');
}

// Get current date and time
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

// Determine environment
let environment = 'dev'; // default for local development
if (process.env.VERCEL_ENV === 'production') {
  environment = 'prod';
} else if (process.env.VERCEL_ENV === 'preview') {
  environment = 'preview';
} else if (process.env.CI) {
  environment = 'ci';
}

// Format: gitsha-YYYYMMDD-HHMM-env
const buildId = `${gitCommit}-${year}${month}${day}-${hours}${minutes}-${environment}`;
const buildTime = now.toISOString();

// Get git branch
let gitBranch = 'unknown';
try {
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
} catch (error) {
  console.warn('Warning: Could not get git branch');
}

// Write to .env.local for local development
const envContent = `# Auto-generated build information
NEXT_PUBLIC_BUILD_ID=${buildId}
NEXT_PUBLIC_BUILD_TIME=${buildTime}
NEXT_PUBLIC_GIT_COMMIT=${gitCommit}
NEXT_PUBLIC_GIT_BRANCH=${gitBranch}
NEXT_PUBLIC_BUILD_ENV=${environment}
`;

// Determine project root (where package.json is located)
const projectRoot = process.cwd();
const envPath = path.join(projectRoot, '.env.local');

// Read existing .env.local if it exists
let existingEnv = '';
if (fs.existsSync(envPath)) {
  existingEnv = fs.readFileSync(envPath, 'utf-8');
  
  // Remove existing build-related variables
  const lines = existingEnv.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith('NEXT_PUBLIC_BUILD_ID=') &&
           !trimmed.startsWith('NEXT_PUBLIC_BUILD_TIME=') &&
           !trimmed.startsWith('NEXT_PUBLIC_GIT_COMMIT=') &&
           !trimmed.startsWith('NEXT_PUBLIC_GIT_BRANCH=') &&
           !trimmed.startsWith('NEXT_PUBLIC_BUILD_ENV=') &&
           !trimmed.startsWith('# Auto-generated build information');
  });
  existingEnv = filteredLines.join('\n').trim();
}

// Combine existing env with new build info
const finalContent = existingEnv ? 
  `${existingEnv}\n\n${envContent}` : 
  envContent;

fs.writeFileSync(envPath, finalContent);

// Bepaal service naam op basis van package.json
const packageJsonPath = path.join(projectRoot, 'package.json');
let serviceName = 'unknown';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  serviceName = packageJson.name || 'unknown';
}

// Creëer build.json in /public/api/
const buildJson = {
  buildId,
  buildTime,
  gitCommit,
  gitBranch,
  environment,
  nodeVersion: process.version,
  timestamp: buildTime,
  service: serviceName
};

const apiDir = path.join(projectRoot, 'public', 'api');
const buildJsonPath = path.join(apiDir, 'build.json');

// Maak directory aan als het niet bestaat
fs.mkdirSync(apiDir, { recursive: true });

// Schrijf build.json
fs.writeFileSync(buildJsonPath, JSON.stringify(buildJson, null, 2));

console.log(`Build ID generated: ${buildId}`);
console.log(`Environment: ${environment}`);
console.log(`Build info written to: ${envPath}`);
console.log(`Build JSON written to: ${buildJsonPath}`);