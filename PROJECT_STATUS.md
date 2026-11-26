# Project status

**Phase 1 WIP**, active branch phase-1-recovery. Actual application source is incrementally saved and verified on GitHub. Old local demo source remains inaccessible; the recovery record is preserved.

Fresh CI on e8f6a79: production build, worker compile, lint and TypeScript passed; 4 unit tests, 1 persistent-worker integration test and all 13 browser tests passed, including six light/dark viewport accessibility scans. Docker images built, but startup encountered a CI port collision. The collision is fixed in this checkpoint and awaits rerun.

The npm lockfile, portable setup/deployment docs, design system and module contracts are saved. Remaining: corrected Compose readiness, formatting, screenshot review and final evidence/PR. See DEVELOPMENT_STATE.json for exact continuation.

**Owner approval:** not recorded. Phase 2 must include an interactive frontend preview and explicit approval before Phase 3. No live business backend or provider operation is implemented; Phase 1 uses synthetic UI and an infrastructure probe worker only.
