# Anchor Planner – Arbeitsregeln für Codex

## Geltungsbereich

Diese Regeln gelten für das gesamte Projekt. Die maßgebliche Arbeitsfassung ist
`src/iitc-anchor-planner.user.js`. Zu den bearbeitbaren Entwicklungsquellen
gehören außerdem `src/build-locales.mjs` und `src/locales/*.json`.

`AGENTS.md` und sämtliche für die weitere Entwicklung maßgeblichen Dateien
bilden einen lebenden, zusammenhängenden Projektstand. Dazu gehören mindestens
die Entwicklungsquellen unter `src/`, `README.md`, `README.de.md`,
`docs/requirements.md`, `docs/architecture.md`, `docs/known-issues.md`,
`test-data/scenarios.md`, `CHANGELOG.md` sowie bei einer Freigabe die aktuellen
Distributionsdateien unter `releases/`.

Bei **jeder** Änderung muss dieser gesamte maßgebliche Projektsatz gegen den
tatsächlichen neuen Stand abgeglichen werden. Betrifft eine Änderung
Projektstruktur, Verhalten, Zuständigkeiten, Arbeitsablauf, Prüfungen,
Dokumentation, bekannte Grenzen, Testszenarien, Versionierung oder
Veröffentlichung, müssen alle davon betroffenen Dateien im selben Änderungssatz
entsprechend angepasst werden. Auch wenn für einzelne Dateien keine
Textänderung nötig ist, gehört ihr bewusster Konsistenzabgleich verpflichtend
zur Abschlussprüfung. Ausdrücklich historische Changelog-Abschnitte und
versionierte Alt-Releases behalten ihren damaligen Stand.

## Vorgehen

1. Vor Änderungen zuerst `README.md`, `README.de.md`,
   `docs/requirements.md`, `docs/architecture.md`, `docs/known-issues.md` und
   `test-data/scenarios.md` lesen.
2. Bestehendes Verhalten nicht beiläufig entfernen oder umdeuten. Änderungen
   auf den ausdrücklich beauftragten Bereich begrenzen.
3. Nutzerbeobachtungen aus realen IITC-Tests haben Vorrang vor Vermutungen.
4. Unsichere IITC-Interna defensiv behandeln und fehlende Daten als fehlend
   kennzeichnen. Keine GUID als Portalname anzeigen.
5. Desktop-IITC und IITC Mobile berücksichtigen. Dialoge, Panelhöhe, Overlays,
   Touch-Bedienung und externe Navigation dürfen auf Mobilgeräten nicht
   unbrauchbar werden.
6. Vor jeder Freigabe mindestens JavaScript-Syntax, Build-Script-Syntax,
   Locale- und Bundle-Konsistenz, Userscript-Metadaten, `git diff --check` und
   die betroffenen Szenarien prüfen.
7. Vor Übergabe, Commit oder Veröffentlichung den gesamten maßgeblichen
   Projektsatz einschließlich `AGENTS.md` erneut gegen alle tatsächlich
   vorgenommenen Änderungen abgleichen und betroffene Dateien bei Bedarf im
   selben Änderungssatz aktualisieren.

## Versionierung und Releases

- Vor jedem Commit projektweit prüfen, dass alle nicht-historischen Dateien
  den aktuellsten vorgesehenen Versionsstand abbilden. Dazu gehören mindestens
  Arbeitsfassung, `README.md`, `README.de.md`, aktuelle Docs-Angaben, Changelog
  sowie bei einer Freigabe die versionierten und stabilen
  Distributionsdateien.
- Solange Versionsstand, Dokumentation oder Distributionsdateien voneinander
  abweichen, darf kein Commit erstellt werden. Ein noch nicht vollständig
  dokumentierter Entwicklungsstand bleibt uncommitted unter `src/`.
- Ausgenommen sind nur ausdrücklich historische Changelog-Abschnitte und
  versionierte Alt-Releases; diese müssen ihren jeweiligen damaligen
  Versionsstand unverändert behalten.
- Versionsangaben in `@version` und `ap.VERSION` müssen identisch sein.
- `plugin_info.dateTimeVersion` bei einer neuen Version aktualisieren.
- Jede freigegebene Änderung knapp in `CHANGELOG.md` dokumentieren. Der
  aktuelle Releaseabschnitt wird auf Englisch und Deutsch gepflegt;
  historische Abschnitte müssen nicht nachträglich übersetzt werden.
- Funktionale Änderungen während der Entwicklung nur an den maßgeblichen
  Quellen unter `src/` vornehmen: Userscript, Locale-Build und Sprachdateien.
  Dokumentations- und Prozessänderungen bleiben davon unberührt.
- Erst nach bestätigtem Praxistest identische Releasefassungen als
  `.user.js` und `.txt` unter `releases/` erzeugen.
- Die stabilen Community-Dateien `releases/iitc-anchor-planner.user.js` und
  `releases/iitc-anchor-planner.txt` bei jeder Freigabe bytegleich zur
  jeweiligen versionierten Releasefassung aktualisieren.
- Vor einer Freigabe müssen Arbeitsfassung, versionierte `.user.js`- und
  `.txt`-Fassung sowie beide stabilen Community-Dateien bytegleich sein.
- `README.md` ist die englische internationale Hauptseite; `README.de.md` ist
  die vollständige deutsche Fassung. Inhaltliche Projektänderungen müssen in
  beiden Fassungen synchron nachgeführt werden.
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

## Internationalisierung

- Sichtbare Texte und Text-Exporte ausschließlich über semantische
  Übersetzungsschlüssel ausgeben. Englisch ist die verpflichtende Referenz-
  und Fallbacksprache.
- Alle Dateien unter `src/locales/` müssen identische Schlüssel und
  Platzhalter enthalten. Änderungen mit `node src/build-locales.mjs --check`
  prüfen und vor der Freigabe in das einzelne Userscript bündeln.
- Sprachdateien werden nicht zur Laufzeit aus dem Internet geladen. Neue
  vollständige Locale-Dateien müssen ohne sprachspezifische Änderung der
  Laufzeitlogik erkannt werden.
- JSON-Feldnamen und JSON-Struktur bleiben unabhängig von der Oberflächen- und
  Exportsprache unverändert und sprachneutral.
- Neue und geänderte Texte auf kompakte Darstellung, nichtlateinische
  Schriften sowie Bedienbarkeit auf Desktop-IITC und IITC Mobile prüfen.

## Änderungsübergabe

Bei jeder Implementierung nennen:

- geänderte Dateien und Verhalten,
- durchgeführte Prüfungen,
- verbleibende Unsicherheiten,
- konkrete Schritte für den Praxistest in IITC.

Bei reinen Dokumentations- oder Prozessänderungen ohne Auswirkung auf den
Laufzeitcode ist kein erneuter IITC-Praxistest erforderlich; dies bei der
Übergabe ausdrücklich begründen. Der verpflichtende Abgleich des gesamten
maßgeblichen Projektsatzes gilt trotzdem.
