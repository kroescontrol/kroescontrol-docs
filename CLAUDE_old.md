# CLAUDE.md

Dit bestand biedt richtlijnen voor Claude Code (claude.ai/code) bij het werken met code in deze repository.

## Projectoverzicht

Dit is een Docusaurus-gebaseerde documentatiesite voor Kroescontrol, met interne werkprocessen en procedures. De documentatie richt zich voornamelijk op Kroescontrol, met informatie over algemene processen, onboarding, budgetten en tools.

## Huidige Migratieproject

Dit project bevindt zich in een migratiefase met de volgende doelen:
- Scheiden van publieke en interne documentatie
- Beveiligen van gevoelige informatie met git-crypt
- Implementeren van GitHub-authenticatie voor interne content
- Verplaatsen van GitHub Pages naar Vercel (met behoud van publieke site op GitHub Pages)

De huidige migratieplannen zijn gedocumenteerd in de `.tijdelijk/` directory (niet ingecheckt in git):
- **COMPACTING_SUMMARY.md**: Samenvatting van het project
- **HOWTO-voorwerk-vercel.md**: Voorbereidingswerk voor migratie
- **HOWTO-migratie-vercel.md**: Stappen voor implementatie
- **HOWTO-PUBLIC-DEPLOY.md**: Gids voor de publieke deployment

## Repository Structuur

- `/docs/`: Bevat alle documentatie-inhoud georganiseerd in categorieën
  - `/public/`: Openbare informatie
    - `/algemeen/`: Algemene informatie over Kroescontrol
    - `/werken-bij/`: Informatie voor potentiële werknemers
    - `/kennismaking/`: Introductie tot Kroescontrol-functies
    - `/branding/`: Logo's, kleuren en huisstijl informatie
    - `/tools/`: Publieke documentatie over tools
  - `/internal/`: Interne documentatie voor medewerkers (beveiligd met git-crypt)
    - `/primaire-arbeidsvoorwaarden/`: Informatie over contracten, pensioen, etc.
    - `/budgetten/`: Details over Engineer Budget, Mobility Budget, etc.
    - `/tools/`: Documentatie voor interne tools en systemen
    - `/onboarding/`: Proces voor nieuwe medewerkers
    - `/faq/`: Veelgestelde vragen
  - `/operation/`: Operationele documentatie (beveiligd met git-crypt)
    - Planning, resource management en klantcommunicatie
  - `/finance/`: Financiële documentatie (beveiligd met git-crypt)
    - Boekhouding, facturatie, BTW
  - `/_meta/`: Bevat prompts en richtlijnen voor AI-contentgeneratie (spiegelt de docs-structuur)
- `/old/`: Bevat bronmateriaal voor documentatiegeneratie (niet ingecheckt in git)
  - `/primaireshiz/`: Templates en handboeken
  - `/werkafspraken2.0/`: Werkafspraken en budgetstructuren
- `/src/`: Bevat React-componenten en CSS voor het Docusaurus-thema
  - `/plugins/`: Custom Docusaurus plugins
  - `/theme/`: Aanpassingen aan het Docusaurus-thema
- `/static/`: Bevat statische assets zoals afbeeldingen en logo's
  - `/branding/`: Huisstijl materialen
  - `/img/`: Algemene afbeeldingen

## Belangrijke Configuratiebestanden

- `docusaurus.config.js`: Hoofdconfiguratiebestand voor de Docusaurus-site
- `sidebars.js`: Definieert de zijbalkstructuur (automatisch gegenereerd)
- `generate-sidebar.js`: Script dat automatisch de zijbalkstructuur genereert
  - Ondersteunt PUBLIC_ONLY modus, waarin de "Publieke Documentatie" hoofdcategorie wordt verwijderd en subcategorieën direct worden getoond
  - In PUBLIC_ONLY modus worden alle hoofdcategorieën automatisch geëxpandeerd weergegeven
- `.env.example`: Voorbeeld van omgevingsvariabelen (kopieer naar .env voor lokaal gebruik)
- `.gitignore`: Configuratie voor uitgesloten bestanden in git

## Veelgebruikte Commando's

### Installatie
```bash
npm install
```

### Lokale Ontwikkeling
```bash
npm start
```
Start een lokale ontwikkelingsserver en opent een browservenster. De meeste wijzigingen worden direct weergegeven zonder de server te herstarten.

### Bouwen
```bash
npm run build
```
Genereert statische content in de `build`-directory die kan worden geserveerd via elke statische content hosting service.

### Cache Wissen
```bash
npm run clear
```
Wist Docusaurus-cache en node_modules-cache.

### Deployment
```bash
npm run deploy
```
Bouwt de site en deploy deze (inclusief het uitvoeren van generate-sidebar.js).

## Het Gelaagde Promptmodel

Deze repository gebruikt een gelaagd promptmodel voor AI-contentgeneratie met drie lagen:

### Laag 1: Basis (.meta/ in root van docs-internal)
- **CLAUDE_basis.md**: Schrijfstijl, terminologie en tone-of-voice
- **CLAUDE_structuur.md**: Directory structuur en organisatie
- **CLAUDE_toegangsniveaus.md**: Toegangsniveaus en beveiliging
- **CLAUDE_perspectieven.md**: Verschillende perspectieven (medewerker, manager, etc.)

### Laag 2: Categorie (.meta/ in elke categorie directory)
- Specifieke instructies voor die documentatiecategorie
- Verwijzingen naar relevante bronmaterialen
- Categorie-specifieke structuren en conventies

### Laag 3: Document (.meta/[document].md)
- Document-specifieke prompts en instructies
- Verwijzingen naar bronbestanden in `/old/` directory
- Specifieke context en requirements voor dat document

