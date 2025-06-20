# Kroescontrol Documentation 📚

**Officiële documentatie voor Kroescontrol - gebouwd met Nextra**

## 📂 Content Structure

- **Public content**: `/public/` - Altijd zichtbaar voor iedereen
- **Protected content** (via symlinks):
  - `/internal/` → `apphub/docs-internal/` (Development procedures)
  - `/operation/` → `vault/docs-operation/` (Operations & monitoring)  
  - `/finance/` → `vault/docs-finance/` (Financial procedures)

## 🚀 Development

### Public-only Development
```bash
npm install
npm run dev  # http://localhost:3003
```

### Full Content Development
```bash
# Setup symlinks to protected content (requires repo access)
npm run setup-symlinks

# Or all in one:
npm run dev-full
```

### Manual Symlink Setup
```bash
# From docs directory:
ln -s ../../apphub/docs-internal pages/internal
ln -s ../../vault/docs-operation pages/operation  
ln -s ../../vault/docs-finance pages/finance
```

## 🔐 Authentication

- **Development**: Alle content toegankelijk zonder login (auth checks disabled)
- **Production**: Authenticatie via hub.kroescontrol.nl
- **Cross-domain SSO**: Cookies gedeeld op `.kroescontrol.nl` domein
- **Protected routes**: Middleware redirect naar hub voor login

## 🏗️ Deployment

**Automatisch via Controlhub GitHub Action:**
1. Checkout docs repo
2. Checkout apphub + vault repos  
3. Create symlinks to protected content
4. Build & deploy to Vercel

## 📁 Directory Structure

```
docs/
├── pages/
│   ├── index.mdx          # Landing page
│   ├── public/            # Public documentation  
│   ├── internal/          # Symlink → apphub/docs-internal/
│   ├── operation/         # Symlink → vault/docs-operation/
│   └── finance/           # Symlink → vault/docs-finance/
├── scripts/
│   └── setup-local-symlinks.sh
└── theme.config.jsx
```

## ✨ Features

- 🔗 **Symlink strategy** - No content duplication
- ⚡ **Real-time updates** - Edit source repos, see changes instantly
- 🔐 **Centralized auth** - Via hub.kroescontrol.nl in productie  
- 📱 **Responsive design** - Mobile-friendly documentation
- 🔍 **Search integration** - Full-text search across all content

## 🌐 URLs

- **Production**: https://docs.kroescontrol.nl
- **Development**: http://localhost:3003

---

*Copyright © 2025 Kroescontrol B.V. - Laatste update: December 2024*
