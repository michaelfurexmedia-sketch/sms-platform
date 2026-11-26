import { access, copyFile, constants } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const major = Number(process.versions.node.split(".")[0]);
if (major < 22 || major >= 25)
  throw new Error("Use Node 22 (.nvmrc); supported range is 22–24");
await access("package-lock.json");
try {
  await copyFile(".env.example", ".env", constants.COPYFILE_EXCL);
} catch (error) {
  if (error.code !== "EEXIST") throw error;
}
const result = spawnSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["ci"],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
