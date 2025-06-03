# Cloudflare Workers Authentication Setup

Deze directory bevat de Cloudflare Worker voor username-based authentication van de Kroescontrol documentatie.

## Architectuur Overzicht

### Web Traffic Flow
```
┌─────────────────┐
│     Browser     │
│ docs.kroescontrol.nl
└────────┬────────┘
         │ HTTPS Request
         ▼
┌─────────────────┐     ┌──────────────────┐
│   Cloudflare    │────►│   GitHub OAuth   │
│   Edge Network  │◄────│  (Authentication)│
│   (Workers)     │     └──────────────────┘
└────────┬────────┘
         │ Proxy authenticated requests
         ▼
┌─────────────────┐
│     Vercel      │
│ (Static Site)   │
│ *.vercel.app    │
└─────────────────┘
```

### DNS Setup Flow
```
Voor Cloudflare:
docs.kroescontrol.nl ──DNS A Record──► Vercel IP

Na Cloudflare:
docs.kroescontrol.nl ──CNAME──► Cloudflare Proxy ──► Vercel Backend
                                       │
                                       ▼
                                 Worker Auth Check
```

### Authentication Flow
```
1. User bezoekt /internal/
         │
         ▼
2. Cloudflare Worker checkt cookie
         │
    ┌────┴────┐
    │ Cookie? │──Nee──► Redirect naar GitHub OAuth
    └────┬────┘
         │ Ja
         ▼
3. Verify JWT & Check ACL
         │
    ┌────┴────┐
    │ Access? │──Nee──► "Geen Toegang" pagina
    └────┬────┘
         │ Ja
         ▼
4. Proxy request naar Vercel
         │
         ▼
5. User ziet content
```

## Quick Start

### 1. Cloudflare Setup

1. **Login** bij [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Voeg domein toe**: kroescontrol.nl
3. **Update DNS nameservers** bij je domein registrar
4. **Worker wordt automatisch gedeployed** via GitHub Actions

### 2. Environment Variables

In Worker settings → **Settings** → **Variables**:

```
GITHUB_CLIENT_ID = <jouw-github-oauth-app-id>
GITHUB_CLIENT_SECRET = <jouw-github-oauth-app-secret>
JWT_SECRET = <genereer met: openssl rand -base64 32>
BACKEND_URL = https://kroescontrol-docs.vercel.app
```

### 3. Custom Domain

In Worker settings → **Triggers** → **Custom Domains**:
- Add: `docs.kroescontrol.nl`

### 4. GitHub OAuth App

Update je GitHub OAuth App:
- **Authorization callback URL**: `https://docs.kroescontrol.nl/api/auth/callback`
- **Homepage URL**: `https://docs.kroescontrol.nl`

## ACL Management

De Access Control List wordt beheerd in `sensitive/access-control.yml`:

```yaml
users:
  para76:
    name: Patriek Radewalt
    sections: [internal, finance, operation]
  skroes:
    name: Serge Kroes
    sections: [internal, finance]
  # etc...
```

### Gebruiker toevoegen/wijzigen:

1. Edit `sensitive/access-control.yml`
2. Commit & push naar GitHub
3. **GitHub Action deployed automatisch** de nieuwe ACL

## Monitoring

Check in Cloudflare Dashboard:
- **Analytics**: Aantal requests, cache hit rate
- **Logs**: Real-time logs (tail logs)
- **Metrics**: CPU tijd, errors

## Testing

```bash
# Test public access
curl https://docs.kroescontrol.nl/

# Test auth redirect
curl -I https://docs.kroescontrol.nl/internal/

# Test auth status
curl https://docs.kroescontrol.nl/api/auth/status
```

## Troubleshooting

**"Invalid signature" errors:**
- Check dat JWT_SECRET overal hetzelfde is
- Let op trailing spaces in environment variables

**Redirect loops:**
- Verify GitHub OAuth callback URL
- Check cookie settings (moet HTTPS zijn)

**User ziet "Geen Toegang":**
- Check spelling GitHub username in ACL
- Usernames zijn case-sensitive!

## Path Configuratie

### Publieke Paths (geen auth nodig)

In `auth-worker-template.js` staat welke paths publiek zijn:

```javascript
const publicPaths = [
  '/',              // Homepage
  '/public',        // Public docs
  '/_next',         // Next.js assets
  '/img',           // Images
  '/assets',        // Static assets
  '.css', '.js',    // Style/script files
  '.png', '.jpg',   // Image files
  // etc...
];
```

### Protected Paths (auth verplicht)

Deze paths vereisen authenticatie:

```javascript
if (['internal', 'finance', 'operation'].includes(section)) {
  // Auth check gebeurt hier
}
```

Dit betekent:
- `/internal/*` → Alle medewerkers met 'internal' in hun ACL
- `/finance/*` → Alleen users met 'finance' in hun ACL  
- `/operation/*` → Alleen users met 'operation' in hun ACL

### Nieuwe sectie toevoegen

1. **In Worker template** - voeg sectie toe aan check:
```javascript
if (['internal', 'finance', 'operation', 'nieuw'].includes(section)) {
```

2. **In ACL** - geef users toegang:
```yaml
users:
  skroes:
    sections: [internal, finance, nieuw]
```

3. **In Docusaurus** - maak de docs directory:
```
docs-nieuw/
  └── index.md
```