### Gebruik van het Gelaagde Model
1. **Basis prompts**: Deze worden altijd toegepast en definiëren de fundamentele schrijfstijl
2. **Categorie prompts**: Deze verfijnen de basis voor specifieke documenttypes
3. **Document prompts**: Deze geven specifieke instructies voor individuele documenten

### Het _meta Directory Workflow

De `_meta`-directory is een cruciaal onderdeel van de documentatieworkflow. Het bevat promptbestanden die worden gebruikt om AI-contentgeneratie te sturen voor corresponderende documenten in de hoofddocumentstructuur.

### Structuur en Doel
- De `_meta`-directory weerspiegelt de structuur van de `/docs`-directory
- Elk document in `/docs` kan een bijbehorend promptbestand hebben in `/_meta`
- Deze promptbestanden bieden context en instructies voor AI bij het genereren van content

### Gebruik van _meta Bestanden
1. **Het juiste _meta bestand vinden**: 
   - Bijvoorbeeld, om `/docs/internal/budgetten/kroescontrol/engineer-budget.md` bij te werken, zoek naar `/_meta/internal/budgetten/kroescontrol/engineer-budget.md`

2. **_meta bestandsstructuur begrijpen**:
   - Elk _meta bestand bevat:
     - Een titel die overeenkomt met de documenttitel
     - Een promptsectie tussen backticks (```) die specifieke instructies bevat
     - Een "Bronnen"-sectie die verwijst naar bronmaterialen in de `/old/`-directory
     - Een "Aantekeningen"-sectie met aanvullende context

3. **Content bijwerken**:
   - Werk de prompt in het _meta bestand bij met specifieke instructies
   - Verwijs naar de exacte bronbestanden in `/old/` die moeten worden gebruikt
   - Vraag AI om content te genereren op basis van de bijgewerkte prompt
   - De AI zal zowel de prompt als de gerefereerde bronmaterialen gebruiken

### Belangrijk
- **Behoud altijd zowel de `/old/` als de `/_meta/` directories** - ze werken samen voor AI-contentgeneratie
- De `/old/`-directory bevat bronmaterialen die niet moeten worden gewijzigd
- De `/_meta/`-directory bevat prompts die kunnen worden bijgewerkt

## Content Conventies

- Elk document gebruikt een consistente structuur met frontmatter
- Standaardsecties zijn:
  - Introductieparagraaf
  - "Belangrijkste punten" 
  - "Gedetailleerde informatie"
  - "Veelgestelde vragen" (optioneel, alleen toevoegen indien relevant voor het onderwerp)
- Technische focus ligt op Kubernetes, Cloud Native, Observability en SRE Engineering

### Author Richtlijnen

Bij het werken met git commits, documentatie en content creatie:

**Author Conventies:**
- Gebruik altijd "Serge Kroes" als author in frontmatter en metadata
- Vermeld nooit "Claude", "Claude Code", of "AI-gegenereerd" in commit berichten
- Schrijf commit berichten in eerste persoon alsof je de ontwikkelaar bent
- Schrijf documentatie vanuit het perspectief van het team/organisatie, niet als AI assistent

**Schrijfstijl:**
- Commit berichten zoals: "Voeg nieuwe feature X toe" of "Los bug op in Y"
- NIET zoals: "Claude voegt feature X toe" of "Gegenereerd door Claude"
- In documentatie gebruik: "Dit document beschrijft..." of "We raden aan..."
- NIET: "Claude heeft dit gegenereerd" of "AI-gecreëerde content"

### Frontmatter Opties

```md
---
title: Documenttitel                # Verplicht - titel van de pagina
sidebar_position: 1                # Verplicht - positie in de zijbalk (lagere nummers komen eerst)
description: Korte beschrijving    # Verplicht - voor SEO en voorvertoningen
tags: [kubernetes, cloud]          # Verplicht - voor categorisatie en filtering
keywords: [k8s, observability]     # Verplicht - extra trefwoorden voor SEO
last_update:                       # Verplicht - datum van laatste update
  date: 2025-05-21                 
  author: Serge Kroes              # Altijd "Serge Kroes" gebruiken              
image: /img/logo.svg               # Verplicht - voor sociale media voorvertoningen (standaard logo)
slug: /custom-url                  # Optioneel - aangepaste URL
---
```

## Deployment Ondersteuning

### Publieke Site Deploy
Voor het deployen van alleen de publieke documentatie:
```bash
./deploy-public-only.sh
```
Dit script:
1. Genereert de sidebar in PUBLIC_ONLY modus (zonder "Publieke Documentatie" hoofdcategorie)
2. Configureert de juiste URL en instellingen voor de publieke site
3. Maakt een tijdelijke .env zonder API keys voor beveiliging tijdens build
4. Bouwt alleen de publieke inhoud
5. Deployt naar de kroescontrol-public GitHub repository via de gh-pages branch

### Git-crypt voor Beveiliging
Voor beveiliging van gevoelige interne documentatie gebruiken we git-crypt:
- Zie `/docs/public/tools/documentatie/git-crypt-handleiding.md` voor gedetailleerde instructies
- Alle documenten in `/docs/internal/`, `/docs/operation/` en `/docs/finance/` worden versleuteld
- Nieuwe gebruikers moeten hun GPG sleutel delen met een repository beheerder

## Geheugennotities

- Communiceer in Nederlands
- De migratieplannen bevinden zich in de `.tijdelijk/` directory
- De publieke site wordt tijdelijk gedeployed naar public.kroescontrol.nl via GitHub Pages
- De interne site zal uiteindelijk worden gedeployed naar docs.kroescontrol.nl via Vercel
- Voor deployment naar de publieke site wordt het script deploy-public-only.sh gebruikt
- OpenAI API key in de .env wordt veilig behandeld en niet meegenomen in de publieke site deployment