---
title: ❌ Test Document (Templated)
sidebar_position: 999
docStatus: live
---

# ❌ Test Document (Status: templated)

**[WARN] Dit document zou NIET zichtbaar moeten zijn in productie builds!**

Dit is een test document met `docStatus: templated`. Het demonstreert dat:

- [OK] Het document zichtbaar is in **development** builds
- ❌ Het document wordt **uitgefilterd** in productie builds
- [WIP] Het document kan later worden **geüpgrade** naar andere statussen

## Status Testing

Als je dit document kunt zien, betekent dit dat:
1. Je bekijkt een **development build**, of
2. Het filtering systeem werkt **niet correct**

## Upgrade Pad

Dit document kan worden geüpgraded via:
```bash
npm run docstatus:generate set-status docs-public/docstatus-test-templated.md completed
```
