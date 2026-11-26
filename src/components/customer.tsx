"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { count, money, date } from "@/lib/config";
import {
  quote,
  startVerification,
  saveVerification,
  submitVerification,
  verificationErrors,
  uid,
  activity,
  type Workspace,
  type Cart,
  type Receipt,
  type Fields,
  type Role,
} from "@/lib/model";
import { services } from "@/lib/services";
import {
  Button,
  ActionLink,
  Heading,
  Field,
  Notice,
  Empty,
  Badge,
  ReceiptView,
  Modal,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Plus,
  MessageSquare,
  ChevronRight,
} from "./ui";
import { PackPicker } from "./public";
export function nextAction(w: Workspace) {
  if (!w.numbers.length)
    return {
      text: "Get a number",
      href: "/app/numbers/",
      description: "Choose your toll-free number to make this workspace yours.",
    };
  if (w.verification.status === "Approved")
    return {
      text: w.firstSentAt ? "Create campaign" : "Send your first message",
      href: "/app/campaigns/",
      description: "You’re approved. Your next conversation is ready to begin.",
    };
  if (w.verification.status === "In review")
    return {
      text: "Import contacts",
      href: "/app/contacts/",
      description:
        "While your application is in review, prepare your contacts and draft a campaign.",
    };
  return {
    text:
      w.verification.status === "Not started"
        ? "Start verification"
        : "Continue verification",
    href: "/app/numbers/",
    description: "Tell us about your business and how your customers opt in.",
  };
}
export function Overview({ w }: { w: Workspace }) {
  const { state } = useStore();
  const next = nextAction(w);
  const delivered = w.threads
    .flatMap((t) => t.messages)
    .filter((m) => m.direction === "out" && m.status === "Delivered").length;
  return (
    <>
      <Heading
        title={
          w.verification.fields.business
            ? `Hello, ${w.verification.fields.business}.`
            : "Make yourself at home."
        }
        subtitle={
          w.isDemo
            ? "Explore a fictional business, with every action connected to the owner’s view."
            : "Your workspace is ready. Take the next step whenever you are."
        }
      />
      <div className="next-step">
        <div>
          <span className="next-icon">
            <MessageSquare size={26} />
          </span>
          <h2>
            {w.verification.status === "Approved"
              ? "You’re ready to connect."
              : "A few steps. Then you’re connected."}
          </h2>
          <p>{next.description}</p>
        </div>
        <ActionLink href={next.href}>{next.text}</ActionLink>
      </div>
      <div className="status-grid">
        <div>
          <Mail size={20} />
          <span>Account email</span>
          <Badge>Verified</Badge>
          <p>{w.email}</p>
        </div>
        <div>
          <Phone size={20} />
          <span>Toll-free number</span>
          <Badge>{w.numbers.length ? "Assigned" : "Unassigned"}</Badge>
          <p>{w.numbers[0] || "Choose a number for your business"}</p>
        </div>
        <div>
          <ShieldCheck size={20} />
          <span>SMS verification</span>
          <Badge>{w.verification.status}</Badge>
          <p>
            {w.verification.status === "In review"
              ? `Submitted ${date(w.verification.submittedAt)}`
              : w.verification.status === "Approved"
                ? "Ready for simulated messaging"
                : "Separate from your email confirmation"}
          </p>
        </div>
      </div>
      <div className="metric-grid">
        <div>
          <span>Available credits</span>
          <strong>{count(w.balance)}</strong>
          <Link href="/app/billing/">Buy credits</Link>
        </div>
        <div>
          <span>Contacts</span>
          <strong>
            {count(w.contacts.filter((c) => !c.duplicate).length)}
          </strong>
          <Link href="/app/contacts/">View contacts</Link>
        </div>
        <div>
          <span>Delivered messages</span>
          <strong>{count(delivered)}</strong>
          <Link href="/app/campaigns/">View campaigns</Link>
        </div>
      </div>
      <div className="overview-bottom">
        <section className="panel">
          <div className="section-heading">
            <h2>Recent activity</h2>
            <span className="muted">Your workspace</span>
          </div>
          <Timeline events={w.activity.slice(-5)} />
        </section>
        <section className="help-panel">
          <h2>Your pace. Your plan.</h2>
          <p>
            Get a number for {money(state.pricing.numberFee)} once, then buy the
            credits you need. There’s no monthly number renewal.
          </p>
          <p>
            You can prepare your audience and messages while verification is in
            review.
          </p>
          <Link href="/app/billing/">
            Explore billing <ChevronRight size={15} />
          </Link>
        </section>
      </div>
    </>
  );
}
export function Timeline({ events }: { events: Workspace["activity"] }) {
  return (
    <ol className="timeline">
      {[...events].reverse().map((e) => (
        <li key={e.id}>
          <span className="timeline-mark">
            <Check size={11} />
          </span>
          <div>
            <b>{e.name}</b>
            {e.detail && <p>{e.detail}</p>}
            <time>{date(e.at)}</time>
          </div>
        </li>
      ))}
    </ol>
  );
}
export function Checkout({
  w,
  number,
  cart,
  onClose,
  onDone,
}: {
  w: Workspace;
  number?: string;
  cart: Cart;
  onClose: () => void;
  onDone: (r: Receipt) => void;
}) {
  const { state, mutate } = useStore();
  const [key] = useState(uid);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const total = quote(state, cart, number);
  function pay(outcome: "success" | "failed" | "canceled") {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const r = mutate((s) =>
        services.payments.confirm(s, w.id, key, cart, number, outcome),
      );
      if (r) onDone(r);
      else if (outcome === "canceled") onClose();
      else {
        setError(
          "Demo payment declined. Nothing was assigned or charged. Try again or cancel.",
        );
        setBusy(false);
      }
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <Modal title="Review your purchase" onClose={onClose}>
      <Notice>
        This checkout is a simulation. No payment details or real money are
        used.
      </Notice>
      {total.lines.map((l, i) => (
        <div className="receipt-row" key={i}>
          <div>
            <b>{l.label}</b>
            <small>
              {l.quantity} × {money(l.unitCents)}
              {l.credits
                ? ` • ${money((l.unitCents * 1000) / l.credits)} per 1,000`
                : ""}
            </small>
          </div>
          <b>{money(l.quantity * l.unitCents)}</b>
        </div>
      ))}
      <div className="receipt-row total">
        <div>
          <b>Total due today</b>
          <small>{count(total.totalCredits)} messaging credits</small>
        </div>
        <strong>{money(total.totalCents)}</strong>
      </div>
      {number && (
        <p>
          The {money(state.pricing.numberFee)} number fee is charged once.
          Messaging credits are purchased separately. No number subscription or
          renewal.
        </p>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      <div className="stack">
        <Button disabled={busy} onClick={() => pay("success")}>
          Confirm simulated payment
        </Button>
        <Button
          disabled={busy}
          variant="secondary"
          onClick={() => pay("failed")}
        >
          Simulate failed payment
        </Button>
        <Button disabled={busy} variant="ghost" onClick={() => pay("canceled")}>
          Cancel checkout
        </Button>
      </div>
    </Modal>
  );
}
export function Numbers({ w }: { w: Workspace }) {
  const { state, mutate } = useStore();
  const [selecting, setSelecting] = useState(false),
    [number, setNumber] = useState(""),
    [checkout, setCheckout] = useState(false),
    [receipt, setReceipt] = useState<Receipt | null>(null),
    [editing, setEditing] = useState(false);
  const available = services.numbers.available(state);
  const v = w.verification;
  return (
    <>
      <Heading
        title="Numbers & verification"
        subtitle="Your number and your business approval, together in one place."
        action={
          w.numbers.length ? (
            <Button variant="secondary" onClick={() => setSelecting(true)}>
              <Plus size={16} /> Get another number
            </Button>
          ) : undefined
        }
      />
      <div className="two-col">
        <section className="panel">
          <div className="section-heading">
            <h2>Your toll-free numbers</h2>
            <Phone size={21} />
          </div>
          {!w.numbers.length ? (
            <Empty
              title="A number to call your own."
              icon={<Phone />}
              action={
                <Button onClick={() => setSelecting(true)}>Get a number</Button>
              }
            >
              Choose a fictional toll-free number for{" "}
              {money(state.pricing.numberFee)} once. Credits are separate.
            </Empty>
          ) : (
            w.numbers.map((n) => (
              <div className="number-record" key={n}>
                <strong>{n}</strong>
                <Badge>Assigned</Badge>
                <p>One-time purchase. No renewal scheduled.</p>
              </div>
            ))
          )}
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>SMS verification</h2>
            <Badge>{v.status}</Badge>
          </div>
          {v.status === "Approved" ? (
            <>
              <div className="approved-icon">
                <ShieldCheck size={38} />
              </div>
              <h3>Your business is approved.</h3>
              <p>
                You’re ready for simulated messaging from your assigned numbers.
              </p>
              <ActionLink href="/app/campaigns/">
                Send your first message
              </ActionLink>
            </>
          ) : v.status === "In review" ? (
            <>
              <h3>Your application is in review.</h3>
              <p>
                Submitted {date(v.submittedAt)}
                <br />
                Number: {w.numbers[0]}
              </p>
              <p>
                Import contacts and draft campaigns while you wait. Sending
                needs approval and enough credits.
              </p>
              <ActionLink href="/app/contacts/" secondary>
                Import contacts
              </ActionLink>
              <Button variant="ghost" onClick={() => setEditing(true)}>
                View application
              </Button>
            </>
          ) : (
            <>
              {v.correction && (
                <Notice tone="error">
                  <b>Changes needed</b>
                  <p>{v.correction.text}</p>
                  <Button variant="ghost" onClick={() => setEditing(true)}>
                    Correct {fieldLabels[v.correction.field]}
                  </Button>
                </Notice>
              )}
              <p>
                Share your business details and how people agree to receive your
                messages. Your application saves as you go.
              </p>
              {v.startedAt && (
                <small>
                  Started {date(v.startedAt)} • Last saved {date(v.savedAt)}
                </small>
              )}
              <Button
                onClick={() => {
                  mutate((s) => startVerification(s, w.id));
                  setEditing(true);
                }}
              >
                {v.status === "Not started"
                  ? "Start verification"
                  : "Continue verification"}
              </Button>
            </>
          )}
        </section>
      </div>
      {v.history.length > 0 && (
        <details className="panel history">
          <summary>Application history ({v.history.length})</summary>
          {[...v.history].reverse().map((h, i) => (
            <div key={i} className="history-item">
              <b>{h.kind}</b>
              <time>{date(h.at)}</time>
              {h.note && <p>{h.note}</p>}
            </div>
          ))}
        </details>
      )}
      {selecting && !checkout && (
        <Modal
          title="Get a toll-free number"
          onClose={() => setSelecting(false)}
        >
          <p>
            <b>
              {money(state.pricing.numberFee)} one-time fee per toll-free
              number.
            </b>{" "}
            Messaging credits are purchased separately.
          </p>
          <p className="muted">Fictional inventory for this prototype.</p>
          <div className="number-options">
            {available.map((n) => (
              <label className={number === n ? "selected" : ""} key={n}>
                <input
                  type="radio"
                  name="number"
                  value={n}
                  checked={number === n}
                  onChange={() => setNumber(n)}
                />
                <strong>{n}</strong>
              </label>
            ))}
          </div>
          {!available.length && (
            <Notice>All demo numbers are currently assigned.</Notice>
          )}
          <Button
            disabled={!number || !available.includes(number)}
            onClick={() => setCheckout(true)}
          >
            Continue to checkout
          </Button>
        </Modal>
      )}
      {checkout && (
        <Checkout
          w={w}
          number={number}
          cart={[]}
          onClose={() => {
            setCheckout(false);
            setSelecting(false);
          }}
          onDone={(r) => {
            setReceipt(r);
            setCheckout(false);
            setSelecting(false);
          }}
        />
      )}
      {receipt && (
        <ReceiptView receipt={receipt} onClose={() => setReceipt(null)} />
      )}{" "}
      {editing && (
        <VerificationWizard w={w} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
export const fieldLabels: Record<keyof Fields, string> = {
  business: "Business name",
  contactName: "Contact name",
  contactEmail: "Contact email",
  contactPhone: "Business contact phone",
  website: "Business website",
  use: "Intended SMS use",
  volume: "Estimated monthly volume",
  sample: "Sample message",
  consent: "How recipients give consent",
};
const steps: { title: string; fields: (keyof Fields)[] }[] = [
  {
    title: "Your business",
    fields: [
      "business",
      "contactName",
      "contactEmail",
      "contactPhone",
      "website",
    ],
  },
  { title: "Your messages", fields: ["use", "volume", "sample"] },
  { title: "Customer consent", fields: ["consent"] },
  { title: "Review", fields: [] },
];
function VerificationWizard({
  w,
  onClose,
}: {
  w: Workspace;
  onClose: () => void;
}) {
  const { mutate } = useStore();
  const v = w.verification;
  const readonly = ["In review", "Approved"].includes(v.status);
  const correction = v.correction?.field;
  const [step, setStep] = useState(
    readonly
      ? 3
      : correction
        ? steps.findIndex((s) => s.fields.includes(correction))
        : 0,
  );
  const [error, setError] = useState(""),
    [showErrors, setShowErrors] = useState(false);
  const errors = verificationErrors(v.fields);
  const change = (key: keyof Fields, value: string) => {
    try {
      mutate((s) => saveVerification(s, w.id, { ...v.fields, [key]: value }));
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const next = () => {
    setShowErrors(true);
    if (steps[step].fields.some((k) => errors[k])) return;
    setShowErrors(false);
    setStep(step + 1);
  };
  const submit = () => {
    try {
      mutate((s) => submitVerification(s, w.id));
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Modal title="Business SMS verification" onClose={onClose}>
      <div className="wizard-progress">
        {steps.map((s, i) => (
          <button
            key={s.title}
            onClick={() => {
              setStep(i);
              setShowErrors(false);
            }}
            aria-current={i === step ? "step" : undefined}
          >
            <span>{i < step ? <Check size={13} /> : i + 1}</span>
            {s.title}
          </button>
        ))}
      </div>
      <h3>{steps[step].title}</h3>
      {!readonly && (
        <small className="save-state">
          Draft saves automatically •{" "}
          {v.savedAt ? date(v.savedAt) : "Ready to begin"}
        </small>
      )}
      {v.correction && <Notice tone="error">{v.correction.text}</Notice>}
      {step < 3 ? (
        <div className="stack">
          {steps[step].fields.map((k) => (
            <Field
              key={k}
              label={fieldLabels[k]}
              error={showErrors ? errors[k] : undefined}
              hint={
                k === "contactPhone"
                  ? "This is your business contact phone, not your assigned toll-free number."
                  : k === "consent"
                    ? "Describe the form, checkbox or other opt-in, what it says, and how consent is recorded."
                    : undefined
              }
            >
              {["use", "sample", "consent"].includes(k) ? (
                <textarea
                  id={`verify-${k}`}
                  disabled={readonly}
                  value={v.fields[k]}
                  rows={k === "consent" ? 5 : 3}
                  onChange={(e) => change(k, e.target.value)}
                />
              ) : k === "volume" ? (
                <select
                  disabled={readonly}
                  value={v.fields[k]}
                  onChange={(e) => change(k, e.target.value)}
                >
                  <option value="">Choose estimated volume</option>
                  <option>Up to 1,000 per month</option>
                  <option>1,001–5,000 per month</option>
                  <option>5,001–10,000 per month</option>
                  <option>More than 10,000 per month</option>
                </select>
              ) : (
                <input
                  id={`verify-${k}`}
                  disabled={readonly}
                  type={
                    k === "contactEmail"
                      ? "email"
                      : k === "website"
                        ? "url"
                        : k === "contactPhone"
                          ? "tel"
                          : "text"
                  }
                  value={v.fields[k]}
                  placeholder={
                    k === "website"
                      ? "https://your-business.example"
                      : undefined
                  }
                  onChange={(e) => change(k, e.target.value)}
                />
              )}
            </Field>
          ))}
        </div>
      ) : (
        <dl className="review-fields">
          {(Object.keys(fieldLabels) as (keyof Fields)[]).map((k) => (
            <div key={k}>
              <dt>{fieldLabels[k]}</dt>
              <dd>
                {v.fields[k] || "Not entered"}
                {!readonly && (
                  <button
                    onClick={() =>
                      setStep(steps.findIndex((s) => s.fields.includes(k)))
                    }
                  >
                    Edit
                  </button>
                )}
              </dd>
            </div>
          ))}
          <div>
            <dt>Assigned number</dt>
            <dd>{w.numbers[0] || "Get a number before submitting"}</dd>
          </div>
        </dl>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      <div className="wizard-actions">
        <Button variant="ghost" onClick={onClose}>
          {readonly ? "Close" : "Save & leave"}
        </Button>
        <div className="actions">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={next}>Continue</Button>
          ) : (
            !readonly && (
              <Button onClick={submit}>Submit for verification</Button>
            )
          )}
        </div>
      </div>
    </Modal>
  );
}
export function Billing({ w }: { w: Workspace }) {
  const { state } = useStore();
  const [cart, setCart] = useState<Cart>([{ credits: 1000, quantity: 1 }]);
  const [buy, setBuy] = useState(false),
    [checkout, setCheckout] = useState(false),
    [receipt, setReceipt] = useState<Receipt | null>(null);
  const receipts = state.receipts.filter((r) => r.workspaceId === w.id);
  const attempts = state.attempts.filter((r) => r.workspaceId === w.id);
  const total = quote(state, cart);
  const usage = w.threads
    .flatMap((t) => t.messages)
    .filter((m) => m.direction === "out");
  return (
    <>
      <Heading
        title="Billing"
        subtitle="A clear view of your credits and purchases."
        action={
          <Button onClick={() => setBuy(true)}>
            <Plus size={16} /> Buy credits
          </Button>
        }
      />
      <div className="metric-grid billing-metrics">
        <div>
          <span>Available credits</span>
          <strong>{count(w.balance)}</strong>
          <small>Ready to use</small>
        </div>
        <div>
          <span>Billing type</span>
          <strong className="text-metric">Pay as you go</strong>
          <small>No renewal scheduled</small>
        </div>
        <div>
          <span>Last payment</span>
          <strong>
            {receipts.length ? money(receipts.at(-1)!.totalCents) : "—"}
          </strong>
          <small>{date(receipts.at(-1)?.at)}</small>
        </div>
      </div>
      <section className="panel">
        <h2>Purchases & receipts</h2>
        {!receipts.length ? (
          <Empty
            title="Your first purchase starts here."
            action={
              <Button variant="secondary" onClick={() => setBuy(true)}>
                Buy credits
              </Button>
            }
          >
            No payments yet. Explore freely, then add the credits you need.
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Purchase</th>
                  <th>Date</th>
                  <th>Credits</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {[...receipts].reverse().map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.kind === "Number" ? r.number : "Credit purchase"}
                    </td>
                    <td>{date(r.at)}</td>
                    <td>{count(r.totalCredits)}</td>
                    <td>{money(r.totalCents)}</td>
                    <td>
                      <Badge>{r.status}</Badge>
                    </td>
                    <td>
                      <Button variant="ghost" onClick={() => setReceipt(r)}>
                        View receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="panel">
        <h2>Usage</h2>
        <p>
          {count(usage.reduce((n, m) => n + m.credits, 0))} credits used across{" "}
          {count(usage.length)} simulated outbound messages.
        </p>
        {usage.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sent</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {usage
                  .slice(-20)
                  .reverse()
                  .map((m) => (
                    <tr key={m.id}>
                      <td>{date(m.at)}</td>
                      <td className="message-cell">{m.text}</td>
                      <td>
                        <Badge>{m.status}</Badge>
                      </td>
                      <td>{m.credits}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {attempts.length > 0 && (
        <details className="panel">
          <summary>Unsuccessful checkout attempts ({attempts.length})</summary>
          {attempts.map((a) => (
            <div className="receipt-row" key={a.id}>
              <span>
                {a.kind} • {date(a.at)}
              </span>
              <Badge>{a.status}</Badge>
              <b>{money(a.totalCents)}</b>
            </div>
          ))}
        </details>
      )}
      {buy && !checkout && (
        <Modal title="Buy credits" onClose={() => setBuy(false)}>
          <PackPicker cart={cart} setCart={setCart} />
          <div className="receipt-row total">
            <b>{count(total.totalCredits)} credits</b>
            <strong>{money(total.totalCents)}</strong>
          </div>
          <Button disabled={!cart.length} onClick={() => setCheckout(true)}>
            Review purchase
          </Button>
          <p className="muted">No subscription. Buy more whenever you need.</p>
        </Modal>
      )}
      {checkout && (
        <Checkout
          w={w}
          cart={cart}
          onClose={() => {
            setCheckout(false);
            setBuy(false);
          }}
          onDone={(r) => {
            setReceipt(r);
            setCheckout(false);
            setBuy(false);
          }}
        />
      )}
      {receipt && (
        <ReceiptView receipt={receipt} onClose={() => setReceipt(null)} />
      )}
    </>
  );
}
export function Team({ w }: { w: Workspace }) {
  const { mutate } = useStore();
  const [invite, setInvite] = useState(false),
    [email, setEmail] = useState(""),
    [role, setRole] = useState<Role>("Member"),
    [error, setError] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    try {
      mutate((s) => {
        const ww = s.workspaces.find((x) => x.id === w.id)!;
        if (ww.members.some((x) => x.email === email.trim().toLowerCase()))
          throw Error("This person is already in your workspace.");
        ww.members.push({
          id: uid(),
          email: email.trim().toLowerCase(),
          role,
          status: "Invited",
        });
        activity(ww, "Team invitation created", email);
      });
      setInvite(false);
      setEmail("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <>
      <Heading
        title="Team"
        subtitle="A shared inbox works better together."
        action={
          <Button onClick={() => setInvite(true)}>
            <Plus size={16} /> Invite teammate
          </Button>
        }
      />
      <Notice>
        Team invitations and role changes are simulated. No invitation email is
        sent.
      </Notice>
      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th>Role</th>
                <th>Status</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {w.members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <b>{m.email}</b>
                  </td>
                  <td>
                    {m.role === "Owner" ? (
                      <Badge>Owner</Badge>
                    ) : (
                      <select
                        aria-label={`Role for ${m.email}`}
                        value={m.role}
                        onChange={(e) =>
                          mutate((s) => {
                            const ww = s.workspaces.find((x) => x.id === w.id)!;
                            ww.members.find((x) => x.id === m.id)!.role = e
                              .target.value as Role;
                            activity(ww, "Team role updated", m.email);
                          })
                        }
                      >
                        <option>Admin</option>
                        <option>Member</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <Badge>{m.status}</Badge>
                  </td>
                  <td>
                    {m.role === "Owner" ? (
                      "Workspace owner"
                    ) : m.status === "Invited" ? (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          mutate((s) => {
                            const ww = s.workspaces.find((x) => x.id === w.id)!;
                            ww.members.find((x) => x.id === m.id)!.status =
                              "Active";
                            activity(ww, "Invitation accepted", m.email);
                          })
                        }
                      >
                        Simulate acceptance
                      </Button>
                    ) : (
                      "Messaging workspace"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {invite && (
        <Modal title="Invite a teammate" onClose={() => setInvite(false)}>
          <form onSubmit={submit}>
            <Field label="Email address">
              <input
                type="email"
                required
                value={email}
                placeholder="teammate@business.example"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Workspace role">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option>Member</option>
                <option>Admin</option>
              </select>
            </Field>
            <p>
              Members work with contacts, campaigns and inbox conversations.
              Admins also manage workspace settings in the future backend.
            </p>
            {error && <Notice tone="error">{error}</Notice>}
            <Button type="submit">Create demo invitation</Button>
          </form>
        </Modal>
      )}
    </>
  );
}
