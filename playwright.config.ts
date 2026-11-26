import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4175",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:4175/api/health",
    env: { PORT: "4175", APP_HOST: "127.0.0.1", APP_MODE: "demo" },
    reuseExistingServer: false,
    timeout: 60000,
  },
});
