# Anforderungen für Entwicklungsstand 0.2.0-beta.16

Stabile Veröffentlichung: 0.1.55. Der folgende Entwicklungsstand benötigt noch
bestätigte Praxistests auf Desktop-IITC und IITC Mobile.

## Planerfassung und Portalauflösung

- Draw-Tools-Geometrien einschließlich Auto-Draw-Linien erkennen.
- Linien in eindeutige geplante Segmente und Endpunkte zerlegen.
- Geladene IITC-Portale und Portal-Bookmarks zur Auflösung heranziehen.
- Auch gegnerische, niedrigstufige oder aktuell nicht linkfähige Planportale
  berücksichtigen.
- Offene Endpunkte mit Koordinaten, nächsten Portal- und Draw-Tools-Kandidaten
  sowie verwertbaren Quelldaten diagnostizieren.
- Einen nur nahegelegenen Kandidaten nicht stillschweigend als sicher
  zugeordnet darstellen.

## Link-, Blocker- und Schlüsselauswertung

- Planportale und ihren Link- und Schlüsselbedarf ermitteln.
- Vorhandene Planlinks erkennen und ihren weiteren Schlüsselbedarf auf null
  reduzieren. Offene Wurfrichtungen zählen als gekennzeichnete Schätzung an
  beiden Endportalen; bei ausdrücklicher Richtung benötigt nur das Ziel Keys.
- Nicht bestätigte Planlinks, vorhandene Planlinks und blockierte Planlinks
  begrifflich und rechnerisch unterscheiden.
- Echte Kreuzungen mit aktuell geladenen vorhandenen Links als Blocker
  erkennen; gemeinsame Endpunkte dürfen nicht als Kreuzung gelten.
- Konkrete Blocklinks mit geladenen Portalnamen oder defensiv mit Koordinaten
  anzeigen. Technische GUIDs dürfen nicht als Portalnamen erscheinen.
- Bereits erkannte Blocker-Daten nach neu geladenen IITC-Kartendaten
  automatisch mit verfügbaren Portalnamen aktualisieren.
- Fehlende Namen eindeutiger Planportale und erkannter Blocker-Endportale nach
  einem Scan gemeinsam, automatisch und ohne doppelte Detailanfragen
  nachladen. **Namen laden** muss denselben Ablauf als manuelle Wiederholung
  anbieten. Ein geladener Name ist in allen Vorkommen desselben
  Blocker-Endportals sowie in Arbeitsliste, Aktionen, Karte und Export zu
  übernehmen.
- Die Endportale erkannter Blocklinks nach der Zahl eindeutiger Blocklinks
  priorisieren; beide Endpunkte bleiben gleichwertige mögliche Arbeitsziele.
- In Dokumentation und Export darauf hinweisen, dass die Blockerprüfung nur
  aktuell in IITC geladene Links umfasst.
- Solange nicht bestätigte Planlinks vorhanden sind, einen ausstehenden
  finalen Blockercheck anzeigen und den geladenen Stand nicht als vollständige
  Entwarnung darstellen.
- Einen ausdrücklich gestarteten, begrenzten Finalcheck ausschließlich für
  noch nicht bestätigte Planlinks anbieten; bereits erkannte vorhandene
  Planlinks dürfen keine Prüfansichten erzeugen.
- Für den Finalcheck IITCs normale Kartenladung auf der ersten Zoomstufe ohne
  Linklängenfilter verwenden, die dabei sichtbaren Links über alle
  Prüfansichten sammeln und keine eigenen Intel-Tile- oder Portalabfragen
  ausführen.
- Eine Prüfansicht nach IITCs Ladeende erst nach einer kurzen Ruhephase
  abschließen und diese bei verspäteten Link-Layer-Ereignissen neu beginnen,
  damit neu geladene Links bereits im ersten Finalcheck erfasst werden.
- Nach der abschließenden Blocker-Neuberechnung fehlende Namen neu erkannter
  Blocker-Endportale automatisch über denselben Namensablauf wie nach einem
  normalen Scan laden.
