# Changelog

## 0.2.0-beta.7 — automatic key consumption for new plan links

### English
- Deduct one key at the confirmed target for a previously open plan link newly seen in Intel. Persist identities to prevent repeated charges across scans/refreshes; first-scan existing links are a baseline.
- Show review notes for missing direction/inventory or interrupted writes. Keep import/reset backups intact.

### Deutsch
- Bei neu in Intel erkanntem, zuvor offenem Planlink einen Key am bestätigten Ziel abziehen. Linkidentitäten verhindern wiederholte Abzüge bei Scans/Refreshs; beim ersten Scan vorhandene Links bilden den Ausgangsstand.
- Fehlende Richtung/Bestände oder Schreibunterbrechung als Prüfhinweis anzeigen. Import-/Reset-Sicherungen erhalten.

## 0.2.0-beta.6 — complete key inventory list

### English
- User confirmed screenshot/video recognition, selected-count writes and inventory display, plus reset/refresh/undo in IITC on 2026-10-06; test platform unspecified.
- Read-only total IITC Keys inventory in the panel and tasks, with name search, name/count sorting and portal/key totals. Includes stock outside the plan; unknown names remain marked.

### Deutsch
- Nutzer bestätigt Screenshot-/Videoerkennung, Übernahme und Bestandsanzeige sowie Reset/Refresh/Rücknahme in IITC am 2026-10-06; Testplattform nicht angegeben.
- Gesamten IITC-Keys-Bestand im Panel und unter Aufgaben lesend anzeigen, mit Namenssuche, Sortierung nach Name/Menge und Portal-/Keysummen. Planfremde Bestände einbeziehen; fehlende Namen kennzeichnen.

## 0.2.0-beta.5 — complete key reset and persistent undo

### English
- Confirm resetting every IITC Keys count, including portals outside the plan.
- Persist an undo backup before imports/resets; restore across refreshes with explicit conflict review. No inventory writes when backup storage fails.

### Deutsch
- Alle Bestände in IITC Keys nach Bestätigung zurücksetzen, auch außerhalb des Plans.
- Rücknahme vor Import/Reset speichern; nach Refresh mit ausdrücklicher Konfliktprüfung wiederherstellen. Kein Bestandsschreiben bei fehlgeschlagener Sicherung.

## 0.2.0-beta.4 — inventory-card OCR correction

### English
- Recognize counts below address rows and beside distances/icons; accept level badges
  without borrowing a count from the next card or accepting ambiguous title variants.
- Filter photographic backgrounds with bright/dim neutral-text passes for dark images.
  Preselect German OCR in the German UI. Real screenshot: five counts verified locally.

### Deutsch
- Mengen unter Adresszeilen und neben Entfernungen/Icons erkennen; Levelziffern
  berücksichtigen, ohne Mengen der nächsten Karte oder mehrdeutige Namen zu übernehmen.
- Fotohintergründe bei dunklen Bildern mit heller/dunkler Schriftmaske ausblenden.
  Deutsche OCR bei deutscher UI vorauswählen. Fünf Mengen im echten Screenshot lokal geprüft.


## 0.2.0-beta.3 — Keys integration and reviewed media import draft

### English
- Use IITC Keys as the sole stock source, without migrating local inventory. Unknown
  stock stays unknown when Keys is absent; plan reset leaves Keys untouched.
- Add local screenshot/video OCR with conservative name matching, conflict handling,
  editable review table and explicit selected-count writes via Keys.addKey.
- Limit videos to two minutes and sample once per second. Real desktop/mobile OCR
  tests pending; import UI initially German/English (English fallback elsewhere).

### Deutsch
- IITC Keys als einzige Bestandsquelle, ohne Übernahme lokaler Bestände. Ohne Keys
  bleibt der Bestand unbekannt; Plan zurücksetzen verändert Keys nicht.
