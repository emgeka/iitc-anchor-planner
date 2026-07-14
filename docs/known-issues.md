# Bekannte und historisch relevante Punkte

## Portalzuordnung

- Bei unvollständig geladenem Kartenausschnitt können Draw-Tools-Endpunkte ohne
  direkt verfügbares Portal bleiben.
- Historischer Testfall: Endpunkt `52.209596, 9.704723`; ein ungefähr 198 Meter
  entferntes geladenes Portal „Sportzentrum“ durfte nicht als sichere
  Entsprechung des tatsächlich geplanten Portals behandelt werden.
- Eine Kandidatenliste und manuelle Zuordnung sind einer stillen falschen
  Zuordnung vorzuziehen.

## Diagnoseanzeige

- `Draw-Tools-Punkte: 0` kann trotz korrekt erkannter Liniensegmente richtig
  sein: gezählt werden nur separate Draw-Tools-Punkt-/Markerobjekte.
- Die Anzahl verfügbarer Bookmarks ist nicht gleich der Anzahl der Bookmarks,
  die für den aktuellen Plan verwendet werden.
- Ein Bookmark-Treffer kann an mehreren Linkendpunkten auftreten.

## Abdeckung der Intel-Daten

- Blockerprüfung und Erkennung vorhandener Links können nur die aktuell in IITC
  geladenen `window.links` auswerten.
- Fehlende Bestätigung muss von „nicht vorhanden“ oder „nicht blockiert“
  unterschieden werden.

## Mobile Oberfläche

- Nach Änderungen an Panel oder Exportdialog prüfen, ob das letzte Portal
  erreichbar bleibt und Statusleisten nicht überdeckt werden.
- Overlay- und Badge-Z-Index sowohl mit IITC-Panels als auch mit
  Bookmark-Markern testen.

