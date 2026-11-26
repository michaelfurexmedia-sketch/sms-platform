// Phase 1 contract only; no operational service or permission enforcement yet.
import type { RequestContext } from "../shared";
export interface AuthService {
  session(context: RequestContext): Promise<{ userId: string } | null>;
}
