# Claude Obfuscation Instructies

## Doel
Voor gevoelige documentatie (docs-finance, docs-operation, docs-internal) gebruiken we obfuscated directory en bestandsnamen om repository structuur te verbergen van GitHub bezoekers.

## Obfuscation Script
Gebruik: `node scripts/obfuscate-names.js`

### Commando's
```bash
# Genereer globaal unieke naam (RECOMMENDED)
node scripts/obfuscate-names.js generate

# Genereer random naam (sneller, geen conflict check)  
node scripts/obfuscate-names.js random

# Check of naam bestaat
node scripts/obfuscate-names.js check docs-finance rood-huis

# Genereer uniek voor specifieke directory
node scripts/obfuscate-names.js unique docs-finance
```

## Naamgeving Systeem
Het script genereert combinaties uit 8 categorieën (64 woorden):
- **kleuren**: rood, blauw, groen, geel, wit, zwart, grijs, roze
- **dieren**: hond, kat, vis, vogel, beer, wolf, haas, muis  
- **natuur**: berg, meer, bos, veld, zee, rivier, pad, steen
- **tijd**: dag, nacht, zomer, winter, week, maand, jaar, uur
- **basis**: plan, werk, data, info, kern, basis, start, eind
- **devops**: kube, helm, docker, stack, pipeline, deploy, build, test
- **cloud**: aws, azure, gcp, lambda, bucket, cluster, node, edge
- **linux**: bash, grep, sudo, pipe, cron, ssh, git, vim

**Format**: `woord1-woord2` (bijv: `kube-winter`, `sudo-kat`, `deploy-meer`)

## Workflow voor Nieuwe Documentatie

### 1. Directory Structure
Voor gevoelige content gebruik obfuscated namen:
```
docs-finance/
  rood-huis/           # Was: accounting
    dag-vis.md         # Was: monthly-reports.md
    nacht-berg.md      # Was: annual-budget.md
  
docs-operation/  
  kube-winter/         # Was: infrastructure
    sudo-kat.md        # Was: server-management.md
```

### 2. Clean URLs via Frontmatter
Gebruik `slug` voor logische URLs ondanks obfuscated bestandsnamen:
```yaml
---
title: "Monthly Financial Reports"
slug: /finance/accounting/monthly-reports  
docStatus: production
---
```

### 3. Instructies voor Claude

**Bij het CREËREN van nieuwe gevoelige documentatie:**

1. **Genereer obfuscated naam**:
   ```bash
   node scripts/obfuscate-names.js generate
   ```

2. **Gebruik obfuscated bestandsnaam maar logische slug**:
   ```markdown
   ---
   title: "Budget Planning Process"
   slug: /finance/budget/annual-planning
   docStatus: dev
   ---
   
   # Budget Planning Process
   [content hier]
   ```

3. **Documenteer mapping** (optioneel voor jezelf):
   ```
   kube-winter.md → Budget Planning Process (/finance/budget/annual-planning)
   ```

**Bij het IMPORTEREN van bestaande documentatie:**

1. **Genereer obfuscated directory structuur** voor hele sectie
2. **Verplaats content** naar obfuscated locaties  
3. **Update frontmatter** met juiste slugs
4. **Behoud logische URL structuur** voor gebruikers

## Security Overwegingen

### ✅ Verborgen van GitHub bezoekers:
- Directory namen (bijv: `/finance/accounting` → `/rood-huis`)
- Bestandsnamen (bijv: `budget-2025.md` → `dag-vis.md`)
- Interne structuur patterns

### ✅ Zichtbaar voor ingelogde gebruikers:
- Logische URLs via slug mapping
- Juiste pagina titels
- Normale navigatie ervaring

### ⚠️ Belangrijk:
- Git-crypt zorgt voor content encryptie
- Obfuscation verbergt alleen repository structuur
- URLs zijn zichtbaar op live site (achter OAuth)

## VS Code / Editor Tips
- Gebruik Search & Replace op slug patterns
- Bookmark belangrijke obfuscated bestanden
- Overweeg editor extension voor mapping lookup

## Voorbeeld Mapping File (toekomstig)
```json
{
  "docs-finance/rood-huis/dag-vis.md": {
    "realName": "Monthly Financial Reports", 
    "slug": "/finance/accounting/monthly-reports",
    "category": "accounting"
  }
}
```

---

**Regel**: Gebruik ALTIJD obfuscated namen voor docs-finance, docs-operation en gevoelige docs-internal content. Gebruik clean slugs voor gebruikersgerichte URLs.