- Lokale Screenshot-/Videoerkennung mit vorsichtiger Namenszuordnung, Konfliktprüfung,
  editierbarer Prüftabelle und ausdrücklicher Übernahme ausgewählter Mengen ergänzt.
- Videos bis zwei Minuten, ein Bild pro Sekunde. Echte Desktop-/Mobile-OCR-Tests
  stehen aus; Importtexte zunächst Deutsch/Englisch mit englischem Fallback.


## 0.2.0-beta.2 — compact tasks, practical test pending

### English

- Replaced task cards with a compact table of position, portal, owned/needed
  keys, assigned links and blockers, inspired by Fan Fields 3’s row/detail
  layout. Kept direction, removal target, completion and navigation in
  expandable detail rows. Portal names open the existing IITC detail action.
- Highlighted next stop, missing keys and blockers; kept open rows and scroll
  position across updates. Route notes collapse; long names wrap on mobile.
  Routing, direction suggestions and manual/Intel separation stay unchanged.

### Deutsch

- Aufgabenkarten durch kompakte Tabelle aus Position, Portal, vorhandenen/
  benötigten Keys, zugeordneten Links und Blockern ersetzt, nach dem
  Zeilen-/Detailprinzip von Fan Fields 3. Richtung, Abbauziel, Erledigung und
  Navigation bleiben in aufklappbaren Detailzeilen. Portalnamen öffnen IITC.
- Nächsten Stopp, Keymangel und Blocker hervorgehoben; offene Zeilen und
  Scrollposition bei Updates erhalten. Routenhinweise sind einklappbar, lange
  Namen brechen mobil um. Routing und manuelle/Intel-Zustände unverändert.

## 0.2.0-beta.1 — feature release, practical test in progress

### English

- Renumbered the tasks, link-direction and integrated routing feature release
  from `0.1.56-beta.4` to `0.2.0-beta.1`, targeting stable `0.2.0`. Runtime
  behavior and saved data remain unchanged; stable remains `0.1.55`.
- Reserved minor versions for new functional areas and substantial reworks,
  patch versions for fixes and small adjustments, and beta counters for test
  iterations. Historical beta entries keep their original versions.
- The user confirmed portal details and refresh behavior in practical IITC
  testing; complete feature and mobile verification remains pending.

### Deutsch

- Aufgaben, Wurfrichtung und gemeinsame Routenplanung von `0.1.56-beta.4`
  auf `0.2.0-beta.1` umnummeriert; Zielrelease ist `0.2.0`. Verhalten und
  gespeicherte Daten unverändert, Stable bleibt `0.1.55`.
- Minor-Versionen für neue Funktionsbereiche und grundlegende Überarbeitungen,
  Patch-Versionen für Korrekturen und kleine Anpassungen sowie Beta-Zähler für
  Testiterationen festgelegt. Historische Beta-Einträge bleiben erhalten.
- Nutzer hat Portaldetails und Refresh-Verhalten in IITC bestätigt; vollständige
  Feature- und Mobile-Prüfung steht noch aus.

## 0.1.56-beta.4 — development, practical IITC test pending

### English

- Fixed named tasks opening title-less portal summaries as `null`: prefer
  IITC’s normal GUID-based selection/loading pipeline on current and older
  versions so missing or stale details can load. Direct rendering is only a
  compatibility fallback for data with a valid detail title. Added regression
  coverage for a named task whose IITC summary still has a null title.

### Deutsch

- Benannte Aufgaben öffneten unvollständige Portaldaten als `null`. Jetzt
  aktuellen und älteren IITC-Versionen die exakte GUID über den normalen
  Auswahl-/Ladeablauf übergeben, damit fehlende oder veraltete Details laden.
  Direkte Darstellung bleibt nur als Kompatibilitätsfallback mit gültigem
  Detailtitel erhalten. Regressionstest für benannte Aufgabe mit leerem
  IITC-Detailtitel ergänzt.

## 0.1.56-beta.3 — development, practical IITC test pending

### English

