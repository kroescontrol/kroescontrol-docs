import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  error: string | null
}

interface UseAuthOptions {
  requireAuth?: boolean
  redirectTo?: string
}

export function useAuth(options?: UseAuthOptions) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Gebruik environment variable of fallback
      const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || 
        (process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000' 
          : 'https://hub.kroescontrol.nl')
      
      const response = await fetch(`${hubUrl}/api/auth/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          isAuthenticated: data.authenticated,
          isLoading: false,
          user: data.user,
          error: null
        })
      } else {
        throw new Error(`Not authenticated (status: ${response.status})`)
      }
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth check error:', error)
      }
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error instanceof Error ? error.message : 'Authentication failed'
      })

      // Alleen redirect als expliciet gevraagd
      if (options?.requireAuth && options?.redirectTo) {
        router.push(options.redirectTo)
      }
    }
  }

  return {
    ...authState,
    checkAuth
  }
}