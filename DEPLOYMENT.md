# Deployment Guide

## Important: Deployment Architecture

**Deze repository wordt NIET direct gedeployed!**

De deployment van docs.kroescontrol.nl gebeurt vanuit de **vault repository** die:
1. Content uit meerdere repositories combineert
2. Een complete Nextra site bouwt
3. Deploy naar Vercel uitvoert

Zie vault repository voor deployment workflows:
- `vault/.github/workflows/deploy-docs-preview.yml` - Preview deployments
- `vault/.github/workflows/deploy-docs-production.yml` - Production deployments

## Preview Deployment (preview.docs.kroescontrol.nl)

### Hoe werkt het?

1. **Automatische checks** (vault repository)
   - 3x per dag tijdens werkdagen (9:00, 13:00, 17:00 CET)
   - 1x per dag in weekend (12:00 CET)
   - Detecteert wijzigingen in:
     - `docs` repo (preview branch) - publieke content
     - `apphub/docs-internal` - interne documentatie
     - `vault/docs-operation` & `vault/docs-finance` - MT docs

2. **Manual trigger** (vanuit vault repo)
   - GitHub Actions → Deploy Docs Preview → Run workflow
   - Selecteer main branch → Run workflow

3. **Change detection**
   - Gebruikt git hashes om onnodige deploys te voorkomen
   - Alleen bij daadwerkelijke content wijzigingen

### Development in deze repo

1. **Werk op preview branch**
   ```bash
   git checkout preview
   # Maak wijzigingen
   git add .
   git commit -m "docs: update content"
   git push origin preview
   ```

2. **Wacht op automatische deployment**
   - Vault checkt periodiek voor wijzigingen
   - Of trigger manual via vault GitHub Actions

### Production Deployment (docs.kroescontrol.nl)

1. **Merge preview naar main**
   ```bash
   git checkout main
   git merge preview
   git push origin main
   ```

2. **Trigger production deploy** (vanuit vault repo)
   - GitHub Actions → Deploy Docs Production → Run workflow
   - Type "DEPLOY" ter bevestiging → Run workflow
   - **Let op:** Dit deployed vanaf main branch van alle repos

### Content Aggregatie

Vault repository combineert tijdens build:
```
/public/    → van docs repo (deze repo)
/internal/  → van apphub/docs-internal/
/operation/ → van vault/docs-operation/
/finance/   → van vault/docs-finance/
```

### Testing

**Preview environment:**
- URL: https://preview.docs.kroescontrol.nl
- Gebruikt preview branch van docs repo
- Gebruikt main branch van andere repos

**Production environment:**
- URL: https://docs.kroescontrol.nl
- Gebruikt main branch van alle repos

### Rollback

Via Vercel dashboard (MT toegang vereist):
1. Login op Vercel met kroescontrol account
2. Ga naar kroescontrol-docs project
3. Deployments → Select previous deployment
4. Promote to current

### Troubleshooting

**Preview deploy werkt niet:**
1. Check GitHub Actions in vault repo
2. Verifieer dat je op preview branch werkt
3. Check of content daadwerkelijk gewijzigd is

**Authentication issues:**
- Preview/production gebruiken centrale hub auth
- Check cookies op `.kroescontrol.nl` domein
- Login via https://hub.kroescontrol.nl