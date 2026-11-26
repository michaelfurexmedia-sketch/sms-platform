import type { WorkspaceContext } from "../shared";
export interface Automations {
  pause(context: WorkspaceContext, automationId: string): Promise<void>;
  resume(context: WorkspaceContext, automationId: string): Promise<void>;
}
// Persistent triggers and execution are Phase 6 work.
