# Design system

## Direction

Paper, ink and cobalt. Bricolage Grotesque gives headings an editorial cadence;
Geist keeps controls/data quiet and readable. Thin rules, generous page margins,
small corner radii and restrained accents establish hierarchy. No copied layouts,
permanent logo, stock imagery, gradients or decorative animation.

Central branding: src/config/brand.ts owns name, wordmark, optional logo,
development favicon path, light/dark colors, domain, legal/company information,
support, social links, email branding and SEO. Owner fields remain null.
A neutral speech-bubble favicon is a replaceable development asset.

## Tokens

| System       | Specification                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| Type         | Headline clamp 44–88px; section heading 24–32px; card title 20px; body 16px; controls 14px; captions 12–13px |
| Light colors | Paper #f5f4ef, surface #ffffff, ink #17251f, muted #52605a, cobalt #2458d3                                   |
| Dark colors  | Ground #111a17, surface #19241f, ink #eef3ee, muted #b3c0b7, accent #a2bcff                                  |
| Semantics    | Success/danger independent of accent; status also has a text label                                           |
| Space        | 4, 8, 12, 16, 24, 32, 48, 64px; larger section spacing 56–80px                                               |
| Grid         | 1280px maximum page; 40px desktop and 24px mobile gutters; two-column editorial sections                     |
| Radius       | 6px controls/surfaces; 8px dialogs; no oversized rounded cards                                               |
| Icons        | Lucide, usually 16–24px; decorative icons hidden from assistive technology                                   |
| Motion       | CSS 160ms controls and a brief 500ms marketing entrance; reduced-motion disables animation/transitions       |
| Responsive   | 850px compact layout; 600px stacked controls/sections; 390px baseline mobile verification                    |
| Charts       | Accessible SVG plus text data table; zero-safe scales, nonnegative finite values; no color-only meaning      |

The gallery scopes its theme so switching does not leak to unrelated surfaces.
The Phase 2 shell persists light/dark choice in `sms-theme`; token aliases are
scoped at the application root.

## Components and accessibility

src/components/ui.tsx: button variants/busy/disabled; labelled inputs with
hint/error association; select; badge; native modal; empty/loading/error states;
dismissible notification. Buttons default to type=button; forms opt into submit.

src/components/foundation.tsx: navigation with aria-current; native disclosure
dropdown; arrow/Home/End tabs with roving tabindex; captioned data table and
scroll region; bounded pagination; SVG chart with accessible data.

Modal uses showModal for inert background, explicit Tab/Shift+Tab wrapping,
Escape close, labelled title and restoration to its opener. Dropdown Escape
returns focus to its summary. Inputs carry aria-invalid/aria-describedby.
Touch controls are at least 44px high; focus is visible and not color alone.
Tables retain real headers/captions rather than becoming inaccessible div grids.

Target WCAG 2.2 AA. Automated axe checks, keyboard tests and responsive overflow
checks are evidence, not a full human accessibility certification. Inspect
screenshots and conduct assistive-technology review before commercial launch.

Recovered legacy screens retain scoped styles under /preview and reuse the
shared dialog. Their compatibility components preserve working behavior; use the
shared foundation when refining these screens in Phase 2.

## Phase 2 surfaces

Marketing uses offset editorial columns, concise feature stories and a custom
conversation demonstration. Workspace/admin shells use a collapsible navigation
rail, restrained metric rows, explicit chart definitions and compact operational
tables. Workspace switching, global search, notifications and account controls
share the same shell. Mobile navigation becomes a labelled menu; wide tables
scroll within their region. Persistent data labels distinguish estimates and
simulations. Confirmation dialogs require reasons for administrative actions.

Desktop/tablet/mobile review widths: 1440, 768 and 390px. Automated checks cover
both application themes, keyboard dialogs, reduced motion and overflow.
