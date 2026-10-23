# Bekannte Grenzen in 0.2.0-beta.31

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
- Die automatische Route nutzt eine begrenzte gemeinsame Luftliniensuche und garantiert keinen
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
- Import, Bestandsanzeige und Reset/Rücknahme wurden bis 0.2.0-beta.6 praktisch bestätigt (siehe Testszenarien). Automatischer Verbrauch in beta.7, getrennte Desktop-/Mobile-Abdeckung und übrige Beta-Szenarien stehen noch aus.
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
- Screenshot-/Videoerkennung und Übernahme in Keys wurden im echten IITC vom Nutzer bestätigt. Weitere Aufnahmen, Videoformate und getrennte Desktop-/Mobile-Abdeckung bleiben zu prüfen.
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
  Die Screenshot-Erkennung wurde anschließend auch im IITC-Praxistest bestätigt. Andere Fotos, verdeckte Namen,
  Scrollbewegungen oder kontrastarme Schrift können weiterhin zu Lücken führen.
- Dunkle Aufnahmen benötigen zwei Erkennungsdurchläufe je Bild; Videos können dadurch
  langsamer werden. Mehrdeutige Namensvarianten und unterschiedliche Mengen bleiben offen.

## Key-Rücknahme
- Nur die letzte AP-Import-/Reset-Änderung wird lokal gesichert; direkte manuelle Eingaben nicht. Ein neuer Vorgang mit tatsächlichen Änderungen ersetzt die Sicherung. Browserdaten löschen entfernt sie; Keys-Sync überträgt sie nicht auf andere Geräte.
- Teilfehler werden gemeldet und bleiben rücknehmbar; kein automatischer Rollback. Außerhalb des Plans können Portalnamen fehlen. Spätere Änderungen verlangen eine ausdrückliche Konfliktauswahl.
- Vollständiger Reset, IITC-Refresh und anschließende Wiederherstellung der vorherigen Mengen wurden vom Nutzer bestätigt. Konflikt- und Fehlerfälle sind automatisiert geprüft; getrennte Desktop-/Mobile-Abdeckung bleibt offen.

## Gesamtbestandsliste
- Keys speichert Mengen nach GUID, keine Portalnamen. Namen außerhalb von Plan, geladenen Portalen und Bookmarks können fehlen; diese Bestände werden trotzdem vollständig gezählt. Keine automatischen Detailabfragen. Nach Laden des Kartenausschnitts Aktualisieren wählen.
- Suche gilt für bekannte/angezeigte Namen; Gesamtzahlen bleiben der vollständige Bestand. Die neuen Texte verwenden außerhalb Deutsch/Englisch zunächst Englisch. Anzeige der übernommenen Videomengen im Gesamtbestand wurde vom Nutzer bestätigt. Getrennte Desktop-/Mobile-Abdeckung, Such-/Sortierbedienung und weitere Namensfälle bleiben zu prüfen.

## Automatischer Keyverbrauch
- Die Regel folgt ausdrücklich der Intel-Erkennung, nicht dem tatsächlichen ausführenden Spieler. Auch durch andere Spieler gebaute Links können den eigenen gespeicherten Bestand reduzieren. Ein zuvor wegen fehlender Abdeckung offener Link kann erst später erkannt werden.
- Unbestätigte Wurfrichtung, fehlende Intel-Linkidentität, unbekannter/null Bestand und Schreibunterbrechungen werden nicht automatisch nachgebucht. In Aufgaben den Bestand prüfen/korrigieren und als geprüft markieren.
- Buchungen sind lokale Beobachtungen; Keys-Sync überträgt Mengen, aber nicht das Buchungsjournal. Mehrere aktive Geräte/Tabs können daher dieselbe Beobachtung separat verarbeiten. Nach Browserdatenlöschung beginnt eine neue Basisaufnahme.
- Automatisierte Tests decken Übergänge und Doppelbuchungen ab; IITC-Praxistest des Verbrauchs bleibt offen.

