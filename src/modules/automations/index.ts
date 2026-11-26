// Phase 1 contract only; no operational service or permission enforcement yet.
import type { TenantContext } from "../shared";
export interface AutomationsService {
  pause(context: TenantContext, automationId: string): Promise<void>;
  resume(context: TenantContext, automationId: string): Promise<void>;
}
