export default async function handler(req, res) {
  try {
    // Check for OAuth cookie
    const cookies = req.headers.cookie || '';
    const oauthToken = cookies
      .split(';')
      .find(cookie => cookie.trim().startsWith('github-oauth-access-token='))
      ?.split('=')[1];

    if (!oauthToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Fetch user info from GitHub
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${oauthToken}`,
        'User-Agent': 'Kroescontrol-Docs'
      }
    });

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userInfo = await response.json();
    
    return res.status(200).json({
      login: userInfo.login,
      name: userInfo.name,
      avatar_url: userInfo.avatar_url,
      html_url: userInfo.html_url
    });
  } catch (error) {
    console.error('User info error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}