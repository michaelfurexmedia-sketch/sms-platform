import type { WorkspaceContext } from "../shared";
export interface Messaging {
  requestSend(context: WorkspaceContext, messageId: string): Promise<{ jobId: string }>;
  assignConversation(context: WorkspaceContext, conversationId: string, memberId: string): Promise<void>;
}
// Provider adapters, webhook verification and dispatch arrive in Phase 4.
// Queue requests are not evidence that a provider accepted or delivered a message.
