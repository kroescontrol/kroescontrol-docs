---
title: Public Documentatie Status
description: Overzicht van de status van alle public documentatiepagina's.
sidebar_position: 999
displayed_sidebar: null
slug: /public/status
docStatus: live
---

import styles from './status.module.css';
import BuildStatus from '@site/src/components/BuildStatus';

# Public Documentatie Status

<BuildStatus section="Public Documentation" />

Dit bestand bevat een overzicht van alle documentatiepagina's in de Public sectie, met hun huidige status en docStatus waarden.

## Statussen
- [OK] **Compleet**: De pagina is volledig bijgewerkt en voldoet aan alle richtlijnen
- [WIP] **In progress**: De pagina is in bewerking
- ❌ **Niet begonnen**: De pagina moet nog worden bijgewerkt
- 🚫 **Template**: De pagina bevat alleen een template met placeholder tekst

## docStatus Waarden
- **live**: Pagina is actief en up-to-date
- **completed**: Pagina is afgerond maar nog niet live
- **templated**: Pagina bevat template content
- **generated**: Pagina is automatisch gegenereerd
- **geen docStatus**: Geen docStatus metadata gevonden

## Recent bijgewerkte pagina's

<div className={styles.tableContainer}>
<table className={styles.statusTable}>
  <thead>
    <tr>
      <th>Pagina</th>
      <th>Status</th>
      <th>docStatus</th>
      <th>Datum</th>
      <th>Opmerkingen</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="/public/freelancecontrol/">freelancecontrol/</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td>2025-05-21</td>
      <td className={styles.wrap}>Volledig bijgewerkt met overzicht van Freelancecontrol model</td>
    </tr>
    <tr>
      <td><a href="/public/freelancecontrol/introductie">freelancecontrol/introductie</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td>2025-05-21</td>
      <td className={styles.wrap}>Volledig bijgewerkt met introductie tot Freelancecontrol</td>
    </tr>
    <tr>
      <td><a href="/public/freelancecontrol/verschillen">freelancecontrol/verschillen</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td>2025-05-21</td>
      <td className={styles.wrap}>Volledig bijgewerkt met vergelijking tussen modellen</td>
    </tr>
    <tr>
      <td><a href="/public/freelancecontrol/doelgroep">freelancecontrol/doelgroep</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td>2025-05-21</td>
      <td className={styles.wrap}>Volledig bijgewerkt met doelgroepbeschrijving</td>
    </tr>
    <tr>
      <td><a href="/public/werken-bij/cultuur">werken-bij/cultuur</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td>2025-05-20</td>
      <td className={styles.wrap}>Volledig bijgewerkt met informatie over de cultuur en kernwaarden</td>
    </tr>
    <tr>
      <td><a href="/public/werken-bij/voordelen">werken-bij/voordelen</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td>2025-05-20</td>
      <td className={styles.wrap}>Volledig bijgewerkt met uitgebreid voordelenpakket</td>
    </tr>
    <tr>
      <td><a href="/public/werken-bij/vacatures">werken-bij/vacatures</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td>2025-05-20</td>
      <td className={styles.wrap}>Volledig bijgewerkt met actuele vacatures en sollicitatieproces</td>
    </tr>
  </tbody>
</table>
</div>

## Public Documentatie Overzicht

