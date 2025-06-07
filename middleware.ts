import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only check auth for protected sections
  const protectedSections = ['/internal', '/finance', '/operation'];
  const isProtected = protectedSections.some(section => 
    path.startsWith(section)
  );
  
  if (!isProtected) {
    return NextResponse.next();
  }
  
  // Check auth via hub
  try {
    const authResponse = await fetch('https://hub.kroescontrol.nl/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({ path })
    });
    
    if (!authResponse.ok) {
      throw new Error('Auth service unavailable');
    }
    
    const auth = await authResponse.json();
    
    if (!auth.authenticated || !auth.hasAccess) {
      return NextResponse.redirect(
        `https://hub.kroescontrol.nl/login?redirect=${encodeURIComponent(request.url)}`
      );
    }
    
    return NextResponse.next();
    
  } catch (error) {
    console.error('Auth check failed:', error);
    
    // Fallback: redirect to hub login on any error
    return NextResponse.redirect(
      `https://hub.kroescontrol.nl/login?redirect=${encodeURIComponent(request.url)}`
    );
  }
}

export const config = {
  matcher: ['/internal/:path*', '/finance/:path*', '/operation/:path*']
};