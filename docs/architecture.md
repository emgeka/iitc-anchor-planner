# Architekturübersicht 0.2.0-beta.33

Entwicklungsstand; Stable bleibt 0.1.55. Ankeranzahl und keybewusste Richtungen am
2026-10-22 vom Nutzer praktisch bestätigt, Plattform nicht genannt. Praxistest
der neuen Darstellung und getrennte Desktop-/Mobile-Abdeckung ausstehend.

Das Plugin ist ein einzelnes IITC-Userscript. Es verwendet den Namespace
`window.plugin.anchorPlanner`, intern abgekürzt als `ap`, und integriert sich
in Leaflet, Draw Tools sowie optionale IITC-Plugins defensiv.

## Zustände

### Dauerhafter Zustand

`ap.state` wird unter `plugin-anchor-planner-v1` in `localStorage` gespeichert:

- Scan-Toleranz und letzter Scanbericht,
- fortsetzbarer Zwischenstand eines pausierten finalen Blockerchecks unter
  `finalScanProgress`,
- Erledigt-Status, Notizen und Reihenfolge je Portal; Keybestände gehören ausschließlich dem IITC-Plugin Keys,
- vorgemerkte Blocker-Endportale für die gemeinsame Arbeitsroute,
- ausdrückliche Wurfrichtungen als Start-GUID unter `linkDirections`,
- planbezogene Endportalwahl und manuelle Blocker-Meldungen unter
  `blockerTasks` sowie Routenvorliebe `workRouteMode`,
- Panelzustand und aktiver Listenfilter,
- verschobene Panelposition als Viewport-Koordinaten,
- automatische oder manuell gewählte Oberflächensprache.

### Laufzeit-Zustand

`ap.runtime` enthält nur Daten der aktuellen IITC-Sitzung:

- berechnete Portalstatistiken und Planlinks,
- aktuell geladene vorhandene Links und Blocker,
- ungelöste Endpunkte und Diagnosekandidaten,
- Layer, automatische Blocker-Geometrien und geografische Leaflet-Statusmarker mit HTML-Fallback,
- verzögerten Panel-Refresh nach IITC-Kartendatenänderungen,
- verzögerte Positionskorrektur nach Größenänderungen des Panelinhalts,
- aktiver Zustand, Linkakkumulator und Fortschritt eines ausdrücklich
  gestarteten finalen Blockerchecks,
- zuletzt vom IITC-User-Location-Plugin gemeldeten Standort sowie das
  dynamische nächste Ziel.

Der Nutzerstandort gehört ausdrücklich nicht zu `ap.state` und erscheint in
keinem Export.

`workPlan` hält die gemeinsame Stoppreihenfolge und ihren ursprünglichen
Standort nur zur Laufzeit. `load` ergänzt neue Felder, ohne lokale Keybestände zu übernehmen; erhalten bleiben
Notizen und Erledigt-Markierungen. Stable ignoriert diese
zusätzlichen Felder; beim Rückwechsel gelten wieder dessen Keyberechnung und
Routenlogik. Eine parallele Installation beider Varianten ist nicht vorgesehen.

Der geöffnete Zustand von **Mehr**, Einsatzcheck, Blockerbereich und einzelnen
Portalzeilen wird vor einem Panel-Render aus dem vorhandenen DOM gelesen und
für den unmittelbar folgenden Render übernommen. Diese reinen
Darstellungszustände werden nicht dauerhaft gespeichert.

## Externe Datenquellen

| Quelle | Verwendung | Begrenzung |
| --- | --- | --- |
| Draw Tools / Auto Draw | primäre Plangeometrie | Plugin muss aktiv und Datenformat lesbar sein |
| `window.portals` | Portal-GUIDs, Positionen, Namen und Adressen | nur geladener Kartenausschnitt |
| Portal-Bookmarks | ergänzende Portalauflösung | Struktur unterscheidet sich zwischen Plugin-Versionen |
| `window.links` | vorhandene Planlinks und geometrische Blocker | nur aktuell geladene Intel-Links |
| IITC Portal Details | Nachladen fehlender Namen | asynchron und vom IITC-Ladezustand abhängig |
| IITC User Location | dynamische Zielwahl und optionale Routensortierung | optional; initiales `0/0` wird verworfen |

## Funktionsbereiche

| Bereich | Zentrale Funktionen |
| --- | --- |
| Portal- und Namensdaten | `getLoadedPortals`, `getPortalTitleFromMarker`, `collectMissingPortalNameGuids`, `updatePortalTitle`, `queueMissingNameRefresh`, `requestPortalDetails`, `refreshMissingNames`, `showPortalDetails` |
| Bookmarks | `collectPortalBookmarks`, `mergePortalSources` |
| Draw Tools | `collectDrawToolLayers`, `collectDrawToolPointLayers`, `extractSegments` |
| Endpunktdiagnose | `findNearestPortalInfo`, `portalCandidatesForEndpoint`, `drawToolPointCandidatesForEndpoint` |
| Linkanalyse | `collectExistingLinkIds`, `properSegmentsIntersect`, `findBlockersForPlannedLink`, `applyExistingLinkCoverage` |
| Finaler Blockercheck | `getFinalScanZoom`, `buildFinalScanCheckpoints`, `startFinalScan`, `visitFinalScanCheckpoint`, `scheduleFinalScanStepCompletion`, `onFinalScanLinkAdded`, `captureFinalScanLinks`, `finishFinalScan` |
| Planberechnung | `scan`, `getStatus`, `isOpenPlanPortal`, `resetListFilterAfterScan`, `filterCounts`, `getReadiness`, `sortedStats` |
| Route und Standort | `rememberUserLocation`, `getCurrentUserLocation`, `getBlockerWorklist`, `getRouteTasks`, `getNextRouteTarget`, `getRouteEstimate`, `distanceToPortal`, `formatDistance`, `sortRouteFromUserLocation` |
| Karte und Panel | `renderOverlays`, `renderPanel`, `setupPanelDragging`, `correctPanelPosition`, `schedulePanelPositionCorrection`, `scheduleMapDataPanelRefresh`, `showPortalActions` |
| Export | `buildBlockerExport`, `exportData`, `buildPlanText`, `showExport` |
| Sprache | `findAvailableLanguage`, `detectLanguage`, `getLanguage`, `languageOptionsHtml`, `t`, `tp` |

## Sprach-Datenfluss

Die bearbeitbaren Übersetzungen liegen als JSON-Dateien unter `src/locales/`.
Jede Sprache besitzt dieselben 341 semantischen Schlüssel; Platzhalter wie
`{count}`, `{title}` oder `{distance}` müssen pro Schlüssel identisch sein.
`language.name` enthält den Eigennamen für die dynamisch erzeugte Auswahlliste.

`src/build-locales.mjs` verwendet Englisch als verpflichtende Referenz und
Fallbacksprache. Das Skript prüft Dateiformat, nicht leere Texte, identische
Schlüssel, identische Platzhalter, fehlende Laufzeitreferenzen und ungenutzte
Übersetzungen. Anschließend ersetzt es ausschließlich den markierten
`ap.LOCALES`-Block im Userscript. Alle Sprachdaten werden damit vor der
Freigabe eingebettet; zur Laufzeit gibt es keinen Netzwerkabruf.

`detectLanguage` wertet die Browser-Sprachen und anschließend die Seitensprache
aus. `findAvailableLanguage` normalisiert Groß-/Kleinschreibung, Unterstriche
und regionale Codes. Eine gültige gespeicherte manuelle Auswahl hat Vorrang;
sonst gilt die automatische Erkennung und zuletzt Englisch. `t` ersetzt
benannte Platzhalter, `tp` wählt die kompakten Varianten `one` und `other`.

Sprachabhängige Bezeichnungen werden nur für sichtbare Texte und Text-Exporte
verwendet. Der JSON-Export behält seine bisherigen Feldnamen und seine Struktur;
die gewählte Sprache wird nicht als zusätzliches Exportfeld ausgegeben.

## Datenfluss eines Scans

1. Draw-Tools-Layer und separate Punktobjekte werden gesammelt.
2. Geladene Portale und Portal-Bookmarks werden defensiv zu einer
   Kandidatenmenge zusammengeführt.
3. Segmentendpunkte werden innerhalb der eingestellten Toleranz aufgelöst;
   sonst entstehen offene Endpunkte mit Diagnosekandidaten.
4. Doppelte oder auf dasselbe Portal fallende Segmente werden verworfen.
5. Geladene Intel-Links werden normalisiert und mit dem Plan verglichen.
6. Noch nicht vorhandene Planlinks werden geometrisch auf echte Kreuzungen
   mit vorhandenen Links geprüft.
7. `scan` erzeugt Portalstatistiken, Schlüsselbedarf, Linkzustände,
   Blockerlisten und den Scanbericht.
8. Solange nicht bestätigte Planlinks verbleiben, markiert der Einsatzcheck
   den finalen Blockercheck als ausstehend.
9. Panel, Kartenlayer, Einsatzcheck und Export verwenden denselben
   Laufzeitstand; fehlende Portalnamen werden anschließend asynchron
   nachgeladen.

## Datenfluss des finalen Blockerchecks

