# Phase 1 validation

## Combined recovered implementation — local and CI, 2026-11-26

- Production Next standalone build, worker compilation, strict TypeScript and lint passed.
- Formatting and persistent-state/phase-approval gate passed.
- 16 unit tests passed: four foundation guards plus 12 recovered domain journeys.
- One real Valkey worker integration test passed: queued jobs across restarts,
  unsupported job rejection and graceful shutdown.
- 16 browser tests passed: 13 foundation tests plus three recovered-preview
  tests for public/customer/admin routes, modal focus and mobile navigation.
- Six axe/overflow/runtime-error scans passed for the shared gallery: light/dark
  at 1440, 768 and 390px. These scans do not certify every recovered legacy screen.
- Screenshots reviewed for the gallery: desktop light, tablet dark, mobile light.
  Recovered mobile contacts were inspected during the overflow fix.

The original focus issue is fixed through reuse of the shared Modal. Tests use
the correct Explore demo workspace button and separately verify the Explore the
demo link. The hidden table label is contained by a positioned scroll region,
preserving horizontal table scrolling without page overflow.

## Final CI evidence

Verified source commit: 54ffca7f333b79b0311ee68e06dc9045d9664556.
Successful workflow: https://github.com/michaelfurexmedia-sketch/sms-platform/actions/runs/45820084123

Fresh setup from the committed lockfile, state gate, lint, TypeScript, build,
worker compilation, formatting, 16 unit tests, 1 worker integration and all
16 browser tests passed. Docker built both targets, all four Compose services
became healthy and web HTTP health returned 200. Screenshots/traces are retained
in this workflow's browser-evidence artifact. Preview source/configuration is
permanent in GitHub; expiring artifacts are not required to restore it.

The closure commit updates documentation/state only; runtime source remains
identical to this tested implementation checkpoint. The raw recovery snapshot
is a2b49e1a7665f19cb80adea1ddc3f6ab457cad1d on recovered-phase1-wip.

## Limits

No production load/security certification, screen-reader audit, provider operations,
hosting deployment or backup/restore rehearsal. The recovered role switcher,
financial receipts and browser scheduling are explicitly simulated. Test coverage
of those models does not prove server authentication, tenant isolation or financial
correctness for a real backend. Phase 2 owner approval has not been recorded.

Historical recovery evidence remains unchanged in PHASE1_RECOVERY.md; successful
source restoration is documented in RECOVERY_RESOLUTION.md.
