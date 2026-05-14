import { expect, test } from "@playwright/test";
import { expectNavAtBottom, expectNavAtLeft } from "./support/actions";
import { createEntry, createState, openApp } from "./support/app-state";

test.describe("Layout und Navigation", () => {
  test("Desktop-Ansicht zeigt die App und die Navbar links", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Nur im Desktop-Projekt relevant.");

    await openApp(page);

    await expect(page.locator("#screen-overview")).toBeVisible();
    await expect(page.getByTestId("overview-title")).toContainText(/Finanz/i);
    await expect(page.getByTestId("main-nav")).toBeVisible();
    await expectNavAtLeft(page);
  });

  test("Mobile-Ansicht zeigt die App und die Navbar unten", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Nur im Mobile-Projekt relevant.");

    await openApp(page);

    await expect(page.locator("#screen-overview")).toBeVisible();
    await expect(page.getByTestId("main-nav")).toBeVisible();
    await expectNavAtBottom(page);
  });

  test("Mobile-Ansicht zeigt die getrennten Finanzwerte kompakt ohne Seiten-Overflow", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Nur im Mobile-Projekt relevant.");

    await openApp(
      page,
      createState(
        [
          createEntry("bonus", "Bonus", 150, "income", "Einnahmen"),
          createEntry("rent", "Miete", 700, "fixed", "Wohnen"),
          createEntry("fun", "Kino", 80, "fun", "Freizeit"),
          createEntry("saving", "ETF", 120, "saving", "Sparen"),
        ],
        2_000,
      ),
    );

    await expect(page.locator("#overview-income")).toContainText("2.000");
    await expect(page.getByTestId("stat-base-income")).toContainText("2.000");
    await expect(page.getByTestId("stat-extra-income")).toContainText("150");
    await expect(page.getByTestId("stat-expenses")).toContainText("780");
    await expect(page.getByTestId("stat-saving")).toContainText("120");
    await expect(page.getByTestId("stat-available")).toContainText("+1.250");

    const hasPageOverflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth > root.clientWidth + 1;
    });
    expect(hasPageOverflow).toBe(false);
    await expectNavAtBottom(page);
  });

  test("sendet einen Bug-Report per API und bietet Kopieren als Fallback", async ({ page }) => {
    let requestBody = "";
    await page.route("**/api/report-bug", async route => {
      requestBody = route.request().postData() || "";
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, issueUrl: "https://github.com/Elvios97/FinanzApp/issues/1" }),
      });
    });

    await openApp(page);

    await page.locator("#nav-settings").click();
    await page.getByTestId("feedback-link").click();

    await expect(page.getByTestId("feedback-modal")).toBeVisible();
    await page.getByTestId("submit-feedback-report").click();
    await expect(page.getByTestId("feedback-form-error")).toContainText("Titel");

    await page.getByTestId("feedback-title").fill("Diagramm aktualisiert nicht");
    await page.getByTestId("feedback-description").fill("Nach dem Bearbeiten bleibt der alte Wert sichtbar.");
    await page.getByTestId("feedback-steps").fill("Eintrag oeffnen, Betrag aendern, speichern.");
    await page.getByTestId("feedback-actual").fill("Die Summe bleibt gleich.");
    await page.getByTestId("feedback-expected").fill("Die Summe wird neu berechnet.");
    await page.getByTestId("feedback-notes").fill("Screenshot kann ergaenzt werden.");

    await page.getByTestId("copy-feedback-report").click();
    await expect(page.getByTestId("feedback-copy-feedback")).toHaveClass(/show/);

    await page.getByTestId("submit-feedback-report").click();
    await expect(page.getByTestId("submit-feedback-report")).toHaveText("Bug melden");
    await expect(page.getByTestId("feedback-success")).toContainText("Danke");

    expect(JSON.parse(requestBody)).toMatchObject({
      title: "Diagramm aktualisiert nicht",
      description: "Nach dem Bearbeiten bleibt der alte Wert sichtbar.",
      actual: "Die Summe bleibt gleich.",
    });
  });

  test("zeigt bei API-Fehlern eine verstaendliche Meldung und laesst Kopieren zu", async ({ page }) => {
    await page.route("**/api/report-bug", async route => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Bug-Report-Service ist noch nicht vollstaendig konfiguriert." }),
      });
    });

    await openApp(page);

    await page.locator("#nav-settings").click();
    await page.getByTestId("feedback-link").click();
    await page.getByTestId("feedback-title").fill("Issue API nicht erreichbar");
    await page.getByTestId("feedback-description").fill("Der automatische Versand schlaegt fehl.");

    await page.getByTestId("submit-feedback-report").click();

    await expect(page.getByTestId("feedback-form-error")).toContainText("Bug-Report-Service");
    await page.getByTestId("copy-feedback-report").click();
    await expect(page.getByTestId("feedback-copy-feedback")).toHaveClass(/show/);
  });
});