Der Finalcheck wird nur durch die Nutzeraktion **Finalcheck** gestartet und
berücksichtigt ausschließlich Planlinks, die der normale Scan noch nicht als
vorhanden erkannt hat. `getFinalScanZoom` liest defensiv IITCs
`ZOOM_TO_LINK_LENGTH` und wählt die erste Zoomstufe ohne Linklängenfilter
(gegenwärtig typischerweise Zoom 13). `buildFinalScanCheckpoints` verteilt
Ansichten entlang dieser Planlinks, entfernt Überschneidungen und begrenzt den
Lauf auf zwölf Ansichten.

Jede Ansicht wird mit IITCs normalem `map.setView` geladen. Die Hooks
`mapDataRefreshStart` und `mapDataRefreshEnd` takten den Lauf. Nach dem
Ladeende wartet `scheduleFinalScanStepCompletion` eine Sekunde; jedes
verspätete `linkAdded`-Ereignis startet diese Ruhephase erneut.
`captureFinalScanLinks` akkumuliert danach die jeweils in `window.links`
vorhandenen Links, weil IITC Links außerhalb der aktuellen Ansicht wieder
entfernt. Es gibt keine direkten Tile- oder Portalabfragen. Nach dem letzten
Schritt berechnet `applyExistingLinkCoverage` vorhandene Planlinks, Blocker und
Schlüsselbedarf neu und stößt für neu erkannte Blocker-Endportale
`queueMissingNameRefresh` an. `finishFinalScan` stellt Mittelpunkt und
Zoomstufe der ursprünglichen Kartenansicht wieder her. Mehr als zwölf
erforderliche Ansichten oder eine Zeitüberschreitung führen zu einem
ausdrücklich unvollständigen Ergebnis. `finalScanAt` unterscheidet diesen
bereits ausgeführten, aber unvollständigen Lauf im Einsatzcheck von einem noch
nie gestarteten und damit ausstehenden Check. `persistFinalScanProgress` speichert
nach jedem abgeschlossenen Schritt Prüfpunkte, nächsten Index und den
deduplizierten Linkakkumulator. Eine Pause stellt die Ausgangsansicht sofort
wieder her. `canResumeFinalScan` erlaubt die Fortsetzung auch nach einem
IITC-Neuladen, sobald ein normaler Scan denselben Plan aus noch nicht
bestätigten Link-IDs wiederhergestellt hat; bei abweichender Plansignatur wird
der Zwischenstand verworfen.

## Standort- und Routenlogik

`setupUserLocationIntegration` bindet nur dann den Hook `pluginUserLocation`,
wenn das offizielle IITC-Plugin mit `getUser()` verfügbar ist. Ungültige Werte
und dessen initiale Position `0/0` werden ignoriert.

`getBlockerWorklist` verdichtet beide Endpunkte der beim letzten Scan erkannten
Blocklinks zu eindeutigen Portalzielen und sortiert sie primär nach der Zahl
eindeutiger Blocklinks. `isOpenPlanPortal` verlangt neben dem nicht erledigten
Zustand mindestens einen noch nicht vorhandenen Planlink; nur diese offenen
Planportale sind automatisch Arbeitsziele. `getWorkBlockers` verdichtet
Blocklinks anhand ihrer GUID beziehungsweise normalisierten Endpunkte und
behält ihre abhängigen Planlinks bei.

`buildWorkPlan` erzeugt zunächst eine Nearest-Neighbor-Reihenfolge der Planportale ab
Standort beziehungsweise deren gespeicherte Reihenfolge im manuellen Modus.
`buildWorkPlanForOrder` erzeugt daraus einen vollständigen Arbeitsplan.
Für jeden Blocker gilt der früheste Besuch seines betroffenen Wurfportals als
Einfügegrenze; bei offener Richtung konservativ der erste Endportalbesuch.
Vor dieser Grenze werden beide Endportale und alle Einfügepositionen anhand
zusätzlicher Luftlinienstrecke bewertet. Explizite Endportalwahl hat Vorrang;
eine einzelne bestehende Vormerkung wird ebenfalls berücksichtigt. Passende
vorhandene Stopps erhalten zusätzliche Abbauaufgaben. Ein separater früher
Abbaubesuch darf einen späteren Planportalbesuch nicht ersetzen.

Manuelle Erledigt-Meldungen überspringen den Abbauschritt, bleiben aber als
ungeprüfte Meldung sichtbar; `link.blocked`, Intel-Links und Einsatzcheck werden
dadurch nicht geändert. Meldungen und Endportalwahl gelten nur für dieselbe
gesamte Plangeometrie. Fehlende Abbaukoordinaten und erledigte Wurfportale mit
offenen Links erzeugen sichtbare nicht eingeplante Aufgaben.

Blocker-Endportale verwenden im Panel dieselben Aktionen wie Planportale.
`showPortalDetails` bleibt auf bereits geladene IITC-Portalobjekte beschränkt;
`showPortalActions` akzeptiert zusätzlich die aus der Blocker-Arbeitsliste
stammenden Titel und Koordinaten, sodass der gemeinsame Teilen- und
Navigationsdialog ohne Planportalstatistik funktioniert.

`getWorkPlan` hält den Vorschlag bei Standortbewegungen bis 100 m stabil.
Aufgaben-/Statusänderungen und größere Bewegungen im Standortmodus berechnen
ihn neu; manuelle Reihenfolge bleibt maßgeblich. `getRouteTasks` liest die
Stopps dieses Modells, `getNextRouteTarget` verwendet dessen ersten Stopp.
Die gespeicherte Planportalreihenfolge wird nur über die bisherigen
Sortier-/Pfeilaktionen geändert; diese aktivieren den manuellen Modus.

`distanceToPortal` verwendet dieselbe gültige IITC-Position für die
Luftlinienentfernung zum nächsten Ziel. `getRouteEstimate` berechnet ab diesem
Standort die Strecke entlang derselben Stoppreihenfolge einschließlich
gegebenenfalls notwendiger wiederholter Besuche.
`formatDistance` rundet unter einem Kilometer auf 10 Meter und darüber auf 0,1
Kilometer. Zielentfernung und Reststrecke gehören zum Laufzeitschlüssel der
Zielzeile, sodass sie sich auch bei unverändertem Zielportal aktualisieren.
Ohne gültigen Standort wird keine Entfernung angezeigt.

## Wurfrichtung und Aufgabenansicht

`getLinkDirection` akzeptiert nur eine ausdrücklich gespeicherte Start-GUID
der beiden Endportale. `recalculateDirectedKeys` zählt offene gerichtete Links
nur am Ziel, offene ungerichtete Links weiterhin an beiden Endportalen als
Schätzung und vorhandene Links gar nicht. Der Status vorhandener Links wird
über `openLinks` statt über Keybedarf null bestimmt, damit reine Wurfportale
nicht als bereits gebaut erscheinen.

`getSuggestedLinkDirection` verwendet gemeinsame Keykapazitäten für alle offenen
unbestätigten Links. Zuerst reserviert die Berechnung Ziel-Keys für bestätigte
offene Würfe; anschließend verteilt ein begrenztes Kapazitätsmatching die
verbleibenden bekannten Keys, einschließlich Umverteilung früherer Vorschläge.
Routenreihenfolge entscheidet zwischen ansonsten gleichwertigen Richtungen;
frühe reine Blockerbesuche zählen nicht als reguläre Planbesuche. Offene, nicht
erledigte Endportale aus `runtime.stats` bleiben als alternative Wurfquelle
verfügbar, auch wenn die bisherige Route sie als reine Empfangsportale ausgelassen
hat. Unbekannter Zielbestand wird von bekannt erschöpftem Bestand unterschieden.
Der Vorschlag ist im Auswahlfeld vorausgewählt und gekennzeichnet, wird aber erst
per Übernahme oder Richtungsänderung unter `linkDirections` gespeichert. Ohne
gültige offene Quelle bleibt die Richtung offen. Draw-Tools-Zeichenreihenfolge
und vorhandene Intel-Links erzeugen keine Vorschläge.

`taskListHtml`, `wireTaskList`, `showTaskList` und `refreshTaskList` verwenden
einen IITC-Dialog mit einer scrollbaren Tabelle. Pro Stopp enthält ein
`tbody` die Übersicht mit Position, Portal, Keybestand/-bedarf, zugeordneten
Linkaufträgen und benötigten Blockern sowie eine aufklappbare Detailzeile.
`setTaskStopExpanded` synchronisiert `hidden`, `aria-expanded` und Pfeil;
`refreshTaskList` bewahrt den Zustand anhand stabiler Stopp-IDs auch beim
Umsortieren. Portalnamen öffnen dieselbe GUID-basierte IITC-Detailaktion.
Das erste Arbeitsziel ist anfangs aufgeklappt. Fehlende Keys sind rot, Blocker
orange und das nächste Ziel blau markiert. Schmale Ansichten behalten die
Tabellenspalten mit umbrechenden Namen; Routenhinweise sind aufklappbar.
Richtung, Keybestand, Endportalwahl und manuelle Erledigung werden aus derselben
Datenbasis geändert; aufgeklappte Stopps und Scrollposition bleiben bei
Aktualisierungen erhalten. Sichtbare Texte sind vollständig gebündelt übersetzt.
JSON exportiert die neue sprachneutrale Liste `plannedLinks` mit `from`/`to`
(bei offener Richtung null); der Standort wird weiterhin nicht exportiert.
Die Vorschläge prüfen weder Eroberung noch ausgehende Linklimits oder Linken
unter Feldern. Die Planvorschau verwendet denselben Arbeitsplan als rein virtuelle Vorschau.

