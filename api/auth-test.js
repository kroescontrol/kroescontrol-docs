export default function handler(req, res) {
  // Debug environment variables
  const config = {
    clientId: !!process.env.OAUTH_CLIENT_ID,
    clientSecret: !!process.env.OAUTH_CLIENT_SECRET,
    accessToken: !!process.env.ACCESS_TOKEN,
    clientIdValue: process.env.OAUTH_CLIENT_ID ? 'SET' : 'MISSING',
  };
  
  res.status(200).json({
    message: 'Auth test endpoint',
    env: config,
    timestamp: new Date().toISOString()
  });
}