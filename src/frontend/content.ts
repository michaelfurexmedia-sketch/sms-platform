/** Editorial copy for the development preview. No customer or performance claims. */
export const features = [
  {
    slug: "bulk-sms",
    title: "Bulk SMS",
    headline: "A wider reach. A personal touch.",
    description:
      "Build a thoughtful campaign from a consented audience, a useful message and a clear next step.",
    points: [
      "Choose a list and review every recipient",
      "Personalize messages and estimate segments",
      "Review suppression before scheduling",
    ],
    route: "campaigns",
  },
  {
    slug: "two-way-messaging",
    title: "Two-way messaging",
    headline: "Leave room for a reply.",
    description:
      "Keep the context of every conversation, from the first campaign to the next question.",
    points: [
      "Send from an assigned business number",
      "See message history alongside contact details",
      "Respect opt-outs across your workspace",
    ],
    route: "inbox",
  },
  {
    slug: "shared-inbox",
    title: "Shared team inbox",
    headline: "Many people. One conversation.",
    description:
      "Give your team a shared place to respond with care, without losing who owns the next step.",
    points: [
      "Assign conversations to teammates",
      "Leave internal notes and use saved replies",
      "Filter unread and archived conversations",
    ],
    route: "inbox",
  },
  {
    slug: "automation",
    title: "SMS automation",
    headline: "Make the next step feel natural.",
    description:
      "Map the moments that matter with triggers, conditions, delays and messages.",
    points: [
      "Build a workflow you can read",
      "Preview paths before activation",
      "Review execution history and failures",
    ],
    route: "automations",
  },
  {
    slug: "contact-management",
    title: "Contact management",
    headline: "Know who you are reaching.",
    description:
      "Organize contacts with useful context and a clear record of consent.",
    points: [
      "Map spreadsheet columns before import",
      "Review invalid, duplicate and suppressed rows separately",
      "Organize lists, tags and custom fields",
    ],
    route: "contacts",
  },
  {
    slug: "phone-numbers",
    title: "Phone number management",
    headline: "A familiar number for your business.",
    description:
      "Choose business numbers and keep assignments, registration and settings together.",
    points: [
      "Explore number availability and capabilities",
      "Review illustrative rental costs",
      "Track business and messaging registration",
    ],
    route: "numbers",
  },
  {
    slug: "analytics",
    title: "Analytics",
    headline: "Understand what happens after send.",
    description:
      "Read delivery, replies and opt-outs together to make your next campaign more useful.",
    points: [
      "Compare delivery and reply activity",
      "Review message segments and usage",
      "Keep financial and messaging reports distinct",
    ],
    route: "analytics",
  },
] as const;
export const helpArticles = [
  [
    "Get started",
    "Open the demo workspace, review onboarding, then explore contacts and campaigns. All preview activity stays in this browser.",
  ],
  [
    "Import contacts",
    "Upload a CSV or XLSX file. Map your columns, review invalid numbers, duplicates and suppression, then confirm the consent evidence.",
  ],
  [
    "Understand credits",
    "A message can use multiple segments. Personalization and Unicode may change the estimate. Preview pricing is illustrative and no payment is collected.",
  ],
  [
    "Handle opt-outs",
    "An opted-out contact is suppressed across the workspace. Delivery failures and invalid numbers are separate states, not evidence of withdrawal of consent.",
  ],
  [
    "Work as a team",
    "Choose an assignee in the inbox, add an internal note, and archive conversations when they are resolved.",
  ],
  [
    "Connect an integration",
    "The integration settings are a frontend preview. API keys, provider webhooks and production credentials are not connected.",
  ],
];
export const publicSlugs = [
  "features",
  ...features.map((f) => f.slug),
  "solutions",
  "integrations",
  "pricing",
  "about",
  "contact",
  "help",
  "login",
  "signup",
  "register",
  "forgot-password",
  "privacy",
  "terms",
  "acceptable-use",
];
