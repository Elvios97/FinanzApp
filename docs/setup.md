# Lokales Setup

Diese Anleitung beschreibt den aktuellen FinanzApp-Stand unter Windows und PowerShell.

## Voraussetzungen

- Node.js
- npm
- Git

Für Playwright kann beim ersten Testlauf zusätzlich die Browser-Installation nötig sein.

## Installation

Im Projektordner:

```powershell
npm install
```

## Entwicklung starten

```powershell
npm run dev
```

Danach die von Vite ausgegebene lokale URL im Browser öffnen.

Typischerweise:

```text
http://localhost:5173
```

## Entwicklung mit Bug-Report-API

Die Vite-App allein stellt `/api/report-bug` lokal nicht bereit. Für die Vercel Serverless Function:

```powershell
npm run dev:vercel
```

Benötigte Environment Variables:

```text
GITHUB_TOKEN=github_pat_xxx
GITHUB_OWNER=Elvios97
GITHUB_REPO=FinanzApp
GITHUB_LABELS=bug,feedback
```

Hinweise:

- `.env` nicht ungefragt ändern.
- Token nie ins Frontend schreiben.
- Ohne GitHub-Konfiguration bleibt die App nutzbar; nur die automatische Issue-Erstellung ist nicht verfügbar.

## Build

```powershell
npm run build
```

Der Build erzeugt `dist/`.

## Preview

```powershell
npm run preview
```

## Tests

```powershell
npm test
```

Weitere Testbefehle:

```powershell
npm run test:headed
npm run test:ui
npm run test:report
```

Falls Playwright-Browser fehlen:

```powershell
npm run test:install
```

## Daten zurücksetzen

Die App speichert Finanzdaten lokal im Browser per `localStorage` unter `meingeld_v3`.

Optionen:

- In der App über Einstellungen die Daten löschen.
- Im Browser die Websitedaten entfernen.
- In DevTools `localStorage` für die lokale App löschen.

## Projektstruktur

- `index.html`: UI-Struktur.
- `style.css`: Styling, Themes und Responsive Layout.
- `app.js`: UI-Logik und Interaktionen.
- `db.js`: Datenmodell, Persistenz und Berechnungen.
- `category-chart.js`: Ausgabenmix-Diagramm.
- `api/report-bug.js`: optionale Vercel Serverless Function.
- `tests/`: Playwright-Tests.
- `docs/`: Projektdokumentation.

## Standard-Checks vor größeren Änderungen

```powershell
npm run build
npm test
```