## Planvorschau (vormals Walk Sim)
- Vorschau nur für die verbleibende Aufgabenroute. Änderungen/GPS während des Laufs werden erst beim erneuten Öffnen berücksichtigt. Nicht aufgelöste Aufgaben werden gezählt, ohne erfundene Stopps.
- Dreiecke sind geometrische Vorschauen; Eroberung, Feldüberlagerungen, Linklimits und Bauen unter Feldern werden nicht validiert. Unbestätigte Richtung, fehlende Koordinaten/Keys oder noch aktive Blocker verhindern den simulierten Wurf.
- Nach Schließen ist ein neuer Scan/Finalcheck erforderlich, um passive Link-/Keybeobachtungen wieder zu aktivieren. Dadurch können verspätete Kartenladungen aus der Vorschau keinen Bestand ändern.
- Automatisierte Simulation-/Timer-/Layerprüfungen; echter IITC-Desktop-/Mobile-Praxistest steht aus. Neue Texte verwenden außerhalb Deutsch/Englisch zunächst Englisch.

- Nutzer meldet ruckartige Animation bei einem großen Plan in beta.8. beta.9 ersetzt die bisherigen direkten Sprünge durch weiche Kartenbewegung und vermeidet den vollständigen Layer-Neuaufbau vorwärts. Die Wirkung bei großen Plänen und auf Mobilgeräten muss noch praktisch geprüft werden; Kartenladung und Gerätegeschwindigkeit beeinflussen weiterhin die Darstellung.

## Gemeinsame Routenverbesserung
- Der Nutzerplan in beta.9 bestätigte Gedenkstein → Ratskellersaal als Stopps 4/5 mit rund 9,2 km zusätzlicher Luftlinie und anschließendem Rückweg. beta.10 vergleicht vollständige Varianten; anonymisierte Geometrie als automatisierter Regressionstest, reale Portaldaten nur lokal für die Nachstellung.
- Automatischer Modus ab gültigem GPS- oder Portalursprung. Aufgaben → Route ab Standort verwendet GPS. Manuelle Reihenfolge bleibt auch dann erhalten, wenn sie einen längeren Weg erzeugt. Explizite Endportalwahlen können gemeinsame Abbauorte verhindern.
- Begrenzte lokale Verbesserung, kein globales Optimum. Höchstens 40 Planportale/80 Blocker, darüber bleibt der Ausgangsvorschlag. Keine Straßen-/Zugangsprüfung oder Eroberungs-/Linklimit-/Feldprüfung. Abbauportalwahl minimiert Strecke, nicht Besuchszahl.
- Reale Standortkoordinaten waren im Export nicht enthalten; verglichene Testursprünge sind Annahmen. Tatsächliche neue Reihenfolge/Strecke hängen vom Standort und gespeicherten Vorgaben ab. IITC-Desktop-/Mobile-Praxistest von beta.10 steht aus.

## Portalstart / Planvorschau
- Fester Startpunkt benötigt ein aufgelöstes Planportal mit Koordinaten. Bis zum Scan nach Refresh oder bei geändertem Plan kann es fehlen; Hinweis statt GPS-Ersatz.
- Startbesuch bestätigt keine Eroberung oder sofortige Wurffähigkeit. Die Route kann für Blocker-Abbau und späteren Wurf zum Start zurückkehren. Vorschau bleibt geometrisch und verändert keine realen Keys/Erledigungen.
- Die neue Bezeichnung ist Planvorschau. Startaktionen, fehlendes GPS, Reststrecke, Wiederbesuche und kompakte Darstellung sind automatisiert geprüft; Desktop-/Mobile-Praxistest ausstehend. Neue Portalstart-Texte außerhalb Deutsch/Englisch zunächst Englisch.

