# Frontend acceptance review

Tested November 25, 2026 with fictional data. All six required journeys were exercised through the actual browser UI and independently covered by domain tests.

| Journey | Observed result |
| --- | --- |
| A — signup | Incorrect code rejected; confirmation created an immediate email-only Admin record with no number, payment or verification. |
| B — number | Failed checkout did not assign; successful $10 checkout created one receipt. Refresh preserved the number. No renewal appeared. |
| C — verification | Partially completed draft visible to owner, resumed fields preserved, submitted, correction requested, resubmitted and approved in both portals with history. |
| D — credits | Three 1,000-credit packs produced 3,000 credits and one $45 receipt. Updating the pack to $16 changed the next checkout while preserving $45 history. |
| E — campaign | Seven sample rows produced three eligible and four excluded, with reasons. The approved send consumed three credits, reported two delivered and one temporary failure, and recorded First message sent. |
| F — isolation | Second signup started with empty contacts/messages, no number and zero credits; owner saw both businesses. |

Automated suite: 12 passing tests, including the six journeys, isolated demo seed, send gates, individual Lead replies, business-scoped STOP suppression, future/recurring schedule eligibility, quoted multiline CSV handling and GSM/Unicode segment accounting.

Production build generates 21 static pages; TypeScript passes. Desktop, 768px tablet and 390px phone layouts were inspected in the browser. Narrow layouts were exercised through a same-origin responsive iframe harness. Native device emulation was unavailable. Admin table columns adapt to the available width, with full records in customer details. Native dialogs supply keyboard focus management and Escape dismissal; visible focus and reduced-motion styles are provided.

This is a functional prototype review, not a production security audit or exhaustive assistive-technology certification. Live carrier delivery, actual billing, real email delivery and backend authorization are outside this phase.
