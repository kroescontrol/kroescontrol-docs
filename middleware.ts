import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip auth checks in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔓 Development mode: allowing access to ${pathname}`)
    return NextResponse.next()
  }
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/internal',
    '/operation',   // Fixed: was '/operations' with an 's'
    '/finance'
  ]
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    // Verify auth via hub API
    try {
      const hubUrl = 'https://hub.kroescontrol.nl'
        
      const authResponse = await fetch(`${hubUrl}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
          'Origin': request.headers.get('origin') || request.nextUrl.origin
        },
        body: JSON.stringify({ path: pathname }),
        credentials: 'include'
      })
      
      if (!authResponse.ok) {
        throw new Error(`Auth verification failed: ${authResponse.status}`)
      }
      
      const auth = await authResponse.json()
      
      if (!auth.authenticated || !auth.hasAccess) {
        console.log(`🔒 Unauthorized access attempt to protected route: ${pathname}`)
        
        // Enhanced loop detection
        const referer = request.headers.get('referer')
        const loopParam = new URL(request.url).searchParams.get('loop')
        
        // Check for redirect loop
        if (loopParam === 'detected' || (referer && referer.includes('hub.kroescontrol.nl/login'))) {
          console.log('🔄 Redirect loop detected, showing error page')
          
          // Return an error response instead of redirecting
          return new NextResponse(
            `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Authenticatie Probleem - Kroescontrol Docs</title>
                <style>
                  body { font-family: -apple-system, system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                  .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                  h1 { color: #333; margin-bottom: 20px; }
                  p { color: #666; line-height: 1.6; }
                  .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
                  .error { background: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 4px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Authenticatie Probleem</h1>
                  <div class="error">
                    <p><strong>Er is een redirect loop gedetecteerd.</strong></p>
                    <p>Dit kan gebeuren als je sessie verlopen is of als er een probleem is met de cookies.</p>
                  </div>
                  <p>Probeer een van de volgende oplossingen:</p>
                  <ul>
                    <li>Wis je browser cookies voor kroescontrol.nl</li>
                    <li>Open een incognito/privé browser venster</li>
                    <li>Log eerst in op <a href="https://hub.kroescontrol.nl">hub.kroescontrol.nl</a></li>
                  </ul>
                  <a href="https://hub.kroescontrol.nl/dashboard" class="button">Ga naar Hub Dashboard</a>
                </div>
              </body>
            </html>
            `,
            {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
              },
            }
          )
        }
        
        // Normal redirect with loop detection parameter
        const hubLoginUrl = new URL('https://hub.kroescontrol.nl/login')
        hubLoginUrl.searchParams.set('redirect', request.url)
        
        // Add loop detection flag if coming from hub
        if (referer && referer.includes('hub.kroescontrol.nl')) {
          hubLoginUrl.searchParams.set('from', 'docs')
        }
        
        return NextResponse.redirect(hubLoginUrl)
      }
      
      console.log(`✅ Authorized access to protected route: ${pathname} by ${auth.user?.email}`)
    } catch (error) {
      console.error('Auth verification error:', error)
      
      // Return error page instead of redirect on verification failure
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verificatie Fout - Kroescontrol Docs</title>
            <style>
              body { font-family: -apple-system, system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
              .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              h1 { color: #333; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
              .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
              .error { background: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 4px; margin: 20px 0; }
              code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Verificatie Fout</h1>
              <div class="error">
                <p><strong>Er is een probleem met de authenticatie verificatie.</strong></p>
                <p>De hub service is mogelijk tijdelijk niet bereikbaar.</p>
              </div>
              <p>Error: <code>${error instanceof Error ? error.message : 'Unknown error'}</code></p>
              <p>Probeer het later opnieuw of neem contact op met de administrator.</p>
              <a href="https://hub.kroescontrol.nl" class="button">Ga naar Hub</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 503,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      )
    }
  }
  
  // Allow all other requests to continue
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (to avoid interfering with auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico, robots.txt, etc (meta files)
     * - public directory files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public).*)',
  ],
}