- Fixed **Show details** on older IITC versions without the modern marker and
  sidebar APIs by using the exact GUID with the legacy detail renderer. This
  explicit click may load details through IITC without moving the map.
- Replaced unrelated previous sidebar content with an availability message
  when the requested portal cannot be displayed. Added compatibility tests.

### Deutsch

- **Details anzeigen** für ältere IITC-Versionen ohne moderne Marker- und
  Seitenleisten-APIs korrigiert: die ältere Detailfunktion erhält die exakte
  GUID. Dieser ausdrückliche Klick darf über IITC Details nachladen, ohne
  die Karte zu bewegen.
- Bei nicht anzeigbarem Portal die alte fremde Seitenleistenanzeige durch eine
  Verfügbarkeitsmeldung ersetzt und Kompatibilitätstests ergänzt.

## 0.1.56-beta.2 — development, practical IITC test pending

### English

- Preselect a labeled link-direction suggestion based on the first planned
  endpoint visit. Accept it with one click or choose the opposite direction.
  Confirmed directions persist; unconfirmed suggestions leave key estimates
  and exports unchanged. Pure blocker visits do not determine the suggestion.

### Deutsch

- Gekennzeichneten Wurfrichtungsvorschlag anhand des ersten Planendportalbesuchs
  vorausgewählt. Mit einem Klick übernehmen oder Gegenrichtung wählen.
  Bestätigte Richtungen bleiben bestehen; unbestätigte Vorschläge verändern
  weder Keyschätzung noch Export. Reine Blockerbesuche bestimmen ihn nicht.

## 0.1.56-beta.1 — development, practical IITC test pending

### English

- Added an integrated Tasks dialog with numbered portal visits, shared blocker
  removal tasks, affected planned links, key editing, direction controls and
  existing portal actions. Manual completion stays distinct from Intel data.
- Inserted each required blocker before its first dependent link task, choosing
  a removal endpoint and stop position with low extra straight-line distance.
  Bundled work at existing visits while retaining necessary later revisits.
- Added explicit per-link direction and destination-only key demand; unknown
  directions retain the former estimate. Added language-neutral `plannedLinks`
  to JSON exports. Reused existing persisted keys and portal completion.
- Unified the tasks, next target, map highlighting and remaining-route estimate.
  Kept proposals stable for movements up to 100 m and respected saved order.
- Added ten-language task text, work-plan regression tests and a separate beta
  build/update channel. Stable 0.1.55 files remain unchanged. Walk Sim and
  capture/link-limit/under-field validation are not part of this beta.

### Deutsch

- Gemeinsame Aufgabenansicht mit nummerierten Portalbesuchen, eindeutigen
  Blocker-Abbauaufgaben, betroffenen Planlinks, Keyeingabe, Richtungswahl und
  vorhandenen Portalaktionen ergänzt. Manuelle Erledigung bleibt von Intel-Daten
  getrennt.
- Jeden benötigten Blocker vor dem ersten abhängigen Linkauftrag mit geringem
  zusätzlichem Luftlinienweg eingeordnet. Arbeiten an vorhandenen Besuchen
  gebündelt und notwendige spätere Wiederbesuche beibehalten.
- Ausdrückliche Wurfrichtung und Keybedarf nur am Ziel eingeführt; offene
  Richtungen behalten die bisherige Schätzung. Sprachneutrale `plannedLinks`
  im JSON-Export ergänzt. Bestehende Keys und Portal-Erledigung weiterverwendet.
- Aufgaben, nächstes Ziel, Kartenhervorhebung und Reststrecke vereinheitlicht;
  Vorschläge bei Bewegungen bis 100 m stabil gehalten und gespeicherte
  Reihenfolge respektiert.
- Aufgabentexte in zehn Sprachen, Regressionstests und eigenen Beta-Build mit
  getrenntem Updatekanal ergänzt. Stable 0.1.55 bleibt unverändert. Walk Sim
  sowie Eroberungs-, Linklimit- und Unter-Feld-Prüfung sind noch nicht enthalten.

