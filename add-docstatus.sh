#!/bin/bash

# Script voor het bulk toevoegen van docStatus frontmatter
# Gebruik: ./add-docstatus.sh <status> <bestand1> [bestand2] ...

if [ $# -lt 2 ]; then
    echo "Gebruik: $0 <status> <bestand1> [bestand2] ..."
    echo "Status opties: locked, live, completed, generated, templated"
    exit 1
fi

STATUS=$1
shift  # Remove first argument (status) from $@

# Validate status
case $STATUS in
    locked|live|completed|generated|templated)
        ;;
    *)
        echo "Fout: Ongeldige status '$STATUS'"
        echo "Geldige opties: locked, live, completed, generated, templated"
        exit 1
        ;;
esac

add_docstatus_to_file() {
    local file="$1"
    local status="$2"
    
    if [ ! -f "$file" ]; then
        echo "Waarschuwing: Bestand '$file' niet gevonden"
        return 1
    fi
    
    # Check if file already has docStatus
    if grep -q "docStatus:" "$file"; then
        echo "Skip: $file (heeft al docStatus)"
        return 0
    fi
    
    # Get the title from the file
    local title=""
    if grep -q "^title:" "$file"; then
        # If title exists in frontmatter, extract it
        title=$(grep "^title:" "$file" | head -1)
    else
        # Try to get title from first H1 header
        local h1_title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
        if [ ! -z "$h1_title" ]; then
            title="title: \"$h1_title\""
        else
            # Use filename as fallback
            local basename=$(basename "$file" .md)
            title="title: \"$basename\""
        fi
    fi
    
    # Create temporary file
    local temp_file=$(mktemp)
    
    if grep -q "^---" "$file"; then
        # File has existing frontmatter - add docStatus after first line
        if [ ! -z "$title" ] && ! grep -q "^title:" "$file"; then
            # Add title and docStatus after first ---
            awk -v title="$title" -v status="$status" '
            /^---$/ && !seen {print; print title; print "docStatus: " status; seen=1; next}
            {print}' "$file" > "$temp_file"
        else
            # Just add docStatus after first ---
            awk -v status="$status" '
            /^---$/ && !seen {print; print "docStatus: " status; seen=1; next}
            {print}' "$file" > "$temp_file"
        fi
    else
        # File has no frontmatter, create new
        {
            echo "---"
            echo "$title"
            echo "docStatus: $status"
            echo "---"
            echo ""
            cat "$file"
        } > "$temp_file"
    fi
    
    # Replace original file
    mv "$temp_file" "$file"
    echo "Toegevoegd: $file (docStatus: $status)"
}

# Process all files
for file in "$@"; do
    add_docstatus_to_file "$file" "$STATUS"
done

echo "Klaar! Verwerkt $(($# )) bestanden met status: $STATUS"