import type { Page } from "@playwright/test";

export type EntryType = "fixed" | "fun" | "saving" | "income";

type TestEntry = {
  id: string;
  name: string;
  amount: number;
  type: EntryType;
  category: string;
  date: string;
  note: string;
  source: "manual" | "imported";
  createdAt: number;
};

type TestState = {
  currentMonth: string;
  months: Record<string, { income: number; entries: TestEntry[] }>;
  goals: unknown[];
  theme: "dark" | "light";
};

export const dbKey = "meingeld_v3";

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function createEntry(
  id: string,
  name: string,
  amount: number,
  type: EntryType,
  category = name,
): TestEntry {
  return {
    id,
    name,
    amount,
    type,
    category,
    date: "2026-05-13",
    note: "",
    source: "manual",
    createdAt: 1_777_104_000_000,
  };
}

export function createState(entries: TestEntry[] = [], income = 0): TestState {
  const month = currentMonthKey();

  return {
    currentMonth: month,
    months: {
      [month]: {
        income,
        entries,
      },
    },
    goals: [],
    theme: "dark",
  };
}

export async function openApp(page: Page, state = createState()): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      const marker = `${key}_playwright_seeded`;
      if (!window.sessionStorage.getItem(marker)) {
        window.localStorage.setItem(key, value);
        window.sessionStorage.setItem(marker, "1");
      }
    },
    { key: dbKey, value: JSON.stringify(state) },
  );
  await page.goto("/");
}

export async function clearAppState(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    window.localStorage.removeItem(key);
  }, dbKey);
}
