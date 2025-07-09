'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
// Session type definition (next-auth is removed from this repo)
interface Session {
  user?: {
    name?: string
    email?: string
    roles?: string[]
  }
  hasInternalAccess?: boolean
}

interface NavigationItem {
  name: string
  href: string
  section?: 'public' | 'internal' | 'operation' | 'finance'
  roles?: string[]
  children?: NavigationItem[]
  icon?: string
}

const navigation: NavigationItem[] = [
  { 
    name: 'Home', 
    href: '/',
    section: 'public',
    icon: '🏠'
  },
  { 
    name: 'Publiek', 
    href: '/public',
    section: 'public',
    icon: '📚',
    children: [
      { name: 'Over Kroescontrol', href: '/public/over-kroescontrol' },
      { name: 'Informatieorganisatie', href: '/public/informatieorganisatie' },
      { name: 'Kennismaking', href: '/public/kennismaking' },
      { name: 'Werken bij', href: '/public/werken-bij' },
      { name: 'Kantoor', href: '/public/kantoor' },
      { name: 'Bezoekers', href: '/public/bezoekers' },
      { name: 'Cultuur', href: '/public/cultuur' },
      { name: 'Branding', href: '/public/branding' },
    ]
  },
  { 
    name: 'Intern', 
    href: '/internal',
    section: 'internal',
    icon: '🔐',
    roles: ['engineer', 'operation', 'finance'],
    children: [
      { name: 'HR & Personeelszaken', href: '/internal/hr' },
      { name: 'Onboarding', href: '/internal/onboarding' },
      { name: 'Budgetten', href: '/internal/budgetten' },
      { name: 'Verzekeringen', href: '/internal/verzekeringen' },
      { 
        name: 'Tools & Systemen', 
        href: '/internal/tools',
        children: [
          { name: 'HoorayHR', href: '/internal/tools/hoorayhr' },
          { name: 'Clockify', href: '/internal/tools/clockify' },
          { name: 'Mr. Green', href: '/internal/tools/mr-green' },
          { name: '1Password', href: '/internal/tools/1password' },
          { name: 'Google Workspace', href: '/internal/tools/google-workspace' },
          { name: 'HubSpot', href: '/internal/tools/hubspot' },
          { name: 'Engineer Hub', href: '/internal/tools/engineer-hub' },
          { name: 'Claude Code', href: '/internal/tools/claudecode' },
          { name: 'Control Hub', href: '/internal/tools/controlhub' },
          { name: 'Documentatie', href: '/internal/tools/documentatie' },
        ]
      },
      { name: 'Engineering', href: '/internal/engineering' },
    ]
  },
  { 
    name: 'Operatie', 
    href: '/operation',
    section: 'operation',
    icon: '⚙️',
    roles: ['operation'],
    children: [
      { name: 'Monitoring', href: '/operation/monitoring' },
      { name: 'Deployment', href: '/operation/deployment' },
      { name: 'Incidents', href: '/operation/incidents' },
    ]
  },
  { 
    name: 'Finance', 
    href: '/finance',
    section: 'finance',
    icon: '💰',
    roles: ['finance'],
    children: [
      { name: 'Rapportages', href: '/finance/rapportages' },
      { name: 'Budgetten', href: '/finance/budgetten' },
      { name: 'Facturen', href: '/finance/facturen' },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Publiek', 'Intern', 'Tools & Systemen'])
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data)
        setLoading(false)
      })
      .catch((_err) => {
        setLoading(false)
      })
  }, [])
  
  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }
  
  const hasAccess = (item: NavigationItem): boolean => {
    // In development mode, allow access to all sections
    if (process.env.NODE_ENV === 'development') return true
    
    // For internal section, check hasInternalAccess flag
    if (item.section === 'internal') {
      return session?.hasInternalAccess || false
    }
    
    // For other sections, check roles
    if (!item.roles || item.roles.length === 0) return true
    if (!session?.user?.roles) return false
    return item.roles.some(role => session.user?.roles?.includes(role) || false)
  }
  
  const getSectionItems = (section: string) => {
    return navigation.filter(item => 
      item.section === section && hasAccess(item)
    )
  }
  
  const renderSection = (title: string, section: string) => {
    const items = getSectionItems(section)
    if (items.length === 0) return null
    
    return (
      <div className="section" key={section}>
        <h3 className="section-title">{title}</h3>
        <ul>
          {items.map((item) => {
            const isActive = pathname === item.href
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems.includes(item.name)
            
            return (
              <li key={item.href}>
                <div className="nav-item">
                  <Link 
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    style={{ paddingLeft: hasChildren ? '8px' : '12px' }}
                  >
                    {hasChildren && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          toggleExpand(item.name)
                        }}
                        className="expand-btn"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    )}
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </div>
                
                {hasChildren && isExpanded && (
                  <ul className="sub-menu">
                    {item.children?.map((child) => {
                      const isChildActive = pathname === child.href
                      return (
                        <li key={child.href}>
                          <Link 
                            href={child.href}
                            className={`sub-link ${isChildActive ? 'active' : ''}`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="sidebar">
        <div className="loading">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Kroescontrol Docs</h2>
      </div>
      
      <nav>
        {/* Show Internal first if user has access */}
        {session?.hasInternalAccess && renderSection('Intern', 'internal')}
        {renderSection('Algemeen', 'public')}
        {/* Show Internal here if user doesn't have access (it won't render) */}
        {!session?.hasInternalAccess && renderSection('Intern', 'internal')}
        {renderSection('Operations', 'operation')}
        {renderSection('Financieel', 'finance')}
      </nav>
      
    </div>
  )
}