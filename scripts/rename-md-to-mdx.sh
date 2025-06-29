#!/bin/bash

# Rename all .md files to .mdx in app directory

echo "Renaming .md files to .mdx..."

cd app

# Find and rename all .md files
find . -name "*.md" -type f | while read file; do
  newfile="${file%.md}.mdx"
  mv "$file" "$newfile"
  echo "Renamed: $file → $newfile"
done

echo "Done!"