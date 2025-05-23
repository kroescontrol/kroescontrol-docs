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

### Ontwikkeling

```bash
# Installeer dependencies
npm install

# Start lokale ontwikkelingsserver (volledige site)
npm start

# Start alleen publieke versie
npm run start:public

# Bouwen voor productie (volledige site)
npm run build

# Bouwen alleen publieke versie
npm run build:public

# Cache wissen
npm run clear

# Controleer git-crypt status van interne content
npm run check-access

# Deploy publieke site naar GitHub Pages
./deploy-public-only.sh

# Serveer gebouwde site lokaal
npm run serve
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

# Start development server (full site)
npm start

# Start public version only
npm run start:public

# Build for production (full site)
npm run build

# Build public version only
npm run build:public

# Clear cache
npm run clear

# Check git-crypt status
npm run check-access

# Deploy public site to GitHub Pages
./deploy-public-only.sh
```

### License

🚀 Copyright © Kroescontrol B.V. - All rights reserved 🚀