---
docStatus: production
---
# HOWTO: Git-Crypt Key Separatie voor Operation en Finance

## Huidige Situatie

Momenteel gebruikt het project:
- **default key**: Voor `docs-internal/` (alle medewerkers)
- **operation key**: Voor `docs-operation/` (management) - key bestaat maar wordt nog niet gebruikt
- **finance key**: Ontbreekt - `docs-finance/` gebruikt nog default key

## Doel

Implementeer complete key separatie:
- `docs-internal/` → default key (alle medewerkers)
- `docs-operation/` → operation key (alleen management)
- `docs-finance/` → finance key (alleen finance team)

## Stappen voor Implementatie

### 1. Backup Maken
```bash
# Zorg dat alles gecommit is
git add -A && git commit -m "backup voor git-crypt key separatie"

# Maak backup van huidige .gitattributes
cp .gitattributes .gitattributes.backup
```

### 2. Finance Key Aanmaken
```bash
# Maak nieuwe finance key
git crypt init -k finance

# Voeg jezelf toe aan finance key (vervang met jouw GPG ID)
git crypt add-gpg-user -k finance 17ED9ED910A9EEA7E243298A1EFB9A9199D39BF4
```

### 3. .gitattributes Bijwerken
Huidige `.gitattributes` controleert welke files welke key gebruiken.

**Te controleren patronen:**
```bash
# Kijk wat er nu in staat
cat .gitattributes

# Verwachte structuur:
docs-internal/** filter=git-crypt diff=git-crypt
docs-operation/** filter=git-crypt-operation diff=git-crypt-operation
docs-finance/** filter=git-crypt-finance diff=git-crypt-finance
```

**Als operation en finance nog niet gescheiden zijn, toevoegen:**
```bash
# Voeg toe aan .gitattributes:
docs-operation/** filter=git-crypt-operation diff=git-crypt-operation
docs-finance/** filter=git-crypt-finance diff=git-crypt-finance
```

### 4. Re-encrypt Finance Bestanden
```bash
# Unlock alle keys eerst
git crypt unlock
git crypt unlock -k operation
git crypt unlock -k finance

# Force re-encrypt van finance bestanden
git rm --cached docs-finance/**
git add docs-finance/**

# Commit de nieuwe encryption
git commit -m "migreer docs-finance naar aparte finance key"
```

### 5. Team Toegang Configureren

**Voor Finance Team (voeg finance teamleden toe):**
```bash
# Voeg finance team GPG keys toe aan finance key
git crypt add-gpg-user -k finance [FINANCE_TEAM_GPG_ID]
```

**Voor Management (voeg management toe aan operation):**
```bash
# Voeg management GPG keys toe aan operation key
git crypt add-gpg-user -k operation [MANAGEMENT_GPG_ID]
```

### 6. Testen
```bash
# Test status van alle keys
git crypt status
git crypt status -k operation
git crypt status -k finance

# Test lock/unlock cyclus
git crypt lock
git crypt unlock
# Controleer dat je alleen default en intern hebt

# Test operation access (alleen als je operation toegang hebt)
git crypt unlock -k operation
ls docs-operation/  # Moet leesbaar zijn

# Test finance access (alleen als je finance toegang hebt)
git crypt unlock -k finance
ls docs-finance/   # Moet leesbaar zijn
```

### 7. GitHub Actions Secrets Bijwerken
Na het aanmaken van de finance key moet je de symmetric keys exporteren en toevoegen aan GitHub Secrets:

```bash
# Export alle keys voor GitHub Actions
git crypt export-key git-crypt-default.key
git crypt export-key -k operation git-crypt-operation.key
git crypt export-key -k finance git-crypt-finance.key

# Converteer naar base64 voor GitHub Secrets
base64 git-crypt-default.key > git-crypt-default-base64.txt
base64 git-crypt-operation.key > git-crypt-operation-base64.txt
base64 git-crypt-finance.key > git-crypt-finance-base64.txt
```

**Voeg toe aan GitHub Repository Secrets:**
- `GIT_CRYPT_KEY` (bestaand - vervang met default key)
- `GIT_CRYPT_OPERATION_KEY` (nieuw - operation key)
- `GIT_CRYPT_FINANCE_KEY` (nieuw - finance key)

**[WARN] Belangrijk:** Verwijder de lokale key bestanden na upload naar GitHub!
```bash
rm git-crypt-*.key git-crypt-*-base64.txt
```

### 8. GitHub Actions Workflow Bijwerken
Update `.github/workflows/deploy.yml` om alle keys te unlocken:

```yaml
- name: Unlock git-crypt (all keys)
  run: |
    # Default key (docs-internal)
    echo "${{ secrets.GIT_CRYPT_KEY }}" | base64 -d > /tmp/git-crypt-default-key
    git-crypt unlock /tmp/git-crypt-default-key

    # Operation key (docs-operation)
    echo "${{ secrets.GIT_CRYPT_OPERATION_KEY }}" | base64 -d > /tmp/git-crypt-operation-key
    git-crypt unlock -k operation /tmp/git-crypt-operation-key

    # Finance key (docs-finance)
    echo "${{ secrets.GIT_CRYPT_FINANCE_KEY }}" | base64 -d > /tmp/git-crypt-finance-key
    git-crypt unlock -k finance /tmp/git-crypt-finance-key

    # Cleanup
    rm /tmp/git-crypt-*-key
```

### 9. Documentatie Bijwerken
Update `docs-public/tools/documentatie/git-crypt-architectuur.md` met:
- Nieuwe key structuur
- Toegangsniveaus per team
- Unlock instructies per key

## Verificatie Checklist

### Lokale Verificatie
- [ ] `git crypt status` toont correcte key usage per directory
- [ ] Finance teamleden kunnen `docs-finance/` unloken met finance key
- [ ] Management kan `docs-operation/` unloken met operation key
- [ ] Alle medewerkers kunnen `docs-internal/` unloken met default key
- [ ] Mensen zonder finance key kunnen `docs-finance/` NIET lezen
- [ ] Mensen zonder operation key kunnen `docs-operation/` NIET lezen
- [ ] `./.tijdelijk/show-git-crypt-access.sh` toont alle keys correct

### GitHub Actions Verificatie
- [ ] GitHub Secrets bevatten alle 3 keys (default, operation, finance)
- [ ] `.github/workflows/deploy.yml` unlock alle keys
- [ ] GitHub Actions build succeeds met alle content
- [ ] Vercel deployment bevat alle directories (public, internal, operation, finance)
- [ ] OAuth toegang werkt correct voor volledige site

## Rollback Plan

Als er problemen zijn:
```bash
# Herstel originele .gitattributes
cp .gitattributes.backup .gitattributes

# Reset naar laatste werkende commit
git reset --hard [LAATSTE_WERKENDE_COMMIT]

# Force unlock met original keys
git crypt unlock
```

## Belangrijk

[WARN] **VOOR PRODUCTIE**: Test deze procedure eerst op een staging branch!
[WARN] **TEAM COORDINATIE**: Laat team weten wanneer je deze migratie uitvoert - tijdelijke toegangsproblemen mogelijk
[WARN] **GPG KEYS**: Zorg dat alle teamleden hun GPG keys beschikbaar hebben voordat je start
