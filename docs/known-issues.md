# Bekannte Grenzen in 0.1.43

## Portalzuordnung und Namen

- Bei unvollständig geladenem Kartenausschnitt können Draw-Tools-Endpunkte ohne
  direkt verfügbares Portal bleiben. Zoomen, Laden der Portale und ein erneuter
  Scan können erforderlich sein.
- Eine Kandidatenliste und ein offener Endpunkt sind einer stillen falschen
  Zuordnung vorzuziehen.
- Portalnamen sind erst verfügbar, nachdem IITC die Portale beziehungsweise
  deren Details geladen hat. Bis dahin werden in Blocker-Details Koordinaten
  statt technischer GUIDs angezeigt.
- Nach dem Hineinzoomen werden neu verfügbare Namen bereits erkannter Blocker
  automatisch aktualisiert. Neu geladene Blocklinks selbst erfordern weiterhin
  einen erneuten Scan.

## Abdeckung vorhandener Links und Blocker

- Blockerprüfung und Erkennung vorhandener Planlinks werten ausschließlich die
  aktuell in IITC geladenen `window.links` aus.
- „Nicht bestätigt“ bedeutet daher nicht sicher „nicht vorhanden“; ebenso ist
  ein nicht gefundener Blocker keine vollständige Entwarnung.
- Blocker-Details und Exporte dokumentieren diese begrenzte Datenabdeckung.
- Der Kartenfokus verwendet einen geometrisch berechneten Kreuzungspunkt. Kann
  dieser nicht bestimmt werden, bleibt die Karte unverändert und das Panel
  meldet den Fehler.

## Standort und Route

- Die dynamische Zielwahl funktioniert nur mit dem offiziellen
  IITC-User-Location-Plugin und einem von diesem gelieferten gültigen Standort.
- Ohne Standort bleibt die gespeicherte manuelle Reihenfolge maßgeblich.
- Der Anchor Planner erhält keine unabhängige Aussage zur GPS-Genauigkeit. Das
  geografisch nächste Portal kann bei ungenauer IITC-Position falsch sein.
- Die angezeigte Entfernung ist eine gerundete Luftlinie vom zuletzt durch
  IITC bestätigten Standort und keine Straßen-, Geh- oder Fahrstrecke.
- **Ab Standort sortieren** ist eine Luftlinien-Näherung und keine
  straßenbasierte Routenoptimierung. Spätere Standortänderungen sortieren die
  sichtbare Liste nicht automatisch neu, beeinflussen aber das dynamische
  nächste Portal.
- Standortdaten werden nur zur Laufzeit gehalten und weder gespeichert noch
  exportiert.

## Diagnose und Zähler

- `Draw-Tools-Punkte: 0` kann trotz korrekt erkannter Liniensegmente richtig
  sein: Gezählt werden nur separate Draw-Tools-Punkt- oder Markerobjekte.
- Die Anzahl verfügbarer Bookmarks ist nicht gleich der Anzahl der für den Plan
  verwendeten Bookmark-Treffer. Ein Bookmark kann an mehreren Endpunkten
  verwendet werden.
- Die Filterzähler **Alle**, **Offen**, **Blockiert**, **Keys fehlen** und
  **Erledigt** beziehen sich auf Planportale. Ein Planlink besitzt zwei
  Endportale und kann daher bei beiden Portalen zum Status beitragen.
- **Bereit (geladener Stand)** ist keine vollständige Entwarnung für außerhalb
  des aktuellen IITC-Kartenstands liegende vorhandene Links oder Blocker.

## Desktop und Mobil

- Nach Änderungen an Panel oder Exportdialog ist weiterhin zu prüfen, ob das
  letzte Portal erreichbar bleibt und IITC-Statusleisten nicht überdeckt
  werden.
- Overlay- und Badge-Z-Index müssen mit IITC-Panels und Bookmark-Markern auf
  Desktop und Mobilgeräten geprüft werden.
- Externe Navigation hängt davon ab, welche Karten-Apps und URL-Schemata das
  jeweilige Mobilgerät unterstützt.

## Installation und Updates

- Die stabile Updateadresse folgt dem `main`-Branch des Projekt-Repositorys.
  Sie darf deshalb nur durch einen vollständigen, getesteten Release aktualisiert
  werden.
- GitHub-Rohdateien und heruntergeladene Release-Anhänge können wegen
  unterschiedlicher LF/CRLF-Zeilenenden verschiedene Prüfsummen besitzen,
  obwohl der JavaScript-Inhalt gleich ist.
- Die Aufnahme oder Aktualisierung im IITC Community Plugins-Katalog wird erst
  nach Prüfung und Übernahme des zugehörigen Community-PR wirksam.
- Nach der Aufnahme liefert der Community-Katalog eine von IITC-CE erzeugte
  Kopie mit eigener Update- und Downloadadresse aus. Das Quell-Userscript bleibt
  weiterhin im Projekt-Repository maßgeblich.

## Bedeutung des Anti-Features `scraper`

- `scraper` ist die Bezeichnung des IITC Community Plugins-Katalogs für
  zusätzliche Detailanfragen zu Portalen, die der Nutzer nicht einzeln
  angeklickt hat.
- Anchor Planner verwendet diese Anfragen nur für fehlende Namen erkannter
  Planportale. Sie werden nach einem Scan automatisch oder über **Namen laden**
  nacheinander über IITCs Portal-Detailfunktionen ausgeführt.
- Das Plugin durchsucht keine externen Webseiten und sammelt nicht dauerhaft
  unabhängig vom aktuellen Plan weiter.
- `highLoad` ist nicht deklariert, weil keine kontinuierliche oder
  massenhafte Intel-Abfragefunktion vorhanden ist.
