# Phase 3 implementation checkpoints

Approved frontend: 5d7e0f9df8a975c376aea6252cad914a23fd5539. Preserve it.
Current work: 3.1 request boundary and authorization policy primitives.

Implemented: bounded streaming JSON parsing, pagination validation, same-origin
mutation checks, redacted error responses; separate customer/platform role grant
matrices, membership matching, active/expiry/verified-email checks and recent MFA
requirement for platform operations. These are not wired to routes or sessions yet.
Never construct policy inputs from request JSON, unsigned cookies or localStorage.

Owner email was supplied privately in the conversation. Configure OWNER_ADMIN_EMAIL
outside Git; do not auto-elevate a public signup matching that address. Initial
owner provisioning must be explicit server-side work, with verified email and MFA.
Additional platform roles are defined but grants require explicit owner authority.

Dependency review: Better Auth 1.7.28 (MIT); Prisma 7.10.1 (Apache-2.0), pg adapter.
Official Better Auth Prisma docs explicitly exclude the Prisma 8 release candidate;
use pinned Prisma 7. Source: https://better-auth.com/docs/adapters/prisma .
No paid dependencies. PostgreSQL and Docker executables were not found locally;
real database verification still needs a usable PostgreSQL runtime.

Next: full module implementation and distributed rate limits; database schema,
migrations and synthetic seed; auth/MFA/email delivery and provisioning; tenant
isolation; persistent business worker handlers; actual frontend integration and
negative security/integration tests. Existing UI remains a labelled simulation.
This checkpoint does not complete milestone 3.1 or Phase 3.