- Den Finalcheck auf höchstens zwölf Ansichten begrenzen, die ursprüngliche
  Kartenposition und Zoomstufe anschließend wiederherstellen und einen wegen
  Begrenzung oder Zeitüberschreitung unvollständigen Lauf ausdrücklich als
  unvollständig kennzeichnen. Ein bereits ausgeführter unvollständiger Lauf
  darf anschließend nicht wieder als lediglich ausstehend erscheinen.
- Den Zwischenstand nach jeder abgeschlossenen Ansicht dauerhaft speichern.
  Ein pausierter oder durch einen IITC-Neustart unterbrochener Check muss bei
  unverändertem Plan an der nächsten noch offenen Ansicht fortsetzbar sein;
  bei geändertem Plan ist der veraltete Zwischenstand zu verwerfen.

## Abarbeitung und Route

- Keybestand aus dem IITC-Plugin Keys, Erledigt-Status, Notizen und eine manuell veränderbare
  Routenreihenfolge je Planportal dauerhaft speichern.
- Die Portalliste nach **Alle**, **Offen**, **Blockiert**, **Keys fehlen** und
  **Erledigt** filtern; Zähler müssen Portale und nicht Linkendpunkte zählen.
- Nach jedem neuen Scan den Listenfilter auf **Alle** zurücksetzen, damit ein
  gespeicherter oder unbeabsichtigt gewählter Filter die frisch erkannten
  Planportale insbesondere mobil nicht vollständig verbirgt.
- Unter **Offen** und in der automatischen Arbeitsroute nur nicht erledigte
  Planportale mit mindestens einem noch nicht vorhandenen Planlink führen.
  Portale mit ausschließlich bereits vorhandenen Planlinks bleiben unter
  **Alle** sichtbar und können bei Bedarf als Blocker-Endportal vorgemerkt
  werden.
- Offene Planportale und erforderliche Blocker-Abbauaufgaben zu einer
  gemeinsamen Arbeitsroute zusammenführen. Gemeinsame Blocker nur einmal
  einplanen; getrennte frühe Abbau- und spätere Planbesuche nicht verschlucken.
- Offene Planportale automatisch berücksichtigen; erledigte Planportale dürfen
  bei Bedarf erneut als Blocker-Ziel vorgemerkt werden.
- Das nächste offene Arbeitsziel hervorheben und erledigte Planportale
  überspringen.
- Bei gültigem IITC-Standort eine gemeinsame Luftlinienroute vorschlagen und
  Blocker vor dem ersten abhängigen Wurfauftrag mit geringem Umweg einordnen.
  Automatische Endportalwahl durch eine ausdrückliche Wahl überschreibbar machen.
  Vorschlagsreihenfolge bei Bewegungen bis 100 m stabil halten; gespeicherte
  manuelle Portalreihenfolge respektieren. Ohne Standort diese Reihenfolge nutzen.
- Aufgabenliste, nächstes Ziel, Kartenhervorhebung und Reststrecke müssen
  dieselbe Reihenfolge verwenden. Manuelle Erledigung darf keine Intel-Blocker
  oder vorhandenen Planlinks umdeuten. Fehlende Koordinaten und erledigte
  Wurfportale mit noch offenen Links als nicht eingeplante Aufgaben zeigen.
- Die Luftlinienentfernung vom gültigen IITC-Standort zum nächsten Portal
  anzeigen und auch dann aktualisieren, wenn dasselbe Portal nächstes Ziel
  bleibt.
- Eine ungefähre verbleibende Luftlinienroute und die Zahl noch offener Ziele
  ab dem gültigen IITC-Standort anzeigen.
- Ohne gültigen Standort keine Entfernung vortäuschen; benötigte Abbau-Stopps
  dürfen vor dem ersten offenen Planportal eingefügt werden.
- Eine optionale, einmalige Luftlinien-Näherungsroute ab dem aktuellen
  Standort anbieten; manuelle Verschiebung muss weiter möglich bleiben.
- Standortdaten weder in `localStorage` speichern noch exportieren.

