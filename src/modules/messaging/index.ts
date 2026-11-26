// Phase 1 contract only; no operational service or permission enforcement yet.
import type { TenantContext, EntityRef } from "../shared";
export interface MessagingService {
  requestSend(
    context: TenantContext,
    input: {
      conversationId: string;
      body: string;
      consentEvidenceId: string;
      idempotencyKey: string;
    },
  ): Promise<EntityRef>;
  assign(
    context: TenantContext,
    conversationId: string,
    userId: string,
  ): Promise<void>;
}
