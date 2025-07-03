#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'app/public/branding/beeldmerk/page.mdx',
  'app/public/branding/logo/page.mdx',
  'app/public/branding/kleuren/page.mdx',
  'app/public/branding/downloads/page.mdx',
  'app/public/branding/page.mdx',
  'app/internal/hr/handboek/page.mdx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Fix patterns that cause nested <p> tags
  
  // Pattern 1: Loose text after closing div (wordt door MDX in <p> gewrapped)
  // Match: </div>\n    Text\n  </div>
  content = content.replace(/(<\/div>)\n(\s+)([^<\s][^\n<]*)\n(\s*<\/div>)/g, (match, div1, space1, text, div2) => {
    return `${div1}\n${space1}<div style={{fontSize: '0.9em', textAlign: 'center', margin: '8px 0 0 0'}}>${text.trim()}</div>\n${div2}`;
  });
  
  // Pattern 2: Replace explicit <p> tags with <div>
  content = content.replace(/<p>([^<]+)<\/p>/g, '<div style={{fontSize: \'0.9em\', textAlign: \'center\', margin: \'8px 0 0 0\'}}>$1</div>');
  
  // Pattern 3: Replace <span> with styling with <div>
  content = content.replace(/<span style={{fontSize: '0.9em', textAlign: 'center', margin: '8px 0 0 0'}}>([^<]+)<\/span>/g, 
    '<div style={{fontSize: \'0.9em\', textAlign: \'center\', margin: \'8px 0 0 0\'}}>$1</div>');
  
  // Pattern 4: Fix loose text after h3
  content = content.replace(/(<h3>[^<]+<\/h3>)\n(\s+)([^<\s][^\n<]*)\n/g, (match, h3, space, text) => {
    if (!text.includes('<div') && !text.includes('<span') && !text.includes('<p')) {
      return `${h3}\n${space}<div>${text.trim()}</div>\n`;
    }
    return match;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`⏭️  No changes needed for ${file}`);
  }
});

console.log('\nDone! Run validation to check results.');