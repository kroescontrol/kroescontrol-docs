---
title: '[TEST] docStatus Demo Document'
sidebar_position: 998
docStatus: production
---

# [TEST] docStatus Demo Document

Dit document demonstreert het **docStatus systeem** dat zojuist is geïmplementeerd.

## Huidige Status: `production`

Dit document heeft `docStatus: production` in zijn frontmatter, wat betekent dat het:
- [OK] Zichtbaar is in **alle builds** (development én production)
- [OK] Wordt beschouwd als **productie-klaar**
- [OK] Geschikt is voor **live gebruik**

## Complete Zichtbaarheidsmatrix

Deze tabel toont hoe **beide** systemen (Docusaurus `draft` + ons `docStatus`) samen bepalen of content zichtbaar is:

### Alleen docStatus (zonder draft)

| docStatus | Beschrijving | Local | Staging | Production |
|-----------|-------------|-------|---------|------------|
| `template` | Template fase | [OK] | [OK] | ❌ |
| `dev` | Development | [OK] | [OK] | ❌ |
| `staging` | Staging ready | [OK] | [OK] | 📍 (verborgen in sidebar) |
| `production` | Productie | [OK] | [OK] | [OK] |
| `locked` | Vergrendeld (=production) | [OK] | [OK] | [OK] |

### Met draft: true (ongeacht docStatus)

| draft + docStatus | Beschrijving | Local | Staging | Production |
|-------------------|-------------|-------|---------|------------|
| `draft: true` + `template` | Draft template | [OK] | ❌ | ❌ |
| `draft: true` + `dev` | Draft development | [OK] | ❌ | ❌ |
| `draft: true` + `staging` | Draft staging | [OK] | ❌ | ❌ |
| `draft: true` + `production` | Draft productie | [OK] | ❌ | ❌ |
| `draft: true` + `locked` | Draft vergrendeld | [OK] | ❌ | ❌ |

### Samengevat: Wanneer is content zichtbaar?

**[OK] Zichtbaar wanneer:**
- Local: Altijd (behalve bij onze docStatus filtering)
- Staging: `draft: false` EN (`docStatus: staging|production|locked` OF geen docStatus filtering)
- Production: `draft: false` EN `docStatus: staging|production|locked`

**📍 Zichtbaar maar verborgen uit sidebar:**
- Production: `docStatus: staging` (pagina bestaat, maar niet in navigatie)

**❌ Volledig verborgen wanneer:**
- `draft: true` in Staging/Production (Docusaurus native)
- `docStatus: template|dev` in Production (ons systeem)

## Beschikbare Commando's

```bash
# Toon alle opties
npm run docstatus:help

# Genereer statusrapport
npm run docstatus:report

# Interactieve content generatie
npm run docstatus:generate

# Specifieke acties
node scripts/generateContent.js create docs-public/new-doc.md --topic "Onderwerp"
node scripts/generateContent.js set-status docs-public/existing.md production
node scripts/generateContent.js process-status docs-public template
```

## Test Resultaten

Het systeem is succesvol geïmplementeerd en getest:

- [OK] **Plugin werkt** - Docusaurus plugin correct geïnstalleerd
- [OK] **Filtering actief** - Statussen worden correct gefilterd per build type
- [OK] **Scripts functioneel** - Alle management scripts werken
- [OK] **Build pipeline** - Geïntegreerd in bestaand build proces

## Implementatie Details

- **Plugin locatie**: `src/plugins/filter-docs-by-status/`
- **Scripts locatie**: `scripts/docStatusScripts.js` & `scripts/generateContent.js`
- **Configuratie**: `docusaurus.config.js` (regel 214-228)
- **Dependencies**: gray-matter, commander, axios, glob

---

*Dit document dient als demo en kan worden aangepast of verwijderd na testing.*
