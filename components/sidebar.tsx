'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/' },
  { 
    name: 'Publiek', 
    href: '/public',
    children: [
      { name: 'Over Kroescontrol', href: '/public/over-kroescontrol' },
      { name: 'Informatieorganisatie', href: '/public/informatieorganisatie' },
      { name: 'Kennismaking', href: '/public/kennismaking' },
      { name: 'Werken bij', href: '/public/werken-bij' },
      { name: 'Kantoor', href: '/public/kantoor' },
      { name: 'Bezoekers', href: '/public/bezoekers' },
      { name: 'Cultuur', href: '/public/cultuur' },
      { name: 'Klanten', href: '/public/klanten' },
      { name: 'Branding', href: '/public/branding' },
      { name: 'Contact', href: '/public/contact' },
    ]
  },
  { 
    name: 'Branding', 
    href: '/public/branding',
    children: [
      { name: 'Beeldmerk', href: '/public/branding/beeldmerk' },
      { name: 'Logo', href: '/public/branding/logo' },
      { name: 'Kleuren', href: '/public/branding/kleuren' },
      { name: 'Downloads', href: '/public/branding/downloads' },
    ]
  },
  { name: 'Intern', href: '/internal' },
  { name: 'Operatie', href: '/operation' },
  { name: 'Finance', href: '/finance' },
  { name: 'Auth Test', href: '/auth-test' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Publiek', 'Branding'])
  
  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }
  
  return (
    <div className="sidebar">
      <nav>
        <ul>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems.includes(item.name)
            
            return (
              <li key={item.href}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
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
                    className={isActive ? 'active' : ''}
                    style={{ flex: 1 }}
                  >
                    {item.name}
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
                            className={isChildActive ? 'active' : ''}
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
      </nav>
      
      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 250px;
          height: 100vh;
          background: #f8f9fa;
          padding: 20px;
          border-right: 1px solid #e5e7eb;
          overflow-y: auto;
        }
        
        nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        nav li {
          margin-bottom: 8px;
        }
        
        nav a {
          display: block;
          padding: 8px 12px;
          color: #374151;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        nav a:hover {
          background: #e5e7eb;
          color: #E4007C;
        }
        
        nav a.active {
          background: rgba(228, 0, 124, 0.1);
          color: #E4007C;
          font-weight: 600;
        }
        
        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .expand-btn:hover {
          color: #E4007C;
        }
        
        .sub-menu {
          list-style: none;
          padding-left: 28px;
          margin: 4px 0;
        }
        
        .sub-menu li {
          margin-bottom: 4px;
        }
        
        .sub-menu a {
          padding: 6px 12px;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}