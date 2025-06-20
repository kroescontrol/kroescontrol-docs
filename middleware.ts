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
    '/operations', 
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
        
        // Redirect naar hub voor login met loop detectie
        const hubLoginUrl = new URL('https://hub.kroescontrol.nl/login')
        hubLoginUrl.searchParams.set('redirect', request.url)
        
        // Add loop detection
        const referer = request.headers.get('referer')
        if (referer && referer.includes('hub.kroescontrol.nl')) {
          hubLoginUrl.searchParams.set('loop', 'detected')
        }
        
        return NextResponse.redirect(hubLoginUrl)
      }
      
      console.log(`✅ Authorized access to protected route: ${pathname} by ${auth.user?.email}`)
    } catch (error) {
      console.error('Auth verification error:', error)
      
      // Bij error, redirect naar login voor veiligheid
      const hubLoginUrl = new URL('https://hub.kroescontrol.nl/login')
      hubLoginUrl.searchParams.set('redirect', request.url)
      
      // Add loop detection on error
      const referer = request.headers.get('referer')
      if (referer && referer.includes('hub.kroescontrol.nl')) {
        hubLoginUrl.searchParams.set('loop', 'detected')
      }
      
      return NextResponse.redirect(hubLoginUrl)
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