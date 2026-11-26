import type { PlatformContext, Page, PageRequest } from "../shared";
export interface AuditEntry { id: string; actorId: string; action: string; targetId: string; at: string; }
export interface Administration {
  audit(context: PlatformContext, page: PageRequest): Promise<Page<AuditEntry>>;
  suspendWorkspace(context: PlatformContext, workspaceId: string, reason: string): Promise<void>;
}
// Workspace roles must never grant platform administration.
