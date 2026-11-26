# SMS Platform — permanent project instructions

## Authority and current scope

- Only authorized repository: https://github.com/michaelfurexmedia-sketch/sms-platform.git. Never create or use sms-platform-2 or another repository.
- Current assignment: Phase 2.5 interactive frontend preview and owner approval on phase-2-frontend. Status: FRONTEND COMPLETE — AWAITING OWNER APPROVAL. Phases 1 and 2 implementation are complete. Preserve recovery records and completed frontend; use targeted owner-requested revisions only. Do not begin Phase 3 before explicit approval.
- Read PROJECT_STATUS.md and docs/REPOSITORY_MANIFEST.md first. Inspect existing code before implementation; preserve working functionality, components, configuration and useful design. Do not restart unnecessarily.
- Act across architecture, creative direction, full-stack engineering, SaaS UX, telecommunications, databases, security and DevOps. Deliver an original, premium, commercially usable, maintainable platform with low development and operating costs.

## Brand

Use "SMS Platform" until the owner provides the final name. Do not invent a permanent name, purchase a domain, or create permanent branded assets.
Centralize platform name, wordmark, logo, favicon, colors, domain, company information, support email, social links, email branding and SEO metadata. Rebranding must not require application rewrites or database architecture changes.

## Product requirements

Build a real multi-tenant, self-service SaaS, not a static dashboard or prototype. Customers must independently register, create business workspaces, buy subscriptions and messaging credits, complete business verification and messaging registration, obtain dedicated numbers, import contacts and manage lists, send bulk and scheduled campaigns, send/receive individual messages, manage multiple numbers, invite employees, assign conversations, create automations, manage consent/opt-outs, monitor delivery/usage, manage payments/invoices and contact support.
Customers must not need their own Twilio accounts. Use approved ISV messaging infrastructure.
Build a separate fully operational Super Admin Portal for the owner to manage the whole business. Enforce strict server-side separation between customer and platform-admin permissions.

## Reference research and design

- Functional reference: https://www.textla.com/ — public SMS functionality, expectations and workflows only.
- Creative-quality reference: https://ijadi.io/ — refinement and creative quality only.
- Inspect public areas where relevant once; record observations and distinguish them from assumptions about inaccessible private apps. Reuse recorded research; revisit only when necessary.
- Never copy branding, layouts, typography, colors, navigation compositions, dashboards, illustrations, proprietary assets or source code.
- Create an independent identity with sophisticated typography, editorial composition, controlled whitespace, original layouts, refined neutrals, purposeful accents, professional charts, custom product demonstrations, consistent icons, thoughtful microinteractions, smooth transitions, responsive accessible components and lightweight animation.
- Marketing: expressive and memorable. Customer app: intuitive, fast, elegant, efficient. Super Admin: enterprise operations and financial management.
- Avoid generic AI aesthetics, excessive gradients/glow, repetitive bento grids, oversized rounded cards, meaningless animation, unnecessary stock imagery and clutter.
- CSS animation first; Framer Motion when appropriate; GSAP only for meaningful value.

## Skills and cost discipline

Discover installed skills; read applicable instructions before implementation, use them at the appropriate phase, and maintain docs/SKILL_INVENTORY.md. Consider Taste, Superdesign, frontend/creative/UI-UX design, Ponytail, Graphify, Chrome DevTools, motion/GSAP, repository analysis, simplification, architecture, database optimization, security, browser testing, performance and DevOps where available. Do not invoke unrelated skills or claim unavailable tools were used. No paid skills, tools or services without owner approval.

Mandatory optimization rules:

1. Analyze the initial repository once; use incremental inspection thereafter.
2. Maintain a compact repository manifest and status file.
3. Read only files relevant to the current assignment.
4. Preserve working functionality.
5. Reuse components, utilities, services and types.
6. Prefer targeted patches over full-file regeneration.
7. Establish one premium design direction.
8. Avoid unnecessary design alternatives.
9. Avoid unnecessary parallel agents/subagents.
10. Use deterministic scripts for repetitive work.
11. Do not repeatedly inspect the same websites.
12. Do not repeatedly retrieve identical documentation.
13. Use lower-cost models for routine coding where supported.
14. Reserve advanced reasoning for architecture, security, billing, reliability and hard defects.
15. Run targeted tests during development.
16. Run comprehensive relevant tests at phase boundaries.
17. Avoid unnecessary AI-generated images.
18. Prefer established open-source libraries.
19. Avoid unnecessary framework migrations.
20. Keep documentation concise.
21. Avoid unnecessary paid dependencies.
22. Stop when the assigned phase is complete.
23. Report blockers instead of retrying impossible operations.
24. Respect an exposed development credit budget; do not invent budget visibility.
25. Prioritize essential features over decoration.
    Never trade security, financial correctness, consent enforcement, tenant isolation or essential functionality for credit savings.

