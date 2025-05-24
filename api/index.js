import { createLambdaProxyAuthHandler } from "vercel-github-oauth-proxy";

export default async function handler(req, res) {
  try {
    // Map rewrites back to original URLs for OAuth library
    const originalUrl = req.url;
    if (originalUrl.includes('?') && originalUrl.includes('redirect=')) {
      // This is a rewritten OAuth route - restore original path
      const urlObj = new URL(originalUrl, 'https://example.com');
      if (urlObj.pathname === '/api/') {
        // Check if this should be an OAuth route based on query params or headers
        const referer = req.headers.referer || '';
        if (referer.includes('/login/oauth/') || originalUrl.includes('code=') || originalUrl.includes('state=')) {
          // Determine which OAuth route this should be
          if (originalUrl.includes('code=')) {
            req.url = '/api/'; // Callback
          } else {
            req.url = '/login/oauth/authorize'; // Authorization
          }
        }
      }
    }
    
    const authHandler = createLambdaProxyAuthHandler({
      cryptoSecret: process.env.OAUTH_CLIENT_SECRET,
      staticDir: '.', // In Vercel is build output in root directory
      githubOrgName: 'kroescontrol',
      githubClientId: process.env.OAUTH_CLIENT_ID,
      githubClientSecret: process.env.OAUTH_CLIENT_SECRET,
      githubOrgAdminToken: process.env.ACCESS_TOKEN,
    });
    
    return await authHandler(req, res);
  } catch (error) {
    console.error('Auth handler error:', error);
    return res.status(500).json({ 
      error: 'Auth configuration error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}