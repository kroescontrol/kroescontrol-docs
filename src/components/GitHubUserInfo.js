import React, { useState, useEffect } from 'react';

export default function GitHubUserInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/user-info')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Not authenticated');
      })
      .then(data => {
        setUserInfo(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <span>🔄 Loading user info...</span>;
  }

  if (error) {
    return (
      <div style={{
        padding: '8px 12px',
        borderRadius: '4px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        fontSize: '14px'
      }}>
        ❌ <strong>Niet ingelogd</strong>
      </div>
    );
  }

  return (
    <div style={{
      padding: '8px 12px',
      borderRadius: '4px',
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {userInfo.avatar_url && (
        <img 
          src={userInfo.avatar_url} 
          alt="Avatar"
          style={{ width: '20px', height: '20px', borderRadius: '50%' }}
        />
      )}
      <span>
        ✅ <strong>{userInfo.login}</strong> ({userInfo.name})
      </span>
      <a href="/logout" style={{ color: '#155724', textDecoration: 'underline', marginLeft: '10px' }}>
        Uitloggen
      </a>
    </div>
  );
}