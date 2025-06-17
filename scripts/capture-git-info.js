#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Capture git information when available
let gitCommit = 'unknown';
let gitBranch = 'unknown';

try {
  // Get git commit SHA (short version)
  gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  console.log(`Git commit captured: ${gitCommit}`);
} catch (error) {
  console.warn('Warning: Could not get git commit SHA');
}

try {
  // Get git branch
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  console.log(`Git branch captured: ${gitBranch}`);
} catch (error) {
  console.warn('Warning: Could not get git branch');
}

// Save to temporary file
const gitInfo = {
  commit: gitCommit,
  branch: gitBranch,
  timestamp: new Date().toISOString()
};

const projectRoot = process.cwd();
const gitInfoPath = path.join(projectRoot, '.git-info.json');

fs.writeFileSync(gitInfoPath, JSON.stringify(gitInfo, null, 2));
console.log(`Git info saved to: ${gitInfoPath}`);