/** Owner-supplied commercial definitions. Enforcement belongs on the server in Phase 3+. */
export const plans = [
  {
    id: "starter",
    name: "Starter",
    monthlyCents: 1900,
    maxActiveNumbers: 1,
    recommended: false,
    features: [
      "Bulk messaging",
      "Direct messages",
      "Contact segmentation",
      "Human support based in the USA",
    ],
    entitlements: {
      scheduledCampaigns: false,
      recurringCampaigns: false,
      teamMembers: false,
      personalizedFields: false,
    },
  },
  {
    id: "professional",
    name: "Professional",
    monthlyCents: 3900,
    maxActiveNumbers: 5,
    recommended: true,
    features: [
      "Everything in Starter",
      "Scheduled campaigns",
      "Recurring campaigns",
      "Multiple team members",
      "Personalized message fields",
    ],
    entitlements: {
      scheduledCampaigns: true,
      recurringCampaigns: true,
      teamMembers: true,
      personalizedFields: true,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyCents: null,
    maxActiveNumbers: 10,
    recommended: false,
    features: ["Enterprise messaging", "Custom solutions"],
    entitlements: null, // Custom commercial terms must be agreed; do not infer entitlements.
  },
] as const;

export type PlanId = (typeof plans)[number]["id"];
export function getPlan(value?: string) {
  return plans.find((plan) => plan.id === value?.toLowerCase()) ?? plans[0];
}
export function planPrice(plan: (typeof plans)[number]) {
  return plan.monthlyCents === null
    ? "Contact Sales"
    : `$${plan.monthlyCents / 100}/month`;
}
export const LOW_BALANCE_THRESHOLD = 5;