## Karte, Navigation und Export

- Alle erkannten Planportale und blockierten Planlinks in einem gemeinsamen
  schaltbaren Layer darstellen.
- Kartenstatusmarker eindeutig unterscheidbar darstellen; erledigte Portale
  verwenden ein Häkchen; Portale ohne weiteren Keybedarf verwenden die
  eindeutige Kennzeichnung `K0`, die nicht wie „OK“ aussehen darf.
- Sämtliche beim letzten Scan erkannten betroffenen Planlinks, konkreten
  Blocklinks und berechneten Kreuzungspunkte automatisch und eindeutig
  unterscheidbar oberhalb der normalen IITC-Linkebene hervorheben.
- Vorgemerkte zusätzliche Blocker-Portale und das jeweils nächste Arbeitsziel
  auf der Karte markieren.
- Für bereits in IITC geladene Planportale eine ausdrückliche, lokalisierte
  Detailaktion anbieten, die anhand der exakten GUID aktuelle und ältere
  IITC-Anzeige-APIs unterstützt. Über IITCs normalen Auswahl- und Ladeablauf
  beim ausdrücklichen Klick fehlende oder veraltete Details nachladen lassen;
  ein Name im Arbeitsplan allein genügt nicht als vollständiger Detaildatensatz.
  Die Karte weder zentrieren, verschieben noch zoomen. Fehlende Details
  ersetzen die vorherige fremde Portalansicht durch eine Meldung.
- Erkannte Blocker-Endportale müssen dieselben lokalisierten Aktionen
  **Details anzeigen** und **Aktionen** wie Planportale anbieten. Ein einzelner
  abweichender Waze-Direktbutton darf dort nicht erscheinen; Waze und weitere
  Navigationsziele bleiben im gemeinsamen Aktionsdialog verfügbar.
- Die in IITC gespeicherte Sichtbarkeit des Anchor-Planner-Layers beim
  Neuladen respektieren und den Layer nicht eigenständig aktivieren.
- Waze-Navigation und weitere geeignete Kartenlinks bereitstellen; externe
  Navigation auf Mobilgeräten nutzbar halten.
- Plan als lesbaren Text und als JSON exportieren.
- Text- und JSON-Export um konkrete Blocker je betroffenem Planlink ergänzen
  und die begrenzte IITC-Datenabdeckung kenntlich machen.

Für offene Richtungen im Auswahlfeld einen gekennzeichneten Vorschlag vom
zuerst besuchten Planportal zum anderen Endportal vorauswählen. Erst
**Vorschlag übernehmen** oder eine Richtungsänderung speichert die Auswahl;
bis dahin bleibt der Keybedarf eine Schätzung. Bestätigte Richtungen erhalten.

## Bedienung

- Eine kompakte Aufgabentabelle mit Position, Portal, Keys, Links und Blockern
  sowie aufklappbaren, nummerierten Stopps anbieten. In den Details
  Blocklinkdetails, freigegebene Planlinks, Wurfrichtungswahl, Keyeingabe,
  manuelle Erledigung und vorhandene Details-/Navigationsaktionen anbieten.
  Scrollposition und aufgeklappte Stopps bei Aktualisierungen erhalten.
- Nicht bestätigte Aufgaben als geplant, blockiert oder manuell gemeldet
  kennzeichnen; keine vollständige Baufolgenprüfung vortäuschen.
- Desktop-IITC und IITC Mobile unterstützen.
- Das Panel ausschließlich über `.ap-head` per Maus, Touch und Pointer
  verschiebbar machen; Bedienelemente im Kopf bleiben unabhängig davon
  anklickbar.
- Die verschobene Panelposition dauerhaft speichern, vollständig im sichtbaren
  Viewport halten und nach Größen- oder Orientierungswechseln korrigieren.
- Interaktionen im übrigen Panel und auf der Karte außerhalb des Drag-Griffs
  dürfen durch die Drag-Logik nicht verändert werden.
