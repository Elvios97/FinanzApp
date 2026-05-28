# Codex Rules

Diese Regeln gelten speziell für Arbeiten an FinanzApp.

## Projektfokus

FinanzApp ist eine persönliche Portfolio-Web-App zur monatlichen Verwaltung von Einnahmen, Ausgaben, Sparbeträgen und Sparzielen. Der aktuelle Stand ist eine Vite-App mit JavaScript, CSS, `localStorage`, Playwright-Tests und optionaler Vercel-Funktion für Bug-Reports.

## Grundregeln

- Erst relevante Dateien lesen, dann ändern.
- Änderungen klein, nachvollziehbar und testbar halten.
- Bestehenden Stil in `index.html`, `style.css`, `app.js` und `db.js` respektieren.
- Keine neuen Libraries ohne vorherige Begründung.
- Keine Secrets, Tokens oder privaten Daten in Dateien schreiben.
- `.env` nicht ungefragt verändern.
- Keine Commits, Pushes oder Datei-Löschungen ohne ausdrückliche Aufforderung.
- Finanzdaten bleiben im aktuellen Stand lokal im Browser.
- Keine Bank-API, Auth, Cloud-Synchronisation oder externe KI-API einbauen, wenn es nicht ausdrücklich geplant ist.

## Technische Regeln

- Kernlogik für Daten, Berechnungen und Export bevorzugt in `db.js` halten.
- UI-Rendering und Interaktionen bevorzugt in `app.js` halten.
- Diagramm-Logik in `category-chart.js` halten.
- Styles in `style.css` ergänzen und bestehende CSS-Variablen nutzen.
- `data-testid`-Selektoren bei testrelevanten UI-Elementen stabil halten.
- Formulareingaben validieren, bevor Daten gespeichert werden.
- Beträge als positive Zahlen speichern; Vorzeichen ergibt sich aus dem Typ.
- Einnahmen, Fixkosten, Freizeit und Sparen getrennt behandeln.
- `income`-Transaktionen nicht in das Ausgabenmix-Diagramm aufnehmen.

## UI-Regeln

- Desktop-Sidebar und mobile Bottom Navigation beibehalten.
- Mobile Darstellung aktiv mitdenken.
- Keine überladenen Screens.
- Primäre Aktionen klar sichtbar machen.
- Fehlermeldungen im Formular anzeigen, nicht per `alert`.
- Empty States, Ladezustände und Fehlerzustände ergänzen, wenn neue Flows entstehen.
- Bestehende Farb- und Theme-Struktur respektieren.

## Dokumentationsregeln

Bei relevanten Änderungen prüfen:

- `README.md`
- `docs/project-plan.md`
- `docs/roadmap.md`
- `docs/api.md`
- `docs/architecture.md`
- `docs/entscheidungen.md`
- `docs/fehlerlog.md`

Wichtige technische Entscheidungen in `docs/entscheidungen.md` dokumentieren. Reale Bugs oder gelöste Fehler in `docs/fehlerlog.md` ergänzen.

## Checks

Nach Änderungen nach Möglichkeit ausführen:

```text
npm run build
npm test
```

Bei reinen Dokumentationsänderungen reicht normalerweise eine gezielte Begriffssuche:

```text
rg -n "fremder-projektname|alter-stack-begriff" docs
```

Die Suchbegriffe an die gerade bereinigten Altlasten anpassen.

Wenn ein Check nicht ausgeführt wurde, im Abschluss offen nennen.
