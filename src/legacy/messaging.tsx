"use client";
import {
  timeZones,
  wallTime,
  scheduleInstant,
  downloadCSV,
} from "@/frontend/scheduling";
import { ContactTools } from "@/frontend/contacts-tools";
import { InboxTools } from "@/frontend/inbox-tools";
import { useMemo, useState, useEffect, type ChangeEvent } from "react";
import Link, { useSearchParams } from "./navigation";
import { useStore } from "@/lib/store";
import { count, date, money } from "@/lib/config";
import { services } from "@/lib/services";
import {
  activity,
  demoContacts,
  importContacts,
  parseCSV,
  normalizePhone,
  validPhone,
  setContactStatus,
  workspace,
  uid,
  now,
  saveCampaign,
  recipients,
  estimatedCredits,
  segments,
  messageEncoding,
  personalize,
  sendRequirements,
  deliverCampaign,
  type Workspace,
  type Contact,
  type ContactStatus,
  type Campaign,
  type Recipient,
} from "@/lib/model";
import {
  Button,
  Badge,
  Field,
  Empty,
  Heading,
  Notice,
  Modal,
  Plus,
  Search,
  Users,
  Send,
  Inbox,
  MessageSquare,
  ChevronRight,
  Calendar,
} from "./ui";

const statuses: ContactStatus[] = [
  "Subscribed",
  "Lead",
  "Invalid number",
  "Opted out",
];
const phone = (n: string) => {
  const d = normalizePhone(n);
  return d.length === 11
    ? `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`
    : n;
};
function ErrorNotice({ message }: { message: string }) {
  return message ? <Notice tone="error">{message}</Notice> : null;
}

