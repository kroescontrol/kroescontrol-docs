const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Functie om asset paths in markdown files aan te passen
function migrateAssetPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // Vervang /public/ met / voor static assets
  if (content.includes('/public/')) {
    content = content.replace(/\/public\//g, '/');
    hasChanges = true;
  }

  // Vervang afbeelding referenties
  if (content.includes('](/public/') || content.includes('src="/public/')) {
    content = content.replace(/\]\(\/public\//g, '](/');
    content = content.replace(/src="\/public\//g, 'src="/');
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  }
}

// Vind alle markdown files
const files = glob.sync('pages/**/*.{md,mdx}');

console.log(`🔍 Found ${files.length} markdown files to process...`);

files.forEach(file => {
  migrateAssetPaths(file);
});

console.log('✨ Asset migration complete!');