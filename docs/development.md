# Branches and release workflow

[English](#english) | [Deutsch](#deutsch)

## English

| Branch | Role | Pull request target |
| --- | --- | --- |
| `main` | Stable source and published distributions; default branch | — |
| `beta` | Integrated development and practical IITC testing | `main`, after release approval |
| `feature/<topic>` | One substantial change, created from current `beta` | `beta` |
| `release/<version>` | Stable distribution preparation from tested `beta` | `main` |
| `hotfix/<topic>` | Urgent stable correction, created from current `main` | `main`, after testing; then merge `main` into `beta` |
| `maintenance/<topic>` | Documentation or repository tooling, created from `main` | `main`; then merge `main` into `beta` |

Small development changes may be committed directly to `beta`. Larger changes
use feature branches and pull requests. Create branches when work starts;
`feature/link-direction` is the starting branch for the planned direction and
directed key-demand work. Build-order checks and Walk Sim get their own feature
branches when those tasks begin. Delete merged feature branches after their work
has been preserved in `beta`; keep `main` and `beta` permanently.

Before starting work, fetch the remote and verify the current branch. Do not
commit development changes on `main`. The one-time branch-workflow setup and
documentation-only maintenance do not require a plugin version bump or an IITC
runtime test. Future maintenance should normally use a pull request.

### Integrate and publish

1. Start a feature branch from the current remote `beta`.
2. Change functional sources under `src/` and update all affected documentation.
   Keep `@version` and `ap.VERSION` aligned. A development version may differ
   from the latest stable distribution; document both clearly and leave
   `releases/` untouched on `beta` and feature branches.
3. Open a pull request into `beta`, run the automated checks, and integrate the
   change. Test the combined behavior in desktop IITC and IITC Mobile.
4. Record the practical test result, create `release/<version>` from the tested
   `beta`, and prepare its pull request into `main`. Generate the stable release
   files there only after the practical test is confirmed. Release branches
   must pass the same distribution checks as `main`; `beta` stays unchanged
   until the approved release is merged back.
5. Before merging, verify that source, versioned `.user.js`/`.txt` and both
   stable files are byte-identical, metadata uses the stable URLs, documentation
   is consistent, and automated checks pass. Do not merge untested functional
   changes into `main`.
6. Merge the release PR, tag and publish the approved commit on `main`, then
   merge `main` back into `beta`. Never force-reset either long-lived branch.
   Keep merge history when promoting `beta` to `main` to avoid repeatedly
   presenting already released commits as new development.

### Version scope

New functional areas and substantial reworks increment the minor version;
patch releases contain fixes and small adjustments. Beta iterations use
`X.Y.0-beta.N`. Tasks, directed links and integrated routing target `0.2.0`;
the previous `0.1.56-beta.*` builds are superseded by `0.2.0-beta.19` with the
compatible saved data. Walk Sim joins the planned 0.2.0 feature scope.

### Installation channels

Stable installations and the Community catalog continue to use
`main/releases/iitc-anchor-planner.user.js`. Branch creation does not publish a
new plugin release. Initially `beta` and `feature/link-direction` share the
stable source at branch creation. The current test build is
`0.2.0-beta.19` under `beta-builds/`, with integrated tasks, explicit link
directions, preselected direction suggestions, Keys import, complete inventory reset
and persistent undo with conflict review, a complete searchable key inventory list,
automatic key consumption for newly observed plan links and Walk Sim.

Do not advertise `beta/src/iitc-anchor-planner.user.js` as a beta installation:
the source contains stable update URLs. `node src/build-beta.mjs` creates the
separate beta build under `beta-builds/` with beta download and update URLs on
the `beta` branch, an explicit beta version shown in the UI and a Beta userscript
name. `node src/build-beta.mjs --check` verifies its content and metadata.
Beta builds must never overwrite `releases/` or
become the stable Community-catalog source. Do not install both variants in
one IITC instance: they share the plugin namespace and persisted state. Future
state changes require migration and a documented return-to-stable path.
This beta adds optional fields without deleting old data; stable ignores the
directions and blocker task settings. Export the plan before switching back.

### Automated checks

`.github/workflows/checks.yml` checks pushes to `main`, `beta`, `feature/**`,
`release/**`, `hotfix/**` and `maintenance/**`, and pull requests targeting `main` or `beta`.
It runs syntax, locale-bundle, localization, panel and final-check tests, metadata
and branch-policy checks, beta-build consistency, work-plan tests and whitespace checks. CI does not publish anything
and does not replace practical IITC testing. Branch rules are documented and
checked by CI; server-side branch protection is a separate repository setting.

For local branch-policy verification, run
`node src/check-branch-policy.mjs --branch beta --stable-ref origin/main`
(replace `beta` with the branch being checked). Evaluate a release candidate
with `--branch main`. Fetch `origin/main` first; a stale local remote reference
cannot establish the current stable baseline.

## Deutsch

| Branch | Aufgabe | Ziel des Pull Requests |
| --- | --- | --- |
| `main` | Stabile Quellen und veröffentlichte Fassungen; Standardbranch | — |
| `beta` | Zusammengeführte Entwicklung und IITC-Praxistests | `main`, nach Freigabe |
| `feature/<thema>` | Eine größere Änderung, vom aktuellen `beta` abzweigen | `beta` |
| `release/<version>` | Stabile Distribution vom getesteten `beta` vorbereiten | `main` |
| `hotfix/<thema>` | Dringende stabile Korrektur, vom aktuellen `main` abzweigen | `main`, nach Test; danach `main` nach `beta` übernehmen |
| `maintenance/<thema>` | Dokumentation oder Repository-Werkzeuge, von `main` abzweigen | `main`; danach `main` nach `beta` übernehmen |

Kleine Entwicklungsänderungen dürfen direkt auf `beta` entstehen. Größere
Änderungen verwenden Feature-Branches und Pull Requests. Branches werden zum
Arbeitsbeginn angelegt; `feature/link-direction` ist für die geplante
Wurfrichtung und den gerichteten Keybedarf vorbereitet. Baufolgenprüfung und
Walk Sim erhalten eigene Feature-Branches, sobald diese Arbeiten beginnen.
Zusammengeführte Feature-Branches können nach Sicherung ihrer Arbeit in `beta`
gelöscht werden; `main` und `beta` bleiben dauerhaft bestehen.

Vor Arbeitsbeginn den Remote-Stand laden und den aktiven Branch prüfen.
Entwicklungsänderungen nicht auf `main` committen. Die einmalige Einrichtung
dieses Ablaufs und reine Dokumentationspflege erfordern weder einen
Versionssprung des Plugins noch einen IITC-Praxistest. Weitere Pflegeänderungen
sollen normalerweise über einen Pull Request erfolgen.

### Integration und Veröffentlichung

1. Einen Feature-Branch vom aktuellen Remote-Stand von `beta` erstellen.
2. Funktionale Quellen unter `src/` und alle betroffenen Dokumente ändern.
   `@version` und `ap.VERSION` bleiben identisch. Der Entwicklungsstand darf von
   der letzten stabilen Distribution abweichen; beide Stände klar dokumentieren
   und `releases/` auf `beta` und Feature-Branches unverändert lassen.
3. Einen Pull Request nach `beta` öffnen, automatische Prüfungen ausführen und
   die Änderung integrieren. Das Zusammenspiel auf Desktop-IITC und IITC Mobile
   praktisch testen.
4. Den Praxistest dokumentieren, `release/<version>` vom getesteten `beta`
   abzweigen und dessen Pull Request nach `main` vorbereiten. Erst nach
   bestätigtem Test dort die stabilen Release-Dateien erzeugen. Release-Branches
   müssen dieselben Distributionsprüfungen wie `main` bestehen; `beta` bleibt
   bis zur Rückführung des freigegebenen Releases unverändert.
5. Vor dem Merge Bytegleichheit von Quelle, versionierter `.user.js`/`.txt` und
   beiden stabilen Dateien, stabile Metadaten-Adressen, Dokumentationskonsistenz
   und erfolgreiche automatische Prüfungen bestätigen. Ungetestete funktionale
   Änderungen nicht nach `main` übernehmen.
6. Den Release-PR zusammenführen, den freigegebenen `main`-Commit taggen und
   veröffentlichen; danach `main` nach `beta` zurückführen. Keinen der beiden
   dauerhaften Branches per Force-Reset ersetzen. Beim Übernehmen von `beta`
   nach `main` die Merge-Historie erhalten, damit bereits veröffentlichte
   Commits nicht erneut als neue Entwicklung erscheinen.

### Versionsumfang

Neue Funktionsbereiche und grundlegende Überarbeitungen erhöhen die
Minor-Version; Patch-Releases enthalten Korrekturen und kleinere Anpassungen.
Beta-Iterationen verwenden `X.Y.0-beta.N`. Aufgaben, Wurfrichtung und gemeinsame
Routenplanung zielen auf `0.2.0`; `0.2.0-beta.19` ersetzt die bisherigen
`0.1.56-beta.*`-Builds mit kompatiblen gespeicherten Daten. Walk Sim gehört ebenfalls
zum vorgesehenen Funktionsumfang von 0.2.0.

### Installationskanäle

Stabile Installationen und Community-Katalog verwenden weiterhin
`main/releases/iitc-anchor-planner.user.js`. Das Anlegen von Branches erzeugt
keine neue Pluginveröffentlichung. Anfangs enthalten `beta` und
`feature/link-direction` beim Anlegen dieselbe stabile Quelle. Der aktuelle
Testbuild ist `0.2.0-beta.19` unter `beta-builds/` mit gemeinsamen Aufgaben,
ausdrücklichen Wurfrichtungen, vorausgewählten Richtungsvorschlägen, Keyimport,
vollständigem Bestandsreset, persistenter Rücknahme mit Konfliktprüfung,
durchsuchbarer Gesamtbestandsliste, automatischer Verbrauchsbuchung bei neu erkannten Planlinks und Walk Sim.

`beta/src/iitc-anchor-planner.user.js` nicht als Beta-Installation bewerben:
Die Quelle enthält stabile Update-Adressen. `node src/build-beta.mjs` erzeugt
den eigenen Build unter `beta-builds/` mit Beta-Download- und Update-Adressen
auf `beta`, sichtbarer Beta-Version und Beta-Userscript-Namen.
`node src/build-beta.mjs --check` prüft Inhalt und Metadaten.
Beta-Builds dürfen weder `releases/`
überschreiben noch zur Quelle des stabilen Community-Katalogs werden. Beide
Varianten nicht gemeinsam in einer IITC-Instanz installieren: Plugin-Namespace
und gespeicherter Zustand werden geteilt. Zukünftige Zustandsänderungen benötigen
Migrationen und einen dokumentierten Rückweg zu Stable. Diese Beta ergänzt
optionale Felder ohne Löschen vorhandener Daten; Stable ignoriert Richtungen
und Blocker-Aufgabeneinstellungen. Vor dem Rückwechsel den Plan exportieren.

### Automatische Prüfungen

`.github/workflows/checks.yml` prüft Pushes auf `main`, `beta`, `feature/**`,
`release/**`, `hotfix/**` und `maintenance/**` sowie Pull Requests nach `main` oder `beta`.
Geprüft werden Syntax, Locale-Bundle, Sprachverhalten, Panel und Finalcheck,
Metadaten, Branch-Regeln, Beta-Build-Konsistenz, Arbeitsplan und Whitespace. CI veröffentlicht nichts und ersetzt
keinen IITC-Praxistest. Die Branch-Regeln werden dokumentiert und durch CI
geprüft; serverseitiger Branch-Schutz ist eine separate Repository-Einstellung.

Die lokale Branch-Prüfung lautet
`node src/check-branch-policy.mjs --branch beta --stable-ref origin/main`
(`beta` durch den geprüften Branch ersetzen). Release-Kandidaten mit
`--branch main` bewerten. Zuerst `origin/main` aktualisieren; ein veralteter
lokaler Remote-Verweis bestätigt nicht den aktuellen stabilen Ausgangsstand.

Current beta adds a fixed plan-portal start (GUID only, no GPS persistence) and names Walk Sim **Plan preview** / **Planvorschau**. Returning to stable ignores this additional mode; export the plan as usual. The existing work-plan, localization, UI and simulation checks cover origin alignment and return visits.

Aktuelle Beta: fester Start am Planportal (nur GUID, kein GPS speichern), Walk Sim heißt **Planvorschau**. Stable ignoriert diesen zusätzlichen Modus; Plan wie bisher vor Rückwechsel exportieren. Bestehende Arbeitsplan-, Sprach-, UI- und Vorschauprüfungen decken Ursprung und Wiederbesuche ab.

### Fächer-Generator beta.16
Neue Planung als feature/fan-field-planner von beta, Pull Request nach beta. Stable und releases bleiben 0.1.55. Eigenständige Implementierung mit optionalen fanDesign-Metadaten; vor Rückwechsel exportieren. Stable versteht Auswahlflächen-Metadaten nicht und kann deren Ränder wieder als Planlinks behandeln.
Zusätzlicher Pflichtcheck: node src/test-fan-planner.mjs (auch CI). Er prüft getrennte Gruppen, manuelle Zuordnung/feste Anker, begrenzte deterministische Suche, ungültige und kreuzende Speichen, Vorschau ohne Bestandsänderung, Ergänzen/Deduplizieren, Rollback, Flächenauswahl und Metadaten. Alle bestehenden Checks weiterhin ausführen. Die 26 neuen fan.*-Schlüssel sind DE/EN übersetzt; weitere Sprachen verwenden für diese Funktion vorläufig die englischen Texte. Bundle umfasst 310 Schlüssel.

Beta.17 korrigiert ausschließlich die Vorschau-Sichtbarkeit; Generator und Übernahmeschutz unverändert. Regressionstest test-fan-planner prüft sichtbare Felder trotz alter kreuzender Zeichnung und weiterhin gesperrte Übernahme. AGENTS, Locale-/Exportstruktur und Stable-Dateien ohne erforderliche Änderung geprüft.

Beta.18: Regressionstest test-fan-planner prüft Laden/Quellenwechsel mit drei Portalen (automatischer Anker, ein Feld und Overlay), wiederholtes Laden und erklärten Fehler bei zwei Portalen. Bestehender begrenzter Generator bleibt erhalten. AGENTS, Locale-/Exportstruktur und Stable-Dateien konsistent und ohne Änderung.

Beta.19: native Fächerplanquelle statt Draw-Tools-Ergänzung. Pflichtcheck test-fan-planner erweitert um Übernahme ohne installiertes Draw Tools, unveränderte fremde Layer, nativen Scan mit ungeladenen Portalen, GUID-/Namenspersistenz, Feldzeichnung nach Reload, Speicherfehler und Entfernen. Kein Stable-Build erzeugen. AGENTS-Leitplanke aktualisiert; Locale-Schlüssel weiterhin 310 (fan.drawConflict entfällt, fan.clear neu).
