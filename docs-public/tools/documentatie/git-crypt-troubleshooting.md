---
title: Git-Crypt Problemen Oplossen
sidebar_position: 5
description: >-
  Praktische oplossingen voor veelvoorkomende git-crypt problemen en
  foutmeldingen.
slug: /tools/documentatie/git-crypt-troubleshooting
tags:
  - git-crypt
  - troubleshooting
  - problemen
  - oplossingen
keywords:
  - foutmeldingen
  - gpg-problemen
  - unlock-issues
  - encryptie-problemen
image: /public/img/logo.svg
last_update:
  date: 2025-05-29T00:00:00.000Z
  author: Serge Kroes
docStatus: live
---

# Git-Crypt Problemen Oplossen

Deze gids helpt je bij het oplossen van veelvoorkomende problemen met git-crypt. De meeste problemen zijn eenvoudig op te lossen met de juiste stappen.

## Veelvoorkomende Problemen

### 1. "GPG error: Failed to decrypt"

**Wat je ziet:**
```bash
git-crypt: GPG error: Failed to decrypt
```

**Mogelijke oorzaken:**
- Je GPG sleutel is niet beschikbaar
- GPG agent draait niet
- Je hebt geen toegang tot deze repository

**Oplossingen:**

#### Controleer je GPG sleutels
```bash
# Kijk of je GPG sleutels beschikbaar zijn
gpg --list-secret-keys

# Test of GPG werkt
echo "test" | gpg --encrypt -r jouw.email@kroescontrol.nl | gpg --decrypt
```

#### Fix GPG agent problemen
```bash
# Stel TTY in (vooral voor macOS/Linux)
export GPG_TTY=$(tty)

# Herstart GPG agent
gpgconf --kill gpg-agent
gpg-agent --daemon
```

#### Controleer repository toegang
```bash
# Kijk of je toegang hebt
git-crypt status
```

### 2. Bestanden Blijven Versleuteld

**Wat je ziet:**
Bestanden zien er uit als willekeurige tekens in plaats van normale tekst.

**Oplossingen:**

#### Basis troubleshooting
```bash
# Controleer of unlock is uitgevoerd
git-crypt status

# Probeer opnieuw te ontgrendelen
git-crypt unlock

# Haal laatste wijzigingen op
git pull
git-crypt unlock
```

#### Voor specifieke named keys
```bash
# Als je toegang hebt tot operation documenten
git-crypt unlock -k operation

# Controleer welke keys je hebt
git-crypt status -k operation
```

### 3. "Warning: diff=git-crypt attribute not set"

**Wat je ziet:**
```bash
Warning: one or more files has a git-crypt filter attribute but not a
corresponding git-crypt diff attribute.
```

**Wat dit betekent:**
Dit is een waarschuwing, geen fout. Het betekent dat `git diff` niet optimaal werkt voor versleutelde bestanden.

**Oplossing:**
Deze waarschuwing kun je negeren - het beïnvloedt de functionaliteit niet.

### 4. Geen Toegang Tot Bepaalde Bestanden

**Wat je ziet:**
Sommige bestanden blijven versleuteld terwijl andere wel werken.

**Waarom dit gebeurt:**
Je hebt waarschijnlijk toegang tot één sleutel maar niet tot andere sleutels.

**Controleren:**
```bash
# Bekijk alle versleutelde bestanden
git-crypt status -e

# Bestanden die "encrypted" blijven staan heb je geen toegang toe
```

**Oplossing:**
Vraag een beheerder om je toe te voegen aan de juiste sleutel voor die bestanden.

### 5. GPG Sleutel Problemen

**Scenario: Je hebt een nieuwe computer**

```bash
# 1. Importeer je GPG sleutel
gpg --import jouw-private-key.asc

# 2. Vertrouw de sleutel
gpg --edit-key jouw.email@kroescontrol.nl
# In GPG prompt:
trust
5
save

# 3. Test de sleutel
git-crypt unlock
```

**Scenario: Je GPG sleutel is verlopen**
- Genereer een nieuwe GPG sleutel
- Deel de nieuwe publieke sleutel met een beheerder
- Wacht tot je toegang wordt hersteld

### 6. Repository Clone Problemen

**Probleem: Na clonen werkt git-crypt niet**

```bash
# Normale workflow na clone
git clone https://github.com/kroescontrol/kroescontrol-docs.git
cd kroescontrol-docs

# Ontgrendel de repository
git-crypt unlock

# Controleer of het werkt
git-crypt status
```

**Als unlock faalt:**
- Controleer of je GPG sleutel is geïmporteerd
- Vraag een beheerder of je toegang hebt tot de repository
- Test je GPG setup

### 7. CRLF Warning bij Git-Crypt Bestanden

**Wat je ziet:**
```bash
warning: in the working copy of 'docs-internal/file.md', CRLF will be replaced by LF the next time Git touches it
```

