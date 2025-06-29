declare module 'nextra-theme-docs' {
  export interface DocsThemeConfig {
    logo?: React.ReactNode
    project?: {
      link?: string
    }
    docsRepositoryBase?: string
    footer?: {
      component?: React.ComponentType
    }
    primaryHue?: {
      dark?: number
      light?: number
    }
    colors?: {
      primary?: {
        light?: string
        dark?: string
      }
      gray?: {
        light?: string
        dark?: string
      }
    }
    darkMode?: {
      toggleButton?: boolean
    }
    navigation?: {
      prev?: boolean
      next?: boolean
    }
    breadcrumb?: boolean
    search?: {
      placeholder?: string
      loading?: string
      error?: string
      emptyResult?: string
    }
    prefetch?: boolean
    toc?: {
      float?: boolean
      backToTop?: boolean
      extraContent?: React.ReactNode
      headingComponent?: React.ComponentType<{ children: React.ReactNode }>
    }
    components?: {
      img?: React.ComponentType<any>
    }
    navbar?: {
      extraContent?: React.ComponentType
    }
    sidebar?: {
      defaultMenuCollapseLevel?: number
      toggleButton?: boolean
      autoCollapse?: boolean
      titleComponent?: React.ComponentType<{
        title: string
        type: string
        route?: string
      }>
    }
    editLink?: {
      text?: string
    }
    feedback?: {
      content?: string
      labels?: string
    }
    useNextSeoProps?: () => any
    faviconGlyph?: string
  }
}