#  Kroescontrol Documentation 📚

**Nederlands: Deze repository bevat de Kroescontrol documentatiewebsite in het Nederlands**  

**🇬🇧 English below 🇬🇧**

## 🚀 Over Kroescontrol Documentatie

Deze repository bevat de broncode voor de Kroescontrol  documentatiewebsite, gebouwd met [Docusaurus](https://docusaurus.io/). De website biedt uitgebreide documentatie over:

- Algemene bedrijfsinformatie en cultuur
- Werken bij Kroescontrol
- Engineer Budget en Mobiliteitsbudget
- Freelancecontrol model
- Operationele processen
- Interne resources

De documentatie is opgedeeld in een publiek gedeelte (toegankelijk voor iedereen) en een intern gedeelte (beveiligd met git-crypt en GitHub-authenticatie).

### Functies

- Gescheiden publieke en interne documentatie
- Git-crypt versleuteling voor gevoelige informatie
- Automatische sidebar-generatie
- Responsief ontwerp voor alle apparaten

### Omgevingsvariabelen

Kopieer `.env.example` naar `.env` en pas aan:

```bash
# OpenAI API Key voor documentatie generatie (optioneel)
OPENAI_API_KEY=your_openai_api_key_here

# Deployment configuratie
PUBLIC_ONLY=false           # Default: false (alle content), true = alleen publieke content
ENABLE_CHAT_PAGE=false      # Default: false, true = chatbot inschakelen  
ENABLE_EXTRA_META_TAGS=false # Default: false, true = extra LinkedIn meta tags
BASE_URL=/                  # Default: '/', voor GitHub Pages: '/repository-name/'
```

**Defaults bij ontbrekende variabelen:**
- `PUBLIC_ONLY`: `false` (volledige site met interne + publieke content)
- `OPENAI_API_KEY`: Geen default, chatbot werkt niet zonder
- `ENABLE_CHAT_PAGE`: `false` (chatbot uitgeschakeld)
- `ENABLE_EXTRA_META_TAGS`: `false` (basis meta tags)
- `BASE_URL`: `'/'` (root path)

### Ontwikkeling

```bash
# Installeer dependencies
npm install

# Start lokale ontwikkelingsserver (volledige site)
npm start

# Publieke versie starten
npm run start:public

# Bouwen voor productie (volledige site)
npm run build

# Alleen publieke versie bouwen
npm run build:public

# Deployment
npm run deploy              # Default: volledige site deployment
npm run deploy:public       # Publieke site deployment naar GitHub Pages
```

### Bezoek de website

De live documentatie is beschikbaar op [docs.kroescontrol.nl](https://docs.kroescontrol.nl)

---

## 🇬🇧 English Summary 🇬🇧

This repository contains the source for the 🚀 Kroescontrol 🚀 documentation website built with Docusaurus. The entire documentation is written in Dutch and covers company information, work processes, employee benefits, and internal resources.

The site is divided into a public section (accessible to everyone) and an internal section (protected by git-crypt and GitHub authentication). You can visit the live documentation at [docs.kroescontrol.nl](https://docs.kroescontrol.nl).

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### License

🚀 Copyright © Kroescontrol B.V. - All rights reserved 🚀