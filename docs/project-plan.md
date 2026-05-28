# Projektplan: FinanzApp

## Kurzbeschreibung

FinanzApp ist eine browserbasierte Portfolio-App zur monatlichen Verwaltung persönlicher Finanzen. Nutzer können feste Einnahmen, zusätzliche Einnahmen, Fixkosten, Freizeit-Ausgaben, Sparbeträge und Sparziele erfassen. Die App berechnet verfügbare Beträge, zeigt Ausgaben visuell an und erzeugt strukturierte Exportdaten für eine manuelle KI-Analyse.

## Ziel

Das Projekt soll als saubere, verständliche und vorzeigbare Web-App zeigen:

- moderne responsive UI
- lokale Datenhaltung mit `localStorage`
- klare Finanzberechnung
- Diagramm- und Statistikdarstellung
- PWA-Basis
- getestete Kernflows mit Playwright
- optionales Feedback-System über GitHub Issues

## MVP-Scope

- Monatsübersicht mit festem Einkommen
- zusätzliche Einnahmen als eigene Transaktionstypen
- Fixkosten, Freizeit-Ausgaben und Sparbeträge
- verfügbare Summe pro Monat
- Ausgabenmix-Diagramm ohne Einnahmen
- Transaktionen hinzufügen, bearbeiten und löschen
- Filter und Sortierung
- Sparziele und Sparplan
- Dark- und Light-Theme
- KI-Export per Zwischenablage
- Import-Prompt und JSON-Import
- lokale Persistenz im Browser
- Playwright-Tests für wichtige Flows
- optionales Feedback-Modal mit `/api/report-bug`

## Nicht-Ziele für den aktuellen Stand

- Keine Bank-API.
- Keine echte Kontoanbindung.
- Keine Benutzerkonten.
- Keine Cloud-Synchronisation.
- Keine externe KI-API im Code.
- Keine OCR-Pflicht für Belege.
- Keine produktive Finanzberatung.

## Tech-Stack

- Frontend: HTML, CSS, JavaScript
- Build-Tool: Vite
- Persistenz: `localStorage`
- Diagramm: eigene DOM/CSS/SVG-nahe Darstellung in `category-chart.js`
- Tests: Playwright
- Optionales Backend: Vercel Serverless Function für Bug-Reports
- Deployment-Ziel: Vercel oder vergleichbares statisches Hosting mit optionaler Serverless Function

## Phasenübersicht

| Phase | Status | Ziel |
| --- | --- | --- |
| 1. Grundstruktur | erledigt | App-Shell, Navigation, Layout und lokale Datenbasis |
| 2. Finanzlogik | erledigt | Einnahmen, Ausgaben, Sparen und verfügbare Summe berechnen |
| 3. Transaktionen | erledigt | Einträge hinzufügen, bearbeiten, löschen, filtern und sortieren |
| 4. Visualisierung | erledigt | Statistik-Karten, Ring und Ausgabenmix-Diagramm |
| 5. Export und Import | erledigt | KI-Export, Import-Prompt und JSON-Import |
| 6. Qualitätssicherung | erledigt | Playwright-Tests für Desktop, Mobile und Kernflows |
| 7. Feedback und API | erledigt | Bug-Report-Modal mit optionaler GitHub-Issue-Erstellung |
| 8. Portfolio-Polish | in Arbeit | Dokumentation, Screenshots, Demo und kleinere UX-Verbesserungen |

## Definition of Done

Ein Stand gilt als portfolio-tauglich, wenn:

- `npm run build` erfolgreich läuft.
- `npm test` erfolgreich läuft oder bekannte Einschränkungen dokumentiert sind.
- README und `docs/` den aktuellen Stand beschreiben.
- Screenshots oder Demo-Hinweise ergänzt sind.
- keine Secrets im Repository liegen.
- mobile und Desktop-Darstellung geprüft sind.
- Feedback-Flow auch ohne API-Konfiguration verständlich bleibt.

## Aktuelle offene Punkte

Aus Notion und Gitstand ergeben sich diese sinnvollen nächsten Schritte:

- Screenshots für README und Portfolio ergänzen.
- Live-Demo vorbereiten.
- Monatswechsel ergonomischer machen, z. B. mit Vor-/Zurück-Pfeilen.
- Mobile Ansicht für Einnahmen-Trennung weiter prüfen.
- Beleg-Upload als einfache mobile Erweiterung evaluieren.
- Deutsch/Englisch-Sprachauswahl mit zentraler Textstruktur planen.
- Optional später Supabase oder Auth prüfen, aber nicht für den aktuellen lokalen MVP.
