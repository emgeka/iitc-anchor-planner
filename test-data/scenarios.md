# Manuelle Testszenarien

## Repository-Branches und Freigabe

**Aufbau:** `main`, `beta` und einen Feature-Branch mit aktualisiertem
`origin/main` prüfen; bei einem Release-Kandidaten den Zielbranch `main` prüfen.

**Erwartung:**

- `main` bleibt Standardbranch, `beta` integriert Feature-Arbeit; stabile
  Installation und Pluginversion bleiben bei der Einrichtung unverändert.
- `node src/check-branch-policy.mjs --branch main` bestätigt Versions- und
  Metadatenkonsistenz sowie Bytegleichheit aller aktuellen Distributionen.
- `node src/check-branch-policy.mjs --branch beta --stable-ref origin/main`
  erlaubt dokumentierte Entwicklungsquellen, lehnt aber Änderungen unter
  `releases/` ab. Dasselbe gilt für Feature-Branches.
- Release-Kandidaten auf `release/<version>` dürfen nach bestätigtem Praxistest
  Distributionen vorbereiten und müssen die Stable-Prüfung bestehen.
- Die GitHub-Prüfungen laufen auf den dokumentierten Branches und Pull
  Requests, veröffentlichen aber keine Builds. `node src/build-beta.mjs --check`
  bestätigt den getrennten, konsistenten Beta-Build unter `beta-builds/`.
- Bei unverändertem Laufzeitcode erfordert die reine Branch- und
  Prozesseinrichtung keinen zusätzlichen IITC-Praxistest.

## 1. Gegnerisches oder nicht linkfähiges Planportal

**Aufbau:** Ein Endportal ist gegnerisch oder nur teilweise ausgebaut.

**Erwartung:** Das Portal erscheint dennoch in der Planung. Sein aktueller
Ingress-Zustand darf es nicht aus der geometrischen Planung entfernen.

## 2. Vorhandener Planlink

**Aufbau:** Einer der geplanten Links ist in `window.links` geladen und
vorhanden.

**Erwartung:** Der Link wird als vorhanden markiert und der Schlüsselbedarf
entsprechend vermindert. Er darf nicht zugleich als Blocker erscheinen.

## 3. Kreuzender vorhandener Link

**Aufbau:** Ein geladener Intel-Link kreuzt ein geplantes Segment echt, ohne
einen gemeinsamen Endpunkt zu besitzen.

**Erwartung:** Der geplante Link wird als blockiert dargestellt. Nicht geladene
Kartendaten dürfen nicht zu einer endgültigen Entwarnung führen.

## 4. Bookmarks ohne geladene Portale

**Aufbau:** Planportale liegen als Bookmarks vor, sind aber nicht alle als
`window.portals` geladen.

**Erwartung:** Verwertbare Bookmark-Koordinaten und -namen fließen in die
Auflösung ein; Gesamtzahl, verwendete Treffer und Endpunkte bleiben begrifflich
unterscheidbar.

## 5. Mobile Liste und Aktionen

**Aufbau:** Plan mit genügend Portalen für eine längere Liste in IITC Mobile.

**Erwartung:** Das letzte Portal ist ohne zusätzliche Listenabschlusszeile
erreichbar; Waze und Teilen funktionieren; Dialog, Layer und Badges kollidieren
nicht mit der mobilen Statusleiste.

## 6. Blocker-Arbeitsliste und Kartenhervorhebung

**Aufbau:** Ein nicht vorhandener Planlink wird von mindestens einem aktuell
geladenen Intel-Link echt gekreuzt. Die beteiligten Portale einmal ohne und
einmal mit geladenen Portaldetails prüfen.

**Erwartung:**

- Der Blockerbereich nennt die Zahl eindeutiger Blocklinks und Endportale.
- Endportale mit den meisten eindeutigen Blocklinks stehen zuerst; bei
  Gleichstand greifen Planportal-Status, Standortentfernung und Portalname.
- Ohne geladene Namen erscheinen Koordinaten und keine technischen GUIDs.
- Nach dem Scan werden fehlende Namen aller eindeutigen Plan- und
  Blocker-Endportale automatisch jeweils nur einmal abgefragt. Dies gilt auch,
  wenn ausschließlich Blocker-Endportalen Namen fehlen. **Namen laden**
  wiederholt denselben Ablauf manuell. Ein erfolgreich geladener Blockername
  erscheint an sämtlichen betroffenen Blocklinks sowie in Arbeitsliste,
  Aktionen und Export.
