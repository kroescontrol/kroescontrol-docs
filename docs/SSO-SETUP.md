# SSO Setup voor docs.kroescontrol.nl

## Overzicht
Docs.kroescontrol.nl gebruikt Single Sign-On (SSO) via hub.kroescontrol.nl. Alle authenticatie wordt centraal afgehandeld door de hub.

## Hoe het werkt

1. **Geen eigen OAuth providers**
   - Docs heeft geen eigen GitHub/Google OAuth configuratie
   - Alle authenticatie gaat via hub.kroescontrol.nl

2. **Session sharing**
   - Hub zet een session cookie op domein `.kroescontrol.nl`
   - Docs leest deze cookie voor authenticatie
   - Cookies worden gedeeld tussen alle subdomains

3. **Login flow**
   - Gebruiker klikt op "Inloggen" in docs
   - Redirect naar `https://hub.kroescontrol.nl/login?redirect=https://docs.kroescontrol.nl`
   - Na succesvolle login op hub, redirect terug naar docs
   - Docs heeft nu toegang tot de sessie

## Productie configuratie

### Environment variables
```env
# Dit moet EXACT hetzelfde zijn als in hub.kroescontrol.nl
NEXTAUTH_SECRET=<zelfde-secret-als-hub>

# URL van de docs site
NEXTAUTH_URL=https://docs.kroescontrol.nl

# Geen OAuth credentials nodig!
```

### Vereisten voor hub.kroescontrol.nl
1. Hub moet redirects naar docs.kroescontrol.nl toestaan
2. Session cookies moeten op `.kroescontrol.nl` domein gezet worden
3. NEXTAUTH_SECRET moet hetzelfde zijn

## Development
In development mode werkt lokale login met username/password "dev/dev".

## Troubleshooting

### "Not authenticated" in productie
1. Check of NEXTAUTH_SECRET hetzelfde is als hub
2. Verificeer dat cookies op `.kroescontrol.nl` domein staan
3. Check browser DevTools voor session cookie

### Redirect loops
1. Zorg dat hub redirects naar docs toestaat
2. Check of NEXTAUTH_URL correct is ingesteld