Die Aufgabenroute enthält nur Stopps mit verbleibenden Linkaufgaben oder Blocker-Abbau. Reine Empfangsportale und ungenutzte Richtungskandidaten bleiben im Plan sichtbar, werden aber nicht angefahren. Offene Richtungen bleiben als unbestätigte Linkaufgabe sichtbar. Ein ausdrücklich gewähltes Startportal bleibt als **Routenstart** erhalten, ohne erfundene Vorbereitung.

- Empfangsportale werden ohne konkrete Aufgabe übersprungen. Keymangel erzeugt keine automatische Farmroute; Portalübernahme und Aufrüstung werden weiterhin nicht als Aufgaben erkannt. Für einen erforderlichen Aufenthalt muss ein konkreter Arbeitsauftrag künftig ausdrücklich modelliert werden.

- Nutzer bestätigt in beta.12 die verbesserte Route, empfindet die Animation aber als zu schnell. beta.13 verlängert die Bewegung auf 2,5–5 Sekunden und passt den automatischen Schritttakt an. Praktische Wirkung auf Desktop/Mobile noch bestätigen; langsame Kartenladung kann weiterhin die Darstellung beeinflussen.

- beta.13 verlangsamte nur die Kamera. beta.14 animiert zusätzlich Weglinie/Marker. Tests prüfen Anfang, Zwischenstand, Ziel, Rückschritt und verworfene Frames; die visuelle Wirkung auf Desktop/Mobile bleibt praktisch zu prüfen. Die Vorschau zeigt Luftlinie, keine echte Straße.

- Nächste Aufgabe ist die erste konkrete Arbeit der Luftlinienroute, keine automatisch erkannte Ankunft. Manuell erledigte Wurfportale mit offenen Intel-Links erzeugen weiterhin Prüfaufgaben; Rücknahme über vollständige Aufgabenliste. Bei bewegtem GPS kann die Route nach bestehender 100-m-Regel wechseln. Desktop-/Mobile-Praxistest der neuen Ansicht ausstehend.
- Nutzer bestätigt die Weglinien-/Markeranimation in beta.14 als gelungen; Plattform nicht angegeben, keine getrennte Mobile-Abdeckung.

## Fächer-Entwurf in beta.16
- Ankersuche ist eine begrenzte Heuristik, kein globales Optimum. Höchstens 60 ausgewählte Portale; keine Bewertung von Wegen, Erreichbarkeit, Besitz, Schlüsselbedarf oder legaler Ingress-Baureihenfolge. Dreiecke zählen geometrisch, auch geschachtelte und Blattdreiecke.
- Nur geladene Portale/Links verfügbar. Auswahlflächen unterstützen einfache Polygone ohne Löcher; mehrere Flächen bilden eine gemeinsame Auswahl. Nach Übernahme werden alle dabei verwendeten Polygonränder im Scan ignoriert. Geänderte Ränder gelten als neue Zeichnung; Metadaten im Export enthalten.
- Nächster Anker als automatische Zuordnung kann ungünstig sein. Manuelle Zuordnung und Ankerwahl möglich; kreuzende oder überlappende Speichen erfordern Anpassung. Zu viele Anker können Fächer ohne Feld erzeugen. Vorhandene kreuzende Draw-Tools-Linien verhindern Ergänzung; gegebenenfalls ein anderes Projekt verwenden.
- Speicherfehler: neue Linien werden aus der Session entfernt und Speicherung erneut versucht. Scheitert auch diese, gespeicherten Draw-Tools-Stand vor einem Refresh prüfen. Kein vollautomatischer ausführbarer Mehrlagenplan; Wurfrichtungen ausdrücklich bestätigen.
- Automatisierte Geometrie-/Persistenz-/Rollbacktests bestanden. Echter IITC- und Mobile-Praxistest des Fächerdialogs ausstehend. Nächste Aufgabe aus beta.15 vom Nutzer im praktischen Test bestätigt; Mobile-Abdeckung weiterhin offen.

