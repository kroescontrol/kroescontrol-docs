#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

// Configuratie van docStatus regels (volgorde is belangrijk!)
const RULES = {
  locked: [
    // Specifieke _status.md bestanden eerst
    'docs-public/_status.md',
    'docs-internal/_status.md',
    'docs-operation/_status.md',
    'docs-finance/_status.md',
    // Dan directories
    'docs-internal/tools/claudecode/**/*.md'
  ],
  live: [
    // Specifieke directories eerst
    'docs-internal/tools/documentatie/**/*.md',
    // Dan algemene rules
    'docs-public/**/*.md'
  ],
  templated: [
    // Alle andere bestanden krijgen templated
  ]
};

// Kleuren voor console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  dim: '\x1b[2m'
};

function determineDocStatus(filePath) {
  // Check locked patterns eerst (meer specifiek)
  for (const pattern of RULES.locked) {
    if (matchesPattern(filePath, pattern)) {
      return 'locked';
    }
  }
  
  // Check live patterns daarna (meer algemeen)
  for (const pattern of RULES.live) {
    if (matchesPattern(filePath, pattern)) {
      return 'live';
    }
  }
  
  // Default to templated
  return 'templated';
}

function matchesPattern(filePath, pattern) {
  // Voor exacte bestandsnamen
  if (!pattern.includes('*') && !pattern.includes('?')) {
    return filePath === pattern;
  }
  
  // Converteer glob pattern naar regex
  let regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
    .replace(/\*\*/g, '@@GLOBSTAR@@') // Tijdelijke placeholder
    .replace(/\*/g, '[^/]*') // Single * matches alles behalve /
    .replace(/@@GLOBSTAR@@/g, '.*') // ** matches alles inclusief /
    .replace(/\?/g, '.'); // ? matches één karakter
    
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

function updateDocStatus(filePath, targetStatus, dryRun = false) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    
    const currentStatus = parsed.data.docStatus;
    
    // Skip als status al correct is
    if (currentStatus === targetStatus) {
      return { status: 'skipped', reason: 'already correct' };
    }
    
    // Update docStatus
    parsed.data.docStatus = targetStatus;
    
    if (!dryRun) {
      // Schrijf het bestand terug
      const newContent = matter.stringify(parsed.content, parsed.data);
      fs.writeFileSync(filePath, newContent);
    }
    
    return { 
      status: 'updated', 
      from: currentStatus || 'none',
      to: targetStatus 
    };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function processDirectory(dir, dryRun = false) {
  console.log(`\n${colors.blue}Processing ${dir}...${colors.reset}`);
  
  const stats = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    changes: []
  };
  
  // Vind alle markdown bestanden
  const files = glob.sync(`${dir}/**/*.md`, {
    ignore: ['**/node_modules/**', '**/old/**']
  });
  
  stats.total = files.length;
  
  files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    const targetStatus = determineDocStatus(relativePath);
    const result = updateDocStatus(file, targetStatus, dryRun);
    
    if (result.status === 'updated') {
      stats.updated++;
      stats.changes.push({
        file: relativePath,
        from: result.from,
        to: result.to
      });
      console.log(`${colors.green}✓${colors.reset} ${relativePath}: ${result.from || 'none'} → ${result.to}`);
    } else if (result.status === 'skipped') {
      stats.skipped++;
    } else if (result.status === 'error') {
      stats.errors++;
      console.log(`${colors.red}✗${colors.reset} ${relativePath}: ${result.error}`);
    }
  });
  
  // Print samenvatting
  console.log(`\n${colors.dim}Summary for ${dir}:${colors.reset}`);
  console.log(`  Total: ${stats.total}`);
  console.log(`  Updated: ${stats.updated}`);
  console.log(`  Skipped: ${stats.skipped}`);
  console.log(`  Errors: ${stats.errors}`);
  
  return stats;
}

// Main execution
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const specificDir = args.find(arg => arg.startsWith('docs-'));

if (dryRun) {
  console.log(`${colors.yellow}Running in DRY RUN mode - no files will be modified${colors.reset}`);
}

// Process directories
const directories = specificDir 
  ? [specificDir]
  : ['docs-public', 'docs-internal', 'docs-operation', 'docs-finance', 'docs-test-auth'];

const allStats = {};

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    allStats[dir] = processDirectory(dir, dryRun);
  }
});

// Overall summary
console.log(`\n${colors.blue}=== OVERALL SUMMARY ===${colors.reset}`);
let totalUpdated = 0;
let totalFiles = 0;

Object.entries(allStats).forEach(([dir, stats]) => {
  totalUpdated += stats.updated;
  totalFiles += stats.total;
  if (stats.updated > 0) {
    console.log(`\n${colors.yellow}${dir}:${colors.reset} ${stats.updated} updates`);
    stats.changes.forEach(change => {
      console.log(`  ${change.file}: ${change.from} → ${change.to}`);
    });
  }
});

console.log(`\n${colors.green}Total files updated: ${totalUpdated}/${totalFiles}${colors.reset}`);

if (dryRun) {
  console.log(`\n${colors.yellow}This was a dry run. Run without --dry-run to apply changes.${colors.reset}`);
} else if (totalUpdated > 0) {
  console.log(`\n${colors.dim}Run 'git status' to see changes${colors.reset}`);
}