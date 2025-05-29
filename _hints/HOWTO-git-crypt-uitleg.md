---
title: Git-Crypt Technische Uitleg
sidebar_position: 4
description: >-
  Gedetailleerde technische uitleg van git-crypt implementatie voor Kroescontrol
  documentatie
tags:
  - git-crypt
  - security
  - encryption
  - technical
keywords:
  - git-crypt
  - gpg
  - encryption
  - security
  - repository
last_update:
  date: 2025-05-28T00:00:00.000Z
  author: Serge Kroes
image: /img/logo.svg
docStatus: live
---

# Git-Crypt Uitleg voor Kroescontrol Documentatie Repository

## Overzicht Git-Crypt Implementatie

Dit document beschrijft de complete git-crypt implementatie voor de kroescontrol-docs repository, inclusief technische details, configuratie, en praktische procedures.

## 1. Wat is Git-Crypt?

Git-crypt is een tool die transparante encryptie biedt voor bestanden in Git repositories. Het versleutelt specifieke bestanden automatisch bij commits en ontsleutelt ze automatisch bij checkout, zonder dat gebruikers dit handmatig hoeven te doen.

### Kernprincipes:
- **Transparant:** Werkt naadloos met normale Git workflows
- **Selectief:** Alleen gespecificeerde bestanden worden versleuteld
- **Automatisch:** Encryptie/decryptie gebeurt automatisch bij Git operaties
- **Per-repository:** Elke repository heeft eigen encryptie sleutels
- **GPG-gebaseerd:** Gebruikt GPG voor key management en toegangscontrole

## 2. Technische Architectuur

### Repository-Specifieke Encryptie
Elke git-crypt enabled repository heeft:
```
.git-crypt/
├── .gitattributes          # Git-crypt configuratie
└── keys/
    └── default/
        └── 0/
            └── {GPG-KEY-ID}.gpg  # Repository master key, versleuteld met GPG public key
```

### Dual-Key Systeem:
1. **Repository Master Key** - Unieke AES-256 sleutel per repository
2. **GPG Keys** - Persoonlijke sleutels voor toegangscontrole

### Workflow:
1. Repository master key wordt gegenereerd bij `git-crypt init`
2. Master key wordt versleuteld met elke toegestane GPG public key
3. Bij `git-crypt unlock` wordt master key ontsleuteld met je GPG private key
4. Bestanden worden automatisch versleuteld/ontsleuteld met master key

## 3. Kroescontrol Repository Configuratie

### Multi-Key Git-Crypt Setup

De repository gebruikt een **multi-key configuratie** voor granulaire toegangscontrole:

#### Toegangsniveaus:
- **Default Key:** Internal documentatie (alle medewerkers)
- **Operation Key:** Operation + Finance documentatie (selectieve toegang)

#### .gitattributes Configuratie
```
# Git-crypt configuratie voor versleutelde bestanden
# Default key: internal documenten (alle medewerkers)
/docs/internal/**/*.md filter=git-crypt diff=git-crypt
/docs/internal/**/*.mdx filter=git-crypt diff=git-crypt

# Operation key: operation en finance documenten (selectieve toegang)
/docs/operation/**/*.md filter=git-crypt-operation diff=git-crypt-operation
/docs/operation/**/*.mdx filter=git-crypt-operation diff=git-crypt-operation
/docs/finance/**/*.md filter=git-crypt-operation diff=git-crypt-operation
/docs/finance/**/*.mdx filter=git-crypt-operation diff=git-crypt-operation

# Versleutel _category_.json bestanden in gevoelige mappen
# Default key: internal
/docs/internal/**/_category_.json filter=git-crypt diff=git-crypt

# Operation key: operation en finance
/docs/operation/**/_category_.json filter=git-crypt-operation diff=git-crypt-operation
/docs/finance/**/_category_.json filter=git-crypt-operation diff=git-crypt-operation

# Versleutel .meta directories in gevoelige categorieën
# Default key: internal
/docs/internal/**/.meta/** filter=git-crypt diff=git-crypt

# Operation key: operation en finance
/docs/operation/**/.meta/** filter=git-crypt-operation diff=git-crypt-operation
/docs/finance/**/.meta/** filter=git-crypt-operation diff=git-crypt-operation

# Houd publieke markdown onversleuteld
/docs/public/**/*.md !filter !diff
/docs/public/**/*.mdx !filter !diff

# Versleutel eventuele gevoelige .env bestanden
.env filter=git-crypt diff=git-crypt
.env.example !filter !diff

# Nooit versleutelen
.gitattributes !filter !diff
.gitignore !filter !diff
README.md !filter !diff
CLAUDE.md !filter !diff
```