## Technology and architecture

Prefer compatible technology already present. Recommended candidates: Next.js, React, TypeScript, Tailwind, shadcn/ui, Lucide, CSS/Framer Motion, PostgreSQL, Prisma or compatible existing ORM, Better Auth or established auth, modular Node.js backend, Redis-compatible supported queue datastore, BullMQ, Twilio ISV, Stripe, WebSockets or SSE, Docker/Compose, optional self-hosted Coolify, Cloudflare, affordable transactional email and off-site backups.
Before implementation verify current official documentation, licensing, compatibility and provider requirements. Recommendations are not permission to migrate or claim verification.
Prefer a modular monolith and a separate persistent worker. Avoid unnecessary microservices, Kubernetes, duplicate frameworks, multiple databases and infrastructure complexity.
One repository; adapt existing structure. Suggested growth: apps/web, apps/worker, packages/{ui,database,auth,messaging,billing,compliance,shared}, infrastructure, tests, docs. Do not force restructuring. Marketing, customer app, admin and API may share an application.

## Hosting

NO VERCEL and no Vercel-specific infrastructure dependencies.
Target portable standard Linux VPS deployment: Hostinger KVM, Hetzner, DigitalOcean or another suitable affordable provider. Initially consolidate app/backend, PostgreSQL, queue datastore and workers on one VPS only after validating capacity.
Use Docker Compose; Coolify is optional. Require HTTPS, secure networking, persistent storage, health checks, automatic restarts, encrypted off-site backups, monitoring, recovery procedures and rollback. Do not purchase hosting without owner approval.

## Production invariants

Implement real authentication, multi-tenant isolation, server-side authorization, persistent workers, secure messaging integration, verified provider/payment webhooks, auditable financial ledger, accurate usage metering, business verification, messaging registration, consent management, automatic suppression, sending limits, spending controls, abuse prevention, admin audit logs, backups/disaster recovery, automated tests and reliable errors.
Never expose credentials in frontend code or present mock operations as integrations.
Do not perform live financial transactions, paid number purchases or production SMS dispatch without explicit authorization.

## Phases

1. Repository foundation, architecture and original design system.
2. Premium marketing website, customer dashboard and Admin Portal frontend.
3. Backend, database, authentication and tenancy.
4. Twilio infrastructure, contacts, compliance, bulk campaigns and inbox.
5. Stripe, subscriptions, credit wallet and automated onboarding.
6. Operational Super Admin, analytics, automation and platform management.
7. Integration tests, security, performance and production readiness.
8. Affordable VPS deployment and commercial launch.
   Complete only the assigned phase.

## Persistent documentation and phase completion

Maintain AGENTS.md, PROJECT_STATUS.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, DEVELOPMENT_ROADMAP.md, DEPLOYMENT.md, README.md and .env.example. Keep them compact.
At each phase boundary report completed functionality, actual tests/results, incomplete functionality, external dependencies, configuration needs and unresolved limits. Update status, commit verified changes and push to the authorized repository if access is available. Stop before the next phase.
Never overwrite unrelated changes, force-push history or claim unverified success.

## Communication

Keep responses concise without sacrificing accuracy or completeness. Reuse project decisions and context; ask only when missing information prevents meaningful progress. Show changed code sections unless full files are requested. Never skip essential validation.

## Recovery and checkpoint discipline

- Recover the prior workspace before reconstructing missing functionality. Inspect available backups/snapshots, local branches, stashes, reflog, patches and artifacts without deleting or resetting files.
- Make incremental Git commits; push verified checkpoints to a development branch in this repository whenever practical.
- Preserve unfinished work in clearly marked WIP checkpoints after checking for secrets; never describe WIP or historical test results as newly verified.
- Do not reset, clean, delete, overwrite or discard existing files during recovery. Do not force-push or overwrite unrelated changes.
- When runtime access fails, distinguish inaccessible files from confirmed lost files. GitHub source access is not access to uncommitted workspace files.

# PERMANENT DEVELOPMENT PERSISTENCE AND CREDIT PROTECTION PROTOCOL

Official repository:
https://github.com/michaelfurexmedia-sketch/sms-platform.git

## Critical problem

Previous development sessions became inaccessible after development credits were exhausted.
Uncommitted implementation files could not be accessed when development resumed.
This must not happen again.
GitHub must become the permanent source of truth for all project implementation, configuration, documentation, and development progress.
Do not depend on conversation history or temporary development environments to preserve implementation.

