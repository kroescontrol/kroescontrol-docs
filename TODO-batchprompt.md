# TODO: Batch Processing Prompt voor Legacy Content Migratie

## Doel van deze Prompt

Deze prompt verwerkt specifieke legacy content uit `./old/` in manageable chunks naar de nieuwe docs-* structuur. Werkt samen met mapping matrix uit TODO-mappingprompt.md voor systematische migratie.

## Prompt Template

### Context Setup
```markdown
**TAAK**: Verwerk specifieke legacy content naar nieuwe documentatie structuur

**VERPLICHTE CLAUDE MODULE REFERENTIES:**
LEES EERST deze modules voordat je begint:
- `./docs-internal/tools/claudecode/prompt/CLAUDE_basis.md` - Author conventies en schrijfstijl
- `./docs-internal/tools/claudecode/prompt/CLAUDE_content.md` - Documentatie standaarden  
- `./docs-internal/tools/claudecode/prompt/CLAUDE_docstatus.md` - Status systeem en frontmatter
- `./docs-internal/tools/claudecode/prompt/CLAUDE_structuur.md` - Repository organisatie

**REPOSITORY CONTEXT:**
- macOS pad: `/Users/serkroes/Workspace/kroescontrol-docs/`
- Legacy bron: `./old/[specifieke directory]/`
- Doel mapping: Uit TODO-mappingprompt.md resultaten

**AUTHOR CONVONTIES (KRITIEK):**
- Gebruik ALTIJD "Serge Kroes" als author in frontmatter
- Schrijf vanuit team perspectief, niet als AI assistant
- Geen verwijzing naar Claude/AI in content

**EXISTING CONTENT INTEGRATION (VERPLICHT):**
- Controleer ALTIJD op bestaande content in doellocatie
- Bij overlap: merge unieke content in bestaand document
- Bij duplicates: update/vervang verouderde delen
- Behoud bestaande links en referenties waar mogelijk

**DOCS-PUBLIC/ SPECIALE BEHANDELING:**
- docs-public/ content is gereviewed en live - extra voorzichtig
- Alleen uitbreiden waar logisch (niet overschrijven)
- Bij publieke content: voeg sectie toe met doorverwijzing naar interne docs
- Markeer alle docs-public/ wijzigingen voor EXTRA REVIEW
```

### Input Specificaties
```markdown
**INPUT VOOR DEZE BATCH:**

1. **Legacy Bestanden (selectief 1-3 tegelijk):**
   [Plak hier specifieke oude bestanden uit `./old/`]

2. **Mapping Context:**
   ```json
   {
     "source": "./old/[directory]/[file.md]",
     "target": "./docs-[type]/[category]/[new-name.md]",
     "action": "migrate|restructure|consolidate",
     "priority": "high|medium|low"
   }
   ```

3. **Specifieke Instructies:**
   [Eventuele speciale aandachtspunten of constraints]
```

### Processing Guidelines
```markdown
**VERWERKING STAPPEN:**

### Stap 1: Content Analyse
- **Scan bestaande content**: Lees doellocatie en gerelateerde documenten
- Bepaal inhoud relevantie (huidig vs verouderd)
- Identificeer duplicate informatie tussen legacy en existing content
- Check compliance met nieuwe content conventies uit CLAUDE_content.md
- **Merge strategie**: Bepaal hoe legacy content past bij existing content

### Stap 2: Structuur Transformatie
- Volg document template uit CLAUDE_content.md:
  ```markdown
  # Hoofdtitel
  Introductie paragraaf
  ## Belangrijkste Punten (bullets)
  ## Gedetailleerde Informatie  
  ## Veelgestelde Vragen (optioneel)
  ```

### Stap 3: Frontmatter Setup
Gebruik EXACT deze template uit CLAUDE_docstatus.md:
```yaml
---
title: "Descriptieve Titel"
sidebar_position: [logisch nummer]
description: "Korte beschrijving voor SEO"
tags: [relevante, tags, lijst]
keywords: [seo, keywords, lijst]
last_update:
  date: 2025-05-28T00:00:00.000Z
  author: Serge Kroes
image: /img/logo.svg
docStatus: generated  # Gebruik 'generated' voor gemigreerde content
---
```

### Stap 4: Content Vervijning
- Nederlands voor interne docs (docs-internal, docs-finance, docs-operation)
- Kroescontrol terminologie uit CLAUDE_basis.md
- Praktische focus met uitvoerbare instructies
- Code blocks met syntax highlighting

### Stap 5: Publieke Content Doorverwijzing (indien docs-public/)
Voor publieke documenten die interne vervolgstappen hebben:
```markdown
## Meer informatie

