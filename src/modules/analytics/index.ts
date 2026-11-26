// Phase 1 contract only; no operational service or permission enforcement yet.
import type { TenantContext } from "../shared";
export interface AnalyticsService {
  usage(
    context: TenantContext,
    period: { from: string; to: string },
  ): Promise<{ segments: bigint; currency: string; costMinorUnits: bigint }>;
}
