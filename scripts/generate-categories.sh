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
  remove        - Verwijder volledige categorieën met inhoud (beschermt live content)
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
  $0 remove security                # Verwijder alle security categorieën
  
  # Via stdin:
  echo "docs-internal/beveiliging/compliance" | $0 stdin create
  grep "security" categories.txt | $0 stdin prompt

Veiligheid:
  - Controleert automatisch op docStatus: live bestanden
  - Maakt alleen directories aan die nog niet bestaan
  - Overschrijft geen bestaande PROMPT.md bestanden
  - Gebruikt buildPrompt.sh voor veiligheidscontroles
  - Remove mode controleert docStatus en beschermt live content automatisch

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
        echo "NO_DIR"
        return
    fi
    
    # Check alle .md bestanden in de directory voor docStatus
    local has_live=false
    local has_any_files=false
    
    # Zoek alle .md bestanden in de directory
    find "$full_path" -name "*.md" -type f | while read -r md_file; do
        has_any_files=true
        # Extract docStatus uit frontmatter
        local doc_status=$(grep "^docStatus:" "$md_file" 2>/dev/null | head -1 | sed 's/docStatus: *//' | tr -d ' \r\n')
        if [ "$doc_status" = "live" ]; then
            echo "LIVE_FOUND"
            exit 1
        fi
    done
    
    # Check result van subshell
    if [ $? -eq 1 ]; then
        echo "live"
    else
        echo "safe"
    fi
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
    
    # Probeer buildPrompt.sh - capture exit code
    if "$REPO_ROOT/scripts/buildPrompt.sh" --stdout --quiet "$category" >/dev/null 2>&1; then
        debug "Safety check OK voor $category"
    else
        local exit_code=$?
        # Exit code 1 kan betekenen: live files (error) of missing PROMPT.md (warning)
        # Probeer specifieke live file check
        if "$REPO_ROOT/scripts/buildPrompt.sh" --stdout --quiet "$category" 2>&1 | grep -q "Live bestanden"; then
            error "Safety check gefaald voor $category - bevat live content!"
            return 1
        else
            debug "Safety check warning voor $category - PROMPT.md ontbreekt (normaal voor nieuwe directories)"
        fi
    fi
    
    # Genereer PROMPT.md met meta-prompt
    info "Genereer PROMPT.md voor $category..."
    
    # Bepaal category context op basis van path
    local main_category=$(echo "$category" | cut -d'/' -f1)
    local sub_category=$(echo "$category" | cut -d'/' -f2)
    local subsection=$(echo "$category" | cut -d'/' -f3)
    
    # Bepaal category-specific context
    local specific_focus=""
    local old_files=""
    local current_tools=""
    local responsible_roles=""
    local compliance_requirements=""
    local category_friendly_name=""
    local specific_keywords=""
    
    # Category-specific configuratie
    case "$sub_category" in
        "facturatie")
            specific_focus="Factuurnummer systemen, billing procedures, client-specific workflows"
            old_files="Procesbeschrijving Factuurnummering bij Kroescontrol.md, Procesbeschrijving Magnit reverse billing.md, Procesbeschrijving facturatie KPN_YEM.md"
            current_tools="Billing Hub, Administratiekantoor Winst in Balans, Client portals"
	    responsible_roles="Bruno (administratie), Patriek(goedkeuring), Serge (goedkeuring), Engineers (tijdregistratie)"
            compliance_requirements="BTW procedures, Client requirements"
            specific_keywords="facturatie, billing, reverse-billing, factuurnummering"
            ;;
        "compliance")
            specific_focus="SNA procedures, CAO naleving, audit preparatie, certificering"
            old_files="SNA/Kroescontrol procedure Loonadministatie en Cao-Toepassing.md, SNA/directe link naar register en verklaring.md"
            current_tools="SNA register systeem, CAO database, HoorayHR compliance module"
            responsible_roles="Bruno (payroll), Serge (compliance officer), HR (CAO naleving)"
            compliance_requirements="SNA certificering onderhoud, CAO periodic compliance, Audit trail maintenance"
            specific_keywords="SNA, CAO, compliance, audit, certificering, loonadministratie"
            ;;
        "beveiliging")
            specific_focus="Security procedures, toegangsbeheer, incident response"
            old_files="INDOCU onboarding spullen.md, Procesbeschrijving Personeelsregistratie.md"
            current_tools="1Password, Google Workspace Admin, HoorayHR access management"
            responsible_roles="Serge (security officer), IT Admin (access provisioning)"
            compliance_requirements="GDPR compliance, Security incident reporting, Access audit trails"
            specific_keywords="security, toegang, 1password, incidents, privacy"
            ;;
        "personeel")
            specific_focus="HR procedures, HoorayHR, arbeidsovereenkomsten, personeelsadministratie"
            old_files="Arbeidsovereenkomst Kroescontrol Engineer (template).md, Personeelshandboek van Kroescontrol.md"
            current_tools="HoorayHR, Google Workspace, Pensioen administratie"
            responsible_roles="HR (contracts), Bruno (payroll), Serge (approval)"
            compliance_requirements="CAO compliance, Contract law, GDPR for employee data"
            specific_keywords="personeel, contracts, arbeidsovereenkomst, HR, personeelshandboek"
            ;;
        "werkafspraken")
            specific_focus="Budget structuren, reglementen, engineer agreements"
            old_files="62 Kroescontrol Engineerbudget reglement.md, 03 Kroescontrol Introductie.md, 24 Welkom bij Kroescontrol.md"
            current_tools="Engineer Hub, Budget tracking sheets, HoorayHR declarations"
            responsible_roles="Engineers (budget gebruik), Management (approval), Finance (tracking)"
            compliance_requirements="Budget compliance, Tax implications, Engineer agreement adherence"
            specific_keywords="budget, engineer-budget, reglement, werkafspraken, mobility"
            ;;
        "ontwikkeling")
            specific_focus="Carrièreontwikkeling, training, certificeringen"
            old_files="Kroescontrol Self-Directed Learning.md, 45 Engineer Hub_ Uitleg Tabbladen & Formules.md"
            current_tools="Engineer Hub training module, Certification platforms, Learning budget tracking"
            responsible_roles="Engineers (development), Management (approval), HR (tracking)"
            compliance_requirements="Training budget compliance, Certification maintenance"
            specific_keywords="training, certificering, carrière, ontwikkeling, self-directed-learning"
            ;;
        "operations")
            specific_focus="Operationele procedures, werkprocessen, kwaliteit"
            old_files=""
            current_tools="Project management tools, Quality assurance systems"
            responsible_roles="Operations team, Quality manager, Project leads"
            compliance_requirements="ISO procedures, Quality standards, Process documentation"
            specific_keywords="operations, procedures, kwaliteit, werkprocessen"
            ;;
        "klanten")
            specific_focus="Client procedures, inhuur workflows, markt positie"
            old_files="Opdrachten portals toelichting.md, Toelichting - de markt - onze positite.md"
            current_tools="Client portals, CRM systems, Contract management"
            responsible_roles="Account managers, Engineers (client delivery), Management (contracts)"
            compliance_requirements="Client contractual obligations, SLA compliance"
            specific_keywords="klanten, inhuur, opdrachten, markt, client-portals"
            ;;
        *)
            # Default voor onbekende categorieën
            specific_focus="$subsection procedures en workflows binnen $sub_category"
            old_files="Legacy documentation gerelateerd aan $subsection"
            current_tools="Relevante Kroescontrol tools en systemen"
            responsible_roles="Team leden werkend met $subsection"
            compliance_requirements="Standaard Kroescontrol compliance vereisten"
            specific_keywords="$sub_category, $subsection, procedures"
            ;;
    esac
    
    # Bepaal friendly name
    case "$subsection" in
        "toegangsbeheer") category_friendly_name="Toegangsbeheer en Account Provisioning" ;;
        "nummering") category_friendly_name="Factuurnummering Procedures" ;;
        "cao-toepassing") category_friendly_name="CAO Toepassing en Naleving" ;;
        "winst-in-balans") category_friendly_name="Administratiekantoor Procedures" ;;
        *) category_friendly_name="$(echo $subsection | sed 's/-/ /g' | sed 's/\b\w/\U&/g')" ;;
    esac
    
    # Zoek echte /old referenties
    local found_old_files=""
    if [ -d "$REPO_ROOT/old" ]; then
        found_old_files=$(find "$REPO_ROOT/old" -name "*.md" -type f | xargs grep -l "$subsection\|$(echo $subsection | tr '-' ' ')" 2>/dev/null | head -3 | sed "s|$REPO_ROOT/old/|- |" | tr '\n' ' ' || echo "- Geen directe bronnen gevonden")
    fi
    
    # Maak category-aware PROMPT.md template
    cat > "$prompt_file" << EOF
