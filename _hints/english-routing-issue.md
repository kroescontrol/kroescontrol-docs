# Engels Routing Probleem - Oplossing

## Het probleem
- Locale dropdown gebruikt huidige slug: `/welkom` → `/en/welkom` (maar Engels gebruikt `/welcome`)
- In development mode draait Docusaurus per locale (niet multi-locale)
- Redirect werkt alleen in productie builds

## Tijdelijke oplossing
1. Redirect toegevoegd in `docusaurus.config.js`:
   ```javascript
   redirects: [
     {
       from: '/en/welkom',
       to: '/en/welcome',
     },
   ],
   ```

2. Voor development:
   - Nederlands: `npm run start` (standaard)
   - Engels: `npm run start -- --locale en`

## Permanente oplossing opties:

### Optie 1: Geen custom slugs voor hoofdpagina's
- Verwijder `slug: /welkom` uit `docs-public/index.md`
- Dan werkt de standaard routing: `/` (NL) en `/en/` (EN)

### Optie 2: Volledige i18n implementatie
- Vertaal ALLE pagina's naar Engels
- Gebruik consistent slug naming

### Optie 3: Custom locale switcher
- Implementeer een slimmere locale switcher die slugs kan vertalen
- Bijvoorbeeld een mapping table: `{ '/welkom': '/welcome', '/over-kroescontrol': '/about-kroescontrol' }`

## Test URLs:
- Productie: https://docs.kroescontrol.nl/welkom → klik Engels → redirect naar /en/welcome
- Development NL: http://localhost:3000/welkom
- Development EN: http://localhost:3000/welcome (met `--locale en`)