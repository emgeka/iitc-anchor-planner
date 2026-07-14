# IITC Anchor Planner

Anchor Planner ist ein IITC-Userscript zur Auswertung geplanter Links aus Draw
Tools. Es ordnet Linkendpunkte Portalen zu, berücksichtigt Bookmarks und bereits
vorhandene Links und erzeugt daraus eine abarbeitbare Portal- und Schlüsselübersicht.

## Aktueller Stand

- Importierte Ausgangsversion: **0.1.35**
- Arbeitsfassung: `src/iitc-anchor-planner.user.js`
- Unveränderte Ausgangsreleases: `releases/`
- Userscript-ID: `iitc-plugin-anchor-planner`
- IITC-Plugin-ID: `anchor-planner`

## Entwicklung mit Codex

Den Ordner als Projekt in der Codex-Ansicht öffnen. Codex soll zuerst
`AGENTS.md` und die Dateien unter `docs/` lesen. Änderungen erfolgen nur in
`src/`; Releasekopien werden erst nach einem erfolgreichen IITC-Praxistest
erzeugt.

Geeigneter erster Auftrag:

> Analysiere die Arbeitsfassung anhand von AGENTS.md und docs/, ohne Dateien zu
> verändern. Ordne die zentralen Funktionsbereiche zu und nenne Abweichungen,
> Risiken und sinnvolle Testpunkte.

## Manuelle Installation

Die freigegebene `.user.js`-Datei wird über einen Userscript-Manager oder die
jeweilige IITC-Plugin-Installation eingebunden. Für Umgebungen, in denen der
Dateidownload als `.user.js` problematisch ist, steht eine inhaltlich identische
`.txt`-Fassung bereit.

