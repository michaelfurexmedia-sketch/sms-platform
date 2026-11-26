# Database phase boundary

PostgreSQL is provisioned by Compose, but Phase 1 has no application schema,
migrations or production seed records. No dummy migration is presented as a
working backend. Phase 3, after explicit frontend approval, must add the ORM,
versioned migrations, tenant constraints and migration verification.

Synthetic UI data is in src/demo/seed.ts and needs no database or provider account.
