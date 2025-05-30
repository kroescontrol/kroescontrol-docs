# Claude Code Prompt: Docusaurus Multilingual Implementation

## Context
We hebben een Docusaurus site met Nederlandse documentatie op GitHub (publieke bedrijfsdocumentatie). We hebben 4 hoofdsecties, waarvan 1 sectie het publieke gedeelte is. We willen alleen deze publieke sectie in het Engels vertalen (niet als pilot, maar als definitieve keuze).

## Opdracht Fase 1: Setup & Configuration

### Stap 1: i18n Configuratie
1. **Analyseer** de huidige `docusaurus.config.js`
2. **Voeg toe** i18n configuratie:
   ```javascript
   i18n: {
     defaultLocale: 'nl',
     locales: ['nl', 'en'],
     localeConfigs: {
       nl: { label: 'Nederlands', direction: 'ltr' },
       en: { label: 'English', direction: 'ltr' }
     }
   }
   ```
3. **Configureer** URL structuur:
   - Nederlandse versie: `/` (root, geen prefix)
   - Engelse versie: `/en/` prefix
4. **Setup** development-only Engels (afgeschermd van live site)
5. **Test** de configuratie door `npm run docusaurus i18n:copy-to-locale -- --locale en` uit te voeren

### Stap 2: Schrijfstijl & Tone Analyse
Voordat je begint met vertalen:

1. **Analyseer** 3-5 bestaande Nederlandse pagina's uit verschillende secties
2. **Identificeer** onze schrijfstijl kenmerken:
   - Formaliteit niveau (zakelijk/casual)
   - Persoonlijke aanspreekvorm (je/u/jullie)
   - Technische diepgang
   - Voorbeelden en analogieën stijl
   - Structuur patronen (koppen, lijsten, call-outs)
   - Bedrijfsspecifieke terminologie

3. **Documenteer** deze stijlgids voor consistente Engelse vertalingen

### Stap 3: Publieke Sectie Identificatie
1. **Identificeer** de publieke sectie uit de 4 hoofdsecties
2. **Analyseer** de structuur van deze publieke sectie
3. **Maak** een plan voor vertaling van alleen deze sectie

## Opdracht Fase 2: Development-Only English Setup

### Afschermen Engelse versie van productie site
1. **Analyseer** bestaande Vercel environment setup en switches
2. **Configureer** conditional i18n voor environments:
   ```javascript
   // Suggestie voor development + staging Engels, productie alleen NL
   const isDevelopment = process.env.NODE_ENV === 'development';
   const isStaging = process.env.VERCEL_ENV === 'preview'; // of je staging switch
   const showEnglish = isDevelopment || isStaging;
   const locales = showEnglish ? ['nl', 'en'] : ['nl'];
   ```
3. **Setup** language switcher die alleen verschijnt in development/staging
4. **Test** dat:
   - Development: taalwisselaar zichtbaar, beide talen werken
   - Staging: taalwisselaar zichtbaar, beide talen werken  
   - Productie: geen taalwisselaar, alleen Nederlands

### Eerste Vertaling: Basis Pagina's
Voor gevoel krijgen met het proces:

1. **Vertaal** alleen:
   - **Landingspagina** (hoofdpagina van publieke sectie)
   - **Welkom pagina** (slug: `/welkom`)

2. **Behoud** identieke bestandsnamen en mappenstructuur
3. **Configureer** URL routing:
   - NL landingspagina: `/` 
   - NL welkom: `/welkom`
   - EN landingspagina: `/en/`
   - EN welkom: `/en/welcome`

### Kwaliteitscriteria
- **Consistentie** met geanalyseerde Nederlandse stijl
- **Technische accuraatheid** van begrippen
- **Natuurlijk** Engels (niet letterlijke vertaling)
- **Behoud** van markdown structuur en Docusaurus features
- **Passende** Engelse slugs en titles

## Deliverables

### Direct na Fase 1:
- [ ] Werkende i18n configuratie met NL als root (/) en EN als /en/
- [ ] Development-only Engels setup
- [ ] Schrijfstijl analyse rapport van publieke sectie
- [ ] Identificatie van publieke sectie structuur

### Na Fase 2:
- [ ] Vertaalde landingspagina en welkom pagina (development-only)
- [ ] Verificatie van URL routing: / en /welkom (NL), /en/ en /en/welcome (EN)
- [ ] Bevestiging dat productie site alleen Nederlandse versie toont (geen language switcher)
- [ ] Verificatie dat development en staging wel language switcher + Engels hebben
- [ ] Kwaliteitscheck van eerste vertalingen
- [ ] Strategie voor uitrol naar rest van publieke sectie

## Technische Vereisten
- Gebruik bestaande Docusaurus project structuur
- Behoud alle huidige Nederlandse content
- Nederlands blijft op root URL (/) zonder prefix
- Engels krijgt /en/ prefix
- Engels alleen zichtbaar in development en staging, niet op productie site
- Language switcher zichtbaar in development/staging environments
- Test lokaal voordat je wijzigingen commit
- Documenteer conditional deployment setup
- Start klein: alleen landingspagina en welkom pagina

## Output Formaat
Geef per stap:
1. **Concrete acties** die uitgevoerd worden
2. **Code wijzigingen** met uitleg (vooral voor conditional deployment)
3. **Verificatie stappen** om development/staging/productie verschillen te bevestigen
4. **URL testing** om routing te controleren
5. **Volgende stappen** aanbevelingen

Begin met Fase 1 setup en development-only configuratie.
