import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

// Development mode check
const isDevelopment = process.env.NODE_ENV !== 'production'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const imagePath = path.join('/')
  
  // In development, allow all access
  if (isDevelopment) {
    return serveImage(imagePath)
  }

  // In production, check authentication via hub
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('kroescontrol-session') || 
                       cookieStore.get('__Secure-kroescontrol-session')

  if (!sessionCookie) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Verify with hub
  try {
    const authResponse = await fetch('https://hub.kroescontrol.nl/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStore.toString()
      },
      body: JSON.stringify({ 
        path: `/internal/${imagePath}` 
      })
    })

    const auth = await authResponse.json()

    if (!auth.authenticated || !auth.hasAccess) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    return serveImage(imagePath)
  } catch (error) {
    console.error('Auth verification failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function serveImage(imagePath: string) {
  try {
    // Construct the full path to the image
    const fullPath = path.join(process.cwd(), 'app', 'internal', imagePath)
    
    // Security check: prevent directory traversal
    if (!fullPath.startsWith(path.join(process.cwd(), 'app', 'internal'))) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('Not Found', { status: 404 })
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(fullPath)
    
    // Determine content type
    const ext = path.extname(fullPath).toLowerCase()
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream'

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Image serving error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}