## Fächervorschau beta.17
Nutzer meldet keine sichtbaren vorgeschlagenen Felder in beta.16; genaue Dialogmeldung/Plattform noch nicht bekannt. Codeprüfung zeigt komplette Ausblendung bei Konflikten mit alten Zeichnungen sowie sehr schwache Feldfüllung. Beta.17 behebt beide Darstellungsprobleme; automatisierte Konflikt-/Übernahmesperrentests bestanden, Nutzerbestätigung ausstehend. Ein Entwurf ohne geometrische Felder oder mit ungültiger Geometrie bleibt mit Meldung unsichtbar.

## Leerer Fächerentwurf beta.18
Nutzerscreenshot zeigt drei Fächerportale ohne Anker und ohne Vorschlagszusammenfassung. In beta.17 löscht Portale laden den berechneten Entwurf; manuelles Anker vorschlagen wäre danach erforderlich. Beta.18 berechnet ihn automatisch nach Laden/Quellenwechsel, mit Fehleranzeige bei ungültiger Auswahl. Automatisierter Dialogtest bestanden; Praxistest ausstehend. Nach manueller Rollenänderung weiterhin Vorschau erforderlich.

## Native Fächerplanung beta.19
Draw Tools ist für Vorschlag/Übernahme nicht mehr nötig. Der eigene gespeicherte Plan hat Vorrang vor externen Zeichnungen; eigene Geometrie über Eigenen Fächerplan entfernen löschen, um Draw Tools wieder zu scannen. Alte in beta.16–18 ergänzte Linien bleiben dort erhalten. Stable kennt native Plangeometrie nicht; vor Rückwechsel exportieren. Maximal 60 Portale/heuristische Geometrie und ungeladene Intel-Lücken unverändert. Automatische Keybuchung verwendet weiterhin nur beobachtete Intel-Links; Übernahme verändert keine Keys. Echte IITC-/Mobile-Bestätigung steht aus.

## Plantrennung beta.20
Nutzer bestätigt beta.19 grundsätzlich; Plattform/Mobile-Abdeckung offen. Beta.20 bietet getrennte Bereiche und umschaltbare Geometrien. Polygonworkflow verwendet nur bereits geladene Portale; bei wenigen Portalen hineinzoomen/Intel laden und erneut Portale laden. Mehrere Flächen einzeln wählen, Löcher/Multipolygone unsupported. Alternative Quellen bleiben wählbar. Polygonfingerprints beruhen auf Koordinaten: Geänderter Rand ist eine neue Zeichnung und wird nicht automatisch vom externen Scan ausgeschlossen. Auswahlränder erst nach Übernahme ausgeschlossen.
Bestand und Portal-/Linkeinstellungen werden beim Planwechsel geteilt, nicht kopiert. Stable ignoriert Planquelle/native Geometrie: vor Rückwechsel exportieren. Ist Draw Tools nicht installiert, fehlt der externe Plan; gespeicherter Fächer bleibt verfügbar. Automatisierte Auswahl-/Umschalt-/Persistenz-/Fehlertests bestanden, echter IITC-/Mobile-Test der neuen Bedienung ausstehend.

## Fächernamen beta.21
Nutzer meldet zahlreiche unbekannte Namen; Screenshot aus beta.20 zeigt Polygon mit 76 Portalen, wenige aus vorheriger Planung benannt, übrige unbekannt. Ursache: Namensloader erfasste nur aktiven Arbeitsplan/Blocker, nicht den noch offenen Entwurf; Snapshots wurden nicht aktualisiert. Beta.21 deckt Entwürfe und persistente Namen ab. Alle 76 Namen können angefragt werden, auch wenn Geometrie wegen Grenze 60 nicht berechnet wird. Kleineres Polygon oder Ausschließen nötig; näher zoomen verkleinert ein festes Polygon nicht.
Detailanfragen bleiben sequentiell mit 900-ms-Pause und können für viele Portale dauern. Nicht verfügbare Intel-Namen bleiben ehrlich unbekannt, manuell erneut laden. Keine Garantie vollständiger Intel-/Netzwerkantworten. Automatisierte 76-GUID-/Persistenz-/Dedup-Tests bestanden, Nutzer-/Mobile-Bestätigung ausstehend.

