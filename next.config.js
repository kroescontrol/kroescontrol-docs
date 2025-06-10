const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  staticImage: true
})

module.exports = withNextra({
  output: 'standalone',
  images: {
    unoptimized: true
  },
  // Alleen public docs content serveren
  async redirects() {
    return [
      {
        source: '/internal/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/finance/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/operation/:path*',
        destination: '/',
        permanent: false,
      }
    ]
  }
})