import { useRouter } from 'next/router'
import type { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: (
    <>
      <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>
        Kroescontrol Docs
      </span>
      <span 
        style={{ 
          marginLeft: '0.5rem',
          padding: '0.125rem 0.375rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: '#E4007C',
          color: 'white',
          borderRadius: '0.25rem'
        }}
      >
        Internal
      </span>
    </>
  ),
  project: {
    link: 'https://github.com/kroescontrol',
  },
  docsRepositoryBase: 'https://github.com/kroescontrol/docs',
  footer: (
    <span>
      {new Date().getFullYear()} © Kroescontrol. Interne documentatie.
    </span>
  ),
  editLink: {
    text: 'Bewerk deze pagina →',
  },
  feedback: {
    content: 'Vragen? Neem contact op →',
    labels: 'feedback',
  },
  primaryHue: {
    dark: 330,
    light: 330,
  },
  primarySaturation: {
    dark: 80,
    light: 73,
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span style={{ cursor: 'default', fontWeight: 600 }}>{title}</span>
      }
      return <>{title}</>
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    title: 'Op deze pagina',
    backToTop: true,
  },
  navigation: {
    prev: true,
    next: true,
  },
  darkMode: true,
  nextThemes: {
    defaultTheme: 'system',
  },
  search: {
    placeholder: 'Zoek in documentatie...',
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Kroescontrol Internal Docs" />
      <meta property="og:description" content="Interne documentatie voor Kroescontrol medewerkers" />
      <link rel="icon" href="/favicon.ico" />
    </>
  ),
  useNextSeoProps() {
    const { asPath } = useRouter()
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – Kroescontrol Docs'
      }
    }
  },
  banner: {
    key: 'internal-docs-beta',
    text: (
      <a href="/internal" target="_self">
        📍 Dit is de interne documentatie. Voor publieke docs → 
        <span style={{ marginLeft: '0.5rem', textDecoration: 'underline' }}>ga naar /public</span>
      </a>
    ),
  },
  gitTimestamp: ({ timestamp }) => (
    <>
      Laatst bijgewerkt op{' '}
      {timestamp.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}
    </>
  ),
}