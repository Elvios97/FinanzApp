import { expect, test, type Page } from "@playwright/test";
import { addEntryThroughUi, setIncomeThroughUi } from "./support/actions";
import { createEntry, createState, openApp } from "./support/app-state";

async function readCssVariableColor(page: Page, name: string): Promise<string> {
  return page.evaluate((variableName) => {
    const el = document.createElement("span");
    el.style.color = `var(${variableName})`;
    document.body.appendChild(el);
    const color = getComputedStyle(el).color;
    el.remove();
    return color;
  }, name);
}

test.describe("Finanz-App Test-Agent", () => {
  test("fuegt Einnahmen ueber die Eingabemaske hinzu", async ({ page }) => {
    await openApp(page, createState([], 2_000));

    await addEntryThroughUi(page, {
      name: "Nebenjob",
      amount: 300,
      type: "income",
      category: "Einnahmen",
    });

    await expect(page.getByTestId("entry-row").filter({ hasText: "Nebenjob" })).toContainText("+300,00");
    await expect(page.getByTestId("stat-base-income")).toContainText("2.000");
    await expect(page.getByTestId("stat-extra-income")).toContainText("300");
    await expect(page.locator("#overview-income")).toContainText("2.000");
  });

  test("fuegt Ausgaben ueber die Eingabemaske hinzu", async ({ page }) => {
    await openApp(page, createState([], 2_000));

    await addEntryThroughUi(page, {
      name: "Miete",
      amount: 850,
      type: "fixed",
      category: "Wohnen",
    });

    await expect(page.getByTestId("entry-row").filter({ hasText: "Miete" })).toContainText("-850,00");
    await expect(page.getByTestId("stat-expenses")).toContainText("850");
    await expect(page.getByTestId("remaining-highlight")).toContainText("+1.150");
  });

  test("zeigt Kategorien korrekt in der Ausgaben-Legende an", async ({ page }) => {
    await openApp(
      page,
      createState(
        [
          createEntry("rent", "Miete", 900, "fixed", "Miete"),
          createEntry("food", "Rewe", 180, "fun", "Lebensmittel"),
          createEntry("ai", "ChatGPT", 20, "fun", "Software/KI"),
        ],
        2_500,
      ),
    );

    await expect(page.locator("#category-empty")).toBeHidden();
    await expect(page.getByTestId("category-total")).toContainText("1.100,00");
    await expect(page.getByTestId("category-legend")).toContainText("Fixkosten");
    await expect(page.getByTestId("category-legend")).toContainText("Freizeit");

    const fixedColor = await readCssVariableColor(page, "--col-fixed");
    const funColor = await readCssVariableColor(page, "--col-fun");

    await expect(page.locator(".category-legend-row").filter({ hasText: "Fixkosten" }).locator(".category-dot")).toHaveCSS("background-color", fixedColor);
    await expect(page.locator(".category-legend-row").filter({ hasText: "Freizeit" }).locator(".category-dot")).toHaveCSS("background-color", funColor);
  });

  test("berechnet Gesamtbetrag, Fixkosten, Freizeit und verfuegbares Geld korrekt", async ({ page }) => {
    await openApp(
      page,
      createState(
        [
          createEntry("rent", "Miete", 1_000, "fixed", "Wohnen"),
          createEntry("cinema", "Kino", 400, "fun", "Freizeit"),
          createEntry("saving", "ETF", 200, "saving", "Sparen"),
          createEntry("bonus", "Bonus", 300, "income", "Einnahmen"),
        ],
        3_000,
      ),
    );

    await expect(page.locator("#overview-income")).toContainText("3.000");
    await expect(page.getByTestId("stat-base-income")).toContainText("3.000");
    await expect(page.getByTestId("stat-extra-income")).toContainText("300");
    await expect(page.getByTestId("stat-expenses")).toContainText("1.400");
    await expect(page.getByTestId("stat-saving")).toContainText("200");
    await expect(page.getByTestId("stat-available")).toContainText("+1.700");
    await expect(page.getByTestId("category-total")).toContainText("1.600,00");
    await expect(page.getByTestId("category-legend")).not.toContainText("Einnahmen");
    await expect(page.getByTestId("remaining-highlight")).toContainText("+1.700");
    await expect(page.getByTestId("remaining-ring")).toContainText("+1.700");
  });

  test("setzt das Monatseinkommen ueber den Einnahmen-Dialog", async ({ page }) => {
    await openApp(page);

    await setIncomeThroughUi(page, 2_750);

    await expect(page.locator("#overview-income")).toContainText("2.750");
    await expect(page.getByTestId("remaining-highlight")).toContainText("+2.750");
  });

  test("waehlt Kategorien aus und ordnet sie in der Legende zu", async ({ page }) => {
    await openApp(page, createState([], 1_200));

    await addEntryThroughUi(page, {
      name: "Deutschlandticket",
      amount: 49,
      type: "fixed",
      category: "Transport",
    });

    await expect(page.getByTestId("category-legend")).toContainText("Fixkosten");
    await expect(page.getByTestId("category-total")).toContainText("49,00");
  });

  test("zeigt das Kreisdiagramm fuer Ausgaben an", async ({ page }) => {
    await openApp(
      page,
      createState(
        [
          createEntry("rent", "Miete", 900, "fixed", "Wohnen"),
          createEntry("food", "Rewe", 100, "fun", "Lebensmittel"),
        ],
        2_000,
      ),
    );

    await page.getByRole("tab", { name: "Ausgabenmix" }).click();
    const chart = page.getByRole("img", { name: /Kreisdiagramm/i });
    await expect(chart).toBeVisible();
    await expect(chart).toHaveCSS("background-image", /conic-gradient/);
  });

  test("validiert leere Eingaben beim manuellen Eintrag", async ({ page }) => {
    await openApp(page);

    await page.getByTestId("open-entry-modal").click();
    await page.getByTestId("save-entry").click();

    await expect(page.getByTestId("entry-form-error")).toContainText("Namen");
    await expect(page.getByTestId("entry-modal")).toBeVisible();
    await expect(page.getByTestId("entry-row")).toHaveCount(0);
  });

  test("validiert negative Betraege beim manuellen Eintrag", async ({ page }) => {
    await openApp(page);

    await page.getByTestId("open-entry-modal").click();
    await page.getByLabel("Name").fill("Fehlerbetrag");
    await page.getByLabel("Betrag").fill("-10");
    await page.getByTestId("save-entry").click();

    await expect(page.getByTestId("entry-form-error")).toContainText("groesser als 0");
    await expect(page.getByTestId("entry-row")).toHaveCount(0);
  });

  test("persistiert Eingaben nach einem Reload", async ({ page }) => {
    await openApp(page, createState([], 2_000));

    await addEntryThroughUi(page, {
      name: "Persistente Miete",
      amount: 700,
      type: "fixed",
      category: "Wohnen",
    });

    await page.reload();

    await expect(page.getByTestId("entry-row").filter({ hasText: "Persistente Miete" })).toContainText("-700,00");
    await expect(page.getByTestId("remaining-highlight")).toContainText("+1.300");
  });
});
