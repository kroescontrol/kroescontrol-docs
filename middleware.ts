import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/internal',
    '/operations', 
    '/finance'
  ]
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    // Only check auth for protected routes
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    if (!token) {
      console.log(`🔒 Unauthorized access attempt to protected route: ${pathname}`)
      
      // In productie: redirect naar hub.kroescontrol.nl voor login
      if (process.env.NODE_ENV === 'production') {
        const hubLoginUrl = new URL('https://hub.kroescontrol.nl/login')
        hubLoginUrl.searchParams.set('redirect', request.url)
        return NextResponse.redirect(hubLoginUrl)
      }
      
      // In development: gebruik lokale signin
      const signInUrl = new URL('/api/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(signInUrl)
    }
    
    console.log(`✅ Authorized access to protected route: ${pathname} by ${token.email}`)
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