import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  codeHighlight: true,
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: []
  }
})

export default withNextra({
  images: {
    unoptimized: true
  }
})