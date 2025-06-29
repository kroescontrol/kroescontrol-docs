# Kroescontrol Docs v4

Clean Nextra v4 implementation met App Router.

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev              # Start development server
npm run dev:sync        # Sync content from other repos + start dev

# Build
npm run build           # Build for production
npm run start           # Start production server

# Content management
npm run migrate         # Migrate public content from old docs
npm run sync           # Sync internal/operation/finance content for dev
```

## Architecture

### Content Structure
```
app/
├── public/         # Public documentation (committed to repo)
├── internal/       # From apphub/docs-internal (build-time injection)
├── operation/      # From vault/docs-operation (build-time injection)
└── finance/        # From vault/docs-finance (build-time injection)
```

### Security
- Public content: Open source, committed to this repo
- Internal content: Synced from apphub during build
- Operation/Finance: Synced from vault during build (MT only)

### Authentication
- Middleware checks auth via hub.kroescontrol.nl
- Protected routes: /internal, /operation, /finance
- Session sharing via cookies

## Development

Voor lokale development met alle content:
```bash
npm run dev:sync
```

Dit simuleert wat de vault build process doet in productie.

## Deployment

In productie draait de complete site vanuit vault repository:
1. Vault pullt public content van dit repo
2. Injecteert internal content van apphub
3. Voegt eigen operation/finance content toe
4. Bouwt en deployed complete site

## Migration Status

✅ Nextra v4 upgrade complete
✅ App Router geïmplementeerd  
✅ Authentication middleware
✅ Public content gemigreerd
✅ Build process werkt

## Next Steps

- Theme configuratie toevoegen (na design fase)
- Performance optimalisaties
- Search functionaliteit