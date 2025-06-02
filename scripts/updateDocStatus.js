#!/usr/bin/env node

/**
 * updateDocStatus.js
 * 
 * Script om docStatus waarden bulk te updaten in markdown bestanden
 * Ondersteunt verschillende update patronen en veiligheidscontroles
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Basis directories om te scannen
const DOCS_DIRS = [
    'docs-internal',
    'docs-public', 
    'docs-finance',
    'docs-operation',
    'docs-test-auth'
];

/**
 * Haal frontmatter uit markdown bestand
 */
function extractFrontmatter(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check voor YAML frontmatter
        if (content.startsWith('---\n')) {
            const endIndex = content.indexOf('\n---\n', 4);
            if (endIndex !== -1) {
                const frontmatterText = content.substring(4, endIndex);
                const bodyContent = content.substring(endIndex + 5);
                return {
                    frontmatter: yaml.load(frontmatterText) || {},
                    body: bodyContent,
                    hasFrontmatter: true
                };
            }
        }
        
        // Geen frontmatter gevonden
        return {
            frontmatter: {},
            body: content,
            hasFrontmatter: false
        };
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Schrijf bestand terug met nieuwe frontmatter
 */
function writeFrontmatter(filePath, frontmatter, body) {
    try {
        const yamlContent = yaml.dump(frontmatter, {
            defaultFlowStyle: false,
            lineWidth: -1,
            sortKeys: false
        });
        
        const content = `---\n${yamlContent}---\n${body}`;
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Recursief vind alle .md bestanden in directory
 */
function findMarkdownFiles(dir) {
    let files = [];
    
    try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Recursief doorzoeken
                files = files.concat(findMarkdownFiles(fullPath));
            } else if (item.endsWith('.md')) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // Directory bestaat niet of geen toegang
        return [];
    }
    
    return files;
}

/**
 * Update docStatus van bestanden die aan criteria voldoen
 */
function updateDocStatus(fromStatus, toStatus, options = {}) {
    const {
        dryRun = false,
        includeUndefined = false,
        excludePatterns = [],
        includePatterns = [],
        verbose = false
    } = options;

    console.log('🔄 DocStatus Update Script');
    console.log('='.repeat(50));
    console.log(`Update: ${fromStatus || 'undefined'} → ${toStatus}`);
    console.log(`Mode: ${dryRun ? 'DRY RUN (geen wijzigingen)' : 'LIVE UPDATE'}`);
    console.log('');

    const results = {
        found: [],
        updated: [],
        errors: [],
        skipped: []
    };

    // Scan alle docs directories
    for (const docsDir of DOCS_DIRS) {
        if (!fs.existsSync(docsDir)) {
            if (verbose) console.log(`⚠️  Directory ${docsDir} bestaat niet`);
            continue;
        }

        const files = findMarkdownFiles(docsDir);
        
        for (const filePath of files) {
            // Check exclude patterns
            if (excludePatterns.some(pattern => filePath.includes(pattern))) {
                if (verbose) console.log(`⏭️  Skipped (excluded): ${filePath}`);
                results.skipped.push(filePath);
                continue;
            }
            
            // Check include patterns (als gedefinieerd)
            if (includePatterns.length > 0 && !includePatterns.some(pattern => filePath.includes(pattern))) {
                if (verbose) console.log(`⏭️  Skipped (not included): ${filePath}`);
                results.skipped.push(filePath);
                continue;
            }

            const fileData = extractFrontmatter(filePath);
            if (!fileData) {
                results.errors.push(filePath);
                continue;
            }

            const currentDocStatus = fileData.frontmatter.docStatus;
            let shouldUpdate = false;

            // Bepaal of bestand geüpdatet moet worden
            if (fromStatus === null && includeUndefined) {
                // Update bestanden zonder docStatus
                shouldUpdate = (currentDocStatus === undefined || currentDocStatus === null);
            } else if (fromStatus === 'undefined') {
                // Expliciete 'undefined' string match
                shouldUpdate = (currentDocStatus === undefined || currentDocStatus === null);
            } else {
                // Exacte match
                shouldUpdate = (currentDocStatus === fromStatus);
            }

            if (shouldUpdate) {
                results.found.push({
                    path: filePath,
                    currentStatus: currentDocStatus,
                    newStatus: toStatus
                });

                if (!dryRun) {
                    // Update frontmatter
                    fileData.frontmatter.docStatus = toStatus;
                    
                    // Voeg frontmatter toe als het er niet was
                    if (!fileData.hasFrontmatter) {
                        // Zorg voor minimale frontmatter
                        if (!fileData.frontmatter.title) {
                            fileData.frontmatter.title = path.basename(filePath, '.md');
                        }
                    }

                    if (writeFrontmatter(filePath, fileData.frontmatter, fileData.body)) {
                        results.updated.push(filePath);
                        if (verbose) console.log(`✅ Updated: ${filePath}`);
                    } else {
                        results.errors.push(filePath);
                        console.error(`❌ Failed to update: ${filePath}`);
                    }
                } else {
                    if (verbose) console.log(`🔍 Would update: ${filePath}`);
                }
            }
        }
    }

    // Rapportage
    console.log('\n📊 RESULTATEN:');
    console.log('-'.repeat(30));
    console.log(`📋 Bestanden gevonden: ${results.found.length}`);
    console.log(`✅ Bestanden geüpdatet: ${results.updated.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);
    console.log(`⏭️  Overgeslagen: ${results.skipped.length}`);

    if (results.found.length > 0) {
        console.log('\n📝 GEVONDEN BESTANDEN:');
        results.found.forEach(file => {
            const statusDisplay = file.currentStatus || 'undefined';
            console.log(`   ${file.path} (${statusDisplay} → ${file.newStatus})`);
        });
    }

    if (results.errors.length > 0) {
        console.log('\n❌ ERRORS:');
        results.errors.forEach(file => {
            console.log(`   ${file}`);
        });
    }

    console.log('\n' + '='.repeat(50));
    return results;
}

/**
 * Voorgedefinieerde update functies
 */
const presets = {
    /**
     * Update alle 'completed' bestanden naar 'live'
     */
    completedToLive: (options = {}) => {
        console.log('🚀 Preset: Completed → Live');
        console.log('Alle completed bestanden worden live gemaakt voor productie\n');
        
        return updateDocStatus('completed', 'live', {
            excludePatterns: ['PROMPT.md', '_status.md'],
            ...options
        });
    },

    /**
     * Update bestanden zonder docStatus naar 'live'
     */
    undefinedToLive: (options = {}) => {
        console.log('🚀 Preset: Undefined → Live');
        console.log('Bestanden zonder docStatus krijgen live status\n');
        
        return updateDocStatus('undefined', 'live', {
            includeUndefined: true,
            excludePatterns: ['PROMPT.md', '_status.md', 'CLAUDE_', 'MIGRATIE-'],
            ...options
        });
    },

    /**
     * Update generated bestanden naar 'live'
     */
    generatedToLive: (options = {}) => {
        console.log('🚀 Preset: Generated → Live');
        console.log('Generated bestanden worden live gemaakt\n');
        
        return updateDocStatus('generated', 'live', options);
    }
};

// CLI interface
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        console.log(`
📝 DocStatus Update Script

Gebruik:
  node updateDocStatus.js <preset> [opties]
  node updateDocStatus.js <from-status> <to-status> [opties]

Presets:
  completed-to-live     Update completed → live
  undefined-to-live     Update undefined → live  
  generated-to-live     Update generated → live

Directe updates:
  node updateDocStatus.js completed live
  node updateDocStatus.js undefined live
  node updateDocStatus.js generated live

Opties:
  --dry-run            Toon wat geüpdatet zou worden (geen wijzigingen)
  --verbose            Toon meer details
  --include <pattern>  Alleen bestanden met dit patroon
  --exclude <pattern>  Sluit bestanden met dit patroon uit

Voorbeelden:
  node updateDocStatus.js completed-to-live --dry-run
  node updateDocStatus.js completed live --verbose
  node updateDocStatus.js undefined-to-live --exclude PROMPT
        `);
        process.exit(0);
    }

    const options = {
        dryRun: args.includes('--dry-run'),
        verbose: args.includes('--verbose'),
        includePatterns: [],
        excludePatterns: []
    };

    // Parse include/exclude patterns
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--include' && args[i + 1]) {
            options.includePatterns.push(args[i + 1]);
        }
        if (args[i] === '--exclude' && args[i + 1]) {
            options.excludePatterns.push(args[i + 1]);
        }
    }

    const command = args[0];

    try {
        if (presets[command.replace(/-/g, '').replace(/to/g, 'To')]) {
            // Gebruik preset
            const presetName = command.replace(/-/g, '').replace(/to/g, 'To');
            presets[presetName](options);
        } else if (args.length >= 2) {
            // Directe from/to update
            const fromStatus = args[0] === 'undefined' ? 'undefined' : args[0];
            const toStatus = args[1];
            
            if (fromStatus === 'undefined') {
                options.includeUndefined = true;
            }
            
            updateDocStatus(fromStatus, toStatus, options);
        } else {
            console.error('❌ Ongeldige argumenten. Gebruik --help voor hulp.');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Error tijdens update:', error.message);
        process.exit(1);
    }
}

// Run als standalone script
if (require.main === module) {
    main();
}

module.exports = {
    updateDocStatus,
    presets,
    extractFrontmatter,
    writeFrontmatter,
    findMarkdownFiles
};