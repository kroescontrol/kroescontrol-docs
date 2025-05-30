---
title: "🧪 Test Document (Completed Status)"
sidebar_position: 998
docStatus: completed
---

# 🧪 Test Document (Status: completed)

**[TEST] Dit document test de nieuwe 'completed' status functionaliteit.**

Dit document demonstreert dat:

- ✅ Het document **zichtbaar** is in productie builds
- ❌ Het document **niet zichtbaar** is in productie sidebar 
- ✅ Het document **bereikbaar** is via directe URL
- 🔍 Het document **wel zichtbaar** is in development sidebar

## Status Testing

Als je dit document kunt zien via directe URL in productie, maar het staat **niet** in de sidebar, dan werkt de 'completed' status correct.

In development mode zou dit document wel in de sidebar moeten staan.

## Upgrade Pad

Dit document kan worden geüpgraded naar 'live' status via:
```bash
node scripts/generateContent.js set-status docs-public/test-completed-status.md live
```