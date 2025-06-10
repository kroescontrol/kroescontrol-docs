---
sidebar_class_name: hidden
description: "Template voor kantoorlocatie pagina's"
tags: [prompt, kantoor, locaties]
keywords: [template, kantoor, locatie, mr green]
last_update:
  date: 2025-01-06
  author: Serge Kroes
---
<!-- BELANGRIJK: sidebar_class_name: hidden houdt PROMPT.md onzichtbaar in sidebar maar wel toegankelijk via URL -->

# PROMPT: Kantoorlocatie Template

## CONTEXT & DOEL

Dit is het standaard template voor elke Kroescontrol kantoorlocatie pagina. Elke locatie krijgt een uitgebreide landingspagina die functioneert als:

1. **TLDR voor bezoekers** - Alle essentiële informatie op één plek
2. **Praktische gids** - Voor medewerkers en gasten
3. **Landingspagina** - Kan gedeeld worden met externen

## TEMPLATE STRUCTUUR

```markdown
---
id: [locatienaam-in-lowercase]
title: Kantoor [Locatienaam]
sidebar_label: [Locatienaam]
sidebar_position: [nummer]
description: Kroescontrol kantoor [Locatienaam] - bereikbaarheid, faciliteiten en praktische informatie
tags: [kantoor, locatie, [locatienaam], mr green]
keywords: [kantoor, [locatienaam], parkeren, bereikbaarheid, faciliteiten, mr green]
last_update:
  date: [YYYY-MM-DD]
  author: [Auteur Naam]
---

# Kantoor [Locatienaam]

## 🏢 Over deze locatie

[Korte introductie van 2-3 zinnen over de locatie, het karakter en waarom deze locatie bijzonder is]

### Adresgegevens
**Bezoekadres:**  
[Straatnaam en nummer]  
[Postcode] [Plaats]  

**Contact:**  
Telefoon: 055-301 1082  
Email: info@mrgreenoffices.nl  
WhatsApp: +31 55 799 8765

## 🚗 Bereikbaarheid & Parkeren

### Met de auto
[Specifieke routebeschrijving en bijzonderheden]

**Parkeren:**
- [Parkeermogelijkheden]
- [Kosten indien van toepassing]
- [Tips voor parkeren]

### Met het openbaar vervoer
- **Dichtstbijzijnde station:** [Station naam] ([afstand])
- **Bus/Tram/Metro:** [Lijnnummers en haltes]
- **Reistijd vanaf:** 
  - Amsterdam Centraal: [tijd]
  - Utrecht Centraal: [tijd]
  - Schiphol: [tijd]

### Duurzaam reizen
- **Fiets:** [Fietsvoorzieningen]
- **Elektrisch laden:** [Laadpalen info]
- **Carpool mogelijkheden:** [Info]

## 🏢 Faciliteiten

### Werkplekken
- Ergonomische bureaus met sta-zit functie
- 34" widescreen monitors met laptop docking
- High-speed WiFi (enterprise grade)
- Rustige werkzones en concentratieplekken

### Vergaderfaciliteiten
- [Aantal] vergaderruimtes van [grootte]
- Moderne AV-apparatuur en presentatieschermen
- Videocall faciliteiten
- Whiteboard en brainstorm tools

### Voorzieningen
- **Koffie & Thee:** Premium koffie, diverse theesoorten (inbegrepen)
- **Lunch:** Gezonde lunch tegen kostprijs
- **Print/Scan:** €0,15 zwart-wit, €0,50 kleur
- **Wellness:** E-gym met douches
- **Overig:** Kolf- en gebedsruimte

### [Locatie-specifieke faciliteiten]
[Bijzondere faciliteiten voor deze locatie, zoals terras, natuuruitzicht, etc.]

## 👥 Flexibel werken

### Voor Kroescontrol medewerkers
- Werkplek reserveren via [systeem]
- Flexibele werkplekken beschikbaar
- Vaste werkplekken voor regelmatige gebruikers

### Voor bezoekers
- **Altijd op afspraak** via je Kroescontrol contactpersoon
- Gastenregistratie bij aankomst
- WiFi gastentoegang beschikbaar

### Toegang
- **Medewerkers:** Persoonlijke toegangspas via Salto systeem
- **Bezoekers:** Aanmelden bij receptie of via intercom
- **Openingstijden:** Ma-Vr 08:00-18:00 (met toegangspas 24/7)

## 💡 Ideaal voor

- [Specifieke use cases voor deze locatie]
- [Type meetings of werk]
- [Doelgroepen]

## 📞 Support & Assistentie

### Mr. Green Office Support
Voor vragen over faciliteiten, problemen of assistentie:
- **Telefoon:** 055-301 1082
- **WhatsApp:** +31 55 799 8765
- **Email:** info@mrgreenoffices.nl
- **On-site:** Receptie tijdens kantooruren

### Kroescontrol Support
Voor Kroescontrol-specifieke vragen:
- Neem contact op met je Kroescontrol contactpersoon
- Of mail naar: info@kroescontrol.nl

## 🗺️ Routebeschrijving

### Vanuit [Richting 1]
[Gedetailleerde routebeschrijving]

### Vanuit [Richting 2]
[Gedetailleerde routebeschrijving]

### Tips voor eerste bezoek
- [Specifieke tips]
- [Herkenningspunten]
- [Waar te melden]

---

**Laatste update:** [Datum]  
**Vragen?** Neem contact op met je Kroescontrol contactpersoon of Mr. Green support.
```

## IMPLEMENTATIE RICHTLIJNEN

### Per Locatie Aanpassen
1. **Locatie-specifieke details** invullen (adressen, routes, tijden)
2. **Unieke kenmerken** benadrukken (natuuromgeving, centrale ligging, etc.)
3. **Praktische tips** toevoegen die relevant zijn voor die locatie
4. **Use cases** aanpassen aan karakter locatie

### Consistentie Bewaken
- Gebruik dezelfde structuur voor alle locaties
- Houd de tone-of-voice consistent (professioneel maar toegankelijk)
- Zorg dat alle praktische info actueel is
- Gebruik emoji's consistent voor sectiekoppen

### Updates
- Parkeerinformatie regelmatig controleren
- OV-verbindingen actueel houden
- Faciliteiten updates doorvoeren
- Contact informatie verifiëren

## CONTENT BRONNEN

Gebruik informatie uit:
- `/docs-public/kantoor/parkeren.md` - Parkeerinformatie per regio
- `/docs-public/kantoor/contact-support.md` - Flexibel werken en toegang
- `/docs-internal/mrgreen/mr-green-handleiding.md` - Faciliteiten en support
- Bestaande locatiepagina's voor specifieke details

## KWALITEITSCRITERIA

- [ ] Alle contactinformatie is correct
- [ ] Routebeschrijvingen zijn duidelijk en actueel
- [ ] Parkeertarieven zijn up-to-date
- [ ] OV-informatie is geverifieerd
- [ ] Faciliteiten lijst is compleet
- [ ] Pagina werkt als standalone landingspagina
- [ ] Links naar andere secties werken correct
- [ ] Consistent met andere locatiepagina's