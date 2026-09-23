# Anforderungen für Version 0.1.54

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
- Vorhandene Planlinks erkennen und den Schlüsselbedarf an beiden Endportalen
  entsprechend reduzieren.
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
  unvollständig kennzeichnen.
- Den Zwischenstand nach jeder abgeschlossenen Ansicht dauerhaft speichern.
  Ein pausierter oder durch einen IITC-Neustart unterbrochener Check muss bei
  unverändertem Plan an der nächsten noch offenen Ansicht fortsetzbar sein;
  bei geändertem Plan ist der veraltete Zwischenstand zu verwerfen.

## Abarbeitung und Route

- Keys, Erledigt-Status, Notizen und eine manuell veränderbare
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
- Offene Planportale und ausdrücklich vorgemerkte Blocker-Endportale zu einer
  gemeinsamen Arbeitsroute ohne doppelte Portalbesuche zusammenführen.
- Offene Planportale automatisch berücksichtigen; erledigte Planportale dürfen
  bei Bedarf erneut als Blocker-Ziel vorgemerkt werden.
- Das nächste offene Arbeitsziel hervorheben und erledigte Planportale
  überspringen.
- Bei gültigem Standort des offiziellen IITC-User-Location-Plugins das
  geografisch nächste offene Plan- oder Blocker-Portal dynamisch bestimmen.
- Die Luftlinienentfernung vom gültigen IITC-Standort zum nächsten Portal
  anzeigen und auch dann aktualisieren, wenn dasselbe Portal nächstes Ziel
  bleibt.
- Eine ungefähre verbleibende Luftlinienroute und die Zahl noch offener Ziele
  ab dem gültigen IITC-Standort anzeigen.
- Ohne gültigen IITC-Standort auf das erste offene Portal der gespeicherten
  Routenreihenfolge zurückfallen und keine Entfernung vortäuschen.
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
  Detailaktion anbieten. Sie darf weder zusätzliche Portaldetails anfordern
  noch die Karte zentrieren, verschieben oder zoomen.
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

## Bedienung

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
