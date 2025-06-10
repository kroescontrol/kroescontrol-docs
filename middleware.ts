import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if we're in production and trying to access freelancecontrol
  if (
    process.env.NODE_ENV === 'production' &&
    pathname.startsWith('/public/freelancecontrol')
  ) {
    // Redirect to home or show 404
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/public/freelancecontrol/:path*'
}