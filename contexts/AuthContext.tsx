import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  error: string | null
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}