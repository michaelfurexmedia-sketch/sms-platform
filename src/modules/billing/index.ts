import type { WorkspaceContext } from "../shared";
export interface WalletBalance {
  availableUnits: bigint;
  reservedUnits: bigint;
}
export interface Billing {
  balance(context: WorkspaceContext): Promise<WalletBalance>;
  reserve(context: WorkspaceContext, units: bigint, idempotencyKey: string): Promise<{ reservationId: string }>;
  settle(context: WorkspaceContext, reservationId: string, actualUnits: bigint): Promise<void>;
}
// Integers only. Ledger transactions and idempotency enforcement arrive in Phase 5.
