const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
  defaultShowCopyCode: true,
  staticImage: true
})

module.exports = withNextra({
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