# IITC Anchor Planner

[English](README.md) | [Deutsch](README.de.md)

**Felder planen. Blocker finden. Keys zählen. Route abarbeiten.**

Anchor Planner macht aus Draw-Tools- und Auto-Draw-Linkplänen einen direkt nutzbaren IITC-Arbeitsablauf: Planportale, benötigte Keys, vorhandene Links, Blocker, Arbeitsziele und Navigation — gebündelt in einem kompakten Panel für Desktop und Mobil.

## In Aktion

![Anchor Planner v0.1.47 mit einem ruhigen Drei-Portal-Plan, sechs benötigten Keys, Blockerstatus und dem nächsten Arbeitsziel in IITC](docs/media/anchor-planner-hero.png)

*Den gesamten Plan auf einen Blick: beteiligte Portale, noch benötigte Keys und das nächste Arbeitsziel.*

![Zwölfsekündige Anchor-Planner-Demo mit Draw-Tools-Plan, Scan, berechnetem Keybedarf, Einsatzcheck und Portaldetail](docs/media/anchor-planner-demo.gif)

*In wenigen Sekunden vom Draw-Tools-Plan zur einsatzbereiten Checkliste — scannen, Einsatzbereitschaft prüfen und den genauen Keybedarf jedes Portals einsehen.*

## Installation

**Aktuelle stabile Version:**

<https://raw.githubusercontent.com/emgeka/iitc-anchor-planner/main/releases/iitc-anchor-planner.user.js>

Die `.user.js`-Datei wird über einen Userscript-Manager oder die jeweilige IITC-Plugin-Installation eingebunden. Falls `.user.js`-Downloads in der eigenen Umgebung unpraktisch sind, enthält das GitHub-Release zusätzlich eine inhaltlich identische `.txt`-Fassung.

Aktuelle Veröffentlichung: **0.1.50**

<https://github.com/emgeka/iitc-anchor-planner/releases/tag/v0.1.50>

## Warum Anchor Planner?

- **Keine Keys mehr von Hand zählen.** Bereits vorhandene Planlinks werden erkannt und der verbleibende Schlüsselbedarf je Portal berechnet.
- **Blocker direkt auf der Karte sehen.** Kreuzende geladene Intel-Links, betroffene Planlinks und Kreuzungspunkte werden automatisch hervorgehoben.
- **Wissen, was als Nächstes dran ist.** Offene Planportale und ausgewählte Blocker-Endpunkte werden zu einer gemeinsamen Arbeitsroute mit nächstem Ziel, Entfernung und geschätzter Reststrecke, sofern IITC User Location verfügbar ist.
- **Aus dem Plan wird eine Checkliste.** Keys, Erledigt-Status, Reihenfolge, Einsatzbereitschaft und Portalstatus lassen sich direkt pflegen.
- **Auch unterwegs nutzbar.** Das kompakte Panel funktioniert auf Desktop und IITC Mobile, lässt sich verschieben und merkt sich seine Position.
- **Plan teilen oder archivieren.** Plan und Blocker-Details lassen sich als lesbarer Text oder JSON exportieren.
- **Mehrsprachig arbeiten.** Deutsch, Englisch, Spanisch, Französisch, Italienisch, Japanisch, Polnisch, brasilianisches Portugiesisch, Russisch und vereinfachtes Chinesisch sind gebündelt enthalten.

## Was das Plugin macht

Anchor Planner liest Draw-Tools-Geometrien — einschließlich Auto-Draw-Plänen — und kombiniert sie mit geladenen IITC-Portalen, optionalen Portal-Bookmarks und aktuell geladenen Intel-Links.

Daraus kann das Plugin:

- Planendpunkte Portalen zuordnen und offene Endpunkte diagnostizieren;
- bereits vorhandene Planlinks erkennen;
- den verbleibenden Schlüsselbedarf berechnen;
- kreuzende Blocker-Links erkennen und hervorheben;
- für noch nicht bestätigte Planlinks einen begrenzten optionalen **Finalcheck** auf einer IITC-Zoomstufe ohne Linklängenfilter durchführen und bereits als vorhanden erkannte Planlinks dabei überspringen;
- sinnvolle Blocker-Endportale für die praktische Abarbeitung priorisieren;
- einen kompakten Einsatzcheck für Blocker, fehlende Keys, fehlende Namen, offene Endpunkte und begrenzte Linkabdeckung anzeigen;
- Portale nach offen, blockiert, fehlenden Keys und erledigt filtern;
- Keys, Erledigt-Status, Notizen und Routenreihenfolge verwalten;
- anhand des offiziellen IITC-User-Location-Plugins dynamisch das nächste Arbeitsziel bestimmen;
- Luftlinienentfernung und geschätzte Reststrecke anzeigen;
- für Planportale und Blocker-Endpunkte dieselben Aktionen **Details anzeigen**
  und **Aktionen** anbieten; Waze-, Intel-, Google-Maps-, Apple-Maps- und
  Geo-Navigation bleiben im gemeinsamen Aktionsdialog verfügbar;
- für bereits geladene Planportale die IITC-Portal-Detailansicht öffnen, ohne die Karte zu verschieben oder zu zoomen;
- Plan und konkrete Blocker-Details als Text oder JSON kopieren und herunterladen.

Das Panel kann per Maus, Touch oder Pointer am Kopf verschoben werden. Die auf den sichtbaren Viewport begrenzte Position wird über IITC-Sitzungen hinweg gespeichert und nach Größen-, Orientierungs- sowie Auf- und Zuklappänderungen korrigiert. Der Anchor-Planner-Layer behält die in IITC gewählte Sichtbarkeit über Neuladevorgänge hinweg bei.

## Typischer Ablauf

