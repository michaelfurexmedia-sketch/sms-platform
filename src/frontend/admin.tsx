"use client";
import { useState } from "react";
import Link from "@/legacy/navigation";
import { useStore } from "@/lib/store";
import { type Workspace } from "@/lib/model";
import { money } from "@/lib/config";
import { brand } from "@/config/brand";
import { Heading, Badge } from "@/legacy/ui";
import { Button, Input, Select, Modal, EmptyState } from "@/components/ui";
import { BarChart } from "@/components/foundation";
import {
  applyAdminAction,
  adminActions,
  type AdminActionName,
} from "./admin-actions";
import { downloadCSV } from "./scheduling";

type RecordRow = {
  id: string;
  name: string;
  customer: string;
  status: string;
  detail: string;
  value: string;
  workspaceId?: string;
};
export function AdminControls({
  w,
  initialAction,
}: {
  w?: Workspace;
  initialAction?: AdminActionName;
}) {
  const { state, mutate } = useStore();
  const [open, setOpen] = useState(false),
    [action, setAction] = useState<AdminActionName>(
      initialAction || "Suspend account",
    ),
    [reason, setReason] = useState(""),
    [value, setValue] = useState(""),
    [customer, setCustomer] = useState(w?.id || ""),
    [feedback, setFeedback] = useState("");
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          setFeedback("");
          setOpen(true);
        }}
      >
        {initialAction || "Administrative actions"}
      </Button>
      <Modal
        open={open}
        title="Confirm administrative action"
        onClose={() => setOpen(false)}
      >
        <form
          className="module-form"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              mutate((s) =>
                applyAdminAction(s, {
                  workspaceId: w?.id || customer,
                  action,
                  reason,
                  value,
                }),
              );
              setOpen(false);
              setReason("");
              setValue("");
              setFeedback(
                "Demo action recorded with an audit entry. No external service was called.",
              );
            } catch (err) {
              setFeedback((err as Error).message);
            }
          }}
        >
          <p>All changes affect browser demonstration data only.</p>
          {!w && (
            <Select
              label="Customer"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            >
              <option value="">Platform-wide / choose customer</option>
              {state.workspaces.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.verification.fields.business || v.email}
                </option>
              ))}
            </Select>
          )}
          <Select
            label="Administrative action"
            value={action}
            onChange={(e) => setAction(e.target.value as AdminActionName)}
          >
            {adminActions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
          {!["Suspend account", "Reactivate account"].includes(action) &&
            (action === "Change subscription" ? (
              <Select
                label="New plan"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              >
                <option value="">Choose plan</option>
                {["Starter", "Team", "Scale"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            ) : (
              <Input
                label={
                  ["Set spending limit", "Record refund preview"].includes(
                    action,
                  )
                    ? "Amount in cents"
                    : action === "Adjust credits"
                      ? "Credit adjustment (+ or −)"
                      : "New value / event reference"
                }
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            ))}
          <Input
            label="Mandatory reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            minLength={5}
            required
            maxLength={500}
          />
          <Button type="submit" variant="danger">
            Confirm demo action
          </Button>
          {feedback && <p role="alert">{feedback}</p>}
        </form>
      </Modal>
      {!open && feedback && <p role="status">{feedback}</p>}
    </>
  );
}
export function CustomerOperations({ w }: { w: Workspace }) {
  const { state } = useStore();
  const sent = w.threads
    .flatMap((t) => t.messages)
    .filter((m) => m.direction === "out");
  return (
    <section className="panel customer-operations">
      <div className="section-heading">
        <h2>Account operations</h2>
        <AdminControls w={w} />
      </div>
      <div className="dashboard-metrics">
        {[
          ["Plan", w.preview?.plan || "Starter (demo)"],
          ["Balance", w.balance],
          [
            "Account",
            w.preview?.settings?.admin?.suspended === "true"
              ? "Suspended"
              : "Active",
          ],
          [
            "Provider cost estimate",
            money(Math.round(sent.reduce((s, m) => s + m.credits, 0) * 0.8)),
          ],
        ].map(([a, b]) => (
          <div key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
          </div>
        ))}
      </div>
      <p>
        Provider expenses use an illustrative $0.008 per segment assumption, not
        a provider quote. Limits: sending{" "}
        {w.preview?.settings?.admin?.["Set sending limit"] || "not set"}; spend{" "}
        {w.preview?.settings?.admin?.["Set spending limit"] || "not set"} cents.
        Limit preferences are not production enforcement.
      </p>
      <details>
        <summary>Messaging, payments & support summary</summary>
        <p>
          {sent.length} outbound messages · {w.campaigns.length} campaigns ·{" "}
          {w.numbers.length} numbers · {w.members.length + 1} team seats ·{" "}
          {w.verification.status}
        </p>
        <p>
          {state.receipts.filter((r) => r.workspaceId === w.id).length} receipts
          · {w.preview?.tickets?.length || 0} support tickets
        </p>
        {w.preview?.tickets?.map((t) => (
          <p key={t.id}>
            {t.subject} · {t.status} · {t.message}
          </p>
        ))}
      </details>
    </section>
  );
}
export function AdminOverviewExtras() {
  const { state } = useStore();
  const users = state.workspaces;
  const sent = users
    .flatMap((w) => w.threads.flatMap((t) => t.messages))
    .filter((m) => m.direction === "out");
  const revenue = state.receipts.reduce((s, r) => s + r.totalCents, 0);
  const cost = Math.round(sent.reduce((s, m) => s + m.credits, 0) * 0.8);
  const suspended = users.filter(
    (w) => w.preview?.settings?.admin?.suspended === "true",
  ).length;
  const mrr = users.reduce(
    (s, w) =>
      s +
      ({ Starter: 2900, Team: 7900, Scale: 19900 }[
        w.preview?.plan || "Starter"
      ] || 0),
    0,
  );
  return (
    <section className="admin-financials">
      <div className="dashboard-metrics">
        {[
          ["Active customers", users.length - suspended],
          [
            "Paying demo customers",
            new Set(state.receipts.map((r) => r.workspaceId)).size,
          ],
          ["Suspended customers", suspended],
          ["Illustrative MRR", money(mrr)],
          [
            "Usage revenue",
            money(
              state.receipts
                .filter((r) => r.kind === "Credits")
                .reduce((s, r) => s + r.totalCents, 0),
            ),
          ],
          ["Provider cost estimate", money(cost)],
          [
            "Illustrative gross margin",
            revenue
              ? (((revenue - cost) / revenue) * 100).toFixed(1) + "%"
              : "—",
          ],
          [
            "Pending registrations",
            users.filter((w) => w.verification.status === "In review").length,
          ],
        ].map(([a, b]) => (
          <div key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
          </div>
        ))}
      </div>
      <p className="caption">
        MRR assumes every preview plan is active. Gross margin uses all-time
        demo receipts less an illustrative $0.008 per outbound segment; neither
        is an accounting result. Operational status below is synthetic.
      </p>
      <div className="health-strip">
        <Badge>Web · healthy demo</Badge>
        <Badge>Worker · idle demo</Badge>
        <Badge>Providers · not connected</Badge>
        <Link href="/admin/health">Review platform health</Link>
      </div>
    </section>
  );
}
export function AdminModule({ section }: { section: string }) {
  const { state, mutate } = useStore();
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("All"),
    [notice, setNotice] = useState("");
  const workspaces = state.workspaces;
  const actions = state.adminPreview?.actions || [];
  let rows: RecordRow[] = [];
  const base = (w: Workspace) => ({
    id: w.id,
    name: w.verification.fields.business || w.email,
    customer: w.email,
    workspaceId: w.id,
    status:
      w.preview?.settings?.admin?.suspended === "true" ? "Suspended" : "Active",
    detail: w.preview?.plan || "Starter",
    value: String(w.balance),
  });
  const title: Record<string, string> = {
    subscriptions: "Subscriptions",
    refunds: "Refund previews",
    wallets: "Credit wallets",
    pricing: "Pricing management",
    providers: "Provider accounts",
    usage: "Customer messaging usage",
    campaigns: "Campaign monitoring",
    risk: "Risk management",
    complaints: "Abuse complaints",
    support: "Customer support",
    reports: "Revenue & provider costs",
    health: "System health",
    webhooks: "Webhook monitoring",
    workers: "Background workers",
    roles: "Administrator roles",
    audit: "Audit logs",
    invoices: "Invoices",
  };
  if (
    ["subscriptions", "wallets", "risk", "reports", "usage"].includes(section)
  )
    rows = workspaces.map((w) => {
      const r = base(w);
      const sent = w.threads
        .flatMap((t) => t.messages)
        .filter((m) => m.direction === "out");
      if (section === "usage") {
        r.detail =
          sent.length + " outbound · " + w.campaigns.length + " campaigns";
        r.value = sent.reduce((s, m) => s + m.credits, 0) + " segments";
      }
      if (section === "reports") {
        const revenue = state.receipts
          .filter((x) => x.workspaceId === w.id)
          .reduce((s, r) => s + r.totalCents, 0);
        const cost = Math.round(sent.reduce((s, m) => s + m.credits, 0) * 0.8);
        r.detail =
          "Revenue " + money(revenue) + " · provider estimate " + money(cost);
        r.value = "Contribution " + money(revenue - cost);
      }
      if (section === "risk") {
        r.detail =
          w.verification.status +
          " · " +
          w.contacts.filter((c) => c.status === "Opted out").length +
          " opt-out rows";
        r.value = "Review manually";
      }
      return r;
    });
  else if (section === "campaigns")
    rows = workspaces.flatMap((w) =>
      w.campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        customer: w.email,
        status: c.state,
        detail: c.sender,
        value: c.credits + " credits",
        workspaceId: w.id,
      })),
    );
  else if (section === "support")
    rows = workspaces.flatMap((w) =>
      (w.preview?.tickets || []).map((t) => ({
        id: t.id,
        name: t.subject,
        customer: w.email,
        status: t.status,
        detail: t.message,
        value: new Date(t.at).toLocaleDateString(),
        workspaceId: w.id,
      })),
    );
  else if (section === "refunds" || section === "audit")
    rows = actions
      .filter(
        (a) => section === "audit" || a.action === "Record refund preview",
      )
      .map((a) => ({
        id: a.id,
        name: a.action,
        customer:
          workspaces.find((w) => w.id === a.workspaceId)?.email || "Platform",
        status: "Recorded (demo)",
        detail: a.reason,
        value: a.value || "—",
        workspaceId: a.workspaceId,
      }));
  else if (section === "invoices")
    rows = state.receipts.map((r) => ({
      id: r.id,
      name: r.id.slice(0, 8),
      customer:
        workspaces.find((w) => w.id === r.workspaceId)?.email || "Customer",
      status: r.status + " (demo)",
      detail: r.kind,
      value: money(r.totalCents),
      workspaceId: r.workspaceId,
    }));
  else if (section === "providers")
    rows = [
      {
        id: "provider-demo",
        name: "Managed messaging provider",
        customer: "Platform ISV",
        status: "Not connected",
        detail: "Synthetic account · no credentials stored",
        value: "No live traffic",
      },
    ];
  else if (section === "health")
    rows = [
      "Web application",
      "Queue datastore",
      "Database",
      "Persistent worker",
      "Provider gateway",
    ].map((n, i) => ({
      id: n,
      name: n,
      customer: "Synthetic environment",
      status: i === 4 ? "Not connected" : "Healthy (demo)",
      detail: "Illustrative status, not live monitoring",
      value: i === 4 ? "—" : "Last checked in preview",
    }));
  else if (section === "workers")
    rows = [
      {
        id: "probe-worker",
        name: "Foundation probe worker",
        customer: "Platform",
        status: "Idle (demo)",
        detail: "Concurrency 2 · no messaging handlers",
        value: "0 pending jobs",
      },
      {
        id: "failed-job-demo",
        name: "Illustrative failed job",
        customer: "Synthetic fixture",
        status: "Failed (demo)",
        detail: "Provider timeout scenario; retry is a preview",
        value: "1 attempt",
      },
    ];
  else if (section === "webhooks")
    rows = [
      {
        id: "event-demo",
        name: "message.delivered",
        customer: "Synthetic event",
        status: "Delivered (demo)",
        detail: "HTTP 200 · signature verification is backend-dependent",
        value: "120 ms illustrative",
      },
      {
        id: "event-failure-demo",
        name: "payment.failed",
        customer: "Synthetic event",
        status: "Failed (demo)",
        detail: "HTTP 503 preview scenario",
        value: "Retry available",
      },
    ];
  else if (section === "roles")
    rows = [
      {
        id: "owner",
        name: "Platform owner",
        customer: "Full platform oversight",
        status: "Preview role",
        detail: "Customers, finance, compliance and settings",
        value: "1 fictional user",
      },
      {
        id: "support",
        name: "Support operator",
        customer: "Limited operations",
        status: "Preview role",
        detail: "Customer support and read-only account context",
        value: "0 users",
      },
      {
        id: "finance",
        name: "Finance operator",
        customer: "Financial operations",
        status: "Preview role",
        detail: "Payments and adjustments; mandatory audit reason",
        value: "0 users",
      },
    ];
  else if (section === "complaints")
    rows = actions
      .filter(
        (a) =>
          a.action === "Update settings preview" &&
          a.value.startsWith("Complaint:"),
      )
      .map((a) => ({
        id: a.id,
        name: a.value,
        customer: "Synthetic complaint",
        status: "Open",
        detail: a.reason,
        value: "Manual review",
      }));
  else if (section === "pricing")
    rows = [
      {
        id: "starter",
        name: "Starter",
        customer: "Subscription",
        status: "Illustrative",
        detail: "2 seats; messaging billed separately",
        value: "$29/month",
      },
      {
        id: "team",
        name: "Team",
        customer: "Subscription",
        status: "Illustrative",
        detail: "10 seats; messaging billed separately",
        value: "$79/month",
      },
      {
        id: "scale",
        name: "Scale",
        customer: "Subscription",
        status: "Illustrative",
        detail: "25 seats; messaging billed separately",
        value: "$199/month",
      },
    ];
  const shown = rows.filter(
    (r) =>
      (status === "All" || r.status === status) &&
      Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  const action: AdminActionName =
    section === "wallets"
      ? "Adjust credits"
      : section === "refunds"
        ? "Record refund preview"
        : section === "subscriptions"
          ? "Change subscription"
          : section === "pricing"
            ? "Update pricing preview"
            : ["workers", "webhooks"].includes(section)
              ? "Retry event preview"
              : section === "risk"
                ? "Suspend account"
                : "Update settings preview";
  return (
    <>
      <Heading
        title={title[section] || "Platform settings"}
        subtitle="Enterprise operations preview. Every record is synthetic; no provider or financial action is executed."
        action={<AdminControls initialAction={action} />}
      />
      {section === "reports" && <AdminOverviewExtras />}
      {section === "reports" && (
        <section className="panel">
          <BarChart
            title="Demo credit revenue by customer (cents)"
            data={workspaces.map((w) => ({
              label: (w.verification.fields.business || w.email).slice(0, 12),
              value: state.receipts
                .filter((r) => r.workspaceId === w.id && r.kind === "Credits")
                .reduce((s, r) => s + r.totalCents, 0),
            }))}
          />
        </section>
      )}
      <div className="admin-module-toolbar">
        <Input
          label="Search records"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          label="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          {[...new Set(rows.map((r) => r.status))].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </Select>
        <Button
          variant="secondary"
          onClick={() =>
            downloadCSV(section + "-demo.csv", [
              ["Record", "Customer", "Status", "Details", "Value"],
              ...shown.map((r) => [
                r.name,
                r.customer,
                r.status,
                r.detail,
                r.value,
              ]),
            ])
          }
        >
          Export view
        </Button>
      </div>
      {shown.length ? (
        <div className="table-wrap panel">
          <table>
            <caption>{title[section] || section} · synthetic records</caption>
            <thead>
              <tr>
                <th>Record</th>
                <th>Customer / scope</th>
                <th>Status</th>
                <th>Details</th>
                <th>Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>
                    {r.workspaceId ? (
                      <Link href={"/admin?customer=" + r.workspaceId}>
                        {r.customer}
                      </Link>
                    ) : (
                      r.customer
                    )}
                  </td>
                  <td>
                    <Badge>{r.status}</Badge>
                  </td>
                  <td>{r.detail}</td>
                  <td>{r.value}</td>
                  <td>
                    {section === "invoices" ? (
                      <Button
                        variant="quiet"
                        onClick={() =>
                          downloadCSV("invoice-" + r.name + ".csv", [
                            ["Invoice", "Customer", "Status", "Total"],
                            [r.name, r.customer, r.status, r.value],
                          ])
                        }
                      >
                        Download invoice
                      </Button>
                    ) : section === "support" ? (
                      <Button
                        variant="quiet"
                        onClick={() => {
                          mutate((s) => {
                            const w = s.workspaces.find(
                              (w) => w.id === r.workspaceId,
                            )!;
                            w.preview!.tickets!.find(
                              (t) => t.id === r.id,
                            )!.status =
                              r.status === "Open" ? "Resolved" : "Open";
                          });
                          setNotice("Demo support status updated.");
                        }}
                      >
                        Change status
                      </Button>
                    ) : section === "audit" ? (
                      <small>Immutable in this view</small>
                    ) : (
                      <AdminControls
                        w={workspaces.find((w) => w.id === r.workspaceId)}
                        initialAction={action}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No matching records"
          description={
            query
              ? "Try another search or status."
              : "Records appear as you use the customer preview."
          }
        />
      )}
      {section === "complaints" && (
        <Button
          variant="secondary"
          onClick={() => {
            mutate((s) =>
              applyAdminAction(s, {
                workspaceId: "",
                action: "Update settings preview",
                value: "Complaint: sample unsolicited message report",
                reason: "Synthetic complaint created for manual review.",
              }),
            );
          }}
        >
          Create sample complaint
        </Button>
      )}
      {["roles", "providers"].includes(section) && (
        <AdminPreferences key={section} scope={section} />
      )}
      {["roles", "providers", "pricing"].includes(section) && (
        <p className="caption">
          Proposed changes are recorded in the audit preview for review; they do
          not grant permissions, connect accounts or alter production pricing.
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
    </>
  );
}

export function AdminPreferences({ scope }: { scope: string }) {
  const { state, mutate } = useStore();
  const fields =
    scope === "roles"
      ? [
          { key: "role", label: "Role name", value: "Support operator" },
          {
            key: "permissions",
            label: "Permission profile",
            value: "Read accounts and manage support",
            options: [
              "Read accounts and manage support",
              "Finance and audited adjustments",
              "Full platform administration",
            ],
          },
          {
            key: "members",
            label: "Assigned synthetic administrator",
            value: "operator@example.com",
          },
        ]
      : scope === "providers"
        ? [
            {
              key: "label",
              label: "Provider account label",
              value: "Messaging ISV preview",
            },
            {
              key: "region",
              label: "Region",
              value: "United States",
              options: ["United States", "Canada"],
            },
            {
              key: "status",
              label: "Provider connection preference",
              value: "Disabled",
              options: ["Disabled", "Ready for future onboarding"],
            },
          ]
        : [
            {
              key: "name",
              label: "Company display name (preview)",
              value: brand.name,
            },
            {
              key: "support",
              label: "Support routing address (fictional)",
              value: "support@example.com",
            },
            {
              key: "registration",
              label: "Registration review mode",
              value: "Manual review",
              options: ["Manual review", "Automatic review (planned)"],
            },
            {
              key: "spend",
              label: "Default daily spend limit in cents",
              value: "10000",
            },
          ];
  const [values, setValues] = useState<Record<string, string>>(() =>
      Object.fromEntries(
        fields.map((f) => [
          f.key,
          state.adminPreview?.settings?.[scope]?.[f.key] || f.value,
        ]),
      ),
    ),
    [confirm, setConfirm] = useState(false),
    [reason, setReason] = useState(""),
    [feedback, setFeedback] = useState("");
  return (
    <section className="panel admin-preferences">
      <form
        className="module-form"
        onSubmit={(e) => {
          e.preventDefault();
          setConfirm(true);
        }}
      >
        <h2>
          {scope === "roles"
            ? "Role editor"
            : scope === "providers"
              ? "Provider configuration"
              : "Platform preferences"}
        </h2>
        {fields.map((f) =>
          f.options ? (
            <Select
              key={f.key}
              label={f.label}
              value={values[f.key]}
              onChange={(e) =>
                setValues({ ...values, [f.key]: e.target.value })
              }
            >
              {f.options.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </Select>
          ) : (
            <Input
              key={f.key}
              label={f.label}
              required
              value={values[f.key]}
              onChange={(e) =>
                setValues({ ...values, [f.key]: e.target.value })
              }
            />
          ),
        )}
        <Button type="submit">Review configuration</Button>
        <p>
          Preview configuration only. This does not grant permissions, send mail
          or connect a provider.
        </p>
        {feedback && <p role="status">{feedback}</p>}
      </form>
      <Modal
        open={confirm}
        title="Confirm configuration change"
        onClose={() => setConfirm(false)}
      >
        <form
          className="module-form"
          onSubmit={(e) => {
            e.preventDefault();
            mutate((s) => {
              applyAdminAction(s, {
                workspaceId: "",
                action: "Update settings preview",
                reason,
                value: scope + ": " + JSON.stringify(values),
              });
              s.adminPreview!.settings = {
                ...s.adminPreview!.settings,
                [scope]: values,
              };
            });
            setConfirm(false);
            setReason("");
            setFeedback("Preview configuration saved with audit reason.");
          }}
        >
          <dl>
            {Object.entries(values).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <Input
            label="Configuration change reason"
            required
            minLength={5}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button type="submit">Confirm configuration</Button>
        </form>
      </Modal>
    </section>
  );
}
