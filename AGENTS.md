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

## Branches und Integration

- `main` enthält den freigegebenen stabilen Stand und bleibt Standardbranch.
- `beta` enthält die integrierte Entwicklung und dient den IITC-Praxistests.
- Größere Änderungen auf `feature/<thema>` vom aktuellen `beta` entwickeln
  und per Pull Request nach `beta` übernehmen. Kleine Entwicklungsänderungen
  dürfen direkt auf `beta` entstehen; keine Entwicklungscommits auf `main`.
- Dringende stabile Korrekturen auf `hotfix/<thema>` und reine Repository-
  oder Dokumentationspflege auf `maintenance/<thema>` von `main` abzweigen.
- Nach bestätigtem Praxistest einen `release/<version>`-Branch von `beta`
  für die Release-Dateien vorbereiten und per Pull Request nach `main`
  übernehmen. Danach `main` nach `beta` zurückführen; die Merge-Historie erhalten.
- `releases/` bleibt auf `beta` und Feature-Branches unverändert.
  Installierbare Beta-Builds benötigen einen getrennten Build, eigene
  Update-Adressen und eine sichtbare Beta-Kennzeichnung. `src/build-beta.mjs`
  erzeugt und prüft die Testdateien unter `beta-builds/`. Die Quelle unter
  `src/` ist kein Beta-Updatekanal; Beta-Dateien ersetzen keinen Stable-Release.
- Vor Arbeitsbeginn Remote-Stand und aktiven Branch prüfen. Bei jedem Commit
  die Branch-Prüfung aus `src/check-branch-policy.mjs` ausführen.
- Der vollständige Ablauf steht in `docs/development.md`. Die einmalige
  Einrichtung und reine Prozesspflege benötigen keinen Versionssprung.

## Versionierung und Releases

- Neue Funktionsbereiche und grundlegende Überarbeitungen erhalten eine neue
  Minor-Version (zum Beispiel `0.1.x` → `0.2.0`). Patch-Versionen sind für
  Fehlerkorrekturen und kleinere Anpassungen vorgesehen. Beta-Iterationen
  verwenden `X.Y.0-beta.N`; der aktuelle Featurestand zielt auf `0.2.0`.

- Vor jedem Commit projektweit prüfen, dass alle nicht-historischen Dateien
  den aktuellsten vorgesehenen Versionsstand abbilden. Dazu gehören mindestens
  Arbeitsfassung, `README.md`, `README.de.md`, aktuelle Docs-Angaben, Changelog
  sowie bei einer Freigabe die versionierten und stabilen
  Distributionsdateien.
- Quellen und Entwicklungsdokumentation müssen vor jedem Commit konsistent
  sein. Auf `beta` und Feature-Branches dürfen dokumentierte Entwicklungsstände
  von den eingefrorenen stabilen Dateien unter `releases/` abweichen. Vor der
  Übernahme eines Release-Kandidaten nach `main` müssen Quellen und aktuelle
  Distributionsdateien denselben freigegebenen Stand abbilden.
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
- Wurfrichtungen ausschließlich ausdrücklich pro Planlink festlegen; offene
  Richtungen als unsicheren Keybedarf an beiden Endportalen kennzeichnen.
- Blocker-Abbau vor den abhängigen Linkaufträgen mit möglichst geringer
  zusätzlicher Luftlinienstrecke einordnen. Frühe Abbau-Besuche dürfen spätere
  Portal-/Linkaufgaben nicht als erledigt behandeln.
- Manuelle Erledigt-Meldungen und beobachtete Intel-Daten getrennt halten;
  fehlende Daten nie als bestätigten Abbau darstellen. Eine Aufgabenroute
  bestätigt keine Eroberung, Linklimits oder Ausführbarkeit unter Feldern.
- Nach Aufgabenänderungen `node src/test-work-plan.mjs` und
  `node src/build-beta.mjs --check` zusätzlich ausführen.

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

## Keyimport-Prüfungen
- Keybestand ausschließlich über IITC Keys beziehen; keine lokale Ersatzverwaltung
  oder automatische Migration einführen. Unbekannten Bestand nicht als null behandeln.
- Bei Bestands-/Importänderungen zusätzlich node src/test-key-import.mjs ausführen.
- Der 0.2.0-Entwurf braucht einen echten Screenshot-/Video-Praxistest vor Stable.
