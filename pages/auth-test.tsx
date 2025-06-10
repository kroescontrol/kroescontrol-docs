import { useAuthContext } from '../contexts/AuthContext'
import { ProtectedContent } from '../components/ProtectedContent'

export default function AuthTestPage() {
  const auth = useAuthContext()

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Auth Test Page</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2>Current Auth State</h2>
        <pre style={{ 
          background: '#f4f4f4', 
          padding: '1rem', 
          borderRadius: '4px',
          overflow: 'auto' 
        }}>
{JSON.stringify({
  isAuthenticated: auth.isAuthenticated,
  isLoading: auth.isLoading,
  user: auth.user,
  error: auth.error
}, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Public Content</h2>
        <p>This content is always visible.</p>
      </section>

      <section>
        <h2>Protected Content</h2>
        <ProtectedContent>
          <div style={{ 
            background: '#e8f5e9', 
            padding: '1rem', 
            borderRadius: '4px',
            border: '2px solid #4caf50'
          }}>
            <h3>🎉 Success!</h3>
            <p>You are authenticated and can see this protected content.</p>
            {auth.user && (
              <p>Logged in as: <strong>{auth.user.email}</strong></p>
            )}
          </div>
        </ProtectedContent>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Debug Info</h3>
        <p>Check browser console for auth flow logs.</p>
        <button 
          onClick={() => auth.checkAuth()}
          style={{
            padding: '0.5rem 1rem',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Auth State
        </button>
      </section>
    </div>
  )
}