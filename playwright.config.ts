import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4175",
    viewport: { width: 1440, height: 1000 },
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm start -- --hostname 127.0.0.1 --port 4175",
    url: "http://127.0.0.1:4175/api/health/",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
