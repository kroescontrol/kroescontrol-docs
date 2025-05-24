import { createLambdaProxyAuthHandler } from "vercel-github-oauth-proxy";

export default async function handler(req, res) {
  try {
    const authHandler = createLambdaProxyAuthHandler({
      githubClientId: process.env.OAUTH_CLIENT_ID,
      githubClientSecret: process.env.OAUTH_CLIENT_SECRET,
      githubOrgName: 'kroescontrol',
      githubOrgAdminToken: process.env.ACCESS_TOKEN,
      cryptoSecret: process.env.OAUTH_CLIENT_SECRET,
      paths: ['/api/auth', '/secure-internal', '/secure-finance', '/secure-operation'], // Required paths
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