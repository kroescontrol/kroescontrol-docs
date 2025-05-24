import { createLambdaProxyAuthHandler } from "vercel-github-oauth-proxy";

export default async function handler(req, res) {
  try {
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