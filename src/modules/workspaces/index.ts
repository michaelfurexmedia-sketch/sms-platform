// Phase 1 contract only; no operational service or permission enforcement yet.
import type { TenantContext, EntityRef } from "../shared";
export interface WorkspaceService {
  members(
    context: TenantContext,
  ): Promise<{ userId: string; role: "owner" | "admin" | "agent" }[]>;
  invite(context: TenantContext, email: string): Promise<EntityRef>;
}
