# Fehlerlog

Diese Datei hält relevante Fehler, Ursachen und Fixes für FinanzApp fest.

## 2026-05-28: Dokumentation enthielt Inhalte aus anderem Projekt

Fehlerbild:

- Mehrere Dateien im `docs/`-Ordner beschrieben Documind, PDF-Verarbeitung, FastAPI, Ollama, ChromaDB, RAG und Tauri.
- Diese Inhalte passten nicht zum aktuellen FinanzApp-Gitstand.

Ursache:

- Der `docs/`-Ordner wurde offenbar aus einem anderen Projekt übernommen.

Fix:

- Projekt-, Setup-, Architektur-, API-, Roadmap-, Codex- und Checklisten-Dateien wurden auf FinanzApp umgestellt.
- Informationen stammen aus aktuellem Gitstand, README, Tests und der Notion-Seite `FinanzApp`.

Checks:

- Fremdprojekt-Begriffe in `docs/` prüfen:

```text
rg -n "Documind|FastAPI|Ollama|Chroma|Tauri|PDF|RAG" docs
```

## Vorheriger Teststand aus TEST_REPORT.md

Letzter dokumentierter Testlauf:

- Datum: 28.05.2026, 18:52:33
- Status: passed
- Ergebnis: 31/31 erfolgreich, 3 übersprungen
- Dauer: 17s

Abgedeckte Bereiche:

- Desktop- und Mobile-Layout
- Einnahmen und Ausgaben hinzufügen
- Kategorien und Diagramm
- Summenberechnung
- Eingabevalidierung
- Persistenz nach Reload
- Bearbeiten und Löschen
- Feedback-Flow mit API und Fallback

## Bekannte Risiken

- `localStorage` ist kein Backup.
- API-Fehler bei GitHub-Issue-Erstellung hängen von Vercel- und GitHub-Konfiguration ab.
- Manuelle KI-Analyse hängt davon ab, wohin Nutzer den Export kopieren.
- PWA-Service-Worker sollte nach größeren Build-Änderungen manuell geprüft werden.
