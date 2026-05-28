# Architektur

FinanzApp ist eine schlanke browserbasierte Finanz-App. Die Kernlogik läuft vollständig im Frontend. Finanzdaten werden aktuell per `localStorage` im Browser gespeichert. Ein Backend ist nur optional für Bug-Reports vorhanden.

## Überblick

```text
Browser UI
  |
  | HTML, CSS, JavaScript
  v
App-Logik in app.js
  |
  | nutzt Datenmodell und Persistenz
  v
db.js -> localStorage

Optional:
Feedback-Modal -> /api/report-bug -> GitHub Issues
```

## Frontend

Die App besteht aus statischen Dateien und wird mit Vite entwickelt.

Wichtige Dateien:

- `index.html`: HTML-Struktur, Screens, Modals und Navigation.
- `style.css`: Layout, Themes, responsive Desktop- und Mobile-Darstellung.
- `app.js`: UI-Logik, Rendering, Formulare, Navigation, Feedback-Flow.
- `db.js`: Datenmodell, Monatsdaten, Aggregationen, Import- und KI-Exportlogik.
- `category-chart.js`: Ausgabenmix-Diagramm für Fixkosten, Freizeit und Sparen.
- `manifest.json` und `sw.js`: PWA-Basis.

## Datenmodell

Der Zustand wird unter dem Key `meingeld_v3` in `localStorage` gespeichert.

Grundstruktur:

```json
{
  "currentMonth": "2026-05",
  "months": {
    "2026-05": {
      "income": 2500,
      "entries": []
    }
  },
  "goals": [],
  "theme": "dark"
}
```

Ein Eintrag enthält unter anderem:

- `id`
- `name`
- `amount`
- `type`
- `category`
- `date`
- `note`
- `source`
- `createdAt`

Gültige Typen:

- `fixed`: Fixkosten
- `fun`: Freizeit-Ausgaben
- `saving`: Sparbeträge
- `income`: zusätzliche Einnahmen

## Berechnungslogik

Die Monatsberechnung trennt feste Einnahmen und zusätzliche Einnahmen:

```text
Verfügbar = feste monatliche Einnahmen + zusätzliche Einnahmen - Fixkosten - Freizeit - Sparen
```

Wichtig:

- Das feste Einkommen wird pro Monat unter `income` gespeichert.
- Zusätzliche Einnahmen sind Transaktionen mit `type: "income"`.
- Das Ausgabenmix-Diagramm berücksichtigt nur `fixed`, `fun` und `saving`.
- Zusätzliche Einnahmen erhöhen den verfügbaren Betrag, erscheinen aber nicht im Ausgabenmix.

## Screens und Bedienbereiche

Die aktuelle UI enthält:

- Monatsübersicht
- Statistik-Karten für Einkommen, Extra-Einnahmen, Ausgaben, Sparen und Verfügbar
- Budget-/Verfügbarkeitsring
- Ausgabenmix-Diagramm
- Transaktionsliste mit Filter und Sortierung
- Importbereich mit KI-Import-Prompt
- Monats-Historie
- Sparplan
- Einstellungen mit Theme, Einkommen, Datenlöschung und Feedback-Modal

## Optionaler API-Teil

`api/report-bug.js` ist eine Vercel Serverless Function. Sie nimmt Feedback entgegen und erstellt serverseitig ein GitHub Issue.

Der GitHub-Token wird nicht im Browser verwendet. Wenn die Konfiguration fehlt, zeigt das Frontend eine Fehlermeldung und bietet weiterhin die Kopierfunktion an.

## Tests

Die wichtigsten User-Flows werden mit Playwright getestet:

- Desktop- und Mobile-Layout
- Einnahmen und Ausgaben hinzufügen
- Kategorien und Ausgabenmix
- Berechnung von Summen
- Validierung leerer und negativer Eingaben
- Bearbeiten und Löschen von Transaktionen
- Persistenz nach Reload
- Feedback-API-Erfolg und Fehler-Fallback

Der letzte dokumentierte Stand in `TEST_REPORT.md` meldet 31 erfolgreiche Tests und 3 übersprungene Tests.

## Grenzen des aktuellen Stands

- Keine Benutzerkonten.
- Keine Cloud-Synchronisation.
- Keine Bank-API.
- Keine externe KI-API im Code.
- Kein echtes Backend für Finanzdaten.
- Keine Datenmigration außer der aktuellen Normalisierung in `db.js`.
