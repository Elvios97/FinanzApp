import { expect, test } from "@playwright/test";
import { expectNavAtBottom, expectNavAtLeft } from "./support/actions";
import { openApp } from "./support/app-state";

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
});
