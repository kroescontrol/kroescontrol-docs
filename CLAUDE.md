# CLAUDE.md - Kroescontrol Docs

## Project Overzicht

**Repository:** `kroescontrol/kroescontrol-docs`  
**Framework:** Nextra (Next.js-gebaseerde documentatie)  
**URL:** https://docs.kroescontrol.nl  
**Doel:** Publieke documentatie voor Kroescontrol engineers en klanten

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
npm run dev     # Start development server op http://localhost:3000
npm run build   # Bouw voor productie
npm run lint    # Controleer code kwaliteit
```

### Content Toevoegen
1. Maak nieuwe `.mdx` bestand in juiste directory
2. Voeg frontmatter toe met minimaal `title`
3. Update `_meta.json` voor navigatie
4. Test lokaal met `npm run dev`

### Deployment
- **Platform:** Vercel
- **Branch:** main
- **Auto-deploy:** Via GitHub Actions workflow
- **Build commando:** `npm run build`
- **Output directory:** `.next`

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

## Migratie Notities

Dit project is gemigreerd van Docusaurus naar Nextra:
- Git-crypt is volledig verwijderd
- Beschermde content wordt niet meer in deze repo beheerd
- Focus op publieke documentatie

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