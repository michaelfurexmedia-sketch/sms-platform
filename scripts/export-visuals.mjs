// Synthetic test screenshots only; no environment or customer data.
import { readFile } from "node:fs/promises";
for (const width of [1440, 768, 390]) for (const theme of ["light", "dark"]) {
  const file = "test-results/design-" + theme + "-" + width + ".jpg";
  const image = await readFile(file);
  console.log("PHASE1_IMAGE_" + theme + "_" + width + "_START" + image.toString("base64") + "PHASE1_IMAGE_END");
}