#### Multi-Key Workflow
```bash
# Unlock default key (internal docs)
git-crypt unlock

# Unlock operation key (operation + finance docs)
git-crypt unlock -k operation

# Status check per key
git-crypt status           # Shows all encrypted files
git-crypt status -k operation   # Shows operation key status
```

### Encryptie Strategie
**Versleuteld:**
- `/docs/internal/` - Interne bedrijfsdocumentatie
- `/docs/operation/` - Operationele procedures
- `/docs/finance/` - Financiële informatie
- Alle bijbehorende `.meta/` directories
- `.env` bestanden met API keys

**Publiek (niet versleuteld):**
- `/docs/public/` - Openbare documentatie
- Configuratiebestanden
- README, CLAUDE.md
- Statische assets

## 4. GPG Key Management

### Huidige Setup
**Repository Master Key ID:** `17ED9ED910A9EEA7E243298A1EFB9A9199D39BF4`
- Type: RSA 4096-bit
- Owner: Serge Kroes `<serge@kroescontrol.nl>`
- Created: 2025-05-21

### Key Bestanden Locaties
```
# GPG Private Key (voor 1Password)
~/Desktop/kroescontrol-gpg-private-key.asc

# Repository Master Key (automatisch in git)
.git-crypt/keys/default/0/17ED9ED910A9EEA7E243298A1EFB9A9199D39BF4.gpg
```

### Backup Strategie
**Voor 1Password opslaan:**
1. **GPG Private Key** (`kroescontrol-gpg-private-key.asc`)
2. **GPG Passphrase**

**Niet nodig op te slaan:**
- Repository master keys (zitten in git, versleuteld met GPG public keys)
- Git-crypt configuratie (zit in repository)

## 5. Praktische Workflows

### Nieuwe Gebruiker Toevoegen (Multi-Key)

#### Voor alle medewerkers (Internal toegang):
```bash
# 1. Gebruiker genereert GPG key en deelt public key
gpg --gen-key

# 2. Gebruiker exporteert public key
gpg --export --armor {EMAIL} > public-key.asc

# 3. Administrator importeert en voegt toe aan default key
gpg --import public-key.asc
git-crypt add-gpg-user {GPG-KEY-ID}
git add .git-crypt/
git commit -m "Add GPG key for {USERNAME} - internal access"
git push

# 4. Nieuwe gebruiker clone en unlock
git clone {REPO-URL}
cd {REPO}
git-crypt unlock    # Can access /docs/internal/
```

#### Voor management/finance (Operation toegang):
```bash
# 1-2. Same GPG key generation as above

# 3. Administrator voegt toe aan beide keys
gpg --import public-key.asc
git-crypt add-gpg-user {GPG-KEY-ID}                    # Default key
git-crypt add-gpg-user -k operation {GPG-KEY-ID}      # Operation key
git add .git-crypt/
git commit -m "Add GPG key for {USERNAME} - full access"
git push

# 4. Nieuwe gebruiker clone en unlock both keys
git clone {REPO-URL}
cd {REPO}
git-crypt unlock                # Can access /docs/internal/
git-crypt unlock -k operation   # Can access /docs/operation/ and /docs/finance/
```

#### Selectieve toegang beheren:
```bash
# Alleen internal toegang:
git-crypt add-gpg-user employee@kroescontrol.nl

# Internal + operation/finance toegang:
git-crypt add-gpg-user manager@kroescontrol.nl
git-crypt add-gpg-user -k operation manager@kroescontrol.nl

# Bulk toegang voor alle keys:
for key in default operation; do
  git-crypt add-gpg-user ${key:+-k $key} admin@kroescontrol.nl
done
```

### Dagelijks Gebruik
```bash
# Normale git workflow - encryptie is transparant
git add .
git commit -m "Update documentation"
git push

# Repository status controleren
git-crypt status

# Repository vergrendelen (voor testen)
git-crypt lock

# Repository ontgrendelen
git-crypt unlock
```