---
title: "PROMPT $category_friendly_name"
sidebar_position: 99
description: "Context-aware prompt voor $category_friendly_name documentatie"
tags: [prompt, claude-code, $sub_category, $subsection]
keywords: [$specific_keywords]
last_update:
  date: $(date +%Y-%m-%d)
  author: Serge Kroes
image: /img/logo.svg
docStatus: templated
---

# PROMPT: $category_friendly_name

## 🎯 SPECIFIEKE CONTEXT DEFINITIE

### Wat deze categorie doet:
**$subsection** binnen **$sub_category** behandelt: $specific_focus

### Directe Bronnen uit ./old/:
$old_files

### Gevonden legacy referenties:
$found_old_files

### Kroescontrol Context:
- **Huidige tools**: $current_tools
- **Verantwoordelijke rollen**: $responsible_roles  
- **Compliance vereisten**: $compliance_requirements

## 📋 CONCRETE CONTENT INSTRUCTIES

### Verplichte Documentatie Onderdelen:

#### 1. **Overzicht & Doel** (Altijd eerste sectie)
- Waarom bestaat deze procedure binnen Kroescontrol?
- Welke business need lost het op?
- Wie gebruikt het dagelijks?
- Referentie naar legacy documentatie uit ./old/

#### 2. **Concrete Procedures** (Hoofdcontent)
Gebaseerd op ./old/ referenties:
- **Stap-voor-stap workflows** met Kroescontrol specifieke details
- **Voorbeelden met echte data** (geanonimiseerd)  
- **Tools en systemen** die gebruikt worden ($current_tools)
- **Escalatiepunten** bij problemen

