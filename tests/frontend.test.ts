import { test } from "node:test";
import assert from "node:assert/strict";
import { scheduleInstant, wallTime, csvText } from "../src/frontend/scheduling";
test("scheduled wall time converts independently of browser zone and rejects DST ambiguities", () => {
  assert.equal(
    scheduleInstant("2026-12-01T09:00", "America/New_York"),
    "2026-12-01T14:00:00.000Z",
  );
  assert.equal(
    wallTime("2026-12-01T14:00:00.000Z", "Asia/Karachi"),
    "2026-12-01T19:00",
  );
  assert.throws(
    () => scheduleInstant("2026-03-08T02:30", "America/New_York"),
    /does not exist/,
  );
  assert.throws(
    () => scheduleInstant("2026-11-01T01:30", "America/New_York"),
    /twice/,
  );
});
test("CSV exports escape fields and neutralize spreadsheet formula prefixes", () => {
  assert.equal(
    csvText([["=1+1", 'a"b', "a,b", "+12025550101"]]),
    '"\'=1+1","a""b","a,b","\'+12025550101"',
  );
});

import { freshState, seedDemo, sendRequirements } from "../src/lib/model";
import { applyAdminAction } from "../src/frontend/admin-actions";
test("demo financial adjustments validate whole units, preserve balance and record mandatory reasons", () => {
  const s = freshState();
  const w = seedDemo(s);
  const before = w.balance;
  assert.throws(
    () =>
      applyAdminAction(s, {
        workspaceId: w.id,
        action: "Adjust credits",
        reason: "",
        value: "50",
      }),
    /reason/,
  );
  assert.throws(
    () =>
      applyAdminAction(s, {
        workspaceId: w.id,
        action: "Adjust credits",
        reason: "Correction test",
        value: "1.5",
      }),
    /whole/,
  );
  assert.throws(
    () =>
      applyAdminAction(s, {
        workspaceId: w.id,
        action: "Adjust credits",
        reason: "Correction test",
        value: String(-before - 1),
      }),
    /negative/,
  );
  assert.equal(w.balance, before);
  applyAdminAction(s, {
    workspaceId: w.id,
    action: "Adjust credits",
    reason: "Synthetic correction",
    value: "50",
  });
  assert.equal(w.balance, before + 50);
  assert.equal(s.adminPreview?.actions?.[0].reason, "Synthetic correction");
  applyAdminAction(s, {
    workspaceId: w.id,
    action: "Suspend account",
    reason: "Synthetic risk review",
    value: "",
  });
  assert.ok(sendRequirements(w, 1).some((v) => v.includes("suspended")));
  applyAdminAction(s, {
    workspaceId: w.id,
    action: "Reactivate account",
    reason: "Synthetic review cleared",
    value: "",
  });
  assert.ok(!sendRequirements(w, 1).some((v) => v.includes("suspended")));
});
