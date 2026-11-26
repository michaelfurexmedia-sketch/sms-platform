# sms-platform — Relayline

A connected frontend prototype for self-service business SMS: public website, customer workspace, and platform-owner admin portal. Built with Next.js, React, TypeScript, and Tailwind CSS. Rename the temporary brand in `src/lib/config.ts`.

## Run

Use Node.js 22 or later.

```sh
npm ci
npm run dev -- --hostname 0.0.0.0 --port 4173
```

For the production static export:

```sh
npm run build
npm start -- --port 4173
```

| Surface | Local route |
| --- | --- |
| Home | http://localhost:4173/ |
| Features / pricing | `/features/`, `/pricing/` |
| Signup / login | `/signup/`, `/login/` |
| Customer overview | http://localhost:4173/app/ |
| Customer tools | `/app/inbox/`, `/app/contacts/`, `/app/campaigns/`, `/app/numbers/`, `/app/team/`, `/app/billing/` |
| Owner customers | http://localhost:4173/admin/ |
| Owner tools | `/admin/overview/`, `/admin/users/`, `/admin/verification/`, `/admin/numbers/`, `/admin/payments/`, `/admin/settings/` |

Start with a fictional email and the displayed demo code **246810**. New accounts start empty. **Explore the demo** opens a separate sample business. The prototype role switcher connects customer actions to the owner portal immediately.

## What works

- Email signup and returning-account login, code errors/resend/change email.
- One-time toll-free number checkout, canceled/failed payments, immutable receipts and duplicate-confirmation protection.
- Resumable verification, saved drafts, correction requests, resubmission, approval and timestamped activity.
- All 12 prepaid packs, multiple quantities, shared editable prices and preserved receipt prices.
- CSV mapping/preview, groups/tags/statuses, campaign audience exclusions, personalization, segment estimates, scheduling and delivery reports.
- Shared inbox, individual Lead replies, per-business STOP suppression, team invitations and role changes.
- Searchable owner directory, full customer details, derived totals, verification queue, numbers, payments and pricing settings.

## Architecture and boundaries

`src/lib/model.ts` contains typed state and domain transitions. `store.tsx` persists versioned data in localStorage and synchronizes tabs. `services.ts` exposes replaceable auth, payment, number, verification and messaging interfaces. Shared configuration and integer-cent prices are in `config.ts`; completed receipts snapshot the charged prices.

All authentication, payments, number inventory, provider decisions, invitations and SMS delivery are **simulated**. No provider credentials are needed. Nothing sends real messages, buys real numbers or charges money. Role switching is a review tool, not production authorization. State is local to the browser; clearing site data resets it. Future and recurring campaigns advance while the prototype is open, not through a background service. Browser storage is not an authoritative multi-user database.

Production backend work must replace the service adapters with authenticated, tenant-scoped server APIs, durable persistence, payment/webhook verification, real provider decisions and a job queue. The included static server is for local review, not a hardened internet server.

## Validation

```sh
npm test
npm run typecheck
npm run build
```

See [QA.md](docs/QA.md) for acceptance evidence and [DESIGN.md](DESIGN.md) for visual decisions and the requested skills used. Public research and its limits are recorded in [REFERENCES.md](docs/REFERENCES.md).
