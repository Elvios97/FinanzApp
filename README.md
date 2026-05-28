# FinanzApp

FinanzApp ist eine browserbasierte Anwendung zur monatlichen Verwaltung persönlicher Einnahmen, Ausgaben und Sparbeträge. Die App berechnet verfügbare Beträge, visualisiert Ausgabenkategorien und stellt strukturierte Monatsdaten für weitere Auswertungen bereit.

Die Anwendung ist als schlanke Web-App aufgebaut. Sie läuft ohne verpflichtendes Backend, speichert Finanzdaten lokal im Browser und kann optional über eine Vercel Serverless Function Feedback als GitHub Issue erstellen.

## Funktionen

- Monatsübersicht mit festem Einkommen, zusätzlichen Einnahmen, Ausgaben, Sparbeträgen und verfügbarem Betrag
- getrennte Erfassung von Fixkosten, Freizeit-Ausgaben, Sparbeträgen und Einnahmen
- Hinzufügen, Bearbeiten und Löschen von Transaktionen
- Ausgaben-Diagramm für Fixkosten, Freizeit und Sparen
- strukturierter KI-Export für Monatsanalysen
- Dark- und Light-Theme
- responsive Oberfläche mit Desktop-Sidebar und mobiler Bottom Navigation
- Feedback- und Bug-Report-Formular mit Kopierfunktion
- optionale automatische GitHub-Issue-Erstellung über `/api/report-bug`

## Technischer Überblick

- Frontend: HTML, CSS und JavaScript
- Build-Tool und Dev-Server: Vite
- Tests: Playwright
- Persistenz: `localStorage`
- optionale API: Vercel Serverless Function für Bug Reports

## Voraussetzungen

- Node.js
- npm

## Installation

```bash
npm install
```

## Lokale Entwicklung

```bash
npm run dev
```

Danach die von Vite ausgegebene lokale URL im Browser öffnen.

## Produktionsbuild

```bash
npm run build
```

Der Build kann lokal geprüft werden mit:

```bash
npm run preview
```

## Tests

```bash
npm test
```

Weitere Testbefehle:

```bash
npm run test:headed
npm run test:ui
npm run test:report
```

## Nutzung

1. Monat auswählen oder einen neuen Monat anlegen.
2. Festes Einkommen in den Einstellungen eintragen.
3. Transaktionen als Fixkosten, Freizeit, Sparen oder Einnahme erfassen.
4. Summen, Diagramm und verfügbaren Betrag prüfen.
5. Optional den KI-Export für eine strukturierte Monatsanalyse kopieren.

## Datenhaltung

FinanzApp speichert Daten lokal im Browser per `localStorage`. Es gibt derzeit keine Benutzerkonten, keine Cloud-Synchronisation und kein externes Finanzkonto-Tracking.

Das bedeutet:

- Daten bleiben auf dem jeweiligen Gerät und Browserprofil.
- Ein Browserwechsel oder gelöschter Browser-Speicher kann gespeicherte Daten entfernen.
- Für produktive Langzeitnutzung sollte vor größeren Änderungen ein Export- oder Backup-Konzept ergänzt werden.

## KI-Export

Der KI-Export erzeugt eine strukturierte Monatszusammenfassung. Einnahmen und Ausgaben werden bewusst getrennt, damit Analysen konsistent weiterverarbeitet werden können.

Enthaltene Bereiche:

- `einnahmen.fest`: festes monatliches Einkommen
- `einnahmen.zusatz`: zusätzliche Einnahmen aus Transaktionen mit Typ `income`
- `ausgaben.fixkosten`: Fixkosten
- `ausgaben.freizeit`: Freizeit-Ausgaben
- `ausgaben.sparen`: Sparbeträge
- `verfügbar`: feste Einnahmen + Extra-Einnahmen - Fixkosten - Freizeit - Sparen

## Bug Reports

In den Einstellungen steht ein Feedback-Formular zur Verfügung. Beim Absenden sendet die App die Formulardaten an `/api/report-bug`. Die Serverless Function erstellt daraus serverseitig ein GitHub Issue.

Der GitHub-Token wird nicht im Frontend verwendet. Er wird ausschließlich serverseitig über Environment Variables gelesen.

Benötigte Environment Variables:

```bash
GITHUB_TOKEN=github_pat_xxx
GITHUB_OWNER=Elvios97
GITHUB_REPO=FinanzApp
GITHUB_LABELS=bug,feedback
```

`GITHUB_TOKEN` benötigt Schreibrechte für Issues im Repository. `GITHUB_LABELS` ist optional und sollte nur Labels enthalten, die im Repository existieren.

Für lokale Tests mit Serverless Function:

```bash
cp .env.example .env
npm run dev:vercel
```

Unter Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm run dev:vercel
```

`npm run dev` startet nur die Vite-Oberfläche. Die automatische Issue-Erstellung benötigt `npm run dev:vercel`, weil nur dann `/api/report-bug` lokal verfügbar ist.

Wenn die GitHub-Konfiguration fehlt oder ungültig ist, zeigt das Formular eine verständliche Fehlermeldung. Die Kopierfunktion bleibt als Fallback verfügbar.

## Deployment

Die App ist für ein Deployment auf Vercel vorbereitet. Für die Bug-Report-Funktion müssen die gleichen Environment Variables in den Project Settings hinterlegt werden.

Ohne diese Variablen funktioniert das Frontend weiterhin, die automatische GitHub-Issue-Erstellung ist dann jedoch nicht verfügbar.

## Projektstruktur

- `index.html`: Einstiegspunkt der App
- `app.js`: zentrale UI- und Anwendungslogik
- `style.css`: Layout, Themes und responsive Darstellung
- `category-chart.js`: Diagrammlogik für Ausgabenkategorien
- `db.js`: lokale Datenhaltung und Persistenzlogik
- `api/report-bug.js`: Serverless Function für GitHub-Issue-Erstellung
- `tests/`: Playwright-End-to-End-Tests

## Qualitätssicherung

Die wichtigsten Finanzflüsse werden über Playwright geprüft. Der aktuelle Teststatus ist in [TEST_REPORT.md](TEST_REPORT.md) dokumentiert.

Vor Änderungen an Logik, Layout oder Persistenz sollten mindestens diese Checks laufen:

```bash
npm run build
npm test
```
