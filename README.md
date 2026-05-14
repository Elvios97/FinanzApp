# FinanzApp

Eine kleine Portfolio-FinanzApp zur monatlichen Übersicht über Einnahmen, Ausgaben, Sparbeträge und verfügbares Geld. Die App läuft lokal im Browser und speichert Daten aktuell bewusst per `localStorage`.

## Features

- Monatsübersicht mit festem Einkommen, Extra-Einnahmen, Ausgaben, Sparen und verfügbarem Betrag
- Trennung von festen monatlichen Einnahmen und zusätzlichen Einnahmen
- Transaktionen für Fixkosten, Freizeit, Sparen und Einnahmen
- Bearbeiten und Löschen von Transaktionen
- Ausgabenmix-Diagramm nur für Fixkosten, Freizeit und Sparen
- KI-Export mit sauber strukturierter Monatszusammenfassung
- Dark-/Light-Theme
- Mobile Navigation unten, Desktop-Sidebar links
- Feedback-/Bug-Report über Formular, Kopierfunktion und automatische GitHub-Issue-Erstellung

## Tech Stack

- HTML, CSS, JavaScript
- Vite als lokaler Dev-Server und Build-Tool
- Playwright für End-to-End-Tests
- `localStorage` für persistente Browserdaten

## Installation

```bash
npm install
```

## Entwicklung Starten

```bash
npm run dev
```

Danach die von Vite ausgegebene lokale URL im Browser öffnen.

## Build

```bash
npm run build
```

Optional kann der Produktionsbuild lokal geprüft werden:

```bash
npm run preview
```

## Tests

```bash
npm test
```

## Nutzung

1. Monat auswählen oder neuen Monat anlegen.
2. Festes Einkommen unter den Einstellungen eintragen.
3. Transaktionen als Fixkosten, Freizeit, Sparen oder Einnahme hinzufügen.
4. Übersicht, Diagramm und verfügbaren Betrag prüfen.
5. KI-Export kopieren, wenn eine Analyse vorbereitet werden soll.

## KI-Export

Der KI-Export trennt Einnahmen und Ausgaben bewusst:

- `einnahmen.fest`: festes monatliches Einkommen
- `einnahmen.zusatz`: zusätzliche Einnahmen aus Transaktionen mit Typ `income`
- `ausgaben.fixkosten`: Fixkosten
- `ausgaben.freizeit`: Freizeit-Ausgaben
- `ausgaben.sparen`: Sparbeträge
- `verfügbar`: feste Einnahmen + Extra-Einnahmen - Fixkosten - Freizeit - Sparen

Die Exportdaten sind so vorbereitet, dass sie direkt für eine KI-Finanzanalyse genutzt werden können.

## localStorage-Hinweis

Die App speichert Daten lokal im Browser unter einem `localStorage`-Key. Es gibt aktuell kein Backend und keine Synchronisation zwischen Geräten. Supabase ist für diese Portfolio-Version nicht eingebunden und bleibt nur eine optionale spätere Erweiterung.

## Bug Reports

In den Einstellungen gibt es einen Feedback-Link, der ein einfaches Formular öffnet. Beim Absenden schickt die App die Formulardaten an die Serverless Function `/api/report-bug`. Dort wird serverseitig ein GitHub Issue erstellt.

Wichtig: Der GitHub-Token liegt nie im Frontend. Er wird nur in der Serverless Function aus Environment Variables gelesen.

Benötigte Environment Variables:

```bash
GITHUB_TOKEN=github_pat_xxx
GITHUB_OWNER=Elvios97
GITHUB_REPO=FinanzApp
GITHUB_LABELS=bug,feedback
```

`GITHUB_TOKEN` braucht Schreibrechte für Issues im Repository. `GITHUB_LABELS` ist optional; nutze dort nur Labels, die im Repository bereits existieren.

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

Danach die lokale Vercel-URL öffnen und in den Einstellungen einen Bug-Report absenden. `npm run dev` startet nur Vite und ist für die reine Oberfläche gedacht; die automatische Issue-Erstellung braucht `npm run dev:vercel`, weil nur dann `/api/report-bug` verfügbar ist. Ohne gültige GitHub-Variablen zeigt das Formular eine verständliche Fehlermeldung; der Button "Bug-Report kopieren" bleibt als Fallback verfügbar.

Beim Deployment auf Vercel müssen die gleichen Variablen in den Project Settings unter Environment Variables eingetragen werden. Für Netlify wäre dieselbe Logik als Netlify Function übertragbar; aktuell ist die Struktur für Vercel vorbereitet.

Der Report enthält Platzhalter für:

- Titel des Problems
- Beschreibung
- Was wurde gemacht?
- Was ist passiert?
- Was wurde erwartet?
- Gerät / Browser
- optionalen Screenshot-Hinweis

## Screenshots

TODO: Screenshot einfügen

## Live-Demo

TODO: Live-Demo-Link ergänzen

## Geplante Verbesserungen

- Echte Demo veröffentlichen
- Screenshots ergänzen
- Optional Supabase oder ein anderes Backend für geräteübergreifende Speicherung prüfen
- Export-/Import-Funktionen erweitern
- Weitere Auswertungen und Monatsvergleiche ergänzen
