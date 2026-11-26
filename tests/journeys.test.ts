import { test } from "node:test";
import assert from "node:assert/strict";
import {
  freshState,
  register,
  purchase,
  availableNumbers,
  startVerification,
  saveVerification,
  submitVerification,
  decideVerification,
  demoContacts,
  importContacts,
  recipients,
  estimatedCredits,
  saveCampaign,
  launchCampaign,
  processScheduled,
  reply,
  incoming,
  segments,
  personalize,
  parseCSV,
  quote,
  seedDemo,
  uid,
  now,
  type Campaign,
  type State,
  type Workspace,
  type Fields,
} from "../src/lib/model";
import { services } from "../src/lib/services";
const fields: Fields = {
  business: "Cedar Workshop",
  contactName: "Taylor Sample",
  contactEmail: "taylor@cedar.example",
  contactPhone: "2025550100",
  website: "https://cedar.example",
  use: "Appointment reminders",
  volume: "Up to 1,000 per month",
  sample: "Hi Jamie, your appointment is tomorrow. Reply STOP to opt out.",
  consent:
    "Customers check an unchecked checkbox with SMS terms and STOP instructions. We record consent time.",
};
function approve(s: State, w: Workspace) {
  purchase(s, w.id, uid(), [], availableNumbers(s)[0]);
  startVerification(s, w.id);
  saveVerification(s, w.id, fields);
  submitVerification(s, w.id);
  decideVerification(s, w.id, true);
}
function campaign(w: Workspace, overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: uid(),
    name: "Friday reminder",
    sender: w.numbers[0],
    audience: "All contacts",
    text: "Hi {{first_name}}, your appointment is tomorrow. Reply STOP to opt out.",
    fallback: "friend",
    mode: "Now",
    scheduledAt: "",
    intervalDays: 7,
    remaining: 1,
    state: "Draft",
    createdAt: now(),
    recipients: [],
    runs: 0,
    credits: 0,
    ...overrides,
  };
}
test("A: confirmed signup appears immediately as email-only empty workspace, returning email reuses identity", () => {
  const s = freshState(),
    challenge = services.auth.issue("alex@sample.example");
  assert.throws(() => services.auth.verify(challenge, "000000"), /incorrect/);
  assert.throws(
    () => services.auth.verify({ ...challenge, expiresAt: 0 }, "246810"),
    /expired/,
  );
  const w = register(s, services.auth.verify(challenge, "246810"));
  assert.equal(s.workspaces.length, 1);
  assert.equal(w.verification.status, "Not started");
  assert.equal(w.balance, 0);
  assert.deepEqual(w.numbers, []);
  assert.deepEqual(w.contacts, []);
  assert.equal(w.activity[0].name, "Email confirmed");
  assert.equal(register(s, " ALEX@sample.example ").id, w.id);
  assert.equal(s.workspaces.length, 1);
});
test("B: number assigns once, survives serialization, no renewal or duplicate receipt; failure/cancel leave inventory", () => {
  let s = freshState();
  const w = register(s, "a@sample.example"),
    number = availableNumbers(s)[0];
  purchase(s, w.id, "fail", [], number, "failed");
  purchase(s, w.id, "cancel", [], number, "canceled");
  assert.ok(availableNumbers(s).includes(number));
  assert.equal(s.receipts.length, 0);
  const r = purchase(s, w.id, "once", [], number)!;
  assert.equal(r.totalCents, 1000);
  purchase(s, w.id, "once", [], number);
  s = JSON.parse(JSON.stringify(s));
  assert.equal(s.receipts.length, 1);
  assert.deepEqual(s.workspaces[0].numbers, [number]);
  assert.equal("renewalDate" in s.workspaces[0], false);
  assert.throws(() => purchase(s, w.id, "different", [], number), /assigned/);
  assert.equal(s.receipts.length, 1);
});
test("C: resumable verification, coalesced save event, correction and resubmission history", () => {
  let s = freshState();
  const w = register(s, "a@sample.example");
  startVerification(s, w.id);
  const started = w.verification.startedAt;
  saveVerification(s, w.id, { ...fields, business: "First draft" });
  saveVerification(s, w.id, { ...fields, business: "Saved draft" });
  s = JSON.parse(JSON.stringify(s));
  const saved = s.workspaces[0];
  assert.equal(saved.verification.fields.business, "Saved draft");
  assert.equal(saved.verification.startedAt, started);
  assert.equal(
    saved.activity.filter((e) => e.name === "Draft last saved").length,
    1,
  );
  assert.throws(() => submitVerification(s, saved.id), /number/);
  purchase(s, saved.id, "number", [], availableNumbers(s)[0]);
  submitVerification(s, saved.id);
  decideVerification(
    s,
    saved.id,
    false,
    "consent",
    "Please describe how consent is recorded.",
  );
  assert.equal(saved.verification.status, "Changes needed");
  saveVerification(s, saved.id, {
    ...saved.verification.fields,
    consent: "Revised explicit opt-in and timestamp recording.",
  });
  submitVerification(s, saved.id);
  assert.equal(saved.verification.status, "In review");
  decideVerification(s, saved.id, true);
  assert.equal(saved.verification.status, "Approved");
  assert.deepEqual(
    saved.verification.history.map((h) => h.kind),
    [
      "Verification submitted",
      "Changes requested",
      "Verification resubmitted",
      "Verification approved",
    ],
  );
  assert.equal(saved.verification.history[0].fields.business, "Saved draft");
});
test("D: three 1,000 packs produce one $45 receipt; subsequent price edit affects only new purchase", () => {
  const s = freshState(),
    w = register(s, "a@sample.example");
  const r = purchase(s, w.id, "pack-order", [{ credits: 1000, quantity: 3 }])!;
  assert.equal(w.balance, 3000);
  assert.equal(r.totalCents, 4500);
  assert.equal(r.totalCredits, 3000);
  assert.equal(s.receipts.length, 1);
  s.pricing.packs.find((p) => p.credits === 1000)!.cents = 1600;
  assert.equal(quote(s, [{ credits: 1000, quantity: 3 }]).totalCents, 4800);
  purchase(s, w.id, "second", [{ credits: 1000, quantity: 3 }]);
  assert.equal(s.receipts[0].totalCents, 4500);
  assert.equal(s.receipts[0].lines[0].unitCents, 1500);
  assert.equal(w.balance, 6000);
});
test("E: audience excludes opt-outs, leads, invalids and duplicate rows; temporary failures stay reviewable", () => {
  const s = freshState(),
    w = register(s, "a@sample.example");
  approve(s, w);
  purchase(s, w.id, "credits", [{ credits: 1000, quantity: 1 }]);
  const imp = importContacts(s, w.id, demoContacts());
  assert.equal(imp.duplicates, 1);
  const c = campaign(w);
  const audience = recipients(w, c);
  assert.equal(audience.filter((x) => x.status === "Excluded").length, 4);
  assert.equal(estimatedCredits(audience), 3);
  saveCampaign(s, w.id, c);
  launchCampaign(s, w.id, c.id);
  assert.equal(c.recipients.filter((r) => r.status === "Delivered").length, 2);
  assert.equal(c.recipients.filter((r) => r.status === "Failed").length, 1);
  assert.equal(w.balance, 997);
  assert.ok(w.firstSentAt);
  assert.equal(
    w.activity.filter((e) => e.name === "First message sent").length,
    1,
  );
  launchCampaign(s, w.id, c.id);
  assert.equal(w.balance, 997);
  assert.equal(
    w.contacts.find((c) => c.firstName === "Morgan")!.status,
    "Subscribed",
  );
  assert.match(
    c.recipients.find((r) => r.name === "Unnamed contact")!.text,
    /Hi friend/,
  );
});
test("F: second business is isolated, including opt-outs for the same phone", () => {
  const s = freshState(),
    a = register(s, "a@sample.example");
  approve(s, a);
  purchase(s, a.id, "credits", [{ credits: 500, quantity: 1 }]);
  importContacts(s, a.id, demoContacts());
  incoming(s, a.id, a.contacts[0].id, "STOP", a.numbers[0]);
  const b = register(s, "b@sample.example");
  assert.equal(b.balance, 0);
  assert.equal(b.numbers.length, 0);
  assert.equal(b.contacts.length, 0);
  assert.equal(b.threads.length, 0);
  approve(s, b);
  assert.notEqual(a.numbers[0], b.numbers[0]);
  importContacts(s, b.id, [demoContacts()[0]]);
  assert.equal(recipients(b, campaign(b))[0].status, "Queued");
  assert.equal(recipients(a, campaign(a))[0].status, "Excluded");
});
test("Demo data is isolated from newly registered workspaces", () => {
  const s = freshState();
  seedDemo(s);
  const w = register(s, "new@sample.example");
  assert.equal(w.contacts.length, 0);
  assert.equal(w.balance, 0);
  assert.equal(w.numbers.length, 0);
  assert.equal(w.verification.status, "Not started");
  assert.equal(s.workspaces.length, 2);
});
test("Send gate protects number, verification, credit balance and empty messages", () => {
  const s = freshState(),
    w = register(s, "a@sample.example");
  importContacts(s, w.id, [demoContacts()[0]]);
  const c = campaign(w);
  saveCampaign(s, w.id, c);
  assert.throws(() => launchCampaign(s, w.id, c.id), /sender/);
  approve(s, w);
  c.sender = w.numbers[0];
  assert.throws(() => launchCampaign(s, w.id, c.id), /credits/);
  purchase(s, w.id, "credits", [{ credits: 500, quantity: 1 }]);
  w.verification.status = "In review";
  assert.throws(() => launchCampaign(s, w.id, c.id), /verification/);
  assert.equal(w.balance, 500);
});
test("Individual Lead replies are allowed; STOP blocks all business sender numbers", () => {
  const s = freshState(),
    w = register(s, "a@sample.example");
  approve(s, w);
  purchase(s, w.id, "number2", [], availableNumbers(s)[0]);
  purchase(s, w.id, "credits", [{ credits: 500, quantity: 1 }]);
  importContacts(s, w.id, [demoContacts()[4]]);
  reply(s, w.id, w.contacts[0].id, "Hello!", w.numbers[0]);
  assert.equal(w.balance, 499);
  incoming(s, w.id, w.contacts[0].id, "STOP", w.numbers[0]);
  assert.throws(
    () => reply(s, w.id, w.contacts[0].id, "Hello again!", w.numbers[1]),
    /cannot receive/,
  );
  assert.equal(w.balance, 499);
});
test("Future and recurring schedules recheck eligibility and charge only when executed", () => {
  const s = freshState(),
    w = register(s, "a@sample.example");
  approve(s, w);
  purchase(s, w.id, "credits", [{ credits: 500, quantity: 1 }]);
  importContacts(s, w.id, [demoContacts()[0]]);
  const c = campaign(w, {
    mode: "Recurring",
    remaining: 2,
    scheduledAt: new Date(Date.now() + 60000).toISOString(),
  });
  saveCampaign(s, w.id, c);
  launchCampaign(s, w.id, c.id);
  assert.equal(w.balance, 500);
  assert.equal(c.state, "Scheduled");
  c.scheduledAt = new Date(Date.now() - 1).toISOString();
  processScheduled(s);
  assert.equal(c.runs, 1);
  assert.equal(w.balance, 499);
  assert.equal(c.state, "Scheduled");
  incoming(s, w.id, w.contacts[0].id, "STOP", w.numbers[0]);
  c.scheduledAt = new Date(Date.now() - 1).toISOString();
  processScheduled(s);
  assert.equal(w.balance, 499);
  assert.equal(c.state, "Completed");
  assert.equal(c.recipients[0].status, "Excluded");
});
test("CSV parser handles quoted commas, escaped quotes, CRLF and multiline fields", () => {
  assert.deepEqual(
    parseCSV(
      'name,phone,source\r\n"Jamie, J",2025550101,"Checkbox\nwith terms"\r\n"A ""B""",2025550102,form',
    ),
    [
      ["name", "phone", "source"],
      ["Jamie, J", "2025550101", "Checkbox\nwith terms"],
      ['A "B"', "2025550102", "form"],
    ],
  );
  assert.throws(() => parseCSV('name,phone\n"unfinished,202'), /unclosed/);
});
test("SMS segment accounting covers GSM extension characters and Unicode", () => {
  assert.equal(segments("a".repeat(160)), 1);
  assert.equal(segments("a".repeat(161)), 2);
  assert.equal(segments("^".repeat(80)), 1);
  assert.equal(segments("^".repeat(81)), 2);
  assert.equal(segments("🙂".repeat(35)), 1);
  assert.equal(segments("🙂".repeat(36)), 2);
  assert.equal(
    personalize("Hello {{ first_name | friend }}", "", "there"),
    "Hello friend",
  );
});