## Branch workflow (2026-10-05)

### English

- Established `main` for stable releases, `beta` for integrated development,
  and `feature/link-direction` for the planned direction work. Documented
  feature, release, hotfix and maintenance pull-request flows.
- Added automated repository checks and distribution isolation by branch.
  Plugin version, runtime and published stable files remain unchanged; a
  separately installable beta build is not yet published.

### Deutsch

- `main` für stabile Releases, `beta` für integrierte Entwicklung und
  `feature/link-direction` für die geplante Wurfrichtung eingerichtet. Abläufe
  für Feature-, Release-, Hotfix- und Pflege-Pull-Requests dokumentiert.
- Automatische Repository-Prüfungen und Trennung der Distribution nach Branch
  ergänzt. Pluginversion, Laufzeit und veröffentlichte stabile Dateien bleiben
  unverändert; ein gesondert installierbarer Beta-Build ist noch nicht verfügbar.

## Repository sponsorship (2026-09-30)

### English

- Enabled GitHub Sponsors for emgeka through `.github/FUNDING.yml` and linked the public Sponsors profile in both README languages. Plugin version and runtime are unchanged.

### Deutsch

- GitHub Sponsors für emgeka über `.github/FUNDING.yml` aktiviert und das öffentliche Sponsors-Profil in beiden README-Sprachen verlinkt. Pluginversion und Laufzeitverhalten bleiben unverändert.

## 0.1.55

### English

- Distinguished a final blocker check that already ran but ended incomplete
  from one that is still pending, so capped or timed-out checks no longer look
  as though they were never started.
- Practically verified the incomplete final-check status in IITC before
  publication.

### Deutsch

- Einen bereits ausgeführten, aber unvollständig beendeten finalen
  Blockercheck von einem noch ausstehenden Check unterschieden, damit begrenzte
  oder abgebrochene Läufe nicht mehr wie nie gestartete Checks erscheinen.
- Die Statusanzeige unvollständiger Finalchecks vor der Veröffentlichung
  praktisch in IITC verifiziert.

## 0.1.54

### English

- Reset the portal-list filter to **All** after every new scan so a persisted
  or accidental filter selection cannot hide freshly recognized plan portals,
  particularly in the mobile layout.
- Made **Open** and the automatic work route exclude portals whose planned
  links already exist completely; such portals remain visible under **All**.
- Practically verified the changed scan and filter behavior in IITC before
  publication.

### Deutsch

- Den Portallistenfilter nach jedem neuen Scan auf **Alle** zurückgesetzt,
  damit eine gespeicherte oder versehentliche Filterauswahl frisch erkannte
  Planportale insbesondere in der mobilen Ansicht nicht versteckt.
- **Offen** und die automatische Arbeitsroute um Portale bereinigt, deren
  Planlinks bereits vollständig vorhanden sind; unter **Alle** bleiben diese
  Portale sichtbar.
- Das geänderte Scan- und Filterverhalten vor der Veröffentlichung praktisch
  in IITC verifiziert.

## 0.1.53

### English

- Added a quiet settling period after each final-check map refresh and restart
  it for late IITC link-layer events, preventing the first run from advancing
  before newly loaded blocker links are available.
- Started automatic missing-name loading again after final-check blocker
  recomputation so newly recognized blocker endpoints do not require a manual
  **Load names** action.
- Unified automatic missing-name loading after a scan so recognized blocker
  endpoints are handled together with plan portals.
- Kept **Load names** as an explicit retry for portal details that IITC could
  not provide during the automatic pass.
- Extended **Load names** to include unique endpoint portals of recognized
  blocker links in addition to plan portals.
- Propagated every loaded blocker-portal name to all matching blocker
  occurrences so the worklist, actions, map presentation, and exports use the
  same resolved name without duplicate detail requests.
- Published after practical IITC verification and confirmation of the final
  behavior.

### Deutsch

