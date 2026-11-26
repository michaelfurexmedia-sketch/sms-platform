"use client";
import Link from "./navigation";
import { usePathname, useRouter } from "./navigation";
import { useState, useEffect, Suspense } from "react";
import { Provider, useStore } from "@/lib/store";
import { brand, count } from "@/lib/config";
import { Home, Features, Pricing, Auth, DemoButton } from "./public";
import { Numbers, Billing, Team } from "./customer";
import { Contacts, Campaigns, InboxScreen } from "./messaging";
import { AdminScreen } from "./admin";
import {
  Logo,
  Button,
  Notice,
  Empty,
  LayoutDashboard,
  Inbox,
  Users,
  Send,
  Phone,
  CreditCard,
  ShieldCheck,
  Settings,
  Building2,
  Menu,
  X,
  LogOut,
  Mail,
} from "./ui";
import {
  CustomerModule,
  SubscriptionPanel,
  NumberPreferences,
} from "@/frontend/modules";
import { Dashboard, WorkspaceTools } from "@/frontend/workspace";
import { brandVariables } from "@/config/brand";
import "@/frontend/workspace.css";
const customerNav = [
  ["Overview", "/app/", LayoutDashboard],
  ["Inbox", "/app/inbox/", Inbox],
  ["Contacts", "/app/contacts/", Users],
  ["Campaigns", "/app/campaigns/", Send],
  ["Numbers & verification", "/app/numbers/", Phone],
  ["Compliance", "/app/compliance/", ShieldCheck],
  ["Templates", "/app/templates/", Mail],
  ["Automations", "/app/automations/", Send],
  ["Analytics", "/app/analytics/", LayoutDashboard],
  ["Integrations", "/app/integrations/", Settings],
  ["Settings", "/app/settings/", Settings],
  ["Support", "/app/support/", Mail],
  ["Team", "/app/team/", Users],
  ["Billing", "/app/billing/", CreditCard],
] as const;
const adminNav = [
  ["Customers", "/admin/", Building2],
  ["Overview", "/admin/overview/", LayoutDashboard],
  ["Users", "/admin/users/", Users],
  ["Verification", "/admin/verification/", ShieldCheck],
  ["Numbers", "/admin/numbers/", Phone],
  ["Payments", "/admin/payments/", CreditCard],
  ["Subscriptions", "/admin/subscriptions/", CreditCard],
  ["Invoices", "/admin/invoices/", CreditCard],
  ["Refunds", "/admin/refunds/", CreditCard],
  ["Wallets", "/admin/wallets/", CreditCard],
  ["Pricing", "/admin/pricing/", Settings],
  ["Providers", "/admin/providers/", Settings],
  ["Usage", "/admin/usage/", LayoutDashboard],
  ["Campaign monitor", "/admin/campaigns/", Send],
  ["Risk", "/admin/risk/", ShieldCheck],
  ["Complaints", "/admin/complaints/", Mail],
  ["Support", "/admin/support/", Mail],
  ["Revenue & costs", "/admin/reports/", LayoutDashboard],
  ["System health", "/admin/health/", Settings],
  ["Webhooks", "/admin/webhooks/", Settings],
  ["Workers", "/admin/workers/", Settings],
  ["Admin roles", "/admin/roles/", Users],
  ["Audit logs", "/admin/audit/", ShieldCheck],
  ["Settings", "/admin/settings/", Settings],
] as const;
export default function Application() {
  return (
    <Suspense fallback={<div className="loading">Opening workspace…</div>}>
      <Provider>
        <Content />
      </Provider>
    </Suspense>
  );
}
function Content() {
  const path = usePathname(),
    router = useRouter(),
    { state, ready, mutate, error, clearError } = useStore();
  const [menu, setMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    try {
      if (localStorage.getItem("sms-theme") === "dark") setTheme("dark");
    } catch {}
  }, []);
  useEffect(() => {
    if (!menu) return;
    const opener = document.activeElement as HTMLElement | null;
    const drawer = document.querySelector<HTMLElement>(".sidebar");
    const controls = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          "a[href],button:not(:disabled)",
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0);
    controls()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenu(false);
      }
      if (event.key !== "Tab") return;
      const items = controls(),
        first = items[0],
        last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      opener?.focus();
    };
  }, [menu]);
  const w = state.workspaces.find((x) => x.id === state.activeId);
  const admin = path.startsWith("/admin"),
    app = path.startsWith("/app");
  if (!ready)
    return (
      <div className="loading">
        <span className="loading-mark" />
        Opening {brand.name}…
      </div>
    );
  const prototype = (
    <div className="prototype-bar">
      <span>
        <b>Interactive prototype</b>
        <span className="prototype-description">
          {" "}
          — fictional data, no real messages or payments
        </span>
      </span>
      <div className="role-switch" aria-label="Prototype-only role switcher">
        <span>View as</span>
        <button
          aria-pressed={!admin}
          onClick={() => router.push(w ? "/app/" : "/signup/")}
        >
          Customer
        </button>
        <button aria-pressed={admin} onClick={() => router.push("/admin/")}>
          Owner admin
        </button>
      </div>
    </div>
  );
  if (!app && !admin)
    return (
      <>
        {prototype}
        {path.startsWith("/signup") ? (
          <Auth />
        ) : path.startsWith("/login") ? (
          <Auth login />
        ) : path.startsWith("/pricing") ? (
          <Pricing />
        ) : path.startsWith("/features") ? (
          <Features />
        ) : (
          <Home />
        )}
      </>
    );
  if (app && !w)
    return (
      <>
        {prototype}
        <div className="no-workspace">
          <Logo />
          <Empty
            icon={<Mail />}
            title="Your workspace starts with your email."
            action={
              <div className="actions">
                <Link href="/signup/" className="btn primary">
                  Start with your email
                </Link>
                <DemoButton secondary />
              </div>
            }
          >
            Confirm your email to start empty, or explore a separate sample
            business.
          </Empty>
        </div>
      </>
    );
  const nav = admin ? adminNav : customerNav;
  const section = path.split("/")[2] || (admin ? "customers" : "overview");
  return (
    <>
      {prototype}
      <div
        className={`legacy-app app-shell ${admin ? "admin-shell" : ""} ${collapsed ? "collapsed" : ""}`}
        data-theme={theme}
        style={brandVariables(theme)}
      >
        <aside className={`sidebar ${menu ? "is-open" : ""}`}>
          <div className="sidebar-logo">
            <Logo />
            <button
              className="mobile-toggle"
              aria-label="Close navigation"
              onClick={() => setMenu(false)}
            >
              <X />
            </button>
          </div>
          <div className="workspace-name">
            <span className="workspace-avatar">
              {admin
                ? brand.name.charAt(0)
                : (w!.verification.fields.business || w!.email)
                    .charAt(0)
                    .toUpperCase()}
            </span>
            <div>
              <b>
                {admin
                  ? "Platform owner"
                  : w!.verification.fields.business || "Your workspace"}
              </b>
              <small>
                {admin
                  ? "Admin portal"
                  : w!.isDemo
                    ? "Demo workspace"
                    : "Business workspace"}
              </small>
            </div>
          </div>
          <nav aria-label={admin ? "Admin navigation" : "Workspace navigation"}>
            {nav.map(([name, url, Icon]) => (
              <Link
                key={url}
                aria-label={name}
                href={url}
                onClick={() => setMenu(false)}
                aria-current={
                  path === url || path + "/" === url ? "page" : undefined
                }
              >
                <Icon size={19} />
                <span>{name}</span>
                {name === "Inbox" && w?.threads.some((t) => t.unread) && (
                  <b className="nav-count">
                    {w.threads.filter((t) => t.unread).length}
                  </b>
                )}
                {name === "Verification" &&
                  state.workspaces.some(
                    (x) => x.verification.status === "In review",
                  ) && (
                    <b className="nav-count">
                      {
                        state.workspaces.filter(
                          (x) => x.verification.status === "In review",
                        ).length
                      }
                    </b>
                  )}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            {!admin && (
              <div className="sidebar-credit">
                <span>Credit balance</span>
                <b>{count(w!.balance)}</b>
                <Link href="/app/billing/">Buy credits</Link>
              </div>
            )}
            <Link href="/">Visit website</Link>
            {!admin && (
              <button
                onClick={() => {
                  mutate((s) => {
                    s.activeId = null;
                  });
                  router.push("/login/");
                }}
              >
                <LogOut size={16} /> Log out
              </button>
            )}
            <small>
              Prototype roles are for review.
              <br />
              Production access is not connected.
            </small>
          </div>
        </aside>
        {menu && (
          <button
            className="nav-scrim"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          />
        )}
        <div className="app-body">
          <header className="workspace-header">
            <button
              className="mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <span>
              {admin ? "Platform" : "Workspace"}{" "}
              <span className="breadcrumb-slash">/</span>{" "}
              {nav.find(
                (x) => x[1].split("/")[2] === path.split("/")[2],
              )?.[0] || (admin ? "Customers" : "Overview")}
            </span>
            <WorkspaceTools
              admin={admin}
              w={w}
              collapsed={collapsed}
              onCollapse={() => setCollapsed(!collapsed)}
              theme={theme}
              onTheme={() => {
                const next = theme === "light" ? "dark" : "light";
                setTheme(next);
                try {
                  localStorage.setItem("sms-theme", next);
                } catch {}
              }}
            />
          </header>
          <main id="workspace-main" className="workspace-main">
            {error && (
              <Notice tone="error">
                {error}
                <Button variant="ghost" onClick={clearError}>
                  Dismiss
                </Button>
              </Notice>
            )}
            {admin ? (
              <AdminScreen section={section} />
            ) : section === "inbox" ? (
              <InboxScreen w={w!} />
            ) : section === "contacts" ? (
              <Contacts w={w!} />
            ) : section === "campaigns" ? (
              <Campaigns w={w!} />
            ) : section === "numbers" ? (
              <>
                <Numbers w={w!} />
                <NumberPreferences w={w!} />
              </>
            ) : section === "team" ? (
              <Team w={w!} />
            ) : section === "billing" ? (
              <>
                <SubscriptionPanel w={w!} />
                <Billing w={w!} />
              </>
            ) : [
                "compliance",
                "templates",
                "automations",
                "analytics",
                "integrations",
                "settings",
                "support",
              ].includes(section) ? (
              <CustomerModule key={w!.id + section} w={w!} section={section} />
            ) : (
              <Dashboard w={w!} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
