#!/bin/bash

# Convert flat MDX structure to App Router structure
# Each file becomes a directory with page.mdx

cd app/public

echo "Converting to App Router structure..."

# Process all .mdx files (excluding those already named page.mdx)
find . -name "*.mdx" -not -name "page.mdx" -not -name "index.mdx" | while read file; do
  # Get the base name without extension
  base=$(basename "$file" .mdx)
  dir=$(dirname "$file")
  
  # Skip if it's already in a directory with the same name
  parent_dir=$(basename "$dir")
  if [ "$parent_dir" = "$base" ]; then
    echo "Skipping $file (already in correct structure)"
    continue
  fi
  
  # Create directory and move file
  if [ "$dir" = "." ]; then
    newdir="$base"
  else
    newdir="$dir/$base"
  fi
  
  # Special handling for files that have a directory with same name
  if [ -d "$newdir" ]; then
    # If directory exists and has index.mdx, use that
    if [ -f "$newdir/index.mdx" ]; then
      mv "$newdir/index.mdx" "$newdir/page.mdx"
      rm -f "$file"  # Remove the duplicate parent file
      echo "Converted: $newdir/index.mdx → $newdir/page.mdx"
    else
      # Otherwise move the file into the directory
      mv "$file" "$newdir/page.mdx"
      echo "Moved: $file → $newdir/page.mdx"
    fi
  else
    # Create new directory and move file
    mkdir -p "$newdir"
    mv "$file" "$newdir/page.mdx"
    echo "Created: $file → $newdir/page.mdx"
  fi
done

echo "Done!"