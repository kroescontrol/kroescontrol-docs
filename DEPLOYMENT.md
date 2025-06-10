# Deployment Instructies

## Environment Variables voor Vercel

Voor de productie deployment op Vercel, zet de volgende environment variable:

### Production Environment
```
HIDE_FREELANCECONTROL=true
```

### Hoe in te stellen in Vercel:
1. Ga naar je Vercel project dashboard
2. Klik op "Settings" tab
3. Ga naar "Environment Variables" 
4. Voeg toe:
   - **Key:** `HIDE_FREELANCECONTROL`
   - **Value:** `true`
   - **Environment:** Production (en eventueel Preview)

### Lokaal testen:
```bash
# Test productie gedrag lokaal
HIDE_FREELANCECONTROL=true npm run dev

# Of gebruik .env.production
npm run build && npm start
```

## Verificatie

Na deployment kun je verifiëren dat FreelanceControl verborgen is:
1. Check dat `/public/freelancecontrol` redirect naar homepage
2. Check dat FreelanceControl niet in de sidebar staat

## Note
In echte productie (NODE_ENV=production) wordt FreelanceControl ook automatisch verborgen, maar de HIDE_FREELANCECONTROL variable geeft extra zekerheid en werkt ook in preview environments.