1. Linkplan mit Draw Tools oder Auto Draw erzeugen.
2. Den relevanten Kartenbereich laden und **Scannen** auswählen.
3. Einsatzcheck und offene Endpunkte prüfen; vor dem Einsatz für noch nicht bestätigte Planlinks den **Finalcheck** ausführen.
4. Erkannte Blocker kontrollieren und bei Bedarf geeignete Blocker-Endportale für die Arbeitsroute vormerken.
5. Keys und erledigte Portale pflegen, während Anchor Planner das nächste Ziel hervorhebt.
6. Mit Waze oder einer anderen Karten-App navigieren und den Plan bei Bedarf exportieren.

## Voraussetzungen und Datenabdeckung

- IITC mit aktiviertem Draw-Tools-Plugin ist für den Scan erforderlich.
- Portal-Bookmarks verbessern die Auflösung, sind aber optional.
- Standortabhängige Zielwahl verwendet ausschließlich das offizielle IITC-User-Location-Plugin. Standortdaten werden weder dauerhaft gespeichert noch exportiert.
- Der normale Scan erkennt nur die aktuell in IITC geladenen `window.links`. Der **Finalcheck** fährt vorübergehend höchstens zwölf Ansichten entlang noch nicht bestätigter Planlinks auf der ersten IITC-Zoomstufe ohne Linklängenfilter ab, sammelt die geladenen Links und stellt danach die ursprüngliche Ansicht wieder her. Bereits erkannte Planlinks werden übersprungen. Der Fortschritt wird nach jeder Ansicht gespeichert; ein pausierter Check kann bei unverändertem Plan auch nach einem IITC-Neuladen fortgesetzt werden. Ein begrenzter oder abgebrochener Lauf bleibt ausdrücklich unvollständig und ist keine Entwarnung.

## Community Plugins und Updates

- Community-ID: `anchor-planner@emgeka`
- Erforderliches Plugin: `draw-tools@breunigs`
- Empfohlenes Plugin: `bookmarks@ZasoGD`
- Deklarierte Anti-Features: `scraper` für das automatische Nachladen fehlender Portalnamen und `export` für den vom Nutzer ausgelösten Planexport
- Katalog-Icon: wird über die Userscript-Metadaten aus `docs/media/anchor-planner-icon.svg` veröffentlicht

`scraper` folgt hier der Terminologie des IITC Community Plugins-Katalogs: Anchor Planner fragt ausschließlich über IITCs eigene Portal-Detailfunktionen fehlende Namen der im aktuellen Plan erkannten Portale ab. Das geschieht nacheinander nach einem Scan oder ausdrücklich über **Namen laden**. Es werden keine externen Webseiten durchsucht, keine planfremden Daten dauerhaft gesammelt und keine fortlaufenden Hintergrundabfragen ausgeführt. Der ausdrücklich gestartete **Finalcheck** ist auf zwölf normale IITC-Kartenansichten begrenzt und führt keine eigenen Intel-Tile-Abfragen aus. Deshalb ist `highLoad` nicht deklariert.

Die stabile Installationsadresse zeigt immer auf die zuletzt veröffentlichte Version und ist als Quelle für den IITC Community Plugins-Katalog vorgesehen. Entwicklungsänderungen unter `src/` erreichen installierte Plugins erst nach Test und Veröffentlichung.

## Projektstatus

- Aktuelle Version: **0.1.50**
- Aktuelle stabile Veröffentlichung: **0.1.50**
- Arbeitsfassung: `src/iitc-anchor-planner.user.js`
- Freigegebene Fassungen: `releases/`
- Userscript-ID: `iitc-plugin-anchor-planner`
- IITC-Plugin-ID: `anchor-planner`

## Unterstützung und Beiträge

Fehlerberichte, Übersetzungskorrekturen und konkrete Funktionsvorschläge sind in den [GitHub Issues](https://github.com/emgeka/iitc-anchor-planner/issues) willkommen.

Eine finanzielle Unterstützung über GitHub Sponsors ist geplant und wird hier verlinkt, sobald das Sponsorenprofil öffentlich verfügbar ist.

## Entwicklung

Die Regeln in `AGENTS.md` gelten für das gesamte Projekt. Funktionale Änderungen erfolgen zunächst nur in `src/`. Identische Releasefassungen als `.user.js` und `.txt` werden erst nach erfolgreichem Praxistest auf Desktop-IITC und IITC Mobile erzeugt. Die stabilen Dateien ohne Versionsnummer werden dabei auf denselben Inhalt aktualisiert.

Vor jeder Übergabe, jedem Commit und jeder Veröffentlichung muss jede Änderung mit dem vollständigen Satz der für die weitere Entwicklung maßgeblichen Dateien abgeglichen werden. Dazu gehören je nach Betroffenheit Quellcode, Locales, Build-Ablauf, beide README-Sprachen, Anforderungen, Architektur, bekannte Grenzen, Testszenarien, Changelog und aktuelle Release-Dateien. Alle Dateien müssen bewusst geprüft und jede betroffene Datei im selben Änderungssatz aktualisiert werden; ausdrücklich historische Releases und Changelog-Abschnitte behalten ihren ursprünglichen Stand.

Übersetzungen liegen getrennt unter `src/locales/*.json`. Jede Datei enthält dieselben semantischen Schlüssel und Platzhalter sowie unter `language.name` den eigenen Sprachnamen. `node src/build-locales.mjs` prüft alle Dateien und bündelt sie in das einzelne Userscript; `node src/build-locales.mjs --check` prüft zusätzlich, dass das Bundle aktuell ist. Zur Laufzeit werden keine Sprachdateien aus dem Internet geladen. Englisch ist die verpflichtende Fallbacksprache.
