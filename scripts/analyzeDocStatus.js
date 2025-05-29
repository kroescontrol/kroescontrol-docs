#!/usr/bin/env node

/**
 * analyzeDocStatus.js
 * 
 * Script om alle .md bestanden te analyseren op docStatus waarden
 * Helpt bij het identificeren van Laag 2 content (niet-live) vs beschermde content (live)
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
                return yaml.load(frontmatterText);
            }
        }
        return {};
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return {};
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
 * Analyseer alle markdown bestanden
 */
function analyzeAllFiles() {
    const results = {
        live: [],
        nonLive: {
            templated: [],
            generated: [],
            completed: [],
            locked: [],
            undefined: [],
            other: []
        },
        totals: {
            live: 0,
            nonLive: 0,
            total: 0
        }
    };

    // Scan alle docs directories
    for (const docsDir of DOCS_DIRS) {
        if (!fs.existsSync(docsDir)) {
            console.log(`⚠️  Directory ${docsDir} bestaat niet`);
            continue;
        }

        const files = findMarkdownFiles(docsDir);
        
        for (const filePath of files) {
            const frontmatter = extractFrontmatter(filePath);
            const docStatus = frontmatter.docStatus;
            const title = frontmatter.title || path.basename(filePath, '.md');
            
            const fileInfo = {
                path: filePath,
                title: title,
                docStatus: docStatus,
                directory: path.dirname(filePath)
            };

            if (docStatus === 'live') {
                results.live.push(fileInfo);
                results.totals.live++;
            } else {
                // Alle niet-live bestanden
                results.totals.nonLive++;
                
                switch (docStatus) {
                    case 'templated':
                        results.nonLive.templated.push(fileInfo);
                        break;
                    case 'generated':
                        results.nonLive.generated.push(fileInfo);
                        break;
                    case 'completed':
                        results.nonLive.completed.push(fileInfo);
                        break;
                    case 'locked':
                        results.nonLive.locked.push(fileInfo);
                        break;
                    case undefined:
                    case null:
                        results.nonLive.undefined.push(fileInfo);
                        break;
                    default:
                        results.nonLive.other.push(fileInfo);
                        break;
                }
            }
            
            results.totals.total++;
        }
    }

    return results;
}

/**
 * Groepeer bestanden per directory
 */
function groupByDirectory(files) {
    const grouped = {};
    
    for (const file of files) {
        const dir = file.directory;
        if (!grouped[dir]) {
            grouped[dir] = [];
        }
        grouped[dir].push(file);
    }
    
    return grouped;
}

/**
 * Print resultaten in overzichtelijke format
 */
