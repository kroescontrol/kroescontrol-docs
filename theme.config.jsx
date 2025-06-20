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
            © 2025 Kroescontrol B.V.
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
    dark: 340, // Kroescontrol pink (#ff006c)
    light: 227  // Kroescontrol navy (#222b5b)
  },
  colors: {
    primary: {
      light: '#222b5b',  // Deep Navy Blue
      dark: '#ff006c'    // Pure Pink
    },
    gray: {
      light: '#6d8b9e',  // Soft Grey
      dark: '#e5e5e5'    // Extra light grey
    }
  },
  darkMode: {
    toggleButton: true  // Voegt een dark/light mode toggle button toe
  },
  navigation: {
    prev: true,
    next: true
  },
  breadcrumb: true,
  // Mobile optimalisaties
  search: {
    placeholder: '🔍 Zoeken...',
    loading: 'Laden...',
    error: 'Zoekfout',
    emptyResult: 'Geen resultaten gevonden'
  },
  // Prefetch voor snellere navigatie
  prefetch: true,
  // Mobile-friendly table of contents
  toc: {
    float: true,
    backToTop: true,
    extraContent: null,
    headingComponent: ({ children }) => <>{children}</>
  },
  // Responsive images
  components: {
    img: ({ src, alt, ...props }) => (
      <img 
        src={src} 
        alt={alt} 
        loading="lazy" 
        style={{ maxWidth: '100%', height: 'auto' }}
        {...props} 
      />
    )
  },
  navbar: {
    extraContent: function NavbarExtra() {
      // In development, show development mode indicator
      if (process.env.NODE_ENV !== 'production') {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#f59e0b', fontSize: '14px' }}>🔓 Development Mode</span>
            <a 
              href="http://localhost:3002/login"
              style={{ 
                padding: '6px 12px', 
                background: '#1e40af', 
                color: 'white', 
                borderRadius: '6px', 
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Inloggen (hub)
            </a>
          </div>
        )
      }
      
      // In production, simple login button
      const hubUrl = 'https://hub.kroescontrol.nl'
      const docsUrl = 'https://docs.kroescontrol.nl'
      
      return (
        <a 
          href={`${hubUrl}/login?redirect=${encodeURIComponent(docsUrl)}`}
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
    defaultMenuCollapseLevel: 2,  // Toont hoofdsecties uitgeklapt
    toggleButton: true,
    autoCollapse: false,  // Houdt meerdere secties open
    titleComponent: ({ title, type, route }) => {
      // Hide FreelanceControl in production
      if (
        (process.env.NODE_ENV === 'production' || process.env.HIDE_FREELANCECONTROL === 'true') &&
        title === 'Freelancecontrol'
      ) {
        return null
      }
      
      // Hide protected sections in production (they are handled by middleware)
      const protectedSections = ['🔒 Intern', '💰 Fin', '📊 Ops']
      if (protectedSections.includes(title) && process.env.NODE_ENV === 'production') {
        // In production, these sections are protected by middleware
        // Let them show - if user can't access, middleware will redirect
      }
      
      // Make folders clickable by wrapping in link
      if (type === 'folder' && route) {
        return (
          <a href={route} style={{ color: 'inherit', textDecoration: 'none' }}>
            {title}
          </a>
        )
      }
      
      return title
    }
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