- Nach Hineinzoomen und Laden der IITC-Kartendaten erscheinen verfügbare
  Portalnamen bereits erkannter Blocker automatisch, ohne erneuten Scan.
- Der geöffnete Blockerbereich bleibt bei dieser Aktualisierung geöffnet.
- Alle erkannten betroffenen Planlinks erscheinen pink gestrichelt, eindeutige
  Blocklinks türkis und berechnete Kreuzungspunkte gelb, ohne dass zuvor ein
  Portal oder eine Detailaktion ausgewählt werden muss.
- Ein Blocklink, der mehrere Planlinks kreuzt, wird nur einmal gezeichnet; die
  einzelnen Kreuzungspunkte bleiben sichtbar.

## 7. Text- und JSON-Export mit Blockern

**Aufbau:** Einen Plan mit vorhandenem, nicht bestätigtem und blockiertem Link
scannen und Text- sowie JSON-Export erzeugen.

**Erwartung:**

- Die Anzahl nicht bestätigter Links entspricht `lastScan.unconfirmedLinks`.
- Konkrete Blocker erscheinen je betroffenem Planlink in beiden Exporten.
- Der Text nennt die Begrenzung auf aktuell geladene vorhandene Links.
- Standortdaten erscheinen weder im Text- noch im JSON-Export.

## 8. Portalfilter und Zähler

**Aufbau:** Ein einzelner offener und blockierter Planlink zwischen zwei
Planportalen; anschließend ein Portal als erledigt markieren und Key-Bestände
variieren. Vor einem erneuten Scan auf Desktop und Mobil jeweils einen anderen
Filter aktivieren.

**Erwartung:**

- **Alle** zählt zwei Planportale, obwohl nur ein Planlink existiert.
- **Offen**, **Blockiert**, **Keys fehlen** und **Erledigt** reagieren auf den
  jeweiligen Portalstatus.
- Portale, deren Planlinks bereits vollständig vorhanden sind, bleiben unter
  **Alle** sichtbar, zählen aber nicht als **Offen**. Sobald mindestens ein
  Planlink noch nicht vorhanden ist, zählt das nicht erledigte Portal wieder
  als offen.
- Die Filter ändern nur die sichtbare Liste, nicht Plan oder Reihenfolge.
- Nach jedem neuen Scan ist **Alle** aktiv und sämtliche erkannten Planportale
  werden aufgelistet; kein vorheriger Filter erzeugt eine irreführend leere
  mobile Ergebnisliste.

## 9. Gemeinsame Arbeitsroute ab IITC-Standort

**Aufbau:** Plan mit mindestens drei offenen Portalen, mehreren Blocklinks und
aktiviertem IITC-User-Location-Plugin. Mindestens ein zusätzliches
Blocker-Endportal vormerken. Standort so ändern, dass nacheinander ein Plan-
und ein Blocker-Portal geografisch am nächsten liegt; danach ein Planportal als
erledigt markieren.

**Erwartung:**

- Das Panel unterscheidet **Nächstes Planportal ab Standort** und **Nächstes
  Blocker-Portal ab Standort** und zeigt die gerundete Luftlinienentfernung.
- Blocker werden automatisch vor den abhängigen Linkaufträgen eingeordnet und
  nach Möglichkeit mit vorhandenen Portalbesuchen gebündelt. Ein gemeinsamer
  Blocklink erzeugt eine Abbauaufgabe; nötige frühe Abbau- und spätere
  Planbesuche desselben Portals bleiben getrennt.
- Nicht erledigte Planportale mit ausschließlich bereits vorhandenen
  Planlinks erscheinen nicht als automatische Arbeitsziele. Sind sie Endportal
  eines Blocklinks, können sie weiterhin ausdrücklich vorgemerkt werden.
- Zielanzahl und geschätzte Reststrecke reagieren unmittelbar auf Vormerkung,
  Erledigt-Status und Standortänderung.
- Kleine Standortbewegungen bis 100 m aktualisieren Entfernung und Reststrecke,
  ohne die vorgeschlagene Reihenfolge zu ändern. Größere Bewegungen im
  Standortmodus können den Vorschlag neu berechnen. Gespeicherte Portalnummern
  werden dabei nicht umgeschrieben; Aufgaben, nächstes Ziel und Reststrecke
  verwenden denselben Vorschlag.
- Ein erledigtes Planportal wird sofort übersprungen, kann aber bei Bedarf als
  Blocker-Ziel ausdrücklich erneut vorgemerkt werden.
- Desktop und Mobil zeigen dasselbe fachliche Verhalten.

## 10. Standort-Fallback und Routensortierung

