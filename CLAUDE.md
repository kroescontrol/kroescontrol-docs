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

- `/docs-public/`: Bevat publieke documentatie-inhoud
  - `/algemeen/`: Algemene informatie over Kroescontrol
  - `/werken-bij/`: Informatie voor potentiële werknemers
  - `/kennismaking/`: Introductie tot Kroescontrol-functies
  - `/branding/`: Logo's, kleuren en huisstijl informatie
  - `/tools/`: Publieke documentatie over tools
  - `/freelancecontrol/`: Informatie over FreelanceControl
- `/docs-internal/`: Interne documentatie voor medewerkers (beveiligd met git-crypt)
  - `/primaire-arbeidsvoorwaarden/`: Informatie over contracten, pensioen, etc.
  - `/budgetten/`: Details over Engineer Budget, Mobility Budget, etc.
  - `/tools/`: Documentatie voor interne tools en systemen
  - `/onboarding/`: Proces voor nieuwe medewerkers
  - `/faq/`: Veelgestelde vragen
  - `/administratie/`: HR en administratieve zaken
- `/docs-operation/`: Operationele documentatie (beveiligd met git-crypt)
  - Planning, resource management en klantcommunicatie
- `/docs-finance/`: Financiële documentatie (beveiligd met git-crypt)
  - Boekhouding, facturatie, BTW
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

## Het .meta Directory Workflow

De `.meta`-directories zijn een cruciaal onderdeel van de documentatieworkflow. Deze bevinden zich binnen elke docs-directory en bevatten promptbestanden die worden gebruikt om AI-contentgeneratie te sturen voor corresponderende documenten.

### Structuur en Doel
- Elke docs-directory heeft een `.meta`-subdirectory die de documentstructuur weergeeft
- Elk document kan een bijbehorend promptbestand hebben in de corresponderende `.meta`-directory
- Deze promptbestanden bieden context en instructies voor AI bij het genereren van content

### Gebruik van .meta Bestanden
1. **Het juiste .meta bestand vinden**: 
   - Bijvoorbeeld, om `/docs-internal/budgetten/kroescontrol/engineer-budget.md` bij te werken, zoek naar `/docs-internal/.meta/budgetten/kroescontrol/engineer-budget.md`

2. **.meta bestandsstructuur begrijpen**:
   - Elk .meta bestand bevat:
     - Een titel die overeenkomt met de documenttitel
     - Een promptsectie tussen backticks (```) die specifieke instructies bevat
     - Een "Bronnen"-sectie die verwijst naar bronmaterialen in de `/old/`-directory
     - Een "Aantekeningen"-sectie met aanvullende context

3. **Content bijwerken**:
   - Werk de prompt in het .meta bestand bij met specifieke instructies
   - Verwijs naar de exacte bronbestanden in `/old/` die moeten worden gebruikt
   - Vraag AI om content te genereren op basis van de bijgewerkte prompt
   - De AI zal zowel de prompt als de gerefereerde bronmaterialen gebruiken

### Belangrijk
- **Behoud altijd zowel de `/old/` als de `.meta/` directories** - ze werken samen voor AI-contentgeneratie
- De `/old/`-directory bevat bronmaterialen die niet moeten worden gewijzigd
- De `.meta/`-directories bevatten prompts die kunnen worden bijgewerkt

## Content Conventies

- Elk document gebruikt een consistente structuur met frontmatter
- Standaardsecties zijn:
  - Introductieparagraaf
  - "Belangrijkste punten" 
  - "Gedetailleerde informatie"
  - "Veelgestelde vragen" (optioneel, alleen toevoegen indien relevant voor het onderwerp)
- Technische focus ligt op Kubernetes, Cloud Native, Observability en SRE Engineering

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
  author: Naam Auteur              
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
- Zie `/docs-public/tools/documentatie/git-crypt-handleiding.md` voor gedetailleerde instructies
- Alle documenten in `/docs-internal/`, `/docs-operation/` en `/docs-finance/` worden versleuteld
- Nieuwe gebruikers moeten hun GPG sleutel delen met een repository beheerder

## Geheugennotities

- Communiceer in Nederlands
- De migratieplannen bevinden zich in de `.tijdelijk/` directory
- De publieke site wordt tijdelijk gedeployed naar public.kroescontrol.nl via GitHub Pages
- De interne site zal uiteindelijk worden gedeployed naar docs.kroescontrol.nl via Vercel
- Voor deployment naar de publieke site wordt het script deploy-public-only.sh gebruikt
- OpenAI API key in de .env wordt veilig behandeld en niet meegenomen in de publieke site deployment