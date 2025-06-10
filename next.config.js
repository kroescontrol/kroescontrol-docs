const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
  defaultShowCopyCode: true,
  staticImage: true
})

module.exports = withNextra({
  images: {
    unoptimized: true
  }
})