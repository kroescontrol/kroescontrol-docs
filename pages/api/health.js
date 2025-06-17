export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const health = {
    status: 'healthy',
    service: 'kroescontrol-docs',
    timestamp: new Date().toISOString(),
    build: {
      id: process.env.NEXT_PUBLIC_BUILD_ID || 'unknown',
      time: process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown',
      environment: process.env.NEXT_PUBLIC_BUILD_ENV || 'unknown'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };

  // Set cache headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  res.status(200).json(health);
}