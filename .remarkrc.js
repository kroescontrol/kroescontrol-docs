module.exports = {
  plugins: [
    'remark-preset-lint-recommended',
    ['remark-lint-no-html', false],
    // Custom rule to detect nested paragraphs
    () => (tree, file) => {
      const visit = require('unist-util-visit');
      
      visit(tree, 'paragraph', (node, index, parent) => {
        visit(node, 'paragraph', (child) => {
          file.message('Nested paragraph detected - this will cause hydration errors', child);
        });
      });
    }
  ]
};