- Das letzte Listenelement muss mobil vollständig erreichbar bleiben.
- Die Hauptansicht auf Scan, Einsatzcheck, nächstes Ziel, Filter, Blocker und
  die eingeklappten Portalzeilen begrenzen; selten benötigte Aktionen,
  Toleranz und Scandetails unter **Mehr** anzeigen.
- Portalzeilen eingeklappt mit Status, Name und Keybestand darstellen und ihre
  Detailansicht bei einem Panel-Refresh geöffnet halten.
- Reststrecke und offene Zielzahl platzsparend in die Zeile des nächsten Ziels
  integrieren; redundante Fortschritts-, Hinweis- und Listenabschlusszeilen
  vermeiden.
- Panel, Dialoge, Overlays und Statusmarker dürfen IITC-Bedienelemente und
  Bookmark-Marker nicht unbrauchbar überdecken.
- Blocker-Arbeitsliste, Filter, Sortierung und Aktionen müssen per Maus und
  Touch bedienbar sein.
- Diagnosebegriffe und Fortschrittszähler müssen exakt ausdrücken, was gezählt
  beziehungsweise nur anhand geladener Daten bestätigt wurde.
- Ein kompakter, aufklappbarer Einsatzcheck muss offene Endpunkte, blockierte
  Planlinks, fehlende Keys, fehlende Namen und nicht auswertbare vorhandene
  Links unterscheiden. „Bereit“ darf nur auf den geladenen Kartenstand bezogen
  sein.
- Der geöffnete Blockerbereich und der Einsatzcheck müssen bei einer
  Kartenaktualisierung geöffnet bleiben.
- Nach Auf- oder Zuklappen von **Mehr**, Einsatzcheck, Blockerbereich und
  Portalzeilen die Panelposition verzögert gegen den sichtbaren Viewport
  prüfen und nur bei Bedarf korrigieren.

## Internationalisierung

- Oberfläche, Statusmeldungen, Diagnosen, Dialoge, Kartenhinweise und
  Text-Exporte müssen vollständig über semantische Übersetzungsschlüssel
  ausgegeben werden.
- Deutsch, Englisch, Spanisch, Französisch, Italienisch, Japanisch, Polnisch,
  brasilianisches Portugiesisch, Russisch und vereinfachtes Chinesisch müssen
  als gebündelte Sprachfassungen verfügbar sein.
- Die automatische Auswahl muss Browser- und Seitensprache defensiv auswerten;
  eine nicht verfügbare Sprache muss auf Englisch zurückfallen.
- Die manuelle Auswahl unter **Mehr → Sprache** muss alle gebündelten Sprachen
  dynamisch anbieten und dauerhaft gespeichert werden.
- Sprachdateien müssen getrennt unter `src/locales/` gepflegt, vor dem Bündeln
  auf identische Schlüssel und Platzhalter geprüft und ohne Laufzeitabruf aus
  dem Internet in das einzelne Userscript eingebettet werden.
- Weitere Sprachdateien müssen ohne sprachspezifische Änderung der Laufzeitlogik
  automatisch erkannt und in die manuelle Auswahl aufgenommen werden.
- JSON-Feldnamen und JSON-Struktur müssen unabhängig von der gewählten Sprache
  unverändert und sprachneutral bleiben.
- Sprach- und Toleranzauswahl müssen auf Desktop-IITC und IITC Mobile sichtbar,
  kompakt und per Touch bedienbar bleiben.

## Veröffentlichung und Updates

- `main` bleibt der stabile Standardbranch; `beta` integriert getestete
  Entwicklungsänderungen aus Feature-Branches. Stabile Releases werden nach
  bestätigtem IITC-Praxistest über `release/<version>` und einen Pull Request
  nach `main` vorbereitet; anschließend `main` nach `beta` zurückführen.
- Automatische Branch-Prüfungen müssen Entwicklungsänderungen unter
  `releases/` erkennen und auf `main` beziehungsweise Release-Kandidaten
  Versions-, Metadaten- und Bytegleichheit prüfen. Der vollständige Ablauf
  steht in `docs/development.md`.
