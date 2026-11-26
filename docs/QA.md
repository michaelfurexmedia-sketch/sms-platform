# Phase 1 validation

Current results are pending the comprehensive reconstruction workflow.
Do not reuse the original 16-test/seven-browser pass counts as fresh evidence.

Validation runs on GitHub Actions because the interactive executor is unavailable.
The first new checkpoint passed npm installation (audit: zero vulnerabilities)
and lint, then exposed a ProcessEnv typing issue. The next check exposed the
native disclosure's keyboard-handler lint issue. Both were patched; fresh final
results must be recorded below when available.

Required suite:
- Production standalone Next build and worker compilation.
- Strict TypeScript and accessibility-aware ESLint.
- Unit checks for branding, environment guards and accepted/rejected jobs.
- Real Valkey test: queue while worker stopped, start/complete/stop twice;
  unsupported job rejection and clean shutdown.
- Browser interaction tests including dialog forward/reverse focus, Escape
  and opener restoration; correct link locator; forms, tabs, pagination.
- Six axe/overflow/runtime-error checks: light/dark at 1440, 768 and 390px.
- Reduced-motion and web health/header checks.
- Docker Compose build, all-service readiness and HTTP health smoke check.

Screenshots and traces are attached to the corresponding workflow's
browser-evidence artifact. This is not a production security certification,
full assistive-technology audit, load test or disaster-recovery rehearsal.

## Fresh reconstruction evidence (intermediate)

Commit e8f6a79707ba417dbf4e9c0cc8735da581797b30, workflow 45755834406:
build, worker compilation, lint and typecheck passed; 4 unit tests passed,
1 worker integration passed, 13 browser tests passed including all 6 axe scans.
Docker images built; startup failed because the CI Valkey and Compose queue
both claimed host port 6379. The next checkpoint maps CI Valkey to 16379.
These are fresh results; final all-green verification remains pending.
