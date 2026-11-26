// Phase 1 contract only; no operational service or permission enforcement yet.
import type { TenantContext } from "../shared";
export interface ComplianceService { canSend(context: TenantContext, input: { recipientId: string; senderId: string }): Promise<{ allowed: boolean; reasonCode: string }>; suppress(context: TenantContext, input: { recipientId: string; sourceEventId: string }): Promise<void>; }
