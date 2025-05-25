import React, { useState, useEffect } from 'react';

export default function LoginStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for OAuth cookie
    const hasOAuthCookie = document.cookie
      .split(';')
      .some(cookie => cookie.trim().startsWith('github-oauth-access-token='));
    
    setIsLoggedIn(hasOAuthCookie);
    setLoading(false);
  }, []);

  if (loading) {
    return <span>🔄 Checking login status...</span>;
  }

  return (
    <div style={{
      padding: '8px 12px',
      borderRadius: '4px',
      backgroundColor: isLoggedIn ? '#d4edda' : '#f8d7da',
      color: isLoggedIn ? '#155724' : '#721c24',
      border: `1px solid ${isLoggedIn ? '#c3e6cb' : '#f5c6cb'}`,
      fontSize: '14px',
      display: 'inline-block'
    }}>
      {isLoggedIn ? (
        <>
          ✅ <strong>Ingelogd</strong> via GitHub OAuth
          <span style={{ marginLeft: '10px' }}>
            <a href="/logout" style={{ color: '#155724', textDecoration: 'underline' }}>
              Uitloggen
            </a>
          </span>
        </>
      ) : (
        <>
          ❌ <strong>Niet ingelogd</strong> - OAuth inactief
        </>
      )}
    </div>
  );
}