import { workspace, activity, type State } from "@/lib/model";
export const adminActions = [
  "Suspend account",
  "Reactivate account",
  "Adjust credits",
  "Set spending limit",
  "Set sending limit",
  "Change subscription",
  "Record refund preview",
  "Update pricing preview",
  "Retry event preview",
  "Update settings preview",
] as const;
export type AdminActionName = (typeof adminActions)[number];
export function applyAdminAction(
  state: State,
  input: {
    workspaceId: string;
    action: AdminActionName;
    reason: string;
    value: string;
  },
) {
  if (input.reason.trim().length < 5)
    throw Error("Provide a reason of at least 5 characters.");
  const w = input.workspaceId ? workspace(state, input.workspaceId) : undefined;
  if (
    [
      "Suspend account",
      "Reactivate account",
      "Adjust credits",
      "Set spending limit",
      "Set sending limit",
      "Change subscription",
      "Record refund preview",
    ].includes(input.action) &&
    !w
  )
    throw Error("Choose a customer.");
  if (input.action === "Adjust credits") {
    const amount = Number(input.value);
    if (!input.value.trim() || !Number.isSafeInteger(amount) || !amount)
      throw Error("Enter a non-zero whole credit amount.");
    if (!Number.isSafeInteger(w!.balance + amount) || w!.balance + amount < 0)
      throw Error("Adjustment cannot make the balance negative or unsafe.");
    w!.balance += amount;
  }
  if (
    [
      "Set spending limit",
      "Set sending limit",
      "Record refund preview",
    ].includes(input.action)
  ) {
    const amount = Number(input.value);
    if (!input.value.trim() || !Number.isSafeInteger(amount) || amount < 0)
      throw Error("Enter a nonnegative whole amount; money is in cents.");
  }
  if (w) {
    w.preview ??= {};
    w.preview.settings ??= {};
    w.preview.settings.admin ??= {};
    if (input.action === "Suspend account")
      w.preview.settings.admin.suspended = "true";
    else if (input.action === "Reactivate account")
      w.preview.settings.admin.suspended = "false";
    else if (input.action === "Change subscription")
      w.preview.plan = input.value;
    else if (["Set spending limit", "Set sending limit"].includes(input.action))
      w.preview.settings.admin[input.action] = input.value;
    activity(w, input.action + " (demo)", input.reason.trim());
  }
  state.adminPreview ??= {};
  state.adminPreview.actions = [
    {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      ...input,
      reason: input.reason.trim(),
    },
    ...(state.adminPreview.actions || []),
  ];
  return state.adminPreview.actions[0];
}
