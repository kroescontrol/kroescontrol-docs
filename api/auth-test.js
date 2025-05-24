export default function handler(req, res) {
  // Debug environment variables
  const clientId = process.env.OAUTH_CLIENT_ID;
  const config = {
    clientId: !!clientId,
    clientSecret: !!process.env.OAUTH_CLIENT_SECRET,
    accessToken: !!process.env.ACCESS_TOKEN,
    clientIdValue: clientId ? 'SET' : 'MISSING',
    clientIdLength: clientId ? clientId.length : 0,
    clientIdHex: clientId ? Buffer.from(clientId).toString('hex') : null,
    hasNewline: clientId ? clientId.includes('\n') : false,
  };
  
  res.status(200).json({
    message: 'Auth test endpoint',
    env: config,
    timestamp: new Date().toISOString()
  });
}