**Aufbau:** Zuerst ohne gültigen IITC-Standort testen, danach Standortfunktion
aktivieren und **Ab Standort sortieren** auswählen.

**Erwartung:**

- Ohne Standort gilt die gespeicherte Planportalreihenfolge mit benötigten
  Abbau-Stopps vor den abhängigen Linkaufträgen. Die bisherige Sortieraktion
  weist verständlich auf den fehlenden Standort hin; Entfernungen bleiben leer.
- Mit Standort wird die Liste einmalig als Luftlinien-Näherungsroute sortiert;
  diese gespeicherte Sortierung betrifft weiterhin nur die Planportalliste,
  während die Aufgabenroute zusätzliche Blocker-Ziele einbezieht. Sortier- und
  Pfeilaktionen aktivieren den manuellen Modus; **Route ab hier** verwendet
  wieder den Standortmodus, ohne gespeicherte Portalnummern zu überschreiben.
- Manuelle Pfeiltasten bleiben anschließend wirksam.
- Ein initialer oder ungültiger Standort `0/0` wird nicht verwendet.

## 11. Kompakter Einsatzcheck

**Aufbau:** Einen Plan nacheinander mit blockiertem Planlink, fehlendem Key,
offenem Endpunkt und fehlendem Portalnamen prüfen. Danach alle erkannten
Hindernisse beseitigen beziehungsweise einen vollständig aufgelösten Plan ohne
geladene Blocker verwenden.

**Erwartung:**

- Blockierte Planlinks, fehlende Keys und offene Endpunkte führen zu **Nicht
  bereit** und erscheinen mit korrekter Anzahl in der kompakten Kopfzeile.
- Fehlende Namen oder nicht auswertbare vorhandene Links führen zu **Prüfen**.
- Ohne erkannte Hindernisse erscheint **Bereit (geladener Stand)**.
- Aufgeklappt nennt der Einsatzcheck in einer kompakten Zeile nicht bestätigte
  Planlinks und geladene vorhandene Links; relevante Key-Portale und nicht
  auswertbare Links werden nur bei Bedarf ergänzt.
- Auf- und Zuklappen, Panelhöhe und Listenende bleiben auf Desktop und Mobil
  nutzbar.

## 12. Kompakte Hauptansicht

**Aufbau:** Einen gescannten Plan mit mehreren Portalen und mindestens einem
Blocker auf Desktop und Mobil öffnen. **Mehr**, Einsatzcheck, Blockerbereich
und einzelne Portalzeilen nacheinander auf- und zuklappen; anschließend einen
Panel-Refresh durch Kartenbewegung oder Namensaktualisierung auslösen.

**Erwartung:**

- Standardmäßig sind nur **Scannen**, **Mehr**, Einsatzcheck, nächstes Ziel,
  Filter, Blocker und die eingeklappten Portalzeilen sichtbar.
- **Mehr** zeigt Namens-, Export-, Sortier- und Löschaktionen, Toleranz sowie
  die knappe Scan-Zusammenfassung; Fehlermeldungen öffnen diesen Bereich.
- Die nächste Zielzeile enthält bei gültigem Standort Entfernung,
  Restschätzung und offene Zielzahl ohne separate Routenzeile.
- Portalzeilen zeigen eingeklappt Status, Namen und Keys; geöffnete
  Portalzeilen sowie Einsatzcheck und Blocker bleiben beim Refresh geöffnet.
- Der Kartenmarker eines erledigten Portals zeigt ein klar lesbares `✓` und
  ist nicht mit dem Status `K0` für fehlenden weiteren Keybedarf zu
  verwechseln; `K0` darf seinerseits nicht wie „OK“ aussehen.
- **Details anzeigen** öffnet für ein bereits geladenes Planportal die IITC-
  Detailansicht. Der Portalname selbst bleibt normaler Text; Karte, Mittelpunkt
  und Zoomstufe verändern sich nicht. Moderne und ältere IITC-Versionen öffnen
  dasselbe Portal anhand seiner GUID über den normalen Auswahl-/Ladeablauf.
  Insbesondere bei vorhandenem Aufgabenname und leerem IITC-Detailtitel muss
  IITC fehlende Details nachladen und nach Antwort das richtige Portal zeigen.
  Kein direktes Rendern eines unvollständigen Datensatzes als „null“.
  Bei nicht geladenem Portal ersetzt eine Meldung die vorherige
  Portalansicht. Im Panel erscheint zusätzlich eine
  lokalisierte Verfügbarkeitsmeldung.
