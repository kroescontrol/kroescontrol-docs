#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const glob = require('fast-glob');

async function removeMermaidFromFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  
  // Replace mermaid code blocks with plain code blocks
  const updatedContent = content.replace(
    /```mermaid\n([\s\S]*?)```/g,
    (match, diagramContent) => {
      return '```\n' + '# Mermaid diagram temporarily disabled for build\n' + diagramContent + '```';
    }
  );
  
  if (content !== updatedContent) {
    // Create backup
    await fs.writeFile(filePath + '.mermaid-backup', content);
    // Write updated content
    await fs.writeFile(filePath, updatedContent);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🔧 Removing mermaid blocks from MDX files...\n');
  
  // Find all MDX files in internal directory
  const files = await glob('app/internal/**/*.{md,mdx}', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let modifiedCount = 0;
  
  for (const file of files) {
    const modified = await removeMermaidFromFile(file);
    if (modified) {
      modifiedCount++;
      console.log(`✅ Modified: ${path.relative(process.cwd(), file)}`);
    }
  }
  
  console.log(`\n📊 Summary: Modified ${modifiedCount} files`);
  console.log('💾 Backup files created with .mermaid-backup extension');
}

main().catch(console.error);