## Karten- und Blockerdarstellung

`renderOverlays` zeichnet alle beim letzten Scan erkannten betroffenen
Planlinks pink gestrichelt, eindeutige Blocklinks nach Fraktion (eigene gelb,
gegnerische rot, unbekannte grau) und berechnete
Kreuzungspunkte gelb. Eine eigene nicht interaktive Leaflet-Ebene mit höherem
Z-Index hält diese Geometrien oberhalb der normalen IITC-Links, aber unterhalb
der Portalmarker. Vorgemerkte zusätzliche Blocker-Portale erhalten Kartenringe;
das nächste Arbeitsziel wird stärker markiert.
Die geografisch verankerten Statusmarker kennzeichnen erledigte Portale mit `✓`; `K0` bleibt
ausschließlich Portalen vorbehalten, für die kein weiterer Key benötigt wird,
und kann optisch nicht als „OK“ gelesen werden.

Nach `mapDataRefreshEnd` rendert `scheduleMapDataPanelRefresh` das Panel
verzögert neu. Ein Kartenereignis-Fallback deckt IITC-Varianten ohne
zuverlässigen Hook ab. Dadurch erscheinen neu verfügbare Namen bereits
erkannter Blocker automatisch; die Blockergeometrie bleibt weiterhin die
Momentaufnahme des letzten Scans. Der geöffnete Blockerbereich und der
Einsatzcheck werden beim Rendern beibehalten.

`getReadiness` fasst offene Endpunkte, blockierte Planlinks und fehlende Keys
als nicht einsatzbereit zusammen. Fehlende Namen, nicht auswertbare vorhandene
Links oder ein fehlender Plan führen zu einem Prüfhinweis. Ein positiver Status
lautet bewusst **Bereit (geladener Stand)**, weil IITC nur geladene Links
bereitstellt.

`renderPanel` hält die Hauptansicht kompakt: **Scannen**, **Finalcheck** und
**Mehr** bilden die primären Aktionen; weitere Aktionen, Toleranz und Scandetails tragen die Klasse
`ap-secondary`. Portalzeilen sind aufklappbare `details`-Elemente, deren
Kopfzeile Status, Portalname und Keybestand enthält. Zielentfernung,
Restschätzung und Zielzahl werden gemeinsam in der nächsten Zielzeile
ausgegeben. Fehlermeldungen öffnen **Mehr** automatisch, damit sie sichtbar
bleiben.

Die Portalzeile bietet **Details anzeigen** als eigene Aktion. `showPortalDetails`
verwendet die exakte GUID und einen vorhandenen Marker aus `window.portals`.
Moderne IITC-Versionen nutzen `display.renderDetails(guid, true)`, ältere
Versionen `renderPortalDetails(guid)`. Dieser normale IITC-Ablauf wählt das
Portal aus und lädt fehlende oder veraltete Details nach; ein vorhandener
Aufgabenname beweist keine vollständigen IITC-Details. Die direkte
Seitenleistenfunktion umgeht das Nachladen und bleibt nur als Fallback für
Versionen ohne normale Detailfunktion verfügbar, wenn ein gültiger
Detailtitel vorhanden ist. Eine abweichende
Marker-GUID wird abgelehnt. Fehlende Marker oder Anzeige-APIs sowie Fehler
ersetzen den Inhalt von `portaldetails` durch die lokalisierte Meldung, damit
kein anderes Portal stehen bleibt. Kartenmethoden wie `setView`, `panTo` oder
`fitBounds` werden nicht aufgerufen.

`setupPanelDragging` registriert Pointer-Events oder, für ältere IITC-Mobile-
WebViews, getrennte Maus- und Touch-Fallbacks. Ein Drag beginnt nur innerhalb
von `.ap-head` und nicht auf dessen Einklappbutton; der restliche Panelinhalt
erhält keine Drag-Handler. Während der Bewegung begrenzt `setPanelPosition` die
fest positionierte Box mit einem kleinen Rand auf den sichtbaren Viewport. Die
Koordinaten werden am Drag-Ende in `ap.state.panelPosition` gespeichert.
`correctPanelPosition` wendet sie nach jedem Panel-Render sowie verzögert nach
`resize` und `orientationchange` erneut an, sodass auch eine geänderte Panel-
oder Viewportgröße das Fenster nicht unerreichbar macht.
`schedulePanelPositionCorrection` führt dieselbe Prüfung verzögert nach dem
Auf- und Zuklappen von **Mehr**, Einsatzcheck, Blockerbereich und Portalzeilen
aus. Befindet sich das Panel weiterhin vollständig im Viewport, bleiben seine
Koordinaten unverändert.

`setupLayer` registriert die Kartenebene mit dem bisherigen Standardwert,
überlässt das tatsächliche Hinzufügen aber IITCs persistierendem LayerChooser.
Anschließend wird `ap.runtime.enabled` aus dem wirklichen Kartenstatus gelesen;
eine zuvor deaktivierte Ebene wird beim Neuladen nicht wieder eingeschaltet.

## Release- und Community-Datenfluss

`main` bildet den stabilen Stand ab. `feature/<thema>` zweigt von `beta` ab;
`beta` integriert Entwicklungsänderungen für den Praxistest. Erst nach dessen
Bestätigung werden Release-Dateien auf `release/<version>` von `beta`
vorbereitet und per Pull Request nach `main` übernommen. Danach wird `main`
nach `beta` zurückgeführt. `docs/development.md` beschreibt auch Hotfixes,
Repository-Pflege und den getrennten Beta-Build.

`.github/workflows/checks.yml` führt vorhandene Syntax-, Locale-, Panel- und
Finalcheck-Prüfungen sowie `src/check-branch-policy.mjs` aus. Die Branch-Prüfung
vergleicht Entwicklungsdistributionen mit `origin/main` und verlangt auf
`main` beziehungsweise Release-Kandidaten bytegleiche aktuelle Quellen und
Distributionsdateien. Bei Pull Requests wird der Zielbranch geprüft. Der
Workflow erzeugt oder veröffentlicht keine Dateien. Die Branch-Einrichtung
selbst verändert keine Plugin-Laufzeit. Nun erzeugt
`src/build-beta.mjs` die beiden bytegleichen Dateien unter `beta-builds/`,
ändert ausschließlich Name und Update-/Download-Metadaten für den Beta-Kanal
und verlangt eine explizite Beta-Version. CI prüft zusätzlich diesen Build
und `src/test-work-plan.mjs`; Stable-Dateien bleiben eingefroren.

Die Entwicklungsfassung liegt unter `src/iitc-anchor-planner.user.js`; ihre
Sprachquellen liegen ergänzend unter `src/locales/` und werden vor jeder
Freigabe mit `src/build-locales.mjs` geprüft und eingebettet. Nach einem
bestätigten Praxistest wird
derselbe Inhalt in vier Distributionsdateien übernommen:

- `releases/iitc-anchor-planner-vX.Y.Z.user.js`,
- `releases/iitc-anchor-planner-vX.Y.Z.txt`,
- `releases/iitc-anchor-planner.user.js`,
- `releases/iitc-anchor-planner.txt`.

Die versionierten Dateien dokumentieren eine konkrete Freigabe. Die stabilen
Dateien ohne Versionsnummer bilden immer die zuletzt freigegebene Version und
sind das Ziel von `@updateURL` und `@downloadURL`.

Das unter `docs/media/anchor-planner-icon.svg` gepflegte Katalog-Icon wird über
`@icon` und `@icon64` im Userscript-Metablock veröffentlicht. Dadurch liest der
Community-Katalog die Icon-Angaben zusammen mit den übrigen Plugin-Metadaten
direkt aus der stabilen Userscript-Datei.

Der Community-Katalog liest die stabile Userscript-Datei über
`metadata/emgeka/anchor-planner.yml`. Beim Katalogbau ersetzt IITC-CE die
Update- und Downloadadressen im erzeugten Plugin durch seine eigenen Dateien
unter `dist/emgeka/`. Die Community-ID wird dabei aus Dateiname und
Autorenordner als `anchor-planner@emgeka` gebildet.

Der Katalogeintrag ergänzt die Laufzeit-Metadaten um die Abhängigkeit
`draw-tools@breunigs`, die Empfehlung `bookmarks@ZasoGD` und die Anti-Features
`scraper|export`. Diese Angaben verändern den Plugin-Code nicht.

Die Einstufung `scraper` bezieht sich technisch auf `refreshMissingNames` und
`requestPortalDetails`: `collectMissingPortalNameGuids` bildet eine eindeutige
Liste fehlender Namen aus Planportalen und Endportalen erkannter Blocklinks.
Diese werden nacheinander über `window.portalDetail.request` beziehungsweise
den defensiven IITC-Fallback `window.requestPortalDetail` angefragt.
`updatePortalTitle` übernimmt einen gefundenen Namen in die Planstatistik und
alle Vorkommen des Blocker-Endportals. `queueMissingNameRefresh` startet diesen
Ablauf nach jedem Scan automatisch, wenn in einer der beiden Portalgruppen ein
Name fehlt; **Namen laden** stößt denselben Ablauf als manuelle Wiederholung an.
Die Abfragen bleiben auf den aktuellen Plan und seine erkannten Blocker
begrenzt und laufen nicht unabhängig im Hintergrund. Es werden keine externen
Scraping-Dienste angesprochen. Die Einstufung `highLoad` ist daher für den
aktuellen Ablauf nicht gesetzt.

