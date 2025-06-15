# 🔐 Vercel KV Toegang & Exploratie Gids

## 📋 Overzicht

Deze gids beschrijft twee methodes om toegang te krijgen tot Vercel KV databases:
1. **Browser methode** - Via Vercel Dashboard
2. **CLI methode** - Via scripts en command line tools

## 🌐 Methode 1: Browser Toegang

### Stappen voor Dashboard Toegang

1. **Login bij Vercel**
   - Navigeer naar: https://vercel.com/login
   - Log in met je kroescontrol team account

2. **Selecteer het juiste project**
   - Voor **HUB data**: Klik op `kroescontrol-apphub`
   - Voor **VAULT data**: Klik op `kroescontrol-vault`

3. **Open de Storage tab**
   - In het project dashboard, klik op "Storage" in de top navigatie
   - Je ziet nu alle KV databases voor dit project

4. **Open de Data Browser**
   - Klik op de database naam (bijv. "apphub-kv" of "vault-kv")
   - Je komt nu in de "Data Browser" interface

5. **Exploreer de data**
   - Gebruik de zoekbalk met patterns:
     - `cache:*` - Alle cache entries
     - `invoice:*` - Alle facturen
     - `session:*` - Alle sessies
     - `ratelimit:*` - Rate limiting data
   - Klik op een key om de JSON data te bekijken
   - TTL (time-to-live) wordt automatisch getoond

## 💻 Methode 2: CLI Toegang

### Voorbereidingen

1. **Installeer Vercel CLI** (indien nog niet geïnstalleerd):
   ```bash
   npm i -g vercel
   ```

2. **Login en link project**:
   ```bash
   # Login
   vercel login
   
   # Voor AppHub
   cd ~/Workspace/controlhub/apphub
   vercel link
   
   # Voor Vault
   cd ~/Workspace/controlhub/vault
   vercel link
   ```

3. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

### CLI Scripts

We hebben twee handige scripts voor KV exploratie:

#### 1. explore-kv.js - Basis Exploratie

**Locatie:** `/apphub/scripts/explore-kv.js`

**Gebruik:**
```bash
# Toon alle keys
node scripts/explore-kv.js

# Zoek specifiek pattern
node scripts/explore-kv.js "cache:*"
node scripts/explore-kv.js "invoice:INV-*"

# Toon help
node scripts/explore-kv.js --help
```

**Features:**
- Zoekt keys op basis van patterns
- Toont values in leesbaar formaat
- Geeft TTL informatie weer
- Limiteert output tot eerste 10 resultaten

#### 2. kv-debug.js - Geavanceerde Operaties

**Locatie:** `/apphub/scripts/kv-debug.js`

**Gebruik:**
```bash
# Toon cache statistieken
node scripts/kv-debug.js stats

# List alle cache entries met metadata
node scripts/kv-debug.js cache

# Monitor real-time changes
node scripts/kv-debug.js monitor
node scripts/kv-debug.js monitor "cache:vault:*"

# Invalideer cache entries
node scripts/kv-debug.js invalidate "cache:vault:*"

# Toon help
node scripts/kv-debug.js help
```

**Features:**
- Cache statistieken en metadata
- Real-time monitoring van changes
- Cache invalidatie mogelijkheden
- Gedetailleerde debug informatie

## 🔍 Nuttige Zoekpatterns

### AppHub (HUB_KV)
- `cache:vault:finance:*` - Finance data cache
- `cache:vault:operations:*` - Operations data cache
- `session:*` - User sessies
- `ratelimit:*` - API rate limiting
- `stats:api:*` - API gebruiksstatistieken
- `stats:cache:*` - Cache hit/miss ratios

### Vault (VAULT_KV)
- `invoice:INV-*` - Facturen
- `transaction:TRX-*` - Transacties
- `client:*` - Klantgegevens
- `config:*` - Configuratie settings
- `invoices:status:*` - Invoice status sets
- `transactions:period:*` - Transacties per periode

## 🛡️ Security Overwegingen

1. **Session Cookies Required**
   - Zowel browser als CLI methodes vereisen authenticatie
   - Zorg dat je ingelogd bent met de juiste permissions

2. **Environment Variables**
   - Bewaar `.env.local` files nooit in git
   - Gebruik `vercel env pull` voor laatste configs

3. **Data Privacy**
   - Behandel KV data als vertrouwelijk
   - Deel geen screenshots met gevoelige data
   - Log geen values in productie code

## 🚀 Quick Start Commando's

```bash
# Setup voor nieuwe machine
cd ~/Workspace/controlhub/apphub
npm install
vercel link
vercel env pull .env.local

# Exploreer data
node scripts/explore-kv.js "cache:*"

# Debug cache issues
node scripts/kv-debug.js cache

# Monitor live changes
node scripts/kv-debug.js monitor
```

## 📚 Zie Ook

- [Vercel KV Detailed Tutorial](./vercel-kv-detailed-tutorial.md) - Uitgebreide tutorial
- [KV Data Patterns](./kv-data-patterns.md) - Best practices voor data structuur
- [Cache Strategy Guide](./cache-strategy.md) - Caching strategieën

## ❓ Troubleshooting

### "KV_REST_API_URL not found"
```bash
# Pull laatste environment variables
vercel env pull .env.local
```

### "Permission denied" errors
- Controleer of je deel uitmaakt van het kroescontrol team
- Verifieer dat je de juiste project hebt gelinkt

### Scripts werken niet
```bash
# Maak scripts executable
chmod +x scripts/*.js

# Check Node.js versie (>= 18 required)
node --version
```