### Nieuwe Machine Setup
```bash
# 1. Importeer GPG private key
gpg --import kroescontrol-gpg-private-key.asc

# 2. Vertrouw de key
gpg --edit-key {GPG-KEY-ID}
> trust
> 5 (ultimate trust)
> save

# 3. Clone en unlock repository
git clone {REPO-URL}
cd kroescontrol-docs
git-crypt unlock
```

## 6. Security Overwegingen

### Sterke Punten
- **Automatische encryptie:** Geen kans op vergeten van gevoelige data
- **Granulaire controle:** Per-bestand encryptie configuratie
- **Standard Git workflow:** Geen workflow wijzigingen nodig
- **GPG-based access:** Beproefde cryptografische toegangscontrole
- **Repository-specific:** Lekken van één key compromitteert niet andere repos

### Risico's en Mitigaties
**Risico:** Verlies van GPG private key
**Mitigatie:** Backup in 1Password + backup gebruiker met admin toegang

**Risico:** Vergeten `git-crypt unlock` na clone
**Mitigatie:** Duidelijke documentatie + onboarding procedures

**Risico:** Accidenteel committen van gevoelige data in publieke directories
**Mitigatie:** Code review procedures + automated scanning

**Risico:** GPG key compromise
**Mitigatie:** Key rotation procedures + audit trails

## 7. Troubleshooting Common Issues

### "GPG error: Failed to decrypt"
**Oorzaken:**
- GPG private key niet beschikbaar
- GPG agent niet running
- TTY configuratie problemen
- Key trust issues

**Oplossingen:**
```bash
# Fix GPG TTY
export GPG_TTY=$(tty)

# Check GPG key availability
gpg --list-secret-keys

# Test GPG decrypt
echo "test" | gpg --encrypt -r {EMAIL} | gpg --decrypt

# Restart GPG agent
gpgconf --kill gpg-agent
```

### "Warning: diff=git-crypt attribute not set"
**Oorzaak:** `.gitattributes` mist `diff=git-crypt` attribute
**Oplossing:** Update `.gitattributes` met complete filter+diff configuratie

### Bestanden niet versleuteld
**Diagnose:**
```bash
git-crypt status | grep "not encrypted"
```
**Oplossingen:**
- Check `.gitattributes` patterns
- Force re-encryption: `git-crypt lock && git-crypt unlock`
- Verify file paths match patterns exactly

## 8. Advanced Scenarios

### Key Rotation
```bash
# 1. Generate new GPG key
gpg --gen-key

# 2. Add new key to repository
git-crypt add-gpg-user {NEW-GPG-KEY-ID}

# 3. Remove old key (carefully!)
# Note: This requires re-encrypting repository master key
```

### Multiple Keyring Support
```bash
# Create separate keyring for different access levels
git-crypt init -k keyring-name

# Add users to specific keyring
git-crypt add-gpg-user -k keyring-name {GPG-KEY-ID}
```

### Repository Migration
```bash
# Export all encrypted files in plain text
git-crypt unlock
tar -czf backup-plaintext.tar.gz docs/

# Initialize git-crypt in new repository
git-crypt init
git-crypt add-gpg-user {GPG-KEY-ID}

# Copy files and commit
# Files will be automatically encrypted based on new .gitattributes
```

## 9. Monitoring and Auditing

### Regular Health Checks
```bash
# Verify all expected files are encrypted
git-crypt status | grep -E "(docs/internal|docs/operation|docs/finance)"

# Check GPG key expiration
gpg --list-keys --with-colons | grep -E "^(pub|sub).*:[0-9]*:[0-9]*:"

# Verify repository unlock works
git-crypt lock && git-crypt unlock
```

### Access Auditing (Multi-Key)
```bash
# List all users with default key access (internal)
ls -la .git-crypt/keys/default/0/

# List all users with operation key access (operation + finance)
ls -la .git-crypt/keys/operation/0/

# Check commit history for key additions
git log --oneline --grep="Add GPG key"

# Correlate key files to actual users
for keyfile in .git-crypt/keys/*/0/*.gpg; do
  keyid=$(basename "$keyfile" .gpg)
  echo "=== $keyfile ==="
  gpg --list-keys "$keyid" | grep uid || echo "Key not found in keyring"
done

# Check which keys a specific user has access to
user_keyid="17ED9ED910A9EEA7E243298A1EFB9A9199D39BF4"  # Replace with actual key ID
echo "Keys for user $user_keyid:"
find .git-crypt/keys -name "$user_keyid.gpg" -exec dirname {} \; | sed 's|.git-crypt/keys/||' | sed 's|/0||'
```

