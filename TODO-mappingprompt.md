# TODO: Mapping Prompt voor Legacy Data Migratie (File-Level Approach)

## Doel van deze Prompt

Deze prompt analyseert individuele files of kleine batches (3-4 samenhangende files) uit `./old/` legacy documentatie. Het geeft per-file mapping advies voor migratie naar de nieuwe docs-* structuur, zodat je controle houdt over elke migratie beslissing.

## Prompt Template

### Context Instructies
```markdown
**TAAK**: Analyseer legacy documentatie en maak strategische mapping naar nieuwe structuur

**REFEREER naar bestaande Claude modules:**
- `./docs-internal/tools/claudecode/prompt/CLAUDE_structuur.md` - Repository organisatie
- `./docs-internal/tools/claudecode/prompt/CLAUDE_content.md` - Content conventies  
- `./docs-internal/tools/claudecode/prompt/CLAUDE_basis.md` - Fundamentele richtlijnen

**INPUT OPTIES:**

**OPTIE A - Single File:**
1. Eén specifiek bestand uit `./old/` voor analyse
2. Complete file content meegeven voor diepere analyse

**OPTIE B - Logische Batch (3-4 files):**
1. Kleine groep samenhangende files (bijv. alle onboarding docs)
2. Files die logisch bij elkaar horen of naar dezelfde sectie gaan

**REPOSITORY CONTEXT:**
- macOS pad: `/Users/serkroes/Workspace/kroescontrol-docs/`
- Git-crypt directories: docs-internal, docs-operation, docs-finance  
- Public directory: docs-public

**EXISTING CONTENT CHECK (VERPLICHT):**
Voordat je mapping advies geeft, controleer ALTIJD:
1. Scan relevante docs-* directories voor bestaande content
2. Gebruik Grep tool om te zoeken naar key termen uit legacy file
3. Check voor mogelijke duplicates of overlap
4. Identificeer waar legacy content kan aanvullen of vervangen
```

### Analyse Framework
```markdown
**MAPPING CRITERIA:**

1. **Content Classification:**
   - Toegangsniveau: public/internal/operational/financial
   - Content type: procedures/reglementen/templates/referenties
   - Doelgroep: nieuwe medewerkers/bestaand team/management/extern

2. **Prioritering Factoren:**
   - Urgentie: dagelijks gebruikt vs archief
   - Complexiteit: direct migreren vs herstructureren  
   - Dependencies: staat-alleen vs gekoppeld aan andere docs

3. **Quality Assessment:**
   - Status: actueel/verouderd/incompleet
   - Herbruikbaarheid: 1:1 copy vs volledige herschrijving
   - Template waarde: uniek vs standaard format
```

### Output Specificaties
```markdown
**GEWENSTE OUTPUT - Per File Analyse:**

Voor elke file een duidelijk advies blok:

## File 1: [bestandsnaam]
**Huidige locatie**: `./old/[path]/[file].md`
**Inhoud samenvatting**: [Korte beschrijving wat het document bevat]
**Status**: [Actueel/Verouderd/Incompleet]

**Existing Content Analysis**:
- **Gevonden in**: `./docs-internal/onboarding/index.md` (70% overlap)
- **Ook gerelateerd**: `./docs-internal/tools/hoorayhr/basis.md`
- **Conclusie**: Legacy file bevat 30% unieke info die toegevoegd kan worden

**Voorstel nieuwe locatie**: `./docs-[type]/[category]/[new-name].md`
**Migratie actie**: [migrate/restructure/consolidate/archive/merge-into-existing]
**Reden**: [Waarom deze keuze]
**Dependencies**: [Links naar andere docs die moeten worden aangepast]
**Aandachtspunten**: [Specifieke issues of updates nodig]

---

## File 2: [volgende bestand]
[zelfde structuur]

---

## Samenhang Analyse (bij batch):
**Relatie tussen files**: [Hoe hangen ze samen]
**Consolidatie mogelijkheden**: [Kunnen files samengevoegd worden]
**Volgorde van migratie**: [Welke eerst, dependencies]

## Beslissing Samenvatting:
- ✅ File 1 → docs-internal/onboarding/proces.md (restructure)
- ✅ File 2 → docs-internal/onboarding/week-1/setup.md (migrate)
- ❌ File 3 → NIET migreren (verouderd, info al elders aanwezig)
- ⏭️ File 4 → SKIP voor nu (review later met stakeholder)

## Quick Decision Helper:
- 🟢 **MIGRATE**: Content is 90%+ actueel, alleen formatting nodig
- 🟡 **RESTRUCTURE**: Goede info maar verkeerd format/structuur
- 🔵 **CONSOLIDATE**: Meerdere files kunnen samen één document worden
- 🟣 **MERGE-INTO-EXISTING**: Voeg unieke delen toe aan bestaand document
- 🌐 **PUBLIC-EXTEND**: Kan docs-public/ logisch uitbreiden (⚠️ EXTRA REVIEW)
- 🔴 **ARCHIVE**: Verouderd of al volledig aanwezig (niet migreren)
- ⏭️ **SKIP**: Onduidelijk, overleg nodig, of voor latere batch

## Groepering Suggesties:
**Nieuwe sectie mogelijkheid**: Files 2, 5, en 7 kunnen samen een nieuwe "Week 1 Complete Setup Guide" vormen

## Bestandsnaam Suggesties:
- `Beschrijving van fase in Onboarding Proces.md` → `onboarding-overzicht.md`
- `INDOCU onboarding spullen.md` → `hardware-software-checklist.md`
- `processbeschrijving uitnodiging HoorayHR.md` → `hoorayhr-account-setup.md`
```

