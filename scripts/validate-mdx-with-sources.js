#!/usr/bin/env node

/**
 * Enhanced MDX validation that shows source file locations
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// Map synced content back to source locations
const SOURCE_MAPPING = {
  'app/internal/': {
    source: 'apphub/docs-internal/',
    repo: 'kroescontrol-apphub',
    note: 'Fix in apphub repository'
  },
  'app/operation/': {
    source: 'vault/docs-operation/',
    repo: 'kroescontrol-vault',
    note: 'MT-only repository - vraag MT team'
  },
  'app/finance/': {
    source: 'vault/docs-finance/',
    repo: 'kroescontrol-vault', 
    note: 'MT-only repository - vraag MT team'
  },
  'app/public/': {
    source: 'docs/app/public/',
    repo: 'kroescontrol-docs',
    note: 'Fix in deze repository'
  }
};

function getSourceLocation(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  for (const [prefix, mapping] of Object.entries(SOURCE_MAPPING)) {
    if (relativePath.startsWith(prefix)) {
      const sourcePath = relativePath.replace(prefix, mapping.source);
      return {
        ...mapping,
        sourcePath: sourcePath
      };
    }
  }
  
  return {
    source: relativePath,
    repo: 'kroescontrol-docs',
    note: 'Fix in deze repository',
    sourcePath: relativePath
  };
}

async function validateMdxFile(filePath) {
  const issues = [];
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Check for undefined components
    const componentPatterns = [
      { pattern: /<(Callout|Cards|Card|Steps|Tabs|Tab|FileTree|CardHeader|CardTitle|CardContent)\s/g, name: 'Component usage' },
      { pattern: /<(Callout|Cards|Card|Steps|Tabs|Tab|FileTree|CardHeader|CardTitle|CardContent)>/g, name: 'Component usage' }
    ];
    
    for (const { pattern, name } of componentPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        const lineNumber = content.substring(0, content.indexOf(matches[0])).split('\n').length;
        issues.push({
          file: relativePath,
          line: lineNumber,
          type: 'error',
          message: `Missing component: ${matches[0]}`,
          fix: 'Component needs to be imported or replaced with HTML'
        });
      }
    }
    
    // Check for hydration issues
    const contentWithoutCodeBlocks = content.replace(/`[^`]+`/g, '').replace(/```[\s\S]*?```/g, '');
    
    if (contentWithoutCodeBlocks.match(/<p[^>]*>[\s\S]*?<p[^>]*>/g)) {
      issues.push({
        file: relativePath,
        type: 'warning',
        message: 'Nested <p> tags found',
        fix: 'Remove nested paragraph tags'
      });
    }
    
    if (contentWithoutCodeBlocks.match(/<div>\s*<span>/g)) {
      issues.push({
        file: relativePath,
        type: 'warning', 
        message: '<div><span> construction can cause hydration errors',
        fix: 'Use <p> instead of <div><span>'
      });
    }
    
  } catch (err) {
    issues.push({
      file: filePath,
      type: 'error',
      message: `Could not read file: ${err.message}`,
      fix: 'Ensure file exists and is readable'
    });
  }
  
  return issues;
}

async function main() {
  console.log(`${colors.blue}🔍 MDX Validation with Source Mapping${colors.reset}\n`);
  
  // Find all MDX files
  const mdxFiles = await glob('app/**/*.{md,mdx}', {
    cwd: process.cwd(),
    absolute: true,
    ignore: ['**/node_modules/**', '**/.next/**']
  });
  
  console.log(`Found ${mdxFiles.length} MDX files to validate\n`);
  
  const allIssues = [];
  const issuesBySource = new Map();
  
  // Validate each file
  for (const file of mdxFiles) {
    const issues = await validateMdxFile(file);
    if (issues.length > 0) {
      const sourceInfo = getSourceLocation(file);
      
      for (const issue of issues) {
        issue.sourceInfo = sourceInfo;
        allIssues.push(issue);
        
        // Group by source repository
        const key = sourceInfo.repo;
        if (!issuesBySource.has(key)) {
          issuesBySource.set(key, []);
        }
        issuesBySource.get(key).push({ ...issue, sourceInfo });
      }
    }
  }
  
  // Report results grouped by source repository
  if (allIssues.length === 0) {
    console.log(`${colors.green}✅ No MDX issues found!${colors.reset}\n`);
    return;
  }
  
  const errors = allIssues.filter(i => i.type === 'error');
  const warnings = allIssues.filter(i => i.type === 'warning');
  
  console.log(`Found ${colors.red}${errors.length} errors${colors.reset} and ${colors.yellow}${warnings.length} warnings${colors.reset}\n`);
  
  // Group issues by repository
  for (const [repo, issues] of issuesBySource) {
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}Repository: ${repo}${colors.reset}\n`);
    
    const repoErrors = issues.filter(i => i.type === 'error');
    const repoWarnings = issues.filter(i => i.type === 'warning');
    
    if (repoErrors.length > 0) {
      console.log(`${colors.red}ERRORS (${repoErrors.length}):${colors.reset}`);
      for (const issue of repoErrors) {
        console.log(`\n${colors.red}❌ ${issue.file}${issue.line ? `:${issue.line}` : ''}${colors.reset}`);
        console.log(`   ${issue.message}`);
        console.log(`   ${colors.magenta}→ SOURCE: ${issue.sourceInfo.sourcePath}${colors.reset}`);
        console.log(`   ${colors.yellow}→ ${issue.sourceInfo.note}${colors.reset}`);
        console.log(`   ${colors.blue}Fix: ${issue.fix}${colors.reset}`);
      }
    }
    
    if (repoWarnings.length > 0) {
      console.log(`\n${colors.yellow}WARNINGS (${repoWarnings.length}):${colors.reset}`);
      for (const issue of repoWarnings) {
        console.log(`\n${colors.yellow}⚠️  ${issue.file}${colors.reset}`);
        console.log(`   ${issue.message}`);
        console.log(`   ${colors.magenta}→ SOURCE: ${issue.sourceInfo.sourcePath}${colors.reset}`);
        console.log(`   ${colors.yellow}→ ${issue.sourceInfo.note}${colors.reset}`);
        console.log(`   ${colors.blue}Fix: ${issue.fix}${colors.reset}`);
      }
    }
  }
  
  // Summary with clear action items
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}ACTIES VEREIST:${colors.reset}\n`);
  
  if (issuesBySource.has('kroescontrol-docs')) {
    console.log(`${colors.green}1. Deze repository (kroescontrol-docs):${colors.reset}`);
    console.log(`   - ${issuesBySource.get('kroescontrol-docs').length} issues om direct te fixen`);
    console.log(`   - Files staan in app/public/\n`);
  }
  
  if (issuesBySource.has('kroescontrol-apphub')) {
    console.log(`${colors.blue}2. AppHub repository:${colors.reset}`);
    console.log(`   - ${issuesBySource.get('kroescontrol-apphub').length} issues`);
    console.log(`   - Fix in: ../apphub/docs-internal/`);
    console.log(`   - Na fix: commit in apphub, dan hier npm run sync-internal\n`);
  }
  
  if (issuesBySource.has('kroescontrol-vault')) {
    console.log(`${colors.red}3. Vault repository (MT-only):${colors.reset}`);
    console.log(`   - ${issuesBySource.get('kroescontrol-vault').length} issues`);
    console.log(`   - Vraag MT team om deze te fixen`);
    console.log(`   - Locaties: vault/docs-operation/ en vault/docs-finance/\n`);
  }
  
  console.log(`${colors.magenta}TIP: Run dit script opnieuw na fixes om voortgang te zien${colors.reset}\n`);
  
  // Exit with error if there are errors
  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colors.red}Script failed: ${err.message}${colors.reset}`);
  process.exit(1);
});