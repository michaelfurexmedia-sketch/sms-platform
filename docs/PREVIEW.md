# Frontend review — Phase 2.5

The saved implementation is on `phase-2-frontend`. Phase 1 recovery branches
and records are preserved. No previous temporary environment is required.

```sh
git fetch origin
git switch phase-2-frontend
git pull --ff-only
nvm use
npm run setup
npm run dev
```

Use a clean working tree before switching branches; preserve unrelated work.
For the production build: `npm run build` then `npm start`.
The local address is http://localhost:3000. This is not an externally hosted URL.
No hosted preview has been published. A review host must run this same saved
source; do not rebuild the design or create another repository.

| Route                                                             | Review                                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/`                                                               | Public website; choose **Explore demo workspace** to seed fictional data |
| `/features`, `/pricing`, `/help`, `/contact`                      | Product stories, illustrative plans, search and form states              |
| `/login`, `/signup`, `/forgot-password`                           | Demonstration account and recovery screens; no real authentication/email |
| `/app`                                                            | Customer dashboard, workspace switching, theme and search                |
| `/app/inbox`, `/app/contacts`, `/app/campaigns`                   | Conversation collaboration, import mapping and campaign review           |
| `/app/numbers`, `/app/compliance`, `/app/billing`                 | Fictional number checkout, registration and billing workflows            |
| `/app/automations`, `/app/templates`, `/app/analytics`            | Visual sequence editor, reusable messages and derived metrics            |
| `/app/settings`, `/app/team`, `/app/integrations`, `/app/support` | Preferences, demo membership, integration configuration and support      |
| `/admin`                                                          | Super Admin frontend; role switch is a review aid, not real security     |
| `/design-system`                                                  | Shared interactive components and theme examples                         |
| `/preview`, `/preview/app`, `/preview/admin`                      | Preserved earlier preview routes                                         |

## Suggested owner walkthrough

1. Review the public site at desktop and mobile widths; inspect feature/pricing/help pages.
2. Explore the demo workspace; change theme, collapse/open navigation and use search.
3. Import a small synthetic CSV or XLSX, map columns and inspect invalid/duplicate/opt-out categories.
4. Assign a conversation, add a note, insert a saved message and inspect opt-out suppression.
5. Create a scheduled campaign, review recipients/encoding/estimate, confirm consent review, pause/resume/cancel it.
6. Search a fictional number, try failed/successful simulated checkout, download the invoice, then release it with a reason.
7. Configure an automation and simulate execution; review billing, compliance, team and support screens.
8. Open Super Admin, inspect a customer and make a reasoned demo credit adjustment; confirm the audit entry.

Demo data persists only in this browser's `sms-platform-demo-v1` localStorage.
A separate browser profile gives a fresh preview without deleting current work.
Do not enter real customer information, payment credentials or provider keys.
All displayed operations remain simulated; no Twilio/Stripe account is needed.

## Approval record

Owner review and approval are pending. Record explicit approval, reviewer,
time and evidence in DEVELOPMENT_STATE.json and PROJECT_STATUS.md only after
an actual review. `npm run state:check` rejects Phase 3+ without that record.
Do not start backend development simply because frontend automated tests pass.
