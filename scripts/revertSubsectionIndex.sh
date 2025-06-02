#!/bin/bash

# Script om alle subsectie index.md bestanden terug te zetten naar templated
# Behoudt alleen de hoofd index.md bestanden als live

echo "🔄 Revert subsectie index.md bestanden naar templated status..."
echo ""

# Finance subsecties
finance_subsection_files=(
    "docs-finance/facturatie/index.md"
)

# Operation subsecties
operation_subsection_files=(
    "docs-operation/acquisitie/index.md"
    "docs-operation/contractpartijen/index.md"
    "docs-operation/contractpartijen/onestopsourcing/index.md"
    "docs-operation/contractpartijen/sourcepower/index.md"
    "docs-operation/inhuur/index.md"
    "docs-operation/leveranciers/index.md"
    "docs-operation/strategie/index.md"
    "docs-operation/betalingen/index.md"
    "docs-operation/betalingen/automatisering/index.md"
    "docs-operation/contractpartijen/magnit/index.md"
    "docs-operation/contractpartijen/yem/index.md"
)

# Combineer alle subsectie bestanden
all_subsection_files=("${finance_subsection_files[@]}" "${operation_subsection_files[@]}")

# Update alle subsectie bestanden terug naar templated
for file in "${all_subsection_files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Reverting $file to templated..."
        
        # Update docStatus terug naar templated
        sed -i '' 's/docStatus: live/docStatus: templated/g' "$file"
        
        # Verwijder work in progress melding
        # Verwijder de :::info Work in Progress blok
        sed -i '' '/:::info Work in Progress/,/:::/d' "$file"
        
        # Verwijder extra lege regels die mogelijk zijn achtergebleven
        awk 'BEGIN{blank=0} /^$/ {blank++; if (blank<=1) print; next} {blank=0; print}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
        
        echo "✅ Reverted $file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo ""
echo "✅ Klaar! Alle subsectie index.md bestanden zijn terug naar templated status"
echo ""
echo "📋 Status overzicht:"
echo "  - docs-finance/index.md: LIVE (hoofdindex)"
echo "  - docs-operation/index.md: LIVE (hoofdindex)"
echo "  - Alle andere index.md bestanden: TEMPLATED (uitgesloten van productie)"