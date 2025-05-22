---
title: "Git-Crypt Handleiding"
sidebar_position: 3
description: "Stap-voor-stap handleiding voor het gebruik van git-crypt met onze documentatie repository."
slug: /public/tools/documentatie/git-crypt-handleiding
tags: [git-crypt,handleiding,gpg,encryptie,documentatie]
keywords: [beveiliging,repository,versleuteling,troubleshooting,gpg-sleutels]
image: /img/logo.svg
last_update:
  date: 2025-05-21
  author: Kroescontrol Team
---

# Git-Crypt Handleiding

Deze handleiding bevat gedetailleerde instructies voor het gebruik van git-crypt om veilig met de Kroescontrol documentatie repository te werken. Je leert hoe je je GPG sleutels instelt, de repository kloont, en toegang krijgt tot de versleutelde bestanden.

## Belangrijkste punten

- Git-crypt wordt gebruikt om interne documentatie te versleutelen in onze repository
- Je hebt een GPG sleutelpaar nodig voor toegang tot versleutelde bestanden
- Na de initiële setup is het gebruik vrijwel transparant

## Stap-voor-stap handleiding

### 1. Eenmalige setup: GPG sleutel genereren

Voordat je toegang kunt krijgen tot versleutelde bestanden, heb je een GPG sleutelpaar nodig.

#### Voor macOS:

```bash
# Installeer GPG als je dat nog niet hebt
brew install gnupg

# Genereer een nieuwe GPG sleutel
gpg --full-generate-key
```

#### Voor Linux:

```bash
# Installeer GPG als je dat nog niet hebt
sudo apt-get install gnupg

# Genereer een nieuwe GPG sleutel
gpg --full-generate-key
```

#### Voor Windows:

```bash
# Installeer GPG met chocolatey
choco install gnupg

# Genereer een nieuwe GPG sleutel
gpg --full-generate-key
```

Volg de prompts en kies:
- Sleuteltype: RSA and RSA (default)
- Sleutelgrootte: 4096 bits (sterk aanbevolen)
- Vervaldatum: 0 = geen vervaldatum
- Echte naam: Je volledige naam
- E-mailadres: Je werk e-mailadres (bijv. naam@kroescontrol.nl)
- Passphrase: Een sterke wachtwoordzin die je kunt onthouden

:::caution
Onthoud je passphrase goed! Als je deze verliest, verlies je toegang tot de versleutelde bestanden.
:::

### 2. Je publieke sleutel delen met de beheerder

Je moet je publieke GPG sleutel delen met een repository beheerder om toegang te krijgen.

```bash
# Lijst je sleutels om je sleutel-ID te vinden
gpg --list-keys

# Je ziet iets als: 
# pub   rsa4096 2023-05-21 [SC]
#       AB123CD456EF789GH012345678IJKLMNOPQRST901
# uid           [ultimate] Jouw Naam <jouw.email@kroescontrol.nl>
# sub   rsa4096 2023-05-21 [E]

# Exporteer je publieke sleutel
gpg --armor --export jouw.email@kroescontrol.nl > jouw-naam-pubkey.asc

# Stuur dit .asc bestand naar de repository beheerder
```

### 3. Git-crypt installeren

#### Voor macOS:

```bash
brew install git-crypt
```

#### Voor Linux:

```bash
sudo apt-get install git-crypt
```

#### Voor Windows:

```bash
choco install git-crypt
```

### 4. Repository klonen en ontsleutelen

Nadat de beheerder je GPG sleutel heeft toegevoegd aan de repository, kun je deze klonen en ontsleutelen.

```bash
# Kloon de repository
git clone https://github.com/kroescontrol/kroescontrol-docs.git
cd kroescontrol-docs

# Ontsleutel de versleutelde bestanden
git-crypt unlock
```

Je wordt gevraagd om je GPG passphrase tijdens het ontsleutelen. Na het ontsleutelen kun je de versleutelde bestanden lezen en bewerken alsof het normale tekstbestanden zijn.

### 5. Dagelijks gebruik

Na de initiële setup is het dagelijkse gebruik eenvoudig:

```bash
# Als je de repository al gekloond hebt maar opnieuw moet ontsleutelen
# (bijv. na reboot of in een nieuwe terminal)
cd kroescontrol-docs
git-crypt unlock

# Daarna gebruiken zoals elke git repository
git pull  # Haalt updates op en ontsleutelt automatisch
# Bewerk bestanden...
git add .
git commit -m "Update documentation"
git push  # Versleutelt automatisch voordat het wordt gepushed
```