Uitgebreide documentatie is beschikbaar in onze [interne sectie](link naar docs-internal) voor medewerkers.
```
```

### Output Format
```markdown
**GEWENSTE OUTPUT PER BESTAND:**

1. **Nieuwe Bestandspad:** `./docs-[type]/[category]/[filename].md`

2. **Complete Inhoud:** 
   ```markdown
   [Volledige frontmatter + content volgens templates]
   ```

3. **Migratie Summary:**
   ```markdown
   ## Migratie Notities
   - **Bron**: `./old/[path]/[file]`
   - **Doel**: `./docs-[type]/[category]/[new-name.md]` 
   - **Wijzigingen**: [Lijst van belangrijke aanpassingen]
   - **TODO**: [Eventuele vervolgacties]
   - **Oude bestand actie**: ✅-VERWERKT-[originele-naam].md
   ```

4. **Status Tracking:**
   ```bash
   # Commando voor marking processed file:
   mv "./old/[directory]/[file].md" "./old/[directory]/✅-VERWERKT-[file].md"
   ```

5. **Link Update Tracking:**
   ```markdown
   ## Links die update nodig hebben:
   - `./docs-internal/faq/tools.md` → Update link naar nieuwe onboarding locatie
   - `./docs-internal/index.md` → Voeg link toe naar nieuwe proces-overzicht
   - `[andere files met oude links]`
   ```

6. **Interactieve Feedback:**
   ```markdown
   ## Status Check
   ✅ File 1 van 3 succesvol gemigreerd (docStatus: generated)
   
   **Volgende actie?**
   - [CONTINUE] → Ga door met file 2
   - [REVIEW] → Toon gemigreerde content voor review
   - [ADJUST] → Pas mapping aan voor volgende files
   - [FINALIZE] → Upgrade docStatus naar 'completed' voor batch
   - [STOP] → Pauzeer migratie voor nu
   ```

7. **Post-Migration Status Update:**
   ```markdown
   ## Finaliseer Batch
   Wanneer alle files gereviewed en goedgekeurd zijn:
   
   **Update docStatus van generated → completed:**
   - File1: docs-internal/onboarding/proces.md
   - File2: docs-internal/tools/setup.md
   - File3: docs-public/intro.md (⚠️ EXTRA REVIEWED)
   ```
```

### Quality Checklist
```markdown
**VALIDATIE VOORDAT AFRONDING:**

**Frontmatter Check:**
- [ ] `title` - Duidelijke, descriptieve naam
- [ ] `sidebar_position` - Logische nummering  
- [ ] `description` - SEO-vriendelijke beschrijving
- [ ] `tags` - Relevante categorieën
- [ ] `keywords` - Searchable termen
- [ ] `last_update.author: Serge Kroes` - VERPLICHT
- [ ] `docStatus: generated` - Voor gemigreerde content
- [ ] `image: /img/logo.svg` - Standaard logo

**Content Check:**
- [ ] Nederlandse taal (behalve docs-public als Engels gewenst)
- [ ] Consistente Kroescontrol terminologie
- [ ] Praktische, uitvoerbare instructies
- [ ] Code blocks met syntax highlighting
- [ ] Logische document structuur (H1/H2/H3)
- [ ] Links naar gerelateerde documentatie waar relevant

**Security Check:**
- [ ] Geen gevoelige informatie in verkeerde directory
- [ ] Git-crypt directories gebruikt voor internal/operation/finance
- [ ] Publieke content alleen in docs-public
- [ ] **docs-public/ wijzigingen gemarkeerd voor EXTRA REVIEW**

**Migration Check:**
- [ ] Alle relevante informatie overgenomen
- [ ] Verouderde info gefilterd/bijgewerkt
- [ ] **Existing content** gecontroleerd op duplicates/overlap
- [ ] **Merge strategy** toegepast waar nodig
- [ ] Duidelijke migratie notities
- [ ] Oude bestand gemarkeerd voor ✅-VERWERKT- prefix
- [ ] **docStatus: generated** gezet voor alle nieuwe/aangepaste files

**Post-Review Finalization:**
- [ ] **docStatus: generated → completed** na goedkeuring
- [ ] Alle files in batch hebben consistent status niveau
```

## Execution Templates

### Template A: Direct Migration
Voor content die 1:1 kan worden overgenomen:
```markdown
**INPUT**: Legacy file uit ./old/[directory]/
**ACTION**: Frontmatter toevoegen + structuur aanpassen
**OUTPUT**: Klaar voor docs-[type]/[category]/
```

### Template B: Restructure & Consolidate  
Voor content die samengevoegd moet worden:
```markdown
**INPUT**: Meerdere legacy files met overlap
**ACTION**: Consolideren + nieuwe structuur
**OUTPUT**: Eén of meerdere nieuwe documenten
```

