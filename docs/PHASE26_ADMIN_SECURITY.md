# Owner preview and Phase 3 security boundary

No customer/public role switch or administrator navigation remains. `/admin/*`
is unavailable by default; `/preview/admin/*` aliases are removed. The dedicated
`/admin/login` page is an honest local-preview entry, not a working login.

Owner review on their own computer: `npm run build`, then `npm run preview:owner`.
Open http://127.0.0.1:3001/admin/login. The launcher binds only to IPv4 loopback,
sets OWNER_PREVIEW=local-only and rejects managed preview relays. Normal dev/start
must not enable this flag. Do not tunnel, proxy, deploy or share the owner server.
Other local users/processes can access this synthetic preview: it is local-only,
not authenticated owner identity. No real customer data or credentials belong here.

Phase 3 acceptance (NOT implemented or passed): secure server-side initial owner
provisioning; verified owner identity; no public admin registration; additional
admins disabled without owner authorization; mandatory MFA; separate privileged
server sessions, expiration, rate limiting and secure recovery; step-up for
sensitive operations. Check owner grants on every page, API, query, mutation,
worker command and realtime subscription. Customer workspace roles never suffice.

Negative tests must cover unauthenticated direct URLs and APIs, customer sessions,
forged role/localStorage/cookies/parameters, cross-tenant access, expired/revoked
sessions, MFA bypass and replay, CSRF, session fixation and rate-limit recovery.
No response may expose private data before authorization. Audit login attempts,
suspensions/reactivations, credits/refunds, subscriptions/pricing/permissions,
provider configuration, sensitive reads and compliance enforcement with actor,
action, time, target and required reason. Persist immutable attributable records.

Existing frontend confirmation/reason validation and synthetic audit trails remain;
they are not an authoritative ledger or security audit service.
