import { createLambdaProxyAuthHandler } from "vercel-github-oauth-proxy";

// Simpele whitelist approach met environment variable
const ALLOWED_USERS = process.env.FINANCE_USERS?.split(',') || ['skroes', 'para76'];

export default async function handler(req, res) {
  try {
    const originalUrl = req.url;
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const pathParam = urlParams.get('path');
    
    if (pathParam) {
      req.url = '/' + pathParam;
    }
    
    console.log('🔐 Finance section OAuth request:', originalUrl, '→', req.url);
    console.log('📋 Finance allowed users:', ALLOWED_USERS.join(', '));
    
    // TODO: We kunnen de username niet checken met de huidige library
    // Voor nu accepteren we alle org members, later custom implementatie
    const authHandler = createLambdaProxyAuthHandler({
      cryptoSecret: process.env.OAUTH_CLIENT_SECRET,
      staticDir: 'build/finance',
      githubOrgName: 'kroescontrol',
      githubClientId: process.env.OAUTH_CLIENT_ID,
      githubClientSecret: process.env.OAUTH_CLIENT_SECRET,
      githubOrgAdminToken: process.env.ACCESS_TOKEN,
      sessionDurationSeconds: 60 * 60 * 24,
      basePath: '/finance',
    });
    
    return await authHandler(req, res);
  } catch (error) {
    console.error('Finance OAuth handler error:', error);
    return res.status(500).json({ 
      error: 'OAuth configuration error for finance section',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}