# Architecture — planning baseline

Status: proposed requirements, not implemented or compatibility-verified.

Use a modular monolith with one persistent background worker. Preserve the existing Next.js/React UI where validated; do not migrate frameworks or force a monorepo layout. Grow modules only as needed.

| Boundary | Responsibility |
| --- | --- |
| Web/API | Public marketing, customer UI, admin UI, authenticated server endpoints |
| Auth/tenancy | Identity, workspace membership, server-side roles, separate platform-admin grants |
| Messaging/compliance | Provider adapters, verification/registration, consent, suppression, sending limits |
| Worker | Durable scheduling, dispatch, retries, reconciliation and automation |
| Billing | Subscription state, integer-unit ledger, metering, spend controls, idempotent payment events |
| Data | PostgreSQL authoritative state; queue datastore for jobs, never the financial ledger |

Production design must cover tenant-scoped queries/jobs/events, webhook signature verification, replay/idempotency handling, transactional credit reservation and settlement, opt-out rechecks before dispatch, uncertain-provider-outcome reconciliation, audit trails, secret handling and recovery. Specify and test these in the relevant backend phases.

The local candidate currently exports static pages and persists in localStorage. Its role switcher, demo login, simulated receipts and browser timers are not production boundaries. Replace these incrementally with server persistence/auth/jobs while preserving useful UI/domain behavior. Record any static-export transition before implementation.

Technology versions, ORM/auth selection, queue compatibility/licensing and Twilio ISV requirements remain to be verified against current official documentation before adoption.
