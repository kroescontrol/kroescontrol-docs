#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get git commit SHA (short version)
let gitCommit = 'unknown';

// First try to read from cached git info file
const projectRoot = process.cwd();
const gitInfoPath = path.join(projectRoot, '.git-info.json');
if (fs.existsSync(gitInfoPath)) {
  try {
    const gitInfo = JSON.parse(fs.readFileSync(gitInfoPath, 'utf-8'));
    if (gitInfo.commit && gitInfo.commit !== 'unknown') {
      gitCommit = gitInfo.commit;
      console.log('Using cached git commit from .git-info.json');
    }
  } catch (error) {
    console.warn('Warning: Could not read .git-info.json');
  }
}

// If no cached info, try Vercel environment variable
if (gitCommit === 'unknown' && process.env.VERCEL_GIT_COMMIT_SHA) {
  gitCommit = process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7);
}

// Final fallback to local git
if (gitCommit === 'unknown') {
  try {
    gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.warn('Warning: Could not get git commit SHA');
  }
}

// Get current date and time in Dutch timezone (Europe/Amsterdam)
const now = new Date();
const dutchTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Amsterdam"}));
const year = dutchTime.getFullYear();
const month = String(dutchTime.getMonth() + 1).padStart(2, '0');
const day = String(dutchTime.getDate()).padStart(2, '0');
const hours = String(dutchTime.getHours()).padStart(2, '0');
const minutes = String(dutchTime.getMinutes()).padStart(2, '0');

// Determine environment
let environment = 'dev'; // default for local development
if (process.env.VERCEL_ENV === 'production') {
  environment = 'prod';
} else if (process.env.VERCEL_ENV === 'preview') {
  environment = 'preview';
} else if (process.env.CI) {
  environment = 'ci';
}

// Format: YYYYMMDD-HHMM-env (timestamp based) or gitsha-YYYYMMDD-HHMM-env if git available
// Note: HHMM is in Dutch timezone (Europe/Amsterdam)
const buildId = gitCommit !== 'unknown' 
  ? `${gitCommit}-${year}${month}${day}-${hours}${minutes}-${environment}`
  : `${year}${month}${day}-${hours}${minutes}-${environment}`;
const buildTime = now.toISOString();

// Get git branch
let gitBranch = 'unknown';

// First try to read from cached git info file
if (fs.existsSync(gitInfoPath)) {
  try {
    const gitInfo = JSON.parse(fs.readFileSync(gitInfoPath, 'utf-8'));
    if (gitInfo.branch && gitInfo.branch !== 'unknown') {
      gitBranch = gitInfo.branch;
      console.log('Using cached git branch from .git-info.json');
    }
  } catch (error) {
    console.warn('Warning: Could not read .git-info.json for branch');
  }
}

// If no cached info, try Vercel environment variable
if (gitBranch === 'unknown' && process.env.VERCEL_GIT_COMMIT_REF) {
  gitBranch = process.env.VERCEL_GIT_COMMIT_REF;
}

// Final fallback to local git
if (gitBranch === 'unknown') {
  try {
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.warn('Warning: Could not get git branch');
  }
}

// Write to .env.local for local development
const envContent = `# Auto-generated build information
NEXT_PUBLIC_BUILD_ID=${buildId}
NEXT_PUBLIC_BUILD_TIME=${buildTime}
NEXT_PUBLIC_GIT_COMMIT=${gitCommit}
NEXT_PUBLIC_GIT_BRANCH=${gitBranch}
NEXT_PUBLIC_BUILD_ENV=${environment}
`;

// Determine path for .env.local
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
console.log(`Timestamp: Dutch time (Europe/Amsterdam)`);
console.log(`Build info written to: ${envPath}`);
console.log(`Build JSON written to: ${buildJsonPath}`);