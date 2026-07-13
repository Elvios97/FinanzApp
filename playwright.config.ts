import { defineConfig, devices } from "@playwright/test";

// Playwright sets FORCE_COLOR in some runs; dropping NO_COLOR avoids noisy Node warnings.
delete process.env.NO_COLOR;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["./tests/test-report-reporter.ts"],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
  webServer: {
    command: "node ./tests/support/static-server.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    gracefulShutdown: { signal: "SIGINT", timeout: 500 },
    timeout: 10_000,
  },
});
