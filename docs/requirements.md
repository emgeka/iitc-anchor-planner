# Anforderungen für Version 0.1.41

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
- Darauf hinweisen, dass die Blockerprüfung nur aktuell in IITC geladene Links
  umfasst.

## Abarbeitung und Route

- Keys, Erledigt-Status, Notizen und eine manuell veränderbare
  Routenreihenfolge je Planportal dauerhaft speichern.
- Die Portalliste nach **Alle**, **Offen**, **Blockiert**, **Keys fehlen** und
  **Erledigt** filtern; Zähler müssen Portale und nicht Linkendpunkte zählen.
- Das nächste offene Portal hervorheben und erledigte Portale überspringen.
- Bei gültigem Standort des offiziellen IITC-User-Location-Plugins das
  geografisch nächste offene Portal dynamisch bestimmen.
- Ohne gültigen IITC-Standort auf das erste offene Portal der gespeicherten
  Routenreihenfolge zurückfallen.
- Eine optionale, einmalige Luftlinien-Näherungsroute ab dem aktuellen
  Standort anbieten; manuelle Verschiebung muss weiter möglich bleiben.
- Standortdaten weder in `localStorage` speichern noch exportieren.

## Karte, Navigation und Export

- Alle erkannten Planportale und blockierten Planlinks in einem gemeinsamen
  schaltbaren Layer darstellen.
- Einen ausgewählten Planlink, Blocklink und berechneten Kreuzungspunkt
  temporär hervorheben und die Karte dorthin bewegen.
- Waze-Navigation und weitere geeignete Kartenlinks bereitstellen; externe
  Navigation auf Mobilgeräten nutzbar halten.
- Plan als lesbaren Text und als JSON exportieren.
- Text- und JSON-Export um konkrete Blocker je betroffenem Planlink ergänzen
  und die begrenzte IITC-Datenabdeckung kenntlich machen.

## Bedienung

- Desktop-IITC und IITC Mobile unterstützen.
- Das letzte Listenelement muss mobil vollständig erreichbar bleiben.
- Panel, Dialoge, Overlays und Statusmarker dürfen IITC-Bedienelemente und
  Bookmark-Marker nicht unbrauchbar überdecken.
- Blocker-Details, Filter, Sortierung und Aktionen müssen per Maus und Touch
  bedienbar sein.
- Diagnosebegriffe und Fortschrittszähler müssen exakt ausdrücken, was gezählt
  beziehungsweise nur anhand geladener Daten bestätigt wurde.
