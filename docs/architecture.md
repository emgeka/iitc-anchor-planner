# Architekturübersicht 0.1.43

Das Plugin ist ein einzelnes IITC-Userscript. Es verwendet den Namespace
`window.plugin.anchorPlanner`, intern abgekürzt als `ap`, und integriert sich
in Leaflet, Draw Tools sowie optionale IITC-Plugins defensiv.

## Zustände

### Dauerhafter Zustand

`ap.state` wird unter `plugin-anchor-planner-v1` in `localStorage` gespeichert:

- Scan-Toleranz und letzter Scanbericht,
- eingetragene Keys, Erledigt-Status, Notizen und Reihenfolge je Portal,
- Panelzustand und aktiver Listenfilter.

### Laufzeit-Zustand

`ap.runtime` enthält nur Daten der aktuellen IITC-Sitzung:

- berechnete Portalstatistiken und Planlinks,
- aktuell geladene vorhandene Links und Blocker,
- ungelöste Endpunkte und Diagnosekandidaten,
- Layer, HTML-Statusmarker und ausgewählten Blocker,
- verzögerten Panel-Refresh nach IITC-Kartendatenänderungen,
- zuletzt vom IITC-User-Location-Plugin gemeldeten Standort sowie das
  dynamische nächste Ziel.

Der Nutzerstandort gehört ausdrücklich nicht zu `ap.state` und erscheint in
keinem Export.

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
| Portal- und Namensdaten | `getLoadedPortals`, `getPortalTitleFromMarker`, `requestPortalDetails`, `refreshMissingNames` |
| Bookmarks | `collectPortalBookmarks`, `mergePortalSources` |
| Draw Tools | `collectDrawToolLayers`, `collectDrawToolPointLayers`, `extractSegments` |
| Endpunktdiagnose | `findNearestPortalInfo`, `portalCandidatesForEndpoint`, `drawToolPointCandidatesForEndpoint` |
| Linkanalyse | `collectExistingLinkIds`, `properSegmentsIntersect`, `findBlockersForPlannedLink` |
| Planberechnung | `scan`, `getStatus`, `filterCounts`, `getReadiness`, `sortedStats` |
| Route und Standort | `rememberUserLocation`, `getCurrentUserLocation`, `getNextPortal`, `distanceToPortal`, `formatDistance`, `sortRouteFromUserLocation` |
| Karte und Panel | `renderOverlays`, `renderPanel`, `scheduleMapDataPanelRefresh`, `focusBlocker`, `showPortalActions` |
| Export | `buildBlockerExport`, `exportData`, `buildPlanText`, `showExport` |

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
8. Panel, Kartenlayer, Einsatzcheck und Export verwenden denselben
   Laufzeitstand; fehlende Portalnamen werden anschließend asynchron
   nachgeladen.

## Standort- und Routenlogik

`setupUserLocationIntegration` bindet nur dann den Hook `pluginUserLocation`,
wenn das offizielle IITC-Plugin mit `getUser()` verfügbar ist. Ungültige Werte
und dessen initiale Position `0/0` werden ignoriert.

`getNextPortal` ermittelt bei jedem relevanten Standort- oder Statuswechsel das
nächste offene Portal nach Luftlinie. Diese dynamische Auswahl verändert die
gespeicherte Listenreihenfolge nicht. Erst **Ab Standort sortieren** schreibt
eine einmalig per Nearest-Neighbor-Heuristik berechnete Reihenfolge; erledigte
Portale werden dabei hinten angehängt.

`distanceToPortal` verwendet dieselbe gültige IITC-Position für die
Luftlinienentfernung zum nächsten Ziel. `formatDistance` rundet unter einem
Kilometer auf 10 Meter und darüber auf 0,1 Kilometer. Die gerundete Entfernung
gehört zum Laufzeitschlüssel der Zielzeile, sodass sie sich auch bei
unverändertem Zielportal aktualisiert. Ohne gültigen Standort wird keine
Entfernung angezeigt.

