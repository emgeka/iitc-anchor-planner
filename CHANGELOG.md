# Changelog

## 0.1.46

### English

- Converted the interface, status messages, diagnostics, dialogs, map hints,
  and text exports to semantic translation keys.
- Added ten bundled languages: German, English, Spanish, French, Italian,
  Japanese, Polish, Brazilian Portuguese, Russian, and Simplified Chinese.
- Added automatic browser/page language detection, English fallback, and a
  persistent manual selection under **More → Language**.
- Separated editable locale files under `src/locales/` from the userscript and
  added build-time checks for identical keys and placeholders as well as
  missing and unused translations; no locale files are loaded from the
  internet at runtime.
- Built the manual language list dynamically from bundled locales so that
  additional complete locale files require no language-specific runtime
  changes.
- Kept JSON field names and structure language-neutral and automatically
  verified detection, fallback, persistence, plural forms, text export, and
  the JSON schema.
- Practically tested language selection and the localized interface with
  desktop IITC and IITC Mobile.

### Deutsch

- Oberfläche, Statusmeldungen, Diagnosen, Dialoge, Kartenhinweise und
  Text-Exporte vollständig auf semantische Übersetzungsschlüssel umgestellt.
- Zehn gebündelte Sprachen ergänzt: Deutsch, Englisch, Spanisch, Französisch,
  Italienisch, Japanisch, Polnisch, brasilianisches Portugiesisch, Russisch
  und vereinfachtes Chinesisch.
- Automatische Erkennung über Browser- beziehungsweise Seitensprache,
  Englisch-Fallback und dauerhaft gespeicherte manuelle Auswahl unter
  **Mehr → Sprache** ergänzt.
- Sprachdateien unter `src/locales/` vom Userscript getrennt und einen Build
  mit Prüfungen auf identische Schlüssel, Platzhalter, fehlende sowie
  ungenutzte Übersetzungen ergänzt; zur Laufzeit werden keine Sprachdateien
  aus dem Internet geladen.
- Manuelle Sprachliste dynamisch aus den gebündelten Locales erzeugt, sodass
  weitere vollständige Sprachdateien ohne sprachspezifische Laufzeitänderung
  aufgenommen werden können.
- JSON-Feldnamen und JSON-Struktur sprachneutral beibehalten sowie Erkennung,
  Fallback, Speicherung, Pluralformen, Text-Export und JSON-Schema automatisiert
  geprüft.
- Sprachwahl und übersetzte Oberfläche praktisch auf Desktop-IITC und IITC
  Mobile geprüft.

## 0.1.45

- Hauptansicht auf Scan, Einsatzcheck, nächstes Ziel, Filter, Blocker und
  eingeklappte Portalzeilen verdichtet; weitere Aktionen, Toleranz und
  Scandetails unter **Mehr** gebündelt.
- Portalzeilen zeigen Status, Namen und Keys bereits im kompakten Kopf und
  behalten ihren geöffneten Zustand bei Panelaktualisierungen.
- Entfernung, Reststrecke und offene Zielzahl in einer Zielzeile
  zusammengeführt sowie Scan- und Einsatzcheckdetails gekürzt.
- Redundante Blockerhinweise, Fortschrittsangaben und die Listenabschlusszeile
  entfernt; Fehlermeldungen öffnen den Bereich **Mehr** automatisch.
- Kompakte Darstellung schrittweise in Desktop-IITC und IITC Mobile praktisch
  geprüft.

## 0.1.44

- Kompakten Blockerbereich ergänzt, der Endportale nach der Zahl eindeutiger
  Blocklinks priorisiert und geeignete Endpunkte für die Arbeitsroute vormerken
  lässt.
- Offene Planportale und vorgemerkte Blocker-Portale werden ohne Duplikate zu
  einer standortabhängigen Arbeitsroute mit Zieltyp, Zielentfernung und
  geschätzter Reststrecke zusammengeführt.
- Alle erkannten betroffenen Planlinks, Blocklinks und Kreuzungspunkte werden
  automatisch in einer eigenen Kartenebene hervorgehoben; doppelte Blocklinks
  werden nur einmal gezeichnet.
- Blockeranzeige, gemeinsame Route und automatische Kartenhervorhebung wurden
  praktisch auf Desktop-IITC und IITC Mobile geprüft.

## 0.1.43

- Die Zielzeile zeigt bei gültigem IITC-Standort die gerundete
  Luftlinienentfernung zum nächsten offenen Portal.
- Die Entfernung aktualisiert sich bei Standortänderungen auch dann, wenn
  dasselbe Portal nächstes Ziel bleibt; ohne Standort bleibt sie ausgeblendet.
- Darstellung und Zielwechsel wurden in Desktop-IITC und IITC Mobile praktisch
  geprüft.

## 0.1.42

- Kompakten, aufklappbaren Einsatzcheck für offene Endpunkte, Blocker,
  fehlende Keys, fehlende Namen und begrenzte Linkabdeckung ergänzt.
- Bereits erkannte Blocker-Details aktualisieren verfügbare Portalnamen nach
  neu geladenen IITC-Kartendaten automatisch.
- Geöffnete Blocker-Details und der Einsatzcheck bleiben bei einer
  Panelaktualisierung geöffnet; Desktop und Mobil wurden praktisch geprüft.

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
