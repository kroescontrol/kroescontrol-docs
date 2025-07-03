#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const glob = require('fast-glob');

async function restoreMermaidBackup(filePath) {
  const backupPath = filePath + '.mermaid-backup';
  
  try {
    // Check if backup exists
    await fs.access(backupPath);
    
    // Restore from backup
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    await fs.writeFile(filePath, backupContent);
    
    // Remove backup file
    await fs.unlink(backupPath);
    
    return true;
  } catch (error) {
    // No backup file exists
    return false;
  }
}

async function main() {
  console.log('🔧 Restoring mermaid blocks from backups...\n');
  
  // Find all mermaid backup files
  const backupFiles = await glob('app/internal/**/*.mermaid-backup', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let restoredCount = 0;
  
  for (const backupFile of backupFiles) {
    const originalFile = backupFile.replace('.mermaid-backup', '');
    const restored = await restoreMermaidBackup(originalFile);
    if (restored) {
      restoredCount++;
      console.log(`✅ Restored: ${path.relative(process.cwd(), originalFile)}`);
    }
  }
  
  console.log(`\n📊 Summary: Restored ${restoredCount} files`);
}

main().catch(console.error);