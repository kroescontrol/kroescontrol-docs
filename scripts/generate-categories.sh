#!/bin/bash

# generate-categories.sh
#
# Script om directory structuur en PROMPT.md bestanden te genereren
# op basis van categories.txt planning file
#
# Gebruik: 
#   ./scripts/generate-categories.sh [mode] [filter]
#   cat categories.txt | ./scripts/generate-categories.sh stdin

set -e  # Stop bij eerste fout

# Kleuren voor output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Debug functie
debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1" >&2
}

# Error functie
error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Warning functie
warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" >&2
}

# Success functie
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

# Info functie
info() {
    echo -e "${CYAN}[INFO]${NC} $1" >&2
}

# Help functie
show_help() {
    cat << EOF
Gebruik: $0 [mode] [filter]

Modi:
  check         - Controleer welke categorieën al bestaan
  create        - Maak directory structuur aan
  prompt        - Genereer PROMPT.md bestanden (vereist bestaande directories)
  full          - Volledige pipeline: create + prompt
  status        - Check docStatus van alle categorieën
  clean         - Verwijder lege directories (VOORZICHTIG!)
  stdin         - Lees categorieën van stdin

Filters:
  docs-internal - Alleen internal categorieën
  docs-operations - Alleen operations categorieën  
  docs-finance  - Alleen finance categorieën
  security      - Alleen security categorieën (shortcut voor docs-internal/beveiliging)

Voorbeelden:
  $0 check                          # Check alle categorieën
  $0 create docs-internal           # Maak alleen internal directories
  $0 prompt security                # Genereer prompts voor security
  $0 full docs-finance              # Volledige pipeline voor finance
  $0 status                         # Check docStatus van alles
  
  # Via stdin:
  echo "docs-internal/beveiliging/compliance" | $0 stdin create
  grep "security" categories.txt | $0 stdin prompt

Veiligheid:
  - Controleert automatisch op docStatus: live bestanden
  - Maakt alleen directories aan die nog niet bestaan
  - Overschrijft geen bestaande PROMPT.md bestanden
  - Gebruikt buildPrompt.sh voor veiligheidscontroles

EOF
}

# Repository root directory
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CATEGORIES_FILE="$REPO_ROOT/categories.txt"

debug "Repository root: $REPO_ROOT"
debug "Categories file: $CATEGORIES_FILE"

# Controleer of categories.txt bestaat
if [ ! -f "$CATEGORIES_FILE" ]; then
    error "Categories file niet gevonden: $CATEGORIES_FILE"
    exit 1
fi

# Parse arguments
MODE="$1"
FILTER="$2"
STDIN_MODE=false

if [ "$MODE" = "stdin" ]; then
    STDIN_MODE=true
    MODE="$2"
    FILTER="$3"
fi

# Default mode
if [ -z "$MODE" ]; then
    show_help
    exit 0
fi

# Functie: Lees categorieën (van file of stdin)
read_categories() {
    if [ "$STDIN_MODE" = true ]; then
        # Lees van stdin
        while IFS= read -r line; do
            echo "$line"
        done
    else
        # Lees van categories.txt
        cat "$CATEGORIES_FILE"
    fi
}

# Functie: Filter categorieën
filter_categories() {
    local filter="$1"
    
    while IFS= read -r line; do
        # Skip comments en lege regels
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        [[ -z "$line" || "$line" =~ ^[[:space:]]*$ ]] && continue
        
        # Apply filter
        case "$filter" in
            "docs-internal")
                [[ "$line" =~ ^docs-internal/ ]] && echo "$line"
                ;;
            "docs-operations")
                [[ "$line" =~ ^docs-operations/ ]] && echo "$line"
                ;;
            "docs-finance")
                [[ "$line" =~ ^docs-finance/ ]] && echo "$line"
                ;;
            "security")
                [[ "$line" =~ ^docs-internal/beveiliging/ ]] && echo "$line"
                ;;
            "")
                # Geen filter - alle categorieën
                echo "$line"
                ;;
            *)
                # Custom filter - grep pattern
                [[ "$line" =~ $filter ]] && echo "$line"
                ;;
        esac
    done
}

# Functie: Check of categorie al bestaat
check_category() {
    local category="$1"
    local full_path="$REPO_ROOT/$category"
    
    if [ -d "$full_path" ]; then
        echo "✅ EXISTS"
    else
        echo "❌ MISSING"
    fi
}