## Technische Grenzen

- Räumliche Nähe allein beweist keine Portalidentität.
- Portalnamen und Adressen können erst nach Detailabfragen verfügbar sein.
- IITC- und Drittplugin-Objekte unterscheiden sich je nach Version und
  Ladezustand; Extraktion und Fallbacks sind deshalb bewusst defensiv.
- Link- und Blockerprüfung ist auf die aktuell geladenen `window.links`
  begrenzt.
- Die Standortgenauigkeit wird durch IITC beziehungsweise das Endgerät
  bestimmt und vom Anchor Planner nicht eigenständig verifiziert.

## Keys-Adapter und OCR
getKeysPlugin/getOwnedKeys/setOwnedKeys lesen window.plugin.keys.keys und schreiben
über addKey mit der Differenz zum aktuellen Bestand. Fehlendes Plugin liefert null.
OwnedKeys bleibt ein JSON-Exportfeld (null bei unbekanntem Bestand), wird aber nicht
mehr in Anchor-Planner-Zustand gespeichert. Legacy-Felder werden ignoriert/entfernt.
pluginKeysUpdateKey/pluginKeysRefreshAll aktualisieren debounced Panel, Overlays und Aufgaben.
Der Adapter prüft das Plugin bei jedem Zugriff, unabhängig von der Boot-Reihenfolge.

showKeyImport startet scanKeyFiles mit einem Worker und temporären Blob-URLs.
Tesseract.js 5.1.1 wird erst beim Auslesen von jsDelivr geladen. Bilder werden auf
maximal 1080 Pixel Breite skaliert; Videos werden sekündlich gesampelt. parseKeyText
ordnet normalisierte eindeutige Namen und explizite xN/×N-Mengen zu. mergeKeyObservations
lässt Konflikte und nicht erkannte Portale offen. applyKeyImport validiert ausgewählte
Ganzzahlen und die GUID-/Namenssignatur des Plans vor dem Schreiben. OCR-Ergebnisse,
Dateien und Prüftabelle werden nicht gespeichert. Decoderfehler und Abbruch räumen
Blob-URLs und Worker auf; eine laufende OCR-Operation wird vor dem Abbruch beendet.

### OCR von Inventarkarten
keyOcrCanvases erkennt überwiegend dunkle Bilder (>55 % dunkle Pixel). maskKeyPixels
erzeugt zwei neutrale Schriftmasken (180/100), um weiße und abgedunkelte Schrift über
Portalbildern zu erkennen. Helle Bilder behalten die ursprüngliche Erkennung. Beide
Durchläufe verwenden denselben Worker; widersprüchliche Ergebnisse bleiben Konflikte.
parseKeyText prüft Varianten mit/ohne Level 1–8, lehnt dadurch mehrdeutige Namen ab
und erlaubt eine Postleitzahl-/Adresszeile oder Entfernung vor xN/×N. Andere unbekannte
Titel begrenzen die Suche. Bei deutscher UI ist die OCR-Sprache deu vorausgewählt.

### Persistente Key-Rücknahme
applyKeyBatch speichert GUID, Titel und Vorher-/Zielwerte vor allen addKey-Aufrufen unter STORAGE_KEY + `.keyUndo`, getrennt vom Planzustand. readKeyUndo validiert Struktur, doppelte GUIDs und sichere Ganzzahlen. Kein Ersatzbestand, kein Export, keine Migration. Ein No-op erhält die vorherige Sicherung. keyInventory/resetAllKeys erfassen alle positiven Keys-Einträge und prüfen die Bestandsliste vor dem Reset erneut. undoKeys prüft Sicherungs-ID und aktuelle ausgewählte Bestände; bereits wiederhergestellte Einträge entfallen, Konflikte bleiben offen. Bei Teilfehlern enthält die vorher gespeicherte Sicherung auch noch nicht ausgeführte Änderungen; diese erscheinen bei der Rücknahme als bereits wiederhergestellt. Erfolgreiche Rücknahmen werden aus der Sicherung entfernt. Scheitert deren abschließende Speicherung, bleibt die alte persistente Sicherung wiederholbar; restaurierte Werte werden beim nächsten Öffnen erkannt.

### Gesamtbestandsliste
keyInventoryRows verbindet alle positiven Einträge aus keyInventory mit Namen aus runtime.stats, geladenen Portalmarkern und collectPortalBookmarks; keine Inventarkopie oder Hintergrundabfrage. keyListHtml filtert nach Name, sortiert alphabetisch oder absteigend nach Menge und zeigt Gesamtsummen unabhängig vom Suchfilter. showKeyList erzeugt eine lesende Tabelle mit Such-/Sortierfeldern und Refresh; refreshKeys aktualisiert auch die offene Liste. refreshKeyList bewahrt Filter, Sortierung und Scrollposition. closeCallback verwirft ausschließlich die Referenz des geschlossenen Dialogs.

### Automatischer Keyverbrauch
updateKeyConsumption verarbeitet normale Scanergebnisse und applyExistingLinkCoverage. Ein separates `.keyUsage`-Journal enthält je Planlink open sowie Intel-GUID-Ereignisse mit baseline/attempt/booked/check/reviewed. Ein vorhandener Link ohne vorherige offene Beobachtung ist baseline. Bekannte GUIDs werden nie erneut gebucht; neue GUID nach offenem Zustand verbraucht bei bestätigter Richtung und positivem bekannten Bestand einen Key. attempt wird vor Keys.addKey gespeichert; ein abgebrochener/fehlgeschlagener Versuch verlangt Prüfung statt Retry. Dieses Journal überlebt Planreset, bleibt unabhängig von Imports/Resets und liefert keinen Ersatzbestand. taskLinkHtml zeigt Buchungs-/Prüfhinweise; markKeyUsageReviewed bestätigt nur die manuelle Bestandsprüfung. observeNewPlanLinks ergänzt nach Kartenrefresh positive neue Treffer in der laufenden Plangeometrie, ohne bereits erkannte Links wegen fehlender Kartenabdeckung wieder zu öffnen.

### Planvorschau (vormals Walk Sim)
createWalkSimulation erzeugt eingefrorene Frames aus getWorkPlan. Blocker werden vor den Links eines Stopps virtuell freigegeben; bestätigte Links mit bekannten positiven Keys verbrauchen ausschließlich lokale virtuelle Mengen. Planlinks mit existing bilden die Ausgangskanten. Ein abschließender simulierter Dreiecksrand erzeugt ein geometrisches Polygon; keine Feld-/Linklimitprüfung. showWalkSimulation verwaltet nur Laufzeitzustand und separaten Leaflet-Layer. seek/play rekonstruieren Frames deterministisch; Timer prüfen die Sessionidentität. stop entfernt Timer/Layer und restauriert die Kartenansicht. suppressWalkObservations schützt passive Intel-Erkennung und updateKeyConsumption bis zum nächsten expliziten Scan/Finalcheck, auch vor verspäteten Kartenereignissen der Vorschau. Keine direkte Übernahme von Fan-Fields-Quellcode.

renderWalkSimulation hält renderedIndex, pathLayers und head nur in der Session. Vorwärts aktualisiert es Weg/Marker und ergänzt nur neue Links/Dreiecke; gleiche Frames lassen den Layer und die Kamera unangetastet. Rückwärts wird der korrekte Präfix neu aufgebaut. Leaflet panTo erzwingt Animation auch außerhalb des Viewports (2,5–5 s abhängig von der Luftlinie, easeLinearity 0,5), außer bei prefers-reduced-motion. stop beendet auch laufende Kartenbewegung vor der Ansichtsrestaurierung. stepDelay wird je tatsächlich neu gerendertem Frame gesetzt: Bewegungsdauer = 2,5 + min(2,5, Luftlinie in Metern / 2000) Sekunden; Timer wartet Bewegungsdauer + 1,2 Sekunden, mindestens 3,7 Sekunden. Keine Bewegung/fehlende Koordinaten verwenden 3,7 Sekunden. Gleicher Frame bei Pause/Weiterlaufen bewahrt den Delay; manueller Wechsel verwirft den alten Timer.

### Gemeinsame Routenverbesserung
Im automatischen Modus mit gültigem GPS- oder Portalursprung bewertet buildWorkPlan die komplette Luftlinie ab Standort. Der ursprüngliche buildWorkPlanForOrder-Lauf ohne Suchziele bleibt Baseline. Kandidaten verändern Portalbesuchsreihenfolge durch Relokation und wählen automatische Blocker-Endpunkte auch gemeinsam für mehrere Blocker. Geteilte Endpunkte werden zusätzlich mit anderen Portalreihenfolgen kombiniert, damit eine Verbesserung nicht an getrennten lokalen Entscheidungen scheitert. Explizite Ziele/einzelne Vormerkungen bleiben geschützt.
refineBlockerStops verschiebt reine Abbau-Stopps innerhalb ihrer Abhängigkeiten und bündelt gleiche Portale, wenn die Gesamtstrecke sinkt; Planbesuche bleiben eigene Aktionen, Abbau am Wurfstopp erfolgt vor seinen Links. Höchstens zwei Durchgänge und 256 Positionsversuche je Kandidat. Linkaufträge werden für jede Portalreihenfolge neu zugewiesen; offene Richtung bindet Abbau konservativ an den frühesten Planbesuch.
Die Hauptsuche läuft höchstens vier Durchgänge und 8–160 Kandidaten, angepasst an Portal-/Blockerzahl. Nur Verbesserungen über 1 mm, keine höhere Zahl nicht eingeplanter Aufgaben; Cache identischer Kandidaten, deterministische Reihenfolge. Über 40 Planportale/80 Blocker, ohne gültigen Routenursprung, im manuellen Modus oder bei fehlender Plankoordinate keine gemeinsame Suche. Ausgangsvorschlag bleibt erhalten, wenn die Suche keinen besseren gültigen Kandidaten findet. optimization ist reine Laufzeitdiagnose mit evaluations/improved; keine Migration, gespeicherte Reihenfolge/Ziele unverändert.