## 10. Integration with Docusaurus

### Development Workflow
```bash
# 1. Unlock repository
git-crypt unlock

# 2. Normal Docusaurus development
npm start

# 3. Build (automatically includes encrypted content)
npm run build

# 4. Deploy (with proper environment separation)
npm run deploy
```

### Public-Only Deployment
Voor publieke site deployment wordt een speciaal script gebruikt:
```bash
./deploy-public-only.sh
```

Dit script:
- Genereert sidebar in PUBLIC_ONLY modus
- Bouwt alleen publieke content
- Deployt naar publieke GitHub repository
- Voorkomt lekken van versleutelde content

## 11. Best Practices

### Voor Administrators
1. **Backup GPG keys regelmatig** in secure storage (1Password)
2. **Documenteer alle key additions** met duidelijke commit messages
3. **Test unlock procedure** na elke nieuwe user addition
4. **Monitor repository size** - encrypted files kunnen groter worden
5. **Regular key health checks** - expiration dates, trust levels

### Voor Gebruikers
1. **Backup je GPG private key** onmiddellijk na aanmaken
2. **Test unlock** op nieuwe machine voor belangrijke werk
3. **Gebruik sterke passphrase** voor GPG key
4. **Check git-crypt status** als je onverwachte behaviour ziet
5. **Rapporteer unlock problemen** onmiddellijk aan administrators

### Voor Content Creators
1. **Begrijp de directory structuur** - weet wat versleuteld wordt
2. **Review je commits** - check wat daadwerkelijk encrypted wordt
3. **Test met git-crypt status** als je twijfelt over encryption
4. **Gebruik proper frontmatter** in alle markdown bestanden
5. **Volg naming conventions** voor consistency

## 12. Toekomstige Ontwikkelingen

### Mogelijke Verbeteringen
1. **Automated key rotation** procedures
2. **Webhook-based access auditing**
3. **CI/CD integration** voor encrypted content validation
4. **Multiple environment** support (staging vs production keys)
5. **Automated backup verification** procedures

### Scaling Overwegingen
1. **Performance impact** van grote encrypted files
2. **Repository size growth** door encryption overhead
3. **Key management complexity** bij groeiend team
4. **Backup storage requirements** voor key materials

## 13. Conclusie

De git-crypt implementatie voor kroescontrol-docs biedt:

**Voordelen:**
- Transparante, automatische encryptie
- Granulaire toegangscontrole
- Naadloze integratie met Git workflows
- Sterke cryptografische beveiliging
- Flexibele key management

**Aandachtspunten:**
- GPG key management complexity
- Backup en recovery procedures
- Onboarding van nieuwe gebruikers
- Troubleshooting GPG/encryption issues

**Resultaat:**
Een veilige, schaalbare oplossing voor het beschermen van gevoelige documentatie terwijl publieke content toegankelijk blijft voor de community.

## 14. Git-crypt vs Git Identity en Veiligheidsbeoordeling

### Relatie tot Git Configuration
**Belangrijke observatie:** Git-crypt encryptie is volledig onafhankelijk van git commit identity.

```bash
# Git identity (voor commits)
git config --global user.name "Serge Kroes"
git config --global user.email "serge@kroescontrol.nl"

# Git-crypt toegang (voor encryptie)
# Bepaald door GPG keys, NIET door git config
```

**Scheiding van verantwoordelijkheden:**
- **Git commits:** `user.name` & `user.email` bepalen wie wat committte
- **Git-crypt toegang:** GPG keys bepalen wie mag ontsleutelen
- **Filesystem level:** Encryptie/decryptie gebeurt bij git operations
- **Onafhankelijk:** Committer identity heeft geen invloed op encryptie toegang

### Veiligheidsbeoordeling Git-crypt

