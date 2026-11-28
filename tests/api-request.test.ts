import test from "node:test";
import assert from "node:assert/strict";
import {
  pagination,
  errorResponse,
  readJson,
  requireSameOrigin,
} from "../src/server/api/request";
test("pagination is bounded and rejects coercion and unsafe offsets", () => {
  assert.deepEqual(pagination(new URLSearchParams()), {
    page: 1,
    limit: 25,
    skip: 0,
  });
  for (const query of [
    "page=0",
    "page=-1",
    "page=1.5",
    "page=1e3",
    "limit=101",
    "page=99999999999999999",
  ])
    assert.throws(() => pagination(new URLSearchParams(query)));
});
test("JSON body limits cannot be bypassed by missing content length", async () => {
  const request = (body: string) =>
    new Request("https://example.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
  await assert.rejects(
    readJson(request('"' + "a".repeat(100) + '"'), 32),
    /BODY_TOO_LARGE/,
  );
  await assert.rejects(readJson(request("{")), /INVALID_JSON/);
  assert.deepEqual(await readJson(request('{"x":1}')), { x: 1 });
});
test("errors redact internals and mutation origin fails closed", async () => {
  const response = errorResponse(
    new Error("database password=secret"),
    "request-1",
  );
  assert.equal(response.status, 500);
  assert.equal((await response.text()).includes("secret"), false);
  assert.throws(() =>
    requireSameOrigin(
      new Request("https://example.com"),
      "https://example.com",
    ),
  );
  assert.throws(() =>
    requireSameOrigin(
      new Request("https://example.com", {
        headers: { origin: "https://attacker.example" },
      }),
      "https://example.com",
    ),
  );
  requireSameOrigin(
    new Request("https://example.com", {
      headers: { origin: "https://example.com" },
    }),
    "https://example.com",
  );
});