- Nach jeder Kartenladung des Finalchecks eine kurze Ruhephase ergänzt und bei
  verspäteten IITC-Linkereignissen neu gestartet, damit der erste Durchlauf
  nicht vor den neu geladenen Blocklinks zur nächsten Ansicht wechselt.
- Das automatische Nachladen fehlender Namen nach der Blocker-Neuberechnung
  des Finalchecks erneut gestartet, sodass neu erkannte Blocker-Endportale
  keinen manuellen Klick auf **Namen laden** benötigen.
- Das automatische Nachladen fehlender Namen nach einem Scan vereinheitlicht,
  sodass erkannte Blocker-Endportale gemeinsam mit Planportalen verarbeitet
  werden.
- **Namen laden** als ausdrückliche Wiederholungsmöglichkeit für Portaldetails
  beibehalten, die IITC beim automatischen Durchlauf nicht liefern konnte.
- **Namen laden** um die eindeutigen Endportale erkannter Blocklinks erweitert;
  neben Planportalen werden nun auch deren fehlende Namen nachgeladen.
- Jeden geladenen Blocker-Portalnamen in alle passenden Blocker-Vorkommen
  übernommen, damit Arbeitsliste, Aktionen, Kartendarstellung und Exporte ohne
  doppelte Detailanfragen denselben aufgelösten Namen verwenden.
- Nach praktischer Prüfung in IITC und Bestätigung des abschließenden
  Verhaltens veröffentlicht.

## 0.1.50

### English

- Added an explicit bounded **Final check** for still-unconfirmed plan links.
  It uses IITC's normal map loading at the first zoom without a link-length
  filter, accumulates links across at most twelve targeted views, and restores
  the original map view afterwards without issuing direct tile or portal
  requests.
- Excluded already recognized existing plan links from final-scan checkpoints;
  a fully existing plan needs no final scan and causes no map movement.
- Added visible pending, progress, complete, and incomplete coverage states.
  Capped or timed-out scans remain explicitly incomplete and never imply an
  all-clear.
- Persisted progress and accumulated links after every checked view. A paused
  check can continue at its next open view for the unchanged plan, including
  after reloading IITC; changed plans discard stale progress.
- Replaced the ambiguous zero-key map badge `0K` with `K0` so it cannot be
  mistaken for “OK”.
- Replaced the standalone Waze button on blocker endpoint rows with the same
  localized **Show details** and **Actions** controls used by plan portals;
  the shared actions dialog still provides Waze and the other navigation
  targets.
- Published after the complete final-check workflow was practically verified
  in IITC and confirmed to behave as intended.

### Deutsch

- Einen ausdrücklichen begrenzten **Finalcheck** für noch nicht bestätigte
  Planlinks ergänzt. Er verwendet IITCs normale Kartenladung auf der ersten
  Zoomstufe ohne Linklängenfilter, sammelt Links über höchstens zwölf gezielte
  Ansichten und stellt danach die ursprüngliche Kartenansicht wieder her, ohne
  direkte Tile- oder Portalabfragen auszuführen.
- Bereits erkannte vorhandene Planlinks von den Prüfansichten ausgeschlossen;
  ein vollständig vorhandener Plan benötigt keinen Finalcheck und verursacht
  keine Kartenbewegung.
- Sichtbare Zustände für ausstehende, laufende, vollständige und unvollständige
  Abdeckung ergänzt. Begrenzte oder zeitüberschrittene Läufe bleiben
  ausdrücklich unvollständig und vermitteln keine Entwarnung.
- Fortschritt und gesammelte Links nach jeder geprüften Ansicht dauerhaft
  gespeichert. Ein pausierter Check kann bei unverändertem Plan auch nach
  einem IITC-Neuladen an der nächsten offenen Ansicht fortgesetzt werden;
  geänderte Pläne verwerfen den veralteten Zwischenstand.
- Das missverständliche Null-Key-Kartenbadge `0K` durch `K0` ersetzt, damit es
  nicht wie „OK“ aussieht.
