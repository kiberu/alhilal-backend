import { defineConfig, devices } from "@playwright/test";

const apiBaseUrl = "http://127.0.0.1:4010/api/v1/";
const appBaseUrl = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: appBaseUrl,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "node tests/e2e/mock-public-api.mjs",
      url: "http://127.0.0.1:4010/health",
      reuseExistingServer: false,
    },
    {
      command: `sh -c 'until curl -sf http://127.0.0.1:4010/health >/dev/null; do sleep 1; done; NEXT_PUBLIC_API_URL=${apiBaseUrl} API_URL_INTERNAL=${apiBaseUrl} npm run dev:test'`,
      url: appBaseUrl,
      reuseExistingServer: false,
    },
  ],
});
