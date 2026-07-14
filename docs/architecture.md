# Architekturübersicht 0.1.35

Das Plugin ist derzeit als einzelnes IITC-Userscript aufgebaut. Es verwendet
den Namespace `window.plugin.anchorPlanner`, intern abgekürzt als `ap`.

## Zustände

- `ap.state`: dauerhaft gespeicherte Einstellungen, Ankerzustände,
  Filterauswahl und manuelle Endpunktzuordnungen.
- `ap.runtime`: nur zur Laufzeit benötigte Layer, Statistiken, Links,
  ungelöste Endpunkte und Overlays.
- Speicherung über `localStorage` mit dem Schlüssel
  `plugin-anchor-planner-v1`.

## Funktionsbereiche

| Bereich | Zentrale Funktionen |
| --- | --- |
| Portal- und Namensdaten | `getLoadedPortals`, `getPortalTitleFromMarker`, `requestPortalDetails`, `refreshMissingNames` |
| Bookmarks | `collectPortalBookmarks`, `mergePortalSources` |
| Draw Tools | `collectDrawToolLayers`, `collectDrawToolPointLayers`, `extractSegments` |
| Endpunktzuordnung | `portalCandidatesForEndpoint`, `drawToolPointCandidatesForEndpoint`, `assignEndpointToPortal` |
| Linkanalyse | `collectExistingLinkIds`, `properSegmentsIntersect`, `findBlockersForPlannedLink` |
| Planberechnung | `scan`, `getStatus`, `sortedStats`, `normalizeRouteOrder` |
| Karte und Panel | `renderOverlays`, `renderPanel`, `showPortalActions` |
| Export | `exportData`, `buildPlanText`, `showExport` |

## Datenfluss

1. Draw-Tools-Layer und Punktobjekte werden gesammelt.
2. Geladene Portale und Bookmarks werden zu einer Kandidatenmenge vereinigt.
3. Segmentendpunkte werden per GUID, manueller Zuweisung oder räumlicher Nähe
   aufgelöst.
4. Vorhandene Intel-Links werden normalisiert und mit dem Plan verglichen.
5. `scan` erzeugt Statistiken, Linkzustände und ungelöste Endpunkte.
6. Panel, Kartenoverlays und Export verwenden diesen Laufzeitstand.

## Technische Risiken

- IITC- und Drittplugin-Objekte unterscheiden sich je nach Version und
  Ladezustand. Die vielen defensiven Extraktionspfade sind deshalb bewusst.
- Räumliche Nähe allein beweist keine Portalidentität.
- Portalnamen und -adressen können erst nach Detailabfragen verfügbar sein.
- Geometrische Blockerprüfung hängt davon ab, welche `window.links` aktuell
  geladen sind; ein nicht erkannter Blocker ist daher nicht automatisch
  ausgeschlossen.