export function Contacts({ w }: { w: Workspace }) {
  const { mutate } = useStore();
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("All statuses"),
    [group, setGroup] = useState("All groups"),
    [tag, setTag] = useState("All tags"),
    [importing, setImporting] = useState(false),
    [selected, setSelected] = useState<string | null>(null),
    [notice, setNotice] = useState(""),
    [error, setError] = useState("");
  const searchParams = useSearchParams();
  useEffect(() => {
    const id = searchParams.get("contact");
    if (id) setSelected(id);
  }, [searchParams]);
  const [contactPage, setContactPage] = useState(0);
  const groups = [...new Set(w.contacts.map((c) => c.group).filter(Boolean))],
    tags = [...new Set(w.contacts.flatMap((c) => c.tags))];
  const filtered = w.contacts.filter(
    (c) =>
      `${c.firstName} ${c.phone} ${c.tags.join(" ")} ${c.group}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "All statuses" || c.status === status) &&
      (group === "All groups" || c.group === group) &&
      (tag === "All tags" || c.tags.includes(tag)),
  );
  const maxPage = Math.max(0, Math.ceil(filtered.length / 25) - 1),
    safePage = Math.min(contactPage, maxPage);
  const contact = w.contacts.find((c) => c.id === selected);
  const sample = () => {
    try {
      const result = mutate((s) => importContacts(s, w.id, demoContacts()));
      setNotice(
        `Added ${result.added} sample rows. ${result.duplicates} duplicate row retained for review. All details are fictional.`,
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <>
      <Heading
        title="Contacts"
        subtitle="Know your audience before you start a conversation."
        action={
          <Button onClick={() => setImporting(true)}>
            <Plus size={17} /> Import contacts
          </Button>
        }
      />
      <ErrorNotice message={error} />
      {notice && <Notice tone="success">{notice}</Notice>}
      <ContactTools w={w} />
      <nav aria-label="Contact pagination" className="actions">
        <Button
          variant="ghost"
          disabled={safePage === 0}
          onClick={() => setContactPage(safePage - 1)}
        >
          Previous contacts
        </Button>
        <span>
          Page {safePage + 1} of {maxPage + 1} · {filtered.length} contacts
        </span>
        <Button
          variant="ghost"
          disabled={safePage === maxPage}
          onClick={() => setContactPage(safePage + 1)}
        >
          Next contacts
        </Button>
      </nav>
      <div className="panel">
        <div className="toolbar contact-filters">
          <label className="search-input">
            <Search size={18} />
            <input
              aria-label="Search contacts"
              placeholder="Search name, number or tag"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter contact status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["All statuses", ...statuses].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            aria-label="Filter contact group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            {["All groups", ...groups].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            aria-label="Filter contact tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            {["All tags", ...tags].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        {w.contacts.length === 0 ? (
          <Empty
            icon={<Users size={28} />}
            title="Your audience starts here."
            action={
              <div className="actions">
                <Button onClick={() => setImporting(true)}>Import a CSV</Button>
                <Button variant="secondary" onClick={sample}>
                  Load fictional sample contacts
                </Button>
              </div>
            }
          >
            Import consented contacts, or add clearly fictional records to try
            the prototype.
          </Empty>
        ) : (
          <>
            <div className="table-wrap messaging-table">
              <table>
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Group / tags</th>
                    <th>Consent source</th>
                    <th>Review</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice(safePage * 25, (safePage + 1) * 25)
                    .map((c) => (
                      <tr key={c.id}>
                        <td>
                          <button
                            className="table-link"
                            onClick={() => setSelected(c.id)}
                          >
                            {c.firstName || "Unnamed contact"}
                          </button>
                          <small>{phone(c.phone)}</small>
                        </td>
                        <td>
                          <Badge>{c.status}</Badge>
                        </td>
                        <td>
                          {c.group || "No group"}
                          <small>{c.tags.join(", ") || "No tags"}</small>
                        </td>
                        <td className="consent-cell">
                          {c.consent || "Not recorded"}
                        </td>
                        <td>
                          {c.duplicate ? (
                            <Badge>Duplicate row</Badge>
                          ) : c.delivery ? (
                            <span className="review-label">{c.delivery}</span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="ghost"
                            onClick={() => setSelected(c.id)}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && (
              <Empty title="No matching contacts">
                Try a different search or filter.
              </Empty>
            )}
            <div className="table-footer">
              <span>
                {count(filtered.length)} rows shown;{" "}
                {count(w.contacts.filter((c) => c.duplicate).length)} duplicates
                retained separately.
              </span>
              <Button variant="ghost" onClick={sample}>
                Load fictional sample contacts
              </Button>
            </div>
          </>
        )}
      </div>
      <p className="muted help-copy">
        Subscribed contacts may receive campaigns. Leads can receive individual
        replies. Opt-outs apply across all sender numbers in this business.
        Temporary delivery failures remain available for review.
      </p>
      {importing && (
        <ImportContacts
          w={w}
          onClose={() => setImporting(false)}
          onDone={(message) => {
            setImporting(false);
            setNotice(message);
          }}
        />
      )}
      {contact && (
        <ContactDetail
          w={w}
          contact={contact}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

type ImportKey =
  "phone" | "firstName" | "status" | "tags" | "group" | "consent";
const importLabels: Record<ImportKey, string> = {
  phone: "Phone number",
  firstName: "First name",
  status: "Contact status",
  tags: "Tags",
  group: "Group",
  consent: "Opt-in source",
};
function ImportContacts({
  w,
  onClose,
  onDone,
}: {
  w: Workspace;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const { mutate } = useStore();
  const [rows, setRows] = useState<string[][]>([]),
    [mapping, setMapping] = useState<Record<ImportKey, number>>({
      phone: -1,
      firstName: -1,
      status: -1,
      tags: -1,
      group: -1,
      consent: -1,
    }),
    [step, setStep] = useState(0),
    [error, setError] = useState(""),
    [source, setSource] = useState(""),
    [defaultStatus, setDefaultStatus] = useState<ContactStatus>("Lead"),
    [defaultGroup, setDefaultGroup] = useState("");
  const [reading, setReading] = useState(false),
    [fileName, setFileName] = useState("");
  const read = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setReading(true);
      if (file.size > 5 * 1024 * 1024)
        throw Error("Preview imports are limited to 5 MB.");
      if (!/\.(csv|xlsx)$/i.test(file.name))
        throw Error("Choose a CSV or XLSX file.");
      const parsed = /\.xlsx$/i.test(file.name)
        ? (await (await import("read-excel-file/browser")).readSheet(file)).map(
            (row) => row.map((cell) => (cell === null ? "" : String(cell))),
          )
        : parseCSV(await file.text());
      if (parsed.length > 10001)
        throw Error(
          "Preview imports support up to 10,000 rows. Split larger files for this browser demo.",
        );
      setFileName(file.name);
      if (parsed.length < 2)
        throw Error("Your CSV needs a header and at least one contact row.");
      setRows(parsed);
      const headers = parsed[0].map((x) =>
        x.toLowerCase().replace(/[ _-]/g, ""),
      );
      const locate = (names: string[]) =>
        headers.findIndex((x) => names.includes(x));
      setMapping({
        phone: locate(["phone", "phonenumber", "mobile", "number"]),
        firstName: locate(["firstname", "name"]),
        status: locate(["status", "contactstatus"]),
        tags: locate(["tags", "tag"]),
        group: locate(["group", "groups"]),
        consent: locate(["consent", "optinsource", "source"]),
      });
      setError("");
      setStep(1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setReading(false);
    }
  };
  const mapped = useMemo(
    () =>
      rows.slice(1).map((row) => {
        const value = (key: ImportKey) =>
          mapping[key] >= 0 ? (row[mapping[key]] || "").trim() : "";
        const rawStatus = value("status");
        const matched = statuses.find(
          (x) => x.toLowerCase() === rawStatus.toLowerCase(),
        );
        return {
          phone: value("phone"),
          firstName: value("firstName"),
          status: matched || defaultStatus,
          tags: value("tags")
            .split(/[;|,]/)
            .map((x) => x.trim())
            .filter(Boolean),
          group: value("group") || defaultGroup,
          consent: value("consent") || source,
        } as Omit<Contact, "id">;
      }),
    [rows, mapping, source, defaultStatus, defaultGroup],
  );
  const summary = useMemo(() => {
    const seen = new Set(w.contacts.map((c) => normalizePhone(c.phone)));
    let duplicates = 0,
      invalid = 0;
    for (const c of mapped) {
      const p = normalizePhone(c.phone);
      if (seen.has(p)) duplicates++;
      seen.add(p);
      if (!validPhone(p)) invalid++;
    }
    const suppressed = mapped.filter(
      (c) =>
        c.status === "Opted out" ||
        w.contacts.some(
          (x) =>
            normalizePhone(x.phone) === normalizePhone(c.phone) &&
            x.status === "Opted out",
        ),
    ).length;
    return { duplicates, invalid, suppressed };
  }, [mapped, w.contacts]);
  const commit = () => {
    try {
      if (mapped.some((c) => c.status === "Subscribed" && !c.consent.trim()))
        throw Error(
          "Add an opt-in source for every subscribed contact, or import as Leads.",
        );
      const r = mutate((s) => {
        const result = importContacts(s, w.id, mapped);
        const v = workspace(s, w.id);
        v.preview ??= {};
        v.preview.imports = [
          ...(v.preview.imports || []),
          {
            id: uid(),
            at: now(),
            file: fileName,
            ...result,
            suppressed: summary.suppressed,
          },
        ];
        return result;
      });
      onDone(
        `Imported ${r.added} new rows; ${r.duplicates} duplicate rows; ${r.invalid} invalid rows. Duplicate rows are retained for review and excluded from campaigns.`,
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Modal
      title={
        step === 0
          ? "Import your contacts"
          : step === 1
            ? "Match your columns"
            : "Review your import"
      }
      onClose={onClose}
    >
      <div className="import-body">
        <p>
          Use fictional information in this prototype. Your file stays in this
          browser.
        </p>
        <ErrorNotice message={error} />
        {step === 0 ? (
          <>
            <Field
              label="CSV or XLSX file"
              hint="Include a header row. Phone is required; first name, status, group, tags, and opt-in source are optional."
            >
              <input
                type="file"
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={read}
                disabled={reading}
              />
              {reading && (
                <p role="status">Reading and validating spreadsheet…</p>
              )}
              <small>
                XLSX: first worksheet. Up to 5 MB and 10,000 data rows.
              </small>
            </Field>
            <details>
              <summary>View CSV example</summary>
              <pre>
                phone,firstName,status,group,consent{"\n"}
                2025550101,Jamie,Subscribed,Regulars,Demo website checkbox
              </pre>
            </details>
          </>
        ) : step === 1 ? (
          <>
            <div className="form-grid">
              {(Object.keys(importLabels) as ImportKey[]).map((key) => (
                <Field
                  key={key}
                  label={importLabels[key] + (key === "phone" ? " *" : "")}
                >
                  <select
                    value={mapping[key]}
                    onChange={(e) =>
                      setMapping({ ...mapping, [key]: +e.target.value })
                    }
                  >
                    <option value={-1}>
                      {key === "phone" ? "Choose phone column" : "Not mapped"}
                    </option>
                    {rows[0].map((h, i) => (
                      <option value={i} key={i}>
                        {h || `Column ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
            <div className="form-grid">
              <Field label="Default status for unmapped or unknown values">
                <select
                  value={defaultStatus}
                  onChange={(e) =>
                    setDefaultStatus(e.target.value as ContactStatus)
                  }
                >
                  {statuses.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Default group">
                <input
                  value={defaultGroup}
                  onChange={(e) => setDefaultGroup(e.target.value)}
                  placeholder="e.g. Spring bookings"
                />
              </Field>
            </div>
            <Field
              label="Default opt-in source"
              hint="Required for subscribed contacts when no source is supplied in the CSV."
            >
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Unchecked checkbox on booking form"
              />
            </Field>
            <Button
              disabled={mapping.phone < 0}
              onClick={() => {
                setStep(2);
                setError("");
              }}
            >
              Preview import
            </Button>
          </>
        ) : (
          <>
            <div className="import-summary">
              <span>
                <b>{count(mapped.length)}</b> rows
              </span>
              <span>
                <b>{count(summary.duplicates)}</b> duplicates
              </span>
              <span>
                <b>{count(summary.invalid)}</b> invalid numbers
              </span>
              <span>
                <b>{count(summary.suppressed)}</b> suppressed
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={() =>
                downloadCSV("import-review.csv", [
                  ["Row", "Phone", "Review"],
                  ...mapped.map((c, i) => [
                    i + 2,
                    c.phone,
                    !validPhone(c.phone)
                      ? "Invalid number"
                      : c.status === "Opted out" ||
                          w.contacts.some(
                            (x) =>
                              normalizePhone(x.phone) ===
                                normalizePhone(c.phone) &&
                              x.status === "Opted out",
                          )
                        ? "Confirmed opt-out"
                        : w.contacts.some(
                              (x) =>
                                normalizePhone(x.phone) ===
                                normalizePhone(c.phone),
                            ) ||
                            mapped
                              .slice(0, i)
                              .some(
                                (x) =>
                                  normalizePhone(x.phone) ===
                                  normalizePhone(c.phone),
                              )
                          ? "Duplicate"
                          : "Ready",
                  ]),
                ])
              }
            >
              Download import review
            </Button>
            <div className="table-wrap messaging-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Group</th>
                  </tr>
                </thead>
                <tbody>
                  {mapped.slice(0, 10).map((c, i) => (
                    <tr key={i}>
                      <td>{c.firstName || "Unnamed"}</td>
                      <td>{phone(c.phone)}</td>
                      <td>
                        <Badge>
                          {validPhone(c.phone) ? c.status : "Invalid number"}
                        </Badge>
                      </td>
                      <td>{c.group || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted">
              Showing the first {Math.min(10, mapped.length)} of {mapped.length}{" "}
              rows. All rows will be imported; invalid and duplicate rows remain
              marked for review.
            </p>
            <div className="actions">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back to mapping
              </Button>
              <Button onClick={commit}>
                Import {count(mapped.length)} rows
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
function ContactDetail({
  w,
  contact,
  onClose,
}: {
  w: Workspace;
  contact: Contact;
  onClose: () => void;
}) {
  const { mutate } = useStore();
  const [draft, setDraft] = useState({ ...contact, tags: [...contact.tags] }),
    [tags, setTags] = useState(contact.tags.join(", ")),
    [error, setError] = useState("");
  const save = () => {
    try {
      if (draft.status === "Subscribed" && !draft.consent.trim())
        throw Error("Record how this contact agreed to receive campaigns.");
      mutate((s) => {
        const current = workspace(s, w.id);
        const c = current.contacts.find((c) => c.id === contact.id)!;
        Object.assign(c, {
          firstName: draft.firstName,
          group: draft.group,
          consent: draft.consent,
          tags: tags
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          delivery: draft.delivery,
        });
        setContactStatus(s, w.id, contact.id, draft.status);
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Modal title={contact.firstName || "Contact details"} onClose={onClose}>
      <p>{phone(contact.phone)}</p>
      <ErrorNotice message={error} />
      <Field label="First name">
        <input
          value={draft.firstName}
          onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
        />
      </Field>
      <div className="form-grid">
        <Field label="Contact status">
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft({ ...draft, status: e.target.value as ContactStatus })
            }
          >
            {statuses.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label="Group">
          <input
            value={draft.group}
            onChange={(e) => setDraft({ ...draft, group: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Tags" hint="Separate tags with commas.">
        <input value={tags} onChange={(e) => setTags(e.target.value)} />
      </Field>
      <Field label="Opt-in source">
        <textarea
          value={draft.consent}
          onChange={(e) => setDraft({ ...draft, consent: e.target.value })}
        />
      </Field>
      <Field label="Delivery review (demo control)">
        <select
          value={draft.delivery || ""}
          onChange={(e) =>
            setDraft({
              ...draft,
              delivery: (e.target.value as Contact["delivery"]) || undefined,
            })
          }
        >
          <option value="">No delivery issue</option>
          <option>Temporarily unreachable</option>
          <option>Unknown handset</option>
        </select>
      </Field>
      {contact.customFields && (
        <dl>
          {Object.entries(contact.customFields).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {contact.duplicate && (
        <Notice>
          This is a duplicate import row. It is excluded from campaigns.
        </Notice>
      )}
      <p className="muted">
        Status updates apply to this phone number across the business. A Lead
        may receive individual replies but not campaigns.
      </p>
      <div className="actions">
        <Button onClick={save}>Save contact</Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

function newCampaign(w: Workspace): Campaign {
  return {
    id: uid(),
    name: "Untitled campaign",
    sender: w.numbers[0] || "",
    audience: "All contacts",
    text: "",
    fallback: "there",
    mode: "Now",
    scheduledAt: "",
    intervalDays: 7,
    remaining: 1,
    state: "Draft",
    createdAt: now(),
    recipients: [],
    runs: 0,
    credits: 0,
  };
}
export function Campaigns({ w }: { w: Workspace }) {
  const { mutate } = useStore();
  const [editing, setEditing] = useState<string | null>(null),
    [report, setReport] = useState<string | null>(null),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [campaignState, setCampaignState] = useState("All");
  const create = () => {
    try {
      const c = newCampaign(w);
      mutate((s) => saveCampaign(s, w.id, c));
      setEditing(c.id);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const current = w.campaigns.find((c) => c.id === editing),
    reportCampaign = w.campaigns.find((c) => c.id === report);
  const filtered = w.campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) &&
      (campaignState === "All" || c.state === campaignState),
  );
  return (
    <>
      <Heading
        title="Campaigns"
        subtitle="A thoughtful message, sent to the right people."
        action={
          <Button onClick={create}>
            <Plus size={17} /> Create campaign
          </Button>
        }
      />
      <ErrorNotice message={error} />
      {w.verification.status !== "Approved" && (
        <Notice>
          You can import contacts and draft campaigns now. Sending needs an
          assigned number, approved SMS verification, and enough credits.{" "}
          <Link href="/app/numbers/">Continue setup</Link>
        </Notice>
      )}
      <div className="panel">
        <div className="toolbar">
          <label className="search-input">
            <Search size={18} />
            <input
              aria-label="Search campaigns"
              placeholder="Search campaigns"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="Campaign status"
            value={campaignState}
            onChange={(e) => setCampaignState(e.target.value)}
          >
            {[
              "All",
              "Draft",
              "Scheduled",
              "Paused",
              "Completed",
              "Canceled",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <span className="muted">{count(w.campaigns.length)} campaigns</span>
        </div>
        {!w.campaigns.length ? (
          <Empty
            icon={<Send size={28} />}
            title="Start with something worth sharing."
            action={<Button onClick={create}>Create campaign</Button>}
          >
            A reminder, a new opening, or a seasonal offer. Draft first, then
            review your audience and cost.
          </Empty>
        ) : (
          <div className="table-wrap messaging-table">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Audience</th>
                  <th>When</th>
                  <th>Credits used</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <button
                        className="table-link"
                        onClick={() =>
                          c.state === "Draft"
                            ? setEditing(c.id)
                            : setReport(c.id)
                        }
                      >
                        {c.name}
                      </button>
                      <small>{c.sender || "No sender selected"}</small>
                    </td>
                    <td>
                      <Badge>{c.state}</Badge>
                    </td>
                    <td>{c.audience}</td>
                    <td>
                      {c.state === "Draft"
                        ? "Not scheduled"
                        : c.state === "Scheduled"
                          ? date(c.scheduledAt)
                          : `${c.runs} send${c.runs === 1 ? "" : "s"}`}
                      <small>
                        {c.mode === "Recurring"
                          ? `${c.remaining} occurrences remaining`
                          : c.mode === "Future"
                            ? "One-time schedule"
                            : ""}
                      </small>
                    </td>
                    <td>{count(c.credits)}</td>
                    <td>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          c.state === "Draft"
                            ? setEditing(c.id)
                            : setReport(c.id)
                        }
                      >
                        {c.state === "Draft" ? "Resume draft" : "View report"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const copy = {
                            ...structuredClone(c),
                            id: uid(),
                            name: c.name + " copy",
                            state: "Draft" as const,
                            createdAt: now(),
                            runs: 0,
                            credits: 0,
                            recipients: [],
                          };
                          mutate((s) => saveCampaign(s, w.id, copy));
                          setEditing(copy.id);
                        }}
                      >
                        Duplicate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <p className="empty">No matching campaigns.</p>
            )}
          </div>
        )}
      </div>
      {current && (
        <CampaignEditor
          w={w}
          campaign={current}
          onClose={() => setEditing(null)}
          onSent={() => {
            setReport(current.id);
            setEditing(null);
          }}
        />
      )}
      {reportCampaign && (
        <CampaignReport
          w={w}
          campaign={reportCampaign}
          onClose={() => setReport(null)}
        />
      )}
    </>
  );
}
function CampaignEditor({
  w,
  campaign: c,
  onClose,
  onSent,
}: {
  w: Workspace;
  campaign: Campaign;
  onClose: () => void;
  onSent: () => void;
}) {
  const { mutate } = useStore();
  const [step, setStep] = useState(0),
    [error, setError] = useState(""),
    [previewName, setPreviewName] = useState("Jamie"),
    [reviewed, setReviewed] = useState(false);
  const update = (patch: Partial<Campaign>) => {
    try {
      mutate((s) => saveCampaign(s, w.id, { ...c, ...patch }));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const audience = [
    ...new Set(w.contacts.flatMap((c) => [c.group, ...c.tags]).filter(Boolean)),
  ];
  const rows = recipients(w, c),
    eligible = rows.filter((r) => r.status !== "Excluded"),
    credits = estimatedCredits(rows),
    exclusions = rows.filter((r) => r.status === "Excluded");
  const reasons = [...new Set(exclusions.map((r) => r.reason))];
  const blocked = sendRequirements(w, credits);
  const preview = personalize(c.text, previewName, c.fallback);
  const proceed = () => {
    if (step === 0 && !c.name.trim()) {
      setError("Give this campaign a name.");
      return;
    }
    if (step === 2 && !c.text.trim()) {
      setError("Write your message before reviewing.");
      return;
    }
    setStep(step + 1);
    setError("");
  };
  const launch = () => {
    try {
      mutate((s) => services.messaging.launch(s, w.id, c.id));
      onSent();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const titles = ["Sender", "Audience", "Message", "Review & schedule"];
  return (
    <Modal title="Create campaign" onClose={onClose}>
      <div className="wizard-tabs" aria-label="Campaign progress">
        {titles.map((title, i) => (
          <button
            key={title}
            className={step === i ? "active" : ""}
            onClick={() => setStep(i)}
            aria-current={step === i ? "step" : undefined}
          >
            {title}
          </button>
        ))}
      </div>
      <ErrorNotice message={error} />
      {step === 0 ? (
        <>
          <Field label="Campaign name" hint="Only your team sees this name.">
            <input
              value={c.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </Field>
          <Field label="Sender number">
            <select
              value={c.sender}
              onChange={(e) => update({ sender: e.target.value })}
            >
              <option value="">Choose an assigned number</option>
              {w.numbers.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
          {!w.numbers.length && (
            <Notice>
              You can save this draft now and choose a number later.{" "}
              <Link href="/app/numbers/">Get a number</Link>
            </Notice>
          )}
        </>
      ) : step === 1 ? (
        <>
          <Field label="Audience">
            <select
              value={c.audience}
              onChange={(e) => update({ audience: e.target.value })}
            >
              <option>All contacts</option>
              {audience.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <p>
            Choose all contacts, a group, or a tag. Campaign eligibility is
            checked again at send time.
          </p>
          <div className="audience-summary">
            <strong>{eligible.length}</strong>
            <span>eligible recipients</span>
            <strong>{exclusions.length}</strong>
            <span>excluded rows</span>
          </div>
          {reasons.map((reason) => (
            <p className="reason-line" key={reason}>
              <span>{reason}</span>
              <b>{exclusions.filter((r) => r.reason === reason).length}</b>
            </p>
          ))}
          {!rows.length && (
            <Notice>
              There are no contacts in this audience.{" "}
              <Link href="/app/contacts/">Import contacts</Link> or save the
              draft for later.
            </Notice>
          )}
        </>
      ) : step === 2 ? (
        <>
          <div className="composer-layout">
            <div>
              <Field label="Message">
                <textarea
                  className="campaign-message"
                  value={c.text}
                  onChange={(e) => update({ text: e.target.value })}
                  placeholder="Hi {{first_name}}, we have a little news to share… Reply STOP to opt out."
                />
              </Field>
              <Button
                variant="ghost"
                onClick={() => update({ text: c.text + "{{first_name}}" })}
              >
                Insert first name
              </Button>
              <Field
                label="Fallback first name"
                hint="Used when the contact has no first name."
              >
                <input
                  value={c.fallback}
                  onChange={(e) => update({ fallback: e.target.value })}
                />
              </Field>
              <p className="muted">
                {c.text.length} characters before personalization. Long messages
                and Unicode may use more than one segment.
              </p>
            </div>
            <div className="phone-preview">
              <span>Message preview</span>
              <Field label="Preview first name">
                <input
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value)}
                  placeholder="Leave blank to test fallback"
                />
              </Field>
              <div className="bubble out">
                {preview || "Your message preview will appear here."}
              </div>
              <small>
                {messageEncoding(preview)} · {segments(preview)} segment
                {segments(preview) === 1 ? "" : "s"} for this preview
              </small>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="review-overview">
            <div>
              <b>{count(eligible.length)}</b>
              <span>Eligible recipients</span>
            </div>
            <div>
              <b>{count(exclusions.length)}</b>
              <span>Excluded rows</span>
            </div>
            <div>
              <b>{count(credits)}</b>
              <span>Estimated segments / credits</span>
            </div>
            <div>
              <b>{count(w.balance)}</b>
              <span>Available credits</span>
            </div>
          </div>
          <details open={exclusions.length > 0}>
            <summary>Audience details and exclusions</summary>
            <RecipientTable rows={rows} />
          </details>
          <Field label="When to send">
            <select
              value={c.mode}
              onChange={(e) =>
                update({
                  mode: e.target.value as Campaign["mode"],
                  remaining: e.target.value === "Recurring" ? 3 : 1,
                })
              }
            >
              <option value="Now">Send immediately</option>
              <option value="Future">Schedule once</option>
              <option value="Recurring">Recurring schedule</option>
            </select>
          </Field>
          {c.mode !== "Now" && (
            <>
              <Field label="Schedule time zone">
                <select
                  value={c.timeZone || "UTC"}
                  onChange={(e) => update({ timeZone: e.target.value })}
                >
                  {timeZones.map((z) => (
                    <option key={z}>{z}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="First send date and time"
                hint={
                  "Time zone: " +
                  (c.timeZone || "UTC") +
                  ". Recurrences use elapsed 24-hour days."
                }
              >
                <input
                  type="datetime-local"
                  value={
                    c.scheduledAt
                      ? wallTime(c.scheduledAt, c.timeZone || "UTC")
                      : ""
                  }
                  onChange={(e) => {
                    try {
                      update({
                        scheduledAt: e.target.value
                          ? scheduleInstant(e.target.value, c.timeZone || "UTC")
                          : "",
                      });
                    } catch (err) {
                      setError((err as Error).message);
                    }
                  }}
                />
              </Field>
            </>
          )}
          {c.mode === "Recurring" && (
            <div className="form-grid">
              <Field label="Repeat every">
                <select
                  value={c.intervalDays}
                  onChange={(e) => update({ intervalDays: +e.target.value })}
                >
                  <option value={1}>Day</option>
                  <option value={7}>Week</option>
                  <option value={14}>Two weeks</option>
                  <option value={30}>30 days</option>
                </select>
              </Field>
              <Field label="Number of occurrences">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={c.remaining}
                  onChange={(e) => update({ remaining: +e.target.value })}
                />
              </Field>
            </div>
          )}
          {c.mode !== "Now" && (
            <Notice>
              Demo scheduling runs while this prototype is open. Each occurrence
              rechecks opt-outs, verification and balance. Credits are deducted
              when it runs.
            </Notice>
          )}
          {blocked.length > 0 && (
            <Notice>
              {blocked.map((x) => (
                <p key={x}>{x}</p>
              ))}
            </Notice>
          )}
          <p className="muted">
            Sender: {c.sender || "Not selected"}. Credits cover attempted
            message segments; temporarily unreachable contacts may produce a
            failed delivery result. No real messages are sent.
          </p>
        </>
      )}
      {step === 3 && (
        <label className="compliance-confirmation">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
          />{" "}
          I reviewed consent, excluded recipients, sender and estimated usage.
        </label>
      )}
      <div className="wizard-footer">
        <Button variant="ghost" onClick={onClose}>
          Save draft & close
        </Button>
        <div className="actions">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={proceed}>
              Continue <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              disabled={
                !reviewed ||
                blocked.length > 0 ||
                !eligible.length ||
                !c.text.trim() ||
                !c.sender
              }
              onClick={launch}
            >
              {c.mode === "Now" ? "Confirm simulated send" : "Confirm schedule"}
            </Button>
          )}
        </div>
      </div>
      <p className="muted">
        Illustrative estimated cost: {money(Math.ceil(credits * 1.5))} at $0.015
        per segment, excluding carrier and number charges. Final pricing may
        differ.
      </p>
      <small className="muted">
        Draft changes are saved automatically in this browser.
      </small>
    </Modal>
  );
}
function RecipientTable({ rows }: { rows: Recipient[] }) {
  return (
    <div className="table-wrap messaging-table recipient-table">
      <table>
        <thead>
          <tr>
            <th>Recipient</th>
            <th>Status</th>
            <th>Reason / message</th>
            <th>Segments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                {r.name}
                <small>{phone(r.phone)}</small>
              </td>
              <td>
                <Badge>{r.status}</Badge>
              </td>
              <td>{r.reason || r.text || "Ready to send"}</td>
              <td>{r.segments}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="muted">No recipients in this category.</p>}
    </div>
  );
}
function CampaignReport({
  w,
  campaign: c,
  onClose,
}: {
  w: Workspace;
  campaign: Campaign;
  onClose: () => void;
}) {
  const { mutate } = useStore();
  const [filter, setFilter] = useState("All"),
    [error, setError] = useState("");
  const [canceling, setCanceling] = useState(false);
  const labels = ["Queued", "Sent", "Delivered", "Failed", "Excluded"];
  const matching = (r: Recipient, label: string) =>
    label === "All" ||
    (label === "Sent"
      ? ["Sent", "Delivered", "Failed"].includes(r.status)
      : r.status === label);
  const run = () => {
    try {
      mutate((s) => deliverCampaign(s, w.id, c.id));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const toggle = () => {
    try {
      mutate((s) => {
        const item = workspace(s, w.id).campaigns.find((x) => x.id === c.id)!;
        if (item.state === "Scheduled") {
          item.state = "Paused";
          activity(workspace(s, w.id), "Campaign paused", item.name);
        } else {
          item.state = "Scheduled";
          if (new Date(item.scheduledAt).getTime() <= Date.now())
            item.scheduledAt = new Date(Date.now() + 60000).toISOString();
          activity(workspace(s, w.id), "Campaign resumed", item.name);
        }
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Modal title={c.name} onClose={onClose}>
      <div className="actions">
        <Badge>{c.state}</Badge>
        <span className="muted">{c.sender}</span>
      </div>
      <ErrorNotice message={error} />
      <div className="report-counts">
        {labels.map((label) => (
          <button
            className={filter === label ? "active" : ""}
            key={label}
            onClick={() => setFilter(label)}
            aria-pressed={filter === label}
          >
            <b>
              {count(c.recipients.filter((r) => matching(r, label)).length)}
            </b>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="muted">
        Sent counts all attempted recipients, including delivered and failed
        messages. Report shows the latest occurrence; {count(c.credits)} credits
        used across {c.runs} occurrence{c.runs === 1 ? "" : "s"}.
      </p>
      <Button
        variant="secondary"
        onClick={() =>
          downloadCSV("campaign-report.csv", [
            ["Name", "Phone", "Status", "Reason", "Segments"],
            ...c.recipients.map((r) => [
              r.name,
              r.phone,
              r.status,
              r.reason,
              r.segments,
            ]),
          ])
        }
      >
        Download delivery report
      </Button>
      <Button variant="ghost" onClick={() => setFilter("All")}>
        Show all recipients
      </Button>
      <RecipientTable rows={c.recipients.filter((r) => matching(r, filter))} />
      {["Scheduled", "Paused"].includes(c.state) && (
        <div className="schedule-controls">
          <p>
            <Calendar size={16} /> Next scheduled: {date(c.scheduledAt)}
            {c.mode === "Recurring"
              ? `; ${c.remaining} occurrences remaining`
              : ""}
          </p>
          <div className="actions">
            <Button variant="secondary" onClick={toggle}>
              {c.state === "Scheduled" ? "Pause schedule" : "Resume schedule"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                mutate((s) => {
                  workspace(s, w.id).campaigns.find(
                    (x) => x.id === c.id,
                  )!.state = "Draft";
                });
                onClose();
              }}
            >
              Return to draft to edit
            </Button>
            <Button variant="danger" onClick={() => setCanceling(true)}>
              Cancel campaign
            </Button>
            {canceling && (
              <div role="group" aria-label="Confirm cancellation">
                <p>
                  Cancel future occurrences? Existing delivery history remains.
                </p>
                <Button
                  variant="danger"
                  onClick={() => {
                    mutate((s) => {
                      const v = workspace(s, w.id);
                      v.campaigns.find((x) => x.id === c.id)!.state =
                        "Canceled";
                      activity(v, "Campaign canceled", c.name);
                    });
                    setCanceling(false);
                  }}
                >
                  Confirm cancellation
                </Button>
                <Button variant="ghost" onClick={() => setCanceling(false)}>
                  Keep campaign
                </Button>
              </div>
            )}
            {c.state === "Scheduled" && (
              <Button onClick={run}>Run next occurrence now (demo)</Button>
            )}
          </div>
          <small>
            Timing controls simulate a provider. No real message will be sent.
          </small>
        </div>
      )}
    </Modal>
  );
}

export function InboxScreen({ w }: { w: Workspace }) {
  const { mutate } = useStore();
  const [selected, setSelected] = useState<string | null>(null),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [numberFilter, setNumberFilter] = useState("All numbers"),
    [employeeFilter, setEmployeeFilter] = useState("All employees"),
    [sender, setSender] = useState(w.numbers[0] || ""),
    [error, setError] = useState(""),
    [newThread, setNewThread] = useState(false),
    [incomingText, setIncomingText] = useState("Thanks! That sounds good.");
  const thread = w.threads.find((t) => t.id === selected),
    contact = w.contacts.find((c) => c.id === thread?.contactId);
  const list = w.threads
    .filter((t) => {
      const c = w.contacts.find((c) => c.id === t.contactId);
      return (
        `${c?.firstName || ""} ${c?.phone || ""} ${t.messages.at(-1)?.text || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "All" ||
          (filter === "Unread" ? t.unread : t.state === filter)) &&
        (employeeFilter === "All employees" ||
          (t.assignee || "Unassigned") === employeeFilter) &&
        (numberFilter === "All numbers" ||
          t.messages.some((m) => m.number === numberFilter))
      );
    })
    .sort((a, b) =>
      (b.messages.at(-1)?.at || "").localeCompare(a.messages.at(-1)?.at || ""),
    );
  const select = (id: string) => {
    setSelected(id);
    setError("");
    try {
      mutate((s) => {
        const t = workspace(s, w.id).threads.find((t) => t.id === id);
        if (t) t.unread = false;
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const updateDraft = (value: string) => {
    if (!thread) return;
    try {
      mutate((s) => {
        workspace(s, w.id).threads.find((t) => t.id === thread.id)!.draft =
          value;
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const send = () => {
    if (!contact || !thread) return;
    try {
      mutate((s) =>
        services.messaging.reply(s, w.id, contact.id, thread.draft, sender),
      );
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const receive = (text: string) => {
    if (!contact) return;
    try {
      if (!text.trim()) throw Error("Enter an incoming message to simulate.");
      mutate((s) =>
        services.messaging.incoming(s, w.id, contact.id, text, sender),
      );
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const toggleState = () => {
    if (!thread) return;
    mutate((s) => {
      const t = workspace(s, w.id).threads.find((t) => t.id === thread.id)!;
      t.state = t.state === "Open" ? "Closed" : "Open";
    });
  };
  const createThread = (contactId: string) => {
    try {
      const id = mutate((s) => {
        const current = workspace(s, w.id);
        let t = current.threads.find((t) => t.contactId === contactId);
        if (!t) {
          t = {
            id: uid(),
            contactId,
            state: "Open",
            unread: false,
            draft: "",
            messages: [],
          };
          current.threads.push(t);
        }
        return t.id;
      });
      setNewThread(false);
      select(id);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const prohibited =
    contact &&
    w.contacts.some(
      (c) =>
        normalizePhone(c.phone) === normalizePhone(contact.phone) &&
        ["Invalid number", "Opted out"].includes(c.status),
    );
  return (
    <>
      <Heading
        title="Inbox"
        subtitle="Every reply, together with your team."
        action={
          <Button onClick={() => setNewThread(true)}>
            <Plus size={17} /> New conversation
          </Button>
        }
      />
      <div
        className={`inbox-workspace panel ${selected ? "has-selection" : ""}`}
      >
        <aside className="inbox-list">
          <div className="inbox-filters">
            <label className="search-input">
              <Search size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
              />
            </label>
            <div className="form-grid">
              <select
                aria-label="Conversation state"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {["All", "Unread", "Open", "Closed"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <select
                aria-label="Filter sender number"
                value={numberFilter}
                onChange={(e) => setNumberFilter(e.target.value)}
              >
                <option>All numbers</option>
                {w.numbers.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <select
            aria-label="Filter employee"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option>All employees</option>
            <option>Unassigned</option>
            <option>{w.email}</option>
            {w.members
              .filter((m) => m.email !== w.email)
              .map((m) => (
                <option key={m.id}>{m.email}</option>
              ))}
          </select>
          <div className="conversation-list">
            {list.map((t) => {
              const c = w.contacts.find((c) => c.id === t.contactId);
              return (
                <button
                  key={t.id}
                  className={`conversation-item ${selected === t.id ? "active" : ""} ${t.unread ? "unread" : ""}`}
                  onClick={() => select(t.id)}
                >
                  <span className="contact-avatar">
                    {(c?.firstName || "?").slice(0, 2).toUpperCase()}
                  </span>
                  <span>
                    <span className="conversation-name">
                      {c?.firstName || "Unnamed contact"}
                      {t.unread && <span className="unread-label">Unread</span>}
                    </span>
                    <span className="message-excerpt">
                      {t.messages.at(-1)?.text || t.draft || "New conversation"}
                    </span>
                    <small>
                      {t.state} / {date(t.messages.at(-1)?.at)}
                    </small>
                  </span>
                </button>
              );
            })}
            {!list.length && (
              <div className="small-empty">
                <Inbox size={24} />
                <p>
                  {w.threads.length
                    ? "No matching conversations."
                    : "No conversations yet."}
                </p>
                <span>Start a conversation or simulate a reply.</span>
              </div>
            )}
          </div>
        </aside>
        <section className="inbox-detail">
          {!thread || !contact ? (
            <Empty
              icon={<MessageSquare size={30} />}
              title="Make room for a good conversation."
              action={
                <Button variant="secondary" onClick={() => setNewThread(true)}>
                  Choose a contact
                </Button>
              }
            >
              Open a conversation to see messages, reply as a team, or simulate
              a customer response.
            </Empty>
          ) : (
            <>
              <header className="thread-header">
                <Button
                  className="back-to-conversations"
                  variant="ghost"
                  onClick={() => setSelected(null)}
                >
                  Back
                </Button>
                <div>
                  <h2>{contact.firstName || "Unnamed contact"}</h2>
                  <small>
                    {phone(contact.phone)} <Badge>{contact.status}</Badge>
                  </small>
                </div>
                <Button variant="secondary" onClick={toggleState}>
                  {thread.state === "Open" ? "Archive conversation" : "Reopen"}
                </Button>
              </header>
              <InboxTools w={w} thread={thread} onReply={updateDraft} />
              <div className="thread-messages" aria-live="polite">
                {thread.messages.length === 0 && (
                  <p className="muted">
                    No messages yet. Your draft is saved as you type.
                  </p>
                )}
                {thread.messages.map((m) => (
                  <div key={m.id} className={`message-entry ${m.direction}`}>
                    <div className={`bubble ${m.direction}`}>{m.text}</div>
                    <small>
                      {date(m.at)} / {m.status}
                      <br />
                      {m.direction === "out" ? "From" : "To"} {m.number}
                    </small>
                  </div>
                ))}
              </div>
              <div className="reply-composer">
                <ErrorNotice message={error} />
                {prohibited && (
                  <Notice>
                    This contact cannot receive messages. Opt-outs apply to
                    every number in this business.
                  </Notice>
                )}
                {contact.status === "Lead" && (
                  <p className="muted">
                    Lead: individual replies are allowed; campaigns are
                    excluded.
                  </p>
                )}
                <Field label="Reply from">
                  <select
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                  >
                    <option value="">Choose an assigned number</option>
                    {w.numbers.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Your reply">
                  <textarea
                    value={thread.draft}
                    onChange={(e) => updateDraft(e.target.value)}
                    placeholder="Write a thoughtful reply…"
                  />
                </Field>
                <div className="reply-send">
                  <small>
                    {segments(thread.draft)} credit
                    {segments(thread.draft) === 1 ? "" : "s"} estimated /{" "}
                    {count(w.balance)} available
                  </small>
                  <Button
                    disabled={!!prohibited || !thread.draft.trim()}
                    onClick={send}
                  >
                    <Send size={16} /> Send reply (demo)
                  </Button>
                </div>
                <details className="incoming-simulator">
                  <summary>Simulate a customer message</summary>
                  <Field label="Incoming message">
                    <input
                      value={incomingText}
                      onChange={(e) => setIncomingText(e.target.value)}
                    />
                  </Field>
                  <div className="actions">
                    <Button
                      variant="secondary"
                      onClick={() => receive(incomingText)}
                    >
                      Receive message
                    </Button>
                    <Button variant="ghost" onClick={() => receive("STOP")}>
                      Receive STOP
                    </Button>
                  </div>
                  <small>
                    STOP updates opt-out status across this business’s numbers.
                  </small>
                </details>
              </div>
            </>
          )}
        </section>
      </div>
      {newThread && (
        <Modal title="Choose a contact" onClose={() => setNewThread(false)}>
          {!w.contacts.length ? (
            <Empty
              title="Add your first contact"
              action={
                <Link className="btn primary" href="/app/contacts/">
                  Open contacts
                </Link>
              }
            >
              Import contacts before starting a conversation.
            </Empty>
          ) : (
            <div className="new-conversation-list">
              {w.contacts
                .filter((c) => !c.duplicate)
                .map((c) => (
                  <button key={c.id} onClick={() => createThread(c.id)}>
                    <span>
                      {c.firstName || "Unnamed contact"}
                      <small>{phone(c.phone)}</small>
                    </span>
                    <Badge>{c.status}</Badge>
                  </button>
                ))}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
