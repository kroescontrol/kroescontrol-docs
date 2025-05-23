---
title: "Repository en Toegang"
sidebar_position: 2
description: "Uitleg over de documentatie repository en toegangsbeheer voor verschillende informatieniveaus."
slug: /public/tools/documentatie/repository-toegang
tags: [documentatie,repository,github,toegangsbeheer,beveiliging]
keywords: [git-crypt,versleuteling,inloggen,autorisatie,structuur,publiek,intern]
image: /img/logo.svg
last_update:
  date: 2025-05-21
  author: Kroescontrol Team
---

# Repository en Toegang

Deze pagina beschrijft hoe onze documentatie is gestructureerd, waar deze is opgeslagen, en hoe je toegang kunt krijgen tot verschillende niveaus van informatie.

## Belangrijkste punten

- Onze documentatie is opgeslagen in de `kroescontrol-docs` GitHub repository
- Publieke documentatie is voor iedereen toegankelijk
- Interne documentatie is beveiligd met git-crypt en vereist GPG sleutels
- Interne documentatie is ook toegankelijk via de website na inloggen met GitHub

## Gedetailleerde informatie

### Repository structuur

De `kroescontrol-docs` repository bevat alle documentatie van Kroescontrol, inclusief arbeidsvoorwaarden, processen en procedures.

De repository is als volgt gestructureerd:

```
kroescontrol-docs/
  ├── docusaurus.config.js      # Configuratie voor de documentatiewebsite
  ├── src/                     # Website broncode
  ├── static/                  # Statische assets
  ├── docs/                    # Alle documentatie
  │   ├── public/              # Publiek toegankelijke docs
  │   ├── internal/            # Interne docs (versleuteld)
  │   ├── operation/           # Operationele docs (versleuteld)
  │   └── finance/             # Financiële docs (versleuteld)
  └── .gitattributes           # Definieert welke bestanden versleuteld zijn
```

### Toegangsniveaus

We werken met vier verschillende niveaus van documentatie toegang:

| Niveau | Repository Pad | GitHub Team | Beschrijving |
|--------|---------------|-------------|--------------|
| **Publiek** | `/docs/public/` | - | Voor iedereen toegankelijk |
| **Intern** | `/docs/internal/` | kroescontrol-engineers | Alle werknemers |
| **Operationeel** | `/docs/operation/` | kroescontrol-operation | Operations team |
| **Financieel** | `/docs/finance/` | kroescontrol-finance | Finance team |

#### 1. GitHub Repository Toegang

Voor developers en medewerkers die direct willen bijdragen aan de documentatie:

**Git-crypt versleuteling:**
- **Publieke content**: Niet versleuteld - iedereen kan deze lezen
- **Gevoelige content**: Versleuteld met git-crypt
  - Verschillende sleutels per toegangsniveau
  - Vereist GPG sleutel toegevoegd door beheerder
  - Ontsleutelen met `git-crypt unlock` (en eventueel `-k operation` voor operationele documenten)

#### 2. Website Toegang

Voor dagelijks gebruik door alle medewerkers:

**Team-based authorization:**
- **Publieke content**: Voor iedereen toegankelijk zonder login
- **Beveiligde content**: Na inloggen met GitHub worden je teamlidmaatschappen gecontroleerd
  - `kroescontrol-engineers`: Toegang tot interne documentatie
  - `kroescontrol-operation`: Toegang tot operationele documentatie  
  - `kroescontrol-finance`: Toegang tot financiële documentatie

### Beveiligingsmechanisme

We gebruiken git-crypt voor selectieve versleuteling van gevoelige bestanden:

- Bestanden in `/docs/internal/`, `/docs/operation/` en `/docs/finance/` worden automatisch versleuteld
- Versleuteling gebeurt bij commits, ontsleuteling bij checkout
- Alleen gebruikers met geautoriseerde GPG sleutels kunnen de content ontsleutelen
- Dit zorgt ervoor dat we één enkele repository kunnen gebruiken, terwijl we gevoelige content beschermen

### Procedure voor toegang

#### Voor repository toegang:

1. Genereer een GPG sleutelpaar als je die nog niet hebt
2. Deel je publieke GPG sleutel met een repository beheerder
3. De beheerder voegt je sleutel toe aan git-crypt
4. Kloon de repository en ontsleutel met `git-crypt unlock`

Zie de [Git-Crypt Handleiding](./git-crypt-handleiding.md) voor gedetailleerde instructies.

#### Voor website toegang:

1. Vraag toegang tot de Kroescontrol GitHub organisatie (als je die nog niet hebt)
2. Vraag om toevoeging aan het juiste GitHub team:
   - `kroescontrol-engineers` voor interne documentatie
   - `kroescontrol-operation` voor operationele documentatie
   - `kroescontrol-finance` voor financiële documentatie
3. Ga naar docs.kroescontrol.nl
4. Klik op "Inloggen met GitHub"
5. Autoriseer de applicatie om je GitHub gegevens en teamlidmaatschappen te lezen
6. Na succesvolle authenticatie krijg je toegang tot de documentatie die bij jouw teamlidmaatschappen hoort

## Voordelen van deze aanpak

Deze hybride aanpak biedt ons verschillende voordelen:

1. **Open Source filosofie**: De repository is publiek, in lijn met onze open source mentaliteit
2. **Gedecentraliseerde toegang**: Geen centrale server voor authenticatie
3. **Flexibele contributie**: Iedereen kan suggesties doen voor publieke content
4. **Veilig voor gevoelige informatie**: Interne docs blijven beveiligd
5. **Laagdrempelige toegang**: Niet-technische gebruikers kunnen de website gebruiken

## Veelgestelde vragen

### Kan ik bijdragen aan de documentatie zonder developer toegang?

Ja, op twee manieren:
1. Je kunt suggesties indienen via GitHub issues
2. Je kunt de "Bewerk deze pagina" link gebruiken op de website

### Wat als ik mijn GPG sleutel verlies?

Als je je GPG sleutel of passphrase verliest, kun je niet langer de versleutelde content ontsleutelen. Je moet dan:
1. Een nieuwe GPG sleutel genereren
2. Deze delen met een repository beheerder
3. Wachten tot je opnieuw bent toegevoegd

### Is het veilig om interne documentatie in een publieke repository op te slaan?

Ja, de git-crypt versleuteling is zeer veilig. Zelfs als iemand toegang heeft tot de repository, kan deze persoon de versleutelde bestanden niet lezen zonder een geautoriseerde GPG sleutel.

### Kan ik offline werken met de documentatie?

Ja, nadat je de repository hebt gekloond en ontsleuteld, heb je volledige offline toegang tot alle documentatie. Wijzigingen kun je later pushen wanneer je weer online bent.