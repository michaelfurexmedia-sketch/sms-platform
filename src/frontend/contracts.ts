/** Browser-preview data contracts. These do not authorize production operations. */
export type Template = { id: string; name: string; text: string };
export type AutomationNode = {
  id: string;
  type: "Trigger" | "Condition" | "Delay" | "Message";
  value: string;
};
export type Automation = {
  id: string;
  name: string;
  active: boolean;
  nodes: AutomationNode[];
  history: {
    at: string;
    status: "Completed" | "Failed" | "Suppressed";
    detail: string;
  }[];
};
export type PreviewPreferences = {
  tags?: string[];
  suppressedPhones?: string[];
  deletedContacts?: import("@/lib/model").Contact[];
  plan?: string;
  autoRecharge?: boolean;
  rechargeThreshold?: number;
  rechargeAmount?: number;
  templates?: Template[];
  automations?: Automation[];
  settings?: Record<string, Record<string, string>>;
  imports?: {
    id: string;
    at: string;
    file: string;
    name?: string;
    fingerprint?: string;
    total?: number;
    skipped?: number;
    reviewRequired?: number;
    added: number;
    duplicates: number;
    invalid: number;
    suppressed: number;
  }[];
  registrations?: Record<
    string,
    {
      status: string;
      reason: string;
      business: string;
      description: string;
      consent: string;
    }
  >;
  tickets?: {
    id: string;
    subject: string;
    message: string;
    status: string;
    at: string;
  }[];
  numberSettings?: Record<
    string,
    { assignee: string; label: string; autoReply: string }
  >;
};
export interface FrontendService<T> {
  list(workspaceId: string): Promise<readonly T[]>;
  save(workspaceId: string, record: T): Promise<T>;
}
export interface ImportPreviewService {
  read(file: File): Promise<string[][]>;
}
export interface AdministrativeAction {
  id: string;
  at: string;
  workspaceId: string;
  action: string;
  reason: string;
  value: string;
}
export type AdminPreview = {
  actions?: AdministrativeAction[];
  settings?: Record<string, Record<string, string>>;
};
