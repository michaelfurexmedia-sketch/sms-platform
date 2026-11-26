// Export only deterministic, nonsecret build inputs through CI logs when the
// local executor is unavailable. Never include environment values or other files.
import { readFile } from "node:fs/promises";
const content = await readFile("package-lock.json", "utf8");
const lock = JSON.parse(content);
if (lock.name !== "sms-platform" || lock.lockfileVersion !== 3) throw new Error("Unexpected lockfile");
console.log("PHASE1_LOCK_START" + JSON.stringify(lock) + "PHASE1_LOCK_END");