### Fester Portalstart und Planvorschau
workRouteMode ergänzt portal; workRouteStart speichert ausschließlich eine Planportal-GUID. load validiert die Typen und erhält alte location/manual-Zustände. getWorkRouteLocation löst den Punkt aus runtime.stats auf: GPS im Portalmodus ignorieren, fehlendes Startportal liefert null statt Ersatzkoordinate. build/getWorkPlan, getRouteEstimate und createWalkSimulation verwenden denselben Ursprung. Die Cache-Signatur enthält Start-GUID; GPS-Bewegung verändert einen Portalursprung nicht.
addWorkRouteStart ergänzt bei Bedarf einen ersten Routenstart ohne Würfe/Abbau/Erledigung. Der reguläre Planbesuch mit Linkaufgaben bleibt nach erforderlichem Abbau erhalten; gleicher erster Portalstopp wird nicht dupliziert. Keine noch offenen Aufgaben erzeugt keinen künstlichen neuen Auftrag. start:<guid> unterscheidet den Routenstart von Plan-/Blockerbesuchen.
startWorkRouteAtPortal validiert GUID/Koordinate und setzt den Modus; Aktionen in Planportal- und Aufgabenzeilen. rerouteWorkPlan(false) verlangt echtes GPS, meldet dessen Fehlen und setzt Standortmodus; true setzt gespeicherte Reihenfolge. Beide löschen den festen Ursprung. clearData löscht ihn ebenfalls. Der Panelbutton verwendet jetzt diese automatische Route statt einer gespeicherten Nearest-Neighbor-Sortierung. workRouteLabel zeigt Ursprung oder fehlendes Portal. Entfernung zum nächsten Ziel bleibt vom echten Standort, Reststrecke/Vorschau vom gewählten Routenursprung. UI-Name Planvorschau/Plan preview, interne walk.*-Schlüssel/Methoden bleiben kompatibel.

Die Aufgabenroute enthält nur Stopps mit verbleibenden Linkaufgaben oder Blocker-Abbau. Reine Empfangsportale und ungenutzte Richtungskandidaten bleiben im Plan sichtbar, werden aber nicht angefahren. Offene Richtungen bleiben als unbestätigte Linkaufgabe sichtbar. Ein ausdrücklich gewähltes Startportal bleibt als **Routenstart** erhalten, ohne erfundene Vorbereitung.

### Animation der Weglinie
createWalkSimulation ergänzt den gewählten Ursprung im ersten zusammenhängenden Pfad. animateWalkTravel aktualisiert vorhandene Polyline und Marker über requestAnimationFrame mit derselben Dauer und quadratischem Ease-out wie panTo. Vorwärts wächst das letzte Segment; bei benachbartem Rückschritt wird es zurückgenommen. Nur zusammenhängende Pfade interpolieren; bei fehlenden Punkten/Animations-API sofortige Fallbackdarstellung. cancelWalkTravel löscht den Handle und verwirft die Animationsidentität vor einem neuen Frame bzw. Schließen. Bei Stoppwechsel vorheriges Segment exakt abschließen; Schließen braucht keinen Abschluss. Pause unterbricht wie bei der Kamera die aktuelle Bewegung nicht, verhindert aber den nächsten Stopp. Frames, Keys und Planzustand bleiben unverändert.

### Nächste Aufgabe
nextTaskHtml leitet den ersten Stopp mit blockers/links aus demselben getWorkPlan ab; routeTargetType start ohne Aktionen bleibt nur Ursprungskontext. Navigation nutzt navigationLinks, Entfernung echtes IITC GPS. taskBlockerHtml/taskLinkHtml und wireTaskList teilen Richtungs-, Abbau-, Bestandsprüf- und Erledigungslogik mit der Tabelle. Keine zusätzliche Route, kein Fortschrittscursor oder persistenter Zustand. refreshTaskList aktualisiert zuerst refreshNextTask, unabhängig vom Tabellendialog. Vorhandene Scan-/Key-/Standort-/Aufgabenupdates erreichen beide Ansichten. Scrollposition und Routennotizen bleiben erhalten; Sessiontoken schützt neuen Dialog vor veraltetem closeCallback. Explizite Meldungen bleiben von Intel getrennt, Unscheduled/Readiness und fehlendes Keys-Plugin werden angezeigt.

### Eigenständiger Fächer-Generator
normalizeFanDesign validiert optionale anchors/assignments/areaKeys; load und JSONexport erhalten sie, clearData entfernt sie. fanAreaKey ist ein koordinatenbasierter Fingerprint der Auswahlpolygone. extractSegments ignoriert nur gespeicherte Auswahlflächen; alte Pläne behalten ihre Bedeutung.
Im Standardmodus für getrennte Fächer weist buildFanDesign jeden Nicht-Anker genau einem Anker zu (manuell, sonst nächste Luftlinie mit GUID-Tie-Break), reserviert alle Speichen und ergänzt längenpriorisierte kreuzungsfreie Blattlinks innerhalb der Gruppen. fanEdgesConflict erkennt echte Kreuzungen sowie kollineare Überlappung/T-Verbindung; GUID-identische Kanten sind kein Konflikt. Alle geschlossenen nicht-kollinearen Dreiergruppen werden als geometrische Felder gezählt. Die Geometrie bewertet weder Ingress-Baureihenfolge noch Keybestand und verbindet keine getrennten Fächer. Keybewusste Wurfrichtungen entstehen gesondert im übernommenen Arbeitsplan, weiterhin als unbestätigte Vorschläge.
suggestFanAnchors bewahrt manuelle Anker und Zuordnungsziele. Deterministische greedy-Suche: Fehlerzahl, Feldzahl, Blocker, vorhandene Links, Gesamtlinklänge. Maximal 20 abgetastete Kandidaten; Budget min(100,max(3,floor(600/Portalzahl))) Geometrieprüfungen. Danach weitere gewünschte Anker per größtem Abstand ergänzen. Begrenzung schützt mobile Bedienung, garantiert kein Optimum.
getFanCandidates liefert koordinierte Snapshots aus Kartenausschnitt oder einfachen Auswahlpolygonen (Rand inklusive). Die Oberfläche bietet keine aktuelle Ankerplanquelle; ein interner Planpfad bleibt zur Kompatibilität verfügbar. runtime.fanDraft hält Ausschlüsse, feste Anker, Zuordnungen und einen separaten LayerGroup. Dialogwechsel/Schließen bereinigt nur die eigene Vorschau; Quellenwechsel lädt neu und invalidiert sie. HTML-Inhalte werden escaped.
applyFanDesign revalidiert die aktive Entwurfsgeometrie und speichert normalisierte Portalsnapshots, GUID-Linkpaare, Felder und Auswahlmetadaten als eigenen nativen Plan; Draw Tools bleibt unverändert. Bei localStorage-Fehlern ursprüngliche Geometrie/Quelle wiederherstellen. Erst nach erfolgreicher Speicherung Arbeitsdialoge schließen, native Planquelle aktivieren, Vorschau entfernen und regulär scan ausführen. Während Finalcheck/Planvorschau keine Übernahme. Richtungs-, Aufgaben-, Key- und Erledigungssemantik bleiben im bestehenden Scan/Arbeitsplan.

### Fächervorschau beta.17
previewFanDesign trennt Geometrie und Übernahmekonflikte: ausschließlich fan.drawConflict in errors verhindert das separate Overlay nicht. Andere Fehler verhindern es weiterhin. Feldfüllung 0,18 und Umrissgewicht 2/Deckkraft 0,9; keine Änderung am Plan oder Keys. applyFanDesign und Button bleiben bei jedem Fehler gesperrt.

### Laden mit Vorschlag beta.18
Der ap-fan-load-Handler lädt wie bisher einen frischen Portal-Snapshot und setzt Entwurfsrollen zurück; bei 3–60 Portalen ruft er suggestFanAnchors mit draft.count auf. previewFanDesign läuft anschließend immer, auch für fehlgeschlagene Auswahl, damit Fehler statt eines leeren Vorschlags sichtbar sind. Quellenwechsel nutzt denselben Handler. Keine neue Persistenz, Draw-Tools-/Key-/Routensemantik unverändert.

