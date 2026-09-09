# Manuelle Testszenarien

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
variieren.

**Erwartung:**

- **Alle** zählt zwei Planportale, obwohl nur ein Planlink existiert.
- **Offen**, **Blockiert**, **Keys fehlen** und **Erledigt** reagieren auf den
  jeweiligen Portalstatus.
- Die Filter ändern nur die sichtbare Liste, nicht Plan oder Reihenfolge.

## 9. Gemeinsame Arbeitsroute ab IITC-Standort

**Aufbau:** Plan mit mindestens drei offenen Portalen, mehreren Blocklinks und
aktiviertem IITC-User-Location-Plugin. Mindestens ein zusätzliches
Blocker-Endportal vormerken. Standort so ändern, dass nacheinander ein Plan-
und ein Blocker-Portal geografisch am nächsten liegt; danach ein Planportal als
erledigt markieren.

**Erwartung:**

- Das Panel unterscheidet **Nächstes Planportal ab Standort** und **Nächstes
  Blocker-Portal ab Standort** und zeigt die gerundete Luftlinienentfernung.
- Offene Planportale und vorgemerkte Blocker-Portale erscheinen jeweils nur
  einmal in der Arbeitsroute; ein bereits offenes Planportal benötigt keine
  zusätzliche Vormerkung.
- Zielanzahl und geschätzte Reststrecke reagieren unmittelbar auf Vormerkung,
  Erledigt-Status und Standortänderung.
- Eine neue IITC-Position aktualisiert Entfernung und gegebenenfalls das Ziel,
  ohne die nummerierte Liste umzuschreiben. Die Entfernung muss sich auch bei
  unverändertem Zielportal anpassen.
- Ein erledigtes Planportal wird sofort übersprungen, kann aber bei Bedarf als
  Blocker-Ziel ausdrücklich erneut vorgemerkt werden.
- Desktop und Mobil zeigen dasselbe fachliche Verhalten.

## 10. Standort-Fallback und Routensortierung

**Aufbau:** Zuerst ohne gültigen IITC-Standort testen, danach Standortfunktion
aktivieren und **Ab Standort sortieren** auswählen.

**Erwartung:**

- Ohne Standort gilt zunächst das erste offene Planportal der manuellen
  Reihenfolge als nächstes Ziel; vorgemerkte zusätzliche Blocker-Portale folgen
  danach. Die Sortieraktion weist verständlich auf den fehlenden Standort hin,
  und Zielzeile sowie Reststrecke zeigen keine Entfernung.
- Mit Standort wird die Liste einmalig als Luftlinien-Näherungsroute sortiert;
  diese gespeicherte Sortierung betrifft weiterhin nur die Planportalliste,
  während die dynamische Arbeitsroute zusätzliche Blocker-Ziele einbezieht.
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
- Redundante Erklärungen und eine Listenabschlusszeile erscheinen nicht.

## 13. Release-Metadaten und Community-Datei

**Aufbau:** Nach bestätigtem IITC-Praxistest eine neue Version freigeben und
die versionierten sowie stabilen Dateien unter `releases/` erzeugen. Den
Community-Eintrag mit der offiziellen IITC-CE-Generierung verarbeiten.

**Erwartung:**

- `@version` und `ap.VERSION` sind identisch.
- `@updateURL` und `@downloadURL` zeigen auf
  `releases/iitc-anchor-planner.user.js` im öffentlichen Projekt-Repository.
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
