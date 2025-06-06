import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // Extract path from query parameter
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const requestPath = urlParams.get('path') || 'index.html';
    
    // Security: prevent directory traversal
    const safePath = path.normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Build file path
    const filePath = path.join(process.cwd(), 'build', safePath);
    
    // Default to index.html for directories
    let finalPath = filePath;
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        finalPath = path.join(filePath, 'index.html');
      }
    } catch {
      // If exact path doesn't exist, try with .html extension
      if (!path.extname(filePath)) {
        finalPath = filePath + '.html';
      }
    }
    
    // Read and serve the file
    const content = await fs.readFile(finalPath);
    
    // Set content type based on file extension
    const ext = path.extname(finalPath);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    
    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
    res.status(200).send(content);
    
  } catch (error) {
    console.error('Public handler error:', error);
    res.status(404).send('Not Found');
  }
}