# Manuelle Testszenarien

## 1. Drei-Portal-Feld mit ungeladenem Zielportal

**Aufbau:** Drei Draw-Tools-Segmente bilden ein Dreieck. Zwei Portale sind im
aktuellen Kartenausschnitt geladen, der dritte Endpunkt liegt bei ungefähr
`52.209596, 9.704723`.

**Erwartung:**

- drei Segmente werden erkannt;
- der dritte Endpunkt bleibt ungelöst oder zeigt überprüfbare Kandidaten;
- das etwa 198 Meter entfernte „Sportzentrum“ wird nicht still als sichere
  Zuordnung übernommen;
- eine manuelle Zuweisung bleibt nach erneutem Scan erhalten.

## 2. Gegnerisches oder nicht linkfähiges Planportal

**Aufbau:** Ein Endportal ist gegnerisch oder nur teilweise ausgebaut.

**Erwartung:** Das Portal erscheint dennoch in der Planung. Sein aktueller
Ingress-Zustand darf es nicht aus der geometrischen Planung entfernen.

## 3. Vorhandener Planlink

**Aufbau:** Einer der geplanten Links ist in `window.links` geladen und
vorhanden.

**Erwartung:** Der Link wird als vorhanden markiert und der Schlüsselbedarf
entsprechend vermindert. Er darf nicht zugleich als Blocker erscheinen.

## 4. Kreuzender vorhandener Link

**Aufbau:** Ein geladener Intel-Link kreuzt ein geplantes Segment echt, ohne
einen gemeinsamen Endpunkt zu besitzen.

**Erwartung:** Der geplante Link wird als blockiert dargestellt. Nicht geladene
Kartendaten dürfen nicht zu einer endgültigen Entwarnung führen.

## 5. Bookmarks ohne geladene Portale

**Aufbau:** Planportale liegen als Bookmarks vor, sind aber nicht alle als
`window.portals` geladen.

**Erwartung:** Verwertbare Bookmark-Koordinaten und -namen fließen in die
Auflösung ein; Gesamtzahl, verwendete Treffer und Endpunkte bleiben begrifflich
unterscheidbar.

## 6. Mobile Liste und Aktionen

**Aufbau:** Plan mit genügend Portalen für eine längere Liste in IITC Mobile.

**Erwartung:** Das letzte Portal ist erreichbar; Waze und Teilen funktionieren;
Dialog, Layer und Badges kollidieren nicht mit der mobilen Statusleiste.

