# Bekannte Grenzen in 0.1.48

## Portalzuordnung und Namen

- Bei unvollständig geladenem Kartenausschnitt können Draw-Tools-Endpunkte ohne
  direkt verfügbares Portal bleiben. Zoomen, Laden der Portale und ein erneuter
  Scan können erforderlich sein.
- Eine Kandidatenliste und ein offener Endpunkt sind einer stillen falschen
  Zuordnung vorzuziehen.
- Portalnamen sind erst verfügbar, nachdem IITC die Portale beziehungsweise
  deren Details geladen hat. Bis dahin werden im Blockerbereich Koordinaten
  statt technischer GUIDs angezeigt.
- Nach dem Hineinzoomen werden neu verfügbare Namen bereits erkannter Blocker
  automatisch aktualisiert. Neu geladene Blocklinks selbst erfordern weiterhin
  einen erneuten Scan.

## Abdeckung vorhandener Links und Blocker

- Blockerprüfung und Erkennung vorhandener Planlinks werten ausschließlich die
  aktuell in IITC geladenen `window.links` aus.
- „Nicht bestätigt“ bedeutet daher nicht sicher „nicht vorhanden“; ebenso ist
  ein nicht gefundener Blocker keine vollständige Entwarnung.
- Der Einsatzcheck nennt die Zahl geladener vorhandener Links; Dokumentation
  und Exporte erläutern die begrenzte Datenabdeckung.
- Automatisch hervorgehobene Blocklinks bleiben die Momentaufnahme des letzten
  Scans. Nach dem Laden weiterer IITC-Links ist ein erneuter Scan erforderlich.
- Jeder Blocklink besitzt zwei gleichwertige Endportale. Die Arbeitsliste kann
  deshalb nur nach der Zahl betroffener Blocklinks priorisieren; welches Portal
  praktisch zum Beseitigen eines Links geeignet ist, entscheidet der Nutzer.

## Standort und Route

- Die dynamische Zielwahl für Plan- und vorgemerkte Blocker-Portale
  funktioniert nur mit dem offiziellen IITC-User-Location-Plugin und einem von
  diesem gelieferten gültigen Standort.
- Ohne Standort bleibt die gespeicherte manuelle Reihenfolge maßgeblich.
- Der Anchor Planner erhält keine unabhängige Aussage zur GPS-Genauigkeit. Das
  geografisch nächste Portal kann bei ungenauer IITC-Position falsch sein.
- Zielentfernung und geschätzte Reststrecke sind Luftlinien-Näherungen und keine
  Straßen-, Geh- oder Fahrstrecken.
- **Ab Standort sortieren** ist eine Luftlinien-Näherung und keine
  straßenbasierte Routenoptimierung. Spätere Standortänderungen sortieren die
  sichtbare Liste nicht automatisch neu, beeinflussen aber das dynamische
  nächste Portal.
- Standortdaten werden nur zur Laufzeit gehalten und weder gespeichert noch
  exportiert.
- Vorgemerkte Blocker-Portale werden nur berücksichtigt, solange sie weiterhin
  zur Blocker-Arbeitsliste des aktuellen Scans gehören. Dadurch erzeugen alte
  Vormerkungen keine unsichtbaren Routenziele.

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

- Die gespeicherte Panelposition bezieht sich auf Viewport-Koordinaten. Wird
  der Viewport oder die Panelhöhe kleiner, verschiebt die automatische
  Korrektur das Panel dauerhaft bis zum nächsten zulässigen Rand.
- Nach Änderungen an Panel oder Exportdialog ist weiterhin zu prüfen, ob das
  letzte Portal erreichbar bleibt und IITC-Statusleisten nicht überdeckt
  werden.
- Overlay- und Badge-Z-Index müssen mit IITC-Panels und Bookmark-Markern auf
  Desktop und Mobilgeräten geprüft werden.
- Externe Navigation hängt davon ab, welche Karten-Apps und URL-Schemata das
  jeweilige Mobilgerät unterstützt.

## Sprachen

- Automatische Spracherkennung ist auf die gebündelten Sprachcodes begrenzt;
  nicht unterstützte Browser- und Seitensprachen fallen auf Englisch zurück.
- Regionale Sprachvarianten werden nur dann gezielt unterschieden, wenn eine
  entsprechende Sprachdatei vorhanden ist. Aktuell ist Portugiesisch als
  `pt-BR` und vereinfachtes Chinesisch als `zh-CN` enthalten.
- Die kompakte Plurallogik unterscheidet `one` und `other`. Sprachen mit
  weiteren grammatischen Pluralkategorien verwenden deshalb bewusst neutrale
  oder allgemein verständliche Formulierungen.
- Neue oder überarbeitete Übersetzungen sollten zusätzlich von
  Muttersprachlern geprüft werden; die technischen Prüfungen erkennen
  Schlüssel- und Platzhalterfehler, aber keine sprachlichen Bedeutungsfehler.
- Lange Beschriftungen und nichtlateinische Schriften müssen bei Änderungen
  weiterhin praktisch auf schmalen IITC-Mobile-Displays geprüft werden.

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
