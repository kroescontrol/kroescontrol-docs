import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hub domain for authentication
const HUB_DOMAIN = process.env.NEXT_PUBLIC_HUB_URL || 'https://hub.kroescontrol.nl'

// Protected routes die auth vereisen
const protectedPaths = [
  '/internal',
  '/finance', 
  '/operation'
]

// Helper function to get login URL
function getLoginUrl(callbackUrl: string): string {
  const url = new URL('/login', HUB_DOMAIN)
  // AppHub expects 'redirect' parameter
  url.searchParams.set('redirect', callbackUrl)
  return url.toString()
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if we're in production and trying to access freelancecontrol
  if (
    (process.env.NODE_ENV === 'production' || process.env.HIDE_FREELANCECONTROL === 'true') &&
    pathname.startsWith('/public/freelancecontrol')
  ) {
    // Redirect to home or show 404
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Check if path is protected
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  
  if (!isProtected) {
    return NextResponse.next()
  }

  // For protected paths, verify auth with hub
  const cookies = request.headers.get('cookie') || ''
  
  // Check if user has session cookie
  if (!cookies.includes('next-auth.session-token')) {
    // No session cookie, redirect to hub login
    const callbackUrl = request.url
    return NextResponse.redirect(getLoginUrl(callbackUrl))
  }

  try {
    // Verify with hub API
    const verifyUrl = new URL('/api/auth/verify', HUB_DOMAIN)
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ 
        path: pathname
      })
    })
    
    if (!response.ok) {
      console.log('Hub verification failed:', response.status)
      const callbackUrl = request.url
      return NextResponse.redirect(getLoginUrl(callbackUrl))
    }
    
    const data = await response.json()
    
    if (!data.authenticated || !data.hasAccess) {
      const callbackUrl = request.url
      return NextResponse.redirect(getLoginUrl(callbackUrl))
    }
    
    // User is authenticated and has access
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-email', data.user?.email || '')
    requestHeaders.set('x-user-roles', JSON.stringify(data.user?.roles || []))
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    })
  } catch (error) {
    console.error('Auth verification error:', error)
    // On error, redirect to login
    const callbackUrl = request.url
    return NextResponse.redirect(getLoginUrl(callbackUrl))
  }
}

export const config = {
  matcher: [
    '/public/freelancecontrol/:path*',
    '/internal/:path*',
    '/finance/:path*',
    '/operation/:path*'
  ]
}