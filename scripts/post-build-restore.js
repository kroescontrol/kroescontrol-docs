#!/usr/bin/env node

/**
 * Post-build restore - Restore excluded docs after build
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring excluded docs...');

const foldersToRestore = [
  'docs-internal',
  'docs-finance', 
  'docs-operation'
];

foldersToRestore.forEach(folder => {
  const backupPath = `${folder}.backup`;
  const originalPath = folder;
  
  if (fs.existsSync(backupPath)) {
    console.log(`   Restoring ${backupPath} → ${originalPath}`);
    fs.renameSync(backupPath, originalPath);
  }
});

console.log('✅ Docs restored');