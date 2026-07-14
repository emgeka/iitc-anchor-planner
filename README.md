# IITC Anchor Planner

Anchor Planner ist ein IITC-Userscript zur Auswertung geplanter Links aus Draw
Tools und Auto Draw. Es ordnet Linkendpunkte Portalen zu, berücksichtigt
Bookmarks und aktuell geladene Intel-Links und erzeugt daraus eine
abarbeitbare Portal-, Blocker-, Routen- und Schlüsselübersicht.

## Aktueller Stand

- Aktuelle Version: **0.1.41**
- Arbeitsfassung: `src/iitc-anchor-planner.user.js`
- Freigegebene Fassungen: `releases/`
- Userscript-ID: `iitc-plugin-anchor-planner`
- IITC-Plugin-ID: `anchor-planner`
- GitHub-Release: <https://github.com/emgeka/iitc-anchor-planner/releases/tag/v0.1.41>

## Funktionen

- Draw-Tools-Linien einschließlich Auto-Draw-Plänen erfassen und doppelte
  Segmente zusammenführen.
- Planendpunkte anhand geladener IITC-Portale und Portal-Bookmarks auflösen;
  unsichere Endpunkte mit Koordinaten und Kandidaten diagnostizieren.
- Vorhandene Planlinks erkennen und den verbleibenden Schlüsselbedarf je
  Portal berechnen.
- Kreuzende, aktuell in IITC geladene Links als Blocker erkennen, mit
  Portalnamen oder Koordinaten auflisten und auf der Karte hervorheben.
- Portale nach offen, blockiert, fehlenden Keys und erledigt filtern sowie
  Keys, Reihenfolge und Erledigt-Status verwalten.
- Das nächste offene Portal dynamisch anhand des offiziellen IITC-
  User-Location-Plugins bestimmen oder auf die manuelle Reihenfolge
  zurückfallen.
- Die Portalliste optional einmalig als Luftlinien-Näherungsroute ab dem
  aktuellen IITC-Standort sortieren.
- Waze-, Intel-, Google-Maps-, Apple-Maps- und Geo-Navigation sowie Teilen
  anbieten.
- Plan und konkrete Blocker-Details als lesbaren Text oder JSON kopieren und
  herunterladen.

## Voraussetzungen und Datenabdeckung

- IITC mit aktiviertem Draw-Tools-Plugin ist für den Scan erforderlich.
- Portal-Bookmarks verbessern die Auflösung, sind aber optional.
- Standortabhängige Zielwahl verwendet ausschließlich das offizielle
  IITC-User-Location-Plugin. Standortdaten werden weder dauerhaft gespeichert
  noch exportiert.
- Vorhandene Links und Blocker können nur anhand der aktuell in IITC geladenen
  `window.links` erkannt werden. Ein nicht angezeigter Blocker ist daher keine
  vollständige Entwarnung.

## Typischer Ablauf

1. Linkplan mit Draw Tools oder Auto Draw erzeugen.
2. Den relevanten Kartenbereich laden und **Draw Tools scannen** auswählen.
3. Offene Endpunkte prüfen; bei Bedarf zoomen, Portale laden und erneut
   scannen beziehungsweise **Namen laden** verwenden.
4. Blocker-Details kontrollieren und einzelne Kreuzungen mit **zeigen** auf der
   Karte lokalisieren.
5. Keys und erledigte Portale pflegen, die Route manuell oder mit
   **Ab Standort sortieren** ordnen und zum jeweils nächsten Portal navigieren.
6. Plan bei Bedarf als Text oder JSON exportieren.

## Installation

Die freigegebene `.user.js`-Datei wird über einen Userscript-Manager oder die
jeweilige IITC-Plugin-Installation eingebunden:

<https://raw.githubusercontent.com/emgeka/iitc-anchor-planner/main/releases/iitc-anchor-planner.user.js>

Für Umgebungen, in denen der Download als `.user.js` problematisch ist, steht
im Release eine inhaltlich identische `.txt`-Fassung bereit.

Die stabile Installationsadresse zeigt immer auf die zuletzt freigegebene
Version und wird auch vom IITC Community Plugins-Katalog verwendet.

## Entwicklung

Die Regeln in `AGENTS.md` gelten für das gesamte Projekt. Funktionale
Änderungen erfolgen zunächst nur in `src/`. Identische Releasefassungen als
`.user.js` und `.txt` werden erst nach erfolgreichem Praxistest auf Desktop-IITC
und IITC Mobile erzeugt.
