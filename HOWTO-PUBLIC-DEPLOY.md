# HOWTO: Public-Only Deployment naar docs.kroescontrol.nl

Deze handleiding beschrijft hoe je alleen de publieke delen van de kroescontrol-docs naar GitHub Pages deployt, om zo een publieke versie van de documentatie beschikbaar te maken op docs.kroescontrol.nl.

## Vereisten

- Git geïnstalleerd op je lokale machine
- Toegang tot de kroescontrol-docs GitHub repository
- Lokale kopie van de kroescontrol-docs repository

## Stap 1: Voorbereidingen

Zorg dat je repository up-to-date is en dat alle gewenste wijzigingen zijn toegevoegd in de `/docs/public` map.

```bash
# Update je lokale repository
git checkout main
git pull origin main
```

Controleer de content in de `/docs/public` map, aangezien alleen deze content in de publieke deployment wordt meegenomen.

## Stap 2: Public-Only Deployment Uitvoeren

Voer het speciaal gemaakte deployment script uit:

```bash
# Run het deployment script
./deploy-public-direct.sh
```

Het script doet automatisch het volgende:
1. Maakt een tijdelijke map voor deployment
2. Kloont de repository en maakt een schone gh-pages branch
3. Kopieert alleen de `/docs/public` content naar de juiste map
4. Voegt een eenvoudige index.html en styling toe
5. Commit de wijzigingen naar de gh-pages branch

Als het script authenticatieproblemen meldt, ga naar stap 3.

## Stap 3: Handmatig Pushen (indien nodig)

Als het script de bestanden niet automatisch kan pushen vanwege authenticatieproblemen, volg dan deze stappen:

```bash
# Navigeer naar de tijdelijke deployment map
cd temp-public-deploy

# Push naar de gh-pages branch met force
git push -f origin gh-pages

# Ga terug naar de hoofdmap
cd ..
```

Als je SSH-authenticatie gebruikt, zorg dan dat je SSH-sleutel actief is.

## Stap 4: GitHub Pages Configureren

Na de eerste deployment moet je GitHub Pages configureren:

1. Ga naar https://github.com/kroescontrol/kroescontrol-docs/settings/pages
2. Bij "Source", selecteer "Deploy from a branch"
3. Selecteer "gh-pages" branch en "/" (root) map
4. Klik op "Save"

## Stap 5: Custom Domain Configureren

Om docs.kroescontrol.nl als custom domain te gebruiken:

1. Voeg een CNAME record toe in je DNS-instellingen:
   - Host: docs
   - Value: kroescontrol.github.io
   - TTL: 3600 (of automatisch)

2. Op GitHub Pages:
   - Vul bij "Custom domain" het domein docs.kroescontrol.nl in
   - Vink "Enforce HTTPS" aan (nadat het SSL-certificaat is gegenereerd)

Het kan enkele minuten tot uren duren voordat de DNS-wijzigingen zijn doorgevoerd.

## Stap 6: Controleren

Controleer of de site correct is gepubliceerd:

1. Bezoek eerst kroescontrol.github.io/kroescontrol-docs
2. Zodra de DNS-instellingen zijn doorgevoerd, controleer docs.kroescontrol.nl

## Toekomstige Updates

Om wijzigingen aan de publieke site door te voeren:

1. Update de content in `/docs/public`
2. Voer stap 2 opnieuw uit: `./deploy-public-direct.sh`

## Troubleshooting

- **"Page not found" of 404 fout**: Controleer of de gh-pages branch bestaat en de correcte bestanden bevat
- **HTTPS-waarschuwingen**: Het duurt meestal 24 uur voordat het SSL-certificaat volledig is geactiveerd
- **Oude content wordt getoond**: Probeer je browsercache te legen of gebruik incognito-modus

## Belangrijke Notities

- In deze setup is alleen content in de `/docs/public` map publiek toegankelijk
- De broncode en interne documentatie blijven privé en worden niet naar GitHub gepusht
- De site werkt als een statische HTML-site, niet als een volledige Docusaurus-instantie