### 6. Controleren van versleutelde bestanden

Je kunt controleren welke bestanden versleuteld zijn en of ze correct zijn ontsleuteld:

```bash
# Lijst alle versleutelde bestanden
git-crypt status -e

# Controleer of alle bestanden correct zijn ontsleuteld
git-crypt status
```

## Troubleshooting

### Bestanden blijven versleuteld na git-crypt unlock

Als je bestanden er nog steeds versleuteld uitzien (binaire rommel in plaats van normale tekst) na `git-crypt unlock`:

1. **Controleer of je de juiste GPG sleutel gebruikt**:
   ```bash
   gpg --list-keys jouw.email@kroescontrol.nl
   ```

2. **Controleer of je toegang hebt tot de repository**:
   ```bash
   git-crypt status -e
   ```
   
3. **Pull de laatste wijzigingen**:
   ```bash
   git pull
   git-crypt unlock
   ```

### GPG sleutel probleem

Als je een foutmelding krijgt gerelateerd aan je GPG sleutel:

1. **Controleer je GPG sleutels**:
   ```bash
   gpg --list-keys
   ```

2. **Als je sleutel is verlopen of ontbreekt**:
   - Genereer een nieuwe sleutel zoals beschreven in stap 1
   - Deel deze met de beheerder
   - Wacht tot je opnieuw bent toegevoegd

3. **Bij problemen met de GPG agent**:
   ```bash
   gpgconf --kill gpg-agent
   gpg-agent --daemon
   ```

## Voor beheerders: Gebruikers toevoegen

Als je een beheerder bent, kun je nieuwe gebruikers toevoegen aan git-crypt:

```bash
# 1. Importeer de publieke sleutel van de gebruiker
gpg --import ~/Downloads/gebruiker-pubkey.asc

# 2. Verifieer de import
gpg --list-keys gebruiker.email@kroescontrol.nl

# 3. Voeg de gebruiker toe aan git-crypt
git-crypt add-gpg-user gebruiker.email@kroescontrol.nl

# 4. Commit en push deze wijziging
git add .git-crypt/keys/default/0/*.gpg
git commit -m "Add [Gebruiker Naam] to git-crypt"
git push
```

## Veelgestelde vragen

### Moet ik elke keer git-crypt unlock uitvoeren?

Je moet `git-crypt unlock` uitvoeren:
- Na het klonen van de repository
- In elke nieuwe terminal-sessie
- Na het opnieuw opstarten van je computer

Daarna werkt alles transparant totdat je terminal-sessie eindigt.

### Wat gebeurt er als ik mijn GPG sleutel verlies?

Als je je GPG sleutel of passphrase verliest, kun je niet langer bij de versleutelde bestanden komen. Je moet:
1. Een nieuwe GPG sleutel genereren
2. Deze delen met een repository beheerder
3. Wachten tot je opnieuw toegang krijgt

### Is dit veilig voor bedrijfsgevoelige informatie?

Ja, git-crypt gebruikt sterke encryptie (AES-256) om bestanden te versleutelen. Zonder de juiste GPG sleutel kunnen de versleutelde bestanden niet worden gelezen, zelfs niet als iemand toegang heeft tot de hele repository.

### Kan ik git-crypt gebruiken op meerdere apparaten?

Ja, maar je moet je GPG sleutel exporteren en importeren op elk apparaat, en daarna `git-crypt unlock` uitvoeren op elk apparaat afzonderlijk.

```bash
# Op het eerste apparaat
gpg --export-secret-keys --armor jouw.email@kroescontrol.nl > private-key.asc

# Op het nieuwe apparaat
gpg --import private-key.asc
# Daarna git-crypt unlock zoals gewoonlijk
```

:::caution
Wees zeer voorzichtig met het exporteren van je privésleutel! Verstuur deze nooit via onbeveiligde kanalen.
:::

### Moet ik speciale acties ondernemen bij het bewerken van versleutelde bestanden?

Nee, na het ontsleutelen kun je versleutelde bestanden bewerken alsof het normale tekstbestanden zijn. Git-crypt zorgt automatisch voor de versleuteling bij commit en ontsleuteling bij checkout.