# Functie: Check docStatus van categorie
check_docstatus() {
    local category="$1"
    local full_path="$REPO_ROOT/$category"
    
    if [ ! -d "$full_path" ]; then
        echo "📁 NO_DIR"
        return
    fi
    
    # Gebruik analyzeDocStatus.js
    local status_output=$(node "$REPO_ROOT/scripts/analyzeDocStatus.js" report "$category" 2>/dev/null | grep -E "(live|templated|generated|completed)" | head -1 || echo "❓ UNKNOWN")
    echo "$status_output"
}

# Functie: Maak directory structuur
create_directory() {
    local category="$1"
    local full_path="$REPO_ROOT/$category"
    
    if [ -d "$full_path" ]; then
        debug "Directory bestaat al: $category"
        return 0
    fi
    
    # Maak directory
    mkdir -p "$full_path"
    success "Directory aangemaakt: $category"
    
    # Maak _category_.json als het een subcategorie is
    local category_name=$(basename "$category")
    local parent_path=$(dirname "$full_path")
    local position=10  # Default position
    
    # Bepaal label en positie op basis van category naam
    local label="$category_name"
    case "$category_name" in
        "toegangsbeheer") label="Toegangsbeheer"; position=1 ;;
        "compliance") label="Compliance"; position=2 ;;
        "procedures") label="Security Procedures"; position=3 ;;
        "tools") label="Security Tools"; position=4 ;;
        "training") label="Security Training"; position=5 ;;
        "incident-response") label="Incident Response"; position=6 ;;
        "personeel") label="Personeel"; position=1 ;;
        "beveiliging") label="Beveiliging"; position=2 ;;
        "werkafspraken") label="Werkafspraken"; position=3 ;;
        "ontwikkeling") label="Ontwikkeling"; position=4 ;;
        "kantoor") label="Kantoor"; position=5 ;;
    esac
    
    # Alleen _category_.json maken voor hoofdcategorieën (2 levels deep)
    local depth=$(echo "$category" | tr -cd '/' | wc -c)
    if [ "$depth" -eq 1 ]; then
        cat > "$full_path/_category_.json" << EOF
{
  "label": "$label",
  "position": $position,
  "collapsible": true,
  "collapsed": false
}
EOF
        debug "Created _category_.json voor $category"
    fi
}

