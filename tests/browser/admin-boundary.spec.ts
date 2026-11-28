import { test, expect } from "@playwright/test";
import { spawn } from "node:child_process";
test("normal production server rejects direct admin routes without exposing data", async ({
  request,
}) => {
  const child = spawn(process.execPath, ["scripts/start.mjs"], {
    env: {
      ...process.env,
      PORT: "4177",
      APP_HOST: "127.0.0.1",
      OWNER_PREVIEW: "",
    },
    stdio: "ignore",
  });
  try {
    await expect
      .poll(async () => {
        try {
          return (
            await request.get("http://127.0.0.1:4177/api/health")
          ).status();
        } catch {
          return 0;
        }
      })
      .toBe(200);
    for (const path of [
      "/admin",
      "/admin/overview",
      "/admin/wallets",
      "/admin/login",
      "/preview/admin",
    ]) {
      const response = await request.get("http://127.0.0.1:4177" + path);
      expect(response.status()).toBe(404);
      expect(await response.text()).not.toContain("Juniper Studio");
    }
  } finally {
    child.kill("SIGTERM");
  }
});
