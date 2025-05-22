#!/bin/bash

# Script om meta bestanden verder te optimaliseren
# Dit script past alle meta bestanden aan volgens de nieuwe contextuele aanpak

# Functie om een meta bestand te verwerken
process_meta_file() {
  local meta_file=$1
  echo "Processing: $meta_file"
  
  # Bepaal hoofdcategorie en subcategorie (indien aanwezig) op basis van pad
  rel_path=${meta_file#*docs/}
  main_category=$(echo "$rel_path" | cut -d'/' -f1)
  
  # Bepaal subcategorie indien aanwezig
  sub_category_path=$(dirname "$rel_path" | cut -d'/' -f3-)
  if [[ "$sub_category_path" == "." || "$sub_category_path" == "" ]]; then
    sub_category=""
  else
    sub_category="/$sub_category_path"
  fi
  
  # Maak een tijdelijk bestand
  temp_file=$(mktemp)
  
  # State tracking
  state="header"
  in_code_block=false
  skip_old_paths=false
  
  # Lees het bestand regel voor regel
  while IFS= read -r line; do
    # Controleer of we in een code block zitten
    if [[ "$line" == '```' ]]; then
      if $in_code_block; then
        in_code_block=false
        
        # Voeg contextinstructies toe aan het einde van de codeblock
        echo "" >> "$temp_file"
        echo "Voor het maken van deze documentatie:" >> "$temp_file"
        echo "- Gebruik ALLE beschikbare documentatie in de \`/old/\` directory als bron" >> "$temp_file"
        echo "- Bekijk ook relevante bestaande documentatie in \`/docs/$main_category$sub_category/\` voor context" >> "$temp_file"
        echo "- Let vooral op bestanden in dezelfde directory voor een consistente stijl en aanpak" >> "$temp_file"
      else
        in_code_block=true
      fi
      echo "$line" >> "$temp_file"
      continue
    fi
    
    # Binnen code block
    if $in_code_block; then
      # Als de regel verwijst naar een hardcoded pad in /old, sla deze over
      if [[ "$line" == *"/old/"* ]]; then
        skip_old_paths=true
        continue
      fi
      
      # Als regel overeenkomt met "Gebruik ... als bronnen:", sla deze over
      if [[ "$line" == *"als bronnen"* || "$line" == *"als bron"* ]]; then
        skip_old_paths=true
        continue
      fi
      
      # Als we in skip mode zijn en een lege regel of nieuwe instructie tegenkomen, schakel terug
      if $skip_old_paths; then
        if [[ "$line" == "" || "$line" == "Beschrijf"* || "$line" == "Maak"* || "$line" == "Leg"* || "$line" == "-"* ]]; then
          skip_old_paths=false
        else
          continue
        fi
      fi
      
      echo "$line" >> "$temp_file"
    else
      # Buiten code block
      if [[ "$line" == "## Bronnen" ]]; then
        state="bronnen"
        continue
      elif [[ "$line" == "## Aantekeningen" ]]; then
        echo "## Aantekeningen" >> "$temp_file"
        echo "Dit document is onderdeel van de nieuwe documentatiestructuur. De inhoud moet worden opgesteld op basis van de bestaande documentatie uit /old/ en relevante bestanden in /docs/$main_category/, maar geherstructureerd volgens de nieuwe opzet." >> "$temp_file"
        state="aantekeningen"
        continue
      elif [[ "$state" == "header" ]]; then
        echo "$line" >> "$temp_file"
      elif [[ "$state" == "bronnen" ]]; then
        continue
      elif [[ "$state" == "aantekeningen" ]]; then
        continue
      fi
    fi
  done < "$meta_file"
  
  # Vervang het originele bestand met het bijgewerkte bestand
  mv "$temp_file" "$meta_file"
  echo "Updated: $meta_file"
}

# Verwerk alle .meta bestanden
find ./docs -path "*/\.meta/*" -name "*.md" | while read meta_file; do
  process_meta_file "$meta_file"
done

# Verwerk ook eventuele oude _meta bestanden
find ./docs -path "*/_meta/*" -name "*.md" | while read meta_file; do
  process_meta_file "$meta_file"
done

echo "All meta files have been optimized!"