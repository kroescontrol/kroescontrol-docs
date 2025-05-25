#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ContextCollector {
    constructor(rootDir = process.cwd()) {
        this.rootDir = rootDir;
        this.context = {
            global: null,
            basis: [],
            category: null,
            document: null
        };
    }

    /**
     * Verzamelt alle gelaagde context voor een specifiek bestandspad
     * @param {string} filePath - Het pad naar het document (relatief of absoluut)
     * @returns {string} - Gecombineerde prompt voor Claude
     */
    async collectContext(filePath) {
        try {
            // Normaliseer het bestandspad
            const normalizedPath = this.normalizePath(filePath);
            const pathInfo = this.analyzeFilePath(normalizedPath);

            console.log(`\n🔍 Verzamelen context voor: ${normalizedPath}`);
            console.log(`📁 Categorie: ${pathInfo.category || 'geen'}`);
            console.log(`📄 Document: ${pathInfo.document || 'geen'}`);

            // Laag 1: Globale context (CLAUDE.md)
            await this.collectGlobalContext();

            // Laag 2: Basis context (CLAUDE_*.md bestanden)
            await this.collectBasisContext(pathInfo.docsType);

            // Laag 3: Categorie context (_category_meta.md)
            if (pathInfo.category) {
                await this.collectCategoryContext(pathInfo.docsType, pathInfo.category);
            }

            // Laag 4: Document context (.meta/document.meta.md)
            if (pathInfo.document) {
                await this.collectDocumentContext(pathInfo.docsType, pathInfo.category, pathInfo.document);
            }

            // Genereer de finale prompt
            return this.generatePrompt(pathInfo);

        } catch (error) {
            console.error('❌ Fout bij verzamelen context:', error.message);
            throw error;
        }
    }

    /**
     * Normaliseert een bestandspad naar een consistent formaat
     */
    normalizePath(filePath) {
        // Als het een absoluut pad is, maak het relatief ten opzichte van rootDir
        if (path.isAbsolute(filePath)) {
            return path.relative(this.rootDir, filePath);
        }
        return filePath;
    }

    /**
     * Analyseert een bestandspad en extraheert informatie
     */
    analyzeFilePath(filePath) {
        const parts = filePath.split(path.sep);
        
        // Bepaal het docs type (docs-internal, docs-public, etc.)
        let docsType = null;
        let category = null;
        let document = null;

        for (let i = 0; i < parts.length; i++) {
            if (parts[i].startsWith('docs-')) {
                docsType = parts[i];
                if (i + 1 < parts.length && parts[i + 1] !== '.meta') {
                    category = parts[i + 1];
                }
                if (i + 2 < parts.length && parts[i + 2].endsWith('.md')) {
                    document = path.basename(parts[i + 2], '.md');
                }
                break;
            }
        }

        return { docsType, category, document, fullPath: filePath };
    }

    /**
     * Verzamelt globale context uit CLAUDE.md
     */
    async collectGlobalContext() {
        const claudeFile = path.join(this.rootDir, 'CLAUDE.md');
        
        if (fs.existsSync(claudeFile)) {
            this.context.global = fs.readFileSync(claudeFile, 'utf8');
            console.log('✅ Globale context geladen (CLAUDE.md)');
        } else {
            console.log('⚠️  Geen CLAUDE.md gevonden in root');
        }
    }

    /**
     * Verzamelt basis context uit CLAUDE_*.md bestanden
     */
    async collectBasisContext(docsType) {
        if (!docsType) return;

        const metaDir = path.join(this.rootDir, docsType, '.meta');
        
        if (!fs.existsSync(metaDir)) {
            console.log(`⚠️  Geen .meta directory gevonden in ${docsType}`);
            return;
        }

        const claudeFiles = fs.readdirSync(metaDir)
            .filter(file => file.startsWith('CLAUDE_') && file.endsWith('.md'))
            .sort(); // Zorg voor consistente volgorde

        for (const file of claudeFiles) {
            const filePath = path.join(metaDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            this.context.basis.push({
                name: path.basename(file, '.md'),
                content: content
            });

            console.log(`✅ Basis context geladen: ${file}`);
        }
    }

    /**
     * Verzamelt categorie context uit _category_meta.md
     */
    async collectCategoryContext(docsType, category) {
        const categoryMetaFile = path.join(this.rootDir, docsType, category, '_category_meta.md');
        
        if (fs.existsSync(categoryMetaFile)) {
            this.context.category = fs.readFileSync(categoryMetaFile, 'utf8');
            console.log(`✅ Categorie context geladen: _category_meta.md`);
        } else {
            console.log(`ℹ️  Geen _category_meta.md gevonden voor categorie: ${category}`);
        }
    }

    /**
     * Verzamelt document-specifieke context uit .meta/document.meta.md
     */
    async collectDocumentContext(docsType, category, document) {
        const documentMetaFile = path.join(this.rootDir, docsType, category, '.meta', `${document}.md`);
        
        if (fs.existsSync(documentMetaFile)) {
            this.context.document = fs.readFileSync(documentMetaFile, 'utf8');
            console.log(`✅ Document context geladen: ${document}.md`);
        } else {
            console.log(`ℹ️  Geen document-specifieke context gevonden voor: ${document}`);
        }
    }

    /**
     * Genereert de finale prompt door alle context samen te voegen
     */
    generatePrompt(pathInfo) {
        let prompt = '';

        // Header
        prompt += `# Claude Code Context voor: ${pathInfo.fullPath}\n\n`;
        prompt += `Gegenereerd op: ${new Date().toISOString()}\n\n`;

        // Laag 1: Globale context
        if (this.context.global) {
            prompt += `## 🌍 Laag 1: Globale Project Context\n\n`;
            prompt += `${this.context.global}\n\n`;
            prompt += `---\n\n`;
        }

        // Laag 2: Basis context
        if (this.context.basis.length > 0) {
            prompt += `## 📋 Laag 2: Basis Context\n\n`;
            
            for (const basis of this.context.basis) {
                prompt += `### ${basis.name}\n\n`;
                prompt += `${basis.content}\n\n`;
            }
            
            prompt += `---\n\n`;
        }

        // Laag 3: Categorie context
        if (this.context.category) {
            prompt += `## 📁 Laag 3: Categorie Context (${pathInfo.category})\n\n`;
            prompt += `${this.context.category}\n\n`;
            prompt += `---\n\n`;
        }

        // Laag 4: Document context
        if (this.context.document) {
            prompt += `## 📄 Laag 4: Document Context (${pathInfo.document})\n\n`;
            prompt += `${this.context.document}\n\n`;
            prompt += `---\n\n`;
        }

        // Footer met instructies
        prompt += `## 🎯 Instructies voor Claude\n\n`;
        prompt += `Je hebt nu alle benodigde context om documentatie te schrijven voor:\n`;
        prompt += `- **Bestand**: ${pathInfo.fullPath}\n`;
        prompt += `- **Type**: ${pathInfo.docsType || 'onbekend'}\n`;
        prompt += `- **Categorie**: ${pathInfo.category || 'geen'}\n`;
        prompt += `- **Document**: ${pathInfo.document || 'geen'}\n\n`;
        
        prompt += `Gebruik alle bovenstaande context lagen in de juiste volgorde:\n`;
        prompt += `1. Globale project richtlijnen\n`;
        prompt += `2. Basis schrijfstijl en terminologie\n`;
        prompt += `3. Categorie-specifieke instructies (indien van toepassing)\n`;
        prompt += `4. Document-specifieke requirements (indien van toepassing)\n\n`;
        
        prompt += `Genereer nu de documentatie volgens deze gelaagde context.\n`;

        return prompt;
    }

    /**
     * Exporteert de verzamelde context naar een bestand
     */
    async exportContext(filePath, outputFile = null) {
        const prompt = await this.collectContext(filePath);
        
        if (!outputFile) {
            // Genereer automatisch een output bestandsnaam
            const pathInfo = this.analyzeFilePath(this.normalizePath(filePath));
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            outputFile = `context_${pathInfo.document || 'document'}_${timestamp}.md`;
        }

        fs.writeFileSync(outputFile, prompt);
        console.log(`\n💾 Context geëxporteerd naar: ${outputFile}`);
        
        return outputFile;
    }

    /**
     * Toont een overzicht van beschikbare context bestanden
     */
    showAvailableContext() {
        console.log('\n📋 Beschikbare context bestanden:\n');

        // Globale context
        const claudeFile = path.join(this.rootDir, 'CLAUDE.md');
        console.log(`🌍 Globaal: ${fs.existsSync(claudeFile) ? '✅' : '❌'} CLAUDE.md`);

        // Zoek alle docs directories
        const docsTypes = fs.readdirSync(this.rootDir)
            .filter(dir => dir.startsWith('docs-') && fs.statSync(path.join(this.rootDir, dir)).isDirectory());

        for (const docsType of docsTypes) {
            console.log(`\n📁 ${docsType}:`);
            
            // Basis context
            const metaDir = path.join(this.rootDir, docsType, '.meta');
            if (fs.existsSync(metaDir)) {
                const claudeFiles = fs.readdirSync(metaDir)
                    .filter(file => file.startsWith('CLAUDE_') && file.endsWith('.md'));
                
                for (const file of claudeFiles) {
                    console.log(`  📋 Basis: ✅ ${file}`);
                }
            }

            // Categorieën
            const categories = fs.readdirSync(path.join(this.rootDir, docsType))
                .filter(item => {
                    const itemPath = path.join(this.rootDir, docsType, item);
                    return fs.statSync(itemPath).isDirectory() && item !== '.meta';
                });

            for (const category of categories) {
                const categoryPath = path.join(this.rootDir, docsType, category);
                const hasCategory = fs.existsSync(path.join(categoryPath, '_category.json'));
                
                if (hasCategory) {
                    console.log(`  📂 ${category}:`);
                    
                    // Categorie meta
                    const categoryMeta = path.join(categoryPath, '_category_meta.md');
                    console.log(`    📁 Categorie: ${fs.existsSync(categoryMeta) ? '✅' : '❌'} _category_meta.md`);
                    
                    // Document meta's
                    const metaDir = path.join(categoryPath, '.meta');
                    if (fs.existsSync(metaDir)) {
                        const docMetas = fs.readdirSync(metaDir)
                            .filter(file => file.endsWith('.md'));
                        
                        for (const meta of docMetas) {
                            console.log(`    📄 Document: ✅ ${meta}`);
                        }
                    }
                }
            }
        }
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const collector = new ContextCollector();

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        console.log(`
🔧 Context Collector voor Claude Code Gelaagde Documentatie

Gebruik:
  node contextCollector.js <bestandspad>              # Toon context voor bestand
  node contextCollector.js <bestandspad> --export    # Exporteer context naar bestand
  node contextCollector.js --overview                 # Toon overzicht van beschikbare context
  node contextCollector.js --help                     # Toon deze help

Voorbeelden:
  node contextCollector.js docs-internal/voorbeeld1/partijen.md
  node contextCollector.js docs-internal/budgetten/engineer-budget.md --export
  node contextCollector.js --overview
        `);
        process.exit(0);
    }

    if (args[0] === '--overview') {
        collector.showAvailableContext();
        process.exit(0);
    }

    const filePath = args[0];
    const shouldExport = args.includes('--export');

    (async () => {
        try {
            if (shouldExport) {
                await collector.exportContext(filePath);
            } else {
                const prompt = await collector.collectContext(filePath);
                console.log('\n' + '='.repeat(80));
                console.log('📝 GEGENEREERDE CONTEXT PROMPT:');
                console.log('='.repeat(80) + '\n');
                console.log(prompt);
            }
        } catch (error) {
            console.error('\n❌ Fout:', error.message);
            process.exit(1);
        }
    })();
}

module.exports = ContextCollector;