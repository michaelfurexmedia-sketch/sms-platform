import assert from "node:assert/strict";
import test from "node:test";
import { readEnvironment } from "../src/server/env";
import { processJob } from "../apps/worker/processor";
import { brand, brandVariables } from "../src/config/brand";

test("branding has one temporary name and complete theme variables", () => {
  assert.equal(brand.name, "SMS Platform");
  assert.equal(brand.email.senderName, brand.name);
  assert.equal(brand.domain, null);
  assert.deepEqual(Object.keys(brandVariables("light")), Object.keys(brandVariables("dark")));
});
test("live operations fail closed", () => {
  for (const env of [{ APP_MODE: "production" }, { ENABLE_LIVE_SMS: "true" }, { ENABLE_LIVE_BILLING: "1" }]) {
    assert.throws(() => readEnvironment(env));
  }
  assert.equal(readEnvironment({}).mode, "demo");
});
test("configuration validates service dependencies without echoing secrets", () => {
  assert.throws(() => readEnvironment({}, "worker"), /QUEUE_URL is required/);
  assert.throws(() => readEnvironment({ QUEUE_URL: "https://secret:pass@host" }), /^Error: Invalid QUEUE_URL$/);
  assert.throws(() => readEnvironment({ APP_URL: "http://secret:pass@host" }), /^Error: Invalid APP_URL$/);
  for (const port of ["abc", "0", "80", "65536", "3001.5"]) assert.throws(() => readEnvironment({ WORKER_HEALTH_PORT: port }));
  assert.equal(readEnvironment({ QUEUE_URL: "redis://localhost:6379" }, "worker").workerPort, 3001);
});
test("worker accepts only bounded foundation probes", () => {
  assert.deepEqual(processJob("system.probe", { probeId: "check-1" }), { status: "ok", probeId: "check-1" });
  for (const payload of [null, [], {}, { probeId: "" }, { probeId: "x".repeat(65) }, { probeId: "x", secret: "extra" }]) {
    assert.throws(() => processJob("system.probe", payload));
  }
  for (const name of ["sms.send", "billing.charge", ""]) assert.throws(() => processJob(name, { probeId: "x" }));
});
