# Development roadmap

| Phase                    | Scope                                                                                               | Gate                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1 (complete)             | Original foundation, design system, shared components, module contracts and persistent probe worker | Fresh build/types/lint/unit/queue/browser/accessibility/Docker evidence; source checkpoints on GitHub |
| 2 (frontend implemented) | Premium public website, customer dashboard and Super Admin frontend                                 | Interactive preview plus explicit owner approval persisted in state and status                        |
| 3                        | Database, authentication and tenant-secure business backend                                         | Cannot start before Phase 2 approval; migrations and cross-tenant denial tests                        |
| 4                        | Twilio, contacts, consent/compliance, campaigns and inbox                                           | Verified webhooks, durable dispatch, suppression and retry/reconciliation tests                       |
| 5                        | Stripe, subscriptions, wallet and onboarding                                                        | Verified payment events, integer ledger, concurrency/idempotency tests                                |
| 6                        | Operational admin, analytics and automations                                                        | Server permissions, audit trails, reconciliation and operational tests                                |
| 7                        | Production readiness                                                                                | Integrated security, performance, accessibility and recovery validation                               |
| 8                        | VPS commercial launch                                                                               | Approved hosting, HTTPS, tested backups/rollback and explicit live-operation authorization            |

Phase 2 frontend is the current assignment. Next is Phase 2.5 interactive preview
and explicit owner approval; no automatic backend progression.

Every milestone: read active state, inspect relevant deltas, implement a small
batch, test, update status/state, commit/push to development branch, verify
actual source remotely. Preserve WIP safely with honest test status. Never
force-push or merge unstable work into main. No credit meter is exposed here.

Phase 1 reconstruction uses saved architecture/research from
docs/PHASE1_RECOVERY.md. Retain that historical record unchanged.

Phase 1 acceptance passed at 54ffca7f333b79b0311ee68e06dc9045d9664556.
Phase 2 assignment is preserved in docs/PHASE2_SCOPE.md. Frontend owner approval
has not been recorded.
