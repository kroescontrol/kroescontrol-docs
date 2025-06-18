#!/usr/bin/env node

/**
 * Sync Internal Content Script
 * Kopieert docs-internal content van apphub naar docs tijdens build
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../../apphub/docs-internal');
const TARGET_DIR = path.join(__dirname, '../pages/internal');

console.log('📦 Syncing internal documentation content...');
console.log(`   Source: ${SOURCE_DIR}`);
console.log(`   Target: ${TARGET_DIR}`);
console.log('   Method: Full directory sync (clean copy)');
console.log('');
console.log('⚠️  BELANGRIJK: Deze content wordt NIET in git gecommit!');
console.log('   .gitignore zorgt ervoor dat pages/internal/* genegeerd wordt');
console.log('');

// Check if source exists
if (!fs.existsSync(SOURCE_DIR)) {
  console.log('⚠️  Source directory not found. Using placeholder content.');
  process.exit(0);
}

// Function to copy directory recursively
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      // Skip _meta.json in root to preserve local navigation
      if (childItemName === '_meta.json' && src === SOURCE_DIR) {
        console.log('   Skipping _meta.json (preserving local navigation)');
        return;
      }
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Clean target directory but preserve specific files
// This ensures that deleted files in source are also removed from target
const filesToPreserve = ['_meta.json', 'index.mdx', '_status.md'];
if (fs.existsSync(TARGET_DIR)) {
  // Save files to preserve
  const preserved = {};
  filesToPreserve.forEach(file => {
    const filePath = path.join(TARGET_DIR, file);
    if (fs.existsSync(filePath)) {
      preserved[file] = fs.readFileSync(filePath, 'utf8');
    }
  });
  
  // Remove everything in the target directory
  fs.rmSync(TARGET_DIR, { recursive: true, force: true });
  
  // Recreate the target directory
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  
  // Restore preserved files
  Object.entries(preserved).forEach(([file, content]) => {
    fs.writeFileSync(path.join(TARGET_DIR, file), content);
  });
} else {
  // Create the target directory if it doesn't exist
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Copy content
try {
  copyRecursive(SOURCE_DIR, TARGET_DIR);
  
  // Count copied files
  let fileCount = 0;
  function countFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        countFiles(filePath);
      } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
        fileCount++;
      }
    });
  }
  countFiles(TARGET_DIR);
  
  console.log(`✅ Successfully synced ${fileCount} documentation files`);
} catch (error) {
  console.error('❌ Error syncing content:', error.message);
  process.exit(1);
}