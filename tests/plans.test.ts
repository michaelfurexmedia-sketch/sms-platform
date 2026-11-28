import { test } from "node:test";
import assert from "node:assert/strict";
import {
  plans,
  getPlan,
  planPrice,
  LOW_BALANCE_THRESHOLD,
} from "../src/config/plans";

test("owner plan definitions preserve exact prices, limits and recommendations", () => {
  assert.deepEqual(
    plans.map((p) => [p.id, p.monthlyCents, p.maxActiveNumbers]),
    [
      ["starter", 1900, 1],
      ["professional", 3900, 5],
      ["enterprise", null, 10],
    ],
  );
  assert.deepEqual(
    plans.filter((p) => p.recommended).map((p) => p.id),
    ["professional"],
  );
  assert.equal(planPrice(getPlan("Enterprise")), "Contact Sales");
  assert.equal(planPrice(getPlan("Professional")), "$39/month");
  assert.equal(getPlan("unknown").id, "starter");
  assert.equal(getPlan("Team").id, "starter");
  assert.equal(LOW_BALANCE_THRESHOLD, 5);
});

test("plan entitlements do not infer enterprise terms or message allowances", () => {
  assert.equal(getPlan("starter").entitlements?.scheduledCampaigns, false);
  assert.equal(getPlan("professional").entitlements?.recurringCampaigns, true);
  assert.equal(getPlan("enterprise").entitlements, null);
  for (const plan of plans) assert.equal("credits" in plan, false);
});
