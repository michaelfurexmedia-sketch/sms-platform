# PHASE 2.7 — COMPLETE PRODUCT EXPERIENCE, FRONTEND AND PRODUCT REQUIREMENTS

## ROLE

Act as a principal system architect, senior frontend and backend engineer, UX engineer, database architect, SaaS security specialist and QA engineer.

## PROJECT

Existing SMS SaaS platform.

Authorized repository:
https://github.com/michaelfurexmedia-sketch/sms-platform.git

This is an existing project. Phase 1, Phase 2 and Phase 2.5 have previously been reported complete. Verify their actual state before relying on those claims.

Do not create another repository, rebuild the application from scratch, or use Vercel.

## MANDATORY SKILLS — EVERY PHASE

Before implementation:

1. Locate the installed **Karpathy Guidelines** skill in the coding environment.
2. Read its complete instructions and supporting files.
3. Apply its principles throughout planning, implementation, code review, testing and documentation.
4. Identify other relevant installed skills and use them where they materially help.
5. Do not claim to have used a skill if it was unavailable. Report the issue and ask for approval before substituting another approach.

Karpathy Guidelines are mandatory in this phase and every subsequent phase.

## MASTER SYSTEM DESIGN REQUIREMENTS

This project must follow the supplied **SYSTEM DESIGN — PRODUCTION-GRADE SAAS ARCHITECTURE** specification.

Treat that specification as a continuing engineering standard. Maintain and update its architecture documents throughout the project.

Key principles:

- Secure, scalable, reliable, high-performance and cost-efficient architecture.
- Prefer a modular monolith initially, with clear service boundaries.
- Avoid premature microservices.
- Design for growth from 100 through 1,000,000 users without claiming unmeasured capacity.
- Distinguish registered users, active users, concurrent users, requests per second and messaging throughput.
- Preserve stateless application design where practical.
- Plan for database pooling, indexing, caching, persistent queues, independent workers, rate limiting, webhooks, tenant isolation and observability.
- Enforce security server-side.
- Do not introduce expensive infrastructure without a demonstrated need.

Maintain these documents as applicable:

- SYSTEM_DESIGN.md
- ARCHITECTURE.md
- SCALING_STRATEGY.md
- DATABASE_DESIGN.md
- SECURITY_ARCHITECTURE.md
- FAILURE_RECOVERY.md
- LOAD_TEST_REPORT.md
- INFRASTRUCTURE_COSTS.md
- PRODUCTION_READINESS.md

Do not invent measured capacity, performance or reliability results.

## 1. REPOSITORY AUDIT

Read and inspect:

- AGENTS.md
- ARCHITECTURE.md
- PROJECT_STATUS.md
- DEVELOPMENT_STATE.json
- Existing recovery documentation.
- Existing frontend, backend, database, tests and dependencies.
- Existing branches and uncommitted changes.

Inspect the actual implementation. Do not assume earlier reports are accurate without verification.

Preserve working functionality, existing data and approved design decisions.

## 2. DESIGN SYSTEM

Use these exact approved brand colors:

- Ink Navy: #141B2D
- Pearl White: #F4F1EA
- Electric Coral: #FF5A4E

Improve typography, spacing, hierarchy, navigation, buttons, forms, tables, cards, dialogs, notifications, loading states, errors, empty states, accessibility and responsive layouts.

The product must look like a mature commercial SaaS platform, not a generic AI-generated dashboard.

Create reusable components and design tokens. Avoid duplicate components, excessive gradients, decorative clutter and unnecessary dependencies.

## 3. PRICING AND PLAN DEFINITIONS

Create the following plans:

**Starter — $19/month**

- Bulk messaging.
- Direct messages.
- Contact segmentation.
- Human support based in the USA.
- Maximum 1 active phone number.

**Professional — $39/month**

- Everything in Starter.
- Scheduled campaigns.
- Recurring campaigns.
- Multiple team members.
- Personalized message fields.
- Maximum 5 active phone numbers.
- Mark as recommended.

**Enterprise — Contact Sales**

- Enterprise messaging.
- Custom solutions.
- Maximum 10 active phone numbers.

Do not invent message allowances, delivery guarantees or other commercial promises.

Keep prices, plan IDs, feature entitlements and limits configurable. Do not scatter hardcoded plan restrictions throughout the frontend.

## 4. CONTACT MANAGEMENT

The customer-facing Add Contact form must contain only:

- First Name.
- Phone Number.

Remove Opt-in Source from the customer-facing form.

Preserve legally and operationally necessary consent, opt-in, opt-out, source, timestamps and audit records in the backend. Never invent consent.

Implement customer-owned custom tags:

- Create, rename and delete.
- Assign and remove from contacts.
- Search and filter.
- Bulk assign and remove.
- Enforce customer-specific ownership.

Prevent cross-workspace tag or contact access.

## 5. CONTACT IMPORT

Support CSV and XLSX.

Workflow:

1. Upload.
2. Detect spreadsheet columns.
3. Map First Name and Phone Number.
4. Create or select customer-owned tags.
5. Preview.
6. Validate.
7. Confirm.
8. Import with progress.
9. Display results.
10. Save a named import batch and history.

Do not expose Group, Default Group, Contact Status or Opt-in Source as import fields.

Do not automatically create tags from spreadsheet columns.

Display total rows, valid, invalid, duplicates, skipped and review-required counts. Explain individual errors.

