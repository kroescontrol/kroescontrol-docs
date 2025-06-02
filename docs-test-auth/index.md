---
title: Test Authenticatie
sidebar_position: 1
description: Test pagina voor OAuth authenticatie flow
tags:
  - test
  - oauth
  - authenticatie
keywords:
  - test
  - oauth
  - github
  - authenticatie
last_update:
  date: 2025-05-24T00:00:00.000Z
  author: Test
image: /img/logo.svg
docStatus: live
---

# Test Authenticatie

Deze pagina is een test voor de OAuth authenticatie implementatie.

## Status

Als je deze pagina kunt zien, dan is de authenticatie:
- [OK] **Succesvol** - je bent ingelogd via GitHub OAuth
- ❌ **Mislukt** - je hebt deze pagina zonder authenticatie bereikt

## Test Informatie

- **Directory**: `/docs-test-auth/`
- **Route**: `/test-auth/`
- **Verwachte beveiliging**: GitHub OAuth vereist
- **Team toegang**: Alle kroescontrol leden

## Debug Info

Deze pagina zou alleen toegankelijk moeten zijn na:
1. GitHub OAuth login
2. Verificatie van kroescontrol organization lidmaatschap
3. Team authorization check

Tijd: {new Date().toISOString()}
