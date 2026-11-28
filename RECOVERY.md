# Recovery

Only repository: michaelfurexmedia-sketch/sms-platform. Active branch: phase-2-frontend. Read AGENTS.md, PROJECT_STATUS.md and DEVELOPMENT_STATE.json after fetching. Never reset or discard local changes.

```sh
git fetch origin
git switch phase-2-frontend
git pull --ff-only origin phase-2-frontend
npm run setup
npm run build
npm start
```

Use Node 22 as specified in .nvmrc. Public preview: http://localhost:3000/; customer: http://localhost:3000/app. Synthetic data only. Owner preview is separately local-only: run `npm run preview:owner` in another terminal, then http://127.0.0.1:3001/admin/login. Never expose that port publicly.

Phase 3 WIP preserved at 70bc3739397da10eb486495a12ffb79c4d66856b. Phase 2.7 must finish and receive owner approval before further backend implementation. Next: contact CRUD/tags/import requirements. Historical recovery records remain under docs/PHASE1_RECOVERY.md and docs/RECOVERY_RESOLUTION.md.
