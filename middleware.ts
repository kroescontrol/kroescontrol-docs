import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes die auth vereisen
const protectedPaths = [
  '/internal',
  '/finance', 
  '/operation'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if we're in production and trying to access freelancecontrol
  if (
    (process.env.NODE_ENV === 'production' || process.env.HIDE_FREELANCECONTROL === 'true') &&
    pathname.startsWith('/public/freelancecontrol')
  ) {
    // Redirect to home or show 404
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Voor protected paths, laat client-side auth het overnemen
  // We doen geen server-side redirect om loops te voorkomen
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  if (isProtected) {
    // Voeg header toe zodat we weten dat dit een protected route is
    const response = NextResponse.next()
    response.headers.set('x-protected-route', 'true')
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/public/freelancecontrol/:path*',
    '/internal/:path*',
    '/finance/:path*',
    '/operation/:path*'
  ]
}