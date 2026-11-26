import type { WorkspaceContext } from "../shared";
export type SendingDecision = { allowed: true } | { allowed: false; reason: "suppressed" | "no_consent" | "unregistered" | "limit" };
export interface Compliance {
  canSend(context: WorkspaceContext, contactId: string, senderId: string): Promise<SendingDecision>;
  suppress(context: WorkspaceContext, phone: string, sourceEventId: string): Promise<void>;
}
// Recheck at dispatch, across every sender in the workspace; not just at import.
