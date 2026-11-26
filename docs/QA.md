# Phase 1 validation

## Combined recovered implementation — local, 2026-11-26

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

## CI evidence

Earlier reconstructed foundation checkpoint e26d59648c32f882b0b0e2b2dfe525f44f0ae60a
passed the full CI and Docker health checks:
https://github.com/michaelfurexmedia-sketch/sms-platform/actions/runs/45756375117

The combined recovered implementation is awaiting its final GitHub Actions run.
This section must be updated with the actual source SHA and result before closure.

## Limits

No production load/security certification, screen-reader audit, provider operations,
hosting deployment or backup/restore rehearsal. The recovered role switcher,
financial receipts and browser scheduling are explicitly simulated. Test coverage
of those models does not prove server authentication, tenant isolation or financial
correctness for a real backend. Phase 2 owner approval has not been recorded.

Historical recovery evidence remains unchanged in PHASE1_RECOVERY.md; successful
source restoration is documented in RECOVERY_RESOLUTION.md.
