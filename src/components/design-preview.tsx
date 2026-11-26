"use client";
import { useState, type CSSProperties } from "react";
import { brand, darkBrandVariables } from "@/config/brand";
import { Badge, Button, Empty, Modal } from "./ui";
import { BarChart, DataTable, ErrorState, Input, LoadingState, Navigation, Notification, Pagination, Select, Tabs } from "./foundation";

const sample = [
  { id: "one", name: "Appointment reminder", audience: 240, state: "Draft" },
  { id: "two", name: "Store hours update", audience: 80, state: "Scheduled" },
  { id: "three", name: "Welcome message", audience: 120, state: "Completed" },
];
export default function DesignPreview() {
  const [theme, setTheme] = useState("light"), [tab, setTab] = useState("campaigns"), [modal, setModal] = useState(false);
  const [page, setPage] = useState(1), [notice, setNotice] = useState(false), [name, setName] = useState("");
  const [error, setError] = useState(""), [status, setStatus] = useState("all");
  const rows = sample.filter(row => status === "all" || row.state === status);
  return <div className="design-preview" data-theme={theme} style={theme === "dark" ? darkBrandVariables as CSSProperties : undefined}>
    <a className="skip-link" href="#main-content">Skip to content</a><header className="preview-header"><a href="/" className="logo">{brand.wordmark}</a><Navigation label="Preview navigation" current="/design-system/" items={[{ href: "/", label: "Product preview" }, { href: "/design-system/", label: "Design system" }]} />
    <Button variant="secondary" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "Use dark theme" : "Use light theme"}</Button></header>
    <main id="main-content" className="preview-main">
      <div className="preview-intro"><h1>Clarity in every interaction.</h1><p>The foundations for {brand.name}: composed typography, precise controls and a workspace that gives conversations room.</p><p className="muted">Component preview · All records below are sample data.</p></div>
      <section className="preview-section"><div><h2>One visual language.</h2><p>Paper surfaces. Deep ink. A deliberate cobalt action. The same hierarchy across public pages and working screens.</p></div>
        <div className="swatches">{(["paper", "ink", "cobalt", "mist"] as const).map(color => <div key={color}><span style={{ background: brand.colors[color] }} /><strong>{color}</strong><small>{brand.colors[color]}</small></div>)}</div>
      </section>
      <section className="preview-section"><div><h2>Controls with intent.</h2><p>Clear labels and helpful feedback. Primary actions remain easy to find.</p><div className="actions"><Button onClick={() => setModal(true)}>Open dialog</Button><Button variant="secondary" onClick={() => setNotice(true)}>Show notification</Button><Button disabled>Unavailable</Button><Button busy>Saving</Button></div></div>
        <form noValidate onSubmit={event => { event.preventDefault(); if (!name.trim()) { setError("Enter a campaign name."); return; } setError(""); setNotice(true); }}>
          <Input label="Campaign name" value={name} onChange={event => setName(event.target.value)} error={error} hint="Use a name your team will recognize." required />
          <Select label="Campaign status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} options={[{value:"all",label:"All statuses"},{value:"Draft",label:"Draft"},{value:"Scheduled",label:"Scheduled"},{value:"Completed",label:"Completed"}]} />
          <Button type="submit">Save example</Button>
        </form>
      </section>
      {notice && <Notification onDismiss={() => setNotice(false)}>Example saved. No campaign was created or sent.</Notification>}
      <section className="preview-workspace"><h2>Working views, without noise.</h2>
        <Tabs label="Workspace examples" active={tab} onChange={setTab} items={[
          { id: "campaigns", label: "Campaigns", content: <><DataTable caption="Example campaigns" rows={rows.slice((page - 1) * 2, page * 2)} rowKey={row => row.id} columns={[{key:"name",label:"Campaign",render:row=>row.name},{key:"audience",label:"Contacts",render:row=>row.audience},{key:"state",label:"Status",render:row=><Badge>{row.state}</Badge>}]} /><Pagination page={page} pages={Math.ceil(rows.length / 2)} onChange={setPage} /></> },
          { id: "delivery", label: "Delivery", content: <BarChart title="Sample delivery outcomes" data={[{label:"Delivered",value:214},{label:"Pending",value:18},{label:"Failed",value:8}]} /> },
        ]} />
      </section>
      <section className="preview-section"><div><h2>Every state considered.</h2><p>Loading, empty and error states explain what is happening and what to do next.</p><LoadingState label="Loading campaign activity…" /></div><div className="stack"><Empty title="Your next conversation starts here." action={<Button variant="secondary" onClick={() => setModal(true)}>View example</Button>}>Import contacts when you are ready to prepare your first campaign.</Empty><ErrorState title="Activity could not load." onRetry={() => setNotice(true)}>Check your connection and try again. This is an example error state.</ErrorState></div></section>
      <footer className="preview-footer">{brand.name} <span>Foundation release · Development only</span></footer>
    </main>
    {modal && <Modal title="A clear next step" onClose={() => setModal(false)}><p>This dialog uses native focus containment, Escape dismissal and focus restoration.</p><Input label="Example note" placeholder="Add a note" /><div className="actions"><Button onClick={() => { setModal(false); setNotice(true); }}>Save note</Button><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button></div></Modal>}
  </div>;
}
