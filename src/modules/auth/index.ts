export interface Session {
  userId: string;
  expiresAt: string;
}
export interface Authentication {
  getSession(): Promise<Session | null>;
  revokeSession(): Promise<void>;
}
