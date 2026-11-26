import { createServer } from "node:http";
import { Worker } from "bullmq";
import { readEnvironment } from "../../src/server/env";
import { connection, queueName } from "../../src/server/queue";
import { processJob } from "./processor";

const env = readEnvironment(process.env, "worker");
const client = connection(env.queueUrl!, true);
const worker = new Worker(queueName, async job => processJob(job.name, job.data), { connection: client, concurrency: 2 });
worker.on("error", () => console.error("Worker connection unavailable"));
worker.on("failed", () => console.error("Foundation job failed"));
let shuttingDown = false;
const server = createServer((request, response) => {
  if (request.url !== "/health") { response.writeHead(404).end(); return; }
  const ready = !shuttingDown && worker.isRunning() && client.status === "ready";
  response.writeHead(ready ? 200 : 503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(JSON.stringify({ service: "worker", status: ready ? "ready" : "unavailable" }));
});
server.listen(env.workerPort, "0.0.0.0");
server.on("error", () => { console.error("Worker health server failed"); void shutdown(1); });
async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  const deadline = setTimeout(() => process.exit(1), 25000);
  deadline.unref();
  server.close();
  try { await worker.close(); await client.quit(); clearTimeout(deadline); process.exit(code); }
  catch { console.error("Worker shutdown failed"); process.exit(1); }
}
process.on("SIGTERM", () => { void shutdown(); });
process.on("SIGINT", () => { void shutdown(); });
