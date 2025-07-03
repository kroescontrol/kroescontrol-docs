#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Searching for MDX files with mermaid blocks...');

// Find all MDX files
const mdxFiles = glob.sync('app/**/*.mdx', { 
  ignore: ['node_modules/**', '.next/**'] 
});

let filesProcessed = 0;
let mermaidBlocksRemoved = 0;

mdxFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check if file contains mermaid blocks
  if (content.includes('```mermaid')) {
    // Remove mermaid code blocks
    const newContent = content.replace(/```mermaid[\s\S]*?```/g, (match) => {
      mermaidBlocksRemoved++;
      return '```\n[Mermaid diagram removed for build compatibility]\n```';
    });
    
    // Save the modified file
    fs.writeFileSync(file, newContent);
    filesProcessed++;
    console.log(`✅ Processed: ${file}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`- Files scanned: ${mdxFiles.length}`);
console.log(`- Files modified: ${filesProcessed}`);
console.log(`- Mermaid blocks removed: ${mermaidBlocksRemoved}`);

if (filesProcessed === 0) {
  console.log('✨ No mermaid blocks found - all good!');
}