## Karten- und Blockerdarstellung

Blockierte Planlinks werden rot gestrichelt gezeichnet. Bei **zeigen** speichert
`focusBlocker` die Auswahl nur zur Laufzeit, hebt Planlink und Blocklink farblich
hervor, markiert den berechneten Kreuzungspunkt und bewegt die Karte dorthin.
Ein neuer Scan verwirft diese temporäre Auswahl.

Nach `mapDataRefreshEnd` rendert `scheduleMapDataPanelRefresh` das Panel
verzögert neu. Ein Kartenereignis-Fallback deckt IITC-Varianten ohne
zuverlässigen Hook ab. Dadurch erscheinen neu verfügbare Namen bereits
erkannter Blocker automatisch; die Blockergeometrie bleibt weiterhin die
Momentaufnahme des letzten Scans. Geöffnete Blocker-Details und der
Einsatzcheck werden beim Rendern beibehalten.

`getReadiness` fasst offene Endpunkte, blockierte Planlinks und fehlende Keys
als nicht einsatzbereit zusammen. Fehlende Namen, nicht auswertbare vorhandene
Links oder ein fehlender Plan führen zu einem Prüfhinweis. Ein positiver Status
lautet bewusst **Bereit (geladener Stand)**, weil IITC nur geladene Links
bereitstellt.

## Release- und Community-Datenfluss

Die Entwicklungsfassung liegt ausschließlich unter
`src/iitc-anchor-planner.user.js`. Nach einem bestätigten Praxistest wird
derselbe Inhalt in vier Distributionsdateien übernommen:

- `releases/iitc-anchor-planner-vX.Y.Z.user.js`,
- `releases/iitc-anchor-planner-vX.Y.Z.txt`,
- `releases/iitc-anchor-planner.user.js`,
- `releases/iitc-anchor-planner.txt`.

Die versionierten Dateien dokumentieren eine konkrete Freigabe. Die stabilen
Dateien ohne Versionsnummer bilden immer die zuletzt freigegebene Version und
sind das Ziel von `@updateURL` und `@downloadURL`.

Der Community-Katalog liest die stabile Userscript-Datei über
`metadata/emgeka/anchor-planner.yml`. Beim Katalogbau ersetzt IITC-CE die
Update- und Downloadadressen im erzeugten Plugin durch seine eigenen Dateien
unter `dist/emgeka/`. Die Community-ID wird dabei aus Dateiname und
Autorenordner als `anchor-planner@emgeka` gebildet.

Der Katalogeintrag ergänzt die Laufzeit-Metadaten um die Abhängigkeit
`draw-tools@breunigs`, die Empfehlung `bookmarks@ZasoGD` und die Anti-Features
`scraper|export`. Diese Angaben verändern den Plugin-Code nicht.

Die Einstufung `scraper` bezieht sich technisch auf `refreshMissingNames` und
`requestPortalDetails`: Fehlende Namen der im Scan erkannten Planportale werden
nacheinander über `window.portalDetail.request` beziehungsweise den defensiven
IITC-Fallback `window.requestPortalDetail` angefragt. Die Abfragen bleiben auf
den aktuellen Plan begrenzt und laufen nicht unabhängig im Hintergrund. Es
werden keine externen Scraping-Dienste angesprochen. Die Einstufung `highLoad`
ist daher für den aktuellen Ablauf nicht gesetzt.

## Technische Grenzen

- Räumliche Nähe allein beweist keine Portalidentität.
- Portalnamen und Adressen können erst nach Detailabfragen verfügbar sein.
- IITC- und Drittplugin-Objekte unterscheiden sich je nach Version und
  Ladezustand; Extraktion und Fallbacks sind deshalb bewusst defensiv.
- Link- und Blockerprüfung ist auf die aktuell geladenen `window.links`
  begrenzt.
- Die Standortgenauigkeit wird durch IITC beziehungsweise das Endgerät
  bestimmt und vom Anchor Planner nicht eigenständig verifiziert.
