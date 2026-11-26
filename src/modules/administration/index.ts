// Phase 1 contract only; no operational service or permission enforcement yet.
import type { PlatformContext, EntityRef, PageQuery } from "../shared";
export interface AdministrationService { suspendWorkspace(context: PlatformContext, input: { workspaceId: string; reason: string; idempotencyKey: string }): Promise<void>; audit(context: PlatformContext, query: PageQuery): Promise<EntityRef[]>; }
