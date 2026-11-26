// Only tracked project files and the generated npm lockfile are exported.
// No environment variables, .env files, credentials or untracked inputs are read.
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import * as prettier from "prettier";
const content = await readFile("package-lock.json", "utf8");
const lock = JSON.parse(content);
if (lock.name !== "sms-platform" || lock.lockfileVersion !== 3) throw new Error("Unexpected lockfile");
const changes = { "package-lock.json": JSON.stringify(lock, null, 2) + "\n" };
const paths = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
for (const path of paths) {
  if (path === "package-lock.json" || path === "docs/PHASE1_RECOVERY.md" || path.startsWith(".env")) continue;
  const info = await prettier.getFileInfo(path, { ignorePath: ".prettierignore" });
  if (info.ignored || !info.inferredParser) continue;
  const original = await readFile(path, "utf8");
  const formatted = await prettier.format(original, { ...await prettier.resolveConfig(path), filepath: path });
  if (formatted !== original) changes[path] = formatted;
}
console.log("PHASE1_GENERATED_START" + JSON.stringify(changes) + "PHASE1_GENERATED_END");