- Beta-Builds mit `src/build-beta.mjs` aus expliziten Beta-Versionen erzeugen;
  eigene Dateien unter `beta-builds/`, Beta-Update-Adressen und sichtbare
  Beta-Version verwenden. Byte-/Metadatenkonsistenz in CI prüfen. Stabile
  `releases/` unverändert lassen.
- `@version` und `ap.VERSION` müssen denselben Versionsstand tragen.
- `@updateURL` und `@downloadURL` müssen auf eine dauerhaft erreichbare,
  freigegebene Userscript-Datei zeigen und dürfen keine Entwicklungsfassung
  ausliefern.
- `@icon` und `@icon64` müssen auf das im Projekt-Repository gepflegte
  Anchor-Planner-Icon zeigen, damit der Community-Katalog es aus den
  Userscript-Metadaten übernehmen kann.
- Versionierte `.user.js`- und `.txt`-Releases sowie die stabilen Dateien ohne
  Versionsnummer müssen bei jeder Freigabe inhaltlich identisch sein.
- Die stabile Datei darf erst nach bestätigtem IITC-Praxistest aktualisiert
  werden.
- Der Community-Katalog muss Draw Tools als Abhängigkeit und Bookmarks als
  Empfehlung ausweisen.
- Automatisches Nachladen von Portalnamen und der Planexport müssen im
  Community-Katalog transparent als `scraper` und `export` deklariert sein.

## Keybestand und Medienimport
- Ausschließlich IITC Keys als Bestandsquelle; keine lokale Ersatzverwaltung und keine Migration.
- Ohne Keys unbekannten Bestand anzeigen, nicht null oder fälschlichen Keymangel.
- Screenshot-/Videoerkennung lokal und nur nach Benutzeraktion starten. Vor jeder
  Übernahme eine editierbare Prüftabelle mit selektiver Bestätigung anzeigen.
- Nicht erkannte und mehrdeutige Namen nicht automatisch zuordnen; widersprüchliche
  Mengen nicht vorauswählen. Kein automatisches Nullsetzen ungesehener Portale.
- Änderungen ausschließlich über Keys.addKey vornehmen; aktuellen Bestand beim
  Schreiben neu lesen. Bei geändertem Plan neue Erkennung verlangen.

- Keyerkennung muss Inventarkarten mit Levelziffer vor dem Namen, Adresszeile und
  Entfernung/Icons vor der Menge verarbeiten. Die Menge darf nicht von der nächsten
  Karte übernommen werden. Fotohintergrund und abgedunkelte Schrift berücksichtigen.
- Deutsche Oberfläche wählt deutsche OCR vor; die Sprache bleibt manuell änderbar.

- Letzten Keyimport oder vollständigen Reset mit einer vor der ersten Änderung persistent gespeicherten Sicherung rückgängig machen. Kein Schreiben bei fehlgeschlagener Sicherung.
- Vollständiger Reset umfasst alle Keys-Portale, auch außerhalb des Plans; Bestätigung nennt Portal- und Keyzahl. Keine Daten im Plan löschen.
- Rücknahme zeigt spätere Bestandsänderungen als nicht vorausgewählte Konflikte. Vor dem Schreiben geprüfte Werte erneut validieren. Nicht ausgewählte Konflikte für spätere Rücknahme behalten.

- Gesamtbestandsliste direkt aus IITC Keys, unabhängig vom Plan und Kartenausschnitt. Positive Bestände mit Namen und Menge, Gesamtsummen, Namenssuche und Sortierung nach Name/Menge zeigen.
- Keine Bestandsänderung oder automatische Portalabfrage durch die Liste; fehlende Namen kennzeichnen und mitzählen. Ohne Keys den Bestand als unbekannt darstellen.

