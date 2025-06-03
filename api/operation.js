import { createLambdaProxyAuthHandler } from "vercel-github-oauth-proxy";

export default async function handler(req, res) {
  try {
    // Handle path parameter from vercel.json routing
    const originalUrl = req.url;
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const pathParam = urlParams.get('path');
    
    if (pathParam) {
      req.url = '/' + pathParam;
    }
    
    console.log('🔐 Operation section OAuth request:', originalUrl, '→', req.url);
    
    const authHandler = createLambdaProxyAuthHandler({
      cryptoSecret: process.env.OAUTH_CLIENT_SECRET,
      staticDir: 'build/operation', // Serve only operation section
      githubOrgName: 'kroescontrol',
      githubClientId: process.env.OAUTH_CLIENT_ID,
      githubClientSecret: process.env.OAUTH_CLIENT_SECRET,
      githubOrgAdminToken: process.env.ACCESS_TOKEN,
      sessionDurationSeconds: 60 * 60 * 24, // 24 hours
      basePath: '/operation', // Set base path for operation section
    });
    
    return await authHandler(req, res);
  } catch (error) {
    console.error('Operation OAuth handler error:', error);
    return res.status(500).json({ 
      error: 'OAuth configuration error for operation section',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}