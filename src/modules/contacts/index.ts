import type { WorkspaceContext, Page, PageRequest, EntityRef } from "../shared";
export interface Contact extends EntityRef { name: string; phone: string; }
export interface Contacts {
  list(context: WorkspaceContext, page: PageRequest): Promise<Page<Contact>>;
  requestImport(context: WorkspaceContext, uploadId: string): Promise<{ jobId: string }>;
}
