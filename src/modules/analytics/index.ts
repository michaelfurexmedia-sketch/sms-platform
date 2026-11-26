import type { WorkspaceContext } from "../shared";
export interface UsageSummary { from: string; to: string; sentSegments: number; delivered: number; failed: number; }
export interface Analytics {
  usage(context: WorkspaceContext, from: string, to: string): Promise<UsageSummary>;
}
// Derive from authoritative events/ledger, never browser counters.
