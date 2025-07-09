const path = require('path');

module.exports = {
  // JavaScript/TypeScript linting (exclude lint-staged config)
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const filtered = filenames.filter(file => !file.endsWith('.lintstagedrc.js'));
    return filtered.length > 0 ? `eslint --fix --max-warnings 0 ${filtered.join(' ')}` : [];
  },
  
  // MDX validation and linting
  '**/*.mdx': [
    'eslint --fix --max-warnings 0',
    () => `node ${path.join(__dirname, '../scripts/validate-mdx-content.js')}`
  ],
  
  // TypeScript type checking
  '*.{ts,tsx}': () => 'tsc --noEmit --incremental false'
};