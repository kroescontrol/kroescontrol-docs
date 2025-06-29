'use client'

import { useEffect, useState } from 'react'
import { getMenuForUser, MenuItem } from '../lib/menu-config'
import Link from 'next/link'

export function DynamicMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        const items = getMenuForUser(data.roles || [])
        setMenuItems(items)
      } catch (error) {
        console.error('Failed to fetch session:', error)
        // Show only public items on error
        setMenuItems(getMenuForUser([]))
      } finally {
        setLoading(false)
      }
    }
    
    fetchSession()
  }, [])
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return (
    <nav className="flex gap-4">
      {menuItems.map(item => (
        <Link 
          key={item.href} 
          href={item.href}
          className="hover:text-primary transition-colors"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}