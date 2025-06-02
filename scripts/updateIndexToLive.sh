#!/bin/bash

# Script om alle index.md bestanden in operation naar live te zetten met work in progress melding

echo "🔄 Update Operation index.md bestanden naar live status..."
echo ""

# Array met alle operation index.md bestanden
operation_index_files=(
    "docs-operation/index.md"
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

# Update alle operation index bestanden
for file in "${operation_index_files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Updating $file..."
        
        # Update docStatus naar live
        sed -i '' 's/docStatus: templated/docStatus: live/g' "$file"
        
        # Voeg work in progress melding toe na de eerste heading
        # Alleen als er nog geen work in progress melding is
        if ! grep -q "Work in Progress" "$file"; then
            # Voor de hoofdindex
            if [[ "$file" == "docs-operation/index.md" ]]; then
                sed -i '' '/# Operations Documentatie/,/^## / {
                    /# Operations Documentatie/a\
\
Welkom bij de operations documentatie van Kroescontrol. Deze sectie bevat informatie die alleen toegankelijk is voor het management team.\
\
:::info Work in Progress\
Deze sectie is momenteel in ontwikkeling. De onderliggende documentatie wordt stap voor stap uitgebreid en verbeterd.\
:::\

                    /^Welkom bij de operations documentatie/d
                }' "$file"
            else
                # Voor andere index bestanden, voeg toe na eerste paragraaf
                awk '
                    /^# / { print; heading_found=1; next }
                    heading_found && /^$/ && !wip_added {
                        print ":::info Work in Progress"
                        print "Deze sectie is momenteel in ontwikkeling. De documentatie wordt stap voor stap uitgebreid."
                        print ":::"
                        print ""
                        wip_added=1
                    }
                    { print }
                ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
            fi
        fi
        
        echo "✅ Updated $file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo ""
echo "✅ Klaar! Alle operation index.md bestanden zijn nu live met work in progress meldingen"