- Jedes Blocker-Endportal zeigt ebenfalls **Details anzeigen** und **Aktionen**
  statt eines einzelnen Waze-Buttons. Die Detailaktion folgt denselben
  Ladegrenzen wie bei Planportalen; **Aktionen** öffnet denselben Teilen- und
  Navigationsdialog einschließlich Waze.
- Nach jedem Auf- und Zuklappen von **Mehr**, Einsatzcheck, Blockerbereich und
  Portalzeilen bleibt das Panel unverändert stehen, solange es vollständig im
  Viewport liegt; andernfalls wird es nach kurzer Verzögerung gerade so weit
  in den sichtbaren Bereich zurückgeschoben wie nötig.
- Redundante Erklärungen und eine Listenabschlusszeile erscheinen nicht.

## 13. Release-Metadaten und Community-Datei

**Aufbau:** Nach bestätigtem IITC-Praxistest eine neue Version freigeben und
die versionierten sowie stabilen Dateien unter `releases/` erzeugen. Den
Community-Eintrag mit der offiziellen IITC-CE-Generierung verarbeiten.

**Erwartung:**

- `@version` und `ap.VERSION` sind identisch.
- `@updateURL` und `@downloadURL` zeigen auf
  `releases/iitc-anchor-planner.user.js` im öffentlichen Projekt-Repository.
- `@icon` und `@icon64` zeigen auf
  `docs/media/anchor-planner-icon.svg` im öffentlichen Projekt-Repository.
- Arbeitsfassung, versionierte `.user.js`/`.txt` und stabile
  `.user.js`/`.txt` sind vor dem Commit bytegleich.
- Die öffentliche stabile Datei enthält die freigegebene Version und besteht
  die JavaScript-Syntaxprüfung.
- Die Community-Generierung erzeugt die ID `anchor-planner@emgeka`, übernimmt
  Draw Tools und Bookmarks sowie die Anti-Features `scraper|export` und liefert
  ein syntaktisch gültiges Userscript.
- Die Dokumentation erklärt `scraper` mit dem begrenzten Nachladen fehlender
  Planportalnamen über IITC und grenzt es von externem Scraping und `highLoad`
  ab.
- Es werden keine Entwicklungsänderungen aus `src/` veröffentlicht, die nicht
  zuvor praktisch getestet und freigegeben wurden.

## 14. Sprachen, Fallback und Exporte

**Aufbau:** Die Arbeitsfassung nacheinander auf Deutsch, Englisch, Spanisch,
Französisch, Italienisch, Japanisch, Polnisch, brasilianischem Portugiesisch,
Russisch und vereinfachtem Chinesisch öffnen. Zusätzlich **Automatisch** mit
einer unterstützten sowie einer nicht unterstützten Browser- oder
Seitensprache prüfen und IITC nach einer manuellen Auswahl neu laden.

**Erwartung:**

- Alle gebündelten Sprachen erscheinen dynamisch unter **Mehr → Sprache** und
  ändern Oberfläche, Statusmeldungen, Diagnosen, Dialoge, Kartenhinweise und
  Text-Export ohne erneuten Scan.
- Die manuelle Auswahl bleibt nach einem IITC-Neustart gespeichert;
  **Automatisch** verwendet eine unterstützte Browser- beziehungsweise
  Seitensprache und fällt andernfalls auf Englisch zurück.
- Sprach- und Toleranzauswahl bleiben auf Desktop-IITC und IITC Mobile sichtbar,
  kompakt, vollständig erreichbar und per Touch bedienbar.
- Nichtlateinische Schriftzeichen werden lesbar dargestellt; lange Aktions-,
  Filter- und Statusbegriffe überdecken keine Bedienelemente.
- Singular und Plural enthalten die richtige Zahl, keine sichtbaren
  Übersetzungsschlüssel und keine unverarbeiteten Platzhalter.
- Der Text-Export folgt der gewählten Sprache. JSON-Feldnamen, JSON-Struktur
  und fachliche Werte bleiben bei jedem Sprachwechsel unverändert; die
  Sprachauswahl erscheint nicht als zusätzliches JSON-Feld.

## 15. Verschiebbares Panel auf Desktop und Mobil

**Aufbau:** Das Panel auf Desktop-IITC mit der Maus und in IITC Mobile per
Touch beziehungsweise Pointer an `.ap-head` verschieben. Dabei auch am
Einklappbutton, im Panelinhalt und direkt auf der Karte interagieren. Das Panel
jeweils über alle vier Viewportränder hinaus zu ziehen versuchen, IITC neu
laden und anschließend Fenstergröße beziehungsweise Geräteorientierung ändern.

**Erwartung:**

