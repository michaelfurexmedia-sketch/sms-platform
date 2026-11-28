import test from "node:test";
import assert from "node:assert/strict";
import { ownerPreviewAllowed } from "../src/server/owner-preview";
test("admin preview defaults closed and rejects nonlocal and managed configurations", () => {
  for (const env of [
    {},
    { OWNER_PREVIEW: "local-only" },
    { OWNER_PREVIEW: "local-only", APP_HOST: "0.0.0.0" },
    {
      OWNER_PREVIEW: "local-only",
      APP_HOST: "127.0.0.1",
      SITES_MANAGED_LINUX_CONTAINER: "1",
    },
  ])
    assert.equal(ownerPreviewAllowed(env), false);
  assert.equal(
    ownerPreviewAllowed({ OWNER_PREVIEW: "local-only", APP_HOST: "127.0.0.1" }),
    true,
  );
});
