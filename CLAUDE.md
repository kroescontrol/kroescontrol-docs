# CLAUDE.md - Kroescontrol Docs

## Project Overzicht

**Repository:** `kroescontrol/kroescontrol-docs` (PUBLIEK op GitHub)  
**Framework:** Nextra (Next.js-gebaseerde documentatie)  
**URL:** https://docs.kroescontrol.nl  
**Doel:** Publieke documentatie voor Kroescontrol engineers en klanten  
**Deployment:** Via vault repository die alle documentatie secties combineert

### Deployment Proces
- **GEEN automatische Vercel deployment** - deze repository heeft geen eigen Vercel project
- **GitHub hook:** Vault repository heeft een periodieke check die wijzigingen detecteert
- **Build trigger:** Vault bouwt en deployed de gecombineerde documentatie site
- **Preview deployments:** Moeten handmatig getriggerd worden via vault

## Directory Structuur

```
docs/
├── pages/                    # Nextra content directory
│   ├── _app.tsx             # Next.js app wrapper
│   ├── _meta.json           # Navigatie structuur
│   ├── index.mdx            # Homepage
│   └── public/              # Publieke documentatie
│       ├── kennismaking/    # Introductie content
│       ├── freelancecontrol/# Freelance model documentatie
│       ├── kantoor/         # Kantoor informatie
│       ├── tools/           # Beschikbare tools
│       └── werken-bij/      # Carrière informatie
├── public/                  # Statische bestanden
│   ├── img/                 # Afbeeldingen en logo's
│   └── assets/              # Andere statische bestanden
├── theme.config.tsx         # Nextra thema configuratie
├── next.config.js           # Next.js configuratie
└── package.json             # Dependencies
```

## Content Richtlijnen

### Markdown Bestanden
- **Formaat:** MDX (Markdown met JSX ondersteuning)
- **Frontmatter:** YAML formaat met title, description, tags
- **Afbeeldingen:** Gebruik `/img/` voor publieke afbeeldingen
- **Links:** Relatieve links voor interne navigatie

### Navigatie
- **_meta.json:** Definieert sidebar structuur en volgorde
- **index.mdx:** Toegangspunt voor elke directory
- **Nesting:** Subdirectories voor gestructureerde content

## Development Workflow

### Lokale Ontwikkeling
```bash
npm run dev     # Start development server op http://localhost:3003
npm run build   # Bouw voor productie
npm run lint    # Controleer code kwaliteit
```

### MDX Content Quality Tools
Voor het voorkomen van React hydration errors in MDX content:

```bash
npm run check:mdx     # Check alle MDX files voor hydration problemen
npm run fix:mdx:dry   # Preview welke fixes toegepast zouden worden
npm run fix:mdx       # Fix hydration problemen automatisch (met backup)
npm run lint:mdx      # Algemene MDX/Markdown linting
```

**Hydration Error Preventie:**
- Vermijd geneste `<p>` tags
- Gebruik geen `<div><span>` constructies (worden naar geneste p geconverteerd)
- Plaats geen block elementen (div, p) binnen inline elementen (span)
- Check nieuwe content altijd met `npm run check:mdx`

**Auto-fix Features:**
- Converteert `<div><span>` naar `<p>` tags
- Verwijdert geneste paragraph tags
- Maakt automatisch `.backup-hydration` files
- Skipt archive en test bestanden

**Development Mode:**
- Alle content is toegankelijk zonder in te loggen
- Auth checks zijn uitgeschakeld in middleware
- UI toont "🔓 Development Mode" indicator

### Content Toevoegen
1. Maak nieuwe `.mdx` bestand in juiste directory
2. Voeg frontmatter toe met minimaal `title`
3. Update `_meta.json` voor navigatie
4. Test lokaal met `npm run dev`

### Internal Content Sync

**BELANGRIJK:** De `/pages/internal/` directory wordt tijdens build gevuld vanuit `apphub/docs-internal/`:
- Deze content staat **NIET** in git (zie .gitignore)
- Wordt alleen gekopieerd tijdens build via `npm run sync-internal`
- In development: gebruik `npm run dev:watch` voor automatische sync
- Het sync script bewaart lokale `_meta.json` en `index.mdx`

**Workflow voor internal docs:**

