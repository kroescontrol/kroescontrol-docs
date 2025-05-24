import { createLambdaProxyAuthHandler } from "vercel-github-oauth-proxy";

export default async function handler(req, res) {
  try {
    // Handle logout
    if (req.url === '/logout' || req.url.startsWith('/logout?')) {
      res.setHeader('Set-Cookie', [
        'github-oauth-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
        'github-oauth-state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
      ]);
      return res.redirect(302, '/');
    }

    // Handle path parameter from vercel.json routing
    const originalUrl = req.url;
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const pathParam = urlParams.get('path');
    
    if (pathParam) {
      req.url = '/' + pathParam;
      
      // Check for logout in path param too
      if (pathParam === 'logout') {
        res.setHeader('Set-Cookie', [
          'github-oauth-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
          'github-oauth-state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
        ]);
        return res.redirect(302, '/');
      }

      // Allow root path without OAuth (landingpage)
      if (pathParam === '') {
        // Serve the landingpage without OAuth
        const path = require('path');
        const fs = require('fs');
        
        try {
          const landingPagePath = path.join(process.cwd(), 'build', 'index.html');
          const landingPageContent = fs.readFileSync(landingPagePath, 'utf8');
          res.setHeader('Content-Type', 'text/html');
          return res.status(200).send(landingPageContent);
        } catch (err) {
          console.error('Error serving landing page:', err);
          return res.status(404).send('Landing page not found');
        }
      }

      // Allow specific routes without OAuth
      if (pathParam.startsWith('public') || 
          pathParam.startsWith('assets/css/') || 
          pathParam.startsWith('assets/js/') || 
          pathParam.startsWith('assets/files/public/')) {
        console.log('🌍 Public route (no OAuth):', req.url);
        // Skip OAuth and serve directly with the OAuth library
        const authHandler = createLambdaProxyAuthHandler({
          cryptoSecret: process.env.OAUTH_CLIENT_SECRET,
          staticDir: 'build',
          githubOrgName: null, // Disable org check for public routes
          githubClientId: process.env.OAUTH_CLIENT_ID,
          githubClientSecret: process.env.OAUTH_CLIENT_SECRET,
          githubOrgAdminToken: process.env.ACCESS_TOKEN,
          sessionDurationSeconds: 60 * 60 * 24,
        });
        
        // Fake authentication by setting fake cookie
        req.headers.cookie = 'github-oauth-access-token=public-access';
        return await authHandler(req, res);
      }
    }

    // Direct root access (not via path param) - also allow without OAuth
    if (req.url === '/' || req.url === '/index.html') {
      const path = require('path');
      const fs = require('fs');
      
      try {
        const landingPagePath = path.join(process.cwd(), 'build', 'index.html');
        const landingPageContent = fs.readFileSync(landingPagePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(landingPageContent);
      } catch (err) {
        console.error('Error serving landing page:', err);
        return res.status(404).send('Landing page not found');
      }
    }
    
    console.log('🔐 Full-site OAuth request:', originalUrl, '→', req.url);
    
    const authHandler = createLambdaProxyAuthHandler({
      cryptoSecret: process.env.OAUTH_CLIENT_SECRET,
      staticDir: 'build', // Build directory contains the actual site files
      githubOrgName: 'kroescontrol',
      githubClientId: process.env.OAUTH_CLIENT_ID,
      githubClientSecret: process.env.OAUTH_CLIENT_SECRET,
      githubOrgAdminToken: process.env.ACCESS_TOKEN,
      sessionDurationSeconds: 60 * 60 * 24, // 24 hours
    });
    
    return await authHandler(req, res);
  } catch (error) {
    console.error('OAuth handler error:', error);
    return res.status(500).json({ 
      error: 'OAuth configuration error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}