# Git Workflow

## Branch-Empfehlung

Für dieses Portfolio-Projekt reicht ein einfacher Workflow:

- `main`: stabiler Stand
- `feature/<kurzer-name>`: neue Features
- `fix/<kurzer-name>`: Bugfixes
- `docs/<kurzer-name>`: reine Dokumentationsänderungen
- `test/<kurzer-name>`: Testergänzungen

Beispiele:

```bash
git checkout -b feature/month-navigation
git checkout -b fix/feedback-api-error
git checkout -b docs/finanzapp-docs
```

## Reihenfolge pro Änderung

1. `git status` prüfen.
2. Ziel und betroffene Dateien klären.
3. Kleine Änderung umsetzen.
4. Passende Checks ausführen.
5. `git diff` prüfen.
6. Dokumentation aktualisieren, wenn nötig.
7. Commit erstellen, wenn der Stand sauber ist.

## Änderungen ansehen

```bash
git status
git diff
```

## Dateien gezielt hinzufügen

Gezieltes Hinzufügen ist besser als blind alles zu übernehmen:

```bash
git add docs/project-plan.md
git add app.js
git add tests/finance-flows.spec.ts
```

Wenn bewusst alles geprüft wurde:

```bash
git add .
```

## Commit-Konvention

Empfohlene Präfixe:

- `feat:` neues Feature
- `fix:` Bugfix
- `docs:` Dokumentation
- `test:` Tests
- `refactor:` Strukturverbesserung ohne neues Verhalten
- `chore:` Wartung

## Beispiel-Commits

```bash
git commit -m "docs: update finanzapp project docs"
git commit -m "feat: add month navigation"
git commit -m "test: cover feedback fallback"
git commit -m "fix: validate negative entry amounts"
```

## Checks vor Commit

Für Code-Änderungen:

```powershell
npm run build
npm test
```

Für reine Dokumentationsänderungen:

```powershell
rg -n "fremder-projektname|alter-stack-begriff" docs
```

Den Suchbefehl mit den Begriffen anpassen, die entfernt werden sollen.

## README und Docs aktualisieren

README oder `docs/` aktualisieren, wenn sich eines davon ändert:

- Setup
- API-Endpunkte
- Architektur
- Roadmap
- neue Dependencies
- wichtige technische Entscheidungen
- Teststrategie

## Sicherer Ablauf mit Codex

1. Vorher `git status` prüfen.
2. Codex eine klare Aufgabe geben.
3. Bei größeren Änderungen erst Plan bestätigen.
4. Danach `git diff` lesen.
5. Tests ausführen.
6. Commit bei Bedarf selbst erstellen oder explizit beauftragen.
