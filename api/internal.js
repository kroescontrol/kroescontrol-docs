import { createLambdaProxyAuthHandler } from "vercel-github-oauth-proxy";

export default async function handler(req, res) {
  try {
    const originalUrl = req.url;
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const pathParam = urlParams.get('path');
    
    if (pathParam) {
      req.url = '/' + pathParam;
    }
    
    console.log('🔐 Internal section OAuth request:', originalUrl, '→', req.url);
    
    // Internal is voor alle org members
    const authHandler = createLambdaProxyAuthHandler({
      cryptoSecret: process.env.OAUTH_CLIENT_SECRET,
      staticDir: 'build/internal',
      githubOrgName: 'kroescontrol',
      githubClientId: process.env.OAUTH_CLIENT_ID,
      githubClientSecret: process.env.OAUTH_CLIENT_SECRET,
      githubOrgAdminToken: process.env.ACCESS_TOKEN,
      sessionDurationSeconds: 60 * 60 * 24,
      basePath: '/internal',
    });
    
    return await authHandler(req, res);
  } catch (error) {
    console.error('Internal OAuth handler error:', error);
    return res.status(500).json({ 
      error: 'OAuth configuration error for internal section',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}