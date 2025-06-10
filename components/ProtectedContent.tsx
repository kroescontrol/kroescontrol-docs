import { useAuthContext } from '../contexts/AuthContext'
import { ReactNode } from 'react'

interface ProtectedContentProps {
  children: ReactNode
  section?: 'internal' | 'finance' | 'operation'
  fallback?: ReactNode
}

export function ProtectedContent({ 
  children, 
  section = 'internal',
  fallback 
}: ProtectedContentProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext()

  if (isLoading) {
    return (
      <div className="nx-p-4 nx-text-center nx-text-gray-500 dark:nx-text-gray-400">
        Toegang controleren...
      </div>
    )
  }

  if (!isAuthenticated) {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
    const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://hub.kroescontrol.nl')
    const loginUrl = `${hubUrl}/login?redirect=${encodeURIComponent(currentUrl)}`
    
    return fallback || (
      <div className="nx-my-8 nx-rounded-lg nx-border-2 nx-border-orange-200 nx-bg-orange-50 nx-p-6 dark:nx-border-orange-800 dark:nx-bg-orange-900/20">
        <h3 className="nx-mb-2 nx-text-xl nx-font-semibold">
          Authenticatie Vereist
        </h3>
        <p className="nx-mb-4 nx-text-gray-600 dark:nx-text-gray-400">
          Deze documentatie is alleen toegankelijk voor geautoriseerde gebruikers.
        </p>
        <a 
          href={loginUrl}
          className="nx-inline-flex nx-items-center nx-rounded-md nx-bg-blue-600 nx-px-4 nx-py-2 nx-text-sm nx-font-medium nx-text-white hover:nx-bg-blue-700"
        >
          Inloggen via Kroescontrol Hub
        </a>
      </div>
    )
  }

  // Check section permissions
  if (section && !hasAccess(user, section)) {
    return (
      <div className="nx-my-8 nx-rounded-lg nx-border-2 nx-border-red-200 nx-bg-red-50 nx-p-6 dark:nx-border-red-800 dark:nx-bg-red-900/20">
        <h3 className="nx-text-xl nx-font-semibold">Geen Toegang</h3>
        <p className="nx-text-gray-600 dark:nx-text-gray-400">
          Je hebt geen toegang tot deze sectie.
        </p>
      </div>
    )
  }

  return <>{children}</>
}

function hasAccess(user: any, section: string): boolean {
  // Check of user roles array de benodigde section bevat
  return user?.roles?.includes(section) || user?.role === 'admin'
}