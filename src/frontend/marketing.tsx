"use client";
import Link from "next/link";
import { useState } from "react";
import {
  MessageSquare,
  Menu,
  X,
  Check,
  Send,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { brand, brandVariables } from "@/config/brand";
import { Provider } from "@/lib/store";
import { Auth, ConversationDemo, DemoButton } from "@/legacy/public";
import { Button, Input } from "@/components/ui";
import { features, helpArticles } from "./content";

export function Marketing({ page = "" }: { page?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const feature = features.find((f) => f.slug === page);
  const auth = ["login", "signup", "register"].includes(page);
  return (
    <Provider>
      <div className="legacy-app marketing" style={brandVariables("light")}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="preview-ribbon">
          Frontend preview · synthetic data · no live messages or payments
        </div>
        <header className="marketing-nav wrap">
          <Link href="/" className="wordmark">
            <MessageSquare size={24} aria-hidden="true" />
            {brand.wordmark}
          </Link>
          <button
            className="marketing-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls="marketing-navigation"
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav
            id="marketing-navigation"
            className={open ? "expanded" : ""}
            aria-label="Main navigation"
          >
            <Link href="/features">Product</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/help">Resources</Link>
            <Link href="/login">Log in</Link>
            <Link className="btn primary" href="/signup">
              Explore the platform
            </Link>
          </nav>
        </header>
        <main id="main">
          {!page ? (
            <>
              <section className="marketing-hero wrap">
                <div className="hero-intro">
                  <span className="eyebrow">
                    Business messaging, considered.
                  </span>
                  <h1>
                    A small message.
                    <br />
                    <em>A meaningful connection.</em>
                  </h1>
                  <p>
                    Turn an update into a conversation. Bring campaigns,
                    customer replies and your team together in one clear
                    workspace.
                  </p>
                  <div className="actions">
                    <DemoButton />
                    <Link href="/features" className="btn secondary">
                      Meet your workspace
                    </Link>
                  </div>
                  <small>
                    Explore with fictional data. No account or credit card
                    needed.
                  </small>
                </div>
                <div className="hero-demo">
                  <div className="demo-caption">
                    <span>Inside your next conversation</span>
                    <span>Interactive demo</span>
                  </div>
                  <ConversationDemo />
                </div>
              </section>
              <section className="marketing-principles wrap">
                <p>Reach with intention.</p>
                <p>Reply with context.</p>
                <p>Grow with control.</p>
              </section>
              <section className="marketing-story wrap">
                <div>
                  <span className="eyebrow">From audience to conversation</span>
                  <h2>Good messaging doesn’t end at send.</h2>
                  <p>
                    Your campaign opens the door. A shared inbox gives every
                    reply a place to go, and every teammate the context to help.
                  </p>
                  <Link href="/shared-inbox">Explore the shared inbox</Link>
                </div>
                <div className="workflow-demo">
                  <div>
                    <Send aria-hidden="true" />
                    <b>A useful invitation</b>
                    <p>
                      Hi Jamie, your Friday appointment is ready to confirm.
                    </p>
                  </div>
                  <div>
                    <Inbox aria-hidden="true" />
                    <b>A real conversation</b>
                    <p>“2pm works perfectly. Can I bring a friend?”</p>
                  </div>
                  <div>
                    <ShieldCheck aria-hidden="true" />
                    <b>A thoughtful follow-through</b>
                    <p>
                      Assigned to Morgan. Context saved. Preferences respected.
                    </p>
                  </div>
                </div>
              </section>
              <section className="marketing-feature-index wrap">
                <div className="section-intro">
                  <span className="eyebrow">The whole conversation</span>
                  <h2>
                    One workspace.
                    <br />
                    Room for every detail.
                  </h2>
                </div>
                {features.map((f) => (
                  <Link href={"/" + f.slug} key={f.slug}>
                    <h3>{f.title}</h3>
                    <p>{f.description}</p>
                    <span>Explore {f.title.toLowerCase()}</span>
                  </Link>
                ))}
              </section>
              <section className="marketing-usecases wrap">
                <div>
                  <span className="eyebrow">Built around your day</span>
                  <h2>
                    Useful in the moments
                    <br />
                    that matter.
                  </h2>
                </div>
                <div>
                  {[
                    [
                      "Appointments",
                      "Send reminders and answer a last-minute question.",
                    ],
                    [
                      "Retail",
                      "Invite opted-in customers to something worth discovering.",
                    ],
                    [
                      "Local services",
                      "Keep customers informed as plans move forward.",
                    ],
                  ].map(([a, b]) => (
                    <article key={a}>
                      <h3>{a}</h3>
                      <p>{b}</p>
                    </article>
                  ))}
                  <Link href="/solutions">Find your workflow</Link>
                </div>
              </section>
              <PricingPreview />
              <FAQ />
              <section className="marketing-close wrap">
                <h2>
                  Your next conversation
                  <br />
                  starts here.
                </h2>
                <DemoButton />
              </section>
            </>
          ) : auth ? (
            <Auth login={page === "login"} />
          ) : feature ? (
            <>
              <section className="marketing-page-head wrap">
                <span className="eyebrow">{feature.title}</span>
                <h1>{feature.headline}</h1>
                <p>{feature.description}</p>
                <DemoButton />
              </section>
              <section className="marketing-story wrap">
                <div>
                  <h2>Clarity at every step.</h2>
                  {feature.points.map((p) => (
                    <p className="feature-point" key={p}>
                      <Check size={20} aria-hidden="true" />
                      {p}
                    </p>
                  ))}
                  <Link href={"/app/" + feature.route}>
                    Open the {feature.title.toLowerCase()} preview
                  </Link>
                </div>
                <ConversationDemo />
              </section>
              <FAQ />
            </>
          ) : page === "features" ? (
            <section className="marketing-page-head wrap">
              <span className="eyebrow">The product</span>
              <h1>Everything around a conversation.</h1>
              <p>
                A connected set of tools for responsible business messaging.
              </p>
              <div className="feature-directory">
                {features.map((f) => (
                  <Link key={f.slug} href={"/" + f.slug}>
                    <h2>{f.title}</h2>
                    <p>{f.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : page === "pricing" ? (
            <>
              <section className="marketing-page-head wrap">
                <span className="eyebrow">Pricing preview</span>
                <h1>Make room for growth.</h1>
                <p>
                  Illustrative plans for design review. Final plans, taxes,
                  registration, carrier and number charges will be confirmed
                  before commercial launch.
                </p>
              </section>
              <PricingPreview />
              <FAQ />
            </>
          ) : page === "solutions" ? (
            <section className="marketing-page-head wrap">
              <span className="eyebrow">Business solutions</span>
              <h1>Fit messaging into your work.</h1>
              <div className="feature-directory">
                {[
                  [
                    "Retail & hospitality",
                    "Share new arrivals with subscribers, manage event reminders and respond personally.",
                    "bulk-sms",
                  ],
                  [
                    "Appointments & services",
                    "Coordinate bookings and service updates without losing the conversation.",
                    "two-way-messaging",
                  ],
                  [
                    "Distributed teams",
                    "Keep ownership clear across locations, numbers and teammates.",
                    "shared-inbox",
                  ],
                ].map(([a, b, c]) => (
                  <article key={a}>
                    <h2>{a}</h2>
                    <p>{b}</p>
                    <Link href={"/" + c}>Explore the workflow</Link>
                  </article>
                ))}
              </div>
            </section>
          ) : page === "integrations" ? (
            <section className="marketing-page-head wrap">
              <span className="eyebrow">Integrations</span>
              <h1>Connected, with control.</h1>
              <p>
                Bring your data in through spreadsheet imports. Explore the API
                and webhook settings prepared for future integrations.
              </p>
              <div className="feature-directory">
                {[
                  [
                    "CSV & XLSX",
                    "Interactive local import previews with mapping and review.",
                    "contacts",
                  ],
                  [
                    "Developer API",
                    "Planned authenticated API. No live keys or endpoints in this preview.",
                    "integrations",
                  ],
                  [
                    "Webhooks",
                    "Preview event subscriptions and delivery history. No network requests are sent.",
                    "integrations",
                  ],
                ].map(([a, b, c]) => (
                  <article key={a}>
                    <h2>{a}</h2>
                    <p>{b}</p>
                    <Link href={"/app/" + c}>Explore settings</Link>
                  </article>
                ))}
              </div>
            </section>
          ) : page === "about" ? (
            <section className="marketing-page-head wrap prose">
              <span className="eyebrow">Our approach</span>
              <h1>Make business feel more human.</h1>
              <p>
                {brand.name} is being built around a simple idea: useful
                communication needs both reach and care.
              </p>
              <h2>Clarity before complexity.</h2>
              <p>
                One workspace for contacts, campaigns and conversations. Clear
                consent records, transparent usage and thoughtful tools for the
                people behind each message.
              </p>
              <h2>A platform in development.</h2>
              <p>
                This is an interactive frontend preview. The company identity,
                commercial terms and final brand will be published before
                launch. We do not claim customers, partnerships or performance
                results that have not been established.
              </p>
              <Link href="/contact">Get in touch</Link>
            </section>
          ) : page === "help" ? (
            <section className="marketing-page-head wrap">
              <span className="eyebrow">Help center</span>
              <h1>A little clarity goes a long way.</h1>
              <Input
                label="Search help articles"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="help-results">
                {helpArticles
                  .filter((a) =>
                    a.join(" ").toLowerCase().includes(query.toLowerCase()),
                  )
                  .map(([a, b]) => (
                    <details key={a}>
                      <summary>{a}</summary>
                      <p>{b}</p>
                    </details>
                  ))}
                {!helpArticles.some((a) =>
                  a.join(" ").toLowerCase().includes(query.toLowerCase()),
                ) && <p>No matching articles. Try “credits” or “contacts”.</p>}
              </div>
              <Link href="/contact">Contact support</Link>
            </section>
          ) : ["contact", "forgot-password"].includes(page) ? (
            <section className="marketing-page-head wrap prose">
              <span className="eyebrow">
                {page === "contact" ? "Contact" : "Account recovery"}
              </span>
              <h1>
                {page === "contact" ? "Let’s talk." : "Find your way back."}
              </h1>
              <p>
                {page === "contact"
                  ? "Preview the support request flow. This form does not contact a support team."
                  : "Preview the recovery flow. Authentication and email delivery will be connected after frontend approval."}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <Input
                  label="Email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
                {page === "contact" && (
                  <>
                    <Input label="Subject" required />
                    <label className="field">
                      Message
                      <textarea required rows={5} />
                    </label>
                  </>
                )}
                <Button type="submit">
                  {page === "contact"
                    ? "Preview request"
                    : "Preview recovery email"}
                </Button>
                {submitted && (
                  <p role="status">
                    {page === "contact"
                      ? "Demo request recorded in this view. No message was sent."
                      : "Demo recovery confirmation. No email was sent and no account was changed."}
                  </p>
                )}
              </form>
              <Link href="/login">Back to login</Link>
            </section>
          ) : (
            <Policy page={page} />
          )}
        </main>
        <footer className="marketing-footer wrap">
          <div>
            <Link className="wordmark" href="/">
              {brand.wordmark}
            </Link>
            <p>
              Good conversations.
              <br />
              Thoughtfully connected.
            </p>
            <small>Development preview. Final brand pending.</small>
          </div>
          <nav aria-label="Product links">
            {features.map((f) => (
              <Link key={f.slug} href={"/" + f.slug}>
                {f.title}
              </Link>
            ))}
          </nav>
          <nav aria-label="Company links">
            {["about", "contact", "help", "integrations", "pricing"].map(
              (p) => (
                <Link key={p} href={"/" + p}>
                  {p === "help"
                    ? "Help center"
                    : p.charAt(0).toUpperCase() + p.slice(1)}
                </Link>
              ),
            )}
          </nav>
          <nav aria-label="Legal and preview links">
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms of service</Link>
            <Link href="/acceptable-use">Acceptable use</Link>
            <Link href="/admin">Admin preview</Link>
            <Link href="/design-system">Design system</Link>
          </nav>
        </footer>
      </div>
    </Provider>
  );
}
function PricingPreview() {
  return (
    <section className="marketing-pricing wrap">
      <div>
        <span className="eyebrow">A plan for your pace</span>
        <h2>
          Start focused.
          <br />
          Grow together.
        </h2>
        <p>
          Illustrative subscription pricing. Messaging usage and number rental
          are separate.
        </p>
      </div>
      <div className="pricing-plans">
        {[
          ["Starter", "29", "One workspace · 2 team seats"],
          ["Team", "79", "Shared workflows · 10 team seats"],
          ["Scale", "199", "Advanced controls · 25 team seats"],
        ].map(([name, price, detail]) => (
          <article key={name}>
            <h3>{name}</h3>
            <p>
              <strong>${price}</strong> / month
            </p>
            <p>{detail}</p>
            <Link
              className="btn secondary"
              href={"/signup?plan=" + name.toLowerCase()}
            >
              Explore {name}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
function FAQ() {
  return (
    <section className="marketing-faq wrap">
      <h2>A few good questions.</h2>
      <div>
        {[
          [
            "Can I try it without sending messages?",
            "Yes. Explore the interactive workspace with fictional contacts and simulated messages. No provider account is required.",
          ],
          [
            "Do I need my own messaging provider account?",
            "The planned service uses platform-managed messaging infrastructure. Customers will not need their own Twilio accounts. Provider onboarding is not connected in this preview.",
          ],
          [
            "What happens when someone opts out?",
            "The preview suppresses that contact across the workspace. Invalid numbers and delivery failures remain separate categories.",
          ],
          [
            "Can my team work together?",
            "Explore conversation assignment, internal notes and role controls in the customer workspace. Production permissions will be enforced server-side in a later phase.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
function Policy({ page }: { page: string }) {
  const title =
    page === "privacy"
      ? "Privacy policy"
      : page === "terms"
        ? "Terms of service"
        : "Acceptable use policy";
  return (
    <section className="marketing-page-head wrap prose">
      <span className="eyebrow">Policy preview</span>
      <h1>{title}</h1>
      <p className="notice">
        Draft for owner and legal review. This is not the operative policy of a
        launched service. Legal entity, jurisdiction, retention periods,
        subprocessors and contact details require approval before launch.
      </p>
      {(page === "privacy"
        ? [
            [
              "Data in this preview",
              "Synthetic workspace records are stored in this browser. Do not enter customer information, payment details or production credentials.",
            ],
            [
              "Your controls",
              "You can remove the preview’s saved data through your browser settings. Production access, deletion and export procedures must be finalized before launch.",
            ],
            [
              "Production disclosures",
              "The final policy must describe collection, purposes, retention, sharing, international transfers, security and rights for the actual service.",
            ],
          ]
        : page === "terms"
          ? [
              [
                "Service scope",
                "This preview demonstrates the proposed interface. It does not provide production messaging, subscriptions or service guarantees.",
              ],
              [
                "Commercial terms",
                "Final prices, taxes, billing periods, renewals, refunds, termination and liability terms require approval before any paid account is offered.",
              ],
              [
                "Responsibilities",
                "The final terms must define account ownership, acceptable use, support and dispute handling for the launched service.",
              ],
            ]
          : [
              [
                "Permission and relevance",
                "Only message recipients with appropriate permission. Keep records of consent and honor opt-outs.",
              ],
              [
                "Prohibited activity",
                "Do not use the platform for fraud, impersonation, harassment, illegal content or attempts to bypass suppression and sending controls.",
              ],
              [
                "Review and enforcement",
                "The planned service includes verification, complaint review and suspension controls. Production enforcement and appeals procedures must be finalized before launch.",
              ],
            ]
      ).map(([a, b]) => (
        <section key={a}>
          <h2>{a}</h2>
          <p>{b}</p>
        </section>
      ))}
      <Link href="/contact">Contact</Link>
    </section>
  );
}