- Nur der Kopf außerhalb des Einklappbuttons startet das Verschieben; Button,
  Panelaktionen, Scrollen und Karteninteraktion verhalten sich weiterhin wie
  zuvor.
- Maus, Touch und Pointer bewegen das Panel flüssig, ohne Text zu markieren
  oder während des Drags die Karte zu verschieben.
- Das vollständige Panel bleibt mit einem kleinen Rand im sichtbaren Viewport.
- Die Position bleibt nach einem IITC-Neustart erhalten.
- Nach Fenstergrößen- und Orientierungswechseln wird eine nicht mehr passende
  Position automatisch korrigiert; das letzte Portal bleibt auch mobil
  erreichbar.

## 16. Gespeicherte Layer-Sichtbarkeit

**Aufbau:** Den Anchor-Planner-Layer im IITC-LayerChooser ausschalten, IITC neu
laden und anschließend den Layer wieder einschalten und erneut laden.

**Erwartung:** Der ausgeschaltete Layer bleibt nach dem ersten Neuladen
ausgeschaltet und das Panel bleibt verborgen. Nach dem manuellen Einschalten
bleiben Layer und Panel auch nach dem zweiten Neuladen aktiv. Beim ersten Start
ohne gespeicherten Zustand gilt weiterhin IITCs registrierter Standard.

## 17. Finaler Blockercheck für nicht bestätigte Planlinks

**Aufbau:** Einen längeren Plan bei weit herausgezoomter Karte scannen, sodass
mindestens ein kurzer kreuzender Intel-Link im normalen Kartenstand nicht
geladen ist. Mindestens einen anderen Planlink bereits im Intel-Netz bestehen
lassen. Kartenmittelpunkt und Zoomstufe notieren und anschließend
**Finalcheck** auswählen. Zusätzlich einen vollständig vorhandenen Plan sowie
einen Plan testen, der mehr als zwölf Prüfansichten benötigt. Einen laufenden
Check einmal pausieren, fortsetzen und ein zweites Mal nach dem Pausieren IITC
neu laden, denselben Plan scannen und den Check fortsetzen. Danach den Plan
ändern.

**Erwartung:**

- Der Einsatzcheck kennzeichnet den finalen Blockercheck vor seinem Lauf als
  ausstehend; der normale Scan vermittelt keine vollständige Entwarnung.
- Der Finalcheck bewegt die Karte schrittweise auf die erste IITC-Zoomstufe
  ohne Linklängenfilter, wartet nach IITCs Ladeende auf verspätete
  Link-Layer-Ereignisse, erkennt den zuvor fehlenden kurzen Blocklink bereits
  beim ersten Durchlauf und berechnet Blocker, vorhandene Planlinks und
  Keybedarf aus den über alle Ansichten gesammelten Links neu.
- Fehlende Namen der dabei neu erkannten Blocker-Endportale werden anschließend
  automatisch geladen und erscheinen ohne Klick auf **Namen laden** in
  Blockerliste, Aktionen, Karte und Export.
- Bereits erkannte vorhandene Planlinks erzeugen keine eigenen Prüfansichten.
  Sind alle Planlinks bereits vorhanden, ist die Aktion deaktiviert und es
  erfolgt keine Kartenbewegung.
- Nach Abschluss entsprechen Kartenmittelpunkt und Zoomstufe wieder exakt dem
  Ausgangsstand. Es erfolgen keine direkten Tile- oder Portalabfragen des
  Plugins.
- **Check pausieren** stellt die Ausgangsansicht wieder her. **Check
  fortsetzen** beginnt bei der ersten noch offenen Ansicht und behält die
  bereits gesammelten Links bei. Das gilt bei unverändertem Plan auch nach
  einem IITC-Neuladen und erneutem normalen Scan; nach einer Planänderung wird
  der veraltete Zwischenstand verworfen.
- Benötigt der Plan mehr als zwölf Ansichten oder läuft eine Kartenladung in
  ein Zeitlimit, wird der Lauf sichtbar als unvollständig bezeichnet und nicht
  als Entwarnung gewertet. Der Einsatzcheck darf ihn danach nicht wieder als
  bloß ausstehenden, noch nie ausgeführten Finalcheck anzeigen.
- Button, Fortschritt und Ergebnistext bleiben auf Desktop und IITC Mobile in
  allen gebündelten Sprachen erreichbar und verständlich.

## 18. Integrierte Aufgaben, Wurfrichtung und organischer Blocker-Abbau

