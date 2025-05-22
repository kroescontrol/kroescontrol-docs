# Claude Prompt Template

Gebruik deze prompt template voor het bijwerken van documentatie met dynamische bronnen uit de `/old/` directory.

## Standaard Prompt voor Document Updates

```
# Document Update Instructie

Ik wil het volgende document bijwerken:
- Document pad: `/docs/[hoofdcategorie]/[pad]/[bestandsnaam].md`

## Proces voor het bijwerken van dit document:

1. LEES EERST:
   - CLAUDE.md voor projectcontext en documentatierichtlijnen
   - OVERRIDE_GUIDELINES.md voor prioriteitsregels die altijd voorrang hebben
   - Het huidige document dat bijgewerkt moet worden
   - Het bijbehorende .meta bestand in `/docs/[hoofdcategorie]/.meta/[pad]/[bestandsnaam].md`
   - **ALLE BESCHIKBARE BRONBESTANDEN in de `/old/` directory**

2. BRONNEN ANALYSEREN:
   - Bekijk de inhoud van alle bestanden in de `/old/` directory
   - Identificeer de meest relevante bestanden voor dit specifieke document op basis van de metadata en instructies in het .meta bestand
   - Geef prioriteit aan bestanden die direct gerelateerd zijn aan het onderwerp

3. BEHOUD BIJ UPDATES:
   - De bestaande frontmatter structuur (titel, tags, etc.)
   - De hoofdstructuur van het document (koppen en secties)
   - Alle correcte en actuele bestaande informatie
   - De algehele toon en stijl van het document

4. WIJZIG ALLEEN:
   - Verouderde informatie
   - Onjuiste informatie volgens OVERRIDE_GUIDELINES.md
   - Inconsistenties in terminologie
   - Secties die expliciet aangegeven zijn om te worden bijgewerkt

5. VOEG TOE:
   - Nieuwe informatie uit de beschikbare bronbestanden
   - Aanvullingen waar bestaande content onvolledig is

6. ZORG VOOR:
   - Een heldere, professionele maar toegankelijke stijl
   - Correcte Markdown opmaak
   - Consistente structuur met andere documenten (standaard: Intro, Belangrijkste punten, Gedetailleerde informatie, optioneel FAQ)
   - Logische presentatie van informatie
   - Correcte frontmatter met alle verplichte velden: title, sidebar_position, description, tags, keywords, last_update, image
   - Specifieke, descriptieve tags (NOOIT "overzicht")
   - Technische expertise in Kubernetes, Cloud Native, Observability en SRE Engineering waar relevant

Integreer alle wijzigingen naadloos in het bestaande document, zodat het resultaat een coherent, bijgewerkt document is dat voldoet aan alle richtlijnen.

## Gewenst resultaat:
Lever de volledige bijgewerkte inhoud van het document, inclusief frontmatter.
```

## Voorbeelden van gebruik

### Voorbeeld 1: Volledige update van een bestaand document

```
Lees CLAUDE_PROMPT_DOCUMENT.md en update het document docs/internal/budgetten/kroescontrol/engineer-budget.md.

Let vooral op recente wijzigingen in het reglement en pas de voorbeelden aan volgens de huidige template.
```

### Voorbeeld 2: Specifieke sectie bijwerken

```
Lees CLAUDE_PROMPT_DOCUMENT.md en update het document docs/internal/tools/engineer-hub.md.

Focus vooral op de sectie "Tabbladen & Formules" om de nieuwste functionaliteiten toe te lichten.
```

### Voorbeeld 3: Nieuw document maken

```
Lees CLAUDE_PROMPT_DOCUMENT.md en maak een nieuw document in docs/public/kennismaking/events.md.

Dit document moet een overzicht geven van de komende Kroescontrol events. Zorg dat je alle relevante informatie uit de bronbestanden in /old/ verwerkt.
```

### Voorbeeld 4: Samenvoegen van informatie uit meerdere bronnen

```
Lees CLAUDE_PROMPT_DOCUMENT.md en update het document docs/public/algemeen/expertise.md.

Combineer informatie uit verschillende secties in de /old/ directory die over Kubernetes expertise gaan om een overkoepelend document te maken dat onze technische capaciteiten toont.
```

## Tips voor effectief gebruik

1. **Wees specifiek in je instructies**:
   - Geef duidelijk aan welke aspecten van het document prioriteit moeten krijgen
   - Specificeer welk type informatie uit de bronbestanden belangrijk is
   - Voor complexe documentatie: Vraag eerst om de structuur voor te stellen voordat je de volledige inhoud laat genereren

2. **Controleer resultaten**:
   - Bekijk het resultaat zorgvuldig op correctheid
   - Verifieer dat alle relevante informatie uit de bronnen is opgenomen
   - Controleer of de stijl consistent is met andere documenten

3. **Geef context**:
   - Vermeld of er recente wijzigingen zijn in processen of regels
   - Leg uit waarom de update nodig is
   - Verwijs naar vergelijkbare documenten als voorbeelden van gewenste stijl en structuur

4. **Update het .meta bestand indien nodig**:
   - Als je weet dat bepaalde informatie specifiek nodig is, voeg dit toe aan de prompt in het .meta bestand
   - Dit helpt om de context te bewaren voor toekomstige updates
   - De .meta bestanden bevatten nu alleen instructies, niet langer bronverwijzingen