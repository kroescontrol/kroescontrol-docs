---
docStatus: live
---
# Workflow voor Staging en Documentatie

## Versimpelde Workflow voor staging-sander Branch

Deze workflow beschrijft hoe te werken met de `staging-sander` branch voor documentatie updates en ontwikkeling.

### Dagelijkse Workflow

`staging-sander` is je werkbranch:

```bash
git checkout staging-sander
# doe al je werk, commit regelmatig
git add .
git commit -m "Betekenisvolle message"
git push origin staging-sander
```

### Naar Productie Gaan

Als je klaar bent om naar productie te gaan:

1. Ga naar GitHub
2. Maak een PR van `staging-sander` naar `main`
3. Kies de "Rebase and merge" optie in de GitHub interface
4. Druk op de knop!

### Na de Merge

Na de merge, synchroniseer je lokale `staging-sander`:

```bash
git checkout staging-sander
git pull --rebase origin main
git push -f origin staging-sander
```

## Voordelen van Deze Aanpak

- **Eenvoudig**: Geen complexe handmatige git operaties
- **Gestroomlijnd**: GitHub interface doet het zware werk
- **Efficiënt**: Één PR per x dagen in plaats van constant mergen
- **Overzichtelijk**: Duidelijke historie door rebase and merge

## Belangrijke Punten

- De GitHub "Rebase and merge" knop doet precies wat je wilt zonder handmatige stappen
- Commit regelmatig tijdens je werk
- Push regelmatig naar `origin staging-sander` voor backup
- Gebruik betekenisvolle commit messages
- Synchroniseer altijd na een merge om conflicts te voorkomen
