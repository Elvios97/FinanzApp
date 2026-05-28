# Roadmap

Statuswerte:

- geplant: noch nicht begonnen
- in Arbeit: wird aktiv umgesetzt
- erledigt: umgesetzt und dokumentiert
- später: bewusst nach dem aktuellen Portfolio-MVP

## Phasenplan

| Phase | Status | Ziel |
| --- | --- | --- |
| Grundlayout und Navigation | erledigt | Desktop- und Mobile-Struktur nutzbar machen |
| Finanzdaten und Berechnung | erledigt | Einnahmen, Ausgaben, Sparen und Verfügbar korrekt berechnen |
| Transaktionsverwaltung | erledigt | Einträge erstellen, bearbeiten und löschen |
| Visualisierung | erledigt | Statistik-Karten, Ring und Ausgabenmix anzeigen |
| Import und KI-Export | erledigt | Daten strukturiert kopieren und importieren |
| Tests | erledigt | Kernflows mit Playwright absichern |
| Feedback-Flow | erledigt | Bug-Reports optional als GitHub Issue erstellen |
| Dokumentation und Portfolio-Polish | in Arbeit | README, Docs, Screenshots und Demo abrunden |

## Erledigt

- Monatsübersicht mit festem Einkommen.
- Zusätzliche Einnahmen getrennt von festem Einkommen.
- Fixkosten, Freizeit und Sparen als getrennte Typen.
- Verfügbare Summe aus Einnahmen minus Ausgaben und Sparen.
- Ausgabenmix ohne Einnahmen.
- Transaktionsliste mit Filter und Sortierung.
- Bearbeiten und Löschen von Transaktionen.
- Sparplan und Sparziele.
- Dark- und Light-Theme.
- KI-Export als strukturierter Prompt.
- Import-Prompt und JSON-Import.
- PWA-Basis mit Manifest und Service Worker.
- Feedback-Modal mit Kopierfunktion.
- Optionale GitHub-Issue-Erstellung über Vercel Serverless Function.
- Playwright-Tests für Desktop- und Mobile-Flows.

## In Arbeit

- Dokumentation im `docs/`-Ordner auf FinanzApp umstellen.
- Portfolio-taugliche Projektbeschreibung schärfen.
- Offene Roadmap realistisch halten.

## Nahe nächste Schritte

1. Screenshots für Desktop und Mobile erstellen.
2. README mit Screenshots oder Demo-Hinweisen ergänzen.
3. Live-Demo über Vercel prüfen.
4. Mobile Darstellung der Einnahmen-Trennung gezielt durchgehen.
5. Monatsnavigation mit Vor-/Zurück-Pfeilen planen oder umsetzen.

## Spätere Erweiterungen

- Beleg-Upload über Kamera oder Datei-Auswahl.
- OCR für Betrag, Datum und Händler.
- Deutsch/Englisch-Sprachauswahl.
- Zentrale Übersetzungsstruktur.
- Budget-Limits pro Kategorie.
- Monatsvergleich oder Verlaufsgrafik.
- Datenexport und Backup-Import.
- Optional Supabase für geräteübergreifende Nutzung.
- Optional Auth, wenn Cloud-Speicherung bewusst entschieden wird.

## Bewusst nicht im aktuellen MVP

- Bankkonto-Synchronisation.
- Produktive Finanzberatung.
- Vollautomatische KI-Auswertung über eine externe API.
- Cloud-Speicherung ohne klares Datenschutzkonzept.
