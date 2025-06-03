# HOWTO: Cloudflare Workers Auth Proxy voor Kroescontrol Docs

## Waarom deze oplossing?

We hebben een Docusaurus static site op Vercel met sectie-specifieke toegangscontrole nodig. De huidige `vercel-github-oauth-proxy` library kan alleen organisatie-lidmaatschap controleren, niet individuele gebruikers. Met Cloudflare Workers kunnen we een authentication proxy maken die:

- ✅ **Username-based access control** implementeert
- ✅ **Geen wijzigingen** aan de huidige Vercel deployment vereist
- ✅ **Sneller** maakt (edge caching)
- ✅ **Gratis** is (100k requests/dag)
- ✅ **Veilig** houdt usernames uit publieke code via encrypted ACL file

## Architectuur Overzicht

```
                    ┌─────────────────┐
                    │   GitHub Repo   │
                    │ (kroescontrol-  │
                    │     docs)       │
                    └────────┬────────┘
                             │ push
                    ┌────────▼────────┐
                    │     Vercel      │
                    │ (Static Build)  │
                    │ *.vercel.app    │
                    └────────▲────────┘
                             │ proxy authenticated requests
                    ┌────────┴────────┐
                    │ Cloudflare      │
User ──────────────►│   Worker        │◄─────── GitHub OAuth
                    │ (Auth Proxy)    │         (Login)
                    │ docs.kroescontrol.nl │
                    └─────────────────┘
```

## Nieuwe Implementatie Strategie

We gebruiken een veilige deployment strategie waarbij:
1. **ACL staat in git-crypt encrypted file** (`sensitive/access-control.yml`)
2. **Worker template bevat geen usernames** (`cloudflare/auth-worker-template.js`)
3. **Deploy script injecteert ACL tijdens deployment** (`scripts/deploy-cloudflare-worker.js`)
4. **GitHub Actions automatiseert deployments** bij ACL wijzigingen

## Stap-voor-stap Implementatie

### Stap 1: Cloudflare Account Setup

1. **Maak een Cloudflare account** (gratis): https://dash.cloudflare.com/sign-up
2. **Voeg je domein toe** (kroescontrol.nl)
3. **Wijzig DNS nameservers** naar Cloudflare (ze geven instructies)
4. **Wacht op DNS propagatie** (5-30 minuten)
5. **Vercel custom domain blijft staan** (docs.kroescontrol.nl)

### Stap 2: Setup GitHub Secrets voor Cloudflare

```bash
# Run het setup script
./scripts/setup-cloudflare-secrets.sh

# Dit vraagt om:
# 1. Cloudflare API Token (met Workers edit permissions)
# 2. Cloudflare Account ID
```

### Stap 3: Eerste Deployment

```bash
# Zorg dat git-crypt unlocked is
git-crypt unlock

# Run deployment script
node scripts/deploy-cloudflare-worker.js

# Dit doet automatisch:
# 1. Leest sensitive/access-control.yml
# 2. Injecteert ACL in Worker template  
# 3. Deployed naar Cloudflare
# 4. Verwijdert tijdelijke files
```

### Stap 4: Configureer Cloudflare Dashboard

1. **Workers → kroescontrol-docs-auth → Settings → Variables**
   ```
   GITHUB_CLIENT_ID = <jouw-github-oauth-app-id>
   GITHUB_CLIENT_SECRET = <jouw-github-oauth-app-secret>
   JWT_SECRET = <genereer-met-openssl-rand-base64-32>
   BACKEND_URL = https://kroescontrol-docs.vercel.app
   ```

2. **Workers → kroescontrol-docs-auth → Triggers → Custom Domains**
   - Add: `docs.kroescontrol.nl`

### Stap 5: Update GitHub OAuth App

In GitHub OAuth App settings:

1. **Authorization callback URL**: `https://docs.kroescontrol.nl/api/auth/callback`
2. **Homepage URL**: `https://docs.kroescontrol.nl`

### Stap 6: Setup GitHub Actions voor Automatische Deployment

```bash
# Commit alle wijzigingen
git add -A
git commit -m "Setup Cloudflare Worker authentication"
git push

# GitHub Action zal automatisch deployen bij toekomstige wijzigingen aan:
# - sensitive/access-control.yml
# - cloudflare/auth-worker-template.js
```

