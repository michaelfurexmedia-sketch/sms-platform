// Phase 1 contract only; no operational service or permission enforcement yet.
import type { TenantContext, EntityRef } from "../shared";
export interface CampaignsService { schedule(context: TenantContext, input: { campaignId: string; sendAt: string; idempotencyKey: string }): Promise<EntityRef>; cancel(context: TenantContext, campaignId: string): Promise<void>; }