#### **Sterke punten:**
- **AES-256 encryptie** - Militaire standaard cryptografie
- **GPG-based access control** - Beproefde, gedistribueerde key management
- **Transparent workflow** - Geen wijzigingen in normale Git workflows nodig
- **Per-file granularity** - Selectieve encryptie van specifieke bestanden
- **Open source** - Peer reviewed code, transparante implementatie
- **Git integration** - Naadloze integratie met bestaande Git tooling
- **Automatic operation** - Encryptie/decryptie gebeurt automatisch
- **Multiple users** - Eenvoudig meerdere gebruikers toegang geven

#### **Beperkingen:**
- **Metadata niet versleuteld** - Bestandsnamen, sizes, timestamps blijven zichtbaar
- **Git history exposure** - Oude versies van bestanden blijven in git history
- **Key management complexity** - GPG setup kan complex zijn voor nieuwe gebruikers
- **No forward secrecy** - Oude commits blijven ontsleutelbaar met huidige keys
- **Repository size** - Encrypted bestanden kunnen iets groter worden
- **Diff limitations** - Git diff werkt niet goed met encrypted content

#### **Risico's:**
- **Single point of failure** - Verlies van alle GPG keys = permanente data verlies
- **Git repository compromise** - Encrypted data is nog steeds in verkeerde handen (wel encrypted)
- **Implementation bugs** - Zeldzaam maar mogelijk in git-crypt zelf
- **Key rotation complexity** - Wijzigen van toegangsrechten kan complex zijn
- **Backup challenges** - GPG key backup is kritisch en complex
- **Platform dependencies** - GPG agent problemen kunnen toegang blokkeren

### Vergelijking met Alternatieven

**Git-crypt:** ⭐⭐⭐⭐ (4/5)
- **Pro:** Transparant, eenvoudig, Git-geïntegreerd
- **Con:** Metadata exposure, key management complexity

**BlackBox:** ⭐⭐⭐ (3/5)
- **Pro:** Vergelijkbare functionaliteit
- **Con:** Complexere setup, minder transparant

**Separate Encrypted Repositories:** ⭐⭐⭐⭐⭐ (5/5)
- **Pro:** Maximale veiligheid, complete scheiding
- **Con:** Veel minder praktisch, workflow overhead

**Vault Solutions (HashiCorp Vault, etc.):** ⭐⭐⭐⭐⭐ (5/5)
- **Pro:** Enterprise grade, centralized management
- **Con:** Overkill voor documentatie, complexe infrastructuur

**Cloud-native Solutions (AWS KMS, etc.):** ⭐⭐⭐⭐ (4/5)
- **Pro:** Managed service, enterprise features
- **Con:** Vendor lock-in, kostbaar voor kleine teams

### Aanbeveling voor Kroescontrol

**Voor documentatie use case:** Git-crypt is een **uitstekende keuze**

**Redenen:**
1. **Balans veiligheid/gebruiksgemak** - Voldoende veilig zonder workflow overhead
2. **Team size** - Perfect voor kleine tot middelgrote teams
3. **Content type** - Ideaal voor documentatie en configuratie
4. **Existing workflow** - Minimale wijzigingen in bestaande Git workflow
5. **Cost effective** - Geen extra infrastructuur of licenties nodig

**Risico mitigatie:**
- **Multiple GPG key holders** - Minimaal 2 administrators met toegang
- **Regular backups** - GPG keys in 1Password + offline backup
- **Documentation** - Heldere procedures voor key management
- **Access auditing** - Regelmatige controle van toegangsrechten

### Security Best Practices Implementatie

**Toegepast in kroescontrol-docs:**
- **Selective encryption** - Alleen gevoelige directories encrypted
- **Public content accessible** - docs/public/ blijft open
- **Proper .gitattributes** - Correcte encryptie patterns
- **GPG key backup** - Keys opgeslagen in 1Password
- **Clear documentation** - Uitgebreide handleidingen beschikbaar
- **Testing procedures** - Unlock/lock testing workflows

**Toekomstige verbeteringen:**
- **Additional administrators** - Meer mensen met GPG toegang
- **Key rotation schedule** - Periodieke vernieuwing van keys
- **Automated testing** - CI/CD checks voor encryptie status
- **Audit logging** - Tracking van toegang en wijzigingen

---

**Dit document dient als referentie voor alle git-crypt gerelateerde procedures en troubleshooting voor de kroescontrol-docs repository.**
