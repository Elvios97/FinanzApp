import { expect, type Page } from "@playwright/test";
import type { EntryType } from "./app-state";

type EntryForm = {
  name: string;
  amount: number;
  type: EntryType;
  category?: string;
};

export async function addEntryThroughUi(page: Page, entry: EntryForm): Promise<void> {
  await page.getByTestId("open-entry-modal").click();
  await expect(page.getByTestId("entry-modal")).toBeVisible();

  await page.getByLabel("Name").fill(entry.name);
  await page.getByLabel("Betrag").fill(String(entry.amount));
  await page.getByTestId(`entry-type-${entry.type}`).click();

  if (entry.category) {
    await page.getByTestId("entry-category").fill(entry.category);
  }

  await page.getByTestId("save-entry").click();
  await expect(page.getByTestId("entry-modal")).toBeHidden();
  await expect(page.getByTestId("entry-row").filter({ hasText: entry.name })).toBeVisible();
}

export async function setIncomeThroughUi(page: Page, amount: number): Promise<void> {
  await page.getByTestId("open-income-modal").click();
  await expect(page.getByTestId("income-modal")).toBeVisible();
  await page.getByLabel("Monatliches Nettoeinkommen").fill(String(amount));
  await page.getByTestId("save-income").click();
  await expect(page.getByTestId("income-modal")).toBeHidden();
}

export async function expectNavAtBottom(page: Page): Promise<void> {
  const navBox = await page.getByTestId("main-nav").boundingBox();
  const viewport = page.viewportSize();

  expect(navBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(navBox!.y + navBox!.height).toBeGreaterThanOrEqual(viewport!.height - 2);
  expect(navBox!.x).toBeLessThanOrEqual(2);
}

export async function expectNavAtLeft(page: Page): Promise<void> {
  const navBox = await page.getByTestId("main-nav").boundingBox();
  const viewport = page.viewportSize();

  expect(navBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(navBox!.x).toBeLessThanOrEqual(2);
  expect(navBox!.y).toBeLessThanOrEqual(2);
  expect(navBox!.height).toBeGreaterThanOrEqual(viewport!.height - 2);
  expect(navBox!.width).toBeLessThanOrEqual(100);
}
