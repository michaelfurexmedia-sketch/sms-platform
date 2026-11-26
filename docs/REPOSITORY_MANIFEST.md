# Repository manifest

Read DEVELOPMENT_STATE.json for the active branch/checkpoint. Do not repeat the
initial repository analysis. Original remote preparation commit:
61984b4ff16495f8ceb65fb04b61849bba0f8b17. Recovery record: docs/PHASE1_RECOVERY.md.

The original workspace returned during final verification. Its complete WIP was
saved at a2b49e1a7665f19cb80adea1ddc3f6ab457cad1d on recovered-phase1-wip.
The active branch preserves the recovered components in src/legacy, domain/store
modules in src/lib and original journey tests. Previews are scoped to /preview;
shared foundation styling and infrastructure remain intact.

| Paths                                                         | Implemented responsibility                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| src/app                                                       | Root foundation, /design-system, /api/health, layout and global styles |
| src/config/brand.ts                                           | Central temporary branding and themes                                  |
| src/components/ui.tsx                                         | Inputs, buttons, dialog and state primitives                           |
| src/components/foundation.tsx                                 | Navigation, tabs, tables, dropdown, pagination, chart                  |
| src/components/design-preview.tsx, src/demo/seed.ts           | Interactive synthetic component examples                               |
| src/styles/foundation.css                                     | Original responsive design tokens and component styles                 |
| src/modules/*                                                 | Ten service boundary contracts; no business implementations            |
| src/server/env.ts, src/instrumentation.ts                     | Validated demo-only runtime environment                                |
| src/server/queue.ts, apps/worker                              | Persistent BullMQ probe worker and connections                         |
| tests                                                         | New unit, worker integration and browser/accessibility tests           |
| scripts, configs, Dockerfile, compose.yaml, .github/workflows | Portable setup, standalone build, validation and containers            |

## Feature inventory

Complete when validation passes: foundation UI components, configurable branding,
design gallery, environment guards, probe queue/worker and development tooling.

Contract-only: authentication, workspaces, contacts, campaigns, messaging, billing,
compliance, automations, analytics, administration. Type contexts do not grant
authorization or provide isolation.

Missing/deferred: full marketing/customer/admin surfaces (Phase 2), persistent
business schema/auth/tenancy (Phase 3 after approval), Twilio/compliance/inbox
(Phase 4), Stripe/ledger (Phase 5), operational admin/automations (Phase 6),
commercial readiness (Phase 7), production HTTPS/backups/rollback/launch (Phase 8).

Recovered demo behavior is available under /preview. The original storage key
and synthetic fixtures are preserved. Source snapshots and the historical
recovery record remain available; see docs/RECOVERY_RESOLUTION.md.
