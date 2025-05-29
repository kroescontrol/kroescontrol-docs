---
title: Hoe Git-Crypt Werkt
sidebar_position: 4
description: >-
  Uitleg van hoe git-crypt werkt in onze documentatie repository - transparante
  bestandsversleuteling voor veilige samenwerking.
slug: /public/tools/documentatie/hoe-git-crypt-werkt
tags:
  - git-crypt
  - uitleg
  - beveiliging
  - samenwerking
keywords:
  - transparante-encryptie
  - repository-beveiliging
  - automatische-versleuteling
  - teamwork
image: /img/logo.svg
last_update:
  date: 2025-05-23T00:00:00.000Z
  author: Kroescontrol Team
docStatus: live
---

# Hoe Git-Crypt Werkt

Git-crypt zorgt ervoor dat gevoelige documenten automatisch versleuteld worden opgeslagen, terwijl je er gewoon mee kunt werken alsof het normale bestanden zijn.

## Het Basisprincipe

Stel je voor dat je een kluis hebt waar je automatisch je gevoelige documenten in stopt wanneer je ze wegbergt, en die ze automatisch weer tevoorschijn haalt wanneer je ze nodig hebt - zonder dat je er zelf bij na hoeft te denken.

Zo werkt git-crypt ook:
- **Bij opslaan**: Gevoelige bestanden worden automatisch versleuteld
- **Bij ophalen**: Ze worden automatisch weer ontsleuteld
- **Tijdens werken**: Je merkt er niets van - alles werkt gewoon

## Wat Gebeurt Er Achter de Schermen?

### 1. Repository Setup
Onze documentatie repository is zo ingericht:

```
docs/
├── public/          ← Iedereen kan dit lezen
├── internal/        ← Alleen medewerkers (versleuteld)
├── operation/       ← Alleen management (versleuteld)
└── finance/         ← Alleen finance team (versleuteld)
```

### 2. Toegangscontrole met "Sleutels"
We gebruiken verschillende "sleutels" voor verschillende groepen:

- **Standaard sleutel**: Alle medewerkers krijgen toegang tot interne documenten
- **Operation sleutel**: Alleen management krijgt toegang tot operationele documenten
- **Finance sleutel**: Alleen finance team krijgt toegang tot financiële documenten

### 3. Hoe Versleuteling Werkt
```
Je bewerkt een bestand → Git slaat het versleuteld op → Anderen kunnen het ontsleutelen met hun sleutel
```

## Waarom Dit Systeem?

### Voordelen voor Ons Team
- **Gewoon werken**: Je merkt niets van de versleuteling tijdens je dagelijkse werk
- **Veiligheid**: Gevoelige informatie is beschermd, zelfs als iemand toegang krijgt tot de repository
- **Flexibiliteit**: Verschillende teamleden krijgen toegang tot relevante documenten
- **Samenwerking**: Iedereen kan bijdragen aan publieke documentatie

### Praktische Voorbeelden
**Scenario 1: Nieuwe medewerker**
- Krijgt toegang tot publieke en interne documenten
- Kan direct meewerken aan algemene documentatie
- Ziet geen financiële of operationele details

**Scenario 2: Manager**
- Krijgt toegang tot alle documenten
- Kan operationele procedures bijwerken
- Heeft volledig overzicht van processen

**Scenario 3: Finance team**
- Krijgt toegang tot publieke, interne én financiële documenten
- Kan boekhouding en facturatie documenten beheren

## De Technische Basis (Eenvoudig Uitgelegd)

### GPG Sleutels
Elke persoon heeft een "digitale sleutel" (GPG sleutel):
- **Publieke sleutel**: Kan gedeeld worden, wordt gebruikt om dingen voor jou te versleutelen
- **Privé sleutel**: Alleen jij hebt deze, wordt gebruikt om dingen te ontsleutelen

### Repository Master Sleutel
- De repository heeft één "hoofdsleutel" die daadwerkelijk bestanden versleutelt
- Deze hoofdsleutel is zelf versleuteld met ieders publieke GPG sleutel
- Alleen mensen met de juiste privé sleutel kunnen de hoofdsleutel gebruiken

### Automatisch Proces
```
1. Je maakt wijzigingen in een document
2. Git-crypt controleert: "Is dit een gevoelig bestand?"
3. Zo ja: versleutel het automatisch voor opslag
4. Zo nee: sla het gewoon op
5. Wanneer jij of een collega het bestand opent, wordt het automatisch ontsleuteld
```

## Wat Betekent Dit Voor Jou?

### Als Je Werkt aan Documenten
- Bewerk bestanden gewoon in je favoriete editor
- Sla op en commit zoals altijd
- Git-crypt zorgt automatisch voor de versleuteling

### Als Je de Repository Kloont
- Clone de repository normaal
- Voer één keer `git-crypt unlock` uit
- Alle bestanden waar je toegang toe hebt worden automatisch ontsleuteld

### Als Je Problemen Hebt
- Vraag een beheerder om je GPG sleutel toe te voegen
- Test of je toegang hebt met `git-crypt status`
- Bij problemen: check onze troubleshooting gids

## Beveiliging in Simpele Termen

### Wat is Beschermd
- Inhoud van gevoelige documenten is volledig versleuteld
- Alleen mensen met de juiste sleutel kunnen ze lezen
- Zelfs als iemand de hele repository steelt, kunnen ze geen gevoelige info lezen

### Wat is Niet Beschermd
- Bestandsnamen zijn zichtbaar (maar niet de inhoud)
- Het feit dat er bestanden zijn is zichtbaar
- Publieke documenten blijven voor iedereen leesbaar

### Praktische Veiligheid
- Backup je GPG sleutel goed (bijvoorbeeld in 1Password)
- Gebruik een sterke wachtwoordzin voor je GPG sleutel
- Rapporteer problemen met toegang direct aan het team

## Samenvatting

Git-crypt zorgt ervoor dat we:
1. **Veilig** gevoelige informatie kunnen delen binnen het team
2. **Eenvoudig** kunnen samenwerken aan documentatie
3. **Flexibel** verschillende toegangsniveaus kunnen geven
4. **Transparant** kunnen werken zonder complexe procedures

Het is als een slimme kluis die automatisch de juiste documenten aan de juiste mensen geeft, zonder dat je er zelf bij na hoeft te denken.
