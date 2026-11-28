# Architecture

## Implemented foundation

One Next.js/React/TypeScript application at src/app with a separate Node worker
at apps/worker. No monorepo migration or microservices. Next uses standalone
output for a standard Linux process/container. No Vercel infrastructure.

| Boundary   | Current implementation                                                                                            | Later responsibility                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Web        | Root foundation, component gallery, environment validation, liveness endpoint                                     | Public/customer/admin interfaces and authenticated APIs                   |
| Shared UI  | Central branding, semantic CSS, reusable accessible React components                                              | Reuse across three surfaces                                               |
| Modules    | Ten typed service contracts under src/modules                                                                     | Server implementations after phase/approval gates                         |
| Queue      | BullMQ + ioredis on Valkey; bounded retry/retention                                                               | Durable business jobs, outbox and reconciliation                          |
| Worker     | Independent process, system.probe handler, strict payload validation, queue-dependent readiness, graceful SIGTERM | Scheduled sends, automations and provider reconciliation                  |
| PostgreSQL | Compose service and persistent volume                                                                             | Authoritative tenant, contact, consent, ledger and audit data in Phase 3+ |

Contracts cover auth, workspaces, contacts, campaigns, messaging, billing,
compliance, automations, analytics and administration. TenantContext and
PlatformContext are distinct contracts; they are NOT authentication or
authorization. They must be created from verified server sessions later.
Client component imports of server/queue modules are prohibited by lint.

## Current execution flow

The web does not enqueue any jobs or perform provider operations. Only the
integration test produces system.probe jobs. The persistent worker consumes
that queue independently of browser sessions. It rejects unsupported job names
and payload fields, including sms.send and billing operations.
Queue jobs are at-least-once; the probe is side-effect free and safe to repeat.
Future financial and messaging operations need durable idempotency records.

Environment validation allows APP_MODE=demo only and rejects enabled live
flags. Health responses contain no secrets. Web health is liveness, not a claim
that PostgreSQL or external providers are ready. Worker readiness depends on
its Redis connection and processing state. Logs use generic error messages.

## Required future invariants

- PostgreSQL is authoritative; Valkey is transport, never a ledger.
- Server-side tenant membership and role checks on every scoped query, mutation,
  job and event; negative cross-tenant tests. Separate platform administrator grants.
- Transactional outbox before enqueuing, unique idempotency keys, integer ledger
  units, atomic reservations/settlements and provider-event deduplication.
- Verify Twilio/Stripe signatures against raw requests before handling events.
- Record consent evidence and suppression scope; recheck suppression, sending
  limits and spend limits immediately before dispatch. Never rotate numbers to
  bypass an opt-out. Reconcile uncertain provider outcomes before any retry.
- Audit sensitive administrator actions and reconcile provider/billing totals.
- Retention, encrypted backups, least-privilege accounts and restore rehearsals.

These are acceptance requirements for later phases, not completed features.
Business backend implementation remains gated on explicit frontend approval.

## Recovered preview boundary

The original synthetic frontend is retained in src/legacy with scoped CSS and
a small Next navigation adapter for /preview. Its src/lib model/store/services
remain browser-local simulations, clearly labelled in the UI. No provider SDK
or business server endpoint is called. The original storage key is preserved.
The recovered UI delegates dialogs to the shared fixed Modal component.
This preserves reusable work for Phase 2 without replacing the tested foundation.

## Phase 2 frontend boundaries

`src/frontend` composes marketing, workspace and admin surfaces inside the same
Next application. `src/legacy` retains working screens through a route adapter;
`/preview` remains compatible. Public routes are statically generated, customer
and admin paths validate known module slugs, and unknown paths return 404.
The browser-local provider is the single demo state source. Typed preview
contracts in `src/frontend/contracts.ts` prepare replacement service boundaries.
CSV/XLSX imports run client-side; XLSX parsing is loaded on demand.

Public role switching has been removed. Admin routes fail closed unless the explicit local-only preview configuration is active; see docs/PHASE26_ADMIN_SECURITY.md. This preview is not production authentication.
Audit entries, balances, invoices, registration results, provider health and
checkout outcomes are synthetic. An audit UI is not an immutable financial ledger.
The probe worker does not execute business schedules; demo schedules require an
open browser. Backend replacement and negative tenant/permission tests remain
blocked until explicit frontend approval.
