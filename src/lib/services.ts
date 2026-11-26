import { brand } from "./config";
import * as domain from "./model";
import type { State, Cart, Fields } from "./model";
/** Replace these adapters with server endpoints in the backend phase. Never trust frontend roles. */
export interface AuthService {
  issue(email: string): { email: string; expiresAt: number };
  verify(challenge: { email: string; expiresAt: number }, code: string): string;
}
export interface PaymentService {
  confirm(
    state: State,
    workspaceId: string,
    key: string,
    cart: Cart,
    number?: string,
    outcome?: "success" | "failed" | "canceled",
  ): domain.Receipt | null;
}
export interface NumberService {
  available(state: State): string[];
}
export interface VerificationService {
  decide(
    state: State,
    id: string,
    approved: boolean,
    field?: keyof Fields,
    note?: string,
  ): void;
}
export interface MessagingService {
  launch(state: State, id: string, campaignId: string): void;
  tick(state: State): void;
  reply: typeof domain.reply;
  incoming: typeof domain.incoming;
}
export const services: {
  auth: AuthService;
  payments: PaymentService;
  numbers: NumberService;
  verification: VerificationService;
  messaging: MessagingService;
} = {
  auth: {
    issue: (email) => ({ email, expiresAt: Date.now() + 10 * 60 * 1000 }),
    verify: (challenge, code) => {
      if (Date.now() > challenge.expiresAt)
        throw Error("This code expired. Request a new code.");
      if (code !== brand.demoCode)
        throw Error("That code is incorrect. Try the demo code shown below.");
      return challenge.email;
    },
  },
  payments: { confirm: domain.purchase },
  numbers: { available: domain.availableNumbers },
  verification: { decide: domain.decideVerification },
  messaging: {
    launch: domain.launchCampaign,
    tick: domain.processScheduled,
    reply: domain.reply,
    incoming: domain.incoming,
  },
};
