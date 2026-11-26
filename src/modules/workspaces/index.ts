import type { WorkspaceContext } from "../shared";
export type WorkspaceRole = "owner" | "admin" | "member";
export interface Workspaces {
  requireMembership(workspaceId: string): Promise<WorkspaceContext & { role: WorkspaceRole }>;
  invite(context: WorkspaceContext, email: string, role: WorkspaceRole): Promise<{ invitationId: string }>;
}
