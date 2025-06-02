# Sensitive Security Tooling

Deze directory bevat gevoelige security tooling en configuratie voor git history cleanup en content scanning.

## 🔒 Beveiliging

- **Versleuteling**: Alle bestanden in deze directory zijn versleuteld met git-crypt operations key
- **Toegang**: Alleen operations team heeft toegang
- **Inhoud**: Bevat gevoelige klantnamen, configuraties en scan resultaten

## 📁 Bestanden

### Core Tools
- `scan-sensitive-content.sh` - Script voor het scannen van gevoelige content
- `scan-patterns-production.txt` - Productie scan patterns (klantnamen, gevoelige termen)
- `scan-exclusions-production.txt` - Exclusion patterns voor scan
- `git-cleanup-targets.txt` - Targets voor git history cleanup

### Reports Directory
- `reports/` - Directory voor scan resultaten en rapporten
  - `sensitive-content-report.txt` - Automatisch gegenereerd scan rapport
  - `cleanup-recommendations.txt` - Aanbevelingen voor cleanup

## 🚀 Gebruik

### Content Scan
```bash
# Basis scan
./sensitive/scan-sensitive-content.sh

# Alleen rapportage
./sensitive/scan-sensitive-content.sh --report-only

# Met fix suggesties
./sensitive/scan-sensitive-content.sh --fix
```

### Git History Cleanup
1. Bekijk `git-cleanup-targets.txt` voor targets
2. Test eerst met `--dry-run` waar mogelijk
3. Voer cleanup uit met `git filter-repo`
4. Force push en team notificatie

## ⚠️ Belangrijk

- **Backup eerst**: Maak altijd backup voor git history wijzigingen
- **Team communicatie**: Waarschuw team bij force pushes
- **Test omgeving**: Test cleanup eerst in aparte clone
- **Configuratie updates**: Update patterns regelmatig

## 🔧 Configuratie

Pattern bestanden kunnen worden aangepast voor:
- Nieuwe klantnamen
- Additionele gevoelige termen  
- Gewijzigde exclusions
- Project-specifieke cleanup targets