- Den einzelnen Waze-Button an Blocker-Endportalen durch dieselben
  lokalisierten Aktionen **Details anzeigen** und **Aktionen** wie bei
  Planportalen ersetzt; Waze und weitere Navigationsziele bleiben im
  gemeinsamen Aktionsdialog verfügbar.
- Nach vollständiger praktischer Prüfung des Finalcheck-Ablaufs in IITC und
  Bestätigung des gewünschten Verhaltens veröffentlicht.

## 0.1.49

### English

- Added an explicit localized **Show details** action for plan portals that
  renders already loaded IITC portal details without requesting data or moving,
  centering, or zooming the map; portal names remain plain text.
- Added delayed viewport correction after expanding or collapsing portal rows,
  the blocker section, readiness check, and **More**, moving the draggable panel
  only when its changed size would leave it outside the visible viewport.
- Stopped force-enabling the Anchor Planner layer during setup so IITC's saved
  layer visibility is respected across reloads.
- Replaced the ambiguous completed-portal `OK` map badge with a larger check
  mark so it cannot be mistaken for the existing-link `0K` status.
- Practically verified portal details, panel correction, and disabled/enabled
  layer persistence in IITC before publishing the stable release.

### Deutsch

- Eine ausdrückliche lokalisierte Aktion **Details anzeigen** für Planportale
  ergänzt, die bereits geladene IITC-Portaldetails ohne Datenabfrage und ohne
  Zentrieren, Verschieben oder Zoomen der Karte darstellt; Portalnamen bleiben
  normaler Text.
- Eine verzögerte Viewport-Korrektur nach dem Auf- und Zuklappen von
  Portalzeilen, Blockerbereich, Einsatzcheck und **Mehr** ergänzt; das
  verschiebbare Panel wird nur dann bewegt, wenn seine geänderte Größe es aus
  dem sichtbaren Viewport ragen lässt.
- Die erzwungene Aktivierung des Anchor-Planner-Layers beim Start entfernt,
  sodass IITCs gespeicherte Layer-Sichtbarkeit über Neuladevorgänge hinweg
  respektiert wird.
- Das missverständliche Kartenbadge `OK` für erledigte Portale durch ein
  größeres Häkchen ersetzt, damit es nicht wie der Status `0K` für vorhandene
  Links aussieht.
- Portalansicht, Panelkorrektur sowie die Persistenz des deaktivierten und
  aktivierten Layers vor der stabilen Veröffentlichung praktisch in IITC
  bestätigt.

## 0.1.48

### English

- Added the dedicated Anchor Planner icon to the userscript metadata through
  `@icon` and `@icon64` so the IITC Community Plugins catalog can obtain it
  from the plugin repository without changing runtime behavior.

### Deutsch

- Das eigene Anchor-Planner-Icon über `@icon` und `@icon64` in die
  Userscript-Metadaten aufgenommen, damit der IITC-Community-Plugins-Katalog
  es ohne Änderung des Laufzeitverhaltens aus dem Plugin-Repository übernehmen
  kann.

## 0.1.47

### English

- Made the Anchor Planner panel draggable by its header with Pointer Events
  and mouse/touch fallbacks while keeping the collapse button and all content
  outside the handle unchanged.
- Constrained the complete panel to the visible viewport, persisted its
  position, and added correction after panel renders, resizing, and display
  orientation changes.
- Added automated position, boundary, persistence, and handle-scope checks and
  practically confirmed the draggable panel in IITC before the stable release.

### Deutsch

- Das Anchor-Planner-Panel über seinen Kopf mit Pointer Events sowie Maus- und
  Touch-Fallbacks verschiebbar gemacht; Einklappbutton und Inhalte außerhalb
  des Griffs bleiben unverändert bedienbar.
- Das vollständige Panel auf den sichtbaren Viewport begrenzt, seine Position
  dauerhaft gespeichert und nach Panel-Rendern, Größen- sowie
  Orientierungswechseln automatisch korrigiert.
