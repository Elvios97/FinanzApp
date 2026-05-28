# Test Report

Letzter Testlauf: 28.5.2026, 19:20:58
Status: passed
Tests: 31/31 erfolgreich (3 uebersprungen)
Dauer: 16s

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
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > setzt das Monatseinkommen ueber den Einnahmen-Dialog
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > berechnet Gesamtbetrag, Fixkosten, Freizeit und verfuegbares Geld korrekt
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > validiert leere Eingaben beim manuellen Eintrag
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > zeigt Kategorien korrekt in der Ausgaben-Legende an
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > zeigt das Kreisdiagramm fuer Ausgaben an
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > waehlt Kategorien aus und ordnet sie in der Legende zu
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > fuegt Ausgaben ueber die Eingabemaske hinzu
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > fuegt Einnahmen ueber die Eingabemaske hinzu
- [desktop] desktop > layout.spec.ts > Layout und Navigation > Desktop-Ansicht zeigt die App und die Navbar links
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > loescht eine Transaktion und aktualisiert Liste, Summen und Diagramm
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > validiert negative Betraege beim manuellen Eintrag
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > persistiert Eingaben nach einem Reload
- [desktop] desktop > finance-flows.spec.ts > Finanz-App Test-Agent > bearbeitet eine Transaktion und aktualisiert Summen, Diagramm und Persistenz
- [desktop] desktop > layout.spec.ts > Layout und Navigation > zeigt bei API-Fehlern eine verstaendliche Meldung und laesst Kopieren zu
- [desktop] desktop > layout.spec.ts > Layout und Navigation > sendet einen Bug-Report per API und bietet Kopieren als Fallback
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > berechnet Gesamtbetrag, Fixkosten, Freizeit und verfuegbares Geld korrekt
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > fuegt Einnahmen ueber die Eingabemaske hinzu
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > zeigt Kategorien korrekt in der Ausgaben-Legende an
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > fuegt Ausgaben ueber die Eingabemaske hinzu
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > setzt das Monatseinkommen ueber den Einnahmen-Dialog
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > waehlt Kategorien aus und ordnet sie in der Legende zu
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > persistiert Eingaben nach einem Reload
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > loescht eine Transaktion und aktualisiert Liste, Summen und Diagramm
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > validiert negative Betraege beim manuellen Eintrag
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > bearbeitet eine Transaktion und aktualisiert Summen, Diagramm und Persistenz
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > zeigt das Kreisdiagramm fuer Ausgaben an
- [mobile] mobile > layout.spec.ts > Layout und Navigation > Mobile-Ansicht zeigt die App und die Navbar unten
- [mobile] mobile > layout.spec.ts > Layout und Navigation > Mobile-Ansicht zeigt die getrennten Finanzwerte kompakt ohne Seiten-Overflow
- [mobile] mobile > finance-flows.spec.ts > Finanz-App Test-Agent > validiert leere Eingaben beim manuellen Eintrag
- [mobile] mobile > layout.spec.ts > Layout und Navigation > sendet einen Bug-Report per API und bietet Kopieren als Fallback
- [mobile] mobile > layout.spec.ts > Layout und Navigation > zeigt bei API-Fehlern eine verstaendliche Meldung und laesst Kopieren zu

## Was fehlschlaegt
- Keine Fehler im letzten Testlauf.

## Empfohlene Verbesserungen
- Die wichtigsten Finanzfluesse sind abgedeckt. Sinnvolle naechste Schritte: Loesch- und Bearbeitungs-Tests, Import-Tests mit Beispiel-JSON und visuelle Regressionen fuer kritische Layouts.
