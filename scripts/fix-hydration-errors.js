#!/usr/bin/env node

/**
 * Fix common React hydration errors in MDX files
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let filesFixed = 0;
let totalFixes = 0;

async function fixHydrationErrors(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    let fixedContent = content;
    let fixes = 0;
    
    // Fix 1: Remove nested <p> tags
    // Look for patterns like <p>...<p>...</p>...</p>
    const nestedPRegex = /<p[^>]*>([\s\S]*?)<p[^>]*>([\s\S]*?)<\/p>([\s\S]*?)<\/p>/g;
    if (nestedPRegex.test(fixedContent)) {
      fixedContent = fixedContent.replace(nestedPRegex, (match, before, inner, after) => {
        fixes++;
        // Keep outer <p>, remove inner <p> tags
        return `<p>${before}${inner}${after}</p>`;
      });
    }
    
    // Fix 2: Replace <div><span> with <p>
    const divSpanRegex = /<div>\s*<span>([\s\S]*?)<\/span>\s*<\/div>/g;
    if (divSpanRegex.test(fixedContent)) {
      fixedContent = fixedContent.replace(divSpanRegex, (match, content) => {
        fixes++;
        return `<p>${content}</p>`;
      });
    }
    
    // Fix 3: More aggressive nested <p> detection
    // Sometimes the pattern is <p>text<p>text</p>text</p>
    const nestedPRegex2 = /<p([^>]*)>([^<]*)<p([^>]*)>([^<]*)<\/p>([^<]*)<\/p>/g;
    if (nestedPRegex2.test(fixedContent)) {
      fixedContent = fixedContent.replace(nestedPRegex2, (match, attr1, text1, attr2, text2, text3) => {
        fixes++;
        // Combine all text into single paragraph
        return `<p${attr1}>${text1}${text2}${text3}</p>`;
      });
    }
    
    // Fix 4: Look for <p> tags that contain block-level elements
    // Pattern: <p style="...">...<span style="...">...</span>...</p>
    // In MDX, this can create nested <p> tags because span with styles can be converted to <p>
    const pWithStyledSpanRegex = /<p([^>]*style[^>]*)>([\s\S]*?)<span([^>]*style[^>]*)>([\s\S]*?)<\/span>([\s\S]*?)<\/p>/g;
    if (pWithStyledSpanRegex.test(fixedContent)) {
      fixedContent = fixedContent.replace(pWithStyledSpanRegex, (match, pAttrs, before, spanAttrs, spanContent, after) => {
        fixes++;
        // Convert to div to avoid nesting issues
        return `<div${pAttrs}>${before}<span${spanAttrs}>${spanContent}</span>${after}</div>`;
      });
    }
    
    if (fixes > 0) {
      // Create backup
      const backupPath = filePath + '.hydration-backup';
      await fs.writeFile(backupPath, content);
      
      // Write fixed content
      await fs.writeFile(filePath, fixedContent);
      
      console.log(`${colors.green}✓ Fixed ${filePath}${colors.reset}`);
      console.log(`  ${fixes} hydration error(s) fixed`);
      console.log(`  Backup saved to ${path.basename(backupPath)}`);
      
      filesFixed++;
      totalFixes += fixes;
    }
    
    return fixes;
  } catch (err) {
    console.error(`${colors.red}Error processing ${filePath}: ${err.message}${colors.reset}`);
    return 0;
  }
}

async function main() {
  console.log(`${colors.blue}🔧 Fixing React Hydration Errors in MDX Files${colors.reset}\n`);
  
  // Get list of files with errors from validation
  const errorFiles = [
    'app/public/branding/page.mdx',
    'app/public/branding/logo/page.mdx',
    'app/public/branding/kleuren/page.mdx',
    'app/public/branding/downloads/page.mdx',
    'app/public/branding/beeldmerk/page.mdx',
    'app/internal/hr/handboek/page.mdx',
    'app/internal/tools/claudecode/prompt/CLAUDE_structuur/page.mdx'
  ];
  
  console.log(`Processing ${errorFiles.length} files with hydration errors...\n`);
  
  for (const file of errorFiles) {
    const fullPath = path.join(process.cwd(), file);
    await fixHydrationErrors(fullPath);
  }
  
  console.log(`\n${colors.blue}Summary:${colors.reset}`);
  console.log(`Files fixed: ${filesFixed}`);
  console.log(`Total fixes applied: ${totalFixes}`);
  
  if (filesFixed > 0) {
    console.log(`\n${colors.yellow}⚠️  Please review the changes and test locally${colors.reset}`);
    console.log(`Backups created with .hydration-backup extension`);
  }
}

// Run the script
main().catch(err => {
  console.error(`${colors.red}Script failed: ${err.message}${colors.reset}`);
  process.exit(1);
});