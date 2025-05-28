#!/bin/bash
# Niet stoppen bij eerste fout - alle validaties uitvoeren
# set -e

# Colors voor output - alleen rood voor echte errors, rest wit (default)
RED='\033[1;31m'     # Bright red voor errors
NC='\033[0m'         # No Color (wit/default voor alles anders)

echo "⌨️  Post Keyboard Hoek - Keyboard Validation"
echo "=============================================="
# Counter voor errors
errors=0

# Functie voor error reporting
report_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((errors++))
}

# Functie voor success reporting
report_success() {
    echo "✅ $1"
}

# Functie voor info reporting
report_info() {
    echo "ℹ️  $1"
}

# Functie voor warning reporting (wit, geen kleur)
report_warning() {
    echo "⚠️  WARNING: $1"
}


# Git status check
if [[ -n $(git status --porcelain) ]]; then
    report_info "Er zijn uncommitted changes. Dit kan deployment problemen veroorzaken."
    git status --short
else
    report_success "Git working directory is clean"
fi

# Git-crypt status check
if ! command -v git-crypt &> /dev/null; then
    report_error "git-crypt is niet geïnstalleerd"
else
    # Check git-crypt initialization (more robust test)
    if git-crypt status >/dev/null 2>&1 || [[ -f ".git-crypt/.gitattributes" ]]; then
        report_success "git-crypt is correct geïnitialiseerd"
        
        # Check access to encrypted content (non-blocking)
        access_output=$(npm run check-access --silent 2>/dev/null || echo "")
        if [[ -n "$access_output" ]]; then
            echo "$access_output" | grep -E "(✅|🔒)" | head -3
            if [[ "$access_output" == *"ENCRYPTED"* ]]; then
                report_info "Sommige directories zijn encrypted (normaal in sommige omgevingen)"
            else
                report_success "Encrypted directories zijn toegankelijk"
            fi
        else
            report_info "Git-crypt access check overgeslagen (mogelijk geen encrypted content)"
        fi
    else
        report_warning "git-crypt lijkt niet geïnitialiseerd (mogelijk geen encrypted content in repo)"
    fi
fi

# Encoding validation test voor Unicode/emoji problemen
report_info "Encoding validation - controleer voor problematische karakters..."
encoding_errors=()

# Extra check voor gewijzigde/staged files
changed_files=$(git diff --name-only --cached 2>/dev/null)
modified_files=$(git diff --name-only 2>/dev/null)
if [[ -n "$changed_files" ]] || [[ -n "$modified_files" ]]; then
    report_info "Let extra op: er zijn gewijzigde files die encoding problemen kunnen introduceren"
    if [[ -n "$changed_files" ]]; then
        report_info "Staged files: $(echo $changed_files | tr '\n' ' ')"
    fi
    if [[ -n "$modified_files" ]]; then
        report_info "Modified files: $(echo $modified_files | tr '\n' ' ')"
    fi
fi

# Check voor Unicode replacement character (het probleem dat we hadden)
unicode_files=$(grep -r "�" docs-* 2>/dev/null | grep -v ".git" | head -5)
if [[ -n "$unicode_files" ]]; then
    encoding_errors+=("Unicode replacement character (�) gevonden")
    echo "$unicode_files" | while read -r line; do
        report_warning "Unicode replacement character in: $line"
    done
fi

# Check voor problematische multi-byte emoji's in markdown bestanden
problematic_emojis=()
while IFS= read -r -d '' file; do
    if [[ -f "$file" ]] && grep -l -E "🏃‍♂️|👨‍💻|🧪|👩‍💻" "$file" >/dev/null 2>&1; then
        problematic_emojis+=("$file")
    fi
done < <(find docs-* -name "*.md" -print0 2>/dev/null)

