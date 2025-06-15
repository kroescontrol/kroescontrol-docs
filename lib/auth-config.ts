import { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    // GitHub provider only if real credentials available (not dummy)
    ...(process.env.GITHUB_ID && 
        process.env.GITHUB_SECRET && 
        !process.env.GITHUB_ID.includes('dummy') ? [
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
        authorization: {
          params: {
            scope: 'read:user read:org'
          }
        }
      })
    ] : []),
    
    // Google provider only if real credentials available (not dummy)
    ...(process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET && 
        !process.env.GOOGLE_CLIENT_ID.includes('dummy') ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    
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
    async signIn({ user, account, profile }) {
      console.log('=== DOCS SIGN IN CALLBACK ===')
      console.log('Provider:', account?.provider)
      console.log('User email:', user?.email)
      
      // Allow development provider in development mode
      if (account?.provider === 'development') {
        console.log('✅ Development login allowed')
        return true
      }
      
      if (account?.provider === 'github') {
        if (!account?.access_token) {
          console.log('❌ No access token')
          return false
        }

        try {
          const githubUsername = (profile as any)?.login
          console.log('GitHub username:', githubUsername)
          
          if (!githubUsername) {
            console.log('❌ No GitHub username')
            return false
          }

          // Check GitHub org membership (same as hub/vault)
          const orgsResponse = await fetch(`https://api.github.com/orgs/kroescontrol/members/${githubUsername}`, {
            headers: {
              'Authorization': `token ${process.env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          })

          console.log('Org check status:', orgsResponse.status)
          const isKroescontrolMember = orgsResponse.status === 204
          
          if (!isKroescontrolMember) {
            console.log('❌ Not a kroescontrol member')
            return false
          }

          console.log('✅ Kroescontrol member verified')
          return true
        } catch (error) {
          console.log('❌ GitHub auth error:', error)
          return false
        }
      }

      if (account?.provider === 'google') {
        // For Google, check if email domain is kroescontrol.nl
        const email = user.email || ''
        const isKroescontrolEmail = email.endsWith('@kroescontrol.nl')

        if (!isKroescontrolEmail) {
          console.log(`❌ User ${email} is not using a kroescontrol.nl email`)
          return false
        }

        console.log('✅ Kroescontrol Google user verified')
        return true
      }

      return false
    },
    
    async jwt({ token, user, account, profile }) {
      if (user && account) {
        if (account.provider === 'github') {
          token.username = (profile as any)?.login
          token.roles = ['internal']
          token.role = 'member'
        } else if (account.provider === 'google') {
          token.username = user.email?.split('@')[0] || ''
          token.roles = ['internal']
          token.role = 'member'
        } else if (account.provider === 'development') {
          token.username = 'dev'
          token.roles = ['internal', 'operation', 'finance'] // Full access in dev
          token.role = 'admin'
        }
        token.provider = account.provider
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