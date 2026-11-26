import { defaultPricing, type Pricing } from "./config";
export type VerificationStatus =
  | "Not started"
  | "Draft"
  | "In review"
  | "Changes needed"
  | "Approved";
export type ContactStatus =
  | "Subscribed"
  | "Lead"
  | "Invalid number"
  | "Opted out";
export type Role = "Owner" | "Admin" | "Member";
export type Fields = {
  business: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  use: string;
  volume: string;
  sample: string;
  consent: string;
};
export const emptyFields: Fields = {
  business: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  use: "",
  volume: "",
  sample: "",
  consent: "",
};
export type Activity = {
  id: string;
  name: string;
  at: string;
  detail?: string;
};
export type Contact = {
  id: string;
  firstName: string;
  phone: string;
  status: ContactStatus;
  tags: string[];
  group: string;
  consent: string;
  delivery?: "Temporarily unreachable" | "Unknown handset";
  duplicate?: boolean;
};
export type Message = {
  id: string;
  text: string;
  direction: "in" | "out";
  at: string;
  number: string;
  status: "Delivered" | "Failed" | "Received";
  credits: number;
};
export type Thread = {
  id: string;
  contactId: string;
  state: "Open" | "Closed";
  unread: boolean;
  draft: string;
  messages: Message[];
};
export type Recipient = {
  id: string;
  name: string;
  phone: string;
  status: "Queued" | "Sent" | "Delivered" | "Failed" | "Excluded";
  reason: string;
  segments: number;
  text: string;
};
export type Campaign = {
  id: string;
  name: string;
  sender: string;
  audience: string;
  text: string;
  fallback: string;
  mode: "Now" | "Future" | "Recurring";
  scheduledAt: string;
  intervalDays: number;
  remaining: number;
  state: "Draft" | "Scheduled" | "Completed" | "Paused";
  createdAt: string;
  recipients: Recipient[];
  runs: number;
  credits: number;
};
export type Receipt = {
  id: string;
  key: string;
  workspaceId: string;
  at: string;
  kind: "Number" | "Credits";
  lines: {
    label: string;
    quantity: number;
    unitCents: number;
    credits: number;
  }[];
  totalCents: number;
  totalCredits: number;
  number?: string;
  status: "Paid";
};
export type Attempt = {
  id: string;
  workspaceId: string;
  at: string;
  kind: string;
  status: "Failed" | "Canceled";
  totalCents: number;
};
export type Workspace = {
  id: string;
  email: string;
  createdAt: string;
  lastActivity: string;
  isDemo: boolean;
  numbers: string[];
  balance: number;
  firstSentAt?: string;
  members: {
    id: string;
    email: string;
    role: Role;
    status: "Active" | "Invited";
  }[];
  verification: {
    status: VerificationStatus;
    fields: Fields;
    startedAt?: string;
    savedAt?: string;
    submittedAt?: string;
    correction?: { field: keyof Fields; text: string };
    history: { at: string; kind: string; fields: Fields; note?: string }[];
  };
  contacts: Contact[];
  threads: Thread[];
  campaigns: Campaign[];
  activity: Activity[];
};
export type State = {
  version: 1;
  activeId: string | null;
  workspaces: Workspace[];
  receipts: Receipt[];
  attempts: Attempt[];
  pricing: Pricing;
  inventory: string[];
};
export type Cart = { credits: number; quantity: number }[];
export const uid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const freshState = (): State => ({
  version: 1,
  activeId: null,
  workspaces: [],
  receipts: [],
  attempts: [],
  pricing: structuredClone(defaultPricing),
  inventory: [
    "+1 (800) 555-0101",
    "+1 (833) 555-0102",
    "+1 (844) 555-0103",
    "+1 (855) 555-0104",
    "+1 (866) 555-0105",
    "+1 (877) 555-0106",
    "+1 (888) 555-0107",
    "+1 (800) 555-0108",
  ],
});
export function workspace(s: State, id: string) {
  const w = s.workspaces.find((w) => w.id === id);
  if (!w) throw Error("Workspace not found. Sign in again.");
  return w;
}
export function activity(
  w: Workspace,
  name: string,
  detail?: string,
  replace = false,
) {
  const at = now();
  if (replace) {
    const old = w.activity.find((e) => e.name === name);
    if (old) {
      old.at = at;
      old.detail = detail;
      w.lastActivity = at;
      return;
    }
  }
  w.activity.push({ id: uid(), name, detail, at });
  w.lastActivity = at;
}
export function register(s: State, email: string, isDemo = false) {
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw Error("Enter a valid email address.");
  let w = s.workspaces.find((w) => w.email === email && w.isDemo === isDemo);
  if (!w) {
    w = {
      id: uid(),
      email,
      isDemo,
      createdAt: now(),
      lastActivity: now(),
      numbers: [],
      balance: 0,
      members: [{ id: uid(), email, role: "Owner", status: "Active" }],
      verification: {
        status: "Not started",
        fields: { ...emptyFields, contactEmail: email },
        history: [],
      },
      contacts: [],
      threads: [],
      campaigns: [],
      activity: [],
    };
    activity(w, "Email confirmed");
    s.workspaces.push(w);
  }
  s.activeId = w.id;
  return w;
}
export function availableNumbers(s: State) {
  return s.inventory.filter(
    (n) => !s.workspaces.some((w) => w.numbers.includes(n)),
  );
}
export function quote(s: State, cart: Cart, number?: string) {
  const lines = cart
    .filter((x) => x.quantity > 0)
    .map((x) => {
      if (!Number.isInteger(x.quantity) || x.quantity > 100)
        throw Error("Choose a quantity between 1 and 100.");
      const p = s.pricing.packs.find((p) => p.credits === x.credits);
      if (!p) throw Error("That credit pack is unavailable.");
      return {
        label: `${p.credits.toLocaleString()} credits`,
        quantity: x.quantity,
        unitCents: p.cents,
        credits: p.credits,
      };
    });
  if (number)
    lines.unshift({
      label: `Toll-free number ${number}`,
      quantity: 1,
      unitCents: s.pricing.numberFee,
      credits: 0,
    });
  return {
    lines,
    totalCents: lines.reduce((n, l) => n + l.quantity * l.unitCents, 0),
    totalCredits: lines.reduce((n, l) => n + l.quantity * l.credits, 0),
  };
}
export function purchase(
  s: State,
  id: string,
  key: string,
  cart: Cart,
  number?: string,
  outcome: "success" | "failed" | "canceled" = "success",
) {
  const old = s.receipts.find((r) => r.key === key && r.workspaceId === id);
  if (old) return old;
  const w = workspace(s, id);
  const q = quote(s, cart, number);
  if (!q.lines.length) throw Error("Add a number or credit pack first.");
  if (outcome !== "success") {
    s.attempts.push({
      id: uid(),
      workspaceId: id,
      at: now(),
      kind: number ? "Number" : "Credits",
      status: outcome === "failed" ? "Failed" : "Canceled",
      totalCents: q.totalCents,
    });
    return null;
  }
  if (number && !availableNumbers(s).includes(number))
    throw Error(
      "This number has already been assigned. Choose another number.",
    );
  const r: Receipt = {
    id: uid(),
    key,
    workspaceId: id,
    at: now(),
    kind: number ? "Number" : "Credits",
    ...q,
    number,
    status: "Paid",
  };
  s.receipts.push(r);
  w.balance += q.totalCredits;
  if (number) {
    w.numbers.push(number);
    activity(w, "Number purchased and assigned", number);
  }
  if (q.totalCredits)
    activity(
      w,
      "Credits purchased",
      `${q.totalCredits.toLocaleString()} credits`,
    );
  return r;
}
export function startVerification(s: State, id: string) {
  const w = workspace(s, id);
  if (w.verification.status === "Not started") {
    w.verification.status = "Draft";
    w.verification.startedAt = now();
    activity(w, "Verification started");
  }
}
export function saveVerification(s: State, id: string, fields: Fields) {
  const w = workspace(s, id);
  if (["Approved", "In review"].includes(w.verification.status))
    throw Error("This application is currently read-only.");
  startVerification(s, id);
  w.verification.fields = fields;
  w.verification.savedAt = now();
  activity(w, "Draft last saved", undefined, true);
}
export function verificationErrors(f: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {};
  for (const key of Object.keys(emptyFields) as (keyof Fields)[])
    if (!f[key].trim()) errors[key] = "This field is required.";
  if (f.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contactEmail))
    errors.contactEmail = "Enter a valid email.";
  if (f.contactPhone && normalizePhone(f.contactPhone).length !== 11)
    errors.contactPhone = "Enter a valid US contact phone.";
  if (f.website && !/^https?:\/\/[^\s.]+\.[^\s]+$/.test(f.website))
    errors.website = "Include a valid https:// website.";
  return errors;
}
export function submitVerification(s: State, id: string) {
  const w = workspace(s, id),
    v = w.verification;
  if (!["Draft", "Changes needed"].includes(v.status))
    throw Error("Start or resume your application first.");
  if (!w.numbers.length)
    throw Error("Get a number before submitting verification.");
  if (Object.keys(verificationErrors(v.fields)).length)
    throw Error("Complete the required application fields.");
  const kind =
    v.status === "Changes needed"
      ? "Verification resubmitted"
      : "Verification submitted";
  v.history.push({ at: now(), kind, fields: structuredClone(v.fields) });
  v.status = "In review";
  v.submittedAt = now();
  v.correction = undefined;
  activity(w, kind);
}
export function decideVerification(
  s: State,
  id: string,
  approved: boolean,
  field: keyof Fields = "consent",
  note = "",
) {
  const w = workspace(s, id),
    v = w.verification;
  if (v.status !== "In review")
    throw Error("Only submitted applications can be reviewed.");
  if (!approved && !note.trim())
    throw Error("Describe the correction the customer needs to make.");
  v.status = approved ? "Approved" : "Changes needed";
  v.correction = approved ? undefined : { field, text: note };
  const kind = approved ? "Verification approved" : "Changes requested";
  v.history.push({
    at: now(),
    kind,
    fields: structuredClone(v.fields),
    note: approved ? "Demo provider approval" : note,
  });
  activity(w, kind, approved ? "Simulated provider decision" : note);
}
export const normalizePhone = (v: string) => {
  const n = v.replace(/\D/g, "");
  return n.length === 10 ? "1" + n : n;
};
export const validPhone = (v: string) =>
  /^1[2-9]\d{2}[2-9]\d{6}$/.test(normalizePhone(v));
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (quoted) throw Error("CSV has an unclosed quoted field.");
  return rows;
}
export function importContacts(
  s: State,
  id: string,
  rows: Omit<Contact, "id">[],
) {
  const w = workspace(s, id);
  const seen = new Set(w.contacts.map((c) => normalizePhone(c.phone)));
  let duplicates = 0,
    invalid = 0;
  for (const raw of rows) {
    const phone = normalizePhone(raw.phone);
    const duplicate = seen.has(phone);
    const status = validPhone(phone) ? raw.status : "Invalid number";
    if (duplicate) duplicates++;
    if (status === "Invalid number") invalid++;
    w.contacts.push({ ...raw, id: uid(), phone, status, duplicate });
    seen.add(phone);
  }
  activity(
    w,
    "Contacts imported",
    `${rows.length - duplicates} new rows; ${duplicates} duplicates; ${invalid} invalid`,
  );
  return { duplicates, invalid, added: rows.length - duplicates };
}
export function setContactStatus(
  s: State,
  id: string,
  contactId: string,
  status: ContactStatus,
) {
  const w = workspace(s, id),
    c = w.contacts.find((c) => c.id === contactId);
  if (!c) return;
  for (const item of w.contacts.filter(
    (x) => normalizePhone(x.phone) === normalizePhone(c.phone),
  ))
    item.status = status;
  activity(
    w,
    status === "Opted out" ? "Contact opted out" : "Contact status updated",
    c.phone,
  );
}
const gsmBasic =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ ÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
export function segments(text: string) {
  if (!text.length) return 0;
  let length = 0;
  let unicode = false;
  for (const c of text) {
    if (gsmBasic.includes(c)) length++;
    else if ("^{}\\[~]|€".includes(c)) length += 2;
    else unicode = true;
  }
  if (unicode) return text.length <= 70 ? 1 : Math.ceil(text.length / 67);
  return length <= 160 ? 1 : Math.ceil(length / 153);
}
export const personalize = (text: string, name: string, fallback: string) =>
  text.replace(
    /\{\{\s*first_name(?:\s*\|\s*([^}]+))?\s*\}\}/g,
    (_, embedded) => name.trim() || embedded?.trim() || fallback || "there",
  );
