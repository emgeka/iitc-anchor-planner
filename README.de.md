# IITC Anchor Planner

[English](README.md) | [Deutsch](README.de.md)

Anchor Planner ist ein IITC-Userscript zur Auswertung geplanter Links aus Draw
Tools und Auto Draw. Es ordnet Linkendpunkte Portalen zu, berücksichtigt
Bookmarks und aktuell geladene Intel-Links und erzeugt daraus eine
abarbeitbare Portal-, Blocker-, Routen- und Schlüsselübersicht.

## Aktueller Stand

- Aktuelle Version: **0.1.46**
- Arbeitsfassung: `src/iitc-anchor-planner.user.js`
- Freigegebene Fassungen: `releases/`
- Userscript-ID: `iitc-plugin-anchor-planner`
- IITC-Plugin-ID: `anchor-planner`
- GitHub-Release: <https://github.com/emgeka/iitc-anchor-planner/releases/tag/v0.1.46>

## Funktionen

- Draw-Tools-Linien einschließlich Auto-Draw-Plänen erfassen und doppelte
  Segmente zusammenführen.
- Planendpunkte anhand geladener IITC-Portale und Portal-Bookmarks auflösen;
  unsichere Endpunkte mit Koordinaten und Kandidaten diagnostizieren.
- Vorhandene Planlinks erkennen und den verbleibenden Schlüsselbedarf je
  Portal berechnen.
- Kreuzende, aktuell in IITC geladene Links als Blocker erkennen und zusammen
  mit den betroffenen Planlinks und Kreuzungspunkten automatisch auf der Karte
  hervorheben.
- Blocker-Endportale nach der Zahl eindeutiger Blocklinks priorisieren und
  geeignete Endpunkte für die gemeinsame Arbeitsroute vormerken.
- Einen kompakten Einsatzcheck aus offenen Endpunkten, Blockern, fehlenden
  Keys, fehlenden Namen und der begrenzten Linkabdeckung anzeigen.
- Oberfläche, Statusmeldungen, Diagnosen, Dialoge, Kartenhinweise und
  Text-Exporte wahlweise in Deutsch, Englisch, Spanisch, Französisch,
  Italienisch, Japanisch, Polnisch, brasilianischem Portugiesisch, Russisch
  und vereinfachtem Chinesisch anzeigen; die Sprache automatisch erkennen
  oder unter **Mehr → Sprache** dauerhaft auswählen.
- Die häufig benötigten Angaben und Aktionen in einer kompakten Hauptansicht
  bündeln; selten benötigte Scan-, Namens-, Export-, Sortier-, Lösch- und
  Toleranzfunktionen unter **Mehr** zusammenfassen.
- Namen bereits erkannter Blocker nach neu geladenen IITC-Kartendaten
  automatisch aktualisieren, ohne geöffnete Detailbereiche zu schließen.
- Portale nach offen, blockiert, fehlenden Keys und erledigt filtern sowie
  Keys, Reihenfolge und Erledigt-Status verwalten.
- Das nächste Ziel aus offenen Planportalen und vorgemerkten Blocker-Portalen
  dynamisch anhand des offiziellen IITC-User-Location-Plugins bestimmen oder
  auf die manuelle Reihenfolge zurückfallen; bei gültigem Standort die
  aktuelle Luftlinienentfernung und eine geschätzte Reststrecke anzeigen.
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
2. Den relevanten Kartenbereich laden und **Scannen** auswählen.
3. Offene Endpunkte prüfen; bei Bedarf zoomen, Portale laden und erneut
   scannen beziehungsweise **Namen laden** verwenden.
4. Einsatzcheck und den kompakten Bereich **Blocker** kontrollieren; geeignete
   Blocker-Endportale bei Bedarf für die Arbeitsroute vormerken.
5. Automatisch hervorgehobene Planlinks, Blocklinks und Kreuzungspunkte auf der
   Karte prüfen, Keys und erledigte Portale pflegen und zum jeweils nächsten
   Plan- oder Blocker-Portal navigieren.