**Aufbau:** Einen Plan mit mindestens drei Portalen, zwei Richtungen und einem
Blocklink verwenden, der mehrere Planlinks kreuzt. Beide Endportale des
Blocklinks müssen bekannt sein. Einen zweiten Blocker erst für einen späteren
Wurfauftrag benötigen. **Aufgaben** auf Desktop und IITC Mobile öffnen.

**Erwartung:**

- Die Richtung beginnt bei alten Plänen offen. Wählen von A → B benötigt Keys
  nur an B; Umkehren verschiebt den Bedarf nach A. Vorhandene Links benötigen
  keine weiteren Keys. Reine Wurfportale erscheinen nicht als schon gebaut.
- Ein gemeinsamer Blocker erscheint nur einmal und nennt alle betroffenen
  Planlinks. Beide Abbau-Endportale und **Automatisch** stehen zur Wahl.
- Die automatische Wahl minimiert den zusätzlichen Luftlinienweg vor der
  ersten Abhängigkeit; ein später benötigter Blocker kann erst auf dem Weg zu
  seinem Wurfportal erscheinen. Manuelle Endportalwahl hat Vorrang.
- Liegt das Abbauportal an einem passenden früheren Besuch, werden Aufgaben
  dort gebündelt. Muss ein Portal früher zum Abbau besucht werden, bleiben
  seine späteren Link-/Vorbereitungsaufgaben bestehen.
- Manuelles Abhaken verschiebt die Aufgabe in die gemeldeten Aufgaben und zeigt
  ausstehende Intel-Bestätigung; es verändert keine Intel-Daten und erklärt den
  Einsatzcheck nicht für blockerfrei. Rücknehmen der Meldung plant den Abbau
  erneut ein. Ein Wechsel der gesamten Plangeometrie verwirft diese Meldung.
- Fehlende Abbaukoordinaten und erledigte Wurfportale mit noch offenen Links
  bleiben als nicht eingeplante Aufgaben sichtbar. Keine falschen 0/0-Ziele.
- Keyeingabe, Richtungswahl, Details und Navigation funktionieren. Die
  Detailaktion bewegt die Karte weiterhin nicht. Scrollposition und offene
  Stopps bleiben bei Updates erhalten; alle Controls sind schmal erreichbar.
- JSON enthält sprachneutrale `plannedLinks` mit `from` und `to`, aber keinen
  Nutzerstandort. Offene Richtungen verwenden null.
- Beta-Name, sichtbare Version und beide Update-Adressen bleiben im Beta-Kanal;
  Stable 0.1.55 und dessen Dateien bleiben unverändert. Vor Rückwechsel den
  Plan exportieren; nicht beide Varianten gleichzeitig installieren.

Automatisch abgedeckt durch `src/test-work-plan.mjs`, bestehende UI-/Locale-/
Finalcheck-Tests und `src/build-beta.mjs --check`. Die Browser-Vorschau mit
Beispieldaten ersetzt nicht den noch ausstehenden IITC-Praxistest.

### Vorausgewählte Wurfrichtung

- Bei offener Richtung ist der Vorschlag vom zuerst besuchten Planendportal
  zum anderen Endportal vorausgewählt und als Vorschlag erkennbar. Reine
  Blockerbesuche zählen nicht. Ohne Endportalbesuch bleibt die Richtung offen.
- Vor Übernahme bleiben Schätzung und Export unverändert. **Vorschlag
  übernehmen** speichert die Richtung und berechnet den Keybedarf am Ziel.
- Eine andere Richtung wählen, neu laden und neu routen: Die bestätigte
  Auswahl bleibt bestehen. Vorhandene Links erhalten keinen Vorschlag.

### Kompakte Aufgabentabelle

- Übersicht mit Position, Portal, Keys (vorhanden/benötigt), Links und Blockern.
  Abbau- und notwendige Wiederbesuche stehen weiterhin in derselben Reihenfolge.
- Positionsbutton per Maus, Touch und Tastatur bedienen: Detailzeile sowie
  `aria-expanded` wechseln gemeinsam. Erster Stopp ist anfangs geöffnet.
- Richtung, Keybestand und Abbau ändern: Übersicht aktualisiert sich,
  Aufklappzustand bleibt am selben Stopp und Scrollposition erhalten.
- Bei 360 px und langen Namen bleiben alle Spalten und Bedienelemente erreichbar.
  Keymangel, offene Schätzung (`~`) und Blocker sind unterscheidbar.
- Portalname öffnet die richtigen IITC-Details. Historie und nicht eingeplante
  Aufgaben bleiben verfügbar, einschließlich Rücknahme manueller Erledigung.

