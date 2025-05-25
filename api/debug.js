import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const buildDir = path.join(process.cwd(), 'build');
    const rootFiles = fs.readdirSync(process.cwd());
    
    let buildExists = false;
    let buildFiles = [];
    
    try {
      buildFiles = fs.readdirSync(buildDir);
      buildExists = true;
    } catch (e) {
      buildExists = false;
    }
    
    return res.status(200).json({
      message: 'Debug info',
      cwd: process.cwd(),
      rootFiles: rootFiles,
      buildDir: buildDir,
      buildExists: buildExists,
      buildFiles: buildExists ? buildFiles.slice(0, 10) : [], // First 10 files
      buildStats: buildExists ? {
        indexHtml: fs.existsSync(path.join(buildDir, 'index.html')),
        internalDir: fs.existsSync(path.join(buildDir, 'internal')),
      } : null
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Debug failed',
      message: error.message
    });
  }
}