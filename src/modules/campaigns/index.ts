import type { WorkspaceContext, EntityRef } from "../shared";
export interface Campaign extends EntityRef {
  state: "draft" | "scheduled" | "running" | "completed" | "canceled";
  scheduledAt: string | null;
}
export interface Campaigns {
  get(context: WorkspaceContext, id: string): Promise<Campaign | null>;
  schedule(context: WorkspaceContext, id: string, at: string): Promise<void>;
  cancel(context: WorkspaceContext, id: string): Promise<void>;
}