#### 3. **Praktische Resources** (Actionable)
- **Checklist templates** voor dagelijks gebruik
- **Contactgegevens** voor ondersteuning ($responsible_roles)
- **Link naar tools** en toegangsprocedures
- **Troubleshooting guide** voor veelvoorkomende issues

#### 4. **Compliance & Governance** (Kroescontrol specifiek)
Focus op: $compliance_requirements
- **SNA/CAO vereisten** (indien van toepassing)
- **Privacy/Security** overwegingen
- **Audit trails** en documentatie vereisten

## 🎨 OUTPUT SPECIFICATIES

### Frontmatter Requirements:
\`\`\`yaml
---
title: "$category_friendly_name"
sidebar_position: 1
description: "Kroescontrol $category_friendly_name procedures en workflows"
tags: [$sub_category, $subsection, procedures, kroescontrol]
keywords: [$specific_keywords]
last_update:
  date: $(date +%Y-%m-%d)
  author: System
image: /img/logo.svg
docStatus: generated
---
\`\`\`

### Content Structuur:
\`\`\`markdown
# $category_friendly_name

## Overzicht
[Waarom belangrijk voor Kroescontrol + referentie naar ./old/ legacy files]

## Procedures  
[Concrete stappen uit legacy documentatie, gemoderniseerd voor huidige tools]

## Tools & Toegang
[$current_tools - welke systemen + hoe toegang krijgen]

## Veelgestelde Vragen
[Uit legacy docs + nieuwe vragen gebaseerd op huidige workflows]

## Contacten & Escalatie
[$responsible_roles - wie benaderen + wanneer]

## Gerelateerde Documentatie  
[Links naar andere relevante procedures binnen $main_category]
\`\`\`

## 🔍 KWALITEITSEISEN

### Must-Have Elementen:
- [✓] **Concrete acties** - elke sectie moet actionable zijn
- [✓] **Kroescontrol specifiek** - geen generieke templates  
- [✓] **Legacy gebaseerd** - minimaal 70% uit ./old/ content
- [✓] **Tool integratie** - verwijzingen naar $current_tools
- [✓] **Role-based** - duidelijk wie wat doet ($responsible_roles)

### Verboden:
- [✗] **Vage instructies** ("neem contact op" zonder specifieke persoon)
- [✗] **Generic templates** zonder Kroescontrol context
- [✗] **Ontbrekende ./old/ referenties** 
- [✗] **Tool namen** zonder uitleg hoe toegang te krijgen

## 🎯 VERIFICATIE CHECKLIST

Voor deze specifieke documentatie:
- [ ] Verwijst naar specifieke ./old/ files: $old_files
- [ ] Bevat concrete Kroescontrol voorbeelden uit legacy docs
- [ ] Noemt tools en toegangsprocedures: $current_tools
- [ ] Heeft duidelijke escalatiepunten: $responsible_roles
- [ ] Volgt compliance vereisten: $compliance_requirements
- [ ] Is actionable voor dagelijks gebruik
- [ ] Integreert met bestaande $main_category workflows

## 🚨 CATEGORY-SPECIFIC FOCUS

Voor $sub_category/$subsection specifiek:
$specific_focus

**Let op**: Deze documentatie moet praktisch bruikbaar zijn voor Kroescontrol team leden en gebaseerd zijn op bewezen procedures uit de legacy documentatie.
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
        
    "remove")
        info "=== REMOVE CATEGORIEËN ==="
        read_categories | filter_categories "$FILTER" | while IFS= read -r category; do
            [[ -z "$category" ]] && continue
            full_path="$REPO_ROOT/$category"
            if [ -d "$full_path" ]; then
                # Check docStatus voor safety
                status_check=$(check_docstatus "$category")
                if [[ "$status_check" =~ "live" ]]; then
                    warn "OVERGESLAGEN (live content): $category"
                else
                    rm -rf "$full_path"
                    success "VERWIJDERD: $category"
                fi
            else
                debug "Bestaat niet: $category"
            fi
        done
        ;;
        
    *)
        error "Onbekende mode: $MODE"
        show_help
        exit 1
        ;;
esac

info "=== COMPLETED ==="
