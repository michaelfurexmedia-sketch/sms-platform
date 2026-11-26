import { spawn } from "node:child_process";
const port = process.env.PORT ?? "3000";
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) throw new Error("PORT must be 1024..65535");
const child = spawn(process.execPath, [".next/standalone/server.js"], {
  stdio: "inherit", env: { ...process.env, PORT: port, HOSTNAME: process.env.APP_HOST ?? "127.0.0.1" }
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", () => { console.error("Unable to start server"); process.exit(1); });
