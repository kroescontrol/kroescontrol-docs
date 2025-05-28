---
title: "🧪 docStatus Demo Document"
sidebar_position: 998
docStatus: live
---

# 🧪 docStatus Demo Document

Dit document demonstreert het **docStatus systeem** dat zojuist is geïmplementeerd.

## Huidige Status: `live`

Dit document heeft `docStatus: live` in zijn frontmatter, wat betekent dat het:
- ✅ Zichtbaar is in **alle builds** (development én production)
- ✅ Wordt beschouwd als **productie-klaar**
- ✅ Geschikt is voor **live gebruik**

## Complete Zichtbaarheidsmatrix

Deze tabel toont hoe **beide** systemen (Docusaurus `draft` + ons `docStatus`) samen bepalen of content zichtbaar is:

### Alleen docStatus (zonder draft)

| docStatus | Beschrijving | Local | Staging | Production |
|-----------|-------------|-------|---------|------------|
| `templated` | Template fase | ✅ | ✅ | ❌ |
| `generated` | Auto-gegenereerd | ✅ | ✅ | ❌ |
| `completed` | Afgerond | ✅ | ✅ | ✅ |
| `live` | Actief | ✅ | ✅ | ✅ |
| `locked` | Vergrendeld | ✅ | ✅ | ✅ |

### Met draft: true (ongeacht docStatus)

| draft + docStatus | Beschrijving | Local | Staging | Production |
|-------------------|-------------|-------|---------|------------|
| `draft: true` + `templated` | Draft template | ✅ | ❌ | ❌ |
| `draft: true` + `generated` | Draft gegenereerd | ✅ | ❌ | ❌ |
| `draft: true` + `completed` | Draft compleet | ✅ | ❌ | ❌ |
| `draft: true` + `live` | Draft live | ✅ | ❌ | ❌ |
| `draft: true` + `locked` | Draft vergrendeld | ✅ | ❌ | ❌ |

### Samengevat: Wanneer is content zichtbaar?

**✅ Zichtbaar wanneer:**
- Local: Altijd (behalve bij onze docStatus filtering)
- Staging: `draft: false` EN (`docStatus: completed|live|locked` OF geen docStatus filtering)
- Production: `draft: false` EN `docStatus: completed|live|locked`

**❌ Verborgen wanneer:**
- `draft: true` in Staging/Production (Docusaurus native)
- `docStatus: templated|generated` in Production (ons systeem)

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
node scripts/generateContent.js set-status docs-public/existing.md completed
node scripts/generateContent.js process-status docs-public templated
```

## Test Resultaten

Het systeem is succesvol geïmplementeerd en getest:

- ✅ **Plugin werkt** - Docusaurus plugin correct geïnstalleerd
- ✅ **Filtering actief** - Statussen worden correct gefilterd per build type
- ✅ **Scripts functioneel** - Alle management scripts werken
- ✅ **Build pipeline** - Geïntegreerd in bestaand build proces

## Implementatie Details

- **Plugin locatie**: `src/plugins/filter-docs-by-status/`
- **Scripts locatie**: `scripts/docStatusScripts.js` & `scripts/generateContent.js`
- **Configuratie**: `docusaurus.config.js` (regel 214-228)
- **Dependencies**: gray-matter, commander, axios, glob

---

*Dit document dient als demo en kan worden aangepast of verwijderd na testing.*