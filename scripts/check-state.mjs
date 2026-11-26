import { readFile } from "node:fs/promises";

const state = JSON.parse(await readFile("DEVELOPMENT_STATE.json", "utf8"));
const keys = [
  "active_phase",
  "active_milestone",
  "active_branch",
  "last_known_implementation_checkpoint",
  "completed_tasks",
  "pending_tasks",
  "partially_implemented_tasks",
  "relevant_files",
  "test_results",
  "known_bugs",
  "required_dependencies",
  "required_configuration",
  "preview_status",
  "owner_approval_status",
  "next_action",
];
for (const key of keys) {
  if (!(key in state)) {
    throw new Error("Missing development state field: " + key);
  }
}
if (
  !Number.isInteger(state.active_phase) ||
  state.active_phase < 1 ||
  state.active_phase > 8
) {
  throw new Error("Invalid phase");
}
if (!/^[a-f0-9]{40}$/.test(state.last_known_implementation_checkpoint)) {
  throw new Error("Checkpoint must be a full commit SHA");
}
if (!state.next_action.trim()) {
  throw new Error("Missing next action");
}
if (state.active_phase >= 3) {
  const approval = state.owner_approval_status;
  if (
    approval.frontend !== "approved" ||
    !approval.approved_by ||
    !approval.approved_at ||
    !approval.evidence
  ) {
    throw new Error(
      "Phase 3+ requires recorded explicit owner frontend approval",
    );
  }
}
console.log("Development state and phase gate valid");