<div className={styles.tableContainer}>
<table className={styles.statusTable}>
  <thead>
    <tr>
      <th>Pagina</th>
      <th>Status</th>
      <th>docStatus</th>
      <th>Opmerkingen</th>
    </tr>
  </thead>
  <tbody>
    {/* PUBLIC ALGEMEEN */}
    <tr className={styles.sectionHeader}>
      <td colSpan={4}><strong>Public - Algemeen</strong></td>
    </tr>
    <tr>
      <td><a href="/public/algemeen/contact">algemeen/contact</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt</td>
    </tr>
    <tr>
      <td><a href="/public/algemeen/">algemeen/</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Oprichtingsdatum, adresgegevens, links gecorrigeerd, tags verbeterd</td>
    </tr>
    <tr>
      <td><a href="/public/algemeen/klanten">algemeen/klanten</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt</td>
    </tr>
    <tr>
      <td><a href="/public/algemeen/over-kroescontrol">algemeen/over-kroescontrol</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt</td>
    </tr>

    {/* PUBLIC FREELANCECONTROL */}
    <tr className={styles.sectionHeader}>
      <td colSpan={4}><strong>Public - Freelancecontrol</strong></td>
    </tr>
    <tr>
      <td><a href="/public/freelancecontrol/doelgroep">freelancecontrol/doelgroep</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met doelgroepbeschrijving</td>
    </tr>
    <tr>
      <td><a href="/public/freelancecontrol/">freelancecontrol/</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met overzicht van Freelancecontrol model</td>
    </tr>
    <tr>
      <td><a href="/public/freelancecontrol/introductie">freelancecontrol/introductie</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met introductie tot Freelancecontrol</td>
    </tr>
    <tr>
      <td><a href="/public/freelancecontrol/verschillen">freelancecontrol/verschillen</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met vergelijking tussen modellen</td>
    </tr>

    {/* PUBLIC KENNISMAKING */}
    <tr className={styles.sectionHeader}>
      <td colSpan={4}><strong>Public - Kennismaking</strong></td>
    </tr>
    <tr>
      <td><a href="/public/kennismaking/budgetten">kennismaking/budgetten</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met transparante budgetstructuur uitleg</td>
    </tr>
    <tr>
      <td><a href="/public/kennismaking/engineer-hub">kennismaking/engineer-hub</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met overzicht van Engineer Hub functionaliteit</td>
    </tr>
    <tr>
      <td><a href="/public/kennismaking/">kennismaking/</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met overzicht van Kroescontrol aanpak</td>
    </tr>
    <tr>
      <td><a href="/public/kennismaking/projecten">kennismaking/projecten</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met concrete projectvoorbeelden</td>
    </tr>
    <tr>
      <td><a href="/public/kennismaking/voorwaarden">kennismaking/voorwaarden</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met arbeidsvoorwaarden overzicht</td>
    </tr>

    {/* PUBLIC WERKEN-BIJ */}
    <tr className={styles.sectionHeader}>
      <td colSpan={4}><strong>Public - Werken Bij</strong></td>
    </tr>
    <tr>
      <td><a href="/public/werken-bij/cultuur">werken-bij/cultuur</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met informatie over de cultuur en kernwaarden</td>
    </tr>
    <tr>
      <td><a href="/public/werken-bij/">werken-bij/</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt</td>
    </tr>
    <tr>
      <td><a href="/public/werken-bij/vacatures">werken-bij/vacatures</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met actuele vacatures en sollicitatieproces</td>
    </tr>
    <tr>
      <td><a href="/public/werken-bij/voordelen">werken-bij/voordelen</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt met uitgebreid voordelenpakket</td>
    </tr>

    {/* PUBLIC BRANDING */}
    <tr className={styles.sectionHeader}>
      <td colSpan={4}><strong>Public - Branding</strong></td>
    </tr>
    <tr>
      <td><a href="/public/branding/">branding/</a></td>
      <td className={styles.center}>🚫</td>
      <td className={styles.center}>geen docStatus</td>
      <td className={styles.wrap}>Template</td>
    </tr>
    <tr>
      <td><a href="/public/branding/beeldmerk">branding/beeldmerk</a></td>
      <td className={styles.center}>🚫</td>
      <td className={styles.center}>geen docStatus</td>
      <td className={styles.wrap}>Template</td>
    </tr>
    <tr>
      <td><a href="/public/branding/downloads">branding/downloads</a></td>
      <td className={styles.center}>🚫</td>
      <td className={styles.center}>geen docStatus</td>
      <td className={styles.wrap}>Template</td>
    </tr>
    <tr>
      <td><a href="/public/branding/kleuren">branding/kleuren</a></td>
      <td className={styles.center}>🚫</td>
      <td className={styles.center}>geen docStatus</td>
      <td className={styles.wrap}>Template</td>
    </tr>
    <tr>
      <td><a href="/public/branding/logo">branding/logo</a></td>
      <td className={styles.center}>🚫</td>
      <td className={styles.center}>geen docStatus</td>
      <td className={styles.wrap}>Template</td>
    </tr>

    {/* PUBLIC TOOLS */}
    <tr className={styles.sectionHeader}>
      <td colSpan={4}><strong>Public - Tools</strong></td>
    </tr>
    <tr>
      <td><a href="/public/tools/">tools/</a></td>
      <td className={styles.center}>🚫</td>
      <td className={styles.center}>geen docStatus</td>
      <td className={styles.wrap}>Template</td>
    </tr>
    <tr>
      <td><a href="/public/tools/documentatie/">tools/documentatie/</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Volledig bijgewerkt</td>
    </tr>
    <tr>
      <td><a href="/public/tools/documentatie/docstatus-demo">tools/documentatie/docstatus-demo</a></td>
      <td className={styles.center}>[OK]</td>
      <td className={styles.center}>live</td>
      <td className={styles.wrap}>Demo van docStatus systeem</td>
    </tr>
  </tbody>
</table>
</div>

## Samenvatting Status

- **Total pagina's**: 25
- **[OK] Compleet**: 19 (76%)
- **🚫 Template**: 6 (24%)
- **[WIP] In progress**: 0 (0%)
- **❌ Niet begonnen**: 0 (0%)

## docStatus Verdeling

- **live**: 19 (76%)
- **completed**: 0 (0%)
- **templated**: 0 (0%)
- **geen docStatus**: 6 (24%)
