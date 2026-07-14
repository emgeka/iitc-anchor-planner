# Changelog

## 0.1.41

- Stabile Update- und Downloadadresse für die Aufnahme in den IITC Community
  Plugins-Katalog ergänzt.
- Userscript-Metadaten um Projekt- und Supportlinks erweitert; das funktionale
  Pluginverhalten bleibt unverändert.

## 0.1.40

- Das nächste offene Portal wird dynamisch anhand des vom offiziellen
  IITC-User-Location-Plugin gemeldeten Standorts bestimmt.
- Eine optionale Luftlinien-Näherungsroute kann die Portalliste einmalig ab dem
  aktuellen Standort sortieren; die manuelle Reihenfolge bleibt weiter nutzbar.
- Bei fehlendem oder ungültigem IITC-Standort gilt weiterhin die gespeicherte
  Routenreihenfolge. Standortdaten werden weder gespeichert noch exportiert.

## 0.1.39

- Blockierende vorhandene Links lassen sich aus den Blocker-Details auf der
  Karte lokalisieren.
- Planlink, Blocklink und berechneter Kreuzungspunkt werden temporär
  hervorgehoben; ein neuer Scan setzt die Auswahl zurück.

## 0.1.38

- Text- und JSON-Export um konkrete Blocker-Details je betroffenem Planlink
  ergänzt.
- Blocker-Endpunkte verwenden geladene Portalnamen oder defensiv Koordinaten;
  der Text-Export weist auf die begrenzte IITC-Datenabdeckung hin.

## 0.1.37

- Kompakte, aufklappbare Blocker-Details ergänzen den betroffenen Planlink und
  die kreuzenden vorhandenen Links.
- Geladene Portalnamen werden defensiv aufgelöst; bei fehlenden Namen erscheinen
  Koordinaten statt technischer GUIDs sowie ein Hinweis auf die IITC-Datenabdeckung.

## 0.1.36

- Text-Export korrigiert: Die Anzahl nicht bestätigter Links verwendet jetzt
  den beim Scan berechneten Wert `unconfirmedLinks`.

## 0.1.35 – importierter Ausgangsstand

- Vorhandene Version unverändert als Codex-Projekt übernommen.
- Projektstruktur, Entwicklungsregeln, Architekturübersicht und Testszenarien
  ergänzt.

Frühere Einzeländerungen sind im Projekt nicht vollständig rekonstruiert und
werden deshalb nicht nachträglich erfunden.
