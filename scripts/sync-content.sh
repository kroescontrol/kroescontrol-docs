#!/bin/bash

# Sync content from various sources for local development
# This simulates what the vault build process does in production
# Updated for Nextra v4 page.mdx structure

echo "Syncing content from multiple sources (Nextra v4 structure)..."
echo ""

# Internal content from apphub
if [ -d "../apphub/docs-internal" ]; then
  echo "Syncing internal content from apphub/docs-internal..."
  rsync -av --delete ../apphub/docs-internal/ app/internal/ \
    --exclude 'PROMPT.mdx.txt' \
    --exclude '*.md' \
    --exclude 'docs-internal-old' \
    --exclude 'public'
  echo "✓ Internal content synced"
  
  # Sync internal public assets to Next.js public directory
  if [ -d "../apphub/docs-internal/public" ]; then
    echo "Syncing internal public assets..."
    rsync -av ../apphub/docs-internal/public/ public/internal/
    echo "✓ Internal public assets synced"
  fi
fi

# Operation content from vault  
if [ -d "../vault/docs-operation" ]; then
  echo "Syncing operation content from vault/docs-operation..."
  rsync -av --delete ../vault/docs-operation/ app/operation/ \
    --exclude 'PROMPT.mdx.txt' \
    --exclude 'index.md'
  echo "✓ Operation content synced"
fi

# Finance content from vault
if [ -d "../vault/docs-finance" ]; then
  echo "Syncing finance content from vault/docs-finance..."
  rsync -av --delete ../vault/docs-finance/ app/finance/ \
    --exclude 'PROMPT.mdx.txt' \
    --exclude 'index.md'
  echo "✓ Finance content synced"
fi

echo ""
echo "Content sync completed!"
echo ""
echo "Note: This is for local development only."
echo "In production, the vault build process handles content aggregation."