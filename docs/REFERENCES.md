# Reference provenance

Research was already performed in the original Phase 1 session. This recovery
uses that recorded evidence; no repeated website inspection was performed.

## Public product and creative references

- https://www.textla.com/ — observed public bulk segmentation, scheduling,
  personalization, shared inbox, CSV/contact groups and signup/number workflows.
  No private dashboard or backend/source was inspected.
- https://ijadi.io/ — public creative-quality reference: clear hierarchy and
  product storytelling. The reconstructed paper/cobalt/Bricolage/Geist identity
  is independent; no assets, layout or brand copied.
- Earlier local notes referenced Textla help articles for campaign creation and
  contact statuses. Those are inherited notes, not newly confirmed behavior.

## Official technical documentation already consulted

- https://nextjs.org/docs/app/guides/self-hosting
- https://docs.bullmq.io/guide/connections
- https://docs.bullmq.io/guide/redis-tm-compatibility/
- https://docs.docker.com/compose/how-tos/startup-order/
- https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/onboarding-isv
- https://docs.stripe.com/webhooks

The selected Next/BullMQ versions retain the prior verified dependency snapshot.
A new npm lockfile and fresh CI validate actual resolution/compatibility. Twilio
and Stripe documentation informs later phase boundaries; no integrations are
implemented here and provider approval must be rechecked when implementing them.

Licenses from the prior dependency review: Next/React/BullMQ/ioredis/Tailwind
MIT; TypeScript/Playwright Apache-2.0; Lucide ISC; axe-core MPL-2.0; self-hosted
Geist/Bricolage fonts OFL-1.1. Current installed package metadata is exported by
CI for the dependency record. ESLint 9's registry deprecation remains a
development-tool limitation while jsx-a11y compatibility is retained.