6. Plan bei Bedarf als Text oder JSON exportieren.

## Installation

Die freigegebene `.user.js`-Datei wird über einen Userscript-Manager oder die
jeweilige IITC-Plugin-Installation eingebunden:

<https://raw.githubusercontent.com/emgeka/iitc-anchor-planner/main/releases/iitc-anchor-planner.user.js>

Für Umgebungen, in denen der Download als `.user.js` problematisch ist, steht
im Release eine inhaltlich identische `.txt`-Fassung bereit.

Die stabile Installationsadresse zeigt immer auf die zuletzt freigegebene
Version und ist als Quelle für den IITC Community Plugins-Katalog vorgesehen.

## Updates und Community Plugins

- Community-ID: `anchor-planner@emgeka`
- Erforderliches Plugin: `draw-tools@breunigs`
- Empfohlenes Plugin: `bookmarks@ZasoGD`
- Deklarierte Anti-Features: `scraper` für das automatische Nachladen fehlender
  Portalnamen und `export` für den vom Nutzer ausgelösten Planexport

`scraper` folgt hier der Terminologie des IITC Community Plugins-Katalogs:
Anchor Planner fragt ausschließlich über IITCs eigene Portal-Detailfunktionen
fehlende Namen der im aktuellen Plan erkannten Portale ab. Das geschieht
nacheinander nach einem Scan oder ausdrücklich über **Namen laden**. Es werden
keine externen Webseiten durchsucht, keine planfremden Daten dauerhaft
gesammelt und keine fortlaufenden Hintergrundabfragen ausgeführt. Deshalb ist
`highLoad` nicht deklariert.

Die Metadaten `@updateURL` und `@downloadURL` verweisen auf die stabile
Releasefassung. Entwicklungsänderungen unter `src/` erreichen installierte
Plugins deshalb erst nach einem bestätigten und veröffentlichten Release.

## Unterstützung und Beiträge

Fehlerberichte, Übersetzungskorrekturen und konkrete Funktionsvorschläge sind
in den [GitHub Issues](https://github.com/emgeka/iitc-anchor-planner/issues)
willkommen. Eine finanzielle Unterstützung über GitHub Sponsors ist geplant
und wird hier verlinkt, sobald das Sponsorenprofil öffentlich verfügbar ist.

## Entwicklung

Die Regeln in `AGENTS.md` gelten für das gesamte Projekt. Funktionale
Änderungen erfolgen zunächst nur in `src/`. Identische Releasefassungen als
`.user.js` und `.txt` werden erst nach erfolgreichem Praxistest auf Desktop-IITC
und IITC Mobile erzeugt. Die stabilen Dateien ohne Versionsnummer werden dabei
auf denselben Inhalt aktualisiert.

Vor jeder Übergabe, jedem Commit und jeder Veröffentlichung muss jede Änderung
mit dem vollständigen Satz der für die weitere Entwicklung maßgeblichen
Dateien abgeglichen werden. Dazu gehören je nach Betroffenheit Quellcode,
Locales, Build-Ablauf, beide README-Sprachen, Anforderungen, Architektur,
bekannte Grenzen, Testszenarien, Changelog und aktuelle Release-Dateien. Alle
Dateien müssen bewusst geprüft und jede betroffene Datei im selben
Änderungssatz aktualisiert werden; ausdrücklich historische Releases und
Changelog-Abschnitte behalten ihren ursprünglichen Stand.

Übersetzungen liegen getrennt unter `src/locales/*.json`. Jede Datei enthält
dieselben semantischen Schlüssel und Platzhalter sowie unter `language.name`
den eigenen Sprachnamen. `node src/build-locales.mjs` prüft alle Dateien und
bündelt sie in das einzelne Userscript; `node src/build-locales.mjs --check`
prüft zusätzlich, dass das Bundle aktuell ist. Zur Laufzeit werden keine
Sprachdateien aus dem Internet geladen. Englisch ist die verpflichtende
Fallbacksprache.
