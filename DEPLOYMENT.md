# Deployment Guide

## Preview Deployment (preview.docs.kroescontrol.nl)

### Prerequisites

1. **Vercel Account Setup**
   - Project naam: `kroescontrol-docs-v4`
   - Framework: Next.js
   - Root directory: `/`

2. **GitHub Secrets** (toevoegen in repo settings)
   - `VERCEL_ORG_ID` - Vercel organization ID
   - `VERCEL_PROJECT_ID` - Vercel project ID  
   - `VERCEL_TOKEN` - Vercel deployment token

3. **Environment Variables in Vercel**
   ```
   NEXTAUTH_URL=https://preview.docs.kroescontrol.nl
   HUB_URL=https://hub.kroescontrol.nl
   COOKIE_DOMAIN=.kroescontrol.nl
   FORCE_AUTH_CHECK=true
   ```

4. **DNS Setup**
   - CNAME record: `preview.docs.kroescontrol.nl` → `cname.vercel-dns.com`

### Deployment Flow

1. **Automatic Preview Deploy**
   - Push to `nextra-v4-upgrade` branch
   - GitHub Action triggers
   - Deploys to `preview.docs.kroescontrol.nl`

2. **Manual Production Deploy**
   - Merge to `main` branch
   - Manually configure domain later

### Content Sync in Production

Voor production deployment vanuit vault:
1. Vault pullt deze public docs repo
2. Injecteert internal/operation/finance content
3. Bouwt complete site
4. Deploy naar docs.kroescontrol.nl

### Testing Preview

Na deployment:
1. Check https://preview.docs.kroescontrol.nl
2. Test authentication flows
3. Verify protected routes
4. Check mobile responsiveness

### Rollback

Via Vercel dashboard:
1. Go to deployments
2. Select previous deployment
3. Promote to current