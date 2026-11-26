"use client";
import { useState } from "react";
import { Search, Bell, PanelLeftClose, Moon, Sun } from "lucide-react";
import Link from "@/legacy/navigation";
import { useRouter } from "@/legacy/navigation";
import { useStore } from "@/lib/store";
import { type Workspace, register, seedDemo } from "@/lib/model";
import { Button, Input, Modal } from "@/components/ui";
import { BarChart, Dropdown } from "@/components/foundation";
import { Heading, Badge } from "@/legacy/ui";
import { Timeline, nextAction } from "@/legacy/customer";

export const customerSections = [
  "overview",
  "inbox",
  "contacts",
  "campaigns",
  "numbers",
  "compliance",
  "billing",
  "team",
  "templates",
  "automations",
  "analytics",
  "integrations",
  "settings",
  "support",
];
export const adminSections = [
  "overview",
  "customers",
  "users",
  "verification",
  "numbers",
  "payments",
  "subscriptions",
  "refunds",
  "wallets",
  "pricing",
  "providers",
  "usage",
  "campaigns",
  "risk",
  "complaints",
  "support",
  "reports",
  "health",
  "webhooks",
  "workers",
  "roles",
  "audit",
  "settings",
];
export function WorkspaceTools({
  admin,
  w,
  collapsed,
  onCollapse,
  theme,
  onTheme,
}: {
  admin: boolean;
  w?: Workspace;
  collapsed: boolean;
  onCollapse: () => void;
  theme: "light" | "dark";
  onTheme: () => void;
}) {
  const { state, mutate } = useStore();
  const router = useRouter();
  const [search, setSearch] = useState(false),
    [query, setQuery] = useState(""),
    [notifications, setNotifications] = useState(false),
    [read, setRead] = useState(false),
    [create, setCreate] = useState(false),
    [name, setName] = useState("");
  return (
    <>
      <div className="workspace-tools">
        <Button
          variant="quiet"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={onCollapse}
        >
          <PanelLeftClose size={18} aria-hidden="true" />
        </Button>
        {!admin && (
          <select
            aria-label="Switch workspace"
            value={w?.id || ""}
            onChange={(e) => {
              if (e.target.value === "new") {
                setCreate(true);
                return;
              }
              mutate((s) => {
                s.activeId = e.target.value;
              });
              router.push("/app/");
            }}
          >
            {state.workspaces.map((v) => (
              <option key={v.id} value={v.id}>
                {v.verification.fields.business || v.email}
              </option>
            ))}
            <option value="new">Create demo workspace…</option>
          </select>
        )}
        <Button
          variant="quiet"
          onClick={() => setSearch(true)}
          aria-label="Global search"
        >
          <Search size={18} aria-hidden="true" />
          <span className="tool-label">Search</span>
        </Button>
        <Button
          variant="quiet"
          onClick={onTheme}
          aria-label={theme === "light" ? "Use dark theme" : "Use light theme"}
        >
          {theme === "light" ? (
            <Moon size={18} aria-hidden="true" />
          ) : (
            <Sun size={18} aria-hidden="true" />
          )}
        </Button>
        <Button
          variant="quiet"
          aria-label="Notifications"
          onClick={() => setNotifications(true)}
        >
          <Bell size={18} aria-hidden="true" />
          {!read && <span className="notification-count">1</span>}
        </Button>
        <Dropdown
          label="Account"
          items={[
            {
              label: "Account settings",
              href: admin ? "/admin/settings" : "/app/settings",
            },
            { label: "Help center", href: "/help" },
            { label: "Public website", href: "/" },
          ]}
        />
      </div>
      <Modal
        open={search}
        title="Search your workspace"
        onClose={() => setSearch(false)}
      >
        <Input
          label="Search pages, contacts and campaigns"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="search-results">
          {(admin ? adminSections : customerSections)
            .filter((n) => n.includes(query.toLowerCase()))
            .map((n) => (
              <Link
                onClick={() => setSearch(false)}
                key={n}
                href={
                  "/" +
                  (admin ? "admin" : "app") +
                  "/" +
                  (n === "overview" && !admin ? "" : n)
                }
              >
                {n.charAt(0).toUpperCase() + n.slice(1)}
              </Link>
            ))}
          {w &&
            query &&
            w.contacts
              .filter((c) =>
                (c.firstName + c.phone)
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((c) => (
                <Link
                  key={c.id}
                  href={"/app/contacts?contact=" + c.id}
                  onClick={() => setSearch(false)}
                >
                  {c.firstName} · {c.phone}
                </Link>
              ))}
        </div>
      </Modal>
      <Modal
        open={notifications}
        title="Notifications"
        onClose={() => setNotifications(false)}
      >
        <p>
          {read
            ? "You’re all caught up."
            : "Your demo workspace is ready. Review your onboarding and consent settings before creating a campaign."}
        </p>
        <Button onClick={() => setRead(true)} disabled={read}>
          Mark all as read
        </Button>
      </Modal>
      <Modal
        open={create}
        title="Create demo workspace"
        onClose={() => setCreate(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate((s) => {
              const v = register(
                s,
                "workspace-" + crypto.randomUUID().slice(0, 8) + "@example.com",
                true,
              );
              v.verification.fields.business = name;
            });
            setCreate(false);
            setName("");
            router.push("/app/");
          }}
        >
          <Input
            label="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
          />
          <p>Creates an empty fictional workspace in this browser.</p>
          <Button type="submit">Create workspace</Button>
        </form>
        <Button
          variant="quiet"
          onClick={() => {
            mutate(seedDemo);
            setCreate(false);
          }}
        >
          Use sample business
        </Button>
      </Modal>
    </>
  );
}
export function Dashboard({ w }: { w: Workspace }) {
  const outgoing = w.threads
    .flatMap((t) => t.messages)
    .filter((m) => m.direction === "out");
  const received = w.threads
    .flatMap((t) => t.messages)
    .filter((m) => m.direction === "in");
  const delivered = outgoing.filter((m) => m.status === "Delivered").length;
  const totalContacts = w.contacts.filter((c) => !c.duplicate).length;
  const opted = w.contacts.filter(
    (c) => c.status === "Opted out" && !c.duplicate,
  ).length;
  const pct = (n: number, d: number) =>
    d ? ((100 * n) / d).toFixed(1) + "%" : "—";
  const next = nextAction(w);
  const metrics = [
    ["Messages sent", outgoing.length],
    ["Messages received", received.length],
    ["Delivery rate", pct(delivered, outgoing.length)],
    [
      "Reply rate",
      pct(
        w.threads.filter(
          (t) =>
            t.messages.some((m) => m.direction === "out") &&
            t.messages.some((m) => m.direction === "in"),
        ).length,
        w.threads.filter((t) => t.messages.some((m) => m.direction === "out"))
          .length,
      ),
    ],
    ["Opt-out rate", pct(opted, totalContacts)],
    ["Available credits", w.balance],
    [
      "Active campaigns",
      w.campaigns.filter((c) => c.state === "Scheduled").length,
    ],
    [
      "Scheduled campaigns",
      w.campaigns.filter((c) => c.state === "Scheduled").length,
    ],
  ];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const day = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      value: outgoing.filter((m) => m.at.startsWith(day)).length,
    };
  });
  return (
    <>
      <Heading
        title={
          "Good to see you, " +
          (w.verification.fields.business || "there") +
          "."
        }
        subtitle="Your messaging workspace at a glance. All figures reflect synthetic preview activity."
        action={
          <Link className="btn primary" href="/app/campaigns">
            Create a campaign
          </Link>
        }
      />
      <div className="dashboard-onboarding">
        <div>
          <span className="eyebrow">Your next step</span>
          <h2>{next.description}</h2>
          <p>
            {
              [
                !!w.numbers.length,
                w.verification.status === "Approved",
                !!w.contacts.length,
                !!w.campaigns.length,
              ].filter(Boolean).length
            }{" "}
            of 4 onboarding steps complete
          </p>
        </div>
        <Link className="btn secondary" href={next.href}>
          {next.text}
        </Link>
      </div>
      <div className="dashboard-metrics">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p className="caption">
        Delivery: delivered / outbound inbox messages. Replies: contacted
        threads with a reply / contacted threads. Opt-outs: unique opted-out /
        unique contacts. Campaign delivery reports are separate.
      </p>
      <div className="dashboard-columns">
        <section className="panel">
          <BarChart title="Inbox sends · last 7 days (UTC)" data={days} />
        </section>
        <section className="panel">
          <h2>Recent conversations</h2>
          {w.threads.length ? (
            w.threads
              .slice(-4)
              .reverse()
              .map((t) => (
                <Link
                  className="dashboard-conversation"
                  href="/app/inbox"
                  key={t.id}
                >
                  <b>
                    {w.contacts.find((c) => c.id === t.contactId)?.firstName ||
                      "Contact"}
                  </b>
                  <span>{t.messages.at(-1)?.text || "No messages yet"}</span>
                  <Badge>{t.unread ? "Unread" : t.state}</Badge>
                </Link>
              ))
          ) : (
            <p>No conversations yet. Start from the inbox.</p>
          )}
        </section>
      </div>
      <div className="dashboard-columns">
        <section className="panel">
          <h2>Recent activity</h2>
          <Timeline events={w.activity.slice(-5)} />
        </section>
        <section className="panel">
          <h2>Keep the next step simple.</h2>
          <p>
            Review contacts, prepare a message and see exactly who will receive
            it.
          </p>
          <div className="quick-links">
            <Link href="/app/contacts">Import contacts</Link>
            <Link href="/app/inbox">Open inbox</Link>
            <Link href="/app/billing">Manage credits</Link>
            <Link href="/app/compliance">Review compliance</Link>
          </div>
        </section>
      </div>
    </>
  );
}
