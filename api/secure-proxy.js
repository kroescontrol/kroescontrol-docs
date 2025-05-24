// Secure proxy voor beveiligde content
// Routes alle protected content door team authorization

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const requestedPath = req.query.path;
    
    if (!requestedPath) {
      return res.status(400).json({ error: 'Geen pad opgegeven' });
    }

    // Bepaal access level op basis van pad
    const accessLevel = getRequiredAccessLevel(requestedPath);
    
    console.log('🔒 Secure proxy voor:', requestedPath, 'Access level:', accessLevel);

    // Publieke content - direct serveren
    if (accessLevel === 'public') {
      return serveStaticContent(req, res, requestedPath);
    }

    // Check authenticatie voor beveiligde content
    const authResult = await checkAuthentication(req);
    
    if (!authResult.authenticated) {
      console.log('❌ Niet geauthenticeerd, redirect naar login');
      return redirectToLogin(res, req.url);
    }

    // Check team toegang
    const hasAccess = await checkTeamAccess(authResult.username, accessLevel);
    
    if (!hasAccess) {
      console.log('❌ Geen toegang voor', authResult.username, 'tot', accessLevel);
      return res.status(403).json({ 
        error: 'Geen toegang tot deze content',
        requiredLevel: accessLevel 
      });
    }

    console.log('✅ Toegang verleend voor', authResult.username, 'tot', accessLevel);
    
    // Serveer beveiligde content
    return serveStaticContent(req, res, requestedPath);

  } catch (error) {
    console.error('Secure proxy error:', error);
    return res.status(500).json({ error: 'Server fout' });
  }
}

function getRequiredAccessLevel(pathname) {
  if (pathname.startsWith('/finance/') || pathname === '/finance') return 'finance';
  if (pathname.startsWith('/operation/') || pathname === '/operation') return 'operation';
  if (pathname.startsWith('/internal/') || pathname === '/internal') return 'internal';
  return 'public';
}

async function checkAuthentication(req) {
  const cookies = req.headers.cookie || '';
  
  if (!cookies.includes('vercel-github-oauth-proxy')) {
    return { authenticated: false };
  }

  // Extract username van OAuth cookie
  try {
    const cookieValue = cookies.split('vercel-github-oauth-proxy=')[1]?.split(';')[0];
    if (!cookieValue) return { authenticated: false };
    
    const userToken = cookieValue.split('.')[1];
    const userData = JSON.parse(Buffer.from(userToken, 'base64').toString());
    
    return {
      authenticated: true,
      username: userData.login
    };
  } catch (error) {
    console.error('Auth parse error:', error);
    return { authenticated: false };
  }
}

async function checkTeamAccess(username, requiredLevel) {
  try {
    // Hergebruik team check logica
    const teams = await getTeamMemberships(username);
    
    switch (requiredLevel) {
      case 'internal':
        return teams.includes('engineers');
      case 'operation':
        return teams.includes('operation') || teams.includes('finance');
      case 'finance':
        return teams.includes('finance');
      default:
        return true;
    }
  } catch (error) {
    console.error('Team check error:', error);
    return false;
  }
}

async function getTeamMemberships(username) {
  const teams = [];
  const orgName = 'kroescontrol';
  const accessToken = process.env.ACCESS_TOKEN;

  const teamsToCheck = [
    { name: 'engineers', slug: 'kroescontrol-engineers' },
    { name: 'operation', slug: 'kroescontrol-operation' },
    { name: 'finance', slug: 'kroescontrol-finance' }
  ];

  for (const team of teamsToCheck) {
    const membershipUrl = `https://api.github.com/orgs/${orgName}/teams/${team.slug}/memberships/${username}`;
    
    const response = await fetch(membershipUrl, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Kroescontrol-Docs'
      }
    });

    if (response.status === 200) {
      const membership = await response.json();
      if (membership.state === 'active') {
        teams.push(team.name);
      }
    }
  }

  return teams;
}

function redirectToLogin(res, returnUrl) {
  const loginUrl = `/api/auth/login?redirect=${encodeURIComponent(returnUrl)}`;
  res.writeHead(302, { Location: loginUrl });
  res.end();
}

function serveStaticContent(req, res, requestedPath) {
  try {
    // Bepaal file path in build directory
    const buildDir = path.join(process.cwd(), 'build');
    let filePath = path.join(buildDir, requestedPath);
    
    // Als het een directory is, probeer index.html
    if (fs.lstatSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Pagina niet gevonden' });
    }

    const content = fs.readFileSync(filePath);
    const contentType = filePath.endsWith('.html') ? 'text/html' : 'text/plain';
    
    res.setHeader('Content-Type', contentType);
    res.send(content);
    
  } catch (error) {
    console.error('Static serve error:', error);
    res.status(500).json({ error: 'Kan content niet laden' });
  }
}