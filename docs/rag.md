# KI-Export und Analyse

FinanzApp nutzt aktuell kein RAG-System und keine direkte KI-API. Diese Datei beschreibt stattdessen den vorhandenen KI-Export und mögliche spätere KI-Erweiterungen.

## Aktueller Stand

Die App erzeugt über `buildKiExport` in `db.js` einen strukturierten Prompt für den ausgewählten Monat. Dieser Prompt wird in die Zwischenablage kopiert und kann manuell in ein KI-Tool eingefügt werden.

## Warum manueller Export?

- Keine API-Keys im Repository.
- Keine automatische Übertragung privater Finanzdaten.
- Einfacher, nachvollziehbarer Portfolio-Flow.
- Nutzer entscheiden selbst, ob und wohin sie Daten kopieren.

## Enthaltene Daten

Der Export enthält:

- Monat
- feste Einnahmen
- zusätzliche Einnahmen
- gesamte Einnahmen
- Fixkosten
- Freizeit-Ausgaben
- Sparbeträge
- Ausgaben gesamt
- verfügbarer Betrag
- Kategorien mit Name, Betrag, Typ und Quelle
- zusammengefasste Kennzahlen

## Analysefragen

Der Export bittet um:

- kurze Zusammenfassung
- auffällige Ausgaben
- mögliche Sparpotenziale
- Einschätzung der Fixkosten
- Einschätzung der Freizeit-Ausgaben
- konkrete Vorschläge für den nächsten Monat
- einfache Bewertung der finanziellen Situation

## Wichtige Regeln

- Feste Einnahmen und zusätzliche Einnahmen getrennt ausgeben.
- Zusätzliche Einnahmen nicht als Ausgaben behandeln.
- Sparen getrennt von Freizeit und Fixkosten betrachten.
- Ausgaben ohne Sparen und Ausgaben inklusive Sparen unterscheiden.
- Keine geheimen Daten oder Tokens in Prompts schreiben.

## Spätere Optionen

Eine direkte KI-Integration wäre möglich, sollte aber bewusst geplant werden:

- Backend-Schicht für API-Key-Schutz
- klare Einwilligung vor Datenübertragung
- verständliche Datenschutz-Hinweise
- Fehler- und Timeout-Behandlung
- Tests für Prompt-Aufbau und API-Fehler

RAG ist für FinanzApp aktuell nicht nötig, weil keine große Dokumentensammlung durchsucht wird. Falls später Belege, Verträge oder Kontoauszüge analysiert werden, müsste das Thema neu bewertet werden.
