#!/bin/bash

# Pre-push validation script voor docs repository
# Voert alle checks uit die ook in de preview deployment gebeuren

set -e  # Stop bij eerste fout

echo "🔍 Pre-push Validation voor Docs Repository"
echo "=========================================="
echo ""

# Kleuren voor output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track of alle checks succesvol zijn
ALL_CHECKS_PASSED=true

# 1. TypeScript Type Check
echo -e "${BLUE}1. TypeScript Type Check...${NC}"
if npm run type-check; then
    echo -e "${GREEN}✓ TypeScript check passed${NC}\n"
else
    echo -e "${RED}✗ TypeScript check failed${NC}\n"
    ALL_CHECKS_PASSED=false
fi

# 2. ESLint Check
echo -e "${BLUE}2. ESLint Check...${NC}"
if npm run lint; then
    echo -e "${GREEN}✓ ESLint check passed${NC}\n"
else
    echo -e "${RED}✗ ESLint check failed${NC}\n"
    ALL_CHECKS_PASSED=false
fi

# 3. MDX Validation with Source Mapping
echo -e "${BLUE}3. MDX Content Validation (with source mapping)...${NC}"
if npm run validate:mdx:sources; then
    echo -e "${GREEN}✓ MDX validation passed${NC}\n"
else
    echo -e "${YELLOW}⚠ MDX validation found issues${NC}"
    echo -e "${YELLOW}  Check output above for source file locations${NC}"
    echo -e "${YELLOW}  Fix files in their source repositories!${NC}\n"
    # Niet fataal maken voor warnings, maar toon duidelijke info
fi

# 4. Internal Content Sync
echo -e "${BLUE}4. Syncing Internal Content...${NC}"
if npm run sync-internal; then
    echo -e "${GREEN}✓ Internal content synced${NC}\n"
else
    echo -e "${RED}✗ Internal content sync failed${NC}\n"
    ALL_CHECKS_PASSED=false
fi

# 5. Production Build Test
echo -e "${BLUE}5. Production Build Test...${NC}"
echo "Dit kan enkele minuten duren..."

# Verwijder oude build artifacts
rm -rf .next out

if npm run build; then
    echo -e "${GREEN}✓ Production build successful${NC}\n"
else
    echo -e "${RED}✗ Production build failed${NC}\n"
    ALL_CHECKS_PASSED=false
fi

# 6. Check for build artifacts
echo -e "${BLUE}6. Checking Build Output...${NC}"
if [ -d ".next" ]; then
    echo -e "${GREEN}✓ Build artifacts present${NC}\n"
else
    echo -e "${RED}✗ No build artifacts found${NC}\n"
    ALL_CHECKS_PASSED=false
fi

# Resultaat
echo "=========================================="
if [ "$ALL_CHECKS_PASSED" = true ]; then
    echo -e "${GREEN}✅ Alle checks succesvol!${NC}"
    echo -e "${GREEN}Het is veilig om te pushen.${NC}"
    exit 0
else
    echo -e "${RED}❌ Een of meer checks zijn gefaald!${NC}"
    echo -e "${RED}Fix de problemen voordat je pusht.${NC}"
    echo ""
    echo -e "${YELLOW}Tip: Voor meer details, run de gefaalde commando's individueel:${NC}"
    echo "  npm run type-check"
    echo "  npm run lint"
    echo "  npm run validate:mdx"
    echo "  npm run build"
    exit 1
fi