- Automatisierte Prüfungen für Position, Begrenzung, Speicherung und Umfang des
  Drag-Griffs ergänzt und das verschiebbare Panel vor dem stabilen Release
  praktisch in IITC bestätigt.

## 0.1.46

### English

- Converted the interface, status messages, diagnostics, dialogs, map hints,
  and text exports to semantic translation keys.
- Added ten bundled languages: German, English, Spanish, French, Italian,
  Japanese, Polish, Brazilian Portuguese, Russian, and Simplified Chinese.
- Added automatic browser/page language detection, English fallback, and a
  persistent manual selection under **More → Language**.
- Separated editable locale files under `src/locales/` from the userscript and
  added build-time checks for identical keys and placeholders as well as
  missing and unused translations; no locale files are loaded from the
  internet at runtime.
- Built the manual language list dynamically from bundled locales so that
  additional complete locale files require no language-specific runtime
  changes.
- Kept JSON field names and structure language-neutral and automatically
  verified detection, fallback, persistence, plural forms, text export, and
  the JSON schema.
- Practically tested language selection and the localized interface with
  desktop IITC and IITC Mobile.

### Deutsch

- Oberfläche, Statusmeldungen, Diagnosen, Dialoge, Kartenhinweise und
  Text-Exporte vollständig auf semantische Übersetzungsschlüssel umgestellt.
- Zehn gebündelte Sprachen ergänzt: Deutsch, Englisch, Spanisch, Französisch,
  Italienisch, Japanisch, Polnisch, brasilianisches Portugiesisch, Russisch
  und vereinfachtes Chinesisch.
- Automatische Erkennung über Browser- beziehungsweise Seitensprache,
  Englisch-Fallback und dauerhaft gespeicherte manuelle Auswahl unter
  **Mehr → Sprache** ergänzt.
- Sprachdateien unter `src/locales/` vom Userscript getrennt und einen Build
  mit Prüfungen auf identische Schlüssel, Platzhalter, fehlende sowie
  ungenutzte Übersetzungen ergänzt; zur Laufzeit werden keine Sprachdateien
  aus dem Internet geladen.
- Manuelle Sprachliste dynamisch aus den gebündelten Locales erzeugt, sodass
  weitere vollständige Sprachdateien ohne sprachspezifische Laufzeitänderung
  aufgenommen werden können.
- JSON-Feldnamen und JSON-Struktur sprachneutral beibehalten sowie Erkennung,
  Fallback, Speicherung, Pluralformen, Text-Export und JSON-Schema automatisiert
  geprüft.
- Sprachwahl und übersetzte Oberfläche praktisch auf Desktop-IITC und IITC
  Mobile geprüft.

## 0.1.45

- Hauptansicht auf Scan, Einsatzcheck, nächstes Ziel, Filter, Blocker und
  eingeklappte Portalzeilen verdichtet; weitere Aktionen, Toleranz und
  Scandetails unter **Mehr** gebündelt.
- Portalzeilen zeigen Status, Namen und Keys bereits im kompakten Kopf und
  behalten ihren geöffneten Zustand bei Panelaktualisierungen.
- Entfernung, Reststrecke und offene Zielzahl in einer Zielzeile
  zusammengeführt sowie Scan- und Einsatzcheckdetails gekürzt.
- Redundante Blockerhinweise, Fortschrittsangaben und die Listenabschlusszeile
  entfernt; Fehlermeldungen öffnen den Bereich **Mehr** automatisch.
- Kompakte Darstellung schrittweise in Desktop-IITC und IITC Mobile praktisch
  geprüft.

## 0.1.44

- Kompakten Blockerbereich ergänzt, der Endportale nach der Zahl eindeutiger
  Blocklinks priorisiert und geeignete Endpunkte für die Arbeitsroute vormerken
  lässt.
