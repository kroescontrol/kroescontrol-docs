/**
 * Cloudflare Worker Template - Authentication Proxy voor Kroescontrol Docs
 * 
 * Deze template wordt gebruikt door deploy-cloudflare-worker.js
 * De ACL wordt tijdens deployment geïnjecteerd uit sensitive/access-control.yml
 */

// ============================================================================
// ACCESS CONTROL LIST - Wordt geïnjecteerd tijdens deployment
// ============================================================================
// {{ACL_PLACEHOLDER}}

// ============================================================================
// CONFIGURATIE - Environment Variables (zet in Cloudflare Dashboard)
// ============================================================================
// GITHUB_CLIENT_ID = <jouw-github-oauth-app-id>
// GITHUB_CLIENT_SECRET = <jouw-github-oauth-app-secret>
// JWT_SECRET = <random-string-genereer-met-openssl>
// BACKEND_URL = https://kroescontrol-docs.vercel.app

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // ===== PUBLIEKE ROUTES - Direct doorsturen =====
  const publicPaths = [
    '/',
    '/public',
    '/_next',
    '/img',
    '/assets',
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.svg',
    '.ico',
    '.woff',
    '.woff2'
  ];
  
  if (publicPaths.some(p => path.includes(p))) {
    return proxyToVercel(request);
  }
  
  // ===== AUTH ENDPOINTS =====
  if (path === '/api/auth/login') {
    return handleLogin(request);
  }
  
  if (path === '/api/auth/callback') {
    return handleCallback(request);
  }
  
  if (path === '/api/auth/logout') {
    return handleLogout(request);
  }
  
  if (path === '/api/auth/status') {
    return handleStatus(request);
  }
  
  // ===== PROTECTED ROUTES - Auth check =====
  const section = path.split('/')[1];
  
  if (['internal', 'finance', 'operation'].includes(section)) {
    const auth = await checkAuth(request);
    
    if (!auth.authenticated) {
      // Niet ingelogd - redirect naar login
      return Response.redirect(`${url.origin}/api/auth/login?return=${encodeURIComponent(path)}`);
    }
    
    // Check ACL voor deze sectie
    const userSections = ACL[auth.username] || [];
    
    if (!userSections.includes(section)) {
      // Geen toegang tot deze sectie
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Geen Toegang - Kroescontrol Docs</title>
          <style>
            body {
              font-family: -apple-system, system-ui, sans-serif;
              background: #f5f5f5;
              margin: 0;
              padding: 40px;
              display: flex;
              min-height: 100vh;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              max-width: 500px;
              text-align: center;
            }
            h1 { color: #d73a49; margin-bottom: 20px; }
            .username { 
              background: #f6f8fa; 
              padding: 2px 8px; 
              border-radius: 4px;
              font-family: monospace;
            }
            .section {
              color: #0969da;
              font-weight: bold;
            }
            .button {
              display: inline-block;
              margin-top: 30px;
              padding: 10px 20px;
              background: #0969da;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            }
            .button:hover { background: #0860ca; }
            .logout {
              display: inline-block;
              margin-top: 10px;
              color: #666;
              text-decoration: none;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Geen Toegang</h1>
            <p>
              Hallo <span class="username">${auth.username}</span>, je hebt geen toegang tot de 
              <span class="section">${section}</span> sectie.
            </p>
            <p style="color: #666; margin-top: 20px;">
              Je hebt toegang tot: ${userSections.length > 0 ? userSections.map(s => `<strong>${s}</strong>`).join(', ') : 'geen secties'}
            </p>
            <a href="/" class="button">Terug naar Home</a>
            <br>
            <a href="/api/auth/logout" class="logout">Uitloggen</a>
          </div>
        </body>
        </html>
      `, { 
        status: 403,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }
    
    // Gebruiker heeft toegang - proxy naar Vercel
    return proxyToVercel(request);
  }
  
  // Alle andere routes
  return proxyToVercel(request);
}

// ============================================================================
// AUTH FUNCTIES
// ============================================================================

async function checkAuth(request) {
  const cookie = request.headers.get('Cookie');
  const token = cookie?.match(/auth_token=([^;]+)/)?.[1];
  
  if (!token) {
    return { authenticated: false };
  }
  
  try {
    const payload = await verifyJWT(token, JWT_SECRET);
    
    // Check of token niet verlopen is
    if (payload.exp < Date.now() / 1000) {
      return { authenticated: false };
    }
    
    return { 
      authenticated: true, 
      username: payload.username,
      email: payload.email 
    };
  } catch (e) {
    console.error('JWT verification failed:', e);
    return { authenticated: false };
  }
}

async function handleLogin(request) {
  const url = new URL(request.url);
  const returnPath = url.searchParams.get('return') || '/';
  
  // State voor CSRF protection en return URL
  const state = btoa(JSON.stringify({
    returnPath,
    nonce: crypto.randomUUID()
  }));
  
  const redirectUri = `${url.origin}/api/auth/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=read:user&` +
    `state=${state}`;
  
  return Response.redirect(githubAuthUrl);
}

async function handleCallback(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  if (!code) {
    return new Response('No code provided', { status: 400 });
  }
  
  try {
    // Parse state
    const stateData = JSON.parse(atob(state));
    
    // Exchange code voor access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });
    
    const { access_token } = await tokenResponse.json();
    
    if (!access_token) {
      throw new Error('No access token received');
    }
    
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
      },
    });
    
    const githubUser = await userResponse.json();
    const username = githubUser.login;
    
    console.log(`GitHub OAuth success voor: ${username}`);
    
    // Check of user in ACL staat
    if (!ACL[username]) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Geen Toegang - Kroescontrol Docs</title>
          <style>
            body {
              font-family: -apple-system, system-ui, sans-serif;
              background: #f5f5f5;
              margin: 0;
              padding: 40px;
              display: flex;
              min-height: 100vh;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              max-width: 500px;
              text-align: center;
            }
            h1 { color: #d73a49; }
            .username { 
              background: #f6f8fa; 
              padding: 2px 8px; 
              border-radius: 4px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Geen Toegang</h1>
            <p>
              Sorry <span class="username">${username}</span>, je hebt geen toegang tot de Kroescontrol documentatie.
            </p>
            <p style="color: #666;">
              Neem contact op met een administrator als je denkt dat dit een fout is.
            </p>
          </div>
        </body>
        </html>
      `, { 
        status: 403,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }
    
    // Genereer JWT token
    const token = await generateJWT({
      username: username,
      email: githubUser.email,
      name: githubUser.name,
      avatar: githubUser.avatar_url
    });
    
    // Redirect met cookie
    const response = Response.redirect(`${url.origin}${stateData.returnPath}`);
    response.headers.set('Set-Cookie', 
      `auth_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
    );
    
    return response;
    
  } catch (e) {
    console.error('OAuth callback error:', e);
    return new Response(`Authentication failed: ${e.message}`, { status: 500 });
  }
}

async function handleLogout(request) {
  const response = Response.redirect(new URL(request.url).origin);
  response.headers.set('Set-Cookie', 
    'auth_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
  );
  return response;
}

async function handleStatus(request) {
  const auth = await checkAuth(request);
  
  return new Response(JSON.stringify({
    authenticated: auth.authenticated,
    user: auth.authenticated ? {
      username: auth.username,
      sections: ACL[auth.username] || []
    } : null
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// PROXY FUNCTIE
// ============================================================================

async function proxyToVercel(request) {
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
  
  // Clone headers maar verwijder CF-specifieke headers
  const headers = new Headers(request.headers);
  headers.delete('cf-connecting-ip');
  headers.delete('cf-ipcountry');
  headers.delete('cf-ray');
  headers.delete('cf-visitor');
  
  // Proxy request
  const response = await fetch(backendUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: 'manual'
  });
  
  // Clone response
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
  
  // Cache static assets agressief
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return newResponse;
}

// ============================================================================
// JWT HELPERS - Simpele implementatie, overweeg jose library voor productie
// ============================================================================

async function generateJWT(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    exp: now + 604800, // 7 dagen
    iss: 'kroescontrol-docs'
  };
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(claims)).replace(/=/g, '');
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

async function verifyJWT(token) {
  const [header, payload, signature] = token.split('.');
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const sigBytes = Uint8Array.from(atob(
    signature.replace(/-/g, '+').replace(/_/g, '/') + '=='
  ), c => c.charCodeAt(0));
  
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    new TextEncoder().encode(`${header}.${payload}`)
  );
  
  if (!valid) {
    throw new Error('Invalid signature');
  }
  
  return JSON.parse(atob(payload + '=='));
}