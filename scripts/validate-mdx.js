#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const glob = require('fast-glob');

// Common MDX issues that cause runtime errors
const MDX_VALIDATION_RULES = [
  {
    name: 'Invalid Nextra imports',
    pattern: /import\s*{[^}]*}\s*from\s*['"]nextra\/components['"]/g,
    message: 'Nextra component imports are not supported in App Router. Use React components or remove import.',
    severity: 'error'
  },
  {
    name: 'Invalid Nextra/Docs imports',
    pattern: /import\s*{[^}]*}\s*from\s*['"]nextra-theme-docs['"]/g,
    message: 'Nextra theme imports not supported in App Router',
    severity: 'error'
  },
  {
    name: 'Missing React in scope',
    pattern: /<(Callout|Cards|Card|Tab|Tabs|Steps|FileTree)[^>]*>/g,
    message: 'Component used without import. This will cause "Element type is invalid" error.',
    severity: 'error'
  },
  {
    name: 'Unclosed JSX tags',
    pattern: /<(\w+)(?:\s[^>]*)?>(?!.*<\/\1>)/g,
    message: 'Potentially unclosed JSX tag',
    severity: 'warning'
  },
  {
    name: 'Invalid style syntax',
    pattern: /style=["'][^"']*["']/g,
    message: 'Style should be an object: style={{...}}',
    severity: 'warning'
  },
  {
    name: 'HTML entities in JSX',
    pattern: /&nbsp;|&quot;|&apos;|&lt;|&gt;/g,
    message: 'HTML entities may cause hydration errors in React',
    severity: 'warning'
  }
];

async function validateMDXFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const issues = [];
  
  // Check each validation rule
  for (const rule of MDX_VALIDATION_RULES) {
    const matches = content.match(rule.pattern);
    if (matches) {
      // Find line numbers for each match
      const lines = content.split('\n');
      matches.forEach(match => {
        let lineNumber = 0;
        let charCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (content.indexOf(match, charCount) < charCount + lines[i].length + 1) {
            lineNumber = i + 1;
            break;
          }
          charCount += lines[i].length + 1;
        }
        
        issues.push({
          file: filePath,
          line: lineNumber,
          rule: rule.name,
          message: rule.message,
          severity: rule.severity,
          match: match.substring(0, 50) + (match.length > 50 ? '...' : '')
        });
      });
    }
  }
  
  // Check for component usage without imports
  const componentPattern = /<(Callout|Cards|Card|Tab|Tabs|Steps|FileTree)(?:\s[^>]*)?>/g;
  const importPattern = /import\s*{([^}]*)}\s*from/g;
  
  const usedComponents = [...new Set((content.match(componentPattern) || []).map(m => m.match(/<(\w+)/)[1]))];
  const importedComponents = [];
  
  let importMatch;
  while ((importMatch = importPattern.exec(content)) !== null) {
    importedComponents.push(...importMatch[1].split(',').map(c => c.trim()));
  }
  
  usedComponents.forEach(component => {
    if (!importedComponents.includes(component)) {
      const usage = content.match(new RegExp(`<${component}[^>]*>`, 'g'));
      if (usage) {
        issues.push({
          file: filePath,
          line: content.substring(0, content.indexOf(usage[0])).split('\n').length,
          rule: 'Missing import',
          message: `Component "${component}" used without import`,
          severity: 'error',
          match: usage[0]
        });
      }
    }
  });
  
  return issues;
}

async function validateAllMDXFiles() {
  console.log('🔍 Validating MDX files in docs/app directory...\n');
  
  const files = await glob('app/**/*.{md,mdx}', {
    cwd: path.join(process.cwd()),
    absolute: true,
    ignore: ['**/node_modules/**', '**/_archive/**']
  });
  
  console.log(`Found ${files.length} MDX files to validate\n`);
  
  let totalIssues = 0;
  let errorCount = 0;
  let warningCount = 0;
  const fileIssues = {};
  
  for (const file of files) {
    const issues = await validateMDXFile(file);
    if (issues.length > 0) {
      fileIssues[file] = issues;
      totalIssues += issues.length;
      errorCount += issues.filter(i => i.severity === 'error').length;
      warningCount += issues.filter(i => i.severity === 'warning').length;
    }
  }
  
  // Display results
  if (totalIssues === 0) {
    console.log('✅ All MDX files are valid!\n');
    return;
  }
  
  console.log(`Found ${totalIssues} issues (${errorCount} errors, ${warningCount} warnings)\n`);
  
  // Group by severity
  const errors = [];
  const warnings = [];
  
  Object.entries(fileIssues).forEach(([file, issues]) => {
    issues.forEach(issue => {
      if (issue.severity === 'error') {
        errors.push(issue);
      } else {
        warnings.push(issue);
      }
    });
  });
  
  // Display errors first
  if (errors.length > 0) {
    console.log('❌ ERRORS (will cause runtime failures):\n');
    errors.forEach(issue => {
      const relativePath = path.relative(process.cwd(), issue.file);
      console.log(`  ${relativePath}:${issue.line}`);
      console.log(`    Rule: ${issue.rule}`);
      console.log(`    ${issue.message}`);
      console.log(`    Found: ${issue.match}\n`);
    });
  }
  
  // Display warnings
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    warnings.forEach(issue => {
      const relativePath = path.relative(process.cwd(), issue.file);
      console.log(`  ${relativePath}:${issue.line}`);
      console.log(`    Rule: ${issue.rule}`);
      console.log(`    ${issue.message}`);
      console.log(`    Found: ${issue.match}\n`);
    });
  }
  
  // Summary
  console.log('📊 Summary:');
  console.log(`  Files with issues: ${Object.keys(fileIssues).length}`);
  console.log(`  Total errors: ${errorCount}`);
  console.log(`  Total warnings: ${warningCount}`);
  
  // Exit with error code if errors found
  if (errorCount > 0) {
    console.log('\n❌ Fix errors before deployment to prevent runtime failures!');
    process.exit(1);
  }
}

// Run validation
validateAllMDXFiles().catch(console.error);