- Offene Planportale und vorgemerkte Blocker-Portale werden ohne Duplikate zu
  einer standortabhängigen Arbeitsroute mit Zieltyp, Zielentfernung und
  geschätzter Reststrecke zusammengeführt.
- Alle erkannten betroffenen Planlinks, Blocklinks und Kreuzungspunkte werden
  automatisch in einer eigenen Kartenebene hervorgehoben; doppelte Blocklinks
  werden nur einmal gezeichnet.
- Blockeranzeige, gemeinsame Route und automatische Kartenhervorhebung wurden
  praktisch auf Desktop-IITC und IITC Mobile geprüft.

## 0.1.43

- Die Zielzeile zeigt bei gültigem IITC-Standort die gerundete
  Luftlinienentfernung zum nächsten offenen Portal.
- Die Entfernung aktualisiert sich bei Standortänderungen auch dann, wenn
  dasselbe Portal nächstes Ziel bleibt; ohne Standort bleibt sie ausgeblendet.
- Darstellung und Zielwechsel wurden in Desktop-IITC und IITC Mobile praktisch
  geprüft.

## 0.1.42

- Kompakten, aufklappbaren Einsatzcheck für offene Endpunkte, Blocker,
  fehlende Keys, fehlende Namen und begrenzte Linkabdeckung ergänzt.
- Bereits erkannte Blocker-Details aktualisieren verfügbare Portalnamen nach
  neu geladenen IITC-Kartendaten automatisch.
- Geöffnete Blocker-Details und der Einsatzcheck bleiben bei einer
  Panelaktualisierung geöffnet; Desktop und Mobil wurden praktisch geprüft.

## 0.1.41

- Stabile Update- und Downloadadresse für die Aufnahme in den IITC Community
  Plugins-Katalog ergänzt.
- Userscript-Metadaten um Projekt- und Supportlinks erweitert; das funktionale
  Pluginverhalten bleibt unverändert.

## 0.1.40

- Das nächste offene Portal wird dynamisch anhand des vom offiziellen
  IITC-User-Location-Plugin gemeldeten Standorts bestimmt.
- Eine optionale Luftlinien-Näherungsroute kann die Portalliste einmalig ab dem
  aktuellen Standort sortieren; die manuelle Reihenfolge bleibt weiter nutzbar.
- Bei fehlendem oder ungültigem IITC-Standort gilt weiterhin die gespeicherte
  Routenreihenfolge. Standortdaten werden weder gespeichert noch exportiert.

## 0.1.39

- Blockierende vorhandene Links lassen sich aus den Blocker-Details auf der
  Karte lokalisieren.
- Planlink, Blocklink und berechneter Kreuzungspunkt werden temporär
  hervorgehoben; ein neuer Scan setzt die Auswahl zurück.

## 0.1.38

- Text- und JSON-Export um konkrete Blocker-Details je betroffenem Planlink
  ergänzt.
- Blocker-Endpunkte verwenden geladene Portalnamen oder defensiv Koordinaten;
  der Text-Export weist auf die begrenzte IITC-Datenabdeckung hin.

## 0.1.37

- Kompakte, aufklappbare Blocker-Details ergänzen den betroffenen Planlink und
  die kreuzenden vorhandenen Links.
- Geladene Portalnamen werden defensiv aufgelöst; bei fehlenden Namen erscheinen
  Koordinaten statt technischer GUIDs sowie ein Hinweis auf die IITC-Datenabdeckung.

## 0.1.36

- Text-Export korrigiert: Die Anzahl nicht bestätigter Links verwendet jetzt
  den beim Scan berechneten Wert `unconfirmedLinks`.

## 0.1.35 – importierter Ausgangsstand

- Vorhandene Version unverändert als Codex-Projekt übernommen.
- Projektstruktur, Entwicklungsregeln, Architekturübersicht und Testszenarien
  ergänzt.

Frühere Einzeländerungen sind im Projekt nicht vollständig rekonstruiert und
werden deshalb nicht nachträglich erfunden.