## Oberfläche beta.22
Start zeigt jetzt nur zwei Funktionskarten plus globale Einstellungen; nach Refresh muss die gewünschte Arbeitsansicht geöffnet werden. Gespeicherte aktive Quelle/Geometrie bleibt erhalten, die zuletzt geöffnete Seite wird nicht gespeichert. Globale Datenlöschung entfernt beide lokalen Kontexte; ausdrücklich separater Einstellungsdialog, Draw Tools und Keys unverändert.
Return Home pausiert Finalcheck und beendet Vorschau/Importdialoge. Nur einmal geöffnete aktuelle Dialoghandles werden geschlossen; IITC-Varianten ohne JQuery-Dialoghandle verwenden defensive Fallbacks. Bestehende Bestand-/Routen-/Key-Logik bleibt gemeinsam. Kein echter Screenshot-/Mobile-Praxistest der neuen Oberfläche; automatisierte DOM-/Navigations-/Kontexttests und bestehende Verhaltensprüfungen erforderlich.

## Nicht generierender Fächerplaner beta.23
Nutzer bestätigt korrekte Polygonportale, meldet aber fehlende Fächerplanung, automatisch geladene alte Zustände und eine alte Blockercheck-Meldung. Ursachen im Code: Einstieg übersprang Generierung bei gespeichertem Plan; showFanPlanner kopierte alte Pins/Zuordnungen/Flächenauswahl; 60er-Grenze blockierte bekannte 76er-Auswahl. Beta.23 entfernt diese automatische Wiederaufnahme, isoliert Entwurfsdiagnosen und unterstützt bis 200 Portale.
End-to-end Regression mit 76 synthetischen Portalen und alter gespeicherter Geometrie: neue Fläche, keine alten Pins, generierte Felder, Übernahme, Refresh, Scan und Zeichnung vollständig. 200er-Fächer separat geprüft. Nutzerpolygon selbst liegt nicht als Koordinatendatei vor; tatsächlicher IITC-/Mobile-Praxistest weiterhin erforderlich. Winkel-Fächer über 60 ist bewusst begrenzt und liefert kein optimales Mehrlagennetz. Alte Pläne bleiben per ausdrücklicher Aktion abrufbar.

## Beta.24
Nutzer bestätigt frische Fächerplanung grundsätzlich, meldet driftende Keymarker bei Planvorschau. Ursache: Bildschirmpositionen nur beim Neuzeichnen/endgültigen Kartenstopp aktualisiert. Native Leaflet-Statusmarker ersetzen diesen Pfad; Fallback auf move, bei fehlenden Marker-/DivIcon-APIs eingeschränkte Zoomanimation. Echter Desktop-/Mobile-Animationsvergleich ausstehend.
Fraktionen stammen ausschließlich aus geladenem Intel und PLAYER; fehlen sie, relation unknown. Machina als eigene Fraktion, gegenüber RES/ENL gegnerisch. Bei unbekannter Fraktion bleiben bisherige Existenz-/Key-Regeln aus Kompatibilität erhalten; keine Garantie, dass ein unbekannter vorhandener Link nutzbar ist. Eigene Blocker brauchen reale Abstimmung/Umfärbung, kein automatischer Abbau oder Verfügbarkeitsnachweis. Keine Fraktionsfilter, die physische Blocker ausblenden. Klassifizierung sagt nichts über tatsächlichen Werfer/Inventar des Agenten aus; bestehende Teamlink-Verbrauchsregel gilt weiterhin.