#### Optie 1: Automatische Sync (Aanbevolen)
```bash
cd docs
npm run dev:watch  # Start dev server met auto-sync
# Wijzig content in apphub/docs-internal/ - wordt automatisch gesynchroniseerd
```

#### Optie 2: Manuele Sync
```bash
cd apphub
# Wijzig content in docs-internal/
cd ../docs
npm run sync-internal  # Sync de wijzigingen
npm run dev           # Start dev server
```

**Let op:** Content wordt NIET gecommit (alleen _meta.json wijzigingen)

### Deployment
- **Development:** Lokaal via `npm run dev`
- **Production:** Via vault repository build process
- **Build trigger:** Vault detecteert wijzigingen via periodieke GitHub hook
- **Manual trigger:** Voor preview deployments, trigger build in vault repository
- **Live site:** Combineert 4 documentatie secties:
  - `/public/` - Deze repository (publiek toegankelijk)
  - `/internal/` - Van apphub/docs-internal (auth required)
  - `/operation/` - Van vault/docs-operation (auth required)
  - `/finance/` - Van vault/docs-finance (auth required)

## Belangrijke Bestanden

### theme.config.tsx
- Logo en branding configuratie
- Navigatie instellingen
- Footer links
- Zoek configuratie

### next.config.js
- Nextra plugin configuratie
- Redirects voor legacy URLs
- Statische export instellingen

### _meta.json Bestanden
- Definieert sidebar items
- Bepaalt volgorde
- Kan weergavenamen overschrijven

## Repository Scope

### Wat hoort in deze repo
- ✅ Publieke bedrijfsinformatie
- ✅ Branding en marketing content
- ✅ Vacatures en werken-bij info
- ✅ Kantoor en faciliteiten info
- ✅ Algemene tool documentatie

### Wat hoort NIET in deze repo
- ❌ Interne procedures → apphub/docs-internal
- ❌ HR documenten → apphub/docs-internal
- ❌ Financiële info → vault/docs-finance
- ❌ Operationele docs → vault/docs-operation
- ❌ Gevoelige data → vault repository

## Authenticatie

### Development
- **Geen authenticatie vereist** - alle content toegankelijk
- Middleware skipt auth checks wanneer `NODE_ENV !== 'production'`
- Login knop verwijst naar apphub op localhost:3002 (werkt niet voor cross-port cookies)

### Production/Preview
- **Centralized auth** via hub.kroescontrol.nl
- Middleware checkt toegang via `https://hub.kroescontrol.nl/api/auth/verify`
- Bij geen toegang: redirect naar hub login pagina
- Na succesvolle login: cookie op `.kroescontrol.nl` domein wordt gedeeld
- Protected routes: `/internal`, `/operations`, `/finance`

### Belangrijke Wijziging (2025-06-20)
- NextAuth volledig verwijderd uit docs repository
- Alle OAuth afhandeling gebeurt nu via centrale hub
- Simpelere setup, minder dependencies
- Development mode voor makkelijk lokaal werken

## Migratie Notities

Dit project is gemigreerd van Docusaurus naar Nextra:
- Git-crypt is volledig verwijderd
- NextAuth is verwijderd - auth via centrale hub
- Beschermde content wordt niet meer in deze repo beheerd
- Focus op publieke documentatie
- Deze repo is publiek toegankelijk op GitHub

## Beste Praktijken

1. **Consistentie:** Volg bestaande content structuur
2. **Navigatie:** Update altijd _meta.json bij nieuwe pagina's
3. **Afbeeldingen:** Optimaliseer afbeeldingen voor web prestaties
4. **Links:** Controleer interne links regelmatig
5. **Frontmatter:** Gebruik consistent YAML formaat

## Probleemoplossing

### Build Fouten
- Controleer YAML syntax in frontmatter
- Vermijd dubbele sleutels
- Valideer MDX syntax

### Navigatie Problemen
- Controleer _meta.json syntax
- Zorg voor unieke pagina sleutels
- Test met `npm run dev`

### Afbeelding Problemen
- Gebruik absolute paden vanaf `/`
- Controleer of afbeeldingen in `/public` staan
- Vermijd spaties in bestandsnamen

## Contact

Voor vragen over de docs infrastructuur:
- **Technisch:** serge@kroescontrol.nl
- **Content:** patriek@kroescontrol.nl