export function recipients(
  w: Workspace,
  c: Pick<Campaign, "text" | "fallback" | "audience">,
): Recipient[] {
  const seen = new Set<string>();
  const opted = new Set(
    w.contacts
      .filter((x) => x.status === "Opted out")
      .map((x) => normalizePhone(x.phone)),
  );
  return w.contacts
    .filter(
      (x) =>
        c.audience === "All contacts" ||
        x.group === c.audience ||
        x.tags.includes(c.audience),
    )
    .map((x) => {
      const phone = normalizePhone(x.phone);
      let reason = "";
      if (opted.has(phone)) reason = "Opted out across this business";
      else if (x.status === "Invalid number" || !validPhone(phone))
        reason = "Invalid number";
      else if (x.status === "Lead") reason = "Lead: individual replies only";
      else if (x.duplicate || seen.has(phone))
        reason = "Duplicate phone number";
      seen.add(phone);
      const text = personalize(c.text, x.firstName, c.fallback);
      return {
        id: x.id,
        name: x.firstName || "Unnamed contact",
        phone,
        status: reason ? "Excluded" : "Queued",
        reason,
        segments: reason ? 0 : segments(text),
        text,
      };
    });
}
export const estimatedCredits = (r: Recipient[]) =>
  r.filter((x) => x.status !== "Excluded").reduce((n, x) => n + x.segments, 0);