## Ankeranzahl und Keyvorschläge beta.25
- Die gewünschte Ankeranzahl wird bei gültigen Eingaben exakt eingehalten, garantiert jedoch keinen geometrisch gültigen Fächer. Zu viele Anker können feldlose Gruppen oder kreuzende Speichen erzeugen; bestehende Fehler sperren weiter die Übernahme. Manuelle Anker und Zuordnungsziele zählen mit; Konflikte mit einer kleineren gewünschten Zahl müssen ausdrücklich gelöst werden. Ungültige/veraltete Anker-IDs können weiterhin Geometriefehler auslösen. Änderungen am Zahlenfeld entfernen bewusst den bisherigen Vorschlag bis zur Neuberechnung.
- Die Fächergeometrie/Ankerwahl optimiert keine Keys. Erst Wurfrichtungsvorschläge im übernommenen Arbeitsplan berücksichtigen vorhandene Zielbestände gemeinsam, abzüglich bestätigtem offenen Bedarf. Ein Vorschlag bestätigt keine Richtung und reduziert weder echten noch angezeigten Bestand; offene Richtungen behalten den geschätzten Bedarf an beiden Enden.
- Bei unzureichendem Gesamtbestand können Vorschläge weiterhin Keymangel enthalten. Unbekannter Bestand ist keine verfügbare Menge und wird nur gegenüber bekannt erschöpftem Fallback bevorzugt. Ohne geeignete offene Quelle bleibt der Link unbestätigt. Nach manuellem Bestands-/Richtungswechsel werden Vorschläge neu berechnet; ein bereits bestätigter Wurf wird nie automatisch umgekehrt.
- Kapazitätsmatching ist auf 600 unbestätigte Links und 200.000 Besuche begrenzt. Größere Pläne oder ausgeschöpftes Budget behalten einen Fallback ohne Garantie maximaler Keydeckung. Route, Keys, Portalbesitz, Zugang und gültige Ingress-Baufolge werden nicht gemeinsam optimiert. Bekannte positive Mengen garantieren keine Ausführbarkeit.
- Am 2026-10-22 bestätigte der Nutzer die gewünschte Ankeranzahl und keybewusste Wurfrichtung im praktischen Plugintest. Die Plattform wurde nicht genannt; getrennte Desktop-/Mobile-Abdeckung und vollständige Grenz-/Konfliktszenarien sind damit nicht belegt. Stable und releases bleiben 0.1.55.

## Gemeinsames Theme beta.26
- Der Nutzer beschreibt das bisherige Erscheinungsbild als uneinheitlich. Gemeinsame Theme-Tokens, Dialoghülle und Komponenten sollen Panel, Dialoginhalte und IITC-Dialograhmen vereinheitlichen. Diese Änderung korrigiert keine Plan-, Keys- oder Routinglogik; entsprechende bestehende Grenzen gelten weiter.
- Die Darstellung ist auf Pluginklassen begrenzt. Andere IITC-Themes, benutzerdefinierte Styles und unterschiedliche jQuery-/IITC-Mobile-Dialograhmen können dennoch abweichen. Dialogtitel, Schließen-Button, Fußaktionen, Fokus und Scrollverhalten müssen im tatsächlichen IITC geprüft werden.
- Lokale Browserprüfung am 2026-10-22: breite Panel-/Fächeransicht und zehn Ansichten bei 360×800 mit synthetischen Daten geprüft, ohne horizontalen Inhaltsüberlauf; Aufgabenbuttons nach Umbruchkorrektur lesbar, Tastaturfokus sichtbar. Der IITC-Dialograhmen war dabei simuliert. Ein lokales Browserbeispiel ersetzt keine echte IITC-/Mobile-Prüfung mit Nutzerplan, geladenen Portalen, Keys und fremden Overlays.
- Gemeinsame Farben verändern keine geographischen Marker-/Blockerfarben oder deren Statusbedeutung. Dynamische Inlinewerte für Positionen, Fortschritt oder Status bleiben erlaubt; statische Layoutreste künftig am gemeinsamen Theme abgleichen.

