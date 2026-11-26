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

| Route | Status |
| --- | --- |
| http://localhost:3000/ | Phase 1 foundation entry page |
| http://localhost:3000/design-system | Interactive component library; light/dark themes, forms, dialog, table/chart, state examples |
| Customer dashboard | Phase 2; not reconstructed from inaccessible old demo |
| Super Admin Portal | Phase 2; not implemented as an operational portal |

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

The old uncommitted frontend could not be accessed. This branch reconstructs
only Phase 1 from its saved decisions, preserving all existing remote records.
It does not claim restoration of the old customer/admin demo or its tests.
No real authentication, tenancy enforcement, billing or provider integrations
are implemented. Phase 2 needs an interactive preview and explicit owner
approval before Phase 3 backend development.
