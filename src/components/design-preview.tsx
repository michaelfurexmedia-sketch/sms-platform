"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, MessageSquare, Moon, Sun } from "lucide-react";
import { brand, brandVariables } from "@/config/brand";
import { sampleActivity, sampleLists } from "@/demo/seed";
import { Badge, Button, EmptyState, ErrorState, Input, LoadingState, Modal, Notification, Select } from "./ui";
import { BarChart, DataTable, Dropdown, Navigation, Pagination, Tabs } from "./foundation";

export default function DesignPreview() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(false);
  const [tab, setTab] = useState("lists");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("All");
  const [retry, setRetry] = useState(false);
  const filtered = sampleLists.filter(row => filter === "All" || row.status === filter);
  const rows = filtered.slice((page - 1) * 2, page * 2);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setError("Enter a workspace name."); return; }
    setError(""); setNotification(true);
  }
  return <div className="design-page" data-theme={theme} style={brandVariables(theme)}>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="/">{brand.logo ? <img src={brand.logo} alt="" width="28" height="28" /> : <MessageSquare size={24} aria-hidden="true" />}{brand.wordmark}</a>
      <Navigation label="Primary" current="/design-system" items={[{ href: "/", label: "Foundation" }, { href: "/design-system", label: "Components" }]} />
      <Button variant="secondary" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={"Switch to " + (theme === "light" ? "dark" : "light") + " theme"}>{theme === "light" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}<span>{theme === "light" ? "Dark" : "Light"}</span></Button>
    </header>
    <main id="main-content" className="design-main">
      <section className="hero" aria-labelledby="hero-title"><div><p className="eyebrow"><span className="small-rule" /> Foundation / Edition 01</p><h1 id="hero-title">Clarity in every interaction.</h1></div><div className="hero-note"><Badge>Development library</Badge><p>A shared language for business messaging. Precise controls, quiet surfaces, and room for the work that matters.</p><p className="caption">Synthetic examples only. No messages or payments are processed.</p></div></section>
      <section className="design-section" aria-labelledby="palette-heading"><div className="section-heading"><span className="section-number">01</span><h2 id="palette-heading">A considered palette.</h2><p>Neutral foundations. A purposeful accent.</p></div><div className="swatches">{(["paper", "surface", "ink", "accent"] as const).map(color => <div className="swatch" key={color}><div className="swatch-color" style={{ background: brand.colors[theme][color] }} /><span>{color}</span><code>{brand.colors[theme][color]}</code></div>)}</div></section>
      <section className="design-section" aria-labelledby="controls-heading"><div className="section-heading"><span className="section-number">02</span><h2 id="controls-heading">Confident, familiar controls.</h2><p>Clear labels and useful feedback.</p></div><div className="two-column">
        <form className="surface form-sample" noValidate onSubmit={submit}><h3>Workspace details</h3><Input label="Workspace name" name="workspace" value={name} onChange={e => setName(e.target.value)} hint="A name your team will recognize." error={error} /><Select label="Time zone" defaultValue="utc"><option value="utc">UTC</option><option value="ny">America/New_York</option><option value="karachi">Asia/Karachi</option></Select><div className="button-row"><Button type="submit">Save sample <ArrowUpRight size={16} aria-hidden="true" /></Button><Button variant="secondary" onClick={() => setOpen(true)}>Open dialog</Button></div><p className="caption">Changes stay in this page and reset on reload.</p></form>
        <div className="control-examples"><h3>Actions &amp; status</h3><div className="button-row"><Button variant="secondary">Secondary</Button><Button variant="quiet">Quiet</Button><Button variant="danger">Destructive</Button><Button busy>Saving</Button></div><div className="button-row"><Badge tone="success">Ready</Badge><Badge>Draft</Badge><Badge tone="danger">Needs attention</Badge></div><Dropdown label="Explore foundation" items={[{ label: "Foundation home", href: "/" }, { label: "Component library", href: "/design-system" }]} /><p className="caption">Buttons above demonstrate visual states; destructive actions are not connected.</p>{notification && <Notification onDismiss={() => setNotification(false)}>Sample saved locally for this view.</Notification>}</div>
      </div></section>
      <section className="design-section" aria-labelledby="data-heading"><div className="section-heading"><span className="section-number">03</span><h2 id="data-heading">Make the details readable.</h2><p>Tables and charts with an accessible alternative.</p></div>
        <Tabs selected={tab} onChange={setTab} label="Data examples" items={[
          { id: "lists", label: "Contact lists", content: <div className="surface"><div className="table-toolbar"><h3>Sample contact lists</h3><Select label="Filter by status" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}><option>All</option><option>Ready</option><option>Draft</option></Select></div><DataTable caption="Synthetic contact lists" rows={rows} rowKey={row => row.id} columns={[{ key: "name", label: "List", render: row => row.name }, { key: "contacts", label: "Contacts", render: row => row.contacts }, { key: "status", label: "Status", render: row => <Badge tone={row.status === "Ready" ? "success" : "neutral"}>{row.status}</Badge> }]} /><Pagination page={page} totalPages={Math.ceil(filtered.length / 2)} onChange={setPage} /></div> },
          { id: "activity", label: "Activity chart", content: <div className="surface"><BarChart title="Illustrative message activity" data={sampleActivity} /></div> }
        ]} />
      </section>
      <section className="design-section" aria-labelledby="states-heading"><div className="section-heading"><span className="section-number">04</span><h2 id="states-heading">Every state deserves care.</h2><p>Guidance when there is nothing to show.</p></div><div className="state-grid"><div className="surface"><EmptyState title="A fresh start" description="Your first list will appear here." /></div><div className="surface"><LoadingState label="Loading example" /></div><div className="surface">{retry ? <p role="status">Sample retry completed.</p> : <ErrorState title="This example could not load." onRetry={() => setRetry(true)} />}</div></div></section>
    </main><footer className="site-footer"><span>{brand.wordmark}</span><span>Phase 1 · Interface foundation</span></footer>
    <Modal open={open} onClose={() => setOpen(false)} title="A focused conversation"><p>Keyboard focus stays in this dialog. Press Escape or close it to return to the trigger.</p><Input label="Sample note" placeholder="Write a short note" /><div className="button-row"><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Done</Button></div></Modal>
  </div>;
}
