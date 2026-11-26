// Phase 1 contract only; no operational service or permission enforcement yet.
import type { TenantContext, EntityRef } from "../shared";
export interface BillingService {
  balance(
    context: TenantContext,
  ): Promise<{ currency: string; availableMinorUnits: bigint }>;
  reserve(
    context: TenantContext,
    input: {
      amountMinorUnits: bigint;
      currency: string;
      idempotencyKey: string;
    },
  ): Promise<EntityRef>;
}