- Bei Übergang eines zuvor offenen Planlinks zu neu erkanntem Intel-Link einen Key am Ziel der bestätigten Richtung über Keys.addKey abziehen. Erstmalig vorhandene Links nicht abbuchen.
- Persistente Intel-Linkidentität verhindert Doppelbuchungen bei Scan, Finalcheck, Refresh, Kartenlücken, Planreset und Keyimport. Neubau mit neuer Identität nach offenem Zustand ist neuer Verbrauch.
- Keine negativen oder erfundenen Bestände. Fehlende Richtung, Keys, Menge oder Schreibfehler als Prüfhinweis am Link; keine verspätete automatische Nachbuchung nach Import. Verbrauch verändert keine Intel-Daten und überschreibt die Import-/Reset-Sicherung nicht.

- Planvorschau der verbleibenden Aufgabenroute mit Blocker-Abbau vor Wurfaufträgen; Zurück/Weiter, Abspielen/Pause und Neustart. Bestehende Reihenfolge und Wiederbesuche übernehmen.
- Virtuellen Keyverbrauch, Richtungs-/Bestandslücken und nicht eingeplante Aufgaben sichtbar machen. Weg, simulierte Links und geometrische Dreiecke auf separatem Layer zeigen. Keine Ingress-Ausführbarkeitsgarantie.
- Vorschau niemals als reale Erledigung oder Keybuchung behandeln; auch eigene Kartenladungen dürfen keine Verbrauchsbuchungen auslösen. Originalansicht beim Schließen restaurieren, reale Beobachtungen erst nach neuem Scan/Finalcheck fortsetzen.

- Die Planvorschau soll auch entfernte Stopps mit weicher Kartenbewegung verbinden und vorhandene Geometrie bei Vorwärtsschritten erhalten. Pause/Weiterlaufen ohne erneutes Zeichnen oder Zentrieren; reduzierte Bewegung respektieren und Kartenanimation vor Ansichtsrestaurierung stoppen.

## Gemeinsame Routenverbesserung (0.2.0-beta.16)
- Im automatischen Standortmodus die vollständige Luftlinienstrecke ab Standort bewerten: Portalreihenfolge, gemeinsame Abbau-Endportale und nachträgliche Position bestehender Blocker-Stopps zusammen verbessern. Nur strikt kürzere Varianten bei erhaltenen Aufgaben übernehmen.
- Jeder Abbau bleibt spätestens vor dem frühesten abhängigen Wurf; offene Richtungen konservativ vor dem ersten Planendportalbesuch. Getrennte Wiederbesuche erhalten.
- Explizite Abbauziele, vorgemerkte Endportale und manuelle Abbau-Meldungen respektieren; keine Speicherung von Vorschlagsentscheidungen oder GPS, keine Key-/Erledigungsänderung. Aufgaben, nächstes Ziel, Reststrecke und Planvorschau verwenden dieselbe Route.
- Manuelle Portalreihenfolge und Reihenfolge ohne gültigen Standort nicht optimierend überschreiben. Begrenzte deterministische Suche; bei großen/fehlenden Daten den bisherigen gültigen Vorschlag behalten. Keine Optimalitäts- oder Erreichbarkeitsgarantie.

## Eindeutige Routenstarts und Planvorschau (0.2.0-beta.16)
- Route ab Standort plant die automatische Route ab echtem IITC User Location und meldet fehlendes GPS; gespeicherte Reihenfolge nicht überschreiben.
- Route ab diesem Portal beim Planportal/zugehörigen Aufgabenstopp setzt festen ersten Stopp und Ursprung, auch ohne GPS. Titel anzeigen, GPS-Bewegung ignorieren; nur GUID speichern. Fehlenden Ursprung klar kennzeichnen, keine erfundenen Koordinaten oder stilles GPS-Substitut.
- Falls Blocker einen sofortigen Wurf verhindern: erster Stopp nur Routenstart, späterer Wurfbesuch nach Abbau bleibt erhalten. Keine Key-/Erledigungs-/Inteländerung durch den Start. Aufgaben, Ziel, Reststrecke und Vorschau konsistent.
- Standort-/manuelle Route hebt Portalstart auf. Plan löschen entfernt die Wahl, Refresh erhält die GUID und neuer Scan löst sie auf.
- Walk Sim in der aktuellen Oberfläche als Planvorschau bezeichnen, unabhängig von Fortbewegungsart.

