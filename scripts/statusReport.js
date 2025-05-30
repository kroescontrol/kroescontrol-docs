#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class DocumentationStatusReporter {
    constructor(rootDir = process.cwd()) {
        this.rootDir = rootDir;
        this.documents = [];
        this.stats = {
            byStatus: {},
            byDocStatus: {},
            byCategory: {},
            byDirectory: {},
            total: 0
        };
        // Detecteer build environment
        this.isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.VERCEL && !process.env.CI;
        this.isVercelOrCI = process.env.VERCEL || process.env.CI || process.env.NODE_ENV === 'production';
    }

    /**
     * Scan alle docs-* directories voor markdown bestanden
     */
    scanDocuments() {
        console.log('🔍 Scanning documentation directories...\n');
        
        const docsDirectories = fs.readdirSync(this.rootDir)
            .filter(dir => dir.startsWith('docs-') && fs.statSync(path.join(this.rootDir, dir)).isDirectory())
            .sort();

        console.log(`Found docs directories: ${docsDirectories.join(', ')}\n`);

        for (const docsDir of docsDirectories) {
            this.scanDirectory(docsDir, docsDir);
        }

        this.generateStatistics();
    }

    /**
     * Recursief scannen van een directory
     */
    scanDirectory(dirPath, rootDocsDir, category = '') {
        const fullPath = path.join(this.rootDir, dirPath);
        
        if (!fs.existsSync(fullPath)) {
            return;
        }

        const items = fs.readdirSync(fullPath);

        for (const item of items) {
            const itemPath = path.join(fullPath, item);
            const relativePath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                // Skip .meta directories en andere utility directories
                if (item === '.meta' || item === 'node_modules' || item.startsWith('.')) {
                    continue;
                }
                
                // Bepaal de category name
                const newCategory = category ? `${category}/${item}` : item;
                this.scanDirectory(relativePath, rootDocsDir, newCategory);
            } else if (item.endsWith('.md') && !item.startsWith('.')) {
                // Skip statusreport.md zelf om recursie te voorkomen
                if (item === 'statusreport.md') {
                    continue;
                }
                
                this.processMarkdownFile(relativePath, rootDocsDir, category);
            }
        }
    }

    /**
     * Verwerk een individueel markdown bestand
     */
    processMarkdownFile(filePath, rootDocsDir, category) {
        const fullPath = path.join(this.rootDir, filePath);
        
        try {
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            const { data: frontmatter, content } = matter(fileContent);
            
            // Bepaal de status van het document
            let status = this.determineDocumentStatus(frontmatter);
            let docStatus = this.determineDocStatus(frontmatter);
            
            // Bepaal category
            let documentCategory = category || 'root';
            if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
                documentCategory = frontmatter.tags[0] || documentCategory;
            }

            // Verzamel document informatie
            const docInfo = {
                path: filePath,
                relativePath: filePath.replace(`${rootDocsDir}/`, ''),
                directory: rootDocsDir,
                category: documentCategory,
                title: frontmatter.title || path.basename(filePath, '.md'),
                status: status,
                docStatus: docStatus,
                description: frontmatter.description || '',
                lastUpdate: frontmatter.last_update?.date || 'Unknown',
                author: frontmatter.last_update?.author || 'Unknown',
                tags: frontmatter.tags || [],
                wordCount: this.countWords(content),
                frontmatter: frontmatter
            };

            this.documents.push(docInfo);
            this.stats.total++;

        } catch (error) {
            console.warn(`⚠️  Could not process ${filePath}: ${error.message}`);
        }
    }

    /**
     * Bepaal de status van een document op basis van frontmatter
     */
    determineDocumentStatus(frontmatter) {
        // Check expliciete status velden
        if (frontmatter.status) {
            return frontmatter.status.toLowerCase();
        }
        
        if (frontmatter.draft === true) {
            return 'draft';
        }
        
        if (frontmatter.published === false) {
            return 'draft';
        }

        // Check voor review indicators
        if (frontmatter.review === true || frontmatter.status === 'review') {
            return 'review';
        }

        // Default naar published als geen draft/review indicators
        return 'published';
    }

    /**
     * Bepaal de docStatus van een document op basis van frontmatter
     */
    determineDocStatus(frontmatter) {
        // Check voor docStatus veld
        if (frontmatter.docStatus) {
            return frontmatter.docStatus.toLowerCase();
        }
        
        // Default naar geen docStatus
        return null;
    }

    /**
     * Tel woorden in content (simpele implementatie)
     */
    countWords(content) {
        return content.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Genereer statistieken uit verzamelde documenten
     */
    generateStatistics() {
        // Reset statistieken
        this.stats.byStatus = {};
        this.stats.byDocStatus = {};
        this.stats.byCategory = {};
        this.stats.byDirectory = {};

        for (const doc of this.documents) {
            // Status statistieken
            this.stats.byStatus[doc.status] = (this.stats.byStatus[doc.status] || 0) + 1;
            
            // DocStatus statistieken
            if (doc.docStatus) {
                this.stats.byDocStatus[doc.docStatus] = (this.stats.byDocStatus[doc.docStatus] || 0) + 1;
            } else {
                this.stats.byDocStatus['no-docstatus'] = (this.stats.byDocStatus['no-docstatus'] || 0) + 1;
            }
            
            // Category statistieken
            this.stats.byCategory[doc.category] = (this.stats.byCategory[doc.category] || 0) + 1;
            
            // Directory statistieken
            this.stats.byDirectory[doc.directory] = (this.stats.byDirectory[doc.directory] || 0) + 1;
        }
    }

    /**
     * Genereer console rapport
     */
    generateConsoleReport() {
        const timestamp = new Date().toISOString();
        
        console.log('📊 DOCUMENTATION STATUS REPORT');
        console.log('='.repeat(50));
        console.log(`Generated: ${timestamp}`);
        console.log(`Total Documents: ${this.stats.total}\n`);

        // Status overview
        console.log('📈 STATUS OVERVIEW:');
        console.log('-'.repeat(30));
        Object.entries(this.stats.byStatus)
            .sort(([,a], [,b]) => b - a)
            .forEach(([status, count]) => {
                const percentage = ((count / this.stats.total) * 100).toFixed(1);
                const statusIcon = this.getStatusIcon(status);
                console.log(`${statusIcon} ${status.toUpperCase().padEnd(10)} ${count.toString().padStart(3)} (${percentage}%)`);
            });

        // DocStatus overview
        console.log('\n🏷️  DOCSTATUS OVERVIEW:');
        console.log('-'.repeat(30));
        Object.entries(this.stats.byDocStatus)
            .sort(([,a], [,b]) => b - a)
            .forEach(([docStatus, count]) => {
                const percentage = ((count / this.stats.total) * 100).toFixed(1);
                const docStatusIcon = this.getDocStatusIcon(docStatus);
                console.log(`${docStatusIcon} ${docStatus.toUpperCase().padEnd(12)} ${count.toString().padStart(3)} (${percentage}%)`);
            });

        // Directory overview
        console.log('\n📁 BY DIRECTORY:');
        console.log('-'.repeat(30));
        Object.entries(this.stats.byDirectory)
            .sort(([,a], [,b]) => b - a)
            .forEach(([dir, count]) => {
                console.log(`📂 ${dir.padEnd(15)} ${count.toString().padStart(3)} documents`);
            });

        // Category overview (top 10)
        console.log('\n🏷️  TOP CATEGORIES:');
        console.log('-'.repeat(30));
        Object.entries(this.stats.byCategory)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([category, count]) => {
                console.log(`🔖 ${category.padEnd(20)} ${count.toString().padStart(3)} documents`);
            });

        // Draft documents lijst
        const draftDocs = this.documents.filter(doc => doc.status === 'draft');
        if (draftDocs.length > 0) {
            console.log('\n📝 DOCUMENTS IN DRAFT:');
            console.log('-'.repeat(30));
            draftDocs.forEach(doc => {
                console.log(`⚠️  ${doc.path}`);
                console.log(`   Title: ${doc.title}`);
                console.log(`   Category: ${doc.category}`);
                console.log(`   Last Update: ${doc.lastUpdate}`);
                console.log('');
            });
        }

        // Review documents lijst
        const reviewDocs = this.documents.filter(doc => doc.status === 'review');
        if (reviewDocs.length > 0) {
            console.log('\n👀 DOCUMENTS IN REVIEW:');
            console.log('-'.repeat(30));
            reviewDocs.forEach(doc => {
                console.log(`🔍 ${doc.path}`);
                console.log(`   Title: ${doc.title}`);
                console.log(`   Category: ${doc.category}`);
                console.log(`   Last Update: ${doc.lastUpdate}`);
                console.log('');
            });
        }

        console.log('='.repeat(50));
        console.log('Report completed successfully! 🎉\n');
    }

    /**
     * Krijg een emoji icon voor een status
     */
    getStatusIcon(status) {
        const icons = {
            'draft': '📝',
            'review': '👀',
            'published': '✅',
            'archived': '📦',
            'deprecated': '🗃️'
        };
        return icons[status] || '📄';
    }

    /**
     * Geef icoon voor docStatus
     */
    getDocStatusIcon(docStatus) {
        const icons = {
            'templated': '📋',
            'generated': '🤖',
            'completed': '✅',
            'live': '🟢',
            'locked': '🔒',
            'no-docstatus': '❓'
        };
        return icons[docStatus] || '📄';
    }

    /**
     * Bepaal of een link gemaakt moet worden voor een document
     */
    shouldCreateLink(doc) {
        // Voor lokale development: altijd links maken
        if (this.isLocalDev) {
            return true;
        }
        
        // Voor Vercel/CI: geen links voor draft, templated, of generated bestanden
        if (this.isVercelOrCI) {
            const excludedStatuses = ['draft'];
            const excludedDocStatuses = ['templated', 'generated'];
            
            if (excludedStatuses.includes(doc.status)) {
                return false;
            }
            
            if (doc.docStatus && excludedDocStatuses.includes(doc.docStatus)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Maak een link of plain text voor een document
     */
    formatDocumentReference(doc) {
        if (this.shouldCreateLink(doc)) {
            return `[${doc.relativePath}](/${doc.directory}/${doc.relativePath})`;
        } else {
            return doc.relativePath;
        }
    }

    /**
     * Genereer markdown rapport bestand
     */
    async generateMarkdownReport() {
        const timestamp = new Date().toISOString();
        const date = new Date().toLocaleDateString('nl-NL');
        
        let markdown = '';
        
        // Frontmatter
        markdown += '---\n';
        markdown += 'title: Documentation Status Report\n';
        markdown += 'sidebar_position: 999\n';
        markdown += 'sidebar_class_name: hidden\n';
        markdown += 'displayed_sidebar: null\n';
        markdown += 'slug: /statusreport\n';
        markdown += `description: Automatisch gegenereerd statusrapport van alle documentatie op ${date}\n`;
        markdown += 'tags: [status, rapport, documentatie, overzicht]\n';
        markdown += 'keywords: [status, report, documentation, statistics]\n';
        markdown += `last_update:\n`;
        markdown += `  date: ${timestamp.split('T')[0]}\n`;
        markdown += `  author: StatusReport Script\n`;
        markdown += 'image: /img/logo.svg\n';
        markdown += '---\n\n';

        // Header
        markdown += '# Documentation Status Report\n\n';
        markdown += `**Gegenereerd op:** ${timestamp}\n\n`;
        markdown += `**Totaal aantal documenten:** ${this.stats.total}\n\n`;

        // Status overzicht
        markdown += '## 📈 Status Overzicht\n\n';
        markdown += '| Status | Aantal | Percentage |\n';
        markdown += '|--------|--------|------------|\n';
        Object.entries(this.stats.byStatus)
            .sort(([,a], [,b]) => b - a)
            .forEach(([status, count]) => {
                const percentage = ((count / this.stats.total) * 100).toFixed(1);
                const statusIcon = this.getStatusIcon(status);
                markdown += `| ${statusIcon} ${status.charAt(0).toUpperCase() + status.slice(1)} | ${count} | ${percentage}% |\n`;
            });

        // DocStatus overzicht
        markdown += '\n## 🏷️ DocStatus Overzicht\n\n';
        markdown += '| DocStatus | Aantal | Percentage |\n';
        markdown += '|-----------|--------|------------|\n';
        Object.entries(this.stats.byDocStatus)
            .sort(([,a], [,b]) => b - a)
            .forEach(([docStatus, count]) => {
                const percentage = ((count / this.stats.total) * 100).toFixed(1);
                const docStatusIcon = this.getDocStatusIcon(docStatus);
                const displayName = docStatus === 'no-docstatus' ? 'Geen docStatus' : docStatus.charAt(0).toUpperCase() + docStatus.slice(1);
                markdown += `| ${docStatusIcon} ${displayName} | ${count} | ${percentage}% |\n`;
            });

        // Directory overzicht
        markdown += '\n## 📁 Documenten per Directory\n\n';
        markdown += '| Directory | Aantal Documenten |\n';
        markdown += '|-----------|-------------------|\n';
        Object.entries(this.stats.byDirectory)
            .sort(([,a], [,b]) => b - a)
            .forEach(([dir, count]) => {
                markdown += `| 📂 ${dir} | ${count} |\n`;
            });

        // Top categorieën
        markdown += '\n## 🏷️ Top Categorieën\n\n';
        markdown += '| Categorie | Aantal Documenten |\n';
        markdown += '|-----------|-------------------|\n';
        Object.entries(this.stats.byCategory)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 15)
            .forEach(([category, count]) => {
                markdown += `| 🔖 ${category} | ${count} |\n`;
            });

        // Draft documenten
        const draftDocs = this.documents.filter(doc => doc.status === 'draft');
        if (draftDocs.length > 0) {
            markdown += '\n## 📝 Documenten in Draft Status\n\n';
            markdown += '| Bestand | Titel | Categorie | Laatste Update |\n';
            markdown += '|---------|-------|-----------|----------------|\n';
            draftDocs.forEach(doc => {
                const docReference = this.formatDocumentReference(doc);
                markdown += `| ${docReference} | ${doc.title} | ${doc.category} | ${doc.lastUpdate} |\n`;
            });
        }

        // Review documenten
        const reviewDocs = this.documents.filter(doc => doc.status === 'review');
        if (reviewDocs.length > 0) {
            markdown += '\n## 👀 Documenten in Review Status\n\n';
            markdown += '| Bestand | Titel | Categorie | Laatste Update |\n';
            markdown += '|---------|-------|-----------|----------------|\n';
            reviewDocs.forEach(doc => {
                const docReference = this.formatDocumentReference(doc);
                markdown += `| ${docReference} | ${doc.title} | ${doc.category} | ${doc.lastUpdate} |\n`;
            });
        }

        // Alle documenten (optioneel, voor debugging)
        markdown += '\n## 📚 Alle Documenten\n\n';
        markdown += '<details>\n';
        markdown += '<summary>Klik om volledige lijst te tonen</summary>\n\n';
        markdown += '| Bestand | Titel | Status | DocStatus | Categorie | Woorden | Laatste Update |\n';
        markdown += '|---------|-------|--------|-----------|-----------|---------|----------------|\n';
        
        this.documents
            .sort((a, b) => a.path.localeCompare(b.path))
            .forEach(doc => {
                const statusIcon = this.getStatusIcon(doc.status);
                const docStatusIcon = doc.docStatus ? this.getDocStatusIcon(doc.docStatus) : '❓';
                const docStatusDisplay = doc.docStatus ? `${docStatusIcon} ${doc.docStatus}` : '❓ geen';
                const docReference = this.formatDocumentReference(doc);
                markdown += `| ${docReference} | ${doc.title} | ${statusIcon} ${doc.status} | ${docStatusDisplay} | ${doc.category} | ${doc.wordCount} | ${doc.lastUpdate} |\n`;
            });
        
        markdown += '\n</details>\n\n';

        // Footer
        markdown += '---\n\n';
        markdown += '*Dit rapport wordt automatisch gegenereerd door het statusReport.js script.*\n\n';
        markdown += `*Laatste update: ${timestamp}*\n`;

        return markdown;
    }

    /**
     * Sla markdown rapport op
     */
    async saveMarkdownReport() {
        const markdown = await this.generateMarkdownReport();
        const outputPath = path.join(this.rootDir, 'docs-internal', '_statusreport.md');
        
        // Zorg ervoor dat de directory bestaat
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, markdown, 'utf8');
        console.log(`📄 Markdown rapport opgeslagen: ${outputPath}`);
    }

    /**
     * Voer volledige rapport generatie uit
     */
    async generateReport() {
        console.log('🚀 Starting Documentation Status Report...\n');
        
        // Scan alle documenten
        this.scanDocuments();
        
        // Genereer console rapport
        this.generateConsoleReport();
        
        // Sla markdown rapport op
        await this.saveMarkdownReport();
        
        console.log('✅ Documentation Status Report completed successfully!');
    }

    /**
     * Export data als JSON (voor verdere verwerking)
     */
    exportAsJSON(outputPath = null) {
        if (!outputPath) {
            outputPath = path.join(this.rootDir, 'docs-internal', 'statusreport.json');
        }

        const data = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            documents: this.documents
        };

        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`📊 JSON data geëxporteerd: ${outputPath}`);
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const reporter = new DocumentationStatusReporter();

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
📊 Documentation Status Reporter

Gebruik:
  node statusReport.js                    # Genereer volledig rapport
  node statusReport.js --json            # Exporteer ook naar JSON
  node statusReport.js --console-only    # Alleen console output
  node statusReport.js --help            # Toon deze help

Output:
  - Console rapport met overzichten en statistieken
  - Markdown bestand: docs-internal/statusreport.md
  - Optioneel JSON bestand: docs-internal/statusreport.json
        `);
        process.exit(0);
    }

    (async () => {
        try {
            if (args.includes('--console-only')) {
                reporter.scanDocuments();
                reporter.generateConsoleReport();
            } else {
                await reporter.generateReport();
                
                if (args.includes('--json')) {
                    reporter.exportAsJSON();
                }
            }
        } catch (error) {
            console.error('\n❌ Error generating status report:', error.message);
            process.exit(1);
        }
    })();
}

module.exports = DocumentationStatusReporter;
