"use client";
import { applyAdminAction } from "@/frontend/admin-actions";
import {
  AdminPreferences,
  AdminModule,
  AdminOverviewExtras,
  CustomerOperations,
} from "@/frontend/admin";
import Link from "./navigation";
import { useState, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "./navigation";
import { useStore } from "@/lib/store";
import { money, count, date, type Pricing } from "@/lib/config";
import { services } from "@/lib/services";
import {
  availableNumbers,
  type Workspace,
  type State,
  type Receipt,
  type Fields,
} from "@/lib/model";
import {
  Heading,
  Modal,
  Button,
  Badge,
  Field,
  Empty,
  Notice,
  ReceiptView,
  Search,
  Users,
  Phone,
  ShieldCheck,
  CreditCard,
  Send,
  ChevronRight,
  Plus,
  X,
} from "./ui";

const customerTitle = (w: Workspace) =>
  w.verification.fields.business || "Business not added";
const fieldLabels: Record<keyof Fields, string> = {
  business: "Business name",
  contactName: "Contact name",
  contactEmail: "Contact email",
  contactPhone: "Business contact phone",
  website: "Website",
  use: "Intended SMS use",
  volume: "Estimated volume",
  sample: "Sample message",
  consent: "How recipients give consent",
};
const filters = [
  "All customers",
  "Signed up only",
  "Number assigned",
  "Verification draft",
  "Awaiting review",
  "Changes needed",
  "Approved",
  "First message sent",
];
function matchesFilter(w: Workspace, filter: string) {
  return (
    filter === "All customers" ||
    (filter === "Signed up only" &&
      w.numbers.length === 0 &&
      w.verification.status === "Not started" &&
      !w.activity.some((e) => e.name === "Credits purchased")) ||
    (filter === "Number assigned" && w.numbers.length > 0) ||
    (filter === "Verification draft" && w.verification.status === "Draft") ||
    (filter === "Awaiting review" && w.verification.status === "In review") ||
    (filter === "Changes needed" &&
      w.verification.status === "Changes needed") ||
    (filter === "Approved" && w.verification.status === "Approved") ||
    (filter === "First message sent" && !!w.firstSentAt)
  );
}
function paymentState(s: State, id: string) {
  const records = [
    ...s.receipts.filter((r) => r.workspaceId === id),
    ...s.attempts.filter((r) => r.workspaceId === id),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return records[0]?.status || "No payment";
}
function SearchBox({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label className="admin-search">
      <Search size={18} />
      <input
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function CustomerLink({ w, children }: { w: Workspace; children?: ReactNode }) {
  return (
    <Link className="admin-customer-link" href={`/admin/?customer=${w.id}`}>
      {children || w.email}
    </Link>
  );
}
function PersonCell({ w }: { w: Workspace }) {
  return (
    <div className="admin-person">
      <span className="admin-avatar">
        {(w.verification.fields.business || w.email).slice(0, 2).toUpperCase()}
      </span>
      <span>
        <CustomerLink w={w} />
        <small>
          {customerTitle(w)}
          {w.isDemo ? " (demo workspace)" : ""}
        </small>
      </span>
    </div>
  );
}
function Metric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: ReactNode;
}) {
  return (
    <div className="admin-metric">
      <span>
        {label}
        {icon}
      </span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export function AdminScreen({ section }: { section: string }) {
  const search = useSearchParams();
  const id = search.get("customer");
  if ((!section || section === "customers") && id)
    return <CustomerDetail key={id} id={id} />;
  switch (section) {
    case "overview":
      return <AdminOverview />;
    case "users":
      return <AdminUsers />;
    case "verification":
      return <VerificationQueue />;
    case "numbers":
      return <AdminNumbers />;
    case "payments":
      return <AdminPayments />;
    case "settings":
      return <PricingSettings />;
    default:
      return section === "customers" ? (
        <Customers />
      ) : (
        <AdminModule key={section} section={section} />
      );
  }
}
function Customers() {
  const { state } = useStore();
  const params = useSearchParams();
  const initialFilter = params.get("stage") || "All customers";
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState(
      filters.includes(initialFilter) ? initialFilter : "All customers",
    );
  const customers = state.workspaces
    .filter(
      (w) =>
        matchesFilter(w, filter) &&
        `${w.email} ${customerTitle(w)} ${w.numbers.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pending = state.workspaces.filter(
    (w) => w.verification.status === "In review",
  ).length;
  return (
    <>
      <Heading
        title="Customers"
        subtitle="See every business, from first signup to first message."
        action={
          <Link href="/admin/verification/" className="btn secondary">
            <ShieldCheck size={17} />
            Review verification{pending ? ` (${pending})` : ""}
          </Link>
        }
      />
      <div className="admin-metrics">
        <Metric
          label="Registered businesses"
          value={count(state.workspaces.length)}
          detail="Includes email-only registrations"
          icon={<Users size={18} />}
        />
        <Metric
          label="Numbers assigned"
          value={count(
            state.workspaces.reduce((n, w) => n + w.numbers.length, 0),
          )}
          detail="One-time purchases"
          icon={<Phone size={18} />}
        />
        <Metric
          label="Awaiting review"
          value={count(pending)}
          detail="Ready for a demo provider decision"
          icon={<ShieldCheck size={18} />}
        />
        <Metric
          label="Started sending"
          value={count(state.workspaces.filter((w) => w.firstSentAt).length)}
          detail="First outgoing message recorded"
          icon={<Send size={18} />}
        />
      </div>
      <div className="panel admin-directory">
        <div className="admin-table-toolbar">
          <SearchBox
            value={query}
            onChange={setQuery}
            label="Search email, business, or number"
          />
          <label className="admin-filter">
            Stage
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {filters.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="admin-result-count">
          {count(customers.length)}{" "}
          {customers.length === 1 ? "customer" : "customers"}
          {filter !== "All customers" ? ` · ${filter}` : ""}
        </div>
        {customers.length ? (
          <div className="table-wrap">
            <table className="admin-customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Assigned number</th>
                  <th>Verification</th>
                  <th>Billing</th>
                  <th>Credits</th>
                  <th>Last activity</th>
                  <th>
                    <span className="sr-only">Open customer</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <PersonCell w={w} />
                    </td>
                    <td>
                      {w.numbers[0] || (
                        <span className="muted">Unassigned</span>
                      )}
                      {w.numbers.length > 1 && (
                        <small>+{w.numbers.length - 1} more</small>
                      )}
                    </td>
                    <td>
                      <Badge>{w.verification.status}</Badge>
                    </td>
                    <td>
                      <span>Pay as you go</span>
                      <small>
                        <Badge>{paymentState(state, w.id)}</Badge>
                      </small>
                    </td>
                    <td className="admin-numeric">{count(w.balance)}</td>
                    <td>
                      {date(w.lastActivity)}
                      {w.firstSentAt && <small>First message sent</small>}
                    </td>
                    <td>
                      <Link
                        className="icon-button"
                        aria-label={`Open ${w.email}`}
                        href={`/admin/?customer=${w.id}`}
                      >
                        <ChevronRight size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            icon={<Users />}
            title={
              state.workspaces.length
                ? "No matching customers"
                : "Your first signup will appear here"
            }
            action={
              state.workspaces.length ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setFilter("All customers");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Link className="btn primary" href="/signup/">
                  Try customer signup
                </Link>
              )
            }
          >
            {state.workspaces.length
              ? "Try a different search or stage."
              : "A customer is listed as soon as their email is confirmed, even before they add a business name."}
          </Empty>
        )}
      </div>
    </>
  );
}
function CustomerDetail({ id }: { id: string }) {
  const { state, mutate } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const requestedTab = params.get("tab");
  const [tab, setTab] = useState(
    requestedTab === "verification"
      ? "Verification"
      : requestedTab === "billing"
        ? "Billing"
        : requestedTab === "activity"
          ? "Activity"
          : "Profile & users",
  );
  useEffect(() => {
    setTab(
      requestedTab === "verification"
        ? "Verification"
        : requestedTab === "billing"
          ? "Billing"
          : requestedTab === "activity"
            ? "Activity"
            : "Profile & users",
    );
  }, [requestedTab]);
  const w = state.workspaces.find((w) => w.id === id);
  if (!w)
    return (
      <Empty
        title="Customer not found"
        action={
          <Link className="btn secondary" href="/admin/">
            Back to customers
          </Link>
        }
      >
        This customer is not available in this browser’s demo data.
      </Empty>
    );
  return (
    <>
      <Link className="admin-back" href="/admin/">
        Back to customers
      </Link>
      <Heading
        title={w.verification.fields.business || "New customer"}
        subtitle={w.email}
        action={
          <Button
            variant="secondary"
            onClick={() => {
              mutate((s) => {
                s.activeId = id;
              });
              router.push("/app/");
            }}
          >
            Open customer workspace
          </Button>
        }
      />
      <div className="admin-customer-summary">
        <span>
          <small>Registered</small>
          <b>{date(w.createdAt)}</b>
        </span>
        <span>
          <small>Account email</small>
          <Badge>Verified</Badge>
        </span>
        <span>
          <small>SMS verification</small>
          <Badge>{w.verification.status}</Badge>
        </span>
        <span>
          <small>First message</small>
          <b>{w.firstSentAt ? date(w.firstSentAt) : "Not sent yet"}</b>
        </span>
      </div>
      <nav className="admin-tabs" aria-label="Customer detail sections">
        {["Profile & users", "Verification", "Billing", "Activity"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => {
              setTab(t);
              router.replace(
                `/admin/?customer=${w.id}&tab=${t === "Profile & users" ? "profile" : t.toLowerCase()}`,
                { scroll: false },
              );
            }}
            aria-current={tab === t ? "page" : undefined}
          >
            {t}
          </button>
        ))}
      </nav>
      {tab === "Profile & users" && (
        <>
          <div className="admin-detail-grid">
            <section className="panel">
              <h2>Business profile</h2>
              <dl className="admin-definitions">
                {(
                  [
                    "business",
                    "contactName",
                    "contactEmail",
                    "contactPhone",
                    "website",
                  ] as (keyof Fields)[]
                ).map((key) => (
                  <div key={key}>
                    <dt>{fieldLabels[key]}</dt>
                    <dd>{w.verification.fields[key] || "Not provided yet"}</dd>
                  </div>
                ))}
                <div>
                  <dt>Workspace owner email</dt>
                  <dd>{w.email}</dd>
                </div>
                <div>
                  <dt>Registration date</dt>
                  <dd>{new Date(w.createdAt).toLocaleString()}</dd>
                </div>
              </dl>
            </section>
            <section className="panel">
              <h2>Assigned messaging numbers</h2>
              <p className="muted">
                These toll-free numbers send messages. The business contact
                phone above is a separate record.
              </p>
              {w.numbers.length ? (
                <ul className="admin-number-list">
                  {w.numbers.map((n) => (
                    <li key={n}>
                      <Phone size={18} />
                      <div>
                        <b>{n}</b>
                        <small>
                          First rental period preview. Recurring billing is not
                          connected.
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No messaging number assigned.</p>
              )}
              <h3>Workspace type</h3>
              <p>
                {w.isDemo
                  ? "Fictional example workspace"
                  : "Email-registered prototype workspace"}
              </p>
            </section>
          </div>
          <section className="panel admin-section">
            <h2>Users in this workspace</h2>
            <MemberTable w={w} />
          </section>
        </>
      )}
      <CustomerOperations w={w} />
      {tab === "Verification" && <VerificationDetail w={w} />}
      {tab === "Billing" && <CustomerBilling w={w} />}
      {tab === "Activity" && (
        <section className="panel">
          <h2>Customer activity</h2>
          <p className="muted">
            A shared timeline of customer actions and simulated provider
            decisions.
          </p>
          <ActivityTimeline w={w} />
        </section>
      )}
    </>
  );
}
function MemberTable({ w }: { w: Workspace }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {w.members.map((m) => (
            <tr key={m.id}>
              <td>{m.email}</td>
              <td>{m.role}</td>
              <td>
                <Badge>{m.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function VerificationDetail({ w }: { w: Workspace }) {
  const { mutate } = useStore();
  const [field, setField] = useState<keyof Fields>("consent");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const v = w.verification;
  function decide(approved: boolean) {
    setError("");
    try {
      mutate((s) =>
        services.verification.decide(s, w.id, approved, field, note),
      );
      setNote("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="admin-detail-grid">
      <section className="panel">
        <div className="admin-title-row">
          <h2>Verification application</h2>
          <Badge>{v.status}</Badge>
        </div>
        <dl className="admin-definitions admin-dates">
          <div>
            <dt>Started</dt>
            <dd>{date(v.startedAt)}</dd>
          </div>
          <div>
            <dt>Draft last saved</dt>
            <dd>{date(v.savedAt)}</dd>
          </div>
          <div>
            <dt>Last submitted</dt>
            <dd>{date(v.submittedAt)}</dd>
          </div>
          <div>
            <dt>Assigned toll-free number</dt>
            <dd>{w.numbers.join(", ") || "Unassigned"}</dd>
          </div>
        </dl>
        {v.status === "Not started" ? (
          <p>
            The customer has confirmed their email but has not opened the
            verification application.
          </p>
        ) : (
          <dl className="admin-application">
            {Object.entries(fieldLabels).map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  {v.fields[key as keyof Fields] || (
                    <span className="muted">Not entered yet</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
      <div>
        <section className="panel">
          <h2>Demo provider decision</h2>
          <p className="muted">
            These controls simulate a verification provider. They do not submit
            to a live carrier.
          </p>
          {v.status === "In review" ? (
            <>
              <Button onClick={() => decide(true)}>
                <ShieldCheck size={17} />
                Simulate approval
              </Button>
              <div className="admin-correction">
                <h3>Request a correction</h3>
                <Field label="Field to correct">
                  <select
                    value={field}
                    onChange={(e) => setField(e.target.value as keyof Fields)}
                  >
                    {Object.entries(fieldLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="What needs to change?">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Explain exactly what the customer should add or correct."
                    rows={4}
                  />
                </Field>
                <Button
                  variant="secondary"
                  disabled={!note.trim()}
                  onClick={() => decide(false)}
                >
                  Simulate changes needed
                </Button>
              </div>
            </>
          ) : (
            <p>
              {v.status === "Changes needed"
                ? "Waiting for the customer to correct and resubmit."
                : v.status === "Approved"
                  ? "This application has been approved in the prototype."
                  : "The customer needs to submit an application before a provider decision can be simulated."}
            </p>
          )}
          {error && <Notice tone="error">{error}</Notice>}
          {v.correction && (
            <Notice>
              <b>{fieldLabels[v.correction.field]}</b>
              <p>{v.correction.text}</p>
            </Notice>
          )}
        </section>
        <section className="panel admin-section">
          <h2>Submission history</h2>
          {v.history.length ? (
            <div className="admin-history">
              {[...v.history].reverse().map((h, i) => (
                <details key={`${h.at}-${i}`}>
                  <summary>
                    <b>{h.kind}</b>
                    <small>{date(h.at)}</small>
                  </summary>
                  {h.note && <p>{h.note}</p>}
                  <dl className="admin-application">
                    {Object.entries(fieldLabels).map(([key, label]) => (
                      <div key={key}>
                        <dt>{label}</dt>
                        <dd>{h.fields[key as keyof Fields] || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ))}
            </div>
          ) : (
            <p className="muted">
              No submissions yet. Saved drafts remain visible in the
              application.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
function CustomerBilling({ w }: { w: Workspace }) {
  const { state } = useStore();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const records = state.receipts
    .filter((r) => r.workspaceId === w.id)
    .sort((a, b) => b.at.localeCompare(a.at));
  const last = records[0];
  return (
    <>
      <div className="admin-metrics">
        <Metric
          label="Credit balance"
          value={count(w.balance)}
          detail="Available for messaging"
          icon={<CreditCard size={18} />}
        />
        <Metric
          label="Total paid"
          value={money(records.reduce((n, r) => n + r.totalCents, 0))}
          detail="Simulated payments only"
          icon={<CreditCard size={18} />}
        />
        <Metric
          label="Billing type"
          value="Pay as you go"
          detail="No renewal scheduled"
          icon={<CreditCard size={18} />}
        />
        <Metric
          label="Last payment"
          value={last ? money(last.totalCents) : "No payment"}
          detail={last ? date(last.at) : "No purchases yet"}
          icon={<CreditCard size={18} />}
        />
      </div>
      <section className="panel">
        <h2>Purchases & receipts</h2>
        <ReceiptTable records={records} showReceipt={setReceipt} />
        <h3 className="admin-section">Payment attempts</h3>
        <Attempts workspaceId={w.id} />
      </section>
      {receipt && (
        <ReceiptView receipt={receipt} onClose={() => setReceipt(null)} />
      )}
    </>
  );
}
function ReceiptTable({
  records,
  showReceipt,
  showCustomer = false,
}: {
  records: Receipt[];
  showReceipt: (r: Receipt) => void;
  showCustomer?: boolean;
}) {
  const { state } = useStore();
  return records.length ? (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            {showCustomer && <th>Customer</th>}
            <th>Purchase</th>
            <th>Credits</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const w = state.workspaces.find((w) => w.id === r.workspaceId);
            return (
              <tr key={r.id}>
                <td>{date(r.at)}</td>
                {showCustomer && (
                  <td>{w ? <CustomerLink w={w} /> : r.workspaceId}</td>
                )}
                <td>
                  {r.lines.map((l, i) => (
                    <span className="admin-line-item" key={i}>
                      {l.quantity} × {l.label}
                      <small>{money(l.unitCents)} each at purchase</small>
                    </span>
                  ))}
                </td>
                <td>{count(r.totalCredits)}</td>
                <td>{money(r.totalCents)}</td>
                <td>
                  <Badge>{r.status}</Badge>
                </td>
                <td>
                  <Button variant="ghost" onClick={() => showReceipt(r)}>
                    View receipt
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty title="No purchases yet">
      Completed simulated purchases will appear here with their original prices.
    </Empty>
  );
}
function Attempts({ workspaceId }: { workspaceId?: string }) {
  const { state } = useStore();
  const attempts = state.attempts
    .filter((a) => !workspaceId || a.workspaceId === workspaceId)
    .sort((a, b) => b.at.localeCompare(a.at));
  return attempts.length ? (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Purchase</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a.id}>
              <td>{date(a.at)}</td>
              <td>{a.kind}</td>
              <td>{money(a.totalCents)}</td>
              <td>
                <Badge>{a.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="muted">No failed or canceled payment attempts.</p>
  );
}
function ActivityTimeline({ w }: { w: Workspace }) {
  return (
    <ol className="admin-timeline">
      {[...w.activity]
        .sort((a, b) => b.at.localeCompare(a.at))
        .map((e) => (
          <li key={e.id}>
            <span className="admin-event-mark" />
            <div>
              <b>{e.name}</b>
              {e.detail && <p>{e.detail}</p>}
              <time dateTime={e.at}>{new Date(e.at).toLocaleString()}</time>
            </div>
          </li>
        ))}
    </ol>
  );
}
function AdminOverview() {
  const { state } = useStore();
  const events = state.workspaces
    .flatMap((w) => w.activity.map((e) => ({ ...e, w })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 15);
  return (
    <>
      <Heading
        title="Platform overview"
        subtitle="A current picture of the businesses using your prototype."
      />
      <div className="admin-metrics">
        <Metric
          label="Customers"
          value={count(state.workspaces.length)}
          detail="All email-confirmed workspaces"
          icon={<Users size={18} />}
        />
        <Metric
          label="Approved businesses"
          value={count(
            state.workspaces.filter((w) => w.verification.status === "Approved")
              .length,
          )}
          icon={<ShieldCheck size={18} />}
        />
        <Metric
          label="Simulated revenue"
          value={money(state.receipts.reduce((n, r) => n + r.totalCents, 0))}
          detail="No real money collected"
          icon={<CreditCard size={18} />}
        />
        <Metric
          label="Outgoing messages"
          value={count(
            state.workspaces.reduce(
              (n, w) =>
                n +
                w.threads.reduce(
                  (n, t) =>
                    n + t.messages.filter((m) => m.direction === "out").length,
                  0,
                ),
              0,
            ),
          )}
          detail="Delivery is simulated"
          icon={<Send size={18} />}
        />
      </div>
      <AdminOverviewExtras />
      <div className="admin-detail-grid">
        <section className="panel">
          <h2>Recent activity</h2>
          {events.length ? (
            <ol className="admin-feed">
              {events.map((e) => (
                <li key={e.id}>
                  <div>
                    <b>{e.name}</b>
                    <CustomerLink w={e.w} />
                    {e.detail && <small>{e.detail}</small>}
                  </div>
                  <time dateTime={e.at}>{date(e.at)}</time>
                </li>
              ))}
            </ol>
          ) : (
            <Empty title="Ready for your first customer">
              Try signup to watch the entire journey appear here.
            </Empty>
          )}
        </section>
        <section className="panel">
          <h2>Where customers are now</h2>
          <div className="admin-stage-list">
            {filters.slice(1).map((f) => (
              <Link key={f} href={`/admin/?stage=${encodeURIComponent(f)}`}>
                <span>{f}</span>
                <b>
                  {count(
                    state.workspaces.filter((w) => matchesFilter(w, f)).length,
                  )}
                </b>
              </Link>
            ))}
          </div>
          <p className="muted">
            Stages can overlap: a customer with a number may also be awaiting
            review.
          </p>
          <Link className="btn secondary" href="/admin/">
            View customer directory
          </Link>
        </section>
      </div>
    </>
  );
}
function AdminUsers() {
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const users = state.workspaces
    .flatMap((w) => w.members.map((m) => ({ ...m, w })))
    .filter((m) =>
      `${m.email} ${customerTitle(m.w)} ${m.role}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  return (
    <>
      <Heading
        title="Users"
        subtitle="Every registered person and simulated invitation, with their workspace."
      />
      <section className="panel">
        <div className="admin-table-toolbar">
          <SearchBox
            value={query}
            onChange={setQuery}
            label="Search user, workspace, or role"
          />
          <span className="muted">{users.length} people and invitations</span>
        </div>
        {users.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Workspace</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((m) => (
                  <tr key={m.id}>
                    <td>{m.email}</td>
                    <td>
                      <CustomerLink w={m.w}>{customerTitle(m.w)}</CustomerLink>
                      <small>{m.w.email}</small>
                    </td>
                    <td>{m.role}</td>
                    <td>
                      <Badge>{m.status}</Badge>
                    </td>
                    <td>
                      {m.status === "Active"
                        ? date(m.w.createdAt)
                        : "Invitation pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={<Users />} title="No users to display">
            Registered owners and invited team members will appear here.
          </Empty>
        )}
      </section>
    </>
  );
}
function VerificationQueue() {
  const { state } = useStore();
  const [filter, setFilter] = useState("In review");
  const customers = state.workspaces.filter((w) =>
    filter === "All started"
      ? w.verification.status !== "Not started"
      : w.verification.status === filter,
  );
  return (
    <>
      <Heading
        title="Verification queue"
        subtitle="Review applications and simulate the next provider decision."
      />
      <Notice>
        Approval and correction requests are prototype controls. No application
        is sent to a real provider.
      </Notice>
      <section className="panel admin-section">
        <div className="admin-table-toolbar">
          <Field label="Application status">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {[
                "In review",
                "Draft",
                "Changes needed",
                "Approved",
                "All started",
              ].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <span>{customers.length} applications</span>
        </div>
        {customers.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Number</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Submitted</th>
                  <th>Application</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <PersonCell w={w} />
                    </td>
                    <td>{w.numbers.join(", ") || "Unassigned"}</td>
                    <td>
                      <Badge>{w.verification.status}</Badge>
                    </td>
                    <td>{date(w.verification.startedAt)}</td>
                    <td>{date(w.verification.submittedAt)}</td>
                    <td>
                      <Link
                        className="btn secondary"
                        href={`/admin/?customer=${w.id}&tab=verification`}
                      >
                        Review application
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={<ShieldCheck />} title="Nothing in this queue">
            Applications matching this status will appear as customers progress.
          </Empty>
        )}
      </section>
    </>
  );
}
function AdminNumbers() {
  const { state } = useStore();
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("All numbers");
  const records = state.inventory
    .map((number) => {
      const w = state.workspaces.find((w) => w.numbers.includes(number));
      const receipt = state.receipts.find((r) => r.number === number);
      return { number, w, receipt };
    })
    .filter(
      (r) =>
        `${r.number} ${r.w?.email || ""} ${r.w ? customerTitle(r.w) : ""}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === "All numbers" ||
          (status === "Assigned" && !!r.w) ||
          (status === "Available" && !r.w)),
    );
  return (
    <>
      <Heading
        title="Numbers"
        subtitle="Fictional toll-free inventory and one-time assignments."
      />
      <div className="admin-metrics two">
        <Metric
          label="Assigned"
          value={count(state.inventory.length - availableNumbers(state).length)}
          icon={<Phone size={18} />}
        />
        <Metric
          label="Available"
          value={count(availableNumbers(state).length)}
          icon={<Phone size={18} />}
        />
      </div>
      <section className="panel">
        <div className="admin-table-toolbar">
          <SearchBox
            value={query}
            onChange={setQuery}
            label="Search number or customer"
          />
          <select
            aria-label="Number status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["All numbers", "Assigned", "Available"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Toll-free number</th>
                <th>Assignment</th>
                <th>Customer</th>
                <th>Amount paid</th>
                <th>Assigned on</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.number}>
                  <td>
                    {r.number}
                    <small>No monthly subscription</small>
                  </td>
                  <td>
                    <Badge>{r.w ? "Assigned" : "Available"}</Badge>
                  </td>
                  <td>
                    {r.w ? (
                      <CustomerLink w={r.w} />
                    ) : (
                      <span className="muted">Not assigned</span>
                    )}
                  </td>
                  <td>
                    {r.receipt
                      ? money(
                          r.receipt.lines.find((l) => l.credits === 0)
                            ?.unitCents || 0,
                        )
                      : "—"}
                  </td>
                  <td>{date(r.receipt?.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!records.length && (
            <Empty title="No matching numbers">
              Try another number or customer email.
            </Empty>
          )}
        </div>
      </section>
    </>
  );
}
function AdminPayments() {
  const { state } = useStore();
  const [query, setQuery] = useState(""),
    [receipt, setReceipt] = useState<Receipt | null>(null),
    [filter, setFilter] = useState("Paid");
  const records = state.receipts
    .filter((r) => {
      const w = state.workspaces.find((w) => w.id === r.workspaceId);
      return `${w?.email} ${r.id} ${r.number || ""} ${r.kind}`
        .toLowerCase()
        .includes(query.toLowerCase());
    })
    .sort((a, b) => b.at.localeCompare(a.at));
  const attempts = state.attempts
    .filter(
      (a) =>
        `${state.workspaces.find((w) => w.id === a.workspaceId)?.email} ${a.kind} ${a.id}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "All attempts" || a.status === filter),
    )
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <>
      <Heading
        title="Payments"
        subtitle="Purchase records keep the exact prices paid at checkout."
      />
      <div className="admin-metrics two">
        <Metric
          label="Total simulated payments"
          value={money(state.receipts.reduce((n, r) => n + r.totalCents, 0))}
          icon={<CreditCard size={18} />}
        />
        <Metric
          label="Completed purchases"
          value={count(state.receipts.length)}
          detail="Immutable receipt snapshots"
          icon={<CreditCard size={18} />}
        />
      </div>
      <section className="panel">
        <div className="admin-table-toolbar">
          <SearchBox
            value={query}
            onChange={setQuery}
            label="Search email, receipt, or purchase"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Payment status"
          >
            {["Paid", "Failed", "Canceled", "All attempts"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        {filter === "Paid" ? (
          <ReceiptTable
            records={records}
            showReceipt={setReceipt}
            showCustomer
          />
        ) : attempts.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Purchase</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => {
                  const w = state.workspaces.find(
                    (w) => w.id === a.workspaceId,
                  );
                  return (
                    <tr key={a.id}>
                      <td>{date(a.at)}</td>
                      <td>{w ? <CustomerLink w={w} /> : a.workspaceId}</td>
                      <td>{a.kind}</td>
                      <td>{money(a.totalCents)}</td>
                      <td>
                        <Badge>{a.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No matching payment attempts">
            Failed or canceled simulated checkouts will appear here.
          </Empty>
        )}
      </section>
      {receipt && (
        <ReceiptView receipt={receipt} onClose={() => setReceipt(null)} />
      )}
    </>
  );
}
function PricingSettings() {
  const { state, mutate } = useStore();
  const [draft, setDraft] = useState<Pricing>(() =>
    structuredClone(state.pricing),
  );
  const [preview, setPreview] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false),
    [reason, setReason] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(state.pricing);
  useEffect(() => {
    if (!dirty) setDraft(structuredClone(state.pricing));
  }, [state.pricing]);
  function update(fn: (p: Pricing) => void) {
    setDraft((p) => {
      const next = structuredClone(p);
      fn(next);
      return next;
    });
    setSaved(false);
    setError("");
  }
  function validate() {
    const prices = [
      draft.numberFee,
      ...draft.packs.map((p) => p.cents),
      ...draft.plans.map((p) => p.cents),
    ];
    if (prices.some((p) => !Number.isSafeInteger(p) || p < 1 || p > 100000000))
      throw Error(
        "Enter a positive USD amount, up to $1,000,000, for each price.",
      );
    if (
      draft.plans.some(
        (p) => !p.name.trim() || !Number.isInteger(p.credits) || p.credits < 0,
      )
    )
      throw Error(
        "Draft plans need a name, price, and nonnegative whole credit amount.",
      );
  }
  function save() {
    try {
      validate();
      mutate((s) => {
        applyAdminAction(s, {
          workspaceId: "",
          action: "Update pricing preview",
          reason,
          value: JSON.stringify(draft),
        });
        s.pricing = structuredClone(draft);
      });
      setConfirmSave(false);
      setReason("");
      setPreview(false);
      setSaved(true);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function cancel() {
    setDraft(structuredClone(state.pricing));
    setPreview(false);
    setSaved(false);
    setError("");
  }
  return (
    <>
      <Heading
        title="Pricing settings"
        subtitle="One shared configuration for public pricing, checkout, and future purchases."
        action={
          <div className="actions">
            <Button
              variant="ghost"
              disabled={!dirty && !preview}
              onClick={cancel}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                try {
                  validate();
                  setPreview(!preview);
                  setError("");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              {preview ? "Edit prices" : "Preview prices"}
            </Button>
            <Button
              disabled={!dirty}
              onClick={() => {
                try {
                  validate();
                  setConfirmSave(true);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Save pricing
            </Button>
          </div>
        }
      />
      {confirmSave && (
        <Modal
          title="Confirm pricing changes"
          onClose={() => setConfirmSave(false)}
        >
          <p>
            Future demo checkouts will use these prices. Existing receipts stay
            unchanged.
          </p>
          <Field label="Mandatory pricing reason">
            <input
              required
              minLength={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <Button disabled={reason.trim().length < 5} onClick={save}>
            Confirm pricing
          </Button>
        </Modal>
      )}
      <AdminPreferences scope="platform" />
      {saved && (
        <Notice tone="success">
          Pricing saved. Future checkouts use these prices; completed receipts
          keep their original amounts.
        </Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {preview ? (
        <section className="panel admin-pricing-preview">
          <h2>Customer-facing preview</h2>
          <p>
            {money(draft.numberFee)} one-time fee per toll-free number.
            Messaging credits purchased separately.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Credit pack</th>
                  <th>Pack price</th>
                  <th>Price per 1,000</th>
                </tr>
              </thead>
              <tbody>
                {draft.packs.map((p) => (
                  <tr key={p.credits}>
                    <td>{count(p.credits)}</td>
                    <td>{money(p.cents)}</td>
                    <td>{money((p.cents * 1000) / p.credits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            One number + 1,000 credits:{" "}
            <b>
              {money(
                draft.numberFee +
                  (draft.packs.find((p) => p.credits === 1000)?.cents || 0),
              )}
            </b>
          </p>
          <p>Pay as you go. No renewal scheduled.</p>
          {dirty && <Notice>This preview includes unsaved changes.</Notice>}
        </section>
      ) : (
        <div className="admin-pricing-layout">
          <section className="panel">
            <h2>Prepaid credit packs</h2>
            <p className="muted">
              Pack sizes stay fixed. Customers can buy multiple packs in one
              checkout.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Credits per pack</th>
                    <th>Pack price (USD)</th>
                    <th>Per 1,000 credits</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.packs.map((p, i) => (
                    <tr key={p.credits}>
                      <td>{count(p.credits)}</td>
                      <td>
                        <input
                          aria-label={`${p.credits} credit pack price in dollars`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={Number.isFinite(p.cents) ? p.cents / 100 : ""}
                          onChange={(e) =>
                            update((d) => {
                              d.packs[i].cents = Math.round(
                                Number(e.target.value) * 100,
                              );
                            })
                          }
                        />
                      </td>
                      <td>{money((p.cents * 1000) / p.credits)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div>
            <section className="panel">
              <h2>Toll-free number fee</h2>
              <Field
                label="One-time fee (USD)"
                hint="This creates no monthly number subscription or renewal date."
              >
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    Number.isFinite(draft.numberFee)
                      ? draft.numberFee / 100
                      : ""
                  }
                  onChange={(e) =>
                    update((d) => {
                      d.numberFee = Math.round(Number(e.target.value) * 100);
                    })
                  }
                />
              </Field>
              <Notice>
                Changing prices affects new purchases only. Historic receipts
                are never recalculated.
              </Notice>
            </section>
            <section className="panel admin-section">
              <div className="admin-title-row">
                <h2>Draft subscription plans</h2>
                <Badge>Unpublished</Badge>
              </div>
              <p className="muted">
                Plan drafts are private to this settings screen. Prepaid credits
                stay available independently.
              </p>
              {draft.plans.map((p, i) => (
                <div className="admin-plan" key={i}>
                  <Field label="Plan name">
                    <input
                      value={p.name}
                      onChange={(e) =>
                        update((d) => {
                          d.plans[i].name = e.target.value;
                        })
                      }
                    />
                  </Field>
                  <div className="form-grid">
                    <Field label="Monthly price (USD)">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={p.cents / 100}
                        onChange={(e) =>
                          update((d) => {
                            d.plans[i].cents = Math.round(
                              Number(e.target.value) * 100,
                            );
                          })
                        }
                      />
                    </Field>
                    <Field label="Monthly credits">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={p.credits}
                        onChange={(e) =>
                          update((d) => {
                            d.plans[i].credits = Number(e.target.value);
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      update((d) => {
                        d.plans.splice(i, 1);
                      })
                    }
                  >
                    <X size={16} />
                    Remove draft
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() =>
                  update((d) => {
                    d.plans.push({
                      name: "",
                      cents: 1000,
                      credits: 1000,
                      published: false,
                    });
                  })
                }
              >
                <Plus size={17} />
                Add draft plan
              </Button>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
