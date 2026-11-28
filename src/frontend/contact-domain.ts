/** Browser-demo operations only. Server tenant enforcement is specified for Phase 3. */
import {
  type State,
  type Workspace,
  workspace,
  uid,
  now,
  normalizePhone,
  validPhone,
  activity,
} from "../lib/model";
export function ownedWorkspace(s: State, id: string) {
  if (s.activeId !== id) throw Error("Select your own workspace first.");
  return workspace(s, id);
}
export function tagNames(w: Workspace) {
  return [
    ...new Set([
      ...(w.preview?.tags || []),
      ...w.contacts.flatMap((c) => c.tags),
    ]),
  ].sort();
}
function tagName(name: string) {
  const result = name.trim();
  if (!result || result.length > 40)
    throw Error("Use a tag name of 1–40 characters.");
  return result;
}
export function saveTag(s: State, id: string, name: string, previous?: string) {
  const w = ownedWorkspace(s, id),
    value = tagName(name),
    tags = tagNames(w);
  if (previous && !tags.includes(previous))
    throw Error("Tag not found in this workspace.");
  if (
    tags.some((t) => t.toLowerCase() === value.toLowerCase() && t !== previous)
  )
    throw Error("This tag already exists.");
  w.preview ??= {};
  w.preview.tags = [...tags.filter((t) => t !== previous), value];
  if (previous)
    for (const c of w.contacts)
      c.tags = c.tags.map((t) => (t === previous ? value : t));
}
export function deleteTag(s: State, id: string, name: string) {
  const w = ownedWorkspace(s, id);
  if (!tagNames(w).includes(name))
    throw Error("Tag not found in this workspace.");
  w.preview ??= {};
  w.preview.tags = tagNames(w).filter((t) => t !== name);
  for (const c of w.contacts) c.tags = c.tags.filter((t) => t !== name);
}
export function assignTag(
  s: State,
  id: string,
  ids: string[],
  name: string,
  remove = false,
) {
  const w = ownedWorkspace(s, id);
  if (
    !tagNames(w).includes(name) ||
    ids.some((cid) => !w.contacts.some((c) => c.id === cid))
  )
    throw Error("Contact or tag not found in this workspace.");
  for (const c of w.contacts.filter((c) => ids.includes(c.id)))
    c.tags = remove
      ? c.tags.filter((t) => t !== name)
      : [...new Set([...c.tags, name])];
}
export function saveContact(
  s: State,
  id: string,
  firstName: string,
  rawPhone: string,
  contactId?: string,
) {
  const w = ownedWorkspace(s, id),
    phone = normalizePhone(rawPhone);
  if (!validPhone(rawPhone))
    throw Error("Enter a valid US or Canadian phone number.");
  if (firstName.trim().length > 100)
    throw Error("First name is limited to 100 characters.");
  if (
    w.contacts.some(
      (c) => c.id !== contactId && normalizePhone(c.phone) === phone,
    )
  )
    throw Error("This phone number already exists.");
  const c = contactId ? w.contacts.find((c) => c.id === contactId) : undefined;
  if (contactId && !c) throw Error("Contact not found in this workspace.");
  // Changing a number must not transfer consent to a different recipient.
  if (c && normalizePhone(c.phone) !== phone)
    throw Error(
      "Add a new contact to change the phone number; consent cannot be transferred.",
    );
  if (c) c.firstName = firstName.trim();
  else
    w.contacts.push({
      id: uid(),
      firstName: firstName.trim(),
      phone,
      tags: [],
      group: "",
      consent: "",
      status: w.preview?.suppressedPhones?.includes(phone)
        ? "Opted out"
        : "Lead",
    });
  activity(
    w,
    c ? "Contact updated" : "Contact added",
    "No consent granted by this action",
  );
}
export function deleteContact(s: State, id: string, cid: string) {
  const w = ownedWorkspace(s, id),
    c = w.contacts.find((c) => c.id === cid);
  if (!c) throw Error("Contact not found in this workspace.");
  w.preview ??= {};
  w.preview.deletedContacts = [
    ...(w.preview.deletedContacts || []),
    structuredClone(c),
  ];
  if (c.status === "Opted out")
    w.preview.suppressedPhones = [
      ...new Set([
        ...(w.preview.suppressedPhones || []),
        normalizePhone(c.phone),
      ]),
    ];
  w.contacts = w.contacts.filter((c) => c.id !== cid);
  activity(
    w,
    "Contact removed",
    "Consent, suppression and conversation history retained in demo archive",
  );
}
export type ImportRow = { firstName: string; phone: string };
export function reviewImport(w: Workspace, rows: ImportRow[]) {
  const seen = new Set(w.contacts.map((c) => normalizePhone(c.phone)));
  const suppressed = new Set([
    ...(w.preview?.suppressedPhones || []),
    ...w.contacts
      .filter((c) => c.status === "Opted out")
      .map((c) => normalizePhone(c.phone)),
  ]);
  return rows.map((row, i) => {
    const phone = normalizePhone(row.phone);
    const issue = !validPhone(row.phone)
      ? "Invalid phone number"
      : row.firstName.length > 100
        ? "First name exceeds 100 characters"
        : suppressed.has(phone)
          ? "Suppressed: existing opt-out"
          : seen.has(phone)
            ? "Duplicate phone number"
            : "";
    if (!issue) seen.add(phone);
    return { ...row, phone, row: i + 2, issue, reviewRequired: !issue };
  });
}
export function commitImport(
  s: State,
  id: string,
  rows: ImportRow[],
  name: string,
  file: string,
  fingerprint: string,
  tags: string[],
) {
  const w = ownedWorkspace(s, id);
  if (!name.trim() || name.trim().length > 100)
    throw Error("Name this import batch (1–100 characters).");
  if (!/^[a-f0-9]{64}$/.test(fingerprint))
    throw Error("File validation is incomplete.");
  if (w.preview?.imports?.some((i) => i.fingerprint === fingerprint))
    throw Error("This file has already been imported into this workspace.");
  if (tags.some((t) => !tagNames(w).includes(t)))
    throw Error("Select tags owned by this workspace.");
  const reviewed = reviewImport(w, rows),
    accepted = reviewed.filter((r) => !r.issue);
  for (const r of accepted)
    w.contacts.push({
      id: uid(),
      firstName: r.firstName,
      phone: r.phone,
      tags: [...tags],
      group: "",
      consent: "",
      status: "Lead",
    });
  const result = {
    id: uid(),
    at: now(),
    file,
    name: name.trim(),
    fingerprint,
    total: rows.length,
    added: accepted.length,
    invalid: reviewed.filter(
      (r) => r.issue.startsWith("Invalid") || r.issue.startsWith("First name"),
    ).length,
    duplicates: reviewed.filter((r) => r.issue.startsWith("Duplicate")).length,
    suppressed: reviewed.filter((r) => r.issue.startsWith("Suppressed")).length,
    skipped: rows.length - accepted.length,
    reviewRequired: accepted.length,
  };
  w.preview ??= {};
  w.preview.imports = [...(w.preview.imports || []), result];
  activity(
    w,
    "Import completed",
    `${result.name}: ${result.added} leads; consent review required`,
  );
  return result;
}
