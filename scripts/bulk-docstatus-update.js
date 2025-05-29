#!/usr/bin/env node

/**
 * Bulk DocStatus Update Script
 * 
 * Updates docStatus frontMatter for all markdown files according to specified rules
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

// Status mapping rules
const STATUS_RULES = {
  // Locked patterns
  locked: [
    'docs-internal/tools/claudecode/**',
    'docs-public/status.md',
    'docs-internal/status.md', 
    'docs-operation/status.md',
    'docs-finance/status.md'
  ],
  
  // Live patterns
  live: [
    'docs-public/**',
    'docs-internal/tools/documentatie/**'
  ],
  
  // Default for everything else
  default: 'templated'
};

/**
 * Determine docStatus for a file based on rules
 * @param {string} filePath - Relative path from project root
 * @returns {string} - Status (locked, live, templated)
 */
function determineStatus(filePath) {
  // Normalize path separators
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Check specific locked files first (highest priority)
  const lockedFiles = [
    'docs-public/status.md',
    'docs-internal/status.md', 
    'docs-operation/status.md',
    'docs-finance/status.md'
  ];
  
  if (lockedFiles.includes(normalizedPath)) {
    return 'locked';
  }
  
  // Check locked directories
  if (normalizedPath.startsWith('docs-internal/tools/claudecode/')) {
    return 'locked';
  }
  
  // Check live patterns
  if (normalizedPath.startsWith('docs-public/')) {
    return 'live';
  }
  
  if (normalizedPath.startsWith('docs-internal/tools/documentatie/')) {
    return 'live';
  }
  
  // Default status for all other files
  return STATUS_RULES.default;
}

/**
 * Simple glob matching (since we don't have minimatch dependency)
 * @param {string} filePath 
 * @param {string} pattern 
 * @returns {boolean}
 */
function minimatch(filePath, pattern) {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\./g, '\\.');
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

/**
 * Update docStatus in a markdown file
 * @param {string} filePath - Full path to file
 * @param {string} newStatus - New docStatus value
 * @param {object} options - Update options
 * @returns {object} - Result object
 */
function updateDocStatus(filePath, newStatus, options = {}) {
  const { dryRun = false, force = false } = options;
  
  try {
    // Read file
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontMatter, content: docContent } = matter(content);
    
    // Get current status
    const currentStatus = frontMatter.docStatus;
    
    // Skip if status is already correct and not forcing
    if (currentStatus === newStatus && !force) {
      return {
        success: true,
        action: 'skipped',
        filePath,
        currentStatus,
        newStatus,
        message: 'Status already correct'
      };
    }
    
    // Update frontMatter
    frontMatter.docStatus = newStatus;
    
    // Write back to file (unless dry run)
    if (!dryRun) {
      const newContent = matter.stringify(docContent, frontMatter);
      fs.writeFileSync(filePath, newContent);
    }
    
    return {
      success: true,
      action: dryRun ? 'would-update' : 'updated',
      filePath,
      currentStatus: currentStatus || 'undefined',
      newStatus,
      message: `${dryRun ? 'Would update' : 'Updated'} from ${currentStatus || 'undefined'} to ${newStatus}`
    };
    
  } catch (error) {
    return {
      success: false,
      action: 'error',
      filePath,
      error: error.message
    };
  }
}

/**
 * Process all markdown files in specified directories
 * @param {array} directories - Directories to process
 * @param {object} options - Processing options
 * @returns {object} - Processing results
 */
function processDirectories(directories, options = {}) {
  const { dryRun = false, verbose = false } = options;
  
  const results = {
    processed: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    details: [],
    summary: {}
  };
  
  // Process each directory
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Directory ${dir} does not exist, skipping`);
      continue;
    }
    
    console.log(`📁 Processing ${dir}...`);
    
    // Find all markdown files
    const pattern = path.join(dir, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    
    console.log(`   Found ${files.length} markdown files`);
    
    // Process each file
    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file);
      const targetStatus = determineStatus(relativePath);
      
      // Update file
      const result = updateDocStatus(file, targetStatus, { dryRun });
      
      // Track results
      results.processed++;
      results.details.push(result);
      
      if (result.success) {
        if (result.action === 'updated' || result.action === 'would-update') {
          results.updated++;
        } else {
          results.skipped++;
        }
        
        if (verbose || result.action !== 'skipped') {
          console.log(`   ${getActionIcon(result.action)} ${relativePath}: ${result.message}`);
        }
      } else {
        results.errors++;
        console.error(`   ❌ ${relativePath}: ${result.error}`);
      }
      
      // Track summary by status
      if (!results.summary[targetStatus]) {
        results.summary[targetStatus] = 0;
      }
      results.summary[targetStatus]++;
    }
  }
  
  return results;
}

/**
 * Get icon for action type
 * @param {string} action 
 * @returns {string}
 */
function getActionIcon(action) {
  switch (action) {
    case 'updated': return '✅';
    case 'would-update': return '🔄';
    case 'skipped': return '⏭️';
    case 'error': return '❌';
    default: return '❓';
  }
}

/**
 * Print results summary
 * @param {object} results 
 */
function printSummary(results, dryRun = false) {
  console.log('\n📊 SUMMARY');
  console.log('=' .repeat(50));
  console.log(`📄 Total files processed: ${results.processed}`);
  console.log(`✅ ${dryRun ? 'Would be updated' : 'Updated'}: ${results.updated}`);
  console.log(`⏭️  Skipped (already correct): ${results.skipped}`);
  console.log(`❌ Errors: ${results.errors}`);
  
  console.log('\n📋 Status Distribution:');
  Object.entries(results.summary).forEach(([status, count]) => {
    const icon = status === 'live' ? '🟢' : status === 'locked' ? '🔒' : '📄';
    console.log(`   ${icon} ${status}: ${count} files`);
  });
  
  if (dryRun) {
    console.log('\n💡 This was a DRY RUN. Use --apply to make actual changes.');
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    dryRun: !args.includes('--apply'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    directories: args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'))
  };
  
  // Default directories if none specified
  if (options.directories.length === 0) {
    options.directories = ['docs-public', 'docs-internal', 'docs-finance', 'docs-operation', 'docs-test-auth'];
  }
  
  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📄 Bulk DocStatus Update Script

Usage: node bulk-docstatus-update.js [options] [directories...]

Options:
  --apply          Apply changes (default is dry-run)
  --verbose, -v    Verbose output
  --help, -h       Show this help

Rules:
  🔒 locked:    docs-internal/tools/claudecode/**, **/status.md
  🟢 live:      docs-public/**, docs-internal/tools/documentatie/**  
  📄 templated: All other files

Examples:
  node bulk-docstatus-update.js                    # Dry run on all directories
  node bulk-docstatus-update.js --apply            # Apply to all directories
  node bulk-docstatus-update.js docs-public        # Dry run on docs-public only
  node bulk-docstatus-update.js --apply docs-internal --verbose
    `);
    return;
  }
  
  console.log('🎯 DocStatus Bulk Update');
  console.log('=' .repeat(50));
  console.log(`Mode: ${options.dryRun ? '🔍 DRY RUN' : '✅ APPLY CHANGES'}`);
  console.log(`Directories: ${options.directories.join(', ')}`);
  console.log('');
  
  // Process directories
  const results = processDirectories(options.directories, options);
  
  // Print summary
  printSummary(results, options.dryRun);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  updateDocStatus,
  processDirectories,
  determineStatus
};