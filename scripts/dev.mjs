import { spawn } from "node:child_process";

if (process.env.OWNER_PREVIEW)
  throw new Error(
    "Use npm run preview:owner for the local administrator preview",
  );
// Keep ordinary Next CLI options; adapt the managed preview launcher's flags.
const args = process.argv.slice(2).flatMap((arg) => {
  if (arg === "--strictPort") return [];
  if (arg === "--host") return ["--hostname"];
  if (arg.startsWith("--host=")) return [arg.replace("--host=", "--hostname=")];
  return [arg];
});
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", ...args],
  {
    stdio: "inherit",
    env: process.env,
  },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", () => {
  console.error("Unable to start development preview");
  process.exit(1);
});
