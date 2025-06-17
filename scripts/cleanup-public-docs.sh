#!/bin/bash

# Cleanup Public Docs Script
# Verwijdert backup files en verouderde content

echo "🧹 Cleaning up public documentation..."

# Navigate to public directory
cd pages/public

# Remove backup files
echo "📄 Removing backup files..."
find . -name "*.bak2" -type f -delete

# Remove outdated git-crypt documentation
echo "🔐 Removing outdated git-crypt documentation..."
rm -f tools/documentatie/git-crypt-*.md

# Remove duplicate nested public directories
echo "📁 Removing duplicate public directories..."
rm -rf branding/public

# Remove PROMPT files from public area
echo "🔒 Removing internal PROMPT files..."
find . -name "PROMPT.md" -type f -delete

echo "✅ Cleanup complete!"