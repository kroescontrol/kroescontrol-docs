const fs = require('fs');
const path = require('path');

function isEncrypted(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes('GITCRYPT') || content.charCodeAt(0) === 0;
  } catch (e) {
    return true; // Als we het niet kunnen lezen, waarschijnlijk encrypted
  }
}

function detectEncryptedDirectories(docsPath) {
  const encryptedDirs = [];
  
  try {
    const entries = fs.readdirSync(docsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const categoryPath = path.join(docsPath, entry.name, '_category_.json');
        if (isEncrypted(categoryPath)) {
          encryptedDirs.push(entry.name);
          console.log(`🔒 Detected encrypted directory: ${entry.name}`);
        }
      }
    }
  } catch (e) {
    console.warn('Could not scan docs directory for encrypted content:', e.message);
  }
  
  return encryptedDirs;
}

// Export utility functions
module.exports = {
  detectEncryptedDirectories,
  isEncrypted
};