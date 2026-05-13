# Test Report

Letzter Testlauf: 13.5.2026, 12:08:00
Status: passed
Tests: 22/22 erfolgreich (2 uebersprungen)
Dauer: 14s

## Was getestet wurde
- Desktop-Ansicht und linke Desktop-Navigation
- Mobile-Ansicht und untere Mobile-Navigation
- Hinzufuegen von Einnahmen ueber das UI
- Hinzufuegen von Ausgaben ueber das UI
- Auswahl und Zuordnung von Kategorien
- Kategorieanzeige inklusive Diagramm-Legende
- Anzeige des Kreisdiagramms
- Berechnung von Gesamtbetrag, Fixkosten, Freizeit, Sparen und verfuegbarem Geld
- Validierung leerer Eingaben
- Validierung negativer Betraege
- Persistenz von Daten nach einem Reload

## Gefundene und behobene Fehler
- Mehrdeutige Speichern-Buttons in mehreren Modals wurden durch modalspezifische data-testid-Selektoren stabilisiert.
- Geschlossene Modals waren weiterhin technisch sichtbar; Modals nutzen jetzt hidden und werden nach dem Speichern sauber ausgeblendet.
- Die manuelle Eingabe nutzte alert()-Validierung; Fehlermeldungen werden jetzt sichtbar im Formular angezeigt.
- Negative oder leere Betraege werden vor dem Speichern abgefangen.
- Der Test-Server blieb nach gruenen Laeufen aktiv; der Static-Server beendet sich jetzt nach kurzer Inaktivitaet sauber.
- Der Reload-Test wurde gegen erneutes Ueberschreiben des localStorage-Testzustands abgesichert.

## Was funktioniert
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > zeigt das Kreisdiagramm fuer Ausgaben an
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > berechnet Gesamtbetrag, Fixkosten, Freizeit und verfuegbares Geld korrekt
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > validiert leere Eingaben beim manuellen Eintrag
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > fuegt Ausgaben ueber die Eingabemaske hinzu
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > zeigt Kategorien korrekt in der Ausgaben-Legende an
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > setzt das Monatseinkommen ueber den Einnahmen-Dialog
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > waehlt Kategorien aus und ordnet sie in der Legende zu
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > fuegt Einnahmen ueber die Eingabemaske hinzu
- [desktop] desktop > layout.spec.ts > Layout und Navigation > Desktop-Ansicht zeigt die App und die Navbar links
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > validiert negative Betraege beim manuellen Eintrag
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > persistiert Eingaben nach einem Reload
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > zeigt Kategorien korrekt in der Ausgaben-Legende an
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > fuegt Ausgaben ueber die Eingabemaske hinzu
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > fuegt Einnahmen ueber die Eingabemaske hinzu
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > berechnet Gesamtbetrag, Fixkosten, Freizeit und verfuegbares Geld korrekt
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > setzt das Monatseinkommen ueber den Einnahmen-Dialog
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > zeigt das Kreisdiagramm fuer Ausgaben an
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > waehlt Kategorien aus und ordnet sie in der Legende zu
- [mobile] mobile > layout.spec.ts > Layout und Navigation > Mobile-Ansicht zeigt die App und die Navbar unten
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > persistiert Eingaben nach einem Reload
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > validiert negative Betraege beim manuellen Eintrag
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > validiert leere Eingaben beim manuellen Eintrag

## Was fehlschlaegt
- Keine Fehler im letzten Testlauf.

## Empfohlene Verbesserungen
- Die wichtigsten Finanzfluesse sind abgedeckt. Sinnvolle naechste Schritte: Loesch- und Bearbeitungs-Tests, Import-Tests mit Beispiel-JSON und visuelle Regressionen fuer kritische Layouts.
