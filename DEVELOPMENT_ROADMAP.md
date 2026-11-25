# Development roadmap

Preparation is complete when the requirements and evidence-based handoff are saved. Phase 1 starts only when assigned.

| Phase | Scope | Completion evidence |
| --- | --- | --- |
| 1 | Foundation, architecture, original design system | Existing candidate reconciled without losing work; baseline tests/build; confirmed stack/licenses; brand configuration; documented tokens/components; foundation checks; updated manifest/status |
| 2 | Marketing, customer and admin frontend | Responsive accessible screens and interaction tests; demo behavior explicitly identified |
| 3 | Backend, database, auth and tenancy | Persistent schema/migrations, real sessions, server authorization and cross-tenant denial tests |
| 4 | Twilio, contacts, compliance, campaigns, inbox | Verified webhooks, durable sending/scheduling, suppression and delivery/retry tests |
| 5 | Stripe, subscriptions, wallet, onboarding | Verified payment events, ledger concurrency/idempotency tests and test-mode onboarding |
| 6 | Operational admin, analytics, automation | Enforced admin permissions, auditability, reconciliation and operational workflow tests |
| 7 | Production readiness | Integrated security/performance/accessibility/recovery checks with recorded limits |
| 8 | VPS launch | Approved hosting, HTTPS, deployment/rollback and restore rehearsal; explicit live-operation authorization |

## Phase 1 sequence
1. Read status/manifest; check only changes since the initial inspection.
2. Reconcile local candidate with the authorized GitHub history; preserve staged work.
3. Read the applicable installed skill instructions. Verify current official docs, licensing and compatibility before implementing.
4. Run baseline tests/typecheck/build; document actual failures and preserve useful UI/domain code.
5. Review existing reference notes; verify only missing necessary observations once and record evidence boundaries.
6. Implement minimal foundation, centralized temporary branding and one design system. Avoid speculative restructuring.
7. Update required documents and configuration example; perform relevant checks, commit and push; stop.

Do not implement live backend, financial or messaging operations during Phase 1. Later external dependencies do not block documenting the foundation.