Die Aufgabenroute enthält nur Stopps mit verbleibenden Linkaufgaben oder Blocker-Abbau. Reine Empfangsportale und ungenutzte Richtungskandidaten bleiben im Plan sichtbar, werden aber nicht angefahren. Offene Richtungen bleiben als unbestätigte Linkaufgabe sichtbar. Ein ausdrücklich gewähltes Startportal bleibt als **Routenstart** erhalten, ohne erfundene Vorbereitung.

- Planvorschau: Kartenbewegung je nach Strecke 2,5–5 Sekunden, automatischer Folgestopp nach zusätzlich 1,2 Sekunden Lesepause. Vorwärts und rückwärts gleich langsam, keine Überlappung automatisch ausgelöster Bewegungen. Pause/Schließen verwerfen Timer; reduzierte Bewegung weiterhin respektieren.

- Hellblaue Weglinie und Positionsmarker bewegen sich während der Strecke gemeinsam; kein sofortiger vollständiger Weg beim Folgestopp. Rückwärts letztes Wegstück zurücknehmen. Routenursprung einbeziehen; Datenlücken nicht mit einer fiktiven Strecke verbinden. Abschluss exakt am Ziel; Abbruch/Schließen und reduzierte Bewegung berücksichtigen.

## Nächste Aufgabe (0.2.0-beta.16)
- Erste konkrete Arbeit aus getWorkPlan anzeigen, keine eigene Route und kein Wegklicken ungelöster Aufgaben. Reiner Routenstart bleibt Kontext.
- Portalname/Details, GPS-Entfernung wenn vorhanden, Navigation, Blocker vor Links, Richtungen/Status und Ziel-Keybedarf zeigen. Unbekannte Keys und Richtungen nicht als ausführbar ausgeben.
- Vorhandene manuelle Meldungen wiederverwenden: keine automatische Erledigung beim Ankommen, keine Keybuchung durch Checkbox. Scans und Änderungen aktualisieren offene Ansicht auch ohne offene Aufgabenliste.
- Kompakter scrollbarerer Dialog mit Touch-Controls, vollständige Liste/Scan/Standortbutton erreichbar, fehlendes GPS und nicht eingeplante Arbeit klar kennzeichnen.

## Getrennte Fächer (0.2.0-beta.16)
- Ein, zwei oder mehr automatisch vorgeschlagene oder manuell festgelegte Anker. Jedes weitere Portal genau einer Gruppe zuweisen: nächster Anker als Standard, manuelle Zuordnung hat Vorrang. Keine Links zwischen Gruppen.
- Auswahl: aktueller Plan, geladene Portale im Kartenausschnitt oder einfache Draw-Tools-Polygone; 3–60 ausgewählte Portale. Einzelne Portale ausschließbar. Manuelle Anker/Zuordnungen bei neuer Suche erhalten.
- Geometrische Dreiecke und Linknetz ohne gegenseitige Kreuzung vorschlagen, Blocker/existierende Links aus geladenem Intel kennzeichnen. Kreuzende/überlappende radiale Links, ungültige Daten und feldlose Entwürfe verhindern die Übernahme.
- Reine Karten-Vorschau; erst ausdrückliches Ergänzen fügt fehlende Linien dem aktuellen Draw-Tools-Projekt hinzu und speichert/scant. Vorhandene Zeichnungen erhalten, doppelte Linien vermeiden, Speicherfehler rollen neu hinzugefügte Linien zurück. Fremde Planlinien dürfen den Entwurf nicht kreuzen.
- Keine Keys oder Erledigungen ändern, neue Wurfrichtungen bleiben unbestätigt. Anker/Zuordnung/Auswahlflächen-Metadaten speichern und exportieren. Übernommene Auswahlpolygon-Ränder nicht als Planlinks scannen.
- Geometrische Feldzahl ist kein Nachweis einer ausführbaren Ingress-Baureihenfolge; bestehender Einsatz-/Finalcheck bleibt erforderlich. Desktop und mobile Dialogbreite berücksichtigen.
