# HOWTO: Sectie-specifieke Status Rapporten

> **Status:** Concept/Toekomstige verbetering  
> **Complexity:** Laag (1-2 uur implementatie)  
> **Prerequisite:** Huidige StatusReport systeem

## 🎯 Doel

Uitbreiden van het huidige centrale `/statusreport` systeem met sectie-specifieke rapporten zoals:
- `/internal/statusreport` - Alleen docs-internal documenten
- `/finance/statusreport` - Alleen docs-finance documenten  
- `/operation/statusreport` - Alleen docs-operation documenten
- `/statusreport` - Blijft algemeen overzicht

## 🏗️ Huidige Architectuur

Het `scripts/statusReport.js` systeem heeft al:
- ✅ Directory scanning per docs-* folder
- ✅ Directory statistieken (`this.stats.byDirectory`)
- ✅ Modulaire scan functionaliteit
- ✅ Configureerbare output paths

## 💡 Implementatie Strategie

### Option 1: Parameter-based Filtering

**Constructor uitbreiden:**
```javascript
class DocumentationStatusReporter {
    constructor(rootDir = process.cwd(), filterDirectory = null) {
        this.rootDir = rootDir;
        this.filterDirectory = filterDirectory; // bijv. 'docs-internal'
        this.documents = [];
        // ...
    }
}
```

**Scan logica aanpassen:**
```javascript
scanDocuments() {
    console.log('🔍 Scanning documentation directories...\n');
    
    let docsDirectories = fs.readdirSync(this.rootDir)
        .filter(dir => dir.startsWith('docs-') && fs.statSync(path.join(this.rootDir, dir)).isDirectory())
        .sort();

    // Filter op specifieke directory indien meegegeven
    if (this.filterDirectory) {
        docsDirectories = docsDirectories.filter(dir => dir === this.filterDirectory);
        console.log(`Filtering for: ${this.filterDirectory}\n`);
    }

    // Rest van logica blijft hetzelfde...
}
```

### Option 2: Multiple Report Generation

**Pre-build script uitbreiden:**
```javascript
// In package.json scripts of nieuwe script file
async function generateAllReports() {
    // Algemeen rapport (huidige functionaliteit)
    const generalReporter = new DocumentationStatusReporter();
    await generalReporter.generateReport();

    // Sectie-specifieke rapporten
    const sections = ['docs-internal', 'docs-finance', 'docs-operation', 'docs-public'];
    
    for (const section of sections) {
        const sectionReporter = new DocumentationStatusReporter('.', section);
        await sectionReporter.generateSectionReport(section);
    }
}
```

**Output file configuratie:**
```javascript
async generateSectionReport(section) {
    const markdown = await this.generateMarkdownReport();
    const sectionName = section.replace('docs-', '');
    const outputPath = path.join(this.rootDir, section, `_statusreport.md`);
    
    // Custom slug voor sectie
    const customSlug = `/${sectionName}/statusreport`;
    
    // Pas markdown aan voor sectie-specifieke slug
    const sectionMarkdown = markdown.replace(
        'slug: /statusreport',
        `slug: ${customSlug}`
    );
    
    fs.writeFileSync(outputPath, sectionMarkdown, 'utf8');
    console.log(`📄 Sectie rapport opgeslagen: ${outputPath}`);
}
```

## 🎨 UX Verbeteringen

### Compacte Sectie Rapporten

**Minder details in sectie rapporten:**
- Geen "Alle Documenten" lijst (te groot)
- Focus op sectie-specifieke statistieken
- Snellere laadtijden

**Cross-referenties:**
```markdown
## 📋 Volledige Rapportage

Voor **cross-sectie statistieken** en **volledig overzicht**:

➡️ **[Bekijk centrale status rapportage](/statusreport)**
```

### Aangepaste Frontmatter per Sectie

```javascript
// Sectie-specifieke titles en descriptions
const sectionConfig = {
    'docs-internal': {
        title: 'Internal Documentation Status Report',
        description: 'Status rapport van interne documentatie en workflows'
    },
    'docs-finance': {
        title: 'Finance Documentation Status Report', 
        description: 'Status rapport van financiële documentatie en processen'
    }
    // etc...
};
```

## 🔧 Implementatie Stappen

### Stap 1: Constructor Parameter
1. Voeg `filterDirectory` parameter toe aan constructor
2. Test met `new DocumentationStatusReporter('.', 'docs-internal')`

### Stap 2: Scan Filter Logic  
1. Filter `docsDirectories` array op basis van parameter
2. Voeg logging toe voor gefilterde scans

### Stap 3: Output Configuration
1. Configureerbaar output pad (`docs-internal/_statusreport.md`)
2. Sectie-specifieke slugs (`/internal/statusreport`)

### Stap 4: Pre-build Integration
1. Uitbreiden van `npm run pre-build` script
2. Genereren van alle sectie rapporten in één run

### Stap 5: Link Updates
1. Update links in `_status.md` files naar sectie-specifieke rapporten
2. Cross-referenties naar centraal rapport waar relevant

## 🎯 Voordelen

**Performance:**
- ⚡ Snellere laadtijden per sectie
- 📦 Kleinere rapporten (minder data)
- 🎯 Relevante informatie per context

**UX:**
- 🔍 Gefocuste rapporten per werkgebied
- 📋 Behoud van centraal overzicht
- 🔗 Clear navigation tussen rapporten

**Onderhoud:**
- 🔄 Automatische generatie in build pipeline
- 📊 Consistente data across alle rapporten
- 🛠️ Modulaire architectuur

## 📋 Testing Checklist

- [ ] `npm run pre-build` genereert alle rapporten
- [ ] `/internal/statusreport` toont alleen internal docs
- [ ] `/finance/statusreport` toont alleen finance docs
- [ ] `/statusreport` toont nog steeds volledig overzicht
- [ ] Links tussen rapporten werken correct
- [ ] Performance is verbeterd voor sectie-specifieke views

## 🚀 Future Enhancements

**Advanced filtering:**
- Tag-based filtering binnen secties
- Date range filtering  
- Status-specific views (bijv. alleen drafts)

**Interactive features:**
- Search within reports
- Sorteerbare tabellen
- Export functionaliteit

---

*Dit document beschrijft een toekomstige verbetering van het StatusReport systeem. De huidige implementatie werkt volledig - dit is een optionele uitbreiding voor betere sectie-specifieke UX.*