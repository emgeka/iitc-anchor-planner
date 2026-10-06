# Architekturübersicht 0.2.0-beta.9

Entwicklungsstand; Stable bleibt 0.1.55. IITC-Praxistest ausstehend.

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
- Layer, automatische Blocker-Geometrien und HTML-Statusmarker,
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
Jede Sprache besitzt dieselben 276 semantischen Schlüssel; Platzhalter wie
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

`buildWorkPlan` erzeugt eine Nearest-Neighbor-Reihenfolge der Planportale ab
Standort beziehungsweise deren gespeicherte Reihenfolge im manuellen Modus.
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

`getSuggestedLinkDirection` nutzt ausschließlich Planbesuche der stabilisierten
Arbeitsroute; frühe reine Blockerbesuche zählen nicht. Der Vorschlag ist im
Auswahlfeld vorausgewählt und gekennzeichnet, wird aber erst per Übernahme
oder Richtungsänderung unter `linkDirections` gespeichert. Ohne offenen
Endportalbesuch bleibt die Richtung offen. Draw-Tools-Zeichenreihenfolge und
vorhandene Intel-Links erzeugen keine Vorschläge.

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
unter Feldern. Walk Sim verwendet denselben Arbeitsplan als rein virtuelle Vorschau.

## Karten- und Blockerdarstellung

`renderOverlays` zeichnet alle beim letzten Scan erkannten betroffenen
Planlinks pink gestrichelt, eindeutige Blocklinks türkis und berechnete
Kreuzungspunkte gelb. Eine eigene nicht interaktive Leaflet-Ebene mit höherem
Z-Index hält diese Geometrien oberhalb der normalen IITC-Links, aber unterhalb
der Portalmarker. Vorgemerkte zusätzliche Blocker-Portale erhalten Kartenringe;
das nächste Arbeitsziel wird stärker markiert.
Die HTML-Statusmarker kennzeichnen erledigte Portale mit `✓`; `K0` bleibt
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

### Walk Sim
createWalkSimulation erzeugt eingefrorene Frames aus getWorkPlan. Blocker werden vor den Links eines Stopps virtuell freigegeben; bestätigte Links mit bekannten positiven Keys verbrauchen ausschließlich lokale virtuelle Mengen. Planlinks mit existing bilden die Ausgangskanten. Ein abschließender simulierter Dreiecksrand erzeugt ein geometrisches Polygon; keine Feld-/Linklimitprüfung. showWalkSimulation verwaltet nur Laufzeitzustand und separaten Leaflet-Layer. seek/play rekonstruieren Frames deterministisch; Timer prüfen die Sessionidentität. stop entfernt Timer/Layer und restauriert die Kartenansicht. suppressWalkObservations schützt passive Intel-Erkennung und updateKeyConsumption bis zum nächsten expliziten Scan/Finalcheck, auch vor verspäteten Kartenereignissen der Vorschau. Keine direkte Übernahme von Fan-Fields-Quellcode.

renderWalkSimulation hält renderedIndex, pathLayers und head nur in der Session. Vorwärts aktualisiert es Weg/Marker und ergänzt nur neue Links/Dreiecke; gleiche Frames lassen den Layer und die Kamera unangetastet. Rückwärts wird der korrekte Präfix neu aufgebaut. Leaflet panTo erzwingt Animation auch außerhalb des Viewports (0,9 s, easeLinearity 0,5), außer bei prefers-reduced-motion. stop beendet auch laufende Kartenbewegung vor der Ansichtsrestaurierung. Der Schritttakt bleibt 1,5 s.
