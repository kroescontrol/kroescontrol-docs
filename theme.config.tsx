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
  footer: {
    component: () => (
      <span>
        {new Date().getFullYear()} © Kroescontrol. Interne documentatie.
      </span>
    ),
  },
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
    backToTop: true,
  },
  navigation: {
    prev: true,
    next: true,
  },
  darkMode: {},
  search: {
    placeholder: 'Zoek in documentatie...',
  },
  useNextSeoProps() {
    const { asPath } = useRouter()
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – Kroescontrol Docs'
      }
    }
  },
}