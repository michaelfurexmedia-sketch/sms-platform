# Portable development and deployment

## Portable local environment

Requires Git, Node 22, npm, Docker Engine and Compose v2. No hosting purchase or
production deployment has occurred. Use README setup commands and .env.example.
No provider credentials are needed. The default database password is explicitly
local-only; replace it on any shared host.

```sh
npm run setup
docker compose up -d --build --wait
docker compose ps
curl --fail http://127.0.0.1:3000/api/health
docker compose logs --tail 100 web worker
docker compose stop
```

Web binds to host loopback port 3000; Valkey binds loopback 6379 for local tests.
Database and worker ports are not published. Restart policies, health checks,
nonroot application users, init processes and worker graceful shutdown are set.
Valkey AOF uses everysec and noeviction. PostgreSQL and Valkey use named volumes.
Do not run docker compose down --volumes unless explicitly destroying disposable
test data. Regular stop/down retains volumes.

Standalone without Docker:

```sh
npm ci
npm run build
npm start
npm run build:worker
node --env-file=.env dist/worker/apps/worker/index.js
```

npm start is the loopback preview wrapper. Container entrypoint starts the
standalone server directly on 0.0.0.0 inside the container.

## Health and safety limits

/api/health checks the web process and environment, not business dependencies.
/health on worker port 3001 returns ready only while its queue connection is
ready and it is running. All runtime operations are demo/probe only. No customer
data schema/migrations or live integrations exist yet.

Images use pinned Valkey 8.1.4, PostgreSQL major 17 and Node major 22. Patch
tags are mutable; resolve tested image digests during deployment release work.
Single-VPS resource capacity is not yet benchmarked. Database service runs
unused until the approved backend phase.

## Before launch (Phase 8)

This Compose file is a local foundation, not a complete public-host security
configuration. Before using a shared/production VPS: remove the queue host port,
configure HTTPS reverse proxy, firewall and authenticated private services,
runtime secrets, least-privilege database roles, log rotation, alerts and
resource limits. Validate expected queue, database and build memory capacity.
Do not expose the component gallery as a live customer service.

Encrypted off-site PostgreSQL backups, retention and restore checks; queue
recovery; documented RPO/RTO; and rollback of versioned images with migration
compatibility are not implemented in Phase 1. Do not infer disaster recovery
from persistent volumes. Implement and rehearse these before commercial launch.

No Vercel, Kubernetes, paid service or alternate repository is required.

## Recreate the frontend preview

Use the saved `phase-2-frontend` branch, `npm run setup`, then `npm run dev`.
Review `/`, `/app`, `/admin` and `/design-system`; see docs/PREVIEW.md for the
walkthrough. Twilio, Stripe and email credentials are unnecessary. The `.env`
file stays local. Browser-local demo data is disposable, never a database backup.
No external preview hostname or hosting deployment has been configured.
