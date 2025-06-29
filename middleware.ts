import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip auth checks in development unless forced
  if (process.env.NODE_ENV !== 'production' && !process.env.FORCE_AUTH_CHECK) {
    console.log(`🔓 Development mode: allowing access to ${pathname}`)
    return NextResponse.next()
  }
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/internal',
    '/operation',
    '/finance'
  ]
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    // Verify auth via hub API
    try {
      const hubUrl = 'https://hub.kroescontrol.nl'
      const sessionToken = request.cookies.get('__Secure-kroescontrol-session')?.value
      
      if (!sessionToken) {
        console.log('No session cookie found')
        throw new Error('No session')
      }
        
      const authResponse = await fetch(`${hubUrl}/api/auth/check-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken }),
      })
      
      if (!authResponse.ok) {
        throw new Error(`Auth verification failed: ${authResponse.status}`)
      }
      
      const auth = await authResponse.json()
      
      // Check both session validity AND internal access permission
      if (!auth.valid || !auth.hasInternalAccess) {
        console.log(`🔒 Access denied for protected route: ${pathname} (valid: ${auth.valid}, hasInternalAccess: ${auth.hasInternalAccess})`)
        throw new Error('Insufficient permissions')
      }
      
      // All good - allow access
      console.log(`✅ Authenticated access to ${pathname}`)
      return NextResponse.next()
      
    } catch (error) {
      console.error('Auth error:', error)
      
      // Redirect to hub login with return URL
      const hubUrl = process.env.NODE_ENV === 'production' ? 'https://hub.kroescontrol.nl' : 'http://localhost:3002'
      const loginUrl = new URL('/login', hubUrl)
      loginUrl.searchParams.set('redirect', request.url)
      
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // Public routes - allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|img/).*)',
  ],
}