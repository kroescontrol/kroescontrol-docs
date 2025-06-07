#!/usr/bin/env node

/**
 * Migrate _category_.json files to index.md frontmatter
 * 
 * This script:
 * 1. Finds all _category_.json files
 * 2. Merges their info into index.md frontmatter
 * 3. Creates index.md if it doesn't exist
 * 4. Removes _category_.json files after migration
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function findCategoryFiles() {
  const { execSync } = require('child_process');
  const result = execSync('find docs-* -name "_category_.json" -type f', { encoding: 'utf8' });
  return result.trim().split('\n').filter(Boolean);
}

function migrateCategoryToIndex(categoryPath) {
  const dir = path.dirname(categoryPath);
  const indexPath = path.join(dir, 'index.md');
  
  console.log(`\n📁 Processing: ${dir}`);
  
  // Read category.json
  const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
  console.log(`   📋 Category: ${categoryData.label}`);
  
  let indexContent = '';
  let frontmatter = {};
  
  // Check if index.md already exists
  if (fs.existsSync(indexPath)) {
    console.log(`   ✅ Found existing index.md`);
    const existing = matter(fs.readFileSync(indexPath, 'utf8'));
    frontmatter = existing.data;
    indexContent = existing.content;
  } else {
    console.log(`   ➕ Creating new index.md`);
    indexContent = `# ${categoryData.label}\n\n<!-- Add content here -->\n`;
  }
  
  // Merge category data into frontmatter
  const newFrontmatter = {
    ...frontmatter,
    title: frontmatter.title || categoryData.label,
    sidebar_position: categoryData.position || frontmatter.sidebar_position,
  };
  
  // Add description if available
  if (categoryData.customProps?.description) {
    newFrontmatter.description = categoryData.customProps.description;
  }
  
  // Add collapsed info as class
  if (categoryData.collapsed) {
    newFrontmatter.sidebar_class_name = 'category-collapsed';
  }
  
  // Ensure docStatus 
  if (!newFrontmatter.docStatus) {
    newFrontmatter.docStatus = 'production';
  }
  
  // Create slug based on directory structure
  if (!newFrontmatter.slug) {
    const relativePath = dir.replace(/^docs-[^/]+/, '').replace(/\\/g, '/');
    newFrontmatter.slug = relativePath || '/';
  }
  
  // Write updated index.md
  const newContent = matter.stringify(indexContent, newFrontmatter);
  fs.writeFileSync(indexPath, newContent);
  console.log(`   ✅ Updated ${indexPath}`);
  
  return {
    categoryPath,
    indexPath,
    categoryData,
    newFrontmatter
  };
}

function main() {
  console.log('🚀 Starting _category_.json to index.md migration\n');
  
  const categoryFiles = findCategoryFiles();
  console.log(`Found ${categoryFiles.length} _category_.json files`);
  
  const migrations = [];
  
  for (const categoryPath of categoryFiles) {
    try {
      const result = migrateCategoryToIndex(categoryPath);
      migrations.push(result);
    } catch (error) {
      console.error(`❌ Error processing ${categoryPath}:`, error.message);
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${migrations.length} directories`);
  
  // Generate summary report
  const report = {
    timestamp: new Date().toISOString(),
    migrations: migrations.map(m => ({
      directory: path.dirname(m.categoryPath),
      categoryLabel: m.categoryData.label,
      position: m.categoryData.position,
      hasContent: fs.statSync(m.indexPath).size > 200,
      newSlug: m.newFrontmatter.slug
    }))
  };
  
  fs.writeFileSync('category-migration-report.json', JSON.stringify(report, null, 2));
  console.log('📋 Report saved to: category-migration-report.json');
  
  // Ask user if they want to remove _category_.json files
  console.log('\n⚠️  Ready to remove _category_.json files');
  console.log('🔍 Review the changes first, then run:');
  console.log('   node migrate-categories.js --remove-json');
}

// Handle --remove-json flag
if (process.argv.includes('--remove-json')) {
  console.log('🗑️  Removing _category_.json files...');
  const categoryFiles = findCategoryFiles();
  
  for (const categoryPath of categoryFiles) {
    try {
      fs.unlinkSync(categoryPath);
      console.log(`   ✅ Removed: ${categoryPath}`);
    } catch (error) {
      console.error(`   ❌ Error removing ${categoryPath}:`, error.message);
    }
  }
  
  console.log('✅ Cleanup complete!');
} else {
  main();
}