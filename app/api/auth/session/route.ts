import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('__Secure-kroescontrol-session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ 
        authenticated: false,
        user: null,
        roles: []
      })
    }
    
    // Verify session with hub
    const hubUrl = process.env.NODE_ENV === 'production' 
      ? 'https://hub.kroescontrol.nl' 
      : 'http://localhost:3002'
      
    const authResponse = await fetch(`${hubUrl}/api/auth/check-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionToken }),
    })
    
    if (!authResponse.ok) {
      return NextResponse.json({ 
        authenticated: false,
        user: null,
        roles: []
      })
    }
    
    const auth = await authResponse.json()
    
    // Extract roles from ACL
    const roles: string[] = []
    if (auth.acl?.engineer) roles.push('engineer')
    if (auth.acl?.operation) roles.push('operation')
    if (auth.acl?.finance) roles.push('finance')
    
    return NextResponse.json({
      authenticated: auth.valid,
      user: auth.user,
      roles: roles,
      hasInternalAccess: auth.hasInternalAccess
    })
    
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ 
      authenticated: false,
      user: null,
      roles: []
    })
  }
}