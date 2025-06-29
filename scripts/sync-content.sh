#!/bin/bash

# Sync content from various sources for local development
# This simulates what the vault build process does in production

echo "Syncing content from multiple sources..."
echo ""

# Internal content from apphub
if [ -d "../apphub/docs-internal" ]; then
  echo "Syncing internal content from apphub/docs-internal..."
  rsync -av --delete ../apphub/docs-internal/ app/internal/ \
    --exclude 'page.mdx' \
    --exclude 'PROMPT.mdx.txt'
  echo "✓ Internal content synced"
fi

# Operation content from vault  
if [ -d "../vault/docs-operation" ]; then
  echo "Syncing operation content from vault/docs-operation..."
  rsync -av --delete ../vault/docs-operation/ app/operation/ \
    --exclude 'page.mdx' \
    --exclude 'PROMPT.mdx.txt'
  echo "✓ Operation content synced"
fi

# Finance content from vault
if [ -d "../vault/docs-finance" ]; then
  echo "Syncing finance content from vault/docs-finance..."
  rsync -av --delete ../vault/docs-finance/ app/finance/ \
    --exclude 'page.mdx' \
    --exclude 'PROMPT.mdx.txt'
  echo "✓ Finance content synced"
fi

echo ""
echo "Content sync completed!"
echo ""
echo "Note: This is for local development only."
echo "In production, the vault build process handles content aggregation."