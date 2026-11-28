"use client";
import Link from "./navigation";
import { useState, type FormEvent } from "react";
import { useRouter } from "./navigation";
import { brand, count, money } from "@/lib/config";
import { useStore } from "@/lib/store";
import { register, seedDemo, quote, type Cart } from "@/lib/model";
import { services } from "@/lib/services";
import {
  Logo,
  Button,
  ActionLink,
  Field,
  Notice,
  MessageSquare,
  Check,
  Send,
  Inbox,
  Menu,
  X,
  Phone,
  ShieldCheck,
} from "./ui";
export function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="public-header wrap">
      <Logo />
      <button
        className="mobile-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        aria-controls="public-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav
        id="public-navigation"
        className={open ? "open" : ""}
        aria-label="Main navigation"
      >
        <Link href="/features/">Features</Link>
        <Link href="/pricing/">Pricing</Link>
        <Link href="/login/">Log in</Link>
        <ActionLink href="/signup/">Start with your email</ActionLink>
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="wrap public-footer">
      <div>
        <Logo />
        <p>Good conversations start here.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/features/">Features</Link>
        <Link href="/pricing/">Pricing</Link>
      </nav>
      <small>Interactive frontend prototype. All activity is simulated.</small>
    </footer>
  );
}
export function DemoButton({ secondary = false }: { secondary?: boolean }) {
  const { mutate } = useStore(),
    router = useRouter();
  return (
    <Button
      variant={secondary ? "secondary" : "primary"}
      onClick={() => {
        mutate(seedDemo);
        router.push("/app/");
      }}
    >
      Explore demo workspace
    </Button>
  );
}
export function ConversationDemo() {
  const [mode, setMode] = useState("Campaign");
  const [sent, setSent] = useState(false);
  return (
    <div className="hero-product" data-ui>
      <div className="demo-toolbar">
        <span>
          <MessageSquare size={19} /> Juniper Studio
        </span>
        <span className="muted">Demo workspace</span>
      </div>
      <div className="segmented">
        <button
          aria-pressed={mode === "Campaign"}
          onClick={() => setMode("Campaign")}
        >
          <Send size={15} /> Campaign
        </button>
        <button
          aria-pressed={mode === "Inbox"}
          onClick={() => {
            setMode("Inbox");
            setSent(true);
          }}
        >
          <Inbox size={15} /> Inbox
        </button>
      </div>
      <div className="demo-content">
        <div className="demo-subtitle">
          {mode === "Campaign"
            ? "A little reminder. A real connection."
            : "Every reply has a place."}
        </div>
        <div className="conversation-date">Today</div>
        <div className="bubble out">
          Hi Jamie, a little time for yourself? We have a few Friday
          appointments open at Juniper Studio.
          <br />
          <br />
          Reply to book. STOP to opt out.
        </div>
        <div className="bubble-meta">
          {sent ? "Delivered" : "Message preview"} <Check size={12} />
        </div>
        {sent && (
          <div className="bubble in reply-entrance">
            Friday sounds lovely! Is 2pm available?
          </div>
        )}
        <div className="demo-action">
          {mode === "Campaign" ? (
            <Button
              onClick={() => {
                setSent(true);
                setMode("Inbox");
              }}
            >
              <Send size={16} /> Try a simulated send
            </Button>
          ) : (
            <>
              <span className="mini-avatar">JL</span>
              <span>
                Jamie Lane
                <br />
                <small>Reply received in your shared inbox</small>
              </span>
            </>
          )}
        </div>
      </div>
      <div className="demo-bottom">
        <span>One message. One conversation.</span>
        <span>
          <ShieldCheck size={15} /> All simulated
        </span>
      </div>
    </div>
  );
}
export function Home() {
  const { state } = useStore();
  return (
    <>
      <PublicNav />
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <h1>
              Send a text.
              <br />
              Start something.
            </h1>
            <p>
              Business texting that brings your customers closer. Get a number,
              send a campaign, and keep the conversation going.
            </p>
            <div className="actions">
              <ActionLink href="/signup/">Start with your email</ActionLink>
              <a className="btn ghost" href="#product-demo">
                Explore the demo
              </a>
            </div>
            <div className="hero-price">
              {money(state.pricing.numberFee)} for your number, once.
              <br />
              Credits from {money(state.pricing.packs[0].cents)}. No monthly
              commitment.
            </div>
          </div>
          <div id="product-demo">
            <ConversationDemo />
          </div>
        </section>
        <section className="journey-band">
          <div className="wrap journey">
            <div>
              <span className="journey-icon">
                <MailIcon />
              </span>
              <h3>Your email is enough.</h3>
              <p>Open your workspace. Look around before you pay.</p>
            </div>
            <div>
              <span className="journey-icon">
                <Phone size={22} />
              </span>
              <h3>A number of your own.</h3>
              <p>Choose a toll-free number and verify your business here.</p>
            </div>
            <div>
              <span className="journey-icon">
                <MessageSquare size={22} />
              </span>
              <h3>Make it a conversation.</h3>
              <p>Reach your list. Reply personally. Keep your team in sync.</p>
            </div>
          </div>
        </section>
        <section className="wrap product-story">
          <div>
            <h2>
              One workspace.
              <br />
              Both sides of the conversation.
            </h2>
            <p>
              A campaign gets things started. Your shared inbox keeps them
              moving, with contact details and conversation history right where
              you need them.
            </p>
            <DemoButton secondary />
          </div>
          <div className="story-inbox" data-ui>
            <div className="story-list">
              <h3>Inbox</h3>
              <div className="story-person selected">
                <b>Jamie Lane</b>
                <small>Friday sounds lovely!</small>
                <span>Open</span>
              </div>
              <div className="story-person">
                <b>Casey Reed</b>
                <small>Thanks for getting back to me.</small>
                <span>Closed</span>
              </div>
            </div>
            <div className="story-thread">
              <p>
                <b>Jamie Lane</b>
                <small>Juniper Studio</small>
              </p>
              <div className="bubble in">
                Friday sounds lovely! Is 2pm available?
              </div>
              <div className="bubble out">
                It is! We’ll save a spot for you.
              </div>
              <span className="muted">A team inbox, with a human touch.</span>
            </div>
          </div>
        </section>
        <section className="wrap pricing-teaser">
          <div>
            <h2>
              A clear price.
              <br />A fresh start.
            </h2>
            <p>
              Your first number and 1,000 credits, for{" "}
              {money(state.pricing.numberFee + state.pricing.packs[1].cents)}.
              Come back for more credits whenever you need them.
            </p>
            <ActionLink href="/pricing/" secondary>
              Find your credit pack
            </ActionLink>
          </div>
          <div className="price-equation">
            <div>
              <strong>{money(state.pricing.numberFee)}</strong>
              <span>Number, one time</span>
            </div>
            <b>+</b>
            <div>
              <strong>{money(state.pricing.packs[1].cents)}</strong>
              <span>1,000 credits</span>
            </div>
          </div>
        </section>
        <section className="closing wrap">
          <h2>
            Your next conversation
            <br />
            starts with your email.
          </h2>
          <ActionLink href="/signup/">Start with your email</ActionLink>
        </section>
      </main>
      <Footer />
    </>
  );
}
function MailIcon() {
  return <span aria-hidden="true">@</span>;
}
export function Features() {
  return (
    <>
      <PublicNav />
      <main className="wrap features-page">
        <HeadingBlock
          title="A good message is just the start."
          subtitle="Everything from your first number to your next customer reply, in one place."
        />
        <div className="feature-row">
          <div>
            <h2>Reach the right people.</h2>
            <p>
              Import CSV contacts, organize groups and tags, and review who can
              receive your campaign. Opt-outs apply across your business’s
              numbers.
            </p>
            <ul>
              <li>Separate subscribers from new leads</li>
              <li>Review duplicates and invalid numbers</li>
              <li>Personalize with a first name and a friendly fallback</li>
            </ul>
          </div>
          <div className="feature-proof" data-ui>
            <h3>Audience review</h3>
            <p>
              <span>Subscribed</span>
              <b>Included</b>
            </p>
            <p>
              <span>Opted out</span>
              <b>Excluded</b>
            </p>
            <p>
              <span>Lead</span>
              <b>Individual replies only</b>
            </p>
          </div>
        </div>
        <div className="feature-row">
          <ConversationDemo />
          <div>
            <h2>From campaign to conversation.</h2>
            <p>
              Preview your message, check the estimated credits, and send now or
              schedule for later. Replies arrive in a shared inbox with open and
              closed states.
            </p>
            <p>
              Delivery reports explain failures and exclusions contact by
              contact.
            </p>
            <DemoButton />
          </div>
        </div>
        <div className="feature-row">
          <div>
            <h2>Ready when you are.</h2>
            <p>
              Save your verification draft, invite your team, and buy prepaid
              credits. Clear receipts keep every one-time purchase easy to
              track.
            </p>
          </div>
          <div className="feature-proof">
            <h3>Your setup, clearly shown</h3>
            <p>
              Email confirmation <Check size={20} />
            </p>
            <p>
              Toll-free number <Phone size={20} />
            </p>
            <p>
              SMS verification <ShieldCheck size={20} />
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
function HeadingBlock({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="public-title">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
export function PackPicker({
  cart,
  setCart,
}: {
  cart: Cart;
  setCart: (c: Cart) => void;
}) {
  const { state } = useStore();
  const [pack, setPack] = useState(1000);
  const [quantity, setQuantity] = useState(1);
  return (
    <>
      <div className="form-grid">
        <Field label="Credit pack">
          <select value={pack} onChange={(e) => setPack(+e.target.value)}>
            {state.pricing.packs.map((p) => (
              <option key={p.credits} value={p.credits}>
                {count(p.credits)} credits — {money(p.cents)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity">
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(+e.target.value)}
          />
        </Field>
      </div>
      <Button
        variant="secondary"
        disabled={!Number.isInteger(quantity) || quantity < 1 || quantity > 100}
        onClick={() => {
          const old = cart.find((x) => x.credits === pack);
          setCart(
            old
              ? cart.map((x) =>
                  x.credits === pack
                    ? { ...x, quantity: Math.min(100, x.quantity + quantity) }
                    : x,
                )
              : [...cart, { credits: pack, quantity }],
          );
        }}
      >
        Add to purchase
      </Button>
      {cart.map((item) => {
        const p = state.pricing.packs.find((p) => p.credits === item.credits)!;
        return (
          <div className="cart-row" key={item.credits}>
            <div>
              <b>
                {count(item.credits)} credits × {item.quantity}
              </b>
              <small>{money((p.cents * 1000) / p.credits)} per 1,000</small>
            </div>
            <b>{money(p.cents * item.quantity)}</b>
            <button
              className="icon-button"
              aria-label={`Remove ${item.credits} credit pack`}
              onClick={() =>
                setCart(cart.filter((x) => x.credits !== item.credits))
              }
            >
              <X size={17} />
            </button>
          </div>
        );
      })}
    </>
  );
}
export function Pricing() {
  const { state } = useStore();
  const [cart, setCart] = useState<Cart>([{ credits: 1000, quantity: 1 }]);
  const [number, setNumber] = useState(false);
  const total = quote(state, cart);
  return (
    <>
      <PublicNav />
      <main className="wrap pricing-page">
        <HeadingBlock
          title="Pay for what you send."
          subtitle="Prepaid credits. One-time number fee. No renewal scheduled."
        />
        <div className="pricing-layout">
          <div>
            <h2>
              Your next conversation,
              <br />
              at your pace.
            </h2>
            <p>
              Start with up to 10,000 credits per pack. Buy multiple packs at
              once or top up whenever you need.
            </p>
            <div className="number-price">
              <Phone />
              <div>
                <b>{money(state.pricing.numberFee)} one time per number</b>
                <p>
                  Choose your toll-free number inside the app. Messaging credits
                  are purchased separately.
                </p>
              </div>
            </div>
            <p>
              One SMS segment uses one credit per recipient. Longer messages and
              some characters use more segments; you’ll see an estimate before
              sending.
            </p>
          </div>
          <div className="panel purchase-panel">
            <h2>Choose your credits</h2>
            <PackPicker cart={cart} setCart={setCart} />
            <label className="check-field">
              <input
                type="checkbox"
                checked={number}
                onChange={(e) => setNumber(e.target.checked)}
              />{" "}
              Include one number in this estimate
            </label>
            <div className="checkout-total">
              <span>
                {count(total.totalCredits)} credits
                <strong>
                  {money(
                    total.totalCents + (number ? state.pricing.numberFee : 0),
                  )}
                </strong>
              </span>
              <small>Total estimate in USD</small>
            </div>
            <ActionLink href="/signup/">Start with your email</ActionLink>
            <small>
              Explore your workspace before making a simulated purchase.
            </small>
          </div>
        </div>
        <details className="comparison">
          <summary>Compare all 12 credit packs</summary>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Credits</th>
                  <th>Pack price</th>
                  <th>Price per 1,000</th>
                </tr>
              </thead>
              <tbody>
                {state.pricing.packs.map((p) => (
                  <tr key={p.credits}>
                    <td>{count(p.credits)}</td>
                    <td>{money(p.cents)}</td>
                    <td>{money((p.cents * 1000) / p.credits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <div className="pricing-example">
          <h3>How your first purchase adds up</h3>
          <p>
            One number + 1,000 credits ={" "}
            <b>
              {money(state.pricing.numberFee + state.pricing.packs[1].cents)}
            </b>
            . Another 1,000 credits later ={" "}
            <b>{money(state.pricing.packs[1].cents)}</b>. The number fee is not
            charged again.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
export function Auth({ login = false }: { login?: boolean }) {
  const { mutate } = useStore(),
    router = useRouter();
  const [email, setEmail] = useState("");
  const [challenge, setChallenge] = useState<{
    email: string;
    expiresAt: number;
  } | null>(null);
  const [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!challenge) {
        setChallenge(services.auth.issue(email.trim().toLowerCase()));
        setNotice("Demo code is ready. No email was sent.");
      } else {
        const confirmed = services.auth.verify(challenge, code);
        mutate((s) => register(s, confirmed));
        router.push("/app/");
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo />
        <Link href="/">Back to website</Link>
      </div>
      <div className="auth-layout">
        <div className="auth-editorial">
          <h1>
            A small message.
            <br />A new beginning.
          </h1>
          <p>
            Your number, your customers, your conversations.
            <br />
            All together in one calm workspace.
          </p>
          <div className="auth-note">
            <MessageSquare size={26} />
            <p>
              Take a look around first.
              <br />
              There’s nothing to pay at signup.
            </p>
          </div>
        </div>
        <div className="auth-form panel">
          <h2>
            {challenge
              ? "Check your demo code"
              : login
                ? "Welcome back."
                : "Let’s start with your email."}
          </h2>
          <p>
            {challenge
              ? `Confirm ${challenge.email} to open your workspace.`
              : login
                ? "Use the same email to return to your workspace."
                : "No business details or payment needed yet."}
          </p>
          <form onSubmit={submit}>
            {!challenge ? (
              <Field label="Email address">
                <input
                  autoComplete="email"
                  type="email"
                  required
                  placeholder="you@business.example"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            ) : (
              <Field
                label="Six-digit email code"
                hint={`Demo code: ${brand.demoCode}. Valid for 10 minutes.`}
              >
                <input
                  className="code-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                />
              </Field>
            )}
            {error && <Notice tone="error">{error}</Notice>}
            {notice && (
              <p className="muted" role="status">
                {notice}
              </p>
            )}
            <Button type="submit">
              {challenge ? "Confirm email" : "Continue with email"}
            </Button>
          </form>
          {challenge && (
            <div className="actions">
              <Button
                variant="ghost"
                onClick={() => {
                  setChallenge(services.auth.issue(email));
                  setCode("");
                  setError("");
                  setNotice(
                    "New demo code issued. You have another 10 minutes.",
                  );
                }}
              >
                Resend code
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setChallenge(null);
                  setCode("");
                  setError("");
                }}
              >
                Change email
              </Button>
            </div>
          )}
          <Link href="/forgot-password/">Need help signing in?</Link>
          <div className="auth-demo">
            <p>Just taking a look?</p>
            <DemoButton secondary />
          </div>
          <small>
            Prototype only. Email confirmation and all subsequent actions are
            simulated. Use fictional details.
          </small>
        </div>
      </div>
    </div>
  );
}
