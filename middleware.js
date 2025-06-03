import { NextResponse } from 'next/server';

// Access Control List - uit environment variables of defaults
const ACL = {
  finance: process.env.FINANCE_USERS?.split(',') || ['serkroes'],
  operation: process.env.OPERATION_USERS?.split(',') || ['serkroes'],
  internal: 'all-org-members' // Iedereen in de org
};

console.log('🔐 Access Control geladen:', {
  finance: ACL.finance.length + ' users',
  operation: ACL.operation.length + ' users',
  internal: ACL.internal
});

// GitHub OAuth URLs
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check welke sectie
  let section = null;
  if (pathname.startsWith('/finance')) section = 'finance';
  else if (pathname.startsWith('/operation')) section = 'operation';
  else if (pathname.startsWith('/internal')) section = 'internal';
  
  // Geen auth nodig voor public of andere paths
  if (!section) {
    return NextResponse.next();
  }
  
  // Check voor OAuth callback
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    return handleOAuthCallback(request, code, section);
  }
  
  // Check bestaande session
  const session = request.cookies.get('gh-session');
  if (session) {
    try {
      const userData = JSON.parse(session.value);
      
      // Check ACL
      if (hasAccess(userData.login, section)) {
        return NextResponse.next();
      } else {
        // Geen toegang tot deze sectie
        return new Response(`
          <html>
            <body style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto;">
              <h1>❌ Geen Toegang</h1>
              <p>Sorry <strong>${userData.login}</strong>, je hebt geen toegang tot de <strong>${section}</strong> sectie.</p>
              <p style="color: #666;">Je bent ingelogd maar hebt geen rechten voor deze sectie. Neem contact op met de administrator als je denkt dat dit een fout is.</p>
              <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px;">Terug naar Home</a>
            </body>
          </html>
        `, {
          status: 403,
          headers: { 'Content-Type': 'text/html' }
        });
      }
    } catch (e) {
      // Invalid session, re-authenticate
    }
  }
  
  // Start OAuth flow
  const state = Math.random().toString(36).substring(7);
  const redirectUri = `${request.nextUrl.origin}/${section}/`;
  
  // Store state in cookie voor CSRF protection
  const response = NextResponse.redirect(
    `${GITHUB_AUTH_URL}?client_id=${process.env.OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user&state=${state}`
  );
  
  response.cookies.set('oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 5 // 5 minuten
  });
  
  return response;
}

async function handleOAuthCallback(request, code, section) {
  try {
    // Exchange code voor token
    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code: code
      })
    });
    
    const { access_token } = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch(GITHUB_USER_URL, {
      headers: {
        'Authorization': `token ${access_token}`,
        'Accept': 'application/json'
      }
    });
    
    const userData = await userResponse.json();
    console.log(`✅ GitHub auth success: ${userData.login}`);
    
    // Check org membership
    const orgResponse = await fetch(`https://api.github.com/orgs/kroescontrol/members/${userData.login}`, {
      headers: {
        'Authorization': `token ${process.env.ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    const isOrgMember = orgResponse.status === 204;
    
    // Voor externe users die in ACL staan
    if (!isOrgMember && !isExternalUser(userData.login)) {
      return new Response('Geen toegang - geen lid van organisatie', { status: 403 });
    }
    
    // Check section access
    if (!hasAccess(userData.login, section)) {
      return new Response(`Geen toegang tot ${section} sectie`, { status: 403 });
    }
    
    // Create session
    const response = NextResponse.redirect(new URL(`/${section}/`, request.url));
    
    response.cookies.set('gh-session', JSON.stringify({
      login: userData.login,
      name: userData.name,
      avatar: userData.avatar_url,
      isOrgMember: isOrgMember
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 uur
    });
    
    return response;
    
  } catch (error) {
    console.error('OAuth error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
}

function hasAccess(username, section) {
  const sectionAcl = ACL[section];
  
  if (sectionAcl === 'all-org-members') {
    return true; // Org membership al gecheckt
  }
  
  return sectionAcl && sectionAcl.includes(username);
}

function isExternalUser(username) {
  // Check alle secties voor externe users
  for (const users of Object.values(ACL)) {
    if (Array.isArray(users) && users.includes(username)) {
      return true;
    }
  }
  return false;
}

export const config = {
  matcher: [
    '/internal/:path*',
    '/finance/:path*', 
    '/operation/:path*'
  ]
};