## Keys und Medienimport (0.2.0-beta.3)
1. Ohne Keys Bestand ?, deaktivierte Eingaben, Bereitschaft Prüfen statt erfundenem
   Keymangel; Routing und gerichteter Bedarf bleiben nutzbar.
2. Keys aktivieren (auch nach Anchor Planner booten). Panel/Aufgaben lesen den Bestand;
   Eingabe dort sowie Änderungen im Keys-Plugin aktualisieren beide Ansichten.
3. Alte AP-Bestände ignorieren. AP-Daten löschen lässt Keys-Mengen unverändert.
4. Screenshot mit eindeutigen Planportalnamen und xN/×N importieren. Tabelle vor dem
   Schreiben zeigen; Auswahl aufheben, Menge korrigieren, ausdrücklich null setzen.
5. Doppelte Namen, nicht erkannte Namen, Entfernungen ohne x, widersprüchliche Mengen:
   keine stillschweigende Zuordnung oder Übernahme; ungewählte Portale unverändert.
6. Video langsam scrollen; Wiederholungen ergeben eine Zeile. Abbrechen/Schließen,
   Decoderfehler und erneuter Start lassen keine spätere Übernahme zu.
7. Plan während der Prüfung ändern oder Keys deaktivieren: Übernahme verweigern.
8. Desktop und Mobile: Dateiauswahl, Sprachwahl, horizontale Tabelle und Touchbedienung
   prüfen. Große/ungültige Datei oder Video über 2 Minuten verständlich ablehnen.
Automatisiert: node src/test-key-import.mjs ergänzt die vorhandenen Runtime-Prüfungen.

Lokale Browserprüfung des Entwurfs: echte Tesseract-Erkennung eines synthetischen
SVG-Bildes und eines kurzen WebM-Videos erfolgreich; selektive Übernahme einer
Zeile bei unveränderten anderen Beständen bestätigt. Bei 360 Pixel Breite sind
Dateiauswahl und Abbruch bedienbar, Abbruch leert die Prüftabelle und deaktiviert
Übernehmen. Dies ersetzt keinen Test echter Ingress-Aufnahmen in IITC.

## Inventarkarten-OCR (0.2.0-beta.4)
- Helle und abgedunkelte weiße Schrift über Fotos, farbige Level vor Namen,
  gekürzte Namen, Adresse mit Postleitzahl und Entfernung/Icons vor xN testen.
- Nächste Kartenüberschrift und unbekannte Titel dürfen keinen fremden Bestand liefern.
- Namensvarianten mit/ohne Level bei zwei passenden Portalen als mehrdeutig behandeln.
- Reale Aufnahme lokal geprüft: alle fünf sichtbaren Mengen 7/6/10/1/1 korrekt;
  Bild und Ortsdaten bleiben ausschließlich in lokalen temporären Testdateien.
- Erneut im echten IITC-Import mit deutscher OCR testen; Bestände erst nach Prüfung übernehmen.

## Keys zurücksetzen und rückgängig machen (0.2.0-beta.5)
1. Import übernehmen, IITC neu laden, Keyänderung rückgängig öffnen: Vorherwerte verfügbar. Einzelne Keys später ändern: Konflikte bleiben abgewählt; explizite Auswahl stellt sie wieder her.
2. Keys außerhalb des Plans anlegen. Alle Keys zurücksetzen nennt vollständige Portal-/Keyzahl; Dialog schließen ändert nichts, bestätigen setzt alles auf null. Plan und Aufgaben bleiben erhalten. Rücknahme stellt auch planfremde Bestände wieder her.
3. Während der Prüfung Bestand verändern oder neue Sicherung erzeugen: veraltete Übernahme ablehnen. Ausgewählte Konflikte nochmals verändern: nicht überschreiben.
4. Plan löschen und neu laden: Rücknahme bleibt verfügbar. Keine Änderung bei erneutem identischem Import/leerem Reset; vorherige Sicherung bleibt erhalten.
5. Speicherfehler vor Import/Reset: keine Keys schreiben. Teilfehler im Keys-Plugin: Sicherung verfügbar, bereits/unverändert gebliebene Mengen unterscheiden.
6. Dialoge bei 360 Pixel Breite und per Touch prüfen; Tabelle scrollbar, Mengen und Konflikte erkennbar. Tests mit Testbeständen durchführen.

