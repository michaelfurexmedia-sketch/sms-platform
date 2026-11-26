/** Server adapters must derive these values from verified sessions, never request bodies.
 * Type contracts are not authentication or tenant isolation implementations. */
export type WorkspaceContext = Readonly<{ workspaceId: string; actorId: string }>;
export type PlatformContext = Readonly<{ actorId: string; permission: "platform:manage" }>;
export type PageRequest = Readonly<{ cursor?: string; limit: number }>;
export type Page<T> = Readonly<{ items: readonly T[]; nextCursor?: string }>;
export type EntityRef = Readonly<{ id: string; workspaceId: string }>;
