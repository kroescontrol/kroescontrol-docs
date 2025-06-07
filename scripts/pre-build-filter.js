#!/usr/bin/env node

/**
 * Pre-build filter - Exclude protected docs from production builds
 * until hub auth is ready
 */

const fs = require('fs');
const path = require('path');

// Check if we should exclude protected docs (default: true for production)
const EXCLUDE_PROTECTED = process.env.EXCLUDE_PROTECTED_DOCS !== 'false';

if (EXCLUDE_PROTECTED) {
  console.log('🚧 Excluding protected docs from build...');
  
  const foldersToExclude = [
    'docs-internal',
    'docs-finance', 
    'docs-operation'
  ];
  
  foldersToExclude.forEach(folder => {
    const folderPath = path.join(process.cwd(), folder);
    if (fs.existsSync(folderPath)) {
      console.log(`   Temporarily moving ${folder} → ${folder}.backup`);
      fs.renameSync(folderPath, `${folderPath}.backup`);
    }
  });
  
  console.log('✅ Protected docs excluded from build');
  console.log('💡 To include in local dev: EXCLUDE_PROTECTED_DOCS=false npm run build');
} else {
  console.log('📖 Including all docs in build (dev mode)');
}