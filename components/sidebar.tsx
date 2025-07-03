'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Session } from 'next-auth'

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
      { name: 'Procedures', href: '/internal/procedures' },
      { name: 'Tools', href: '/internal/tools' },
      { name: 'Resources', href: '/internal/resources' },
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
  const [expandedItems, setExpandedItems] = useState<string[]>(['Publiek'])
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])
  
  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }
  
  const hasAccess = (item: NavigationItem): boolean => {
    if (!item.roles || item.roles.length === 0) return true
    if (!session?.user?.roles) return false
    return item.roles.some(role => session.user.roles?.includes(role))
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
                  {hasChildren && (
                    <button 
                      onClick={() => toggleExpand(item.name)}
                      className="expand-btn"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  )}
                  <Link 
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </div>
                
                {hasChildren && isExpanded && (
                  <ul className="sub-menu">
                    {item.children.map((child) => {
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
        {renderSection('Algemeen', 'public')}
        {renderSection('Intern', 'internal')}
        {renderSection('Operations', 'operation')}
        {renderSection('Financieel', 'finance')}
      </nav>
      
      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 280px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }
        
        .sidebar-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.025em;
        }
        
        nav {
          flex: 1;
          padding: 16px 0;
        }
        
        .section {
          margin-bottom: 24px;
          padding: 0 12px;
        }
        
        .section-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          margin: 0 0 8px 12px;
          padding: 8px 0 4px 0;
        }
        
        nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        nav li {
          margin-bottom: 2px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          position: relative;
        }
        
        .nav-link {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          color: #4b5563;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.15s ease;
          font-size: 14px;
          font-weight: 500;
        }
        
        .nav-link:hover {
          background: #f3f4f6;
          color: #111827;
        }
        
        .nav-link.active {
          background: #fce7f3;
          color: #E4007C;
          font-weight: 600;
        }
        
        .nav-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }
        
        .expand-btn {
          position: absolute;
          left: -4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 6px;
          font-size: 10px;
          color: #9ca3af;
          transition: color 0.15s ease;
        }
        
        .expand-btn:hover {
          color: #6b7280;
        }
        
        .sub-menu {
          list-style: none;
          padding-left: 46px;
          margin: 2px 0 8px 0;
        }
        
        .sub-menu li {
          margin-bottom: 1px;
        }
        
        .sub-link {
          display: block;
          padding: 6px 12px;
          font-size: 13px;
          color: #6b7280;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        
        .sub-link:hover {
          background: #f9fafb;
          color: #374151;
        }
        
        .sub-link.active {
          background: #fce7f3;
          color: #E4007C;
          font-weight: 500;
        }
        
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          color: #6b7280;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}