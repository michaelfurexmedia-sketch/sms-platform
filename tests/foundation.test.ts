import test from "node:test";
import assert from "node:assert/strict";
import { readEnvironment } from "../src/server/env";
import { processFoundationJob } from "../apps/worker/processor";
import { brand } from "../src/config/brand";

test("environment fails closed for unsupported modes and live operations", () => {
  for (const source of [{ APP_MODE: "live" }, { ENABLE_LIVE_SMS: "true" }, { ENABLE_LIVE_BILLING: "true" }])
    assert.throws(() => readEnvironment(source));
  assert.equal(readEnvironment({}).mode, "demo");
});
test("environment validates URLs and worker configuration without exposing credentials", () => {
  assert.throws(() => readEnvironment({}, "worker"), /QUEUE_URL/);
  for (const APP_URL of ["not-url", "file:///etc/passwd", "http://secret:password@localhost"])
    assert.throws(() => readEnvironment({ APP_URL }), /APP_URL/);
  assert.throws(() => readEnvironment({ QUEUE_URL: "https://secret@example.com" }), /QUEUE_URL/);
  assert.throws(() => readEnvironment({ WORKER_HEALTH_PORT: "NaN" }), /WORKER_HEALTH_PORT/);
  assert.equal(readEnvironment({ QUEUE_URL: "redis://localhost:6379" }, "worker").workerHealthPort, 3001);
});
test("worker accepts only diagnostic payloads and rejects business operations", async () => {
  assert.deepEqual(await processFoundationJob({name:"system.probe",data:{probeId:"test-1"}}),{probeId:"test-1",processed:true});
  for (const job of [{name:"sms.send",data:{probeId:"a"}},{name:"billing.charge",data:{}},{name:"system.probe",data:null},{name:"system.probe",data:{probeId:"a",phone:"secret"}},{name:"system.probe",data:{probeId:""}}])
    await assert.rejects(processFoundationJob(job));
});
test("temporary branding has no invented owner details", () => {
  assert.equal(brand.name, "SMS Platform");
  assert.equal(brand.company.legalName, null);
  assert.equal(brand.domain, null);
});
