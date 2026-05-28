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

Die App speichert Daten lokal im Browser unter einem `localStorage`-Key. Es gibt aktuell kein Backend und keine Synchronisation zwischen Geräten.

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
Dekstop:

<img width="2560" height="1440" alt="Dekstop_ausgabenmix" src="https://github.com/user-attachments/assets/342349ab-c0c5-40c3-8976-a31f020f5761" />
<img width="2560" height="1440" alt="Dekstop_add" src="https://github.com/user-attachments/assets/98ea3dfc-85ea-4e0b-8a49-3385f01fa4e3" />
<img width="2560" height="1440" alt="Desktop_main" src="https://github.com/user-attachments/assets/a73efde5-b389-4d93-b2c8-aa917ad13866" />


Mobile:

<img width="996" height="1982" alt="Mobile_main2" src="https://github.com/user-attachments/assets/4196e2e3-6b04-4cb2-8a3a-9ad471023de4" />
<img width="978" height="1982" alt="Mobile_main" src="https://github.com/user-attachments/assets/aa555460-772e-4f9d-bd32-fad0f2df7ff4" />
<img width="996" height="1985" alt="Mobile_Monat" src="https://github.com/user-attachments/assets/2b3f1767-1956-482c-bb3a-32a51414f8c7" />