## Gesamtbestandsliste (0.2.0-beta.6)
1. Keybestand ohne gescannten Plan öffnen: auch planfremde/offscreen Keys anzeigen. Gesamtsummen mit Keys abgleichen; positive Mengen vollständig zählen, Nullbestände auslassen.
2. Namen aus Plan, geladenen Markern und Bookmarks anzeigen. Fehlende Namen kennzeichnen; keine GUID als Name, keine Detailabfragen oder Bestandsänderungen.
3. Nach Name suchen, alphabetisch und nach größter Menge sortieren. Gesamtzahlen bleiben unabhängig vom Filter. Leeren Bestand und fehlendes Keys-Plugin unterscheiden.
4. Import, Reset oder Keys-Änderung bei offener Liste: Anzeige aktualisiert sich, Suche/Sortierung/Scroll bleiben erhalten. Nach Laden weiterer Portale Aktualisieren wählen.
5. Bei 360 Pixel Breite: Suchfeld, Sortierung, Refresh, lange Namen und Mengen bleiben erreichbar. Dialog schließen und wieder öffnen.

## Bestätigter Key-Praxistest — 2026-10-06
Vom Nutzer im Chat bestätigt, Stand 0.2.0-beta.6:
- Screenshot- und Videoerkennung liefern korrekte Mengen.
- Ausgewählte Videomengen werden korrekt in IITC Keys gespeichert und in Keybestand angezeigt.
- Alle Keys zurücksetzen → IITC neu laden → Keyänderung rückgängig stellt die vorherigen Mengen wieder her.

Die Testplattform wurde nicht genannt. Diese Rückmeldung bestätigt den getesteten Ablauf, keine getrennte Desktop-/Mobile-Abdeckung oder sämtliche Konflikt-, Codec- und Fehlerszenarien. Diese bleiben anhand der obigen Szenarien zu prüfen.

## Automatischer Keyverbrauch (0.2.0-beta.7)
Automatisiert: `node src/test-key-consumption.mjs` (auch im Repository-CI).
1. Gerichteten offenen Planlink A → B mit bekannten positiven Mengen scannen. Link bauen, Intel aktualisieren: Bestand B und Bedarf B sinken um eins, A bleibt unverändert. Keybestand zeigt die neue Menge.
2. Scan/Finalcheck wiederholen, Karte weg/zurück, IITC refreshen und Plan erneut scannen: keine zweite Buchung desselben Intel-Links. Beim ersten Scan vorhandener Link kostet keinen Key.
3. Nach beobachtetem Abbau neu bauen (neue Intel-GUID): genau ein weiterer Abzug. Import nach Buchung ersetzt die Menge; erneut erkannter gleicher Link verursacht keinen weiteren Abzug.
4. Richtung offen, Keys deaktiviert, Menge unbekannt/null oder Schreibfehler: keine negative/fiktive Buchung; Prüfhinweis am Link, Bestand korrigieren/importieren und Bestand geprüft wählen. Keine verspätete Nachbuchung.
5. Plan löschen, neu scannen: Journal bleibt zum Schutz vor Doppelbuchung erhalten. Letzte Import-/Reset-Sicherung bleibt bestehen; spätere Verbrauchsänderung wird bei Rücknahme als Konflikt geprüft.
6. Desktop/Mobile: Verbrauchs- und Prüfhinweise in Aufgaben sowie Bestandsanzeige nach Kartenrefresh prüfen. Andere Spieler und mehrere Geräte gemäß bekannter Grenzen berücksichtigen.

## Walk Sim (0.2.0-beta.8)
1. Gerichteten Plan mit Blockern, Wiederbesuchen und Keys scannen. Walk Sim öffnen: Reihenfolge entspricht Aufgaben, Abbau erfolgt vor abhängigen Würfen.
2. Vor/Zurück, Abspielen/Pause, Von vorn und Ende testen. Karte zeigt Spur, Links und geometrische Dreiecke. Wiederholtes Abspielen bucht keine echten Keys und ändert keine Erledigung.
3. Unbekannte Keys, Mangel, offene Richtung, fehlende Koordinaten und nicht eingeplante Aufgaben sichtbar prüfen; kein erfundener Wurf.
4. Dialog schließen, erneut öffnen, Scan/Finalcheck auslösen: Timer und Layer werden aufgeräumt, Originalansicht restauriert. Kartenladungen aus Walk Sim dürfen keine echten Keybuchungen erzeugen. Nach Schließen real neu scannen.
5. Plan/GPS während Vorschau ändern: eingefrorener Plan bleibt nachvollziehbar, erneutes Öffnen übernimmt neuen Stand. Desktop/Mobile bei 360 px Bedienelemente und Kartensicht prüfen.
Automatisiert: node src/test-walk-simulation.mjs und bestehende Aufgaben-/Keys-Prüfungen.
