# Bekannte Grenzen in 0.2.0-beta.4

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
- Fehlende Namen von Planportalen und bereits erkannten Blocker-Endportalen
  werden nach einem Scan automatisch nacheinander über IITC abgefragt.
  **Namen laden** erlaubt eine manuelle Wiederholung. Liefert IITC für ein
  Portal weiterhin keine Details, bleibt dort die Koordinaten-Ersatzanzeige
  bestehen.
- **Details anzeigen** arbeitet bewusst nur mit bereits geladenen IITC-
  Portalmarkern. IITC darf beim ausdrücklichen Klick fehlende oder veraltete
  Details nachladen; ein Aufgabenname bedeutet nicht, dass IITCs
  Detaildatensatz bereits vollständig geladen ist.
  Für ausschließlich aus Bookmarks bekannte oder nicht mehr geladene Planportale
  zeigt die IITC-Detailansicht stattdessen eine Verfügbarkeitsmeldung und das Panel meldet
  die fehlende Verfügbarkeit. Es wird kein nahegelegenes Ersatzportal gewählt.

## Abdeckung vorhandener Links und Blocker

- Blockerprüfung und Erkennung vorhandener Planlinks werten ausschließlich die
  aktuell in IITC geladenen `window.links` aus.
- „Nicht bestätigt“ bedeutet daher nicht sicher „nicht vorhanden“; ebenso ist
  ein nicht gefundener Blocker keine vollständige Entwarnung.
- Der Einsatzcheck nennt die Zahl geladener vorhandener Links; Dokumentation
  und Exporte erläutern die begrenzte Datenabdeckung.
- Automatisch hervorgehobene Blocklinks bleiben die Momentaufnahme des letzten
  Scans. Nach dem Laden weiterer IITC-Links ist ein erneuter Scan erforderlich.
- Der optionale **Finalcheck** verbessert diese Abdeckung für noch nicht
  bestätigte Planlinks, indem er höchstens zwölf Ansichten auf einer
  Zoomstufe ohne Linklängenfilter lädt. Bereits erkannte vorhandene Planlinks
  werden bewusst nicht erneut geprüft.
- Während des Finalchecks bewegt sich die Karte vorübergehend; Mittelpunkt und
  Zoomstufe werden danach wiederhergestellt. Benötigt der Plan mehr als zwölf
  Ansichten oder endet eine IITC-Ladung nicht rechtzeitig, bleibt der Lauf
  ausdrücklich unvollständig und wird entsprechend angezeigt; er ist nicht mit
  einem noch nie gestarteten, ausstehenden Check gleichgesetzt.
- Nach jedem gemeldeten Ladeende wartet der Finalcheck kurz auf verspätete
  IITC-Link-Layer-Ereignisse. Serverseitig noch später oder gar nicht gelieferte
  Links bleiben dennoch außerhalb der Erkennungsmöglichkeiten des Plugins.
- Pausierte Zwischenstände sind nur für denselben unveränderten Satz noch nicht
  bestätigter Planlinks fortsetzbar. Nach einer Planänderung wird der alte
  Zwischenstand bewusst verworfen.
- Auch ein vollständig durchgelaufener Finalcheck ist keine mathematische
  Garantie gegen serverseitig fehlende, verzögerte oder anderweitig nicht von
  IITC gelieferte Daten.
- Jeder Blocklink besitzt zwei gleichwertige Endportale. Die Arbeitsliste kann
  deshalb nur nach der Zahl betroffener Blocklinks priorisieren; welches Portal
  praktisch zum Beseitigen eines Links geeignet ist, entscheidet der Nutzer.

## Standort und Route

- Die standortbezogene Routenplanung für Plan- und Blocker-Portale
  funktioniert nur mit dem offiziellen IITC-User-Location-Plugin und einem von
  diesem gelieferten gültigen Standort.
- Ohne Standort bleibt die gespeicherte manuelle Reihenfolge maßgeblich.
- Der Anchor Planner erhält keine unabhängige Aussage zur GPS-Genauigkeit. Das
  geografisch nächste Portal kann bei ungenauer IITC-Position falsch sein.
- Zielentfernung und geschätzte Reststrecke sind Luftlinien-Näherungen und keine
  Straßen-, Geh- oder Fahrstrecken.
- **Ab Standort sortieren** ist eine Luftlinien-Näherung und keine
  straßenbasierte Routenoptimierung. Spätere Standortänderungen sortieren die
  gespeicherte Liste nicht automatisch neu. Der Aufgabenmodus verwendet
  entweder diese Reihenfolge oder einen eigenen Standortvorschlag mit
  100-m-Neuberechnungsschwelle; es gibt keine automatische Ankunftserkennung.
- Blocker-Einfügung ist eine gierige Luftlinienheuristik und garantiert keinen
  kürzesten Weg. Sie prüft geometrische Blocker-Abhängigkeiten, aber keine
  Eroberung, Erreichbarkeit über Straßen, Linklimits oder das Linken unter
  bereits gebauten Feldern. Offene Wurfrichtungen benötigen weiterhin eine
  Bestätigung des vorausgewählten Vorschlags oder eine eigene
  Entscheidung; Keybedarf an ihren beiden Endportalen bleibt eine Schätzung.
- Manuelle Abbau-Meldungen sind keine Intel-Bestätigung. Ein weiterhin im
  Scan beobachteter Blocklink bleibt im Einsatzcheck blockierend; nach einem
  neuen Scan/Finalcheck kann sich der beobachtete Stand ändern. Bloße
  Abwesenheit im geladenen Ausschnitt wird nicht als bestätigter Abbau gewertet.
