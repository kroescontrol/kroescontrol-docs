/** @type {import('nextra-theme-docs').DocsThemeConfig} */
export default {
  logo: 'kroescontrol docs',
  project: {
    link: 'https://github.com/kroescontrol',
  },
  docsRepositoryBase: 'https://github.com/kroescontrol/kroescontrol-docs',
  footer: {
    text: '© 2025 Kroescontrol B.V. - Public Documentation',
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
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
    titleComponent: ({ title, type }) => {
      // Verberg FreelanceControl in productie
      if (
        (process.env.NODE_ENV === 'production' || process.env.HIDE_FREELANCECONTROL === 'true') &&
        title === 'Freelancecontrol'
      ) {
        return null
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
  banner: {
    key: 'nextra-migration',
    text: '🚀 Welkom bij de nieuwe Kroescontrol documentatie!'
  },
  faviconGlyph: '🔧'
}