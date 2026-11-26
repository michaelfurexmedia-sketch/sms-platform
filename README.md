# SMS Platform

Phase 1 foundation for an original self-service SMS SaaS. The name is temporary.
This build is a working component library plus persistent infrastructure probe,
not a live messaging service. No Twilio or Stripe credentials are required.

## Restore a fresh environment

Use this repository only. Check the active branch and next action in
[DEVELOPMENT_STATE.json](DEVELOPMENT_STATE.json) before editing.

```sh
git clone https://github.com/michaelfurexmedia-sketch/sms-platform.git
cd sms-platform
git switch phase-1-recovery
nvm use
npm run setup
npm run dev
```

Setup installs from the committed npm lockfile and copies .env.example only
when .env does not already exist. Node 22 is the baseline. No previous
temporary workspace is needed for the saved implementation.

## Preview and verification

| Route                               | Status                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| http://localhost:3000/              | Phase 1 foundation entry page                                                                |
| http://localhost:3000/design-system | Interactive component library; light/dark themes, forms, dialog, table/chart, state examples |
| http://localhost:3000/preview       | Recovered synthetic public website                                                           |
| http://localhost:3000/preview/app   | Recovered customer demo; choose “Explore demo workspace” on /preview                         |
| http://localhost:3000/preview/admin | Recovered Super Admin demo, not an authorized operational portal                             |

All examples use src/demo/seed.ts synthetic data and in-memory state.
The preview never sends SMS or charges money.

```sh
npm run check
npm run format:check
npx playwright install --with-deps chromium
npm run test:browser
docker compose up -d queue
npm run build:worker
QUEUE_URL=redis://127.0.0.1:6379 npm run test:worker
```

Production-build preview: npm run build, then npm start. PORT defaults to
3000; APP_HOST defaults to 127.0.0.1. Set PORT=4175 for another local port.
Next loads .env for development/build; a standalone start or worker needs its
environment supplied by the host, Compose, or Node's --env-file option.

## Persistent worker and Docker

```sh
docker compose up -d --build --wait
docker compose ps
```

Compose starts web, a separate probe worker, Valkey and PostgreSQL with persistent
volumes. Local web: port 3000. The worker health port is private.
PostgreSQL has no application schema yet. See [DEPLOYMENT.md](DEPLOYMENT.md)
for commands, limitations and the prelaunch requirements.

## Project records

- [Permanent requirements and persistence protocol](AGENTS.md)
- [Current status](PROJECT_STATUS.md) and [development state](DEVELOPMENT_STATE.json)
- [Architecture](ARCHITECTURE.md), [design system](DESIGN_SYSTEM.md), [roadmap](DEVELOPMENT_ROADMAP.md)
- [Repository manifest](docs/REPOSITORY_MANIFEST.md), [QA evidence](docs/QA.md)
- [Recovery history](docs/PHASE1_RECOVERY.md), [skills](docs/SKILL_INVENTORY.md), [references](docs/REFERENCES.md)

The original workspace became accessible during final verification. Its source
is preserved on recovered-phase1-wip and useful demo screens/domain code are
retained under /preview. They use localStorage and simulated services, not real
authentication, tenant enforcement, payments or SMS. The separate /design-system
library remains the shared foundation for Phase 2. No old work was discarded.
Phase 2 still requires an interactive preview and explicit owner approval before
Phase 3 backend development. See docs/RECOVERY_RESOLUTION.md.