### Execution Richtlijnen
```markdown
**WERKWIJZE VOOR FILE-LEVEL ANALYSE:**

1. **Per File Analyse:**
   - Lees file content grondig
   - **SCAN EERST bestaande docs-* content** voor duplicates/overlap
   - Bepaal actualiteit en relevantie
   - Identificeer beste doellocatie in nieuwe structuur

2. **Mapping Beslissingen:**
   - **MIGRATE**: Voor actuele content die alleen formatting nodig heeft
   - **RESTRUCTURE**: Voor goede content in oude format
   - **CONSOLIDATE**: Voor files met overlappende informatie
   - **MERGE-INTO-EXISTING**: Voor unieke content die toegevoegd kan worden aan bestaand document
   - **ARCHIVE**: Voor verouderde content of content al volledig aanwezig (niet migreren)

3. **Locatie Bepaling:**
   - Gebruik CLAUDE_structuur.md als referentie
   - docs-public: Publiek toegankelijke info die bestaande structuur kan uitbreiden
   - docs-internal: Medewerker procedures, tools, onboarding
   - docs-operation: Management en strategische docs
   - docs-finance: Facturatie, boekhouding, CAO gerelateerd

4. **docs-public/ Beslissing Framework:**
   - **Kan dit publieke content logisch uitbreiden?** (bijv. meer detail bij bestaande intro)
   - **Is dit informatief zonder bedrijfsgevoelige details?**
   - **Voegt dit waarde toe voor potentiële medewerkers/klanten?**
   - **Bij publieke content: voeg sectie toe voor doorverwijzing naar interne docs**

**BELANGRIJK:**
- Bij twijfel tussen directories, kies meest restrictieve (internal > public)
- **docs-public/ wijzigingen: markeer voor EXTRA REVIEW** 
- Geef altijd rationale voor je mapping keuzes
- Identificeer mogelijke consolidaties tussen gerelateerde files
- Markeer files voor ✅-VERWERKT- prefix na succesvolle migratie
```

## TODO Items voor Implementation

### Phase 1: File-Level Testing
- [ ] Test met single file eerst (bijv. een HR document)
- [ ] Test met logische batch van 3-4 gerelateerde files
- [ ] Verfijn output format op basis van menselijke review

### Phase 2: Workflow Optimalisatie
- [ ] Bepaal ideale batch grootte (3-4 files lijkt praktisch)
- [ ] Ontwikkel criteria voor "logisch samenhangende" files
- [ ] Test consolidatie scenario's (meerdere files → één nieuwe)

### Phase 3: Tracking & Validation  
- [ ] Implement ✅-VERWERKT- prefix systeem
- [ ] Maak simpele tracking spreadsheet/lijst
- [ ] Setup review checkpoint na elke batch
- [ ] Progress tracking: "X van Y files verwerkt"
- [ ] Success criteria definiëren per batch

## Input Templates voor Prompt Execution

### Template A: Single File Analyse
```markdown
**TE ANALYSEREN FILE:**
Pad: ./old/HR en onboarding/Beschrijving van fase in Onboarding Proces.md

[Plak hier de complete file content]

**CONTEXT:**
Dit is een standalone analyse voor mapping advies.
```

### Template B: Logische Batch Analyse (3-4 files)
```markdown
**TE ANALYSEREN BATCH:**
Deze files horen logisch bij elkaar:
1. ./old/HR en onboarding/Beschrijving van fase in Onboarding Proces.md
2. ./old/HR en onboarding/INDOCU onboarding spullen.md
3. ./old/HR en onboarding/processbeschrijving uitnodiging HoorayHR.md

[Plak content van elke file met duidelijke scheiding]

**SAMENHANG:**
Deze files behandelen allemaal het onboarding proces.

**SPECIFIEKE VRAAG:**
Kunnen file 2 en 3 gecombineerd worden in één document?
```

## Notities

- **File-Level Control**: Analyseer per file of kleine logische batches voor maximale controle
- **Menselijke Review**: Output is ontworpen voor makkelijke menselijke review en aanpassing
- **Flexibel**: Kan zowel voor single files als samenhangende groepen gebruikt worden
- **No JSON**: Output in leesbaar markdown format, geen complex JSON voor mensen om te debuggen

## Voorbeeld Workflow

1. **Selecteer** 1-4 legacy files die je wilt migreren
2. **Run mapping prompt** voor analyse en advies
3. **Review** de voorgestelde mapping
4. **Pas aan** waar nodig (nieuwe locatie, andere actie)
5. **Gebruik batch prompt** voor daadwerkelijke migratie

## Progress Tracking

```markdown
## Migratie Progress (Update tijdens process)
**Totaal legacy files**: 47
**Verwerkt**: 12 ✅
**Geskipped**: 3 ⏭️
**Gearchiveerd**: 5 🔴
**Nog te doen**: 27

**Huidige batch**: HR & Onboarding (7 files)
- [x] Beschrijving van fase in Onboarding Proces.md
- [x] INDOCU onboarding spullen.md
- [ ] processbeschrijving uitnodiging HoorayHR.md
- [ ] ...
```

---

**Status**: Updated voor file-level approach met tracking features
**Next**: Test met eerste legacy file(s)