function printResults(results, mode = 'summary') {
    console.log('='.repeat(80));
    console.log('📊 DOCSTATUS ANALYSE RAPPORT');
    console.log('='.repeat(80));
    
    // Totaal overzicht
    console.log('\n📈 TOTAAL OVERZICHT:');
    console.log(`   Totaal bestanden: ${results.totals.total}`);
    console.log(`   🟢 Live bestanden: ${results.totals.live}`);
    console.log(`   🔄 Niet-live bestanden: ${results.totals.nonLive}`);
    console.log(`   📊 Live percentage: ${((results.totals.live / results.totals.total) * 100).toFixed(1)}%`);

    if (mode === 'live' || mode === 'all') {
        console.log('\n🟢 LIVE BESTANDEN (docStatus: live):');
        console.log('-'.repeat(50));
        
        if (results.live.length === 0) {
            console.log('   Geen live bestanden gevonden');
        } else {
            const liveGrouped = groupByDirectory(results.live);
            for (const [dir, files] of Object.entries(liveGrouped)) {
                console.log(`\n📁 ${dir} (${files.length} bestanden):`);
                for (const file of files) {
                    console.log(`   ✅ ${path.basename(file.path)} - "${file.title}"`);
                }
            }
        }
    }

    if (mode === 'non-live' || mode === 'all') {
        console.log('\n🔄 NIET-LIVE BESTANDEN:');
        console.log('-'.repeat(50));

        // Templated
        if (results.nonLive.templated.length > 0) {
            console.log(`\n📝 TEMPLATED (${results.nonLive.templated.length} bestanden) - Klaar voor regeneratie:`);
            const templatedGrouped = groupByDirectory(results.nonLive.templated);
            for (const [dir, files] of Object.entries(templatedGrouped)) {
                console.log(`   📁 ${dir}:`);
                for (const file of files) {
                    console.log(`      🔄 ${path.basename(file.path)}`);
                }
            }
        }

        // Generated  
        if (results.nonLive.generated.length > 0) {
            console.log(`\n🤖 GENERATED (${results.nonLive.generated.length} bestanden):`);
            const generatedGrouped = groupByDirectory(results.nonLive.generated);
            for (const [dir, files] of Object.entries(generatedGrouped)) {
                console.log(`   📁 ${dir}:`);
                for (const file of files) {
                    console.log(`      🤖 ${path.basename(file.path)}`);
                }
            }
        }

        // Completed
        if (results.nonLive.completed.length > 0) {
            console.log(`\n✅ COMPLETED (${results.nonLive.completed.length} bestanden):`);
            const completedGrouped = groupByDirectory(results.nonLive.completed);
            for (const [dir, files] of Object.entries(completedGrouped)) {
                console.log(`   📁 ${dir}:`);
                for (const file of files) {
                    console.log(`      ✅ ${path.basename(file.path)}`);
                }
            }
        }

        // Locked
        if (results.nonLive.locked.length > 0) {
            console.log(`\n🔒 LOCKED (${results.nonLive.locked.length} bestanden) - BESCHERMD:`);
            const lockedGrouped = groupByDirectory(results.nonLive.locked);
            for (const [dir, files] of Object.entries(lockedGrouped)) {
                console.log(`   📁 ${dir}:`);
                for (const file of files) {
                    console.log(`      🔒 ${path.basename(file.path)}`);
                }
            }
        }

        // Undefined
        if (results.nonLive.undefined.length > 0) {
            console.log(`\n❓ UNDEFINED STATUS (${results.nonLive.undefined.length} bestanden) - Geen docStatus:`);
            const undefinedGrouped = groupByDirectory(results.nonLive.undefined);
            for (const [dir, files] of Object.entries(undefinedGrouped)) {
                console.log(`   📁 ${dir}:`);
                for (const file of files) {
                    console.log(`      ❓ ${path.basename(file.path)}`);
                }
            }
        }

        // Other
        if (results.nonLive.other.length > 0) {
            console.log(`\n❔ OTHER STATUS (${results.nonLive.other.length} bestanden):`);
            for (const file of results.nonLive.other) {
                console.log(`   ❔ ${file.path} - Status: "${file.docStatus}"`);
            }
        }
    }

    console.log('\n' + '='.repeat(80));
}

/**
 * Export functie voor gebruik als CSV
 */
function exportToCsv(results, filename = 'docstatus-report.csv') {
    const allFiles = [
        ...results.live.map(f => ({...f, category: 'live'})),
        ...results.nonLive.templated.map(f => ({...f, category: 'templated'})),
        ...results.nonLive.generated.map(f => ({...f, category: 'generated'})),
        ...results.nonLive.completed.map(f => ({...f, category: 'completed'})),
        ...results.nonLive.locked.map(f => ({...f, category: 'locked'})),
        ...results.nonLive.undefined.map(f => ({...f, category: 'undefined'})),
        ...results.nonLive.other.map(f => ({...f, category: 'other'}))
    ];

    const csvContent = [
        'Path,Title,DocStatus,Category,Directory',
        ...allFiles.map(f => 
            `"${f.path}","${f.title}","${f.docStatus || ''}","${f.category}","${f.directory}"`
        )
    ].join('\n');

    fs.writeFileSync(filename, csvContent);
    console.log(`\n📄 CSV rapport geëxporteerd naar: ${filename}`);
}

// CLI interface
function main() {
    const args = process.argv.slice(2);
    const mode = args[0] || 'summary'; // summary, live, non-live, all, csv
    
    console.log('🔍 Analyseren van docStatus in alle docs directories...\n');
    
    const results = analyzeAllFiles();
    
    switch (mode) {
        case 'live':
            printResults(results, 'live');
            break;
        case 'non-live':
        case 'nonlive':
            printResults(results, 'non-live');
            break;
        case 'all':
            printResults(results, 'all');
            break;
        case 'csv':
            printResults(results, 'summary');
            exportToCsv(results);
            break;
        case 'help':
            console.log('Gebruik:');
            console.log('  node scripts/analyzeDocStatus.js [mode]');
            console.log('');
            console.log('Modi:');
            console.log('  summary   - Alleen totaal overzicht (default)');
            console.log('  live      - Alleen live bestanden');
            console.log('  non-live  - Alleen niet-live bestanden');  
            console.log('  all       - Alle bestanden');
            console.log('  csv       - Export naar CSV + summary');
            console.log('  help      - Deze help tekst');
            break;
        default:
            printResults(results, 'summary');
            console.log('\n💡 Gebruik "help" voor meer opties');
            break;
    }
}

// Run als standalone script
if (require.main === module) {
    main();
}

module.exports = {
    analyzeAllFiles,
    groupByDirectory,
    extractFrontmatter,
    findMarkdownFiles
};