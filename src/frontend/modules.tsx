"use client";
import { useState } from "react";
import Link from "@/legacy/navigation";
import { useStore } from "@/lib/store";
import {
  type Workspace,
  workspace,
  activity,
  estimatedCredits,
  recipients,
  normalizePhone,
} from "@/lib/model";
import { Heading, Badge } from "@/legacy/ui";
import { Button, Input, Select, Modal, EmptyState } from "@/components/ui";
import { Tabs, BarChart } from "@/components/foundation";
import { usePreview } from "./demo";
import { downloadCSV } from "./scheduling";
import type { Automation, AutomationNode } from "./contracts";

export function CustomerModule({
  w,
  section,
}: {
  w: Workspace;
  section: string;
}) {
  if (section === "templates") return <Templates w={w} />;
  if (section === "automations") return <Automations w={w} />;
  if (section === "analytics") return <Analytics w={w} />;
  if (section === "compliance") return <Compliance w={w} />;
  if (section === "support") return <Support w={w} />;
  if (section === "integrations") return <Integrations w={w} />;
  return <Settings w={w} />;
}
export function ConfigForm({
  w,
  scope,
  title,
  fields,
}: {
  w: Workspace;
  scope: string;
  title: string;
  fields: {
    key: string;
    label: string;
    value: string;
    type?: string;
    options?: string[];
  }[];
}) {
  const { data, save } = usePreview(w);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((f) => [f.key, data.settings?.[scope]?.[f.key] ?? f.value]),
    ),
  );
  const [notice, setNotice] = useState("");
  return (
    <form
      className="module-form"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          save((p) => {
            p.settings = { ...p.settings, [scope]: values };
          });
          setNotice(
            "Saved in this browser. Production service is not connected.",
          );
        } catch (err) {
          setNotice((err as Error).message);
        }
      }}
    >
      <h2>{title}</h2>
      {fields.map((f) =>
        f.options ? (
          <Select
            key={f.key}
            label={f.label}
            value={values[f.key]}
            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
          >
            {f.options.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
        ) : (
          <Input
            key={f.key}
            label={f.label}
            type={f.type || "text"}
            required
            maxLength={300}
            value={values[f.key]}
            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
          />
        ),
      )}
      <Button type="submit">Save {title.toLowerCase()}</Button>
      {notice && <p role="status">{notice}</p>}
    </form>
  );
}
function Settings({ w }: { w: Workspace }) {
  const [tab, setTab] = useState("account");
  return (
    <>
      <Heading
        title="Settings"
        subtitle="Make this workspace feel like yours. Preview preferences only."
      />
      <Tabs
        label="Settings sections"
        selected={tab}
        onChange={setTab}
        items={[
          {
            id: "account",
            label: "Account",
            content: (
              <ConfigForm
                w={w}
                scope="account"
                title="Account preferences"
                fields={[
                  { key: "name", label: "Display name", value: "Avery Lane" },
                  {
                    key: "timezone",
                    label: "Time zone",
                    value: "UTC",
                    options: [
                      "UTC",
                      "America/New_York",
                      "America/Chicago",
                      "Asia/Karachi",
                    ],
                  },
                  {
                    key: "locale",
                    label: "Language",
                    value: "English",
                    options: ["English"],
                  },
                ]}
              />
            ),
          },
          {
            id: "security",
            label: "Security",
            content: (
              <>
                <ConfigForm
                  w={w}
                  scope="security"
                  title="Security preferences"
                  fields={[
                    {
                      key: "mfa",
                      label: "Multi-factor authentication preference",
                      value: "Required for team",
                      options: ["Required for team", "Optional"],
                    },
                    {
                      key: "session",
                      label: "Session timeout preference",
                      value: "30 minutes",
                      options: ["15 minutes", "30 minutes", "60 minutes"],
                    },
                  ]}
                />
                <p>
                  These are saved preferences, not active security controls.
                  Authentication, MFA enrollment and session revocation require
                  the approved backend.
                </p>
                <div className="panel">
                  <h3>Preview session</h3>
                  <p>This browser · local demonstration only</p>
                  <Link href="/login">Return to sign-in preview</Link>
                </div>
              </>
            ),
          },
          {
            id: "notifications",
            label: "Notifications",
            content: (
              <ConfigForm
                w={w}
                scope="notifications"
                title="Notification preferences"
                fields={[
                  {
                    key: "email",
                    label: "Email notifications",
                    value: "Important events",
                    options: ["Important events", "All events", "Off"],
                  },
                  {
                    key: "inbox",
                    label: "Inbox notifications",
                    value: "Assigned conversations",
                    options: [
                      "Assigned conversations",
                      "All conversations",
                      "Off",
                    ],
                  },
                  {
                    key: "balance",
                    label: "Low-balance alert threshold",
                    value: "250",
                    type: "number",
                  },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  );
}
function Integrations({ w }: { w: Workspace }) {
  const [revealed, setRevealed] = useState(false),
    [tested, setTested] = useState(false);
  return (
    <>
      <Heading
        title="Integrations"
        subtitle="Prepare connections with clear boundaries. No real keys, HTTP requests or webhook deliveries."
      />
      <div className="module-columns">
        <section className="panel">
          <h2>Developer API</h2>
          <p>
            Illustrative token only. This value cannot authenticate a request.
          </p>
          <code>
            {revealed ? "demo_not_a_valid_api_key" : "••••••••••••••••"}
          </code>
          <div className="actions">
            <Button variant="secondary" onClick={() => setRevealed(!revealed)}>
              {revealed ? "Hide demo token" : "Reveal demo token"}
            </Button>
          </div>
          <p>
            Scopes: contacts:read, messages:read. Write access requires
            server-side workspace authorization in a later phase.
          </p>
        </section>
        <ConfigForm
          w={w}
          scope="webhooks"
          title="Webhook settings"
          fields={[
            {
              key: "url",
              label: "HTTPS endpoint URL",
              value: "https://example.com/webhooks",
              type: "url",
            },
            {
              key: "event",
              label: "Subscribed events",
              value: "message.delivered",
              options: [
                "message.delivered",
                "message.received",
                "contact.opted_out",
                "All messaging events",
              ],
            },
            {
              key: "status",
              label: "Endpoint status",
              value: "Disabled",
              options: ["Disabled", "Enabled (demo)"],
            },
          ]}
        />
      </div>
      <section className="panel">
        <h2>Webhook delivery preview</h2>
        <p>
          Signing secrets will be generated on the server. Do not paste a real
          secret into this preview.
        </p>
        <Button variant="secondary" onClick={() => setTested(true)}>
          Simulate webhook delivery
        </Button>
        {tested && (
          <p role="status">
            Demo event evt_preview · HTTP 200 · no network request made.
          </p>
        )}
        <pre>
          {JSON.stringify(
            {
              id: "evt_preview",
              type: "message.delivered",
              data: { message_id: "msg_demo", workspace_id: "workspace_demo" },
            },
            null,
            2,
          )}
        </pre>
      </section>
    </>
  );
}
function Templates({ w }: { w: Workspace }) {
  const { data, save } = usePreview(w);
  const [open, setOpen] = useState(false),
    [editing, setEditing] = useState(""),
    [name, setName] = useState(""),
    [text, setText] = useState(""),
    [query, setQuery] = useState("");
  const list = data.templates || [];
  return (
    <>
      <Heading
        title="Message templates"
        subtitle="Useful starting points, with room for a human touch."
        action={
          <Button
            onClick={() => {
              setEditing("");
              setName("");
              setText("");
              setOpen(true);
            }}
          >
            Create template
          </Button>
        }
      />
      <Input
        label="Search templates"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="template-list">
        {list
          .filter((t) =>
            (t.name + t.text).toLowerCase().includes(query.toLowerCase()),
          )
          .map((t) => (
            <article className="panel" key={t.id}>
              <h2>{t.name}</h2>
              <p>{t.text}</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(t.id);
                  setName(t.name);
                  setText(t.text);
                  setOpen(true);
                }}
              >
                Edit {t.name}
              </Button>
              <Button
                variant="quiet"
                onClick={() =>
                  save((p) => {
                    p.templates = list.filter((x) => x.id !== t.id);
                  })
                }
              >
                Delete {t.name}
              </Button>
            </article>
          ))}
      </div>
      {!list.length && (
        <EmptyState
          title="A thoughtful reply, ready when you need it."
          description="Create a template to use from the shared inbox."
        />
      )}
      <Modal
        open={open}
        title={editing ? "Edit template" : "Create template"}
        onClose={() => setOpen(false)}
      >
        <form
          className="module-form"
          onSubmit={(e) => {
            e.preventDefault();
            save((p) => {
              p.templates = [
                ...(p.templates || []).filter((t) => t.id !== editing),
                {
                  id: editing || crypto.randomUUID(),
                  name: name.trim(),
                  text: text.trim(),
                },
              ];
            });
            setOpen(false);
          }}
        >
          <Input
            label="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
          />
          <label className="field">
            Message
            <textarea
              required
              rows={5}
              maxLength={1600}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <p>
            Use {"{{first_name}}"} in campaign templates. Inbox insertion is
            editable text.
          </p>
          <Button type="submit">Save template</Button>
        </form>
      </Modal>
    </>
  );
}
function Automations({ w }: { w: Workspace }) {
  const { data, save } = usePreview(w);
  const list = data.automations || [];
  const [id, setId] = useState(""),
    [contact, setContact] = useState(w.contacts[0]?.id || ""),
    [notice, setNotice] = useState("");
  const flow = list.find((f) => f.id === id);
  const update = (fn: (f: Automation) => void) =>
    save((p) => {
      const f = p.automations?.find((f) => f.id === id);
      if (f) fn(f);
    });
  function create() {
    const id = crypto.randomUUID();
    save((p) => {
      p.automations = [
        ...(p.automations || []),
        {
          id,
          name: "New follow-up",
          active: false,
          nodes: [
            {
              id: crypto.randomUUID(),
              type: "Trigger",
              value: "Contact joins a list",
            },
          ],
          history: [],
        },
      ];
    });
    setId(id);
  }
  function simulate() {
    if (!flow) return;
    const c = w.contacts.find((c) => c.id === contact);
    let status: "Completed" | "Failed" | "Suppressed" = "Completed",
      detail = "Simulated path completed. No message sent.";
    if (!c) {
      status = "Failed";
      detail = "Choose a contact.";
    } else if (
      w.contacts.some(
        (x) =>
          normalizePhone(x.phone) === normalizePhone(c.phone) &&
          x.status === "Opted out",
      )
    ) {
      status = "Suppressed";
      detail = "Workspace suppression prevented the message action.";
    } else if (
      flow.nodes.some(
        (n) => n.type === "Condition" && n.value === "Has consent",
      ) &&
      c.status !== "Subscribed"
    ) {
      status = "Suppressed";
      detail = "Consent condition did not match.";
    } else if (
      flow.nodes.some((n) => !n.value.trim()) ||
      !flow.nodes.some((n) => n.type === "Message")
    ) {
      status = "Failed";
      detail = "Configure every step and include a message action.";
    }
    update((f) => {
      f.history.unshift({ at: new Date().toISOString(), status, detail });
    });
  }
  return (
    <>
      <Heading
        title="Automations"
        subtitle="Map a useful follow-up. Every execution here is a simulation."
        action={<Button onClick={create}>Create workflow</Button>}
      />
      <div className="automation-layout">
        <aside className="panel">
          {list.map((f) => (
            <button
              className="flow-choice"
              key={f.id}
              aria-pressed={id === f.id}
              onClick={() => {
                setId(f.id);
                setNotice("");
              }}
            >
              <b>{f.name}</b>
              <Badge>{f.active ? "Active (demo)" : "Draft"}</Badge>
            </button>
          ))}
          {!list.length && <p>No workflows yet.</p>}
        </aside>
        {flow ? (
          <section className="panel">
            <Input
              label="Workflow name"
              value={flow.name}
              onChange={(e) =>
                update((f) => {
                  f.name = e.target.value;
                })
              }
              maxLength={80}
            />
            <ol className="workflow-nodes">
              {flow.nodes.map((n, i) => (
                <li key={n.id}>
                  <span className="eyebrow">{n.type}</span>
                  {n.type === "Message" ? (
                    <label className="field">
                      Message action
                      <textarea
                        aria-label="Message action"
                        value={n.value}
                        onChange={(e) =>
                          update((f) => {
                            f.nodes[i].value = e.target.value;
                          })
                        }
                      />
                    </label>
                  ) : n.type === "Delay" ? (
                    <Input
                      label="Delay in minutes"
                      type="number"
                      min={1}
                      max={10080}
                      value={n.value}
                      onChange={(e) =>
                        update((f) => {
                          f.nodes[i].value = e.target.value;
                        })
                      }
                    />
                  ) : (
                    <Select
                      label={n.type + " event"}
                      value={n.value}
                      onChange={(e) =>
                        update((f) => {
                          f.nodes[i].value = e.target.value;
                        })
                      }
                    >
                      {(n.type === "Trigger"
                        ? [
                            "Contact joins a list",
                            "Message received",
                            "Campaign completed",
                          ]
                        : ["Has consent", "Has replied"]
                      ).map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </Select>
                  )}
                  {i > 0 && (
                    <div className="actions">
                      <Button
                        variant="quiet"
                        disabled={i === 1}
                        onClick={() =>
                          update((f) => {
                            [f.nodes[i - 1], f.nodes[i]] = [
                              f.nodes[i],
                              f.nodes[i - 1],
                            ];
                          })
                        }
                      >
                        Move up
                      </Button>
                      <Button
                        variant="quiet"
                        disabled={i === flow.nodes.length - 1}
                        onClick={() =>
                          update((f) => {
                            [f.nodes[i + 1], f.nodes[i]] = [
                              f.nodes[i],
                              f.nodes[i + 1],
                            ];
                          })
                        }
                      >
                        Move down
                      </Button>
                      <Button
                        variant="quiet"
                        onClick={() =>
                          update((f) => {
                            f.nodes.splice(i, 1);
                            f.active = false;
                          })
                        }
                      >
                        Remove step
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ol>
            <div className="actions">
              {(
                ["Condition", "Delay", "Message"] as AutomationNode["type"][]
              ).map((type) => (
                <Button
                  key={type}
                  variant="secondary"
                  onClick={() =>
                    update((f) => {
                      f.active = false;
                      f.nodes.push({
                        id: crypto.randomUUID(),
                        type,
                        value:
                          type === "Condition"
                            ? "Has consent"
                            : type === "Delay"
                              ? "60"
                              : "",
                      });
                    })
                  }
                >
                  Add {type.toLowerCase()}
                </Button>
              ))}
            </div>
            <div className="actions">
              <Button
                onClick={() => {
                  if (
                    !flow.active &&
                    (!flow.name.trim() ||
                      !flow.nodes.some((n) => n.type === "Message") ||
                      flow.nodes.some(
                        (n) =>
                          !n.value.trim() ||
                          (n.type === "Delay" &&
                            (+n.value < 1 || +n.value > 10080)),
                      ))
                  ) {
                    setNotice(
                      "Add a message and valid values before activating.",
                    );
                    return;
                  }
                  update((f) => {
                    f.active = !f.active;
                  });
                  setNotice(
                    "Activation saved for preview only. No worker is scheduled.",
                  );
                }}
              >
                {flow.active
                  ? "Deactivate workflow"
                  : "Activate workflow (demo)"}
              </Button>
            </div>
            {notice && <p role="status">{notice}</p>}
            <Select
              label="Test contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            >
              <option value="">Choose contact</option>
              {w.contacts
                .filter((c) => !c.duplicate)
                .map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.firstName} · {c.status}
                  </option>
                ))}
            </Select>
            <Button variant="secondary" onClick={simulate}>
              Simulate execution
            </Button>
            <h2>Execution history</h2>
            {flow.history.length ? (
              flow.history.map((h, i) => (
                <div key={i} className="execution-row">
                  <Badge>{h.status}</Badge>
                  <p>{h.detail}</p>
                  <small>{new Date(h.at).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <p>No executions yet.</p>
            )}
          </section>
        ) : (
          <EmptyState
            title="Sketch the next step."
            description="Create or select a workflow to arrange its steps."
          />
        )}
      </div>
    </>
  );
}
export function SubscriptionPanel({ w }: { w: Workspace }) {
  const { data, save } = usePreview(w);
  const [plan, setPlan] = useState(""),
    [payment, setPayment] = useState(false);
  const reserved = w.campaigns
    .filter((c) => c.state === "Scheduled")
    .reduce((sum, c) => sum + estimatedCredits(recipients(w, c)), 0);
  return (
    <section className="panel subscription-panel">
      <h2>Your subscription</h2>
      <p>
        Current preview plan: <b>{data.plan || "Starter"}</b>. No subscription
        or payment is active.
      </p>
      <div className="plan-options">
        {[
          ["Starter", 29],
          ["Team", 79],
          ["Scale", 199],
        ].map(([name, price]) => (
          <div key={name}>
            <h3>{name}</h3>
            <p>${price}/month · illustrative</p>
            <Button
              variant="secondary"
              disabled={(data.plan || "Starter") === name}
              onClick={() => setPlan(String(name))}
            >
              Choose {name}
            </Button>
          </div>
        ))}
      </div>
      <div className="metric-grid">
        <div>
          <span>Available wallet</span>
          <strong>{w.balance}</strong>
        </div>
        <div>
          <span>Scheduled estimate</span>
          <strong>{reserved}</strong>
          <small>Not reserved or deducted in this demo</small>
        </div>
        <div>
          <span>Reserved credits</span>
          <strong>0</strong>
          <small>Ledger reservation is backend-dependent</small>
        </div>
      </div>
      <ConfigForm
        w={w}
        scope="recharge"
        title="Auto-recharge preferences"
        fields={[
          {
            key: "enabled",
            label: "Auto-recharge",
            value: "Off",
            options: ["Off", "On (demo preference)"],
          },
          {
            key: "threshold",
            label: "Credit threshold",
            value: "250",
            type: "number",
          },
          {
            key: "amount",
            label: "Recharge credits",
            value: "1000",
            type: "number",
          },
        ]}
      />
      <h3>Payment method</h3>
      <p>
        {payment ? "Demo Mastercard •••• 4444" : "Demo Visa •••• 4242"} ·
        synthetic display only
      </p>
      <Button variant="quiet" onClick={() => setPayment(!payment)}>
        Switch sample payment method
      </Button>
      <Modal
        open={!!plan}
        title="Confirm plan change"
        onClose={() => setPlan("")}
      >
        <p>
          Change from {data.plan || "Starter"} to {plan}? This previews an
          upgrade or downgrade. Proration and payment processing are not
          connected.
        </p>
        <Button
          onClick={() => {
            save((p) => {
              p.plan = plan;
            });
            setPlan("");
          }}
        >
          Confirm demo plan change
        </Button>
      </Modal>
    </section>
  );
}
function Analytics({ w }: { w: Workspace }) {
  const [range, setRange] = useState("All time");
  const since =
    range === "7 days"
      ? Date.now() - 7 * 86400000
      : range === "30 days"
        ? Date.now() - 30 * 86400000
        : 0;
  const messages = w.threads
    .flatMap((t) => t.messages)
    .filter((m) => Date.parse(m.at) >= since);
  const data = [
    {
      label: "Received",
      value: messages.filter((m) => m.direction === "in").length,
    },
    {
      label: "Delivered",
      value: messages.filter(
        (m) => m.direction === "out" && m.status === "Delivered",
      ).length,
    },
    {
      label: "Failed",
      value: messages.filter((m) => m.status === "Failed").length,
    },
  ];
  return (
    <>
      <Heading
        title="Analytics"
        subtitle="Synthetic inbox results and campaign usage. Metrics are not production benchmarks."
      />
      <div className="actions">
        <Select
          label="Reporting period"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {["7 days", "30 days", "All time"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Select>
        <Button
          variant="secondary"
          onClick={() =>
            downloadCSV("usage-demo.csv", [
              ["Metric", "Count"],
              ...data.map((v) => [v.label, v.value]),
            ])
          }
        >
          Export report
        </Button>
      </div>
      <div className="module-columns">
        <section className="panel">
          <BarChart title={"Inbox messages · " + range} data={data} />
        </section>
        <section className="panel">
          <h2>Campaign usage</h2>
          {w.campaigns.length ? (
            w.campaigns.map((c) => (
              <div className="execution-row" key={c.id}>
                <b>{c.name}</b>
                <p>
                  {c.credits} credits · {c.runs} runs · {c.state}
                </p>
              </div>
            ))
          ) : (
            <p>No campaigns yet.</p>
          )}
          <p>
            Campaign counts are all-time; delivery details are available in each
            campaign report.
          </p>
          <Link href="/app/campaigns">Open campaign reports</Link>
        </section>
      </div>
    </>
  );
}
function Support({ w }: { w: Workspace }) {
  const { data, save } = usePreview(w);
  const [subject, setSubject] = useState(""),
    [message, setMessage] = useState(""),
    [notice, setNotice] = useState("");
  return (
    <>
      <Heading
        title="Customer support"
        subtitle="A place for your questions. Requests stay in this browser; no support team is contacted."
      />
      <div className="module-columns">
        <form
          className="module-form"
          onSubmit={(e) => {
            e.preventDefault();
            save((p) => {
              p.tickets = [
                ...(p.tickets || []),
                {
                  id: crypto.randomUUID(),
                  subject,
                  message,
                  status: "Open",
                  at: new Date().toISOString(),
                },
              ];
            });
            setSubject("");
            setMessage("");
            setNotice("Demo ticket created. No message was sent.");
          }}
        >
          <Input
            label="Subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <label className="field">
            How can we help?
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <Button type="submit">Create demo ticket</Button>
          {notice && <p role="status">{notice}</p>}
          <Link href="/help">Browse help articles</Link>
        </form>
        <section className="panel">
          <h2>Support history</h2>
          {data.tickets?.length ? (
            data.tickets.map((t) => (
              <article key={t.id} className="execution-row">
                <h3>{t.subject}</h3>
                <Badge>{t.status}</Badge>
                <p>{t.message}</p>
                <Button
                  variant="quiet"
                  onClick={() =>
                    save((p) => {
                      p.tickets!.find((x) => x.id === t.id)!.status =
                        t.status === "Open" ? "Resolved" : "Open";
                    })
                  }
                >
                  {t.status === "Open" ? "Mark resolved" : "Reopen ticket"}
                </Button>
              </article>
            ))
          ) : (
            <p>No support requests yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
function Compliance({ w }: { w: Workspace }) {
  const { data, save } = usePreview(w);
  const [selected, setSelected] = useState("Business verification"),
    [business, setBusiness] = useState(w.verification.fields.business),
    [description, setDescription] = useState(""),
    [consent, setConsent] = useState(""),
    [notice, setNotice] = useState("");
  const record = data.registrations?.[selected];
  return (
    <>
      <Heading
        title="Compliance center"
        subtitle="Keep business information, registration and consent together. All submissions are simulated."
      />
      <div className="module-columns">
        <section className="panel">
          <h2>Registration status</h2>
          {[
            "Business verification",
            "Brand registration",
            "A2P 10DLC campaign",
            "Toll-free verification",
          ].map((type) => (
            <button
              className="flow-choice"
              key={type}
              aria-pressed={selected === type}
              onClick={() => {
                setSelected(type);
                const r = data.registrations?.[type];
                setBusiness(r?.business || w.verification.fields.business);
                setDescription(r?.description || "");
                setConsent(r?.consent || "");
                setNotice("");
              }}
            >
              <b>{type}</b>
              <Badge>
                {data.registrations?.[type]?.status ||
                  (type === "Toll-free verification"
                    ? w.verification.status
                    : "Not started")}
              </Badge>
            </button>
          ))}
          <Link href="/app/numbers">Existing number verification</Link>
        </section>
        <form
          className="module-form"
          onSubmit={(e) => {
            e.preventDefault();
            save((p) => {
              p.registrations = {
                ...p.registrations,
                [selected]: {
                  status: "In review",
                  reason: "",
                  business,
                  description,
                  consent,
                },
              };
            });
            setNotice(
              "Demo submission queued for review. Nothing was sent to a provider.",
            );
          }}
        >
          <h2>{selected}</h2>
          {record?.reason && (
            <p role="alert">Correction requested: {record.reason}</p>
          )}
          <Input
            label="Legal business name (fictional)"
            required
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
          />
          <label className="field">
            Messaging use case
            <textarea
              required
              minLength={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="field">
            Consent collection and opt-out process
            <textarea
              required
              minLength={10}
              value={consent}
              onChange={(e) => setConsent(e.target.value)}
            />
          </label>
          <Button type="submit">
            {record?.status === "Changes needed"
              ? "Resubmit correction (demo)"
              : "Submit registration (demo)"}
          </Button>
          {record?.status === "In review" && (
            <div className="actions">
              <Button
                variant="secondary"
                onClick={() =>
                  save((p) => {
                    p.registrations![selected].status = "Changes needed";
                    p.registrations![selected].reason =
                      "Describe the unchecked consent checkbox and STOP process.";
                  })
                }
              >
                Simulate correction request
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  save((p) => {
                    p.registrations![selected].status = "Approved";
                  })
                }
              >
                Simulate approval
              </Button>
            </div>
          )}
          {notice && <p role="status">{notice}</p>}
        </form>
      </div>
      <section className="panel">
        <h2>Consent & suppression</h2>
        <p>
          Confirmed opt-outs are distinct from invalid numbers and delivery
          failures. Suppression applies across this workspace.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Status</th>
                <th>Consent evidence</th>
              </tr>
            </thead>
            <tbody>
              {w.contacts
                .filter((c) => !c.duplicate)
                .map((c) => (
                  <tr key={c.id}>
                    <td>{c.firstName}</td>
                    <td>{c.status}</td>
                    <td>{c.consent || "Not recorded"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            downloadCSV("suppression-demo.csv", [
              ["Phone", "Status"],
              ...w.contacts
                .filter((c) => c.status === "Opted out")
                .map((c) => [c.phone, c.status]),
            ])
          }
        >
          Export suppression list
        </Button>
        <Link href="/app/contacts">Manage contacts and consent</Link>
      </section>
    </>
  );
}
export function NumberPreferences({ w }: { w: Workspace }) {
  const { mutate } = useStore();
  const { data, save } = usePreview(w);
  const [number, setNumber] = useState(w.numbers[0] || ""),
    [release, setRelease] = useState(false),
    [reason, setReason] = useState(""),
    [notice, setNotice] = useState("");
  const current = data.numberSettings?.[number] || {
    label: "",
    assignee: "Unassigned",
    autoReply: "",
  };
  return (
    <section className="panel module-form">
      <h2>Number settings</h2>
      <Select
        label="Manage assigned number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      >
        <option value="">Choose a number</option>
        {w.numbers.map((n) => (
          <option key={n}>{n}</option>
        ))}
      </Select>
      {number && w.numbers.includes(number) && (
        <>
          <Input
            label="Number label"
            value={current.label}
            onChange={(e) =>
              save((p) => {
                p.numberSettings = {
                  ...p.numberSettings,
                  [number]: { ...current, label: e.target.value },
                };
              })
            }
          />
          <Select
            label="Number employee assignment"
            value={current.assignee}
            onChange={(e) =>
              save((p) => {
                p.numberSettings = {
                  ...p.numberSettings,
                  [number]: { ...current, assignee: e.target.value },
                };
              })
            }
          >
            <option>Unassigned</option>
            <option>{w.email}</option>
            {w.members
              .filter((m) => m.email !== w.email)
              .map((m) => (
                <option key={m.id}>{m.email}</option>
              ))}
          </Select>
          <Input
            label="After-hours reply (demo preference)"
            value={current.autoReply}
            onChange={(e) =>
              save((p) => {
                p.numberSettings = {
                  ...p.numberSettings,
                  [number]: { ...current, autoReply: e.target.value },
                };
              })
            }
          />
          <p>
            SMS capable · rental preview $5/month. No recurring charge is
            processed.
          </p>
          <Button variant="danger" onClick={() => setRelease(true)}>
            Release number
          </Button>
        </>
      )}
      {notice && <p role="status">{notice}</p>}
      <Modal
        open={release}
        title="Release this number?"
        onClose={() => setRelease(false)}
      >
        <p>
          The number will be removed from this demo workspace. Scheduled
          campaigns using it will fail their sender check. No provider action
          occurs.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate((s) => {
              const v = workspace(s, w.id);
              v.numbers = v.numbers.filter((n) => n !== number);
              activity(v, "Number released (demo)", number + " · " + reason);
            });
            setRelease(false);
            setNumber("");
            setNotice("Number released in this browser preview.");
          }}
        >
          <Input
            label="Release reason"
            required
            minLength={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button type="submit" variant="danger">
            Confirm release
          </Button>
        </form>
      </Modal>
    </section>
  );
}
