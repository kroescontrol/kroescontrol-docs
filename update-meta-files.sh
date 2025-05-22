#!/bin/bash

# Script om meta bestanden te updaten naar het nieuwe formaat
# Dit script verwijdert de expliciete bronnenlijst en actualiseert de verwijzingen

# Verwerk alle .meta directories
find ./docs -path "*/\.meta/*" -name "*.md" | while read meta_file; do
  echo "Updating $meta_file..."
  
  # Tijdelijk bestand voor de bewerking
  temp_file=$(mktemp)
  
  # Begin met een lege state variabele
  state="header"
  in_code_block=false
  
  # Lees het bestand regel voor regel
  while IFS= read -r line; do
    # Controleer of we in een code block zitten
    if [[ "$line" == '```' ]]; then
      if $in_code_block; then
        in_code_block=false
      else
        in_code_block=true
      fi
      echo "$line" >> "$temp_file"
      continue
    fi
    
    # Verwerk de regel op basis van state en code block status
    if $in_code_block; then
      # Alles binnen code blocks behouden we
      echo "$line" >> "$temp_file"
    else
      # Buiten code blocks controleren we op secties
      if [[ "$line" == "## Bronnen" ]]; then
        # Skip het bronnen gedeelte, we gaan naar de aantekeningen
        state="bronnen"
        continue
      elif [[ "$line" == "## Aantekeningen" ]]; then
        # Voeg de aangepaste aantekeningen sectie toe
        echo "## Aantekeningen" >> "$temp_file"
        echo "Dit document is onderdeel van de nieuwe documentatiestructuur. De inhoud moet worden opgesteld op basis van de bestaande documentatie uit /old/, maar geherstructureerd volgens de nieuwe opzet." >> "$temp_file"
        state="aantekeningen"
        continue
      elif [[ "$state" == "header" ]]; then
        # De header sectie behouden we ongewijzigd
        echo "$line" >> "$temp_file"
      elif [[ "$state" == "bronnen" ]]; then
        # In de bronnen sectie skippen we alle regels
        continue
      elif [[ "$state" == "aantekeningen" ]]; then
        # In de aantekeningen sectie hebben we de tekst al aangepast
        continue
      fi
    fi
  done < "$meta_file"
  
  # Vervang het originele bestand met het bijgewerkte bestand
  mv "$temp_file" "$meta_file"
  echo "Updated $meta_file"
done

# Verwerk ook eventuele oude _meta bestanden
find ./docs -path "*/_meta/*" -name "*.md" | while read meta_file; do
  echo "Updating old-style meta file: $meta_file..."
  
  # Tijdelijk bestand voor de bewerking
  temp_file=$(mktemp)
  
  # Begin met een lege state variabele
  state="header"
  in_code_block=false
  
  # Lees het bestand regel voor regel
  while IFS= read -r line; do
    # Controleer of we in een code block zitten
    if [[ "$line" == '```' ]]; then
      if $in_code_block; then
        in_code_block=false
      else
        in_code_block=true
      fi
      echo "$line" >> "$temp_file"
      continue
    fi
    
    # Verwerk de regel op basis van state en code block status
    if $in_code_block; then
      # Alles binnen code blocks behouden we
      echo "$line" >> "$temp_file"
    else
      # Buiten code blocks controleren we op secties
      if [[ "$line" == "## Bronnen" ]]; then
        # Skip het bronnen gedeelte, we gaan naar de aantekeningen
        state="bronnen"
        continue
      elif [[ "$line" == "## Aantekeningen" ]]; then
        # Voeg de aangepaste aantekeningen sectie toe
        echo "## Aantekeningen" >> "$temp_file"
        echo "Dit document is onderdeel van de nieuwe documentatiestructuur. De inhoud moet worden opgesteld op basis van de bestaande documentatie uit /old/, maar geherstructureerd volgens de nieuwe opzet." >> "$temp_file"
        state="aantekeningen"
        continue
      elif [[ "$state" == "header" ]]; then
        # De header sectie behouden we ongewijzigd
        echo "$line" >> "$temp_file"
      elif [[ "$state" == "bronnen" ]]; then
        # In de bronnen sectie skippen we alle regels
        continue
      elif [[ "$state" == "aantekeningen" ]]; then
        # In de aantekeningen sectie hebben we de tekst al aangepast
        continue
      fi
    fi
  done < "$meta_file"
  
  # Vervang het originele bestand met het bijgewerkte bestand
  mv "$temp_file" "$meta_file"
  echo "Updated $meta_file"
done

echo "All meta files have been updated!"