## Titelleistenregression beta.27
- Nutzer-Screenshot vom 2026-10-23 belegt leere Titelknöpfe und ein außerhalb liegendes × in beta.26. Ursache: position:static entfernt den Bezug für IITCs absolut positionierte Symbol-Pseudoelemente. Beta.27 korrigiert Position und Symbole. Die frühere vereinfachte Browser-Vorschau hatte diesen Fehler übersehen.
- Lokal am 2026-10-23 mit originaler IITC-Dialogimplementierung und Styles, jQuery 4.0.0/UI 1.14.2 auf Desktopbreite und 360×800 geprüft: Symbole, Ein-/Aufklappen, Schließen/Wiederöffnen, fremde Dialoge unverändert. Nutzerbestätigung und tatsächliche IITC-Mobile-Prüfung stehen aus.

## Regelmäßig unvollständiger Finalcheck beta.28
Nutzer meldet am 2026-10-23 regelmäßig unvollständige Finalchecks. Die Codeprüfung findet ein zu kurzes Acht-Sekunden-Limit sowie fehlende Cache-Abschlussprüfung; zudem wurden Zeitüberschreitungen als geprüfte Ansichten gezählt. Der konkrete Auslöser im aktuellen Nutzerplan ist noch nicht bestätigt. Beta.28 wartet bis zu 30 Sekunden, prüft passende vollständig gerenderte Cache-Abdeckung und bietet fehlgeschlagene Ansichten gezielt erneut an. Prüfzählung erfasst nur vollständige Ladungen; Ladeprobleme und Zwölf-Ansichten-Grenze werden getrennt erklärt.
Ohne verlässliche Ladehooks und ohne lesbaren IITC-Requeststatus bleibt der Check bewusst unvollständig. Serverfehler, veraltete Tiles, fehlende Abdeckung oder mehr als zwölf nötige Ansichten bleiben echte Grenzen; die Warnung wird dann nicht unterdrückt. Neue Ergebnistexte sind DE/EN, weitere Sprachen vorerst Englisch. Deterministische Regressionstests decken langsame Ladung, Cache, Queuezustände, Fehler/Timeout, Wiederholung/Reload und Begrenzung ab; tatsächlicher Desktop-/Mobile-Praxistest steht aus.

Nutzer nennt im Einsatzcheck einen unbestätigten Planlink, zwei fehlende Keys und 2672 geladene vorhandene Links. Diese Zusammenfassung enthält keinen Nachweis des konkreten Ladefehlers. Die neue Ursachen-/Erfolgsdiagnose bleibt deshalb auch bei erneutem Panelrendern unter Mehr sichtbar. Keymangel ist unabhängig vom Vollständigkeitsstatus des Blockerchecks.

## Sichtbarer Zielplan beta.29
Der Nutzer beschreibt die Planvorschau als reine Wegdarstellung. Bisher erschienen simulierte Feldflächen nur nach ausführbaren Würfen mit bestätigter Richtung/Keys; der externe Arbeitsmodus zeichnete hauptsächlich Blocker statt vollständiger Zielfelder. Beta.29 ergänzt unabhängig davon einen violetten geometrischen Zielplan und trennt orange Route/cyanfarbenen Baufortschritt mit Legende. Unaufgelöste Endpunkte können keine sicheren Zielfelder bilden; offene/entartete Dreiecke bleiben ungefüllt. Dichte Pläne erhalten alle aufgelösten Kanten, aber maximal 2000 Flächen bzw. 200000 Suchprüfungen; Hinweis bei Begrenzung. Keine AP-Schätzung oder Garantie tatsächlicher Ingress-Felder.
Die geometrische Zielzeichnung enthält auch bestehende Plankanten/Felder. Simulationszähler zählen weiterhin ausschließlich neu simulierte Arbeit und können bei fehlenden Keys/Richtungen null bleiben. Native gespeicherte Pläne und externe Geometrie bleiben getrennt. Ein lokaler Leaflet-/IITC-Dialogtest mit synthetischer Geometrie ersetzt keine echte Intel-/IITC-Mobile-Prüfung.
Nutzer bestätigt am 2026-10-23 die verbesserte Finalcheck-Darstellung aus beta.28; die gemeldete Plattform und vollständige Grenzfallabdeckung bleiben unbekannt.