Validate actual file content, not just extension. Protect against oversized files and duplicate processing. Preserve opt-outs and consent records.

## 6. TWO-PANEL SMS INBOX

Build a professional responsive inbox.

Left panel:

- All conversations.
- Search.
- Contact name and phone.
- Last message preview.
- Activity time.
- Unread indicator.
- Status and archive filters.

Right panel:

- Contact details.
- Conversation history.
- Incoming/outgoing message distinction.
- Timestamps.
- Delivery statuses.
- Archive and more actions.

Composer:

- Message field.
- Send control.
- Emoji.
- Saved templates.
- Attachments only if genuinely supported.
- Keyboard shortcuts where appropriate.
- Auto-archive setting where supported.

Keep panels independently scrollable. Mobile must have a usable conversation-list/detail navigation flow.

Do not claim sample messages were actually sent or delivered.

## 7. CREDITS WALLET EXPERIENCE

Create:

- Current balance.
- Purchased and consumed credits.
- Transaction history.
- Usage history.
- Buy-credit entry point.
- Auto-recharge settings.
- Low-balance notifications.

The low-balance threshold is 5 credits.

When balance falls below 5:

- Auto-recharge OFF: warn in-app and by email; do not charge.
- Auto-recharge ON: only charge using prior customer authorization and a configured off-session payment method.

Only allocate credits after verified payment success. On failure, allocate no credits, record the error, notify the customer and apply controlled retries. Prevent duplicate charges and duplicate threshold notifications.

If Stripe is not yet implemented, build the UI and integration contracts only. Never simulate payment success.

Do not invent credit package prices or message conversion rates.

## 8. PHONE NUMBER MANAGEMENT

Display number inventory, status, type where supported, region, provisioning state and capacity.

Enforce:

- Starter: 1 active number.
- Professional: 5 active numbers.
- Enterprise: 10 active numbers.

Limits must eventually be enforced server-side. Show clear upgrade messaging.

A number is active only after confirmed provider provisioning. Safely handle pending and failed provisioning.

If provider integration is not yet implemented, do not simulate a successful purchase.

## 9. MARKETING WEBSITE

Create or improve:

- Homepage.
- Features.
- Pricing.
- Use cases.
- Business solutions.
- How it works.
- FAQ.
- Contact.
- Login.
- Registration.

Include genuine product explanations and clear calls to action.

Create demonstrations for inbox, campaigns, contacts, analytics, billing and number management. Label all sample data clearly. Never portray fictional metrics as real.

Do not invent an application name or change an already approved name.

## 10. BACKEND REQUIREMENTS AND ARCHITECTURE SPECIFICATION

Inspect the existing backend and document the requirements for every feature above.

Document:

- API contracts.
- Data entities and relationships.
- Tenant ownership.
- Validation.
- Authorization.
- Error handling.
- Idempotency.
- Background jobs.
- Webhook dependencies.
- Compliance requirements.
- Tests and acceptance criteria.

Update DATABASE_DESIGN.md, ARCHITECTURE.md and SECURITY_ARCHITECTURE.md where applicable.

Create an implementation-ready Phase 3 dependency plan. Do not prematurely implement all later backend phases here.

## 11. SECURITY AND SCALE

Plan for:

- Server-side multi-tenant isolation.
- Protected customer data.
- Secure file uploads.
- Consent and STOP enforcement.
- Persistent background jobs for long-running work.
- Rate limits and fair customer workload distribution.
- Safe error handling.
- Structured logs.
- Health checks.

Evaluate the 100, 1,000, 10,000, 100,000 and 1,000,000 user scenarios. Separate theoretical design from measured capacity.

Avoid premature infrastructure spending.

## 12. TESTING AND ACCEPTANCE

Test all changed screens and workflows, including:

- Pricing and plan presentation.
- Contact CRUD.
- Tag CRUD and tenant isolation.
- CSV/XLSX import.
- Duplicate and invalid records.
- Inbox interactions.
- Wallet states.
- Number limits.
- Marketing navigation.
- Desktop, tablet and mobile.
- Accessibility and keyboard operation.

Run production build, TypeScript, lint, unit tests and relevant integration/browser tests.

Fix regressions. Report pre-existing failures separately.

Use clearly labeled test data. Do not perform unauthorized live messaging or charging.

## 13. PREVIEW

Provide a working preview of the actual updated application.

Demonstrate all relevant completed screens with sample data clearly labeled.

Do not substitute static screenshots for a working preview.

## 14. GITHUB AND RECOVERY

Commit and push verified work to the existing repository.

Update:

- AGENTS.md if project-wide coding instructions need revision.
- PROJECT_STATUS.md.
- DEVELOPMENT_STATE.json.
- CHANGELOG.md.
- RECOVERY.md.
- Relevant architecture documents.

Record branch, commit hash, tests, remaining issues, environment requirements and exact recovery instructions.

Never claim a push or test succeeded without verification. Keep checkpoints frequent enough to survive environment or credit exhaustion.

## 15. FINAL REPORT AND STOP

Report:

- Completed functionality.
- Files and schema changes.
- Tests and actual results.
- Known defects and blockers.
- Preview URL.
- Git branch and verified commit.
- Architecture decisions.
- Updated documentation.
- Any work deferred to later phases.

Do not begin Phase 3.

STOP and wait for explicit owner approval.

Completion means the entire Phase 2.7 scope has been implemented, tested, previewed and checkpointed—not merely that a design mockup exists.
