# Codex Prompts

Diese Prompts helfen, Codex im FinanzApp-Projekt konsistent zu nutzen.

## Master-Prompt

```text
Lies zuerst docs/codex-rules.md, docs/project-plan.md und README.md.
Analysiere den aktuellen Gitstand.
Erstelle bei größeren Änderungen zuerst einen kurzen Plan.
Beachte: Finanzdaten bleiben aktuell lokal im Browser per localStorage.
Keine Bank-API, keine Auth, keine Cloud-Synchronisation und keine externen KI-APIs ohne ausdrückliche Freigabe.
```

## Bugfixing

```text
Lies docs/codex-rules.md und die betroffenen Dateien.
Analysiere diesen Fehler.
Nenne die wahrscheinliche Ursache.
Setze einen kleinen, zielgerichteten Fix um.
Führe passende Checks aus oder erkläre, warum sie nicht möglich waren.

Fehler:
[FEHLER HIER EINFÜGEN]
```

## UI-Verbesserung

```text
Lies index.html, style.css und app.js.
Verbessere diesen UI-Bereich, ohne die bestehende Designsprache zu ändern.
Achte besonders auf Desktop, Mobile, Lesbarkeit, Abstände, Empty States und Fehlermeldungen.
Halte die Änderung klein und teste mit Playwright, wenn ein vorhandener Flow betroffen ist.

Bereich:
[BEREICH HIER BESCHREIBEN]
```

## Finanzlogik

```text
Lies db.js, app.js und die Playwright-Tests.
Ändere die Finanzlogik nur nachvollziehbar und testbar.
Feste Einnahmen, zusätzliche Einnahmen, Fixkosten, Freizeit und Sparen müssen getrennt bleiben.
Passe Tests an oder ergänze Tests, wenn Berechnungen, Export oder Persistenz betroffen sind.

Änderung:
[ÄNDERUNG HIER BESCHREIBEN]
```

## Playwright-Tests

```text
Lies tests/ und TEST_REPORT.md.
Ergänze gezielte Playwright-Tests für diesen Flow.
Nutze vorhandene Helper und stabile data-testid-Selektoren.
Ändere keine Snapshots oder Timeouts blind.

Flow:
[FLOW HIER BESCHREIBEN]
```

## Bug-Report-API

```text
Lies api/report-bug.js, app.js, docs/api.md und tests/layout.spec.ts.
Prüfe den Feedback-Flow.
GitHub-Token dürfen nur serverseitig genutzt werden.
Die Kopierfunktion muss als Fallback erhalten bleiben.

Aufgabe:
[AUFGABE HIER BESCHREIBEN]
```

## Dokumentations-Polish

```text
Lies README.md, TEST_REPORT.md und alle Dateien in docs/.
Prüfe, ob die Dokumentation zum aktuellen FinanzApp-Gitstand passt.
Entferne fremde Projektbegriffe.
Halte Roadmap, Setup, Architektur, API und Checks realistisch.
Keine neuen Features einbauen.
```
