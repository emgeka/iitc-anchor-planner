# Anchor Planner – Arbeitsregeln für Codex

## Geltungsbereich

Diese Regeln gelten für das gesamte Projekt. Die maßgebliche Arbeitsfassung ist
`src/iitc-anchor-planner.user.js`.

## Vorgehen

1. Vor Änderungen zuerst `README.md`, `docs/requirements.md`,
   `docs/architecture.md`, `docs/known-issues.md` und `test-data/scenarios.md`
   lesen.
2. Bestehendes Verhalten nicht beiläufig entfernen oder umdeuten. Änderungen
   auf den ausdrücklich beauftragten Bereich begrenzen.
3. Nutzerbeobachtungen aus realen IITC-Tests haben Vorrang vor Vermutungen.
4. Unsichere IITC-Interna defensiv behandeln und fehlende Daten als fehlend
   kennzeichnen. Keine GUID als Portalname anzeigen.
5. Desktop-IITC und IITC Mobile berücksichtigen. Dialoge, Panelhöhe, Overlays,
   Touch-Bedienung und externe Navigation dürfen auf Mobilgeräten nicht
   unbrauchbar werden.
6. Vor jeder Freigabe mindestens JavaScript-Syntax, Userscript-Metadaten und
   die betroffenen Szenarien prüfen.

## Versionierung und Releases

- Versionsangaben in `@version` und `ap.VERSION` müssen identisch sein.
- `plugin_info.dateTimeVersion` bei einer neuen Version aktualisieren.
- Jede freigegebene Änderung knapp in `CHANGELOG.md` dokumentieren.
- Während der Entwicklung nur die Datei unter `src/` ändern.
- Erst nach bestätigtem Praxistest identische Releasefassungen als
  `.user.js` und `.txt` unter `releases/` erzeugen.
- Die stabilen Community-Dateien `releases/iitc-anchor-planner.user.js` und
  `releases/iitc-anchor-planner.txt` bei jeder Freigabe bytegleich zur
  jeweiligen versionierten Releasefassung aktualisieren.
- Release-Dateinamen enthalten keinen Browser- oder Uploadzusatz wie `(1)`.
- Metadaten wie `@id`, `@namespace` und `@author` nicht ohne ausdrücklichen
  Auftrag ändern. Die importierte Version 0.1.35 ist hierfür maßgeblich.

## Fachliche Leitplanken

- Draw-Tools-Linien einschließlich Auto-Draw-Plänen sind die primäre
  Plangeometrie.
- Bookmarks und geladene `window.portals` ergänzen die Portalauflösung.
- Ein nicht vollständig ausgebautes oder gegnerisches Portal bleibt ein
  gültiger Planendpunkt.
- Eine automatische Portalzuordnung darf nicht stillschweigend einen nur
  nahegelegenen, aber falschen Kandidaten als sicher darstellen.
- Vorhandene Links, Blocker und nicht bestätigte Zustände klar unterscheiden.
- `Draw-Tools-Punkte` bezeichnet nur separate Punkt-/Markerobjekte, nicht die
  Endpunkte korrekt gelesener Liniensegmente.
- Cache-, Scan- und Löschfunktionen begrifflich und funktional trennen.

## Änderungsübergabe

Bei jeder Implementierung nennen:

- geänderte Dateien und Verhalten,
- durchgeführte Prüfungen,
- verbleibende Unsicherheiten,
- konkrete Schritte für den Praxistest in IITC.
