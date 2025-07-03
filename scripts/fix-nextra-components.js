#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const glob = require('fast-glob');

// Component replacement templates
const COMPONENT_REPLACEMENTS = {
  // Callout replacements with different types
  callout: {
    pattern: /<Callout(?:\s+type=["'](\w+)["'])?\s*>([\s\S]*?)<\/Callout>/g,
    replacement: (match, type, content) => {
      const styles = {
        warning: {
          backgroundColor: '#fff3cd',
          borderColor: '#ffeeba',
          color: '#856404',
          icon: '⚠️'
        },
        info: {
          backgroundColor: '#e3f2fd',
          borderColor: '#90caf9',
          color: '#1565c0',
          icon: 'ℹ️'
        },
        error: {
          backgroundColor: '#ffebee',
          borderColor: '#ffcdd2',
          color: '#c62828',
          icon: '❌'
        },
        success: {
          backgroundColor: '#e8f5e9',
          borderColor: '#a5d6a7',
          color: '#2e7d32',
          icon: '✅'
        },
        default: {
          backgroundColor: '#f5f5f5',
          borderColor: '#e0e0e0',
          color: '#424242',
          icon: '📌'
        }
      };
      
      const style = styles[type] || styles.default;
      
      return `<div style={{
  backgroundColor: '${style.backgroundColor}',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
  border: '1px solid ${style.borderColor}',
  color: '${style.color}'
}}>
  ${style.icon} ${content.trim()}
</div>`;
    }
  },
  
  // Cards grid replacement
  cards: {
    pattern: /<Cards>([\s\S]*?)<\/Cards>/g,
    replacement: (match, content) => {
      // Extract individual cards
      const cardPattern = /<Card\s+title=["']([^"']+)["'](?:\s+href=["']([^"']+)["'])?\s*>([^<]*)<\/Card>/g;
      let cards = [];
      let cardMatch;
      
      while ((cardMatch = cardPattern.exec(content)) !== null) {
        cards.push({
          title: cardMatch[1],
          href: cardMatch[2] || '#',
          description: cardMatch[3].trim()
        });
      }
      
      if (cards.length === 0) return '';
      
      const cardsHtml = cards.map(card => `  <a href="${card.href}" style={{
    display: 'block',
    padding: '20px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.2s'
  }}>
    <h3 style={{margin: '0 0 8px 0'}}>${card.title}</h3>
    <p style={{margin: 0, color: '#6b7280'}}>${card.description}</p>
  </a>`).join('\n  \n');
      
      return `<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  marginTop: '20px',
  marginBottom: '30px'
}}>
${cardsHtml}
</div>`;
    }
  },
  
  // Single Card replacement (for cards not in Cards wrapper)
  card: {
    pattern: /<Card\s+title=["']([^"']+)["'](?:\s+href=["']([^"']+)["'])?\s*>([^<]*)<\/Card>/g,
    replacement: (match, title, href, description) => {
      return `<a href="${href || '#'}" style={{
  display: 'block',
  padding: '20px',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'all 0.2s',
  marginBottom: '16px'
}}>
  <h3 style={{margin: '0 0 8px 0'}}>${title}</h3>
  <p style={{margin: 0, color: '#6b7280'}}>${description.trim()}</p>
</a>`;
    }
  },
  
  // Tabs replacement
  tabs: {
    pattern: /<Tabs\s+items=\{(\[[^\]]+\])\}>([\s\S]*?)<\/Tabs>/g,
    replacement: (match, items, content) => {
      // For now, just show all tab content sequentially
      return `<div style={{marginTop: '20px', marginBottom: '20px'}}>
  <div style={{borderBottom: '1px solid #e5e7eb', marginBottom: '20px'}}>
    <!-- Tab navigation would go here -->
  </div>
  ${content.trim()}
</div>`;
    }
  },
  
  // Tab replacement
  tab: {
    pattern: /<Tab>([\s\S]*?)<\/Tab>/g,
    replacement: (match, content) => {
      return `<div style={{padding: '20px 0'}}>
  ${content.trim()}
</div>`;
    }
  },
  
  // Steps replacement
  steps: {
    pattern: /<Steps>([\s\S]*?)<\/Steps>/g,
    replacement: (match, content) => {
      // Convert to ordered list with custom styling
      const items = content.trim().split('\n').filter(line => line.trim().startsWith('###'));
      const listItems = items.map((item, index) => {
        const title = item.replace(/^###\s*/, '');
        return `<li style={{marginBottom: '16px', paddingLeft: '8px'}}>
    <strong>Stap ${index + 1}:</strong> ${title}
  </li>`;
      }).join('\n  ');
      
      return `<ol style={{
  counterReset: 'step-counter',
  listStyle: 'none',
  paddingLeft: '0',
  marginTop: '20px',
  marginBottom: '20px'
}}>
  ${listItems}
</ol>`;
    }
  },
  
  // FileTree replacement
  filetree: {
    pattern: /<FileTree>([\s\S]*?)<\/FileTree>/g,
    replacement: (match, content) => {
      return `<pre style={{
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  overflow: 'auto',
  fontSize: '14px',
  lineHeight: '1.5'
}}>${content.trim()}</pre>`;
    }
  },
  
  // TableOfContents replacement - just remove it
  tableofcontents: {
    pattern: /<TableOfContents\s*\/>/g,
    replacement: () => {
      return '<!-- TableOfContents removed - not supported in App Router -->';
    }
  },
  
  // useConfig hook usage - comment it out
  useconfig: {
    pattern: /const\s*{\s*title\s*}\s*=\s*useConfig\(\)/g,
    replacement: (match) => {
      return '// ' + match + ' // useConfig not supported in App Router';
    }
  }
};

// Fix a single MDX file
async function fixMDXFile(filePath, options = {}) {
  const content = await fs.readFile(filePath, 'utf-8');
  let fixedContent = content;
  const fixes = [];
  
  // Remove Nextra imports (multiple patterns)
  const importPatterns = [
    /import\s*{\s*([^}]+)\s*}\s*from\s*['"]nextra\/components['"]\s*;?\s*\n?/g,
    /import\s*{\s*([^}]+)\s*}\s*from\s*['"]nextra-theme-docs['"]\s*;?\s*\n?/g,
  ];
  
  for (const importPattern of importPatterns) {
    const matches = [...fixedContent.matchAll(importPattern)];
    if (matches.length > 0) {
      matches.forEach(match => {
        fixedContent = fixedContent.replace(match[0], '');
        fixes.push({
          type: 'import',
          original: match[0].trim(),
          replacement: '(removed)'
        });
      });
    }
  }
  
  // Apply component replacements
  for (const [name, replacement] of Object.entries(COMPONENT_REPLACEMENTS)) {
    let matches = 0;
    const originalContent = fixedContent;
    
    fixedContent = fixedContent.replace(replacement.pattern, (...args) => {
      matches++;
      return replacement.replacement(...args);
    });
    
    if (matches > 0) {
      fixes.push({
        type: 'component',
        name: name,
        count: matches
      });
    }
  }
  
  // Only write if changes were made
  if (fixes.length > 0) {
    if (!options.dryRun) {
      // Create backup
      if (options.backup) {
        const backupPath = filePath + '.backup';
        await fs.writeFile(backupPath, content);
      }
      
      // Write fixed content
      await fs.writeFile(filePath, fixedContent);
    }
    
    return {
      file: filePath,
      fixes: fixes,
      changed: true
    };
  }
  
  return {
    file: filePath,
    fixes: [],
    changed: false
  };
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    backup: !args.includes('--no-backup'),
    verbose: args.includes('--verbose')
  };
  
  console.log('🔧 Nextra Component Fix Script\n');
  
  if (options.dryRun) {
    console.log('🔍 Running in DRY RUN mode - no files will be modified\n');
  }
  
  // Find all MDX files
  const files = await glob('app/**/*.{md,mdx}', {
    cwd: process.cwd(),
    absolute: true,
    ignore: ['**/node_modules/**', '**/_archive/**']
  });
  
  console.log(`Found ${files.length} MDX files to check\n`);
  
  const results = [];
  let totalFixed = 0;
  
  // Process each file
  for (const file of files) {
    const result = await fixMDXFile(file, options);
    results.push(result);
    
    if (result.changed) {
      totalFixed++;
      const relativePath = path.relative(process.cwd(), file);
      console.log(`✅ Fixed: ${relativePath}`);
      
      if (options.verbose || options.dryRun) {
        result.fixes.forEach(fix => {
          if (fix.type === 'import') {
            console.log(`   - Removed import statement`);
          } else if (fix.type === 'component') {
            console.log(`   - Replaced ${fix.count} <${fix.name.charAt(0).toUpperCase() + fix.name.slice(1)}> component(s)`);
          }
        });
      }
    }
  }
  
  // Summary report
  console.log('\n📊 Summary Report');
  console.log('================');
  console.log(`Total files scanned: ${files.length}`);
  console.log(`Files fixed: ${totalFixed}`);
  console.log(`Files unchanged: ${files.length - totalFixed}`);
  
  if (totalFixed > 0 && !options.dryRun) {
    console.log(`\n✅ All fixes applied successfully!`);
    if (options.backup) {
      console.log('📁 Backup files created with .backup extension');
    }
  }
  
  // Detailed report for dry run
  if (options.dryRun && totalFixed > 0) {
    console.log('\n📝 Detailed Fix Report');
    console.log('====================');
    
    results.filter(r => r.changed).forEach(result => {
      const relativePath = path.relative(process.cwd(), result.file);
      console.log(`\n${relativePath}:`);
      
      const componentFixes = {};
      result.fixes.forEach(fix => {
        if (fix.type === 'component') {
          componentFixes[fix.name] = (componentFixes[fix.name] || 0) + fix.count;
        }
      });
      
      if (result.fixes.some(f => f.type === 'import')) {
        console.log('  - Import statement removal');
      }
      
      Object.entries(componentFixes).forEach(([name, count]) => {
        const componentName = name.charAt(0).toUpperCase() + name.slice(1);
        console.log(`  - ${componentName}: ${count} replacement${count > 1 ? 's' : ''}`);
      });
    });
    
    console.log('\n💡 Run without --dry-run to apply these fixes');
  }
}

// Run the script
main().catch(console.error);