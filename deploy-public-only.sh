#!/bin/bash
set -e

echo "🚀 Starting deployment of public-only docs to kroescontrol-public repo"

# Zorg dat we de juiste branch hebben
git checkout main

# Zet environment variabelen voor de publieke site
export PUBLIC_ONLY=true
export USE_CUSTOM_DOMAIN=true
export BASE_URL="/"

# Genereer de public-only sidebar met de verbeterde structuur
echo "📑 Genereren van verbeterde sidebar voor publieke site..."
node generate-sidebar.js

# Maak backup van docusaurus.config.js en pas de URL aan voor de build
cp docusaurus.config.js docusaurus.config.js.bak

# Detecteer OS en gebruik juiste sed-syntax
if [[ "$OSTYPE" == "darwin"* ]]; then
  # MacOS versie
  sed -i '' 's|url: .*|url: "https://public.kroescontrol.nl",|' docusaurus.config.js
else
  # Linux/andere versie
  sed -i 's|url: .*|url: "https://public.kroescontrol.nl",|' docusaurus.config.js
fi

# Maak een tijdelijke .env zonder API keys voor de build
if [ -f ".env" ]; then
  echo "📝 Creating clean .env file for build..."
  mv .env .env.backup
  echo "ENABLE_CHAT_PAGE=false" > .env
fi

# Bouw de publieke site
echo "🔧 Building public-only site..."
npm run build

# Herstel de originele .env en docusaurus.config.js
if [ -f ".env.backup" ]; then
  mv .env.backup .env
fi

# Herstel de originele docusaurus.config.js
if [ -f "docusaurus.config.js.bak" ]; then
  mv docusaurus.config.js.bak docusaurus.config.js
fi

# Controleer of de build map bestaat
if [ ! -d "build" ]; then
  echo "❌ Build directory doesn't exist. Build failed?"
  exit 1
fi

# Maak een tijdelijke map voor de kroescontrol-public repository
echo "📁 Preparing kroescontrol-public repository..."
rm -rf temp-public-deploy || true
mkdir temp-public-deploy
cd temp-public-deploy

# Clone de kroescontrol-public repository
git clone git@github.com:kroescontrol/kroescontrol-public.git .

# Maak of switch naar gh-pages branch
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages
else
  git checkout --orphan gh-pages
  git rm -rf .
fi

# Kopieer de gebouwde bestanden
echo "📋 Copying build files..."
cp -r ../build/* .

# Voeg een .nojekyll bestand toe
touch .nojekyll

# Voeg CNAME bestand toe voor custom domain
echo "📄 Creating CNAME file for custom domain..."
echo "public.kroescontrol.nl" > CNAME

# Voeg een README.md toe in de gh-pages branch
echo "# Kroescontrol Public Documentation

This branch contains the built public documentation for Kroescontrol. 

## Important Notes

- This branch is automatically generated - **DO NOT** edit files directly here
- The source files are maintained in the kroescontrol-docs repository
- Updates to public documentation will be deployed automatically

## Viewing the Documentation

The documentation site is available at https://public.kroescontrol.nl
" > README.md

# Commit en push
echo "💾 Committing and pushing to kroescontrol-public repository..."
git add .
git commit -m "Deploy public documentation ($(date))"
git push -f origin gh-pages

# Opruimen
cd ..
rm -rf temp-public-deploy

echo "✅ Ding dong completed!"
echo "⚠️  Vergeet niet om in kroescontrol-public repository settings → Pages de gh-pages branch te selecteren als bron"

# Terug naar main branch
git checkout main

echo "✅ Deployment complete! Site should be available soon at https://public.kroescontrol.nl/"