- Wenn das Wurfportal manuell erledigt ist, seine Planlinks jedoch weiterhin
  fehlen, bleiben diese Aufgaben als nicht eingeplant sichtbar. Den
  Erledigt-Status zurücknehmen oder den Intel-Stand erneut prüfen.
- Desktop-IITC- und IITC-Mobile-Praxistests für 0.2.0-beta.4 stehen noch aus.
- Standortdaten werden nur zur Laufzeit gehalten und weder gespeichert noch
  exportiert.
- Vorgemerkte Blocker-Portale werden nur berücksichtigt, solange sie weiterhin
  zur Blocker-Arbeitsliste des aktuellen Scans gehören. Dadurch erzeugen alte
  Vormerkungen keine unsichtbaren Routenziele.

- Die kompakte Aufgabentabelle zeigt zugeordnete Linkaufträge und benötigte
  Blocker je Besuch, keine garantierte ausführbare Baufolge. `~` am Keybedarf
  kennzeichnet weiterhin offene Wurfrichtungen. Einzelheiten und manuelle
  Erledigung sind über den Pfeil an der Positionsnummer erreichbar.

## Diagnose und Zähler

- `Draw-Tools-Punkte: 0` kann trotz korrekt erkannter Liniensegmente richtig
  sein: Gezählt werden nur separate Draw-Tools-Punkt- oder Markerobjekte.
- Die Anzahl verfügbarer Bookmarks ist nicht gleich der Anzahl der für den Plan
  verwendeten Bookmark-Treffer. Ein Bookmark kann an mehreren Endpunkten
  verwendet werden.
- Die Filterzähler **Alle**, **Offen**, **Blockiert**, **Keys fehlen** und
  **Erledigt** beziehen sich auf Planportale. Ein Planlink besitzt zwei
  Endportale und kann daher bei beiden Portalen zum Status beitragen.
- Eine manuelle Filterauswahl bleibt bis zum nächsten Scan erhalten. Jeder
  neue Scan zeigt anschließend wieder **Alle**, damit ein älterer oder mobil
  versehentlich aktivierter Filter die neue Portalliste nicht verdeckt.
- **Offen** bezeichnet Planportale mit mindestens einem noch nicht vorhandenen
  Planlink. Nicht erledigte Portale, deren Planlinks bereits vollständig
  bestehen, erscheinen daher nur unter **Alle** und nicht als automatisches
  Arbeitsziel.
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

- `beta-builds/` bietet einen eigenen Beta-Updatekanal; `src/` enthält weiterhin
  Stable-Update-Adressen und darf nicht als Beta-Installation beworben werden.
  Beta und Stable teilen Namespace und gespeicherten Zustand. Vor Rückkehr zu
  Stable den Plan exportieren; Stable berücksichtigt die neuen Richtungen und
  Blocker-Aufgabeneinstellungen nicht. Beide Varianten nicht parallel betreiben.
- CI überprüft technische Branch-Regeln, ersetzt jedoch keine bestätigten
  IITC-Praxistests und ist ohne separat konfigurierte GitHub-Branch-Schutzregel
  keine serverseitige Merge-Sperre.
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
  Planportale und Blocker-Endportale. Beide Gruppen werden nach einem Scan
  automatisch gemeinsam und nacheinander über IITCs Portal-Detailfunktionen
  verarbeitet; **Namen laden** wiederholt denselben Ablauf ausdrücklich.
- Das Plugin durchsucht keine externen Webseiten und sammelt nicht dauerhaft
  unabhängig vom aktuellen Plan weiter.
- `highLoad` ist nicht deklariert, weil keine kontinuierliche oder
  massenhafte Intel-Abfragefunktion vorhanden ist. Der nur durch Nutzeraktion
  gestartete Finalcheck ist auf zwölf normale IITC-Kartenansichten begrenzt
  und stellt keine eigenen Intel-Tile-Anfragen.

## Keyimport-Entwurf
- OCR-/Video-Praxistest mit echten Ingress-Dateien auf Desktop und Mobile steht aus.
- Erkennung derzeit Englisch/Deutsch, exakte Namen oder eindeutige sichtbare Kürzung;
  OCR-Tippfehler werden bewusst nicht unscharf zugeordnet. Unbekannte Planportale fehlen
  in der Prüftabelle. Neue Importtexte außerhalb Deutsch/Englisch verwenden Englisch.
- Höchstens 10 Dateien, 150 MB je Datei, 2 Minuten je Video; Browser-Codecs variieren.
  Ein Bild pro Sekunde kann schnell überscrollte Einträge verpassen. Ein Worker reduziert
  Speicherbedarf, kann auf Mobilgeräten aber langsam sein. Erstdownload benötigt Internet.
- Abbrechen wartet auf einen laufenden OCR-Schritt; Ergebnisse werden danach verworfen.
- Teilweise erfolgreiche Keys-Schreibvorgänge werden als solche gemeldet; es gibt keinen
  automatischen Rollback. Nicht ausgewählte und nicht erkannte Bestände bleiben erhalten.

- Der bereitgestellte echte Screenshot wurde lokal mit Tesseract.js 5.1.1 und der
  tatsächlichen neuen Vorverarbeitung/Zuordnung geprüft: fünf Mengen korrekt erkannt.
  Der integrierte IITC-/Mobile-Praxistest bleibt offen. Andere Fotos, verdeckte Namen,
  Scrollbewegungen oder kontrastarme Schrift können weiterhin zu Lücken führen.
- Dunkle Aufnahmen benötigen zwei Erkennungsdurchläufe je Bild; Videos können dadurch
  langsamer werden. Mehrdeutige Namensvarianten und unterschiedliche Mengen bleiben offen.
