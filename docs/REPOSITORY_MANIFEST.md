# Repository manifest

Initial inspection: 2026-11-26. Reuse this manifest; inspect deltas rather than restarting analysis.

## Authorized remote
michaelfurexmedia-sketch/sms-platform; default branch main.
Inspected initial commit: fc799c8bcb508f2731d24771824e1f50f66c32c1.
Initial tree: c475464f1fd86060eef709007998162368f57100.
Only tracked remote file at inspection: README.md. Preparation adds documentation and .env.example only.

## Preserved local candidate — not yet synchronized
Observed at /workspace/scratch/e073faf81f58/sms-platform.
Unborn master branch, no commits/remotes, 33 staged files. Do not reset, overwrite, or automatically include them in a documentation commit.

| Path in candidate | Observed responsibility |
| --- | --- |
| package.json / package-lock.json | Next 16.4.6, React 19.2, TypeScript 5.9, Tailwind 4, Lucide; versions declared, compatibility unverified |
| src/app/[[...slug]]/page.tsx | Statically enumerated routes |
| src/components/application.tsx | Shared shell, route selection and browser state |
| src/components/public.tsx | Marketing and simulated auth |
| src/components/customer.tsx | Workspace tools |
| src/components/messaging.tsx | Contacts, campaigns and inbox UI |
| src/components/admin.tsx | Simulated owner operations |
| src/lib/config.ts | Old temporary brand, demo code and example pricing |
| src/lib/model.ts | Typed domain transitions and simulated outcomes |
| src/lib/services.ts | Simulated auth/payment/number/verification/messaging adapters |
| src/lib/store.tsx | localStorage persistence and browser schedule ticks |
| next.config.ts / scripts | Static export and local review server |
| tests/journeys.test.ts | Existing domain tests; not rerun in preparation |
| DESIGN.md / PRODUCT.md / docs/QA.md | Historical design, prototype limits and reported QA |
| docs/REFERENCES.md | Existing public reference notes; preserve provenance |

No graphify-out/graph.json exists. Targeted source inspection suffices for this preparation. No production integration or security certification is inferred from the prototype.

## Reference notes already available locally
Textla homepage; public campaign guide at https://help.textla.com/en/articles/6050300-how-to-send-an-sms-campaign; contact statuses at https://help.textla.com/en/articles/9265883-textla-contact-statuses; Ijadi homepage.
Local notes describe campaign selection/personalization/scheduling, contact status exclusions and creative hierarchy. These are inherited notes, not independently verified observations in this preparation. No claim about private backend/source code. Reuse notes and fill necessary gaps once in Phase 1.