### Native Fächerpläne beta.19
fanDesign ergänzt validierte portals (maximal 60), links (GUID-Paare, dedupliziert) und fields (geschlossene GUID-Dreiergruppen). Legacy-Metadaten ohne Geometrie bleiben kompatibel und aktivieren keinen nativen Plan. applyFanDesign speichert allein Anchor-Planner-Zustand mit überprüfter localStorage-Schreiboperation und Rücknahme bei Fehler, ohne Draw Tools zu prüfen oder zu verändern. clearNativeFanPlan entfernt nur eigene Geometrie, erhält Richtungen/Keys und kehrt zum externen Scan zurück.
getNativeFanPlan aktiviert eigene Geometrie als ausschließliche Scanquelle. scan ergänzt ungeladene Portale aus Snapshots, verwendet GUID-genaue apFanEndpoints und durchläuft sonst vorhandene Blocker-/Keys-/Routenpipeline. drawLayers zählt dann 0. renderNativeFanPlan zeichnet gespeicherte Flächen und Links im normalen Plugin-Layer, zusätzlich zu Blocker-/Statusoverlays. Setup plant einen nativen Scan nach Initialisierung ein. Dialog-Vorschau bleibt getrennt; alte Draw-Tools-Konflikte blockieren native Entwürfe nicht. Neue Wurfrichtungen weiterhin ausdrücklich bestätigen.

### Umschaltbare Planquellen und Polygonworkflow beta.20
state.planSource ist auto/external/fan; auto migriert frühere Zustände ohne Verhaltenswechsel (nativer Plan, sofern vorhanden). getNativeFanPlan liefert gespeicherte Geometrie unabhängig vom Modus, getActiveFanPlan sperrt sie im externen Modus. scan/renderNativeFanPlan/Setup verwenden aktive Quelle. applyFanDesign setzt fan, clearNativeFanPlan external. switchPlanSource validiert Quelle und Busy-Zustand, prüft localStorage-Schreiboperation vor Laufzeitwechsel, leert Scan-/Routencache und scannt aktive Quelle. exportData ergänzt planSource, fanDesign ergänzt selectionAreaKey.
getFanAreas liefert deduplizierte einfache Ringe; mehrere Ringe/Löcher werden nicht abgeflacht. getFanCandidates(area,key) filtert genau ein Polygon (inklusive Rand), ohne viewport-Grenze. showFanPlanner startet area, bevorzugt gespeicherten Fingerprint oder letzten Ring. Dropdown wechselt Fläche über gemeinsamen Load-Handler. Fehlendes Polygon ersetzt generische Fehler durch fan.areaRequired. Übernahme ergänzt gewählten Fingerprint in areaKeys; extractSegments ignoriert nur diese akzeptierte Auswahl. Andere externe Linien bleiben erhalten.
Panel bietet getrennte Workspace-Buttons mit aktivem Status, gespeicherter Fächer bleibt im externen Modus abrufbar. Fächerdialog bietet gespeicherten Plan verwenden/entfernen. Portal-/Linknotizen, Richtungen und Keybestand bleiben gemeinsame reale Informationen. Aktuelle Darstellung ersetzt den bedingungslosen nativen Vorrang aus beta.19.

### Namensauflösung beta.21
getFanCandidates ergänzt nur fehlende Titel geladener ausgewählter GUIDs aus gespeicherter Geometrie, letztem Entwurf, Stats und Bookmarks; keine zusätzlichen Auswahlportale oder Koordinatenzuordnung. previewFanDesign plant queueMissingNameRefresh auch bei ungültiger/zu großer Auswahl. collectMissingPortalNameGuids betrachtet offene, nicht ausgeschlossene Entwurfsportale und aktiven nativen Plan zusätzlich zu Stats/Blockern.
updatePortalTitle aktualisiert Entwurf, gespeicherte Snapshots und geplante/Blocker-Linktitel; persistente Änderungen werden gespeichert, Routencache invalidiert. Native Scan ergänzt bekannte gespeicherte Namen bei titelarmen geladenen Markern. nameRefreshQueued verhindert doppelte Timer, nameLoader bündelt GUIDs mit seen-Set in einer dynamischen sequentiellen Queue. Während eines Laufs neu benötigte GUIDs ergänzen; nicht mehr relevante oder inzwischen bekannte GUIDs überspringen. Fehlgeschlagene GUIDs nicht endlos neu anfordern, manueller Namen-laden-Button kann später neu versuchen. Pause 900 ms nach jeder Detailantwort; Dialog/Tasks schrittweise aktualisieren, Panel/Overlays am Ende.

### Getrennte Start-/Arbeitsansichten beta.22
runtime.workspaceView (home/anchors/fan) ist Sessionzustand, getrennt von persistentem planSource. renderPanel delegiert Home und leeren Fächerbereich vor der Routenberechnung an renderWorkspaceLanding; die Startseite rendert keine aktiven Planaktionen. openWorkspace aktiviert externe bzw. gespeicherte native Quelle über switchPlanSource. Ohne gespeicherten Fächer öffnet es die leere Fächeransicht mit Entwurf. Übernahme setzt fan und schließt Arbeitsdialoge; fehlgeschlagene Speicherung verändert keine Ansicht.
Die vorhandene Plan-/Aufgabenanzeige wird erst im gewählten Kontext verwendet. Externe Ansicht enthält Toleranz, native Ansicht Design/Entfernen und Plan aktualisieren. Gegenbereich-Aktionen entfallen; Fächerquelle aktueller Plan aus Dropdown entfernt, loaded-map/Polygon bleiben. Globale Sprache/Datenlöschung liegen in showPluginSettings. Neue CSS-Karten, Rücknavigation und 40-px-Mindesthöhe für Navigation.
showWorkspaceHome pausiert Finalcheck, closeWorkspaceDialogs stoppt Walk/entfernt Vorschau und schließt gespeicherte JQuery-Dialoghandles für Entwurf/Aufgaben/Next/Walk/Export/Keys/Portalaktionen defensiv. Import-closeCallback cancelt Verarbeitung wie bisher. Kontextdialogtitel nennen Quelle; stale Task-closeCallback zusätzlich token-gesichert. Geometrie/Keys werden nicht durch Home gelöscht; planSource bleibt persistent.

### Frischer Generator beta.23
openWorkspace(fan) setzt runtime.fanDesigning und öffnet immer showFanPlanner. Gespeicherter Fächer wird nur über switchPlanSource(fan) ausdrücklich wieder aktiv; Übernahme und Quellenwechsel beenden fanDesigning. showFanPlanner nutzt neuesten gültigen Ring statt selectionAreaKey, beginnt count=1/pinned=[]/assignments={}, berechnet automatisch Anker und Vorschau. Bekannte Namen bleiben GUID-genau wiederverwendbar, keine alten Rollen/Portale/Geometrien werden kopiert.
renderPanel delegiert fanDesigning an Entwurfs-Landing statt Anzeige des alten aktiven Plans. Alte state.lastScan/finalScanProgress/Keydiagnosen bleiben gespeichert, werden dort nicht ausgegeben. collectMissingPortalNameGuids beschränkt einen frischen Entwurf auf dessen nicht ausgeschlossene Portale. Home beendet fanDesigning; nächster Entwurf beginnt frisch.
Build-/Load-/UI-Grenze 200. normalizeFanDesign erhält maximal 200 Portale/Anker, 600 Kanten und 1200 Dreiecke (erzeugtes geradlinig planares Netz liegt darunter). Bis 60 Portale bleibt längenpriorisierte Blattpaar-Kandidatensuche; darüber sortieren Blätter nach Winkel zum Anker und versuchen nur benachbarte Paare inklusive Ringschluss, weiterhin globaler Kreuzungs-/Überlappungsschutz. Dreiecke aus gemeinsamen Nachbarn akzeptierter Kanten zählen statt kubischer Vertex-Schleifen. Greedy-Ankersuche Budget min(100,max(3,floor(600/n))); Sampling und Distanz-Fallback unverändert. Kein Feldmaximum/Ingress-Bauordnungsversprechen.

### Fraktionen und native Statusmarker beta.24
normalizeFaction verarbeitet kanonische res/enl/mac, Intel-Codes R/E/M, volle Namen und verfügbare IITC-TEAM-Konstanten; nicht numerisch raten. linkFaction priorisiert options.team, fällt auf data.team zurück. factionRelation wertet PLAYER.team aus; ohne bekannte Spieler-/Linkfraktion unknown. collectExistingLinkIds erfasst faction/timestamp, persistFinalScanProgress behält beide, mergeExistingLinkInfo ergänzt bekannte Metadaten und bevorzugt jüngere Entität desselben Portalpaars.
isUsableExistingLink verwirft bekannte Gegnerlinks, erhält unbekannte Legacy-Existenzwertung. Scan, Coverage und Fächervorschlag teilen Regel. findBlockersForPlannedLink nimmt neben echten Kreuzungen auch identische Gegnerverbindungen als Blocker auf; andere gemeinsam endende Links weiterhin keine Kreuzung. Die bestehende Verbrauchslogik sieht Gegnerlinks nicht als bestehende eigene Würfe. Blockermetadaten werden in Tasks, Next, Panel-Zählern und farbiger Linie gezeigt; Export ergänzt faction/relation. Routenwahl/Abhängigkeiten bleiben geometrisch und zählen alle Fraktionen.
addHtmlStatusMarker verwendet L.marker/L.divIcon am LatLng mit iconAnchor [16,16], passiven Optionen und Plugin-Pane; LayerGroup übernimmt Move/Zoom/Hide/Cleanup. Statusbadge liegt im Icon zentriert, dynamische Borderfarbe mit inline !important gegen alte CSS-Shorthand-Regel. Alte HTML-Container nur als Fallback; htmlBadgeLocations wird bei clear geleert, move-Event berechnet deren Position laufend neu statt nur bei moveend. Normaler Status-Refresh bleibt bei bestehenden Daten-/Endereignissen.

