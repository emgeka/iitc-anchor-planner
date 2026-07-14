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

**Erwartung:** Das letzte Portal ist erreichbar; Waze und Teilen funktionieren;
Dialog, Layer und Badges kollidieren nicht mit der mobilen Statusleiste.

## 6. Blocker-Details und Kartenfokus

**Aufbau:** Ein nicht vorhandener Planlink wird von mindestens einem aktuell
geladenen Intel-Link echt gekreuzt. Die beteiligten Portale einmal ohne und
einmal mit geladenen Portaldetails prüfen.

**Erwartung:**

- Die Blocker-Details nennen Planlink und konkrete Blocklinks.
- Ohne geladene Namen erscheinen Koordinaten und keine technischen GUIDs.
- Nach Laden der Portaldetails erscheinen die Portalnamen.
- **zeigen** hebt Planlink, Blocklink und Kreuzungspunkt hervor und bewegt die
  Karte dorthin.
- Ein neuer Scan entfernt die temporäre Hervorhebung.

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

## 9. Dynamisches nächstes Portal ab IITC-Standort

**Aufbau:** Plan mit mindestens drei offenen Portalen und aktiviertem
IITC-User-Location-Plugin. Standort beziehungsweise Kartenausschnitt so ändern,
dass ein anderes Portal geografisch am nächsten liegt; danach das Zielportal
als erledigt markieren.

**Erwartung:**

- Das Panel zeigt **Nächstes Portal ab Standort** und das geografisch nächste
  offene Portal.
- Eine neue IITC-Position aktualisiert das Ziel, ohne die nummerierte Liste
  umzuschreiben.
- Ein erledigtes Portal wird sofort übersprungen.
- Desktop und Mobil zeigen dasselbe fachliche Verhalten.

## 10. Standort-Fallback und Routensortierung

**Aufbau:** Zuerst ohne gültigen IITC-Standort testen, danach Standortfunktion
aktivieren und **Ab Standort sortieren** auswählen.

**Erwartung:**

- Ohne Standort gilt das erste offene Portal der manuellen Reihenfolge als
  nächstes Ziel; die Sortieraktion weist verständlich auf den fehlenden
  Standort hin.
- Mit Standort wird die Liste einmalig als Luftlinien-Näherungsroute sortiert;
  erledigte Portale stehen hinten.
- Manuelle Pfeiltasten bleiben anschließend wirksam.
- Ein initialer oder ungültiger Standort `0/0` wird nicht verwendet.

## 11. Release-Metadaten und Community-Datei

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
- Es werden keine Entwicklungsänderungen aus `src/` veröffentlicht, die nicht
  zuvor praktisch getestet und freigegeben wurden.
