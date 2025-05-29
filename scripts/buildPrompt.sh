#!/bin/bash

# buildPrompt.sh
# 
# Script om modulaire prompt samen te stellen voor een target directory
# Concat: CLAUDE.md -> CLAUDE.local.md -> CLAUDE_* modules -> target PROMPT.md
# 
# Gebruik: ./scripts/buildPrompt.sh <target-directory>

set -e  # Stop bij eerste fout

# Kleuren voor output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Debug functie
debug() {
    if [ "$QUIET_MODE" = false ]; then
        echo -e "${BLUE}[DEBUG]${NC} $1" >&2
    fi
}

# Error functie
error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Warning functie
warn() {
    if [ "$QUIET_MODE" = false ]; then
        echo -e "${YELLOW}[WARN]${NC} $1" >&2
    fi
}

# Success functie
success() {
    if [ "$QUIET_MODE" = false ]; then
        echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
    fi
}

# Help functie
show_help() {
    cat << EOF
Gebruik: $0 [opties] <target-directory>

Dit script bouwt een modulaire prompt door de volgende bestanden te concateneren:
1. CLAUDE_*.md modules (docs-internal/tools/claudecode/prompt/)
2. PROMPT.md in target directory

Opties:
  --stdout    Output naar stdout (auto-quiet mode)
  --quiet     Onderdruk debug berichten (alleen errors)
  --verbose   Toon debug berichten ook met --stdout
  --no-prompt Excludeer target PROMPT.md (alleen CLAUDE modules)
  -h, --help  Toon deze help

Veiligheidscontroles:
- Stopt als er docStatus: live bestanden in target directory zijn
- Controleert of alle verwachte bestanden bestaan
- Debug logging (tenzij quiet mode)

Voorbeelden:
  $0 docs-internal/voorbeeld1                      # → prompt-combined.txt
  $0 --stdout docs-public/branding | claude       # Clean stdout naar Claude
  $0 --stdout --verbose docs-internal/voorbeeld1   # Stdout met debug info
  $0 --stdout --no-prompt docs-internal/beveiliging/toegangsbeheer  # Alleen CLAUDE modules
  $0 --stdout --no-prompt default                 # Alleen basis CLAUDE modules (geen target dir)

EOF
}

# Parse command line arguments
STDOUT_MODE=false
QUIET_MODE=false
NO_PROMPT_MODE=false
TARGET_DIR=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --stdout)
            STDOUT_MODE=true
            QUIET_MODE=true  # Auto-enable quiet mode when stdout is used
            shift
            ;;
        --quiet)
            QUIET_MODE=true
            shift
            ;;
        --verbose)
            QUIET_MODE=false  # Override auto-quiet from --stdout
            shift
            ;;
        --no-prompt)
            NO_PROMPT_MODE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            if [ -z "$TARGET_DIR" ]; then
                TARGET_DIR="$1"
            else
                error "Onbekende optie: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# Check of target directory gegeven is
if [ -z "$TARGET_DIR" ]; then
    show_help
    exit 0
fi

# Handle special 'default' keyword
if [ "$TARGET_DIR" = "default" ]; then
    debug "Default mode: alleen CLAUDE modules, geen target directory"
    NO_PROMPT_MODE=true
    # Skip directory validation for default mode
else
    debug "Target directory: $TARGET_DIR"
    
    # Validatie: target directory moet bestaan
    if [ ! -d "$TARGET_DIR" ]; then
        error "Target directory '$TARGET_DIR' bestaat niet"
        exit 1
    fi
fi

# Repository root directory (waar script vandaan wordt aangeroepen)
REPO_ROOT="$(pwd)"
debug "Repository root: $REPO_ROOT"

# Definieer alle bestandspaden
CLAUDE_MODULES_DIR="$REPO_ROOT/docs-internal/tools/claudecode/prompt"
TARGET_PROMPT="$REPO_ROOT/$TARGET_DIR/PROMPT.md"

# CLAUDE modules in volgorde
CLAUDE_MODULES=(
    "CLAUDE_basis.md"
    "CLAUDE_structuur.md" 
    "CLAUDE_content.md"
    "CLAUDE_deployment.md"
    "CLAUDE_workflow.md"
)

debug "CLAUDE modules directory: $CLAUDE_MODULES_DIR"
debug "Target PROMPT.md: $TARGET_PROMPT"

# Functie: Check voor live bestanden in target directory
check_live_files() {
    # Skip live file check voor default mode
    if [ "$TARGET_DIR" = "default" ]; then
        debug "Default mode: skip live bestanden check"
        return 0
    fi
    
    debug "Controleren op live bestanden in $TARGET_DIR..."
    
    # Gebruik node script om docStatus te checken
    local live_files=$(node "$REPO_ROOT/scripts/analyzeDocStatus.js" live 2>/dev/null | grep "$TARGET_DIR" | grep -v "📁" || true)
    
    if [ -n "$live_files" ]; then
        error "GEVONDEN: Live bestanden in target directory!"
        error "Live bestanden kunnen niet worden overschreven voor veiligheid:"
        echo "$live_files" | while read line; do
            error "  $line"
        done
        error ""
        error "Los dit op door:"
        error "1. Status te wijzigen: node scripts/generateContent.js set-status path/to/file.md completed"
        error "2. Of een andere directory te kiezen"
        exit 1
    fi
    
    success "Geen live bestanden gevonden - veilig om door te gaan"
}

