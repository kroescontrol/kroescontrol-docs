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