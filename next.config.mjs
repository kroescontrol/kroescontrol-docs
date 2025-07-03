import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  codeHighlight: true
})

export default withNextra({
  images: {
    unoptimized: true
  }
})