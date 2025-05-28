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
    # Check git-crypt status (check exit code, ignore output)
    if git-crypt status >/dev/null 2>&1; then
        report_success "git-crypt is correct geïnitialiseerd"
        
        # Check for diff attribute warnings
        warning_count=$(git-crypt status 2>&1 | grep "WARNING: diff=git-crypt attribute not set" | wc -l)
        if [[ $warning_count -gt 0 ]]; then
            report_warning "$warning_count bestanden hebben ontbrekende diff=git-crypt attributen in .gitattributes"
        else
            report_success "Alle git-crypt attributen zijn correct ingesteld"
        fi
        
        # Check access to encrypted content
        access_output=$(npm run check-access --silent 2>&1 || echo "FAILED")
        if [[ "$access_output" == *"FAILED"* ]]; then
            report_error "Kan git-crypt access niet controleren"
        else
            echo "$access_output"
            if [[ "$access_output" == *"ENCRYPTED"* ]]; then
                report_info "Sommige directories zijn nog encrypted. Je hebt mogelijk niet de juiste git-crypt key."
            else
                report_success "Alle encrypted directories zijn toegankelijk"
            fi
        fi
    else
        report_error "git-crypt is niet correct geïnitialiseerd in deze repository"
    fi
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