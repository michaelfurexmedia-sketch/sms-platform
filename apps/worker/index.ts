import { createServer } from "node:http";
import { Worker } from "bullmq";
import { readEnvironment } from "../../src/server/env";
import { foundationQueue, queueConnection } from "../../src/server/queue";
import { processFoundationJob } from "./processor";

const env = readEnvironment(process.env, "worker");
const connection = queueConnection(env.queueUrl!, true);
const worker = new Worker(foundationQueue, processFoundationJob, { connection, concurrency: 2 });
let stopping = false;
const health = createServer(async (req, res) => {
  if (req.url !== "/health") { res.writeHead(404).end(); return; }
  const ready = !stopping && worker.isRunning() && connection.status === "ready";
  res.writeHead(ready ? 200 : 503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify({ status: ready ? "ok" : "unavailable", service: "worker" }));
});
health.listen(env.workerHealthPort, "0.0.0.0");
worker.on("ready", () => console.info("Foundation worker ready; live operations unavailable."));
worker.on("failed", (job) => console.error("Foundation job failed", { id: job?.id }));
// Avoid logging payloads, URLs or raw provider/connection errors.
worker.on("error", () => console.error("Worker connection or processing error."));
connection.on("error", () => console.error("Queue datastore unavailable."));
health.on("error", () => { console.error("Worker health server unavailable."); void shutdown(1); });
async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(1), 25000);
  deadline.unref();
  try {
    await worker.close();
    await connection.quit();
    health.close(() => { clearTimeout(deadline); process.exit(code); });
  } catch { process.exit(1); }
}
process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());
