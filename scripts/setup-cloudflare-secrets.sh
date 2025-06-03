#!/bin/bash

# Script om Cloudflare secrets toe te voegen aan GitHub
# Run dit eenmalig om de deployment workflow te activeren

echo "🔐 Setup Cloudflare deployment secrets voor GitHub Actions"
echo ""
echo "Je hebt nodig:"
echo "1. Cloudflare API Token (met Workers edit permissions)"
echo "2. Cloudflare Account ID"
echo ""

# Cloudflare API Token
echo "Ga naar: https://dash.cloudflare.com/profile/api-tokens"
echo "Create Token → Custom token → Permissions:"
echo "  - Account: Cloudflare Workers:Edit"
echo "  - Zone: Zone:Read (optional)"
echo ""
read -p "Cloudflare API Token: " CF_API_TOKEN

# Cloudflare Account ID  
echo ""
echo "Ga naar: Cloudflare Dashboard → rechts bovenaan staat Account ID"
read -p "Cloudflare Account ID: " CF_ACCOUNT_ID

# Upload naar GitHub
echo ""
echo "📤 Uploading secrets naar GitHub..."

gh secret set CLOUDFLARE_API_TOKEN --body "$CF_API_TOKEN"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "$CF_ACCOUNT_ID"

echo ""
echo "✅ Secrets toegevoegd!"
echo ""
echo "Test de deployment met:"
echo "  git commit --allow-empty -m 'Test Cloudflare deployment'"
echo "  git push"
echo ""
echo "Of trigger handmatig:"
echo "  gh workflow run deploy-cloudflare-worker.yml"