### Stap 7: Test de Setup

1. **Bezoek** `https://docs.kroescontrol.nl`
2. **Klik op** een protected sectie (bijv. `/internal`)
3. **Je wordt doorgestuurd** naar GitHub login
4. **Na login** zie je de content (als je in ACL staat)

## Onderhoud

### ACL Updates

Om gebruikers toe te voegen/verwijderen:

1. **Edit `sensitive/access-control.yml`**:
   ```yaml
   users:
     nieuwe-user:
       name: Nieuwe Gebruiker
       sections: [internal]
   ```
2. **Commit & push** naar GitHub
3. **GitHub Action deployed automatisch** (duurt ~30 seconden)

### Monitoring

Cloudflare biedt gratis:
- **Analytics**: Zie aantal requests, cache hit rate
- **Logs**: Real-time logs (beperkt in gratis tier)
- **Errors**: Automatische error tracking

## Troubleshooting

**DNS wijzigt niet?**
- Check met `dig docs.kroescontrol.nl`
- Wacht tot 24 uur voor volledige propagatie

**Worker geeft 500 errors?**
- Check Workers → jouw-worker → Logs
- Verify environment variables zijn gezet

**Login loop?**
- Check GitHub OAuth callback URL
- Verify JWT_SECRET is consistent

## Kosten

**Gratis tier limits:**
- 100,000 requests/dag ✓
- 10ms CPU tijd per request ✓
- Unlimited Workers ✓

Voor documentatie site ruim voldoende!

## Path Configuratie

### Publieke vs Protected Paths

De Worker bepaalt welke paths authentication nodig hebben:

```javascript
// Publieke paths (geen auth nodig)
const publicPaths = [
  '/', '/public', '/_next', '/img', '/assets',
  '.css', '.js', '.png', '.jpg', // etc...
];

// Protected sections (auth verplicht)
if (['internal', 'finance', 'operation'].includes(section)) {
  // Auth check gebeurt hier
}
```

### Nieuwe Sectie Toevoegen

1. **In Worker template** (`cloudflare/auth-worker-template.js`):
   ```javascript
   if (['internal', 'finance', 'operation', 'nieuw'].includes(section))
   ```

2. **In ACL** (`sensitive/access-control.yml`):
   ```yaml
   users:
     username:
       sections: [internal, nieuw]
   ```

3. **In Docusaurus** - maak nieuwe docs directory

## Security Overwegingen

1. **Usernames blijven geheim**: Staan alleen in encrypted `sensitive/access-control.yml`
2. **JWT_SECRET**: Gebruik sterke random string (genereer met `openssl rand -base64 32`)
3. **HTTPS**: Cloudflare forceert automatisch HTTPS
4. **Cookie flags**: HttpOnly, Secure, SameSite zijn gezet
5. **Token expiry**: 7 dagen (aanpasbaar in Worker)
6. **GitHub Actions**: Gebruik git-crypt key voor deployment

## Voordelen Samengevat

- ✅ **Geen wijzigingen aan Vercel deployment**
- ✅ **Username-based access control**
- ✅ **Sneller door edge caching**
- ✅ **Gratis voor jullie gebruik**
- ✅ **5 minuten om ACL aan te passen**
- ✅ **Automatische HTTPS en DDoS protection**

## Benodigde Bestanden Checklist

Zorg dat deze bestanden aanwezig zijn voordat je begint:

- [ ] `sensitive/access-control.yml` - Gebruikers en hun toegang (git-crypt encrypted)
- [ ] `cloudflare/auth-worker-template.js` - Worker template zonder usernames
- [ ] `cloudflare/wrangler.toml` - Cloudflare configuratie
- [ ] `cloudflare/README.md` - Documentatie met diagrammen
- [ ] `scripts/deploy-cloudflare-worker.js` - Deployment script
- [ ] `scripts/setup-cloudflare-secrets.sh` - GitHub secrets setup
- [ ] `.github/workflows/deploy-cloudflare-worker.yml` - Automatische deployment

## Conclusie

- **GitHub**: Source control + OAuth provider
- **Vercel**: Static site hosting
- **Cloudflare**: Edge authentication + caching
- **Git-crypt**: Veilige opslag van ACL