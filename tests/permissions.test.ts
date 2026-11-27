import test from "node:test";
import assert from "node:assert/strict";
import {
  requireWorkspacePermission,
  requirePlatformPermission,
  type Membership,
} from "../src/server/security/permissions";
const now = new Date("2026-01-01T00:00:00Z");
const session = {
  userId: "u1",
  emailVerified: true,
  expiresAt: new Date(now.getTime() + 3600000),
};
const membership: Membership = {
  userId: "u1",
  workspaceId: "w1",
  role: "owner",
  active: true,
};
test("workspace authorization rejects foreign, inactive, expired and unverified identities", () => {
  assert.deepEqual(
    requireWorkspacePermission(
      session,
      membership,
      "w1",
      "billing.manage",
      now,
    ),
    { userId: "u1", workspaceId: "w1" },
  );
  for (const m of [
    null,
    { ...membership, userId: "u2" },
    { ...membership, workspaceId: "w2" },
    { ...membership, active: false },
    { ...membership, role: "viewer" as const },
  ])
    assert.throws(() =>
      requireWorkspacePermission(session, m, "w1", "contacts.write", now),
    );
  for (const s of [
    null,
    { ...session, emailVerified: false },
    { ...session, expiresAt: now },
    { ...session, expiresAt: new Date(NaN) },
  ])
    assert.throws(() =>
      requireWorkspacePermission(s, membership, "w1", "workspace.read", now),
    );
});
test("platform privileges require separate owner-authorized grant and recent MFA", () => {
  const grant = {
    userId: "u1",
    role: "super_admin" as const,
    active: true,
    ownerAuthorized: true,
  };
  assert.deepEqual(
    requirePlatformPermission(session, grant, now, "finance.manage", now),
    { administratorId: "u1" },
  );
  assert.throws(() =>
    requirePlatformPermission(session, null, now, "platform.read", now),
  );
  for (const g of [
    { ...grant, ownerAuthorized: false },
    { ...grant, userId: "u2" },
    { ...grant, role: "support" as const },
    { ...grant, active: false },
  ])
    assert.throws(() =>
      requirePlatformPermission(session, g, now, "finance.manage", now),
    );
  for (const mfa of [
    null,
    new Date(NaN),
    new Date(now.getTime() + 1),
    new Date(now.getTime() - 900001),
  ])
    assert.throws(() =>
      requirePlatformPermission(session, grant, mfa, "platform.read", now),
    );
});
