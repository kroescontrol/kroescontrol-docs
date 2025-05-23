// Team membership checker service met caching
// Deze service controleert van welke GitHub teams een gebruiker lid is

// In-memory cache voor team memberships
const membershipCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minuten

export default async function handler(req, res) {
  try {
    // Haal gebruikersinformatie uit de cookie/session
    const userToken = req.cookies?.['vercel-github-oauth-proxy']?.split('.')?.[1];
    
    if (!userToken) {
      return res.status(401).json({ 
        error: 'Niet geauthenticeerd',
        teams: [] 
      });
    }

    // Decode de gebruiker informatie (base64)
    const userData = JSON.parse(Buffer.from(userToken, 'base64').toString());
    const username = userData.login;

    if (!username) {
      return res.status(401).json({ 
        error: 'Geen gebruikersnaam gevonden',
        teams: [] 
      });
    }

    // Check team membership via GitHub API (met caching)
    const teamMemberships = await checkTeamMembershipsWithCache(username);

    return res.status(200).json({
      username,
      teams: teamMemberships.teams,
      cached: teamMemberships.cached,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team check error:', error);
    return res.status(500).json({ 
      error: 'Server fout bij team controle',
      teams: [] 
    });
  }
}

async function checkTeamMembershipsWithCache(username) {
  const cacheKey = `teams_${username}`;
  const now = Date.now();
  
  // Check cache eerst
  if (membershipCache.has(cacheKey)) {
    const cached = membershipCache.get(cacheKey);
    
    // Als cache nog geldig is, return cached result
    if (now - cached.timestamp < CACHE_DURATION) {
      return {
        teams: cached.teams,
        cached: true
      };
    }
    
    // Cache expired - verwijder oude entry
    membershipCache.delete(cacheKey);
  }
  
  // Haal fresh data op via GitHub API
  const teams = await checkTeamMemberships(username);
  
  // Cache het resultaat
  membershipCache.set(cacheKey, {
    teams,
    timestamp: now
  });
  
  // Cleanup oude cache entries (simpele garbage collection)
  cleanupExpiredCache();
  
  return {
    teams,
    cached: false
  };
}

function cleanupExpiredCache() {
  const now = Date.now();
  
  for (const [key, value] of membershipCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      membershipCache.delete(key);
    }
  }
}

async function checkTeamMemberships(username) {
  const teams = [];
  const orgName = 'kroescontrol';
  const accessToken = process.env.ACCESS_TOKEN;

  // Te controleren teams en hun GitHub slugs
  const teamsToCheck = [
    { name: 'engineers', slug: 'kroescontrol-engineers' },
    { name: 'operation', slug: 'kroescontrol-operation' },
    { name: 'finance', slug: 'kroescontrol-finance' }
  ];

  try {
    // Check elk team
    for (const team of teamsToCheck) {
      const membershipUrl = `https://api.github.com/orgs/${orgName}/teams/${team.slug}/memberships/${username}`;
      
      const response = await fetch(membershipUrl, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Kroescontrol-Docs'
        }
      });

      // Als de gebruiker lid is, krijgen we status 200
      // Als niet lid, krijgen we status 404
      if (response.status === 200) {
        const membership = await response.json();
        
        // Alleen actieve leden tellen
        if (membership.state === 'active') {
          teams.push(team.name);
        }
      }
    }

    return teams;

  } catch (error) {
    console.error('GitHub API error:', error);
    // Bij fouten, return lege array (veilige fallback)
    return [];
  }
}