import { spawn } from "node:child_process";
const args = process.argv.slice(2);
let port = process.env.PORT ?? "3000", host = process.env.HOSTNAME ?? "127.0.0.1";
for (let i = 0; i < args.length; i += 2) {
  if (!args[i + 1]) throw new Error("Missing option value.");
  if (args[i] === "--port") port = args[i + 1];
  else if (args[i] === "--hostname" || args[i] === "--host") host = args[i + 1];
  else throw new Error("Unsupported startup option.");
}
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) throw new Error("Invalid port.");
const child = spawn(process.execPath, [".next/standalone/server.js"], {
  stdio: "inherit", env: { ...process.env, PORT: port, HOSTNAME: host },
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", code => process.exit(code ?? 1));
child.on("error", () => process.exit(1));