### Ankeranzahl und frische Vorschläge beta.25
showFanPlanner enthält ein eigenes fieldset für Anker vorschlagen und das dynamisch begrenzte Ganzzahlfeld. suggestFanDraft validiert count gegen 1..min(199, aktive Portale minus 1) sowie die Anzahl deduplizierter aktiver manueller Pins/Zuordnungsziele, bevor suggestFanAnchors läuft. Bei mehr aktiven Festlegungen als gewünscht ein Fehler statt stiller Erhöhung; ein gültiger Entwurf ergänzt bis zur gewünschten Gesamtzahl. Ungültige/veraltete Anker-IDs werden weiterhin durch Geometrieprüfung abgewiesen; die defensive innere Ankersuche behält ihren bisherigen Clamp. Eine gültige Ankerzahl kann weiterhin geometrische Fehler liefern.
oninput setzt countDirty, leert vorherigen result/Layer und sperrt Übernahme. onchange und Vorschlagsbutton berechnen den aktuellen Entwurf neu; der Vorschau-Button führt bei countDirty/countError ebenfalls zuerst die Ankersuche aus. applyFanDesign weist unbearbeitete oder ungültige Zahlen ab. Ohne neue Zahl bleiben manuell gewählte Rollen/Zuordnungen Bestandteil des aktuellen Entwurfs. Frischer Polygonstart, ausdrückliche Wiederaufnahme, native Speicherung und Quellenisolation bleiben erhalten.

### Gemeinsame Keykapazität für Richtungen beta.25
getSuggestedLinkDirections berechnet eine Laufzeitzuordnung aller offenen unbestätigten Links; getSuggestedLinkDirection liest den jeweiligen Vorschlag daraus. Bekannte Keys werden je GUID gelesen und bestätigte offene Zielwürfe zuerst abgezogen, mindestens null Restkapazität. Der bipartite Graph verbindet offene Links mit zulässigen Zielportalen; ein Ziel braucht am anderen Ende eine offene nicht erledigte Quelle. Diese kann aus runtime.stats kommen, auch wenn sie aus der vorherigen Arbeitsroute gefiltert wurde. Matching maximiert innerhalb des Budgets die Zahl durch bekannte Restbestände gedeckter Vorschläge und kann zuvor gewählte Ziele umverteilen.
Quellen benötigen gültige Koordinaten zusätzlich zum offenen nicht erledigten Status. Reguläre Planbesuchsreihenfolge liefert die Präferenz zwischen gleichwertigen Lösungen; reine Abbau-/Routenstartbesuche stellen keine Wurfquelle dar. Ungedeckte Links bevorzugen unbekannten Zielbestand vor bekannt erschöpftem Bestand, sonst Route. Alle bestätigten Richtungen bleiben unangetastet. Höchstens 600 unbestätigte Links und 200.000 Besuche; bei Größen-/Budgetgrenze ein begrenzter Fallback, keine Gesamtdeckungsgarantie.
Der Cache-Schlüssel enthält Linkzustände, bestätigte Richtungen, Keybestände, geeignete Quellen und Routenpräferenz. Änderungen daran erneuern die Vorschläge, ohne Bestand oder linkDirections zu schreiben. Aufgaben und Nächste Aufgabe berechnen das gemeinsame Vorschlagsobjekt einmal pro Render und reichen es an einzelne Linkzeilen weiter; der Einzelgetter bleibt für andere Aufrufer verfügbar. Ein sichtbarer Key-Richtungshinweis erklärt die Vorauswahl. Erst ausdrückliche Übernahme/Änderung bestätigt die Richtung, worauf die bestehende Bedarf-/Aufgabenberechnung reagiert. Geometrie und Ankerwahl lesen weiterhin keine Keykapazitäten; diese Logik gilt erst im übernommenen Arbeitsplan. Keine zusätzliche Persistenz, Bestandsquelle oder Ingress-Bauprüfung.