### Template C: Complete Rewrite
Voor sterk verouderde content:
```markdown
**INPUT**: Legacy file als referentie + requirements
**ACTION**: Nieuwe content schrijven met oude als basis
**OUTPUT**: Modern document volgens huidige standaarden
```

### Template D: Partial Migration
Voor files waarvan alleen delen relevant zijn:
```markdown
**INPUT**: Legacy file met deels bruikbare content
**ACTION**: Selecteer en migreer alleen relevante secties
**OUTPUT**: Gefocust document met essentiële informatie
**NOTE**: Rest van content markeren als "niet gemigreerd"
```

### Template E: Merge Into Existing
Voor legacy content die toegevoegd moet worden aan bestaand document:
```markdown
**INPUT**: Legacy file + existing document in target location
**ACTION**: 
1. Identificeer unieke content in legacy file
2. Integreer in bestaande structuur
3. Update/vervang verouderde delen
4. Behoud bestaande links
**OUTPUT**: Enhanced existing document met legacy content geïntegreerd
**NOTE**: Originele document structuur behouden waar mogelijk
```

## TODO Items voor Implementation

### Phase 1: Prompt Testing
- [ ] Test batch prompt met 1 simpel legacy file eerst
- [ ] Valideer output voldoet aan alle Claude module requirements
- [ ] Check dat ✅-VERWERKT- markering systeem werkt

### Phase 2: Workflow Integration
- [ ] **MOGELIJKE CLAUDE MODULE UPDATE**: Check of CLAUDE_workflow.md migration workflow sectie nodig heeft
- [ ] **MOGELIJKE CLAUDE MODULE UPDATE**: Check of CLAUDE_docstatus.md uitbreiding nodig heeft voor migration status
- [ ] Setup validation scripts voor gemigreerde content

### Phase 3: Batch Processing Setup
- [ ] Create workflow voor systematic processing per priority batch
- [ ] Setup rollback procedure als migration mislukt
- [ ] Document lessons learned voor volgende batches
- [ ] Define success criteria: wanneer is batch "compleet"
- [ ] Create simple rollback script voor snel terugdraaien

## Specifieke Kroescontrol Context

### Content Types Verwacht in Legacy:
- **HR Procedures**: Onboarding, personeelsregistratie, HoorayHR
- **Budget Reglementen**: Engineer/Mobility budget, formules, tracking
- **Operationele Processen**: Facturatie, loonadministratie, compliance
- **Tool Documentatie**: Engineer Hub, Clockify, Google Workspace
- **Bedrijfsinformatie**: Branding, arbeidscontracten, personeelshandboek

### Access Level Decisions:
```markdown
**docs-public**: Branding, werving, algemene bedrijfsinfo
**docs-internal**: Procedures, tools, onboarding, budgetten
**docs-operation**: Management, strategische documenten  
**docs-finance**: Facturatie, boekhouding, compliance, CAO
```

## Example Execution

```markdown
**BATCH INPUT:**
Legacy file: `./old/HR en onboarding/Beschrijving van fase in Onboarding Proces.md`
Target: `./docs-internal/onboarding/process-overzicht.md`
Action: restructure

**RESULT:**
- Nieuwe file met correcte frontmatter
- Nederlandse content volgens conventies
- Logical H1/H2/H3 structuur  
- docStatus: generated
- Migratie notities met oude bestand markering
```

## Rollback Instructies

Als migratie mislukt of ongewenst resultaat:
```bash
# Voor enkele file:
mv "./old/[directory]/✅-VERWERKT-[file].md" "./old/[directory]/[file].md"
rm "./docs-[type]/[category]/[new-file].md"

# Voor complete batch:
git checkout -- ./docs-[type]/[category]/
cd ./old/[directory]/ && for f in ✅-VERWERKT-*; do mv "$f" "${f#✅-VERWERKT-}"; done
```

## Success Criteria

Een migratie batch is **compleet** wanneer:
- [ ] Alle files in batch zijn verwerkt (migrate/skip/archive)
- [ ] Nieuwe documenten voldoen aan quality checklist
- [ ] Links zijn bijgewerkt in gerelateerde documenten
- [ ] Oude files zijn gemarkeerd met ✅-VERWERKT-
- [ ] Review door menselijke operator is goedgekeurd
- [ ] **docStatus updated**: `generated` → `completed` voor alle gemigreerde files

---

**Status**: Enhanced met interactieve features en rollback opties
**Dependencies**: Mapping advies uit TODO-mappingprompt.md  
**Next**: Test execution met simpele legacy file