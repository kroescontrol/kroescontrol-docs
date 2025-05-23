// Route protection middleware voor team-based authorization
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Debug logging
  console.log('🔒 Middleware triggered for:', pathname);

  // Skip middleware voor API routes en statische bestanden
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/static/') ||
      pathname.includes('.')) {
    return;
  }

  // Bepaal welke toegang vereist is op basis van het pad
  const accessLevel = getRequiredAccessLevel(pathname);
  console.log('🔐 Access level required:', accessLevel);
  
  // Publieke content heeft geen authenticatie nodig
  if (accessLevel === 'public') {
    console.log('✅ Public route, allowing access');
    return;
  }

  // Voor beveiligde content: controleer authenticatie
  const cookies = request.headers.get('cookie') || '';
  const authCookie = cookies.includes('vercel-github-oauth-proxy');
  
  if (!authCookie) {
    // Niet ingelogd - redirect naar login
    return redirectToLogin(request);
  }

  // Haal team membership op (met caching)
  return checkTeamAccess(request, accessLevel);
}

function getRequiredAccessLevel(pathname) {
  if (pathname.startsWith('/finance/')) return 'finance';
  if (pathname.startsWith('/operation/')) return 'operation';
  if (pathname.startsWith('/internal/')) return 'internal';
  if (pathname.startsWith('/public/')) return 'public';
  
  // Root docs paths - behandel als public
  if (pathname === '/' || pathname === '/docs' || pathname === '/docs/') return 'public';
  
  // Andere routes (homepage, etc.) - public
  return 'public';
}

function redirectToLogin(request) {
  const loginUrl = new URL('/api/auth/login', request.url);
  loginUrl.searchParams.set('redirect', request.url);
  
  return Response.redirect(loginUrl.toString());
}

async function checkTeamAccess(request, requiredLevel) {
  try {
    // Haal team membership op via onze team-check service
    const teamCheckUrl = new URL('/api/team-check', request.url);
    
    // Forward de auth cookie naar onze API
    const response = await fetch(teamCheckUrl.toString(), {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    if (!response.ok) {
      return redirectToLogin(request);
    }

    const { teams } = await response.json();
    
    // Check of gebruiker toegang heeft tot het gevraagde niveau
    const hasAccess = checkAccessPermission(teams, requiredLevel);
    
    if (!hasAccess) {
      // Geen toegang - toon 403 pagina
      return new Response(
        getAccessDeniedHTML(requiredLevel),
        { 
          status: 403,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Toegang toegestaan - continue
    return;

  } catch (error) {
    console.error('Middleware error:', error);
    // Bij fouten, redirect naar login (veilige fallback)
    return redirectToLogin(request);
  }
}

function checkAccessPermission(userTeams, requiredLevel) {
  switch (requiredLevel) {
    case 'internal':
      // Internal content: engineers team required
      return userTeams.includes('engineers');
      
    case 'operation':
      // Operation content: operation OF finance team required
      return userTeams.includes('operation') || userTeams.includes('finance');
      
    case 'finance':
      // Finance content: finance team required
      return userTeams.includes('finance');
      
    case 'public':
      // Public content: altijd toegestaan
      return true;
      
    default:
      // Onbekend niveau: weiger toegang
      return false;
  }
}

function getAccessDeniedHTML(requiredLevel) {
  const levelDescription = {
    'internal': 'interne documentatie (Kroescontrol Engineers team vereist)',
    'operation': 'operationele documentatie (Operation of Finance team vereist)', 
    'finance': 'financiële documentatie (Finance team vereist)'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Toegang Geweigerd - Kroescontrol Docs</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; text-align: center; }
        .container { max-width: 600px; margin: 0 auto; }
        .error-code { font-size: 4rem; color: #dc3545; margin-bottom: 1rem; }
        .error-message { font-size: 1.25rem; margin-bottom: 2rem; }
        .description { color: #6c757d; margin-bottom: 2rem; }
        .actions a { display: inline-block; margin: 0.5rem; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; }
        .btn-primary { background-color: #0d6efd; color: white; }
        .btn-secondary { background-color: #6c757d; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-code">403</div>
        <div class="error-message">Toegang Geweigerd</div>
        <div class="description">
          Je hebt geen toegang tot ${levelDescription[requiredLevel] || 'deze content'}.
          <br><br>
          Contact je beheerder als je denkt dat dit een fout is.
        </div>
        <div class="actions">
          <a href="/public/" class="btn-primary">Publieke Documentatie</a>
          <a href="/" class="btn-secondary">Homepage</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Configureer welke routes middleware moeten doorlopen
export const config = {
  matcher: [
    // Match alle routes behalve API, static files en Next.js internals
    '/((?!api/|_next/|static/|favicon.ico|robots.txt).*)',
  ]
};