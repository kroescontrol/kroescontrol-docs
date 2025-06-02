#!/bin/bash

# Script om alle finance en operation documenten naar templated status te zetten
# Dit houdt ze uit productie builds

echo "🔄 Update Finance en Operation documenten naar templated status..."
echo ""

# Finance: live → templated
echo "📊 Finance documenten met live status..."
node scripts/updateDocStatus.js live templated --include docs-finance

echo ""
echo "📊 Finance documenten zonder docStatus..."
node scripts/updateDocStatus.js undefined templated --include docs-finance --exclude "_status.md" --exclude "PROMPT.md" --exclude "README.md"

echo ""
echo "💼 Operation documenten met live status..."
node scripts/updateDocStatus.js live templated --include docs-operation

echo ""
echo "💼 Operation documenten zonder docStatus..."
node scripts/updateDocStatus.js undefined templated --include docs-operation --exclude "_status.md" --exclude "PROMPT.md" --exclude "README.md"

echo ""
echo "✅ Klaar! Alle finance en operation documenten zijn nu templated (uitgesloten van productie)"