#!/bin/bash

# Scan script voor gevoelige terminologie en klantnamen
# Gebruik: ./scan-sensitive-content.sh [--fix] [--report-only]

set -e

# Configuratie
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_FILE="$SCRIPT_DIR/sensitive-content-report.txt"
EXCLUSIONS_FILE="$SCRIPT_DIR/scan-exclusions.txt"
PATTERNS_FILE="$SCRIPT_DIR/scan-patterns.txt"

# Opties
FIX_MODE=false
REPORT_ONLY=false

# Parse argumenten
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX_MODE=true
            shift
            ;;
        --report-only)
            REPORT_ONLY=true
            shift
            ;;
        *)
            echo "Onbekende optie: $1"
            echo "Gebruik: $0 [--fix] [--report-only]"
            exit 1
            ;;
    esac
done

# Maak configuratie bestanden aan als ze niet bestaan
if [[ ! -f "$EXCLUSIONS_FILE" ]]; then
    cat > "$EXCLUSIONS_FILE" << 'EOF'
# Directories en bestanden om uit te sluiten van scan
.git/
node_modules/
.git-crypt/
static/branding/
docs-finance/
docs-operation/
docs-internal/
.env*
*.gpg
*.key
*.pem
build/
dist/
EOF
    echo "Aangemaakt: $EXCLUSIONS_FILE"
fi

if [[ ! -f "$PATTERNS_FILE" ]]; then
    cat > "$PATTERNS_FILE" << 'EOF'
# Gevoelige terminologie patronen (één per regel)
# Klantnamen (voorbeelden)
magnit
sourcepower
onestopsourcing
yem
athlon
# Bedrijfsgevoelige termen
kroescontrol
serge
klaas
riefel
dinant
ad2di
# Potentieel gevoelige systeem referenties
localhost:3000
127.0.0.1
database
password
secret
token
api.key
EOF
    echo "Aangemaakt: $PATTERNS_FILE"
fi

echo "=== Scanning voor gevoelige content ==="
echo "Report bestand: $REPORT_FILE"
echo "Exclusions: $EXCLUSIONS_FILE"
echo "Patterns: $PATTERNS_FILE"
echo

# Lees exclusions en bouw find argumenten
FIND_ARGS=()
while IFS= read -r line; do
    # Skip lege regels en comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    
    # Voeg -not -path toe voor elke exclusion
    if [[ "$line" == */ ]]; then
        # Directory exclusion
        FIND_ARGS+=(-not -path "./${line}*")
    else
        # File pattern exclusion
        FIND_ARGS+=(-not -name "$line")
    fi
done < "$EXCLUSIONS_FILE"

# Start report
{
    echo "=== Sensitive Content Scan Report ==="
    echo "Datum: $(date)"
    echo "Repository: $(pwd)"
    echo "Exclusions geladen: $(grep -v '^#' "$EXCLUSIONS_FILE" | grep -v '^[[:space:]]*$' | wc -l) items"
    echo "Patterns geladen: $(grep -v '^#' "$PATTERNS_FILE" | grep -v '^[[:space:]]*$' | wc -l) patterns"
    echo
} > "$REPORT_FILE"

# Lees search patterns
declare -a patterns
while IFS= read -r line; do
    # Skip lege regels en comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    patterns+=("$line")
done < "$PATTERNS_FILE"

echo "Te scannen patterns: ${#patterns[@]}"
echo "Exclusions actief: ${#FIND_ARGS[@]} regels"

# Zoek alle relevante bestanden
echo "Zoeken naar bestanden..."
files_to_scan=()
while IFS= read -r -d '' file; do
    files_to_scan+=("$file")
done < <(find . -type f \
    -name "*.md" -o -name "*.txt" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.sh" \
    "${FIND_ARGS[@]}" \
    -print0)

echo "Bestanden gevonden: ${#files_to_scan[@]}"

# Scan elk pattern
total_matches=0
for pattern in "${patterns[@]}"; do
    echo "Scanning pattern: '$pattern'"
    
    # Zoek matches voor dit pattern
    matches_found=false
    for file in "${files_to_scan[@]}"; do
        if grep -l -i "$pattern" "$file" 2>/dev/null; then
            if [[ "$matches_found" == false ]]; then
                echo "=== Pattern: '$pattern' ===" >> "$REPORT_FILE"
                matches_found=true
            fi
            
            echo "MATCH: $file" >> "$REPORT_FILE"
            
            # Toon context regels
            echo "Context:" >> "$REPORT_FILE"
            grep -n -i -C 2 "$pattern" "$file" 2>/dev/null | head -20 >> "$REPORT_FILE"
            echo >> "$REPORT_FILE"
            
            ((total_matches++))
        fi
    done
    
    if [[ "$matches_found" == true ]]; then
        echo >> "$REPORT_FILE"
    fi
done

echo >> "$REPORT_FILE"
echo "=== Samenvatting ===" >> "$REPORT_FILE"
echo "Totaal matches gevonden: $total_matches" >> "$REPORT_FILE"
echo "Bestanden gescand: ${#files_to_scan[@]}" >> "$REPORT_FILE"
echo "Patterns gebruikt: ${#patterns[@]}" >> "$REPORT_FILE"

echo
echo "=== Scan compleet ==="
echo "Totaal matches: $total_matches"
echo "Report: $REPORT_FILE"

if [[ "$REPORT_ONLY" == false ]]; then
    echo
    echo "Voor git history rewrite van gevonden bestanden:"
    echo "git filter-repo --path-glob 'BESTANDSNAAM' --invert-paths --force"
    echo
    echo "Bekijk $REPORT_FILE voor details"
fi

if [[ $total_matches -gt 0 ]]; then
    exit 1
else
    echo "Geen gevoelige content gevonden!"
    exit 0
fi