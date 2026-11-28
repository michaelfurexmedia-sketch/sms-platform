import { spawn } from "node:child_process";
if (
  process.env.OWNER_PREVIEW &&
  (process.env.OWNER_PREVIEW !== "local-only" ||
    process.env.APP_HOST !== "127.0.0.1" ||
    process.env.SITES_MANAGED_LINUX_CONTAINER)
)
  throw new Error(
    "Owner preview requires local loopback without a managed relay",
  );
const port = process.env.PORT ?? "3000";
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535)
  throw new Error("PORT must be 1024..65535");
const child = spawn(process.execPath, [".next/standalone/server.js"], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: port,
    HOSTNAME: process.env.APP_HOST ?? "127.0.0.1",
  },
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", () => {
  console.error("Unable to start server");
  process.exit(1);
});
