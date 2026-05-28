# Entscheidungen

Diese Datei dokumentiert wichtige technische Entscheidungen für FinanzApp.

## Entscheidung: Browser-App mit Vite

Datum: 2026-05-28

FinanzApp wird als browserbasierte Web-App mit Vite entwickelt.

Begründung:

- Der Funktionsumfang passt gut zu einer schlanken Web-App.
- Vite bietet schnellen lokalen Entwicklungsstart und einfachen Build.
- Das Projekt bleibt als Portfolio-App leicht nachvollziehbar.
- Deployment auf Vercel oder ähnlichem Hosting ist unkompliziert.

Alternativen:

- React/TypeScript-Neuaufbau
- Flutter-App
- vollwertiges Backend-Projekt

Diese Alternativen sind für den aktuellen Stand nicht nötig.

## Entscheidung: Lokale Datenhaltung per localStorage

Datum: 2026-05-28

Finanzdaten werden aktuell im Browser per `localStorage` gespeichert.

Begründung:

- Keine Benutzerkonten nötig.
- Keine Cloud-Synchronisation nötig.
- Ein lokaler Portfolio-MVP bleibt einfach testbar.
- Finanzdaten verlassen das Gerät nicht automatisch.

Grenzen:

- Daten sind an Browser und Gerät gebunden.
- Gelöschte Browserdaten entfernen auch App-Daten.
- Es gibt noch kein Backup- oder Exportkonzept für echte Langzeitnutzung.

## Entscheidung: Feste und zusätzliche Einnahmen getrennt behandeln

Datum: 2026-05-28

Das feste Monatseinkommen wird getrennt von zusätzlichen Einnahmen gespeichert und angezeigt.

Begründung:

- Feste Einnahmen sind planbar.
- Zusätzliche Einnahmen wie Verkäufe, Rückzahlungen oder Boni sollen die Planung nicht verfälschen.
- Der verfügbare Betrag braucht trotzdem beide Einnahmearten.

Berechnung:

```text
Verfügbar = feste Einnahmen + zusätzliche Einnahmen - Fixkosten - Freizeit - Sparen
```

## Entscheidung: Einnahmen nicht im Ausgabenmix anzeigen

Datum: 2026-05-28

Das Ausgabenmix-Diagramm berücksichtigt nur Fixkosten, Freizeit und Sparen.

Begründung:

- Einnahmen sind keine Ausgabenkategorie.
- Das Diagramm soll zeigen, wohin Geld abfließt.
- Die Trennung macht KI-Export und Monatsanalyse verständlicher.

## Entscheidung: Playwright für Kernflows

Datum: 2026-05-28

Die wichtigsten UI- und Finanzflows werden mit Playwright getestet.

Begründung:

- Die App ist stark UI-getrieben.
- Berechnungen, Persistenz und Formulare lassen sich realitätsnah prüfen.
- Desktop- und Mobile-Darstellung können getrennt getestet werden.

Aktuell abgedeckt:

- Layout Desktop und Mobile
- Einträge hinzufügen, bearbeiten und löschen
- Validierung leerer und negativer Eingaben
- Ausgabenmix und Legende
- Summenberechnung
- Persistenz nach Reload
- Feedback-API-Erfolg und Fehler-Fallback

## Entscheidung: Bug-Reports optional über GitHub Issues

Datum: 2026-05-28

Das Feedback-Modal kann über `/api/report-bug` ein GitHub Issue erstellen.

Begründung:

- Für ein Portfolio-Projekt ist ein sichtbarer Feedback-Flow hilfreich.
- GitHub Issues passen zum Entwicklungsprozess.
- Der Token bleibt serverseitig in einer Vercel Function.
- Ohne API-Konfiguration bleibt die Kopierfunktion als Fallback nutzbar.

## Entscheidung: Keine externe KI-API im aktuellen Code

Datum: 2026-05-28

FinanzApp erzeugt aktuell einen KI-Export für manuelle Analyse, ruft aber keine externe KI-API selbst auf.

Begründung:

- Keine API-Keys im Projekt nötig.
- Kein Datenschutzrisiko durch automatische Übertragung.
- Der Export bleibt transparent und kontrollierbar.
- Eine spätere API-Integration kann bewusst über eine Backend-Schicht geplant werden.
