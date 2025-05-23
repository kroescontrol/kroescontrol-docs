#!/bin/bash

# Script om alle corrupte markdown bestanden te vervangen met templates

counter=1

while IFS= read -r file; do
    # Extract directory and filename info
    dirname=$(dirname "$file")
    basename=$(basename "$file" .md)
    
    # Skip .meta directories for now
    if [[ "$file" == *"/.meta/"* ]]; then
        continue
    fi
    
    # Create appropriate title
    title=$(echo "$basename" | sed 's/-/ /g' | sed 's/\b\w/\U&/g')
    if [[ "$title" == "Index" ]]; then
        if [[ "$dirname" == *"finance"* ]]; then
            title="Financiële Documentatie"
        elif [[ "$dirname" == *"operation"* ]]; then
            title="Operationele Documentatie"
        elif [[ "$dirname" == *"internal"* ]]; then
            title="Interne Documentatie"
        fi
    fi
    
    # Create tags based on directory
    if [[ "$dirname" == *"finance"* ]]; then
        tags="[financiën, boekhouding]"
        keywords="[financiën, boekhouding, administratie]"
    elif [[ "$dirname" == *"operation"* ]]; then
        tags="[operatie, processen]"
        keywords="[operatie, processen, procedures]"
    elif [[ "$dirname" == *"internal"* ]]; then
        tags="[intern, medewerkers]"
        keywords="[intern, medewerkers, procedures]"
    fi
    
    # Create template content
    cat > "$file" << EOF
---
title: $title
sidebar_position: $counter
description: Documentatie voor $title
tags: $tags
keywords: $keywords
last_update:
  date: 2025-05-22
  author: System
image: /img/logo.svg
---

# $title

Documentatie voor $title.

## Inhoud wordt nog aangevuld

De documentatie voor deze sectie wordt binnenkort toegevoegd.
EOF

    echo "Fixed: $file"
    ((counter++))
done < <(find docs/finance docs/operation docs/internal -name "*.md" -type f | grep -v "/.meta/")