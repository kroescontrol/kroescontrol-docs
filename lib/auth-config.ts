import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    // Development fallback credentials provider
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        id: 'development',
        name: 'Development Login',
        credentials: {
          username: { label: "Username", type: "text", placeholder: "dev" },
          password: { label: "Password", type: "password", placeholder: "dev" }
        },
        async authorize(credentials) {
          // Simple dev login - accept any credentials in development
          console.log('Development login attempt:', { 
            username: credentials?.username, 
            hasPassword: !!credentials?.password 
          })
          
          if (credentials?.username === 'dev' && credentials?.password === 'dev') {
            console.log('✅ Development login successful')
            return {
              id: 'dev-user',
              email: 'dev@kroescontrol.nl',
              name: 'Development User',
            }
          }
          
          console.log('❌ Development login failed - wrong credentials')
          return null
        }
      })
    ] : []),
    // In productie: geen providers, alles via hub.kroescontrol.nl
  ],
  
  // Cookie configuratie voor cross-subdomain SSO
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        domain: process.env.NODE_ENV === 'production' ? '.kroescontrol.nl' : undefined,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60, // 8 uur - sync met hub
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        domain: process.env.NODE_ENV === 'production' ? '.kroescontrol.nl' : undefined,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60,
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production',
      },
    },
  },
  
  callbacks: {
    async signIn({ user, account }) {
      console.log('=== DOCS SIGN IN CALLBACK ===')
      console.log('Provider:', account?.provider)
      console.log('User email:', user?.email)
      
      // Allow development provider in development mode
      if (account?.provider === 'development') {
        console.log('✅ Development login allowed')
        return true
      }
      
      // In productie komt niemand hier, alles gaat via hub
      return false
    },
    
    async jwt({ token, user, account }) {
      if (user && account) {
        if (account.provider === 'development') {
          token.username = 'dev'
          token.roles = ['internal', 'operation', 'finance'] // Full access in dev
          token.role = 'admin'
          token.provider = account.provider
        }
        // In productie komt de sessie van hub met alle data al ingevuld
      }
      return token
    },
    
    async session({ session, token }) {
      session.user.id = token.sub!
      session.user.username = token.username
      session.user.roles = token.roles
      session.user.role = token.role
      session.user.provider = token.provider
      return session
    },
    
    async redirect({ url, baseUrl }) {
      console.log('🔄 Docs redirect callback:', { url, baseUrl })
      
      // If url is relative, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Allow redirects to same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // Allow redirects to kroescontrol.nl subdomains
      try {
        const redirectUrl = new URL(url)
        const allowedHosts = ['localhost', 'kroescontrol.nl']
        const hostname = redirectUrl.hostname
        const isAllowed = allowedHosts.some(host => 
          hostname === host || hostname.endsWith(`.${host}`)
        ) || hostname.includes('localhost')
        
        if (isAllowed) {
          console.log('✅ Redirect allowed to:', url)
          return url
        }
      } catch (error) {
        console.log('❌ Invalid redirect URL:', url)
      }
      
      // Default redirect to docs home
      return baseUrl
    }
  },
  
  
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 uur - sync met hub/vault
  }
}