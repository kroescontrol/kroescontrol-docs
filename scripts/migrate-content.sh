#!/bin/bash

# Migrate ONLY PUBLIC content from old docs to new docs-v4 structure
# Internal, operation and finance content remain in their original locations

OLD_DOCS="../docs/pages"
NEW_DOCS="./app"

echo "Starting PUBLIC content migration..."
echo "Note: Internal, operation and finance content will be injected during build"
echo ""

# Create directories if they don't exist
mkdir -p $NEW_DOCS/public
mkdir -p $NEW_DOCS/internal  
mkdir -p $NEW_DOCS/operation
mkdir -p $NEW_DOCS/finance

# Migrate ONLY public content
echo "Migrating public content..."
if [ -d "$OLD_DOCS/public" ]; then
  cp -r $OLD_DOCS/public/* $NEW_DOCS/public/ 2>/dev/null || true
  echo "✓ Public content migrated"
fi

# Count migrated files
echo ""
echo "Migration summary:"
echo "Public files: $(find $NEW_DOCS/public -name "*.mdx" -o -name "*.md" | wc -l)"
echo ""
echo "Content sources during build:"
echo "- Internal: apphub/docs-internal/"
echo "- Operation: vault/docs-operation/"
echo "- Finance: vault/docs-finance/"

echo ""
echo "Public content migration completed!"