## 1. Automatic session initialization

At the beginning of every development session:

- Connect to the official GitHub repository.
- Fetch the latest remote branches.
- Identify the active development branch.
- Read AGENTS.md.
- Read PROJECT_STATUS.md.
- Read DEVELOPMENT_STATE.json.
- Identify the last saved implementation checkpoint.
- Inspect only relevant source files.
- Restore required dependencies using the lockfile.
- Restore the development environment using documented setup commands.
- Continue from the last saved implementation.

Do not require access to a previous temporary development environment if the implementation is already available on GitHub.
Do not restart completed phases.

## 2. Incremental implementation checkpoints

Never leave an entire development phase uncommitted.
Divide every phase into small, independently recoverable implementation milestones.
After completing each meaningful milestone:

1. Review modified files.
2. Run targeted verification.
3. Update project progress.
4. Commit actual implementation files.
5. Push the commit to the active development branch.
6. Verify the remote commit exists.

Do not wait until the end of an entire phase to commit and push.
Create recoverable checkpoints even when the complete phase is unfinished.
Clearly label unfinished checkpoints as work in progress.

## 3. Credit exhaustion protection

Assume that the development environment could become unavailable at any moment.
Do not accumulate large amounts of unsaved implementation.
Prefer small implementation batches followed by immediate persistence.
If the environment provides information about remaining credits or execution limits, use it to prioritize saving implementation before exhaustion.
Do not rely on receiving an advance warning before credits expire.

## 4. Persistent development state

Create and maintain DEVELOPMENT_STATE.json containing:

- Active development phase
- Active milestone
- Active Git branch
- Last known implementation checkpoint
- Completed tasks
- Pending tasks
- Partially implemented tasks
- Relevant files
- Test results
- Known bugs
- Required dependencies
- Required configuration
- Preview status
- Owner approval status
- Exact next development action

Update this state at every meaningful checkpoint.
Also maintain a concise human-readable PROJECT_STATUS.md.
Store these files in GitHub, not only in temporary workspace storage.

## 5. Portable development environment

Make the development environment reproducible from the repository.
Maintain:

- Package manager lockfile
- Runtime version configuration
- Environment variable template
- Dockerfiles
- Docker Compose configuration
- Database migrations
- Synthetic development seed data
- Setup scripts
- Test scripts
- Preview commands

A fresh environment must be able to restore the project without requiring unavailable files from previous sessions.
Do not commit real credentials, authentication tokens, private keys, production databases, or customer information.

## 6. Session recovery

If the previous development environment is inaccessible:

- Do not treat this as a reason to stop development.
- Open a fresh environment if supported.
- Clone or fetch the existing repository.
- Restore the latest saved development branch.
- Read the persistent development state.
- Install dependencies.
- Restore local development services.
- Resume from the last available implementation checkpoint.

Only reconstruct work that was genuinely not persisted.
Do not repeat completed architecture research, reference website inspections, design exploration, skill discovery, or implementation.
If no execution environment is available at all, report that specific limitation rather than claiming to have continued development.

## 7. Git branch management

Use the existing sms-platform repository exclusively.
Preserve the existing recovery branch and recovery record.
Use clearly identified development branches for unfinished work.
Do not force-push.
Do not overwrite unrelated changes.
Do not merge unstable work into the production branch.
Use pull requests or verified merges after completing phase requirements.

## 8. Preview persistence

Store all frontend source code and preview configuration in GitHub.
When frontend preview sessions expire, recreate the preview from the saved repository rather than rebuilding the frontend.
Document the commands and routes for:

- Public website
- Customer dashboard
- Super Admin Portal

Maintain synthetic demo data for frontend preview purposes.
Do not require real Twilio or Stripe credentials for frontend design previews.

## 9. Owner approval checkpoint

Frontend development must include an interactive preview.
Do not begin backend development until the owner explicitly approves the frontend.
Persist this approval status in DEVELOPMENT_STATE.json and PROJECT_STATUS.md.
If approval has not been recorded, remain at the frontend review phase.

## 10. Permanent project requirements

- Use the original sms-platform repository.
- Do not create sms-platform-2.
- The official platform name remains undecided.
- Use centralized temporary branding.
- Create an original premium design.
- Use Textla only as a functionality reference.
- Use Ijadi only as a creative quality reference.
- Use all applicable installed skills efficiently.
- Minimize development credits.
- Preserve working functionality.
- Do not use Vercel.
- Maintain portable VPS and Docker compatibility.

Save this entire protocol in AGENTS.md.
Apply it to every current and future development phase.
Never claim implementation has been saved unless the actual source files have been committed, pushed, and verified on GitHub.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
