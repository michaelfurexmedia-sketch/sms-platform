import { spawn } from "node:child_process";
if (process.env.SITES_MANAGED_LINUX_CONTAINER)
  throw new Error(
    "Owner preview must run locally, outside managed/public preview relays.",
  );
const child = spawn(process.execPath, ["scripts/start.mjs"], {
  stdio: "inherit",
  env: {
    ...process.env,
    OWNER_PREVIEW: "local-only",
    APP_HOST: "127.0.0.1",
    PORT: process.env.PORT ?? "3001",
  },
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
