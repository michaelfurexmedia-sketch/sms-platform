import test from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { createQueue } from "../src/server/queue";

test(
  "queued jobs survive worker restart; invalid jobs fail; shutdown is clean",
  { timeout: 45000 },
  async () => {
    const url = process.env.QUEUE_URL;
    assert.ok(url, "Set QUEUE_URL to a dedicated local test datastore");
    const { queue, client } = createQueue(url);
    let child: ChildProcess | undefined;
    const ids: string[] = [];
    const port = "4311";
    async function until(check: () => Promise<boolean>, message: string) {
      const deadline = Date.now() + 12000;
      while (Date.now() < deadline) {
        if (await check()) return;
        await delay(100);
      }
      throw new Error(message);
    }
    async function start() {
      child = spawn(process.execPath, ["dist/worker/apps/worker/index.js"], {
        stdio: "ignore",
        env: {
          ...process.env,
          APP_MODE: "demo",
          ENABLE_LIVE_SMS: "false",
          ENABLE_LIVE_BILLING: "false",
          QUEUE_URL: url,
          WORKER_HEALTH_PORT: port,
        },
      });
      await until(async () => {
        if (child?.exitCode !== null)
          throw new Error("Worker exited before readiness");
        try {
          return (
            await fetch("http://127.0.0.1:" + port + "/health", {
              signal: AbortSignal.timeout(500),
            })
          ).ok;
        } catch {
          return false;
        }
      }, "Worker did not become ready");
    }
    async function stop() {
      if (!child) return;
      const stopped = once(child, "exit");
      child.kill("SIGTERM");
      const [code, signal] = await stopped;
      child = undefined;
      assert.equal(signal, null);
      assert.equal(code, 0);
    }
    try {
      await until(
        async () => client.status === "ready",
        "Queue connection unavailable",
      );
      await queue.waitUntilReady();
      for (let round = 0; round < 2; round++) {
        const id = randomUUID();
        ids.push(id);
        const job = await queue.add(
          "system.probe",
          { probeId: id },
          { jobId: id },
        );
        assert.equal(await job.getState(), "waiting");
        await start();
        await until(
          async () => (await job.getState()) === "completed",
          "Probe was not completed",
        );
        const completed = await queue.getJob(id);
        assert.deepEqual(completed?.returnvalue, { probeId: id, status: "ok" });
        await stop();
      }
      const id = randomUUID();
      ids.push(id);
      const invalid = await queue.add(
        "sms.send",
        { probeId: id },
        { jobId: id },
      );
      await start();
      await until(
        async () => (await invalid.getState()) === "failed",
        "Unsupported job was not rejected",
      );
      const failed = await queue.getJob(id);
      assert.equal(failed?.attemptsMade, 1);
      await stop();
    } finally {
      if (child) {
        const exited = once(child, "exit");
        child.kill("SIGKILL");
        await exited;
      }
      for (const id of ids) {
        const job = await queue.getJob(id);
        if (job) await job.remove();
      }
      await queue.close();
      client.disconnect();
    }
  },
);
