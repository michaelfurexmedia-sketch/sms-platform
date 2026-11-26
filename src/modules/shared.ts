// Contracts only. Contexts must be constructed from verified server sessions in Phase 3.
// TypeScript interfaces do not enforce authentication, authorization or tenant isolation.
export interface RequestContext { requestId: string; }
export interface TenantContext extends RequestContext { userId: string; workspaceId: string; }
export interface PlatformContext extends RequestContext { administratorId: string; auditReason: string; }
export interface EntityRef { id: string; }
export interface PageQuery { cursor?: string; limit: number; }
