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
