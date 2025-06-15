import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    console.log("🔒 Protected route accessed:", req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Always allow public routes
        if (
          pathname.startsWith('/public') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          pathname === '/' ||
          pathname.startsWith('/over-kroescontrol') ||
          pathname.startsWith('/freelancecontrol') ||
          pathname.startsWith('/kantoor') ||
          pathname.startsWith('/werken-bij') ||
          pathname.startsWith('/contact')
        ) {
          return true
        }
        
        // Protected routes require authentication
        if (
          pathname.startsWith('/internal') ||
          pathname.startsWith('/operations') ||
          pathname.startsWith('/finance')
        ) {
          console.log("🔐 Checking auth for protected route:", pathname)
          console.log("Token present:", !!token)
          console.log("User roles:", token?.roles)
          
          // Require valid session for protected content
          return !!token
        }
        
        // Default: allow public access
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}