# Functie: Controleer of bestand bestaat
check_file_exists() {
    local filepath="$1"
    local description="$2"
    
    if [ -f "$filepath" ]; then
        debug "✓ $description: $filepath"
        return 0
    else
        warn "✗ $description ONTBREEKT: $filepath"
        return 1
    fi
}

# Functie: Voeg bestand toe aan output
append_file() {
    local filepath="$1"
    local description="$2"
    local output_file="$3"
    
    if [ -f "$filepath" ]; then
        debug "Toevoegen: $description"
        
        if [ "$STDOUT_MODE" = true ]; then
            echo ""
            echo "# ==========================================="
            echo "# $description"
            echo "# Bron: $filepath"
            echo "# ==========================================="
            echo ""
            cat "$filepath"
            echo ""
        else
            echo "" >> "$output_file"
            echo "# ===========================================" >> "$output_file"
            echo "# $description" >> "$output_file"
            echo "# Bron: $filepath" >> "$output_file"
            echo "# ===========================================" >> "$output_file"
            echo "" >> "$output_file"
            cat "$filepath" >> "$output_file"
            echo "" >> "$output_file"
        fi
        return 0
    else
        warn "Overslaan (ontbreekt): $description - $filepath"
        return 1
    fi
}

# Hoofdlogica
main() {
    debug "=== START PROMPT BUILD PROCES ==="
    
    # 1. Veiligheidscontrole: Check voor live bestanden
    check_live_files
    
    # 2. Controleer of alle basis bestanden bestaan
    debug "=== BESTAND VALIDATIE ==="
    
    local missing_critical=0
    
    # Controleer kritieke bestanden (CLAUDE modules)
    
    # Controleer CLAUDE modules
    for module in "${CLAUDE_MODULES[@]}"; do
        local module_path="$CLAUDE_MODULES_DIR/$module"
        check_file_exists "$module_path" "CLAUDE module: $module" || missing_critical=1
    done
    
    # Target PROMPT.md is optioneel - waarschuw alleen
    check_file_exists "$TARGET_PROMPT" "Target PROMPT.md" || true
    
    if [ $missing_critical -eq 1 ]; then
        error "Kritieke bestanden ontbreken - kan niet doorgaan"
        exit 1
    fi
    
    # 3. Bouw de gecombineerde prompt
    debug "=== PROMPT SAMENSTELLING ==="
    
    local output_file="$REPO_ROOT/prompt-combined.txt"
    
    # Initialize output (file or stdout)
    if [ "$STDOUT_MODE" = true ]; then
        echo "# GECOMBINEERDE PROMPT VOOR: $TARGET_DIR"
        echo "# Gegenereerd op: $(date)"
        echo "# Door: buildPrompt.sh"
    else
        # Maak schone output file
        echo "# GECOMBINEERDE PROMPT VOOR: $TARGET_DIR" > "$output_file"
        echo "# Gegenereerd op: $(date)" >> "$output_file"
        echo "# Door: buildPrompt.sh" >> "$output_file"
    fi
    
    # Voeg CLAUDE modules toe in volgorde
    for module in "${CLAUDE_MODULES[@]}"; do
        local module_path="$CLAUDE_MODULES_DIR/$module"
        append_file "$module_path" "CLAUDE Module: $module" "$output_file"
    done
    
    # Target PROMPT.md als laatste (tenzij --no-prompt is gebruikt)
    if [ "$NO_PROMPT_MODE" = false ]; then
        append_file "$TARGET_PROMPT" "Target Directory PROMPT.md" "$output_file"
    else
        debug "PROMPT.md overgeslagen vanwege --no-prompt flag"
    fi
    
    # 4. Resultaat rapporteren
    debug "=== RESULTAAT ==="
    
    if [ "$STDOUT_MODE" = true ]; then
        success "Prompt via stdout voltooid!"
    else
        local file_size=$(wc -c < "$output_file")
        local line_count=$(wc -l < "$output_file")
        
        success "Prompt succesvol samengesteld!"
        echo ""
        echo -e "${GREEN}📄 Output bestand:${NC} $output_file"
        echo -e "${GREEN}📏 Bestandsgrootte:${NC} $file_size bytes"
        echo -e "${GREEN}📃 Aantal regels:${NC} $line_count"
        echo ""
        echo -e "${BLUE}💡 Gebruik:${NC}"
        echo "   cat prompt-combined.txt | pbcopy    # Kopieer naar clipboard (macOS)"
        echo "   less prompt-combined.txt           # Bekijk inhoud"
        echo "   rm prompt-combined.txt            # Verwijder na gebruik"
        echo ""
    fi
    
    debug "=== PROMPT BUILD VOLTOOID ==="
}

# Voer hoofdlogica uit
main "$@"