Lokale Browserprüfung am 2026-10-23 mit Leaflet und originalen IITC-Dialogen, synthetischem Dreiportalplan: violette Zielgeometrie (vier Pfade), orange Route und cyanfarbener Wurf getrennt sichtbar. Ohne Keys bleibt der Zielplan bei null simulierten Würfen; nach Schließen keine Routen-/Fortschrittspfade, Zielplan wiederhergestellt. Bei 360×800 kein horizontaler Überlauf und alle drei Legendeneinträge innerhalb des Dialogs. Dies ist keine authentifizierte Intel- oder tatsächliche Mobile-Prüfung.

## Überladene Blockerkarte beta.30
Nutzer-Screenshot zeigt, dass zahlreiche kräftige Blockerlinien und gelbe Kreuzungsmarker den violetten Zielplan verdecken. Beta.30 stellt alle Blocker standardmäßig dezent dar und zeigt nur die ausgewählte Verbindung kräftig. Vollansicht bleibt ausdrücklich zuschaltbar und kann bei großen Plänen weiterhin dicht sein. Intel-/Fremdplugin-Flächen sowie Key-/Portalmarker bleiben erhalten; diese Änderung kann deren Überlagerungen nicht beseitigen.
Automatisierte Prüfungen sichern unveränderte Aufgaben/Bestände und Fraktionen, stille/volle/gewählte Darstellung und synchronisierte Controls. Lokale Browserprüfung 2026-10-23 mit Leaflet und originalen IITC-Dialogen, synthetischem Plan mit zwölf Blockern: 0 Schnittpunktmarker dezent, 22 unterschiedliche Marker in Vollansicht, 1 bei Auswahl; Aufheben entfernt den Fokus. Bei 360×800 zwei 155×44-px-Schalter ohne horizontalen Überlauf. Kein tatsächlicher Intel-/IITC-Mobile-Praxistest dieser Änderung.

## Fächerentwurf noch cyan dargestellt beta.31
Der Nutzer-Screenshot zeigt den offenen Fächerplaner mit 63 Portalen, 124 Links und 62 geometrischen Feldern. Die frühere Farbumstellung betraf den übernommenen Arbeitsplan; der Entwurf verwendete noch eine eigene Palette. Beta.31 vereinheitlicht diesen verbleibenden Renderingpfad und ergänzt dieselbe Zielplan-Legende. Bestehende grüne Intel-Felder bleiben unabhängig sichtbar; geometrische Flächen beweisen weiterhin keine gültige Ingress-Baufolge. Weiße Anker und Zuordnungstabelle erhalten die Rolleninformation; die alte Fächerfarbpalette entfällt.
Automatisierte Prüfungen sichern gemeinsame Farbe/Pane/Strichmuster/Feldfüllung, Legende, unveränderte gespeicherte Daten/Keys/Draw Tools und Cleanup. Tatsächliche IITC-/Mobile-Bestätigung steht aus.

Lokale Browserprüfung 2026-10-23 mit Leaflet und originalen IITC-Dialogen, synthetischem Dreiportalentwurf: gefüllte violette Fläche und drei gestrichelte violette Kanten im gemeinsamen Zielpane, weiße Ankermarkierung und Zielplan-Legende vorhanden. Legende bei 360×800 erreichbar und ohne horizontalen Seitenüberlauf. Kein authentifizierter Intel-/IITC-Mobile-Test.
