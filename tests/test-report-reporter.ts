import fs from "node:fs";
import path from "node:path";
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

type ResultRow = {
  title: string;
  project: string;
  status: TestResult["status"];
  duration: number;
  error?: string;
};

class MarkdownTestReport implements Reporter {
  private rows: ResultRow[] = [];
  private startedAt = new Date();
  private total = 0;

  onBegin(_config: FullConfig, suite: Suite): void {
    this.startedAt = new Date();
    this.total = suite.allTests().length;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.rows.push({
      title: test.titlePath().slice(1).join(" > "),
      project: test.parent.project()?.name || "default",
      status: result.status,
      duration: result.duration,
      error: result.error?.message,
    });
  }

  onEnd(result: FullResult): void {
    const passed = this.rows.filter((row) => row.status === "passed").length;
    const skipped = this.rows.filter((row) => row.status === "skipped").length;
    const failedRows = this.rows.filter((row) =>
      ["failed", "timedOut", "interrupted"].includes(row.status),
    );
    const tested = [
      "Desktop-Ansicht und linke Desktop-Navigation",
      "Mobile-Ansicht und untere Mobile-Navigation",
      "Hinzufuegen von Einnahmen ueber das UI",
      "Hinzufuegen von Ausgaben ueber das UI",
      "Auswahl und Zuordnung von Kategorien",
      "Kategorieanzeige inklusive Diagramm-Legende",
      "Anzeige des Kreisdiagramms",
      "Berechnung von Gesamtbetrag, Fixkosten, Freizeit, Sparen und verfuegbarem Geld",
      "Validierung leerer Eingaben",
      "Validierung negativer Betraege",
      "Persistenz von Daten nach einem Reload",
    ];
    const foundAndFixed = [
      "Mehrdeutige Speichern-Buttons in mehreren Modals wurden durch modalspezifische data-testid-Selektoren stabilisiert.",
      "Geschlossene Modals waren weiterhin technisch sichtbar; Modals nutzen jetzt hidden und werden nach dem Speichern sauber ausgeblendet.",
      "Die manuelle Eingabe nutzte alert()-Validierung; Fehlermeldungen werden jetzt sichtbar im Formular angezeigt.",
      "Negative oder leere Betraege werden vor dem Speichern abgefangen.",
      "Der Test-Server blieb nach gruenen Laeufen aktiv; der Static-Server beendet sich jetzt nach kurzer Inaktivitaet sauber.",
      "Der Reload-Test wurde gegen erneutes Ueberschreiben des localStorage-Testzustands abgesichert.",
    ];

    const lines = [
      "# Test Report",
      "",
      `Letzter Testlauf: ${new Date().toLocaleString("de-DE")}`,
      `Status: ${result.status}`,
      `Tests: ${passed}/${this.total - skipped} erfolgreich${skipped ? ` (${skipped} uebersprungen)` : ""}`,
      `Dauer: ${Math.round((Date.now() - this.startedAt.getTime()) / 1000)}s`,
      "",
      "## Was getestet wurde",
      ...tested.map((item) => `- ${item}`),
      "",
      "## Gefundene und behobene Fehler",
      ...foundAndFixed.map((item) => `- ${item}`),
      "",
      "## Was funktioniert",
      ...(passed
        ? this.rows
            .filter((row) => row.status === "passed")
            .map((row) => `- [${row.project}] ${row.title}`)
        : ["- Kein Test wurde erfolgreich abgeschlossen."]),
      "",
      "## Was fehlschlaegt",
      ...(failedRows.length
        ? failedRows.map((row) => {
            const firstLine = row.error?.split("\n").find(Boolean);
            return `- [${row.project}] ${row.title}: ${row.status}${firstLine ? ` (${firstLine})` : ""}`;
          })
        : ["- Keine Fehler im letzten Testlauf."]),
      "",
      "## Empfohlene Verbesserungen",
      ...this.recommendations(failedRows),
      "",
    ];

    fs.writeFileSync(path.resolve("TEST_REPORT.md"), lines.join("\n"), "utf8");
  }

  private recommendations(failedRows: ResultRow[]): string[] {
    if (!failedRows.length) {
      return [
        "- Die wichtigsten Finanzfluesse sind abgedeckt. Sinnvolle naechste Schritte: Loesch- und Bearbeitungs-Tests, Import-Tests mit Beispiel-JSON und visuelle Regressionen fuer kritische Layouts.",
      ];
    }

    return [
      "- Fehler zuerst ueber den HTML-Report mit `npm run test:report` und die gespeicherten Screenshots/Traces analysieren.",
      "- Fuer instabile UI-Selektoren gezielte `data-testid` Attribute in der App ergaenzen.",
      "- Bei Berechnungsfehlern die Summenlogik in `db.js` getrennt mit Unit-Tests absichern.",
    ];
  }
}

export default MarkdownTestReport;