### Gemeinsames Theme und Dialogintegration beta.26
Panel und sämtliche Plugindialoge teilen CSS-Tokens für Fläche (#101923), Controls (#24364a), Text (#eef5ff), zurückgenommene Hinweise (#b1c1d2), Rahmen (#415164) und Cyanakzent. Die Inhaltsklasse ap-ui kapselt Typografie (13 px/1,45), Tabellen, Formulare, Toolbarabstände und Aktionsrollen; ap-dialog markiert ausschließlich den äußeren Widgetrahmen mit Titelleiste, Schließen-Button und Fußaktionen. Dadurch greifen keine Theme-Regeln auf fremde IITC-Dialoge über.
ap.openDialog ergänzt Inhalts-/Widgetklassen und begrenzt angeforderte Dialogbreiten gegen den Viewport, reicht bestehende Optionen und Close-Callbacks aber weiter und liefert den bisherigen Dialoghandle zurück. Alle Pluginaufrufe verwenden diese Hülle. Gemeinsame Zustände umfassen Hover, sichtbaren Tastaturfokus und Disabled; Mindesthöhe für Bedienelemente 36 px, bei Touch 44 px. Schmale Tabellen-/Formularbereiche bleiben scrollbar und Aktionszeilen umbrechbar.
Statische Inline-Layouts werden durch gemeinsame Klassen ersetzt; dynamische Positionen, Fortschritt und Statuswerte bleiben dynamisch. Kartenmarker, Portalbindung, Statusfarben und Fächer-/Routengeometrie bleiben im bestehenden Renderingpfad. Keine Änderung der Dialog-IDs, Hooks, Close-Semantik, Workspace-Isolation, Sprachschlüssel, Bestandswrites oder JSON-/Persistenzfelder. test-ui-theme sichert den gemeinsamen Integrationsweg; visuelle Browserprüfung und echter IITC-Praxistest werden getrennt dokumentiert.

Aktuelle und Legacy-IITC-Widgetklassen werden in ap.openDialog zusammengeführt, Options-/classes-Objekte geklont und vorhandene HTMLElement-Inhalte unverändert weiterverwendet. Alle elf Dialogaufrufe verwenden die Hülle. Gemeinsame Basisregeln mit :where halten die Spezifität niedrig, damit kompakte Tabellenaktionen transparent bleiben. 36-px-Controls werden bei max-width:600px oder pointer:coarse 44 px; die mobile Aufgabenleiste nutzt mindestens 110 px breite Knöpfe mit 120-px-Flexbasis. Markerpositionen, dynamische Randfarben und Export-Sichtbarkeit behalten ihre bisherigen Inlinewerte.

### Titelleistensymbole beta.27
IITC zeichnet Titelknöpfe über absolut positionierte Pseudoelemente. Die Plugin-Knöpfe bleiben im Flexlayout relativ positioniert und bilden den Bezug für zentrierte CSS-Linien: Kreuz zum Schließen, Minus zum Einklappen, Plus bei collapse-collapsed. Alte ui-icon-Spans im Plugin ausblenden, pointer-events:none für Symbole. Die nativen Klone, Zustandsklassen und Ereignishandler bleiben erhalten; ausschließlich ap-dialog kapselt diese Regeln.

### Finalcheck-Ladezustand und Wiederholung beta.28
Der alte Acht-Sekunden-Fallback zählte auch Zeitüberschreitungen als besuchte Ansichten und markierte den gesamten Lauf dauerhaft als timedOut. Jetzt bleibt der Watchdog bis zum tatsächlichen Abschluss aktiv (30 Sekunden), und eine lokale 250-ms-Prüfung liest IITC.map.request bzw. window.mapDataRequest defensiv. Der Status done genügt nur mit passender fetchedDataParams-Fläche/Zoom, leeren queuedTiles/requestedTiles/renderQueue, activeRequestCount=0 und ohne failedTileCount/staleTileCount. errors/out of date bleiben Fehler. Ohne Statusschnittstelle bleibt ein Start-/End-Hookpaar mit Ruhephase der Kompatibilitätspfad; ohne jeden Nachweis führt das Zeitlimit zu unvollständig. Keine eigenen Requests oder Eingriffe in IITCs Queue.
checked zählt Erfolge, index abgearbeitete Versuche; failedPoints hält fehlgeschlagene Ansichten. Die optionalen Fortschrittsfelder checked/failedPoints ergänzen das vorhandene Speicherschema. Am Ende bleiben nur fehlgeschlagene Punkte zum ausdrücklichen Wiederholen, mit bisherigem Erfolgszähler und Linkakkumulator. Nach erfolgreicher Fortsetzung wird finalScanTimedOut=false und finalScanComplete=true. Ältere timedOut-Zwischenstände ohne checked starten frisch, da ihre Erfolge nicht belegt sind. Begrenzte Geometrie bleibt auch nach Wiederholung unvollständig. Poll-, Settle- und Watchdog-Timer beim Abschluss, Pausieren und Löschen abbrechen; verzögerte Schrittwechsel an die konkrete Sitzung binden.

### Getrennte Kartenebenen beta.29
buildPlanMapGeometry bildet aus deduplizierten aufgelösten aktiven Kanten einen Nachbarschaftsgraphen. Geometrische Dreiecke einmalig nach GUID-Reihenfolge zählen, entartete Flächen überspringen; keine Abhängigkeit von Keys, Richtung oder Erledigung. getPlanMapGeometry wählt ausschließlich aktive native Geometrie bzw. runtime.links und cached anhand von GUIDs/Koordinaten. Ergebnisse bestehen aus kopierten Koordinaten; neue Live-Geometrie ersetzt den Cache, verändert aber keinen laufenden Vorschausnapshot. Die Suche stoppt bei 2000 Flächen oder 200000 Nachbarschaftsprüfungen und setzt limited; alle Kanten bleiben.
renderPlanMapGeometry zeichnet den violetten Zielplan. Eigene passive Leaflet-Panes ordnen Zielplan (420), simulierten Bau (530), Route (540) und vorhandene Status-/Blockeroverlays (550); ohne Pane-Schnittstelle defensiver Leaflet-Standard. MAP_COLORS ist gemeinsame Quelle für Karten und CSS-Legende. Der aktive normale Overlaypfad umfasst nun auch externe Pläne. renderNativeFanPlan bleibt als nativer Integrationsweg erhalten.
createWalkSimulation friert target separat zu simulierten Frames ein. Die Sitzung besitzt targetLayer und den bisherigen inkrementellen layer für Reise/Simulation; renderOverlays unterdrückt währenddessen nur die doppelte normale Zielzeichnung, behält Marker/Blocker. Rewind baut ausschließlich Fortschritt um, Pause erhält Geometrie, stopWalkSimulation entfernt beide Gruppen und stellt das normale Zieloverlay wieder her. Keine Draw-Tools-/Keys-/Erledigungs-/Routenlogikänderung und keine neue Persistenz.

### Blocker-Hervorhebung beta.30
runtime.showAllBlockers ist ein temporärer reiner Anzeigezustand, standardmäßig false. renderOverlays verwendet für alle unverändert erkannten Blocker 2-px-Linien mit reduzierter Deckkraft; Vollansicht verwendet bisherige 5-px-Hervorhebung. Schnittpunkte nur in Vollansicht allgemein zeichnen und nach latLngKey deduplizieren; selectedBlocker bleibt separat mit 7-px-Verbindungen und einem 7-px-Schnittpunktmarker sichtbar.
blockerMapControlsHtml/wireBlockerMapControls teilen Schalter zwischen Panel und Planvorschau, aria-pressed signalisiert Vollansicht. Auswahl aufheben ist ohne Fokus disabled. Ereignisse zeichnen nur Overlays/Panel neu und synchronisieren vorhandene Vorschausteuerung, ohne Route/Simulationsschritt oder targetLayer neu zu berechnen. Fokusauswahl aktualisiert beide Steuerungen. Home und Datenlöschung setzen die temporäre Ansicht zurück; kein Speicher-/JSONschemawechsel.

### Gemeinsamer Zielrenderer im Fächerentwurf beta.31
previewFanDesign reicht die bereits berechneten fields und links des aktuellen gültigen Entwurfs direkt an renderPlanMapGeometry. Derselbe Renderer liefert violette Konturen, gestrichelte Links, Feldfüllung und PLAN_PANE_NAME; keine zweite Farbtabelle je Anker. Weiße Ankermarker verbleiben im Statuspane, Rollen/Zuordnungen bleiben in der Planertabelle erhalten. fanPlannerHtml ergänzt für einen gültigen Entwurf planMapLegendHtml(false); keine Legende für simulierten Fortschritt im Entwurf. Geometrieberechnung, Fehler-/Übernahmesperren, Schließen/Cleanup und persistente Daten unverändert.

### Native Intel-Feldfüllungen beta.32
runtime.hideIntelFieldFill steuert nur die Darstellung; hiddenIntelFields hält je nativem Layer die ursprüngliche fillOpacity und einen eigenen add-Listener. syncIntelFieldVisibility arbeitet ausschließlich auf window.fields, ohne Einträge oder Layer aus IITC zu entfernen. setStyle({fillOpacity:0}) unterstützt SVG/Canvas und lässt übrige Optionen unverändert. Wiederholte Synchronisation vermeidet unnötige Stylewrites. Nicht mehr registrierte Layer werden restauriert und ihre Listener/Referenzen freigegeben. Geänderte nichtnull Füllstärken anderer Plugins werden als neuer Wiederherstellungswert übernommen; eine vor dem Wiederherstellen schon gesetzte andere Füllstärke nicht überschreiben.
Offizielle IITC-Quelle core/code/map_renderer.js geprüft: fieldAdded liefert das Polygon vor window.fields-Zuweisung und Mapaddition. Der Hook verarbeitet deshalb unmittelbar data.field; ein add-Listener hält die Einstellung auch nach späteren Add-/Styleaktionen ein. mapDataRefreshEnd sowie Overlay-/Kartenrefresh synchronisieren nach. Deaktivierter Anchor-Planner-Layer restauriert die Füllungen, behält den temporären Wunsch fürs Wiederaktivieren. Home/Datenlöschung setzt den Wunsch zurück.
intelFieldControlsHtml/wireIntelFieldControls teilen dieselbe aria-pressed-Steuerung zwischen Panel, Fan-Landing, Fächerentwurf und Planvorschau. Toggle synchronisiert bestehende Buttons ohne Neuaufbau von Formularen oder Simulation. Ein neuer Locale-Schlüssel, kein Persistenz-/Exportschemawechsel und keine Änderung der Intel-Daten-/Blocker-/Bestandslogik.


### Spine-Generator und Baufolge beta.33
buildFanDesign delegiert ausschließlich für mode=spine an buildSpineDesign. Für bis 200 Portale validiert dieser zwei Anker und wählt per dynamischer Programmierung die längste strikt ineinanderliegende Dreiecksfolge auf einer Seite der Basis (O(n²) Übergänge, begrenzte Geometrie). Kandidaten nach Basisdreiecksfläche/GUID, strict interior verhindert kollineare überlappende Speichen. Eine Gegenseite und ungeeignete Portale erscheinen als unused; nicht Teil der Übernahme. Basis und je Portal toA/toB/previous ergeben maximal 594 Kanten/592 geometrische Dreiecke.
suggestSpineAnchors betrachtet alle zulässigen Ankerpaare als Kandidaten, weiteste zuerst, respektiert Pins, wertet aber nur min(80,max(16,floor(6000/n))) Paare aus. Priorität: weniger Geometriefehler, längste Spine, weniger blockierte Plankanten, mehr bestehende Links, geringere gesamte Linklänge. Das begrenzte Paarbudget ist kein globales Optimum, keine Keyoptimierung und kein kürzester Gehweg. Vorhandene Links werden als reused oder physische Blocker geprüft; ihr Feldentstehungsverlauf ist unbekannt.
normalizeFanDesign erhält für Spine optional mode/spine und prüft geordnete links gegen spineLinkSequence. Legacy-Fächer bleiben schemaidentisch. applyFanDesign speichert nur verwendete Portal-Snapshots, Draw Tools und bestehende Key-/Richtungsdaten bleiben erhalten. Externe Quelle ignoriert inaktiven Spine vollständig. Alte Betas ignorieren die zusätzlichen Metadaten und sind für Spine-Abarbeitung ungeeignet.
getActiveSpinePlan aktiviert buildWorkPlanForOrder mit expliziter Kantenfolge. Stopps werden nach bestätigter Quelle, sonst kanonischer Quelle gebildet; nur direkt aufeinanderfolgende gleiche Quellen bündeln, ansonsten Rückbesuche. Blockertermine hängen an konkreten Linkaufgaben, refineBlockerStops bewegt nur Abbaustopps. Allgemeine Portalpermutation wird für Spine übersprungen. Manuelles Portal-done filtert keine noch offenen Spine-Kanten; die pauschale Portal-Erledigt-Checkbox entfällt dort in Tasks/Next. getWorkPlan und Richtungsvorschlagscache berücksichtigen Spine-Metadaten. Kanonische Quellen haben bei ausreichendem Bestand Vorrang; der bestehende Keymatcher darf Richtungen weiter umverteilen, ohne sie zu bestätigen.
createWalkSimulation bewahrt Basis-/Spinefolge und prüft jede frühere Kante auf bestehend/simuliert, bevor es abhängige Würfe ausführt. Fehlende frühere Richtung/Keys/Blocker propagieren als prerequisite statt fiktivem Weiterbau. Nur für Spine wird maximal das größte verfügbare Dreieck je Seite eines neuen Links ausgegeben. Allgemeine Fächersimulation unverändert geometrisch. Bereits bestehende Felder, Unterfeld-/Reichweiten-/Ausgangslimits bleiben unvalidiert.
Begriffs-/Technikvergleich am 2026-10-27 mit offizieller FF3-Quelle: Herringbone nutzt eine lokale nearest-reachable-Kette, zeitbegrenzte Suche über Ankerpaare und zusätzliche Seiten-/Inbound-/Outboundoptionen. Eigenständige Implementierung, kein übernommener FF3-Code. Kontrollierter Vergleich für 100 deterministische positive-side Mengen mit festen Ankern/30 Kandidaten, ohne Intel: DP-Spine länger in 96 Fällen, gleich in 4; insgesamt 783 vs. 387 Portale. Kein Beleg für bessere reale Wege, globale Paarwahl oder vollständige Gleichwertigkeit zu FF3.
