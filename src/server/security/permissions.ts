import { ApiError } from "../api/request";
export const workspaceRoles = [
  "owner",
  "administrator",
  "employee",
  "viewer",
] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];
export const platformRoles = [
  "super_admin",
  "finance",
  "compliance",
  "support",
  "read_only",
] as const;
export type PlatformRole = (typeof platformRoles)[number];
export type WorkspacePermission =
  | "workspace.read"
  | "workspace.manage"
  | "team.manage"
  | "contacts.write"
  | "messages.write"
  | "campaigns.write"
  | "billing.manage";
const workspaceGrants: Record<WorkspaceRole, readonly WorkspacePermission[]> = {
  owner: [
    "workspace.read",
    "workspace.manage",
    "team.manage",
    "contacts.write",
    "messages.write",
    "campaigns.write",
    "billing.manage",
  ],
  administrator: [
    "workspace.read",
    "workspace.manage",
    "team.manage",
    "contacts.write",
    "messages.write",
    "campaigns.write",
  ],
  employee: [
    "workspace.read",
    "contacts.write",
    "messages.write",
    "campaigns.write",
  ],
  viewer: ["workspace.read"],
};
export type VerifiedSession = {
  userId: string;
  expiresAt: Date;
  emailVerified: boolean;
};
export type Membership = {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  active: boolean;
};
// Repositories must load these records server-side; never accept them from JSON/cookies.
export function requireWorkspacePermission(
  session: VerifiedSession | null,
  membership: Membership | null,
  workspaceId: string,
  permission: WorkspacePermission,
  now = new Date(),
) {
  if (
    !session ||
    !Number.isFinite(session.expiresAt.getTime()) ||
    session.expiresAt <= now
  )
    throw new ApiError(401, "AUTHENTICATION_REQUIRED");
  if (!session.emailVerified)
    throw new ApiError(403, "EMAIL_VERIFICATION_REQUIRED");
  if (
    !membership ||
    !membership.active ||
    membership.userId !== session.userId ||
    membership.workspaceId !== workspaceId ||
    !workspaceGrants[membership.role]?.includes(permission)
  )
    throw new ApiError(403, "ACCESS_DENIED");
  return { userId: session.userId, workspaceId };
}
export type PlatformPermission =
  | "platform.read"
  | "customers.suspend"
  | "finance.manage"
  | "compliance.manage"
  | "support.manage"
  | "platform.configure";
const platformGrants: Record<PlatformRole, readonly PlatformPermission[]> = {
  super_admin: [
    "platform.read",
    "customers.suspend",
    "finance.manage",
    "compliance.manage",
    "support.manage",
    "platform.configure",
  ],
  finance: ["platform.read", "finance.manage"],
  compliance: ["platform.read", "compliance.manage", "customers.suspend"],
  support: ["platform.read", "support.manage"],
  read_only: ["platform.read"],
};
export type PlatformGrant = {
  userId: string;
  role: PlatformRole;
  active: boolean;
  ownerAuthorized: boolean;
};
export function requirePlatformPermission(
  session: VerifiedSession | null,
  grant: PlatformGrant | null,
  mfaVerifiedAt: Date | null,
  permission: PlatformPermission,
  now = new Date(),
) {
  if (
    !session ||
    !Number.isFinite(session.expiresAt.getTime()) ||
    session.expiresAt <= now
  )
    throw new ApiError(401, "AUTHENTICATION_REQUIRED");
  if (
    !session.emailVerified ||
    !grant?.active ||
    !grant.ownerAuthorized ||
    grant.userId !== session.userId ||
    !platformGrants[grant.role]?.includes(permission)
  )
    throw new ApiError(403, "ACCESS_DENIED");
  if (
    !mfaVerifiedAt ||
    !Number.isFinite(mfaVerifiedAt.getTime()) ||
    mfaVerifiedAt > now ||
    now.getTime() - mfaVerifiedAt.getTime() > 15 * 60 * 1000
  )
    throw new ApiError(403, "MFA_REQUIRED");
  return { administratorId: session.userId };
}
