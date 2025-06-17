import { useSession } from 'next-auth/react'

/** @type {import('nextra-theme-docs').DocsThemeConfig} */
export default {
  logo: (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img src="/public/img/KC-beeldmerk-gradientKLEUR.svg" alt="Kroescontrol" style={{ height: '32px' }} />
      <span style={{ fontWeight: '600' }}>kroescontrol docs</span>
    </div>
  ),
  project: {
    link: 'https://github.com/kroescontrol',
  },
  docsRepositoryBase: 'https://github.com/kroescontrol/kroescontrol-docs',
  footer: {
    component: function Footer() {
      const buildId = process.env.NEXT_PUBLIC_BUILD_ID || 'dev-local';
      const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();
      const buildEnv = process.env.NEXT_PUBLIC_BUILD_ENV || 'dev';
      
      return (
        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          padding: '2rem 0',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            © 2025 Kroescontrol B.V. - Public Documentation
          </div>
          <div style={{ 
            textAlign: 'center', 
            fontSize: '12px',
            fontFamily: 'monospace',
            opacity: 0.7
          }}>
            Build: {buildId} | {new Date(buildTime).toLocaleString('nl-NL')} | {buildEnv}
          </div>
        </div>
      )
    }
  },
  primaryHue: {
    dark: 340, // Kroescontrol pink
    light: 227  // Kroescontrol navy
  },
  darkMode: true,
  navigation: {
    prev: true,
    next: true
  },
  navbar: {
    extraContent: function NavbarExtra() {
      const { data: session, status } = useSession()
      
      if (status === 'loading') return null
      
      if (session) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
            <span style={{ color: '#10b981' }}>✓ Ingelogd als {session.user?.name || session.user?.email}</span>
          </div>
        )
      }
      
      return (
        <a 
          href="https://hub.kroescontrol.nl/login?redirect=https://docs.kroescontrol.nl" 
          style={{ 
            padding: '6px 12px', 
            background: '#1e40af', 
            color: 'white', 
            borderRadius: '6px', 
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          Inloggen
        </a>
      )
    }
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
    titleComponent: ({ title, type, route }) => {
      const { data: session } = useSession()
      
      // Hide FreelanceControl in production
      if (
        (process.env.NODE_ENV === 'production' || process.env.HIDE_FREELANCECONTROL === 'true') &&
        title === 'Freelancecontrol'
      ) {
        return null
      }
      
      // Hide protected sections if not authenticated
      const protectedSections = ['Internal', 'Finance', 'Operations']
      if (protectedSections.includes(title) && !session) {
        return null
      }
      
      // Add lock icon for protected sections
      if (protectedSections.includes(title) && session) {
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔒 {title}
          </span>
        )
      }
      
      return title
    }
  },
  toc: {
    backToTop: true
  },
  editLink: {
    text: 'Bewerk deze pagina op GitHub →'
  },
  feedback: {
    content: 'Vragen? Geef ons feedback →',
    labels: 'feedback'
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Kroescontrol Docs'
    }
  },
  faviconGlyph: '🔧'
}