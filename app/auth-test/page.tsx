'use client'

import { useEffect, useState } from 'react'

export default function AuthTestPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data)
        setLoading(false)
      })
  }, [])
  
  const handleLogin = () => {
    const hubUrl = process.env.NODE_ENV === 'production' 
      ? 'https://hub.kroescontrol.nl' 
      : 'http://localhost:3002'
    window.location.href = `${hubUrl}/login?redirect=${encodeURIComponent(window.location.href)}`
  }
  
  const handleLogout = () => {
    const hubUrl = process.env.NODE_ENV === 'production' 
      ? 'https://hub.kroescontrol.nl' 
      : 'http://localhost:3002'
    window.location.href = `${hubUrl}/logout?redirect=${encodeURIComponent(window.location.origin)}`
  }
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Session Status:</h2>
        <pre className="bg-gray-100 p-4 rounded mt-2">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      
      <div className="flex gap-4">
        {!session?.authenticated ? (
          <button 
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Login via Hub
          </button>
        ) : (
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Test Protected Routes:</h2>
        <div className="flex gap-4">
          <a href="/internal" className="text-blue-500 hover:underline">Internal →</a>
          <a href="/operation" className="text-blue-500 hover:underline">Operation →</a>
          <a href="/finance" className="text-blue-500 hover:underline">Finance →</a>
        </div>
      </div>
    </div>
  )
}