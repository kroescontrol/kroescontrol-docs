import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: (
    <>
      <img src="/public/branding/Logo/SVG/KC-logo-gradientKLEUR.svg" alt="Kroescontrol" style={{ height: 32 }} />
      <span style={{ marginLeft: '.4em', fontWeight: 800 }}>Docs</span>
    </>
  ),
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
    toggleButton: true
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
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Kroescontrol Documentatie" />
      <meta property="og:description" content="Officiële documentatie van Kroescontrol" />
      <link rel="icon" href="/public/branding/Beeldmerk/SVG/KC-beeldmerk-gradientKLEUR.svg" />
    </>
  ),
  banner: {
    key: 'nextra-migration',
    text: '🚀 Welkom bij de nieuwe Kroescontrol documentatie!'
  }
}

export default config