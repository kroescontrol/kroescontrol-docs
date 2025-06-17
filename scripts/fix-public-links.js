#!/usr/bin/env node

/**
 * Fix Public Links Script
 * Corrigeert interne links in public directory om /public prefix te hebben
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PUBLIC_DIR = path.join(__dirname, '../pages/public');

console.log('🔗 Fixing internal links in public directory...');

// Find all markdown files
const files = glob.sync('**/*.{md,mdx}', { cwd: PUBLIC_DIR });

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(PUBLIC_DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Pattern to match markdown links that start with / but not /public
  // Matches: [text](/path) but not [text](/public/path) or [text](http://...)
  const linkPattern = /\[([^\]]+)\]\(\/(?!public\/|https?:\/\/)([^)]+)\)/g;
  
  const newContent = content.replace(linkPattern, (match, text, path) => {
    // Skip if it's an anchor link or already has public prefix
    if (path.startsWith('#') || path.startsWith('public/')) {
      return match;
    }
    
    // Skip external links (shouldn't match but double check)
    if (path.includes('://')) {
      return match;
    }
    
    modified = true;
    totalFixed++;
    return `[${text}](/public/${path})`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newContent);
    console.log(`  ✅ Fixed links in: ${file}`);
  }
});

console.log(`\n🎉 Fixed ${totalFixed} links in ${files.length} files`);
console.log('   All internal links now have proper /public prefix');