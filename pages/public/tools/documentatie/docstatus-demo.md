---
title: '[TEST] docStatus Demo Document'
sidebar_position: 998
docStatus: live
---

# [TEST] docStatus Demo Document

Dit document demonstreert het **docStatus systeem** dat zojuist is geïmplementeerd.

## Huidige Status: `live`

Dit document heeft `docStatus: live` in zijn frontmatter, wat betekent dat het:
- [OK] Zichtbaar is in **alle builds** (development én production)
- [OK] Wordt beschouwd als **productie-klaar**
- [OK] Geschikt is voor **live gebruik**

## Complete Zichtbaarheidsmatrix

Deze tabel toont hoe **beide** systemen (Docusaurus `draft` + ons `docStatus`) samen bepalen of content zichtbaar is:

### Alleen docStatus (zonder draft)

| docStatus | Beschrijving | Local | Staging | Production |
|-----------|-------------|-------|---------|------------|
| `templated` | Template fase | [OK] | [OK] | ❌ |
| `generated` | Auto-gegenereerd | [OK] | [OK] | ❌ |
| `completed` | Afgerond | [OK] | [OK] | [OK] |
| `live` | Actief | [OK] | [OK] | [OK] |
| `locked` | Vergrendeld | [OK] | [OK] | [OK] |

### Met draft: true (ongeacht docStatus)

| draft + docStatus | Beschrijving | Local | Staging | Production |
|-------------------|-------------|-------|---------|------------|
| `draft: true` + `templated` | Draft template | [OK] | ❌ | ❌ |
| `draft: true` + `generated` | Draft gegenereerd | [OK] | ❌ | ❌ |
| `draft: true` + `completed` | Draft compleet | [OK] | ❌ | ❌ |
| `draft: true` + `live` | Draft live | [OK] | ❌ | ❌ |
| `draft: true` + `locked` | Draft vergrendeld | [OK] | ❌ | ❌ |

### Samengevat: Wanneer is content zichtbaar?

**[OK] Zichtbaar wanneer:**
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