# Functie: Genereer PROMPT.md
generate_prompt() {
    local category="$1"
    local full_path="$REPO_ROOT/$category"
    local prompt_file="$full_path/PROMPT.md"
    
    if [ ! -d "$full_path" ]; then
        error "Directory bestaat niet: $category - run 'create' eerst"
        return 1
    fi
    
    if [ -f "$prompt_file" ]; then
        warn "PROMPT.md bestaat al: $category - wordt overgeslagen"
        return 0
    fi
    
    # Safety check - gebruik buildPrompt.sh om live files te detecteren
    info "Safety check voor $category..."
    if ! "$REPO_ROOT/scripts/buildPrompt.sh" --stdout --quiet "$category" >/dev/null 2>&1; then
        error "Safety check gefaald voor $category - mogelijk live content"
        return 1
    fi
    
    # Genereer PROMPT.md met meta-prompt
    info "Genereer PROMPT.md voor $category..."
    
    # Bepaal category context op basis van path
    local main_category=$(echo "$category" | cut -d'/' -f1)
    local sub_category=$(echo "$category" | cut -d'/' -f2)
    local subsection=$(echo "$category" | cut -d'/' -f3)
    
    # Maak basis PROMPT.md template
    cat > "$prompt_file" << EOF
---
title: "PROMPT $sub_category $subsection"
sidebar_position: 99
description: "Prompt bestand voor $category documentatie"
tags: [prompt, claude-code, $sub_category]
keywords: [prompt, template, content-generatie, $subsection]
last_update:
  date: $(date +%Y-%m-%d)
  author: Serge Kroes
image: /img/logo.svg
docStatus: templated
---

# PROMPT: $sub_category - $subsection

## Context voor Content Generatie

Deze directory bevat documentatie over $subsection binnen $sub_category.

Referentie bronnen uit ./old/:
$(grep -l "$subsection\|$(echo $subsection | tr '-' ' ')" "$REPO_ROOT/old"/**/*.md 2>/dev/null | head -3 | sed 's|.*/old/|- |' || echo "- Geen directe bronnen gevonden")

## Specifieke Instructies

### Doelgroep
Kroescontrol team leden die werken met $subsection procedures.

### Tone & Stijl
- Professioneel maar toegankelijk
- Stap-voor-stap instructies waar mogelijk
- Concrete voorbeelden en templates
- Referenties naar bestaande tools (HoorayHR, Engineer Hub, etc.)

### Vereiste Secties
1. **Overzicht** - Wat is $subsection en waarom belangrijk
2. **Procedures** - Concrete stappen en workflows  
3. **Tools & Resources** - Benodigde tools en toegang
4. **Veelgestelde Vragen** - Common issues en oplossingen
5. **Contacten** - Wie te benaderen voor hulp

### Content Richtlijnen
- Gebruik concrete Kroescontrol voorbeelden
- Verwijs naar bestaande documentatie waar relevant
- Voeg checklists toe waar mogelijk
- Houd rekening met verschillende gebruikersrollen (engineer, admin, HR)

## Templates

### Frontmatter Template
\`\`\`yaml
---
title: $subsection [Specifieke Titel]
sidebar_position: [nummer]
description: [Korte beschrijving]
tags: [$sub_category, $subsection, procedures]
keywords: [relevante, zoektermen]
last_update:
  date: $(date +%Y-%m-%d)
  author: System
image: /img/logo.svg
docStatus: generated
---
\`\`\`

### Content Structuur
1. **Hoofdtitel** met korte introductie
2. **Overzicht sectie** met key points
3. **Gedetailleerde procedures** met substappen
4. **Tools en toegang** informatie
5. **FAQ sectie** met veel voorkomende vragen
6. **Contactinformatie** en escalatiepunten

## Belangrijke Aandachtspunten

- **Privacy**: Geen echte persoonlijke gegevens in voorbeelden
- **Security**: Volg Kroescontrol security richtlijnen
- **Compliance**: Houd rekening met SNA/CAO vereisten waar relevant
- **Updates**: Link naar source systemen voor actuele informatie
EOF

    success "PROMPT.md gegenereerd: $category"
}

# Hoofdlogica per mode
case "$MODE" in
    "check")
        info "=== CATEGORY CHECK ==="
        read_categories | filter_categories "$FILTER" | while IFS= read -r category; do
            [[ -z "$category" ]] && continue
            status=$(check_category "$category")
            printf "%-50s %s\n" "$category" "$status"
        done
        ;;
        
    "create")
        info "=== DIRECTORY CREATION ==="
        read_categories | filter_categories "$FILTER" | while IFS= read -r category; do
            [[ -z "$category" ]] && continue
            create_directory "$category"
        done
        ;;
        
    "prompt")
        info "=== PROMPT GENERATION ==="
        read_categories | filter_categories "$FILTER" | while IFS= read -r category; do
            [[ -z "$category" ]] && continue
            generate_prompt "$category"
        done
        ;;
        
    "full")
        info "=== FULL PIPELINE ==="
        read_categories | filter_categories "$FILTER" | while IFS= read -r category; do
            [[ -z "$category" ]] && continue
            create_directory "$category"
            generate_prompt "$category"
        done
        ;;
        
    "status")
        info "=== DOCSTATUS CHECK ==="
        read_categories | filter_categories "$FILTER" | while IFS= read -r category; do
            [[ -z "$category" ]] && continue
            status=$(check_docstatus "$category")
            printf "%-50s %s\n" "$category" "$status"
        done
        ;;
        
    "clean")
        warn "=== CLEAN EMPTY DIRECTORIES ==="
        warn "This will remove empty directories - are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            read_categories | filter_categories "$FILTER" | while IFS= read -r category; do
                [[ -z "$category" ]] && continue
                full_path="$REPO_ROOT/$category"
                if [ -d "$full_path" ] && [ -z "$(ls -A "$full_path")" ]; then
                    rmdir "$full_path"
                    warn "Verwijderd lege directory: $category"
                fi
            done
        else
            info "Clean geannuleerd"
        fi
        ;;
        
    *)
        error "Onbekende mode: $MODE"
        show_help
        exit 1
        ;;
esac

info "=== COMPLETED ==="