if [[ ${#problematic_emojis[@]} -gt 0 ]]; then
    encoding_errors+=("Complexe emoji's gevonden die encoding problemen kunnen veroorzaken")
    report_warning "Files met complexe emoji's: ${problematic_emojis[*]}"
fi

# Check voor BOM (Byte Order Mark) headers
bom_files=$(find docs-* -name "*.md" -exec file {} \; 2>/dev/null | grep -E "(UTF-8.*BOM|UTF-16)" | head -3)
if [[ -n "$bom_files" ]]; then
    encoding_errors+=("BOM headers gevonden die problemen kunnen veroorzaken")
    echo "$bom_files" | while read -r line; do
        report_warning "BOM header in: $line"
    done
fi

if [[ ${#encoding_errors[@]} -eq 0 ]]; then
    report_success "Geen encoding problemen gevonden"
else
    for error in "${encoding_errors[@]}"; do
        report_warning "Encoding: $error"
    done
fi

# docStatus system test
if [[ -f "scripts/generateContent.js" ]] && [[ -d "src/plugins/filter-docs-by-status" ]]; then
    report_info "docStatus systeem validatie..."
    
    # Test basic script functionality
    if node scripts/generateContent.js --help >/dev/null 2>&1; then
        report_success "docStatus scripts zijn functioneel"
        
        # Test docStatus report functie
        if npm run docstatus:report >/dev/null 2>&1; then
            report_success "docStatus rapport functie werkt"
        else
            report_warning "docStatus rapport functie faalde (mogelijk geen documenten met status)"
        fi
    else
        report_error "docStatus scripts zijn niet functioneel - check dependencies"
    fi
    
    # Check for docStatus plugin in config
    if grep -q "filter-docs-by-status" docusaurus.config.js; then
        report_success "docStatus plugin is geconfigureerd in Docusaurus"
    else
        report_error "docStatus plugin niet gevonden in docusaurus.config.js"
    fi
else
    report_info "docStatus systeem niet gedetecteerd (optioneel)"
fi

# Package dependencies check
if [[ ! -d "node_modules" ]]; then
    report_warning "node_modules directory niet gevonden. Run 'npm install'"
else
    # Check for security vulnerabilities
    if npm audit --audit-level=high --silent &> /dev/null; then
        report_success "Geen high-severity security vulnerabilities gevonden"
    else
        report_warning "High-severity security vulnerabilities gevonden. Run 'npm audit fix'"
    fi
fi

# Environment variabelen check
if [[ -f ".env" ]]; then
    report_success ".env bestand gevonden"
    
    # Check voor belangrijke variabelen
    if grep -q "OPENAI_API_KEY" .env; then
        report_info "OPENAI_API_KEY gevonden in .env"
    else
        report_warning "OPENAI_API_KEY niet gevonden in .env (optioneel voor public deployment)"
    fi
    
    if grep -q "ENABLE_PRE_COMMIT_VALIDATION" .env; then
        validation_enabled=$(grep "ENABLE_PRE_COMMIT_VALIDATION" .env | cut -d'=' -f2)
        report_success "Pre-commit validation setting: $validation_enabled"
    else
        report_info "ENABLE_PRE_COMMIT_VALIDATION niet gevonden in .env (default: false)"
    fi
else
    report_info ".env bestand niet gevonden. Kopieer .env.example naar .env indien nodig"
fi

# Sidebar generatie test

# Sidebar generatie is nu automatisch via Docusaurus - geen handmatige tests nodig
report_info "Sidebar generatie gebeurt automatisch via Docusaurus"

# Build tests

# Backup existing build if it exists
if [[ -d "build" ]]; then
    mv build build.backup
fi

# Test normale build
if npm run build > build-normal.log 2>&1; then
    report_success "Normale build succesvol"
    rm -f build-normal.log
    # Check of belangrijke bestanden aanwezig zijn
    if [[ -f "build/index.html" ]]; then
        report_success "index.html gegenereerd"
    else
        report_error "index.html niet gevonden in build"
    fi
else
    report_error "Build test - normale build gefaald. Check build-normal.log voor details"
fi

# Cleanup build voor volgende test (maar continue altijd)
rm -rf build || true

# Test public-only build
if PUBLIC_ONLY=true npm run build > build-public.log 2>&1; then
    report_success "PUBLIC_ONLY build succesvol"
    rm -f build-public.log
    # Check of public routes beschikbaar zijn
    if [[ -f "build/index.html" ]]; then
        report_success "Public index.html gegenereerd"
    else
        report_error "Public index.html niet gevonden in build"
    fi
else
    report_error "Build test - PUBLIC_ONLY build gefaald. Check build-public.log voor details"
fi

# Restore backup build if it existed (maar continue altijd)
if [[ -d "build.backup" ]]; then
    rm -rf build || true
    mv build.backup build || true
else
    rm -rf build || true
fi

# Deployment script syntax check

# Check deploy-public-only.sh syntax
if bash -n deploy-public-only.sh; then
    report_success "deploy-public-only.sh syntax is correct"
else
    report_error "deploy-public-only.sh heeft syntax errors"
fi

# Check of deploy script executeerbaar is
if [[ -x "deploy-public-only.sh" ]]; then
    report_success "deploy-public-only.sh is executable"
else
    report_warning "deploy-public-only.sh is niet executable. Run 'chmod +x deploy-public-only.sh'"
fi

# Git remote check
if git ls-remote origin &> /dev/null; then
    report_success "Toegang tot kroescontrol-docs repository confirmed"
else
    report_warning "Kan geen verbinding maken met kroescontrol-docs repository. Check SSH keys."
fi
if git ls-remote git@github.com:kroescontrol/kroescontrol-public.git &> /dev/null; then
    report_success "Toegang tot kroescontrol-public repository confirmed"
else
    report_warning "Kan geen verbinding maken met kroescontrol-public repository. Check SSH keys."
fi

# File permissions check

# Check of belangrijke bestanden niet world-writable zijn
problematic_files=()
while IFS= read -r -d '' file; do
    if [[ -w "$file" ]] && [[ $(stat -f "%A" "$file" 2>/dev/null || stat -c "%a" "$file" 2>/dev/null) =~ [2367]$ ]]; then
        problematic_files+=("$file")
    fi
done < <(find . -name "*.sh" -o -name "*.js" -o -name "*.json" -print0 2>/dev/null)

if [[ ${#problematic_files[@]} -eq 0 ]]; then
    report_success "Bestandspermissies zijn veilig"
else
    report_warning "Sommige bestanden hebben brede schrijfpermissies:"
    printf '%s\n' "${problematic_files[@]}"
fi

# Final summary
echo "📊 Post Keyboard Hoek Summary"

if [[ $errors -eq 0 ]]; then
    echo "🎉 Alle validaties succesvol! Je kunt veilig deployen."
    exit 0
else
    echo -e "${RED}💥 $errors error(s) gevonden. Check je keyboard voor de fix!${NC}"
    echo "💡 Je kunt ook warnings negeren en toch deployen, maar errors moeten gefixed worden."
    exit 1
fi