**Waarom dit gebeurt:**
Dit probleem treedt op wanneer encoding fix scripts (of andere tools) proberen git-crypt versleutelde bestanden te wijzigen. Git-crypt gebruikt binaire encryptie, en wanneer een script dit interpreteert als tekst en "verbetert", ontstaan er line ending conflicten.

**Technische achtergrond:**
- Git-crypt bestanden zijn binair versleuteld
- Encoding scripts zien encrypted content als "tekst met problemen"
- Scripts proberen emoji's, line endings, of encoding te "fixen"
- Dit corrumpeert de encryptie en veroorzaakt CRLF warnings
- In het ergste geval kan dit de git-crypt integriteit beschadigen

**Herkenning:**
```bash
# Check welke bestanden encrypted zijn
git-crypt status | grep "encrypted:"

# Als deze bestanden CRLF warnings geven, dan is dit het probleem
git add .
# Waarschuwingen voor encrypted bestanden = encoding script probleem
```

**Directe oplossing:**
```bash
# Reset wijzigingen aan encrypted bestanden
git checkout -- docs-internal/problematisch-bestand.md

# Of reset alle wijzigingen
git checkout -- .
```

**Preventie:**
Zorg dat encoding fix scripts git-crypt encrypted bestanden detecteren en overslaan:

```python
# Voorbeeld check in Python script
import subprocess

def is_git_crypt_encrypted(file_path):
    """Check of bestand git-crypt encrypted is"""
    result = subprocess.run(['git-crypt', 'status', file_path],
                          capture_output=True, text=True, check=False)
    if result.returncode == 0:
        return 'encrypted:' in result.stdout
    return False

# Skip encrypted bestanden
if is_git_crypt_encrypted(file_path):
    print(f"SKIP: {file_path} is encrypted")
    return
```

**Waarschuwing:**
Wijzig NOOIT handmatig git-crypt encrypted bestanden met text editors of encoding tools. Dit kan de encryptie permanent beschadigen.

## Diagnostische Commando's

### Algemene Status Check
```bash
# Overzicht van alle versleutelde bestanden
git-crypt status

# Alleen versleutelde bestanden tonen
git-crypt status -e

# Status van specifieke sleutel
git-crypt status -k operation
```

### GPG Diagnostiek
```bash
# Toon je GPG sleutels
gpg --list-keys
gpg --list-secret-keys

# Test GPG functionaliteit
echo "test" | gpg --encrypt -r jouw.email@kroescontrol.nl | gpg --decrypt

# GPG agent info
gpgconf --list-components
```

### Repository Diagnostiek
```bash
# Welke bestanden zijn versleuteld
find . -name "*.md" -exec git check-attr filter {} \;

# Check .gitattributes configuratie
cat .gitattributes | grep git-crypt
```

## Preventieve Maatregelen

### Voor Nieuwe Gebruikers
1. **Backup je GPG sleutel** onmiddellijk na aanmaken
2. **Test op een tweede apparaat** voordat je begint met werken
3. **Documenteer je setup** voor jezelf

### Voor Dagelijks Gebruik
1. **Controleer status** als iets raar lijkt: `git-crypt status`
2. **Pull altijd eerst** voordat je unlock problemen rapporteert
3. **Gebruik consistent** dezelfde GPG email als in je sleutel

### Voor Beheerders
1. **Test nieuwe gebruikers** voordat ze beginnen
2. **Documenteer welke sleutels** welke gebruiker heeft
3. **Houd backups** van kritieke GPG sleutels

## Wanneer Hulp Vragen

**Vraag hulp als:**
- Je na deze stappen nog steeds problemen hebt
- Je foutmeldingen krijgt die hier niet staan
- Je denkt dat je toegang zou moeten hebben maar het werkt niet

**Neem mee in je vraag:**
- Welke foutmelding je precies krijgt
- Output van `git-crypt status`
- Output van `gpg --list-keys`
- Wat je probeerde te doen

## Noodprocedures

### Als Niemand Toegang Heeft
Dit is een ernstig probleem. Neem contact op met:
1. Andere beheerders die backup toegang zouden moeten hebben
2. Check of er backup GPG sleutels zijn in 1Password
3. In het ergste geval: herstel van backup bestanden

### Als Repository Beschadigd Lijkt
```bash
# Probeer repository te repareren
git fsck

# Maak een verse clone
git clone [repository-url] fresh-clone
cd fresh-clone
git-crypt unlock
```

## Samenvatting

De meeste git-crypt problemen zijn gerelateerd aan:
1. **GPG configuratie** - sleutels niet beschikbaar of agent problemen
2. **Toegangsrechten** - niet toegevoegd aan de juiste sleutel
3. **Basis workflow** - vergeten `git-crypt unlock` uit te voeren

Met deze troubleshooting stappen kun je de meeste problemen zelf oplossen. Bij twijfel: vraag altijd hulp!
