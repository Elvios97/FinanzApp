# Learning Notes

## localStorage ist für den MVP ausreichend, aber begrenzt

Für die aktuelle Portfolio-Version ist `localStorage` sinnvoll:

- einfach
- ohne Login
- ohne Backend
- gut für lokale Demo-Daten

Grenzen:

- kein Gerätewechsel
- keine Synchronisation
- kein echtes Backup
- Daten können durch Browser-Cleanup verloren gehen

Nächster sinnvoller Ausbau wäre ein JSON-Export und Import, bevor ein Cloud-Backend geplant wird.

## Einnahmen brauchen eine klare Trennung

Feste Einnahmen und zusätzliche Einnahmen dürfen nicht vermischt werden.

Warum:

- Das feste Einkommen zeigt die planbare Basis.
- Zusätzliche Einnahmen sind oft unregelmäßig.
- Die verfügbare Summe braucht trotzdem beide Werte.
- Der KI-Export wird dadurch nachvollziehbarer.

## Einnahmen gehören nicht in das Ausgabenmix-Diagramm

Das Diagramm soll Ausgabenstruktur zeigen. Deshalb werden nur diese Typen angezeigt:

- Fixkosten
- Freizeit
- Sparen

Zusätzliche Einnahmen werden in Statistiken und Berechnung berücksichtigt, aber nicht im Ausgabenmix.

## Playwright passt gut zur App

Die App ist UI- und Flow-getrieben. Playwright prüft deshalb mehr Nutzen als reine Unit-Tests:

- Formulare
- Modals
- mobile Navigation
- Persistenz nach Reload
- sichtbare Fehlermeldungen
- echte Berechnung im Browser

Bei Änderungen an `db.js` können zusätzlich kleine Unit-Tests sinnvoll werden, falls die Logik weiter wächst.

## KI-Export statt direkter KI-API

Der aktuelle Export ist bewusst manuell:

- keine API-Keys
- kein automatischer Datentransfer
- Nutzer kontrollieren, wohin sie Daten kopieren
- einfache Portfolio-Demo für KI-gestützte Analyse

Eine spätere echte KI-Integration sollte nur über eine Backend-Schicht laufen.

## Notion-Ideen von vorhandenem Code trennen

Notion enthält sinnvolle Erweiterungen wie:

- Monatswechsel mit Pfeilen
- Beleg-Upload
- Deutsch/Englisch-Umschaltung
- Screenshots und Live-Demo

Diese Punkte sind Roadmap, nicht automatisch aktueller Gitstand.
