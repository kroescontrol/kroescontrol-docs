#!/bin/bash
# improve-prompt.sh - Verbeter PROMPT.md kwaliteit met context-aware research

CATEGORY_PATH="$1"
if [ -z "$CATEGORY_PATH" ]; then
    echo "Gebruik: $0 <category-path>"
    echo "Voorbeeld: $0 docs-internal/beveiliging/toegangsbeheer"
    exit 1
fi

# Extract category info
CATEGORY_NAME=$(basename "$CATEGORY_PATH")
PARENT_CATEGORY=$(basename "$(dirname "$CATEGORY_PATH")")

# Build complete prompt
cat << EOF
# TAAK: VERBETER PROMPT.MD KWALITEIT VOOR CATEGORIE

## CONTEXT BASIS
$(./scripts/buildPrompt.sh --stdout default)

## SPECIFIEKE CATEGORIE VERBETERING
**Target**: $CATEGORY_PATH  
**Categorie**: $CATEGORY_NAME binnen $PARENT_CATEGORY  
**Bestaande PROMPT.md**: $(cat "$CATEGORY_PATH/PROMPT.md" 2>/dev/null || echo "ONTBREEKT")

## RESEARCH OPDRACHT
Analyseer de ./old directory voor relevante content voor deze categorie:

### Legacy Content Research
1. **Zoek in ./old/index.md** naar referenties gerelateerd aan "$CATEGORY_NAME" of "$PARENT_CATEGORY"
2. **Scan ./old/ bestanden** voor content matching deze categorie keywords
3. **Identificeer concrete procedures** uit legacy docs die relevant zijn
4. **Vind tool referenties** en Kroescontrol-specifieke workflows

### Kwaliteitsverbetering Opdracht
**VERBETER de bestaande PROMPT.md** door:

#### Als WEINIG legacy content gevonden:
- **Beknopte index aanpak** - focus op kern functionaliteit
- **Template-driven** - gebruik basis structuren
- **Minimal viable** - belangrijkste procedures only
- **Verwijs naar gerelateerde categorieën** voor meer context

#### Als VEEL legacy content gevonden:
- **Uitgebreide documentatie structuur** - meerdere documenten plan
- **Cross-referenties tussen documenten** binnen categorie
- **Concrete legacy procedures** integreren en moderniseren  
- **Index als navigation hub** naar sub-documenten
- **Tool-specific workflows** uit legacy docs

### OUTPUT SPECIFICATIES
Genereer een **VERBETERDE PROMPT.md** die:

1. **Legacy-driven content instructies** - concrete referenties naar ./old bestanden
2. **Category-specific focus** - diepgaand op $CATEGORY_NAME procedures  
3. **Kroescontrol context** - echte tools, rollen, compliance vereisten
4. **Actionable procedures** - geen generieke templates
5. **Scale-appropriate** - beknopt bij weinig info, uitgebreid bij veel content

### KWALITEITSCHECKLIST
- [ ] Verwijst naar specifieke ./old/ bestanden gevonden tijdens research
- [ ] Bevat concrete Kroescontrol voorbeelden uit legacy
- [ ] Definieert realistic scope (beknopt vs uitgebreid) 
- [ ] Includes actual tool names en access procedures
- [ ] Specifies escalation contacts en procedures
- [ ] Legacy procedures zijn gemoderniseerd voor huidige workflow

**MAAK NU EEN VERBETERDE PROMPT.MD** voor categorie: $CATEGORY_PATH
EOF