export function sendRequirements(w: Workspace, credits: number) {
  return [
    !w.numbers.length ? "Get a toll-free number." : "",
    w.verification.status !== "Approved"
      ? "Complete SMS verification and wait for approval."
      : "",
    w.balance < credits
      ? `Buy credits: ${credits} needed, ${w.balance} available.`
      : "",
  ].filter(Boolean);
}
export function saveCampaign(s: State, id: string, c: Campaign) {
  const w = workspace(s, id);
  const index = w.campaigns.findIndex((x) => x.id === c.id);
  if (index < 0) {
    w.campaigns.push(c);
    activity(w, "Campaign created", c.name);
  } else {
    if (w.campaigns[index].state !== "Draft")
      throw Error("Only drafts can be edited.");
    w.campaigns[index] = c;
  }
}
export function launchCampaign(s: State, id: string, cid: string) {
  const w = workspace(s, id),
    c = w.campaigns.find((x) => x.id === cid);
  if (!c) throw Error("Campaign not found.");
  if (c.state !== "Draft") return;
  if (!c.text.trim() || !c.name.trim())
    throw Error("Add a campaign name and message.");
  if (!w.numbers.includes(c.sender))
    throw Error("Choose an assigned sender number.");
  const r = recipients(w, c),
    credits = estimatedCredits(r);
  if (!r.some((x) => x.status !== "Excluded"))
    throw Error("No eligible recipients.");
  const blocked = sendRequirements(w, credits);
  if (blocked.length) throw Error(blocked.join(" "));
  if (c.mode !== "Now") {
    if (!c.scheduledAt || new Date(c.scheduledAt).getTime() <= Date.now())
      throw Error("Choose a future date and time.");
    if (
      c.mode === "Recurring" &&
      (!Number.isInteger(c.remaining) || c.remaining < 1 || c.remaining > 30)
    )
      throw Error("Choose 1–30 occurrences.");
    c.state = "Scheduled";
    c.recipients = r;
    activity(w, "Campaign scheduled", c.name);
    return;
  }
  deliverCampaign(s, id, cid);
}
export function deliverCampaign(s: State, id: string, cid: string) {
  const w = workspace(s, id),
    c = w.campaigns.find((x) => x.id === cid);
  if (!c || ["Completed", "Paused"].includes(c.state)) return;
  const r = recipients(w, c),
    credits = estimatedCredits(r);
  if (!w.numbers.includes(c.sender) || sendRequirements(w, credits).length) {
    c.state = "Paused";
    activity(
      w,
      "Campaign paused",
      "Check verification, sender and credit balance.",
    );
    return;
  }
  w.balance -= credits;
  c.credits += credits;
  c.runs++;
  c.recipients = r.map((x) => {
    if (x.status === "Excluded") return x;
    const contact = w.contacts.find((a) => a.id === x.id)!;
    const failed = !!contact.delivery;
    const status = failed ? "Failed" : "Delivered";
    let thread = w.threads.find((t) => t.contactId === x.id);
    if (!thread) {
      thread = {
        id: uid(),
        contactId: x.id,
        state: "Open",
        unread: false,
        draft: "",
        messages: [],
      };
      w.threads.push(thread);
    }
    thread.messages.push({
      id: uid(),
      text: x.text,
      direction: "out",
      at: now(),
      number: c.sender,
      status,
      credits: x.segments,
    });
    return { ...x, status, reason: contact.delivery || "" } as Recipient;
  });
  if (r.some((x) => x.status !== "Excluded") && !w.firstSentAt) {
    w.firstSentAt = now();
    activity(w, "First message sent", c.name);
  }
  activity(w, "Campaign sent", `${c.name}: ${credits} credits`);
  c.remaining--;
  if (c.mode === "Recurring" && c.remaining > 0) {
    c.state = "Scheduled";
    c.scheduledAt = new Date(
      Date.now() + c.intervalDays * 86400000,
    ).toISOString();
  } else c.state = "Completed";
}
export function processScheduled(s: State) {
  for (const w of s.workspaces)
    for (const c of w.campaigns)
      if (
        c.state === "Scheduled" &&
        new Date(c.scheduledAt).getTime() <= Date.now()
      )
        deliverCampaign(s, w.id, c.id);
}
export function reply(
  s: State,
  id: string,
  contactId: string,
  text: string,
  number: string,
) {
  const w = workspace(s, id),
    contact = w.contacts.find((c) => c.id === contactId);
  if (!contact || !text.trim()) throw Error("Write a reply first.");
  if (
    w.contacts.some(
      (c) =>
        normalizePhone(c.phone) === normalizePhone(contact.phone) &&
        ["Opted out", "Invalid number"].includes(c.status),
    )
  )
    throw Error("This contact cannot receive messages.");
  if (!w.numbers.includes(number)) throw Error("Choose an assigned number.");
  const credits = segments(text),
    blocked = sendRequirements(w, credits);
  if (blocked.length) throw Error(blocked.join(" "));
  w.balance -= credits;
  let thread = w.threads.find((t) => t.contactId === contactId);
  if (!thread) {
    thread = {
      id: uid(),
      contactId,
      state: "Open",
      unread: false,
      draft: "",
      messages: [],
    };
    w.threads.push(thread);
  }
  thread.messages.push({
    id: uid(),
    text,
    direction: "out",
    at: now(),
    number,
    status: contact.delivery ? "Failed" : "Delivered",
    credits,
  });
  thread.draft = "";
  if (!w.firstSentAt) {
    w.firstSentAt = now();
    activity(w, "First message sent", "Individual reply");
  }
  activity(w, "Reply sent", contact.phone);
}
export function incoming(
  s: State,
  id: string,
  contactId: string,
  text: string,
  number: string,
) {
  const w = workspace(s, id);
  if (!number) throw Error("Get a number to simulate an incoming message.");
  let t = w.threads.find((x) => x.contactId === contactId);
  if (!t) {
    t = {
      id: uid(),
      contactId,
      state: "Open",
      unread: true,
      draft: "",
      messages: [],
    };
    w.threads.push(t);
  }
  t.messages.push({
    id: uid(),
    text,
    direction: "in",
    at: now(),
    number,
    status: "Received",
    credits: 0,
  });
  t.unread = true;
  t.state = "Open";
  if (/^stop$/i.test(text.trim()))
    setContactStatus(s, id, contactId, "Opted out");
  activity(w, "Message received");
}
export function demoContacts(): Omit<Contact, "id">[] {
  return [
    {
      firstName: "Jamie",
      phone: "2025550101",
      status: "Subscribed",
      tags: ["Spring"],
      group: "Regulars",
      consent: "Demo website checkbox",
    },
    {
      firstName: "Morgan",
      phone: "2025550102",
      status: "Subscribed",
      tags: ["Spring"],
      group: "Regulars",
      consent: "Demo in-store form",
      delivery: "Temporarily unreachable",
    },
    {
      firstName: "Alex",
      phone: "2025550103",
      status: "Opted out",
      tags: [],
      group: "Regulars",
      consent: "STOP keyword",
    },
    {
      firstName: "Jamie duplicate",
      phone: "2025550101",
      status: "Subscribed",
      tags: ["Spring"],
      group: "Regulars",
      consent: "Duplicate demo row",
    },
    {
      firstName: "Casey",
      phone: "2025550104",
      status: "Lead",
      tags: [],
      group: "New inquiries",
      consent: "Incoming inquiry; no campaign consent",
    },
    {
      firstName: "Robin",
      phone: "123",
      status: "Invalid number",
      tags: [],
      group: "New inquiries",
      consent: "Demo import",
    },
    {
      firstName: "",
      phone: "2025550105",
      status: "Subscribed",
      tags: ["Spring"],
      group: "Regulars",
      consent: "Demo website checkbox",
    },
  ];
}
export function seedDemo(s: State) {
  let w = s.workspaces.find((x) => x.isDemo);
  if (w) {
    s.activeId = w.id;
    return w;
  }
  w = register(s, "avery@juniper.example", true);
  const id = w.id;
  purchase(s, id, "demo-number", [], availableNumbers(s)[0]);
  purchase(s, id, "demo-credits", [{ credits: 1000, quantity: 3 }]);
  startVerification(s, id);
  saveVerification(s, id, {
    business: "Juniper Studio",
    contactName: "Avery Lane",
    contactEmail: w.email,
    contactPhone: "2025550110",
    website: "https://juniper.example",
    use: "Appointment reminders and seasonal offers",
    volume: "Up to 1,000 per month",
    sample:
      "Hi Jamie, your Juniper Studio appointment is tomorrow at 2pm. Reply STOP to opt out.",
    consent:
      "Customers select an unchecked SMS consent box when booking. The form states frequency and how to opt out.",
  });
  submitVerification(s, id);
  decideVerification(s, id, true);
  importContacts(s, id, demoContacts());
  incoming(
    s,
    id,
    w.contacts[0].id,
    "Hi! Do you have any afternoon appointments this Friday?",
    w.numbers[0],
  );
  incoming(
    s,
    id,
    w.contacts[4].id,
    "Hello, can I learn more about your services?",
    w.numbers[0],
  );
  return w;
}
