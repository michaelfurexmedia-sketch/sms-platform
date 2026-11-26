// Phase 1 contract only; no operational service or permission enforcement yet.
import type { TenantContext, EntityRef, PageQuery } from "../shared";
export interface ContactsService { list(context: TenantContext, query: PageQuery): Promise<EntityRef[]>; import(context: TenantContext, input: { uploadId: string; consentEvidenceId: string }): Promise<EntityRef>; }
