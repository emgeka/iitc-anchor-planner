# Architekturübersicht 0.1.53

Das Plugin ist ein einzelnes IITC-Userscript. Es verwendet den Namespace
`window.plugin.anchorPlanner`, intern abgekürzt als `ap`, und integriert sich
in Leaflet, Draw Tools sowie optionale IITC-Plugins defensiv.

## Zustände

### Dauerhafter Zustand

`ap.state` wird unter `plugin-anchor-planner-v1` in `localStorage` gespeichert:

- Scan-Toleranz und letzter Scanbericht,
- fortsetzbarer Zwischenstand eines pausierten finalen Blockerchecks unter
  `finalScanProgress`,
- eingetragene Keys, Erledigt-Status, Notizen und Reihenfolge je Portal,
- vorgemerkte Blocker-Endportale für die gemeinsame Arbeitsroute,
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
| Planberechnung | `scan`, `getStatus`, `filterCounts`, `getReadiness`, `sortedStats` |
| Route und Standort | `rememberUserLocation`, `getCurrentUserLocation`, `getBlockerWorklist`, `getRouteTasks`, `getNextRouteTarget`, `getRouteEstimate`, `distanceToPortal`, `formatDistance`, `sortRouteFromUserLocation` |
| Karte und Panel | `renderOverlays`, `renderPanel`, `setupPanelDragging`, `correctPanelPosition`, `schedulePanelPositionCorrection`, `scheduleMapDataPanelRefresh`, `showPortalActions` |
| Export | `buildBlockerExport`, `exportData`, `buildPlanText`, `showExport` |
| Sprache | `findAvailableLanguage`, `detectLanguage`, `getLanguage`, `languageOptionsHtml`, `t`, `tp` |

## Sprach-Datenfluss

Die bearbeitbaren Übersetzungen liegen als JSON-Dateien unter `src/locales/`.
Jede Sprache besitzt dieselben 167 semantischen Schlüssel; Platzhalter wie
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
ausdrücklich unvollständigen Ergebnis. `persistFinalScanProgress` speichert
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
eindeutiger Blocklinks. Offene Planportale sind automatisch Arbeitsziele;
weitere Blocker-Endportale werden nur nach ausdrücklicher Vormerkung ergänzt.
`getRouteTasks` führt beide Mengen anhand der Portal-GUID ohne Duplikate
zusammen.

Blocker-Endportale verwenden im Panel dieselben Aktionen wie Planportale.
`showPortalDetails` bleibt auf bereits geladene IITC-Portalobjekte beschränkt;
`showPortalActions` akzeptiert zusätzlich die aus der Blocker-Arbeitsliste
stammenden Titel und Koordinaten, sodass der gemeinsame Teilen- und
Navigationsdialog ohne Planportalstatistik funktioniert.

`getNextRouteTarget` ermittelt bei jedem relevanten Standort- oder
Statuswechsel das nächste offene Plan- oder Blocker-Portal nach Luftlinie.
Diese dynamische Auswahl verändert die gespeicherte Planportalreihenfolge
nicht. Erst **Ab Standort sortieren** schreibt eine einmalig per
Nearest-Neighbor-Heuristik berechnete Reihenfolge der Planportale; erledigte
Planportale werden dabei hinten angehängt.

`distanceToPortal` verwendet dieselbe gültige IITC-Position für die
Luftlinienentfernung zum nächsten Ziel. `getRouteEstimate` berechnet ab diesem
Standort eine Nearest-Neighbor-Näherung durch alle aktuellen Arbeitsziele.
`formatDistance` rundet unter einem Kilometer auf 10 Meter und darüber auf 0,1
Kilometer. Zielentfernung und Reststrecke gehören zum Laufzeitschlüssel der
Zielzeile, sodass sie sich auch bei unverändertem Zielportal aktualisieren.
Ohne gültigen Standort wird keine Entfernung angezeigt.

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
verwendet ausschließlich einen vorhandenen Marker aus `window.portals` und
dessen bereits geladene Details. Es wählt das Portal über die verfügbare
moderne oder kompatible IITC-Anzeige-API aus und rendert es direkt in die
Portalansicht. Die anfordernde IITC-Funktion `renderDetails` sowie Kartenmethoden
wie `setView`, `panTo` oder `fitBounds` werden dabei nicht aufgerufen.

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
