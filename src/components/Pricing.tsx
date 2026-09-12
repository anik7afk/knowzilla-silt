import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import './Pricing.css'

/* ===========================================================================
 * Pricing — Knowzilla's real published plans, Attio's presentation.
 * ===========================================================================
 *
 * PLACEMENT (owner, 2026-07-27): NOT in the landing flow. The donor keeps
 * pricing off its landing page entirely — "attio doesnt have it in the
 * landing so we should do the same" — so this section lives at /pricing
 * alone, reached from the nav's Pricing link.
 *
 * CONTENT PROVENANCE — https://knowzilla.eu/en/pricing, fetched 2026-07-26.
 * Nothing invented. Every plan name, price, unit string, description,
 * feature line, toggle label and CTA label is verbatim from that page. The
 * Free plan's five feature lines arrive via the v2 build's transcription of
 * the same page (v2/src/pages/PricingPage.tsx, the reference the owner
 * supplied 2026-07-27) — including its own "No Email Practice" negative row,
 * kept because it is the site's own row. The one authored string is the
 * Enterprise line, assembled from the page's own Enterprise copy.
 *
 * ⚠ CONFLICT ON RECORD. The site's HOMEPAGE pricing teaser quotes different
 * Live Assistant minute allowances than the pricing page does. The numbers
 * used here are the PRICING PAGE's — treated as canonical because that page's
 * own "Compare all features" table corroborates them line for line
 * (30 / 500 / 1500 / 4000 mins). If the homepage is ever the source of truth
 * instead, four strings change: the `Live Assistant` feature on each plan.
 *
 * PAGE STRUCTURE (owner, 2026-07-27, third ruling): the v2 build's pricing
 * page structure carries over below the cards — compare-all-features table,
 * Enterprise panel, 14-day-trial explainer — "add those and have the
 * structure look that the given localhost version has". The v2 page's FAQ
 * accordion was ported too and then CUT the same day at the owner's call
 * ("remove the faq section from the pricing page"); v2 remains the
 * reference if it ever returns. All ported content is verified verbatim
 * against the live page — see the block comment above COMPARE_COLS. The
 * route wraps this section in Nav + Footer, a real page.
 *
 * COMPOSITION (owner decision 2026-07-27, from their screenshot of
 * attio.com/pricing/eur): the donor's own pricing grammar, translated to our
 * tokens. FOUR equal flat cards — Free / Starter / Growth / Professional —
 * white on the warm ground, hairline borders, radius-card, no back-plates,
 * no filled card ("remove the blue card from ours"), no MOST POPULAR badge.
 * Card anatomy is the donor's: plan name → price with the annual-save chip →
 * unit caption → bold audience line → ticked features → CTA pinned to the
 * card's floor. The recommendation is carried exactly the donor's way:
 *   · the featured card takes a 1.5px SIGNAL-600 outline (painted as an
 *     inset box-shadow stroke — Chromium floors fractional border-width),
 *   · and its CTA is the one ink-filled button in the grid.
 * DEVIATION FLAGS for the checkpoint: R1 says structural lines stay neutral —
 *   this outline is argued as a data mark (it says "this one"), the donor's
 *   own idiom, on the signal ramp whose donor use IS this ("active" strokes).
 *   No lavender anywhere in the section (eyebrow runs gray): signal is the
 *   frame's one saturated family, per the 17°-adjacency rule.
 * The save chip is the signal-100/signal-700 badge pairing (donor's, and
 * already used by Stats' delta chip). Zero box-shadows in the section beyond
 * the focus ring and the outline stroke.
 *
 * MOTION CLASS: QUIET. One entrance, four groups (header → toggle → cards at
 * a per-card stagger → enterprise line), opacity + blur(2px) → 0 over 520ms
 * on --ease-entrance, fired once on viewport entry and latched by useInView,
 * which disconnects and never reports "left view". Nothing loops. The billing
 * swap is a 150ms crossfade between two numerals that are BOTH always in the
 * DOM, stacked in one grid cell — the price box is the wider string's width
 * at all times, so the swap can move nothing; the save chip fades in place in
 * space that is always reserved. Reduced motion renders the settled poster
 * with every transition at 0s; the toggle still works, instantly.
 * =========================================================================== */

type Plan = {
  id: string
  /** plan name, as the site writes it */
  name: string
  /** verbatim one-line positioning */
  desc: string
  /** € per seat per month, billed monthly */
  monthly: number
  /** € per seat per month, billed annually (the site's 20% off tier) */
  annual: number
  features: string[]
  cta: string
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    desc: 'Start exploring AI-powered sales navigation.',
    monthly: 0,
    annual: 0,
    cta: 'Get Started',
    features: [
      '10 Documents',
      '30 mins Live Assistant',
      'Basic CRM Intelligence',
      'No Email Practice',
      '30 mins Cold Calling',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    desc: 'For reps ready to start executing with AI guidance.',
    monthly: 49,
    annual: 39,
    cta: 'Start Free Trial',
    features: [
      '50 Documents',
      '50 Email Practices/mo',
      '60 mins Cold Calling',
      '500 mins Live Assistant',
      'CRM Auto-sync',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    desc: 'Full deal steering for high-growth revenue teams.',
    monthly: 99,
    annual: 79,
    cta: 'Start Free Trial',
    featured: true,
    features: [
      '150 Documents',
      '150 Email Practices/mo',
      '180 mins Cold Calling',
      '1500 mins Live Assistant',
      'Advanced Deal Insights',
      'Priority Support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    desc: 'Tailored execution workflows for enterprise teams.',
    monthly: 149,
    annual: 119,
    cta: 'Start Free Trial',
    features: [
      '500 Documents',
      '500 Email Practices/mo',
      '600 mins Cold Calling',
      '4000 mins Live Assistant',
      'Custom Playbooks',
      'Team Analytics Dashboard',
    ],
  },
]

/* ── the four page blocks below the cards ────────────────────────────────
 * PORTED from the v2 build's pricing page (v2/src/pages/PricingPage.tsx),
 * at the owner's direction 2026-07-27: "there are some other stuff that was
 * also in the version localhost:5173/pricing — add those and have the
 * structure look that the given localhost version has." Structure is v2's
 * (compare table → enterprise → trial explainer), skin is v5's.
 *
 * PROVENANCE — VERIFIED, nothing invented. Re-fetched
 * https://knowzilla.eu/en/pricing on 2026-07-27 at the owner's direction
 * ("check this to get facts and swap or remove thats not there"): every
 * ported string is on the live page verbatim — the full comparison table
 * including the CRM Intelligence / Support / Integrations rows, the whole
 * Enterprise feature list (SLA 99.9%, SSO/SAML, audit logging & compliance,
 * EU data residency, custom AI model training), both Enterprise CTAs, and
 * the three trial steps word for word. The v2 page was itself a faithful
 * transcription of the site, so port and source agree. The earlier
 * "not traceable" flags recorded here were wrong and are withdrawn.
 * The live page also carries an FAQ; ours was ported and then cut by the
 * owner the same day — an omission, not a deviation.
 */

const COMPARE_COLS = ['Free', 'Starter', 'Growth', 'Professional']

const COMPARE_ROWS: { label: string; values: string[] }[] = [
  { label: 'Documents', values: ['10', '50', '150', '500'] },
  { label: 'Email Practices/mo', values: ['—', '50', '150', '500'] },
  { label: 'Cold Calling', values: ['30 mins', '60 mins', '180 mins', '600 mins'] },
  { label: 'Live Assistant', values: ['30 mins', '500 mins', '1500 mins', '4000 mins'] },
  { label: 'CRM Intelligence', values: ['Basic', 'Auto-sync', 'Advanced', 'Full Suite'] },
  { label: 'Custom Playbooks', values: ['—', '—', '—', '✓'] },
  { label: 'Team Analytics', values: ['—', '—', 'Basic', 'Advanced'] },
  { label: 'Support', values: ['Community', 'Email', 'Priority', 'Dedicated'] },
  { label: 'Integrations', values: ['—', 'Standard', 'Standard', 'Custom'] },
]

const ENTERPRISE_FEATURES = [
  'Unlimited seats & documents',
  'Custom CRM & API integrations',
  'SSO / SAML authentication',
  'Dedicated success manager',
  'SLA guarantees (99.9% uptime)',
  'Audit logging & compliance',
  'EU data residency',
  'Custom AI model training',
]

const TRIAL_STEPS = [
  { step: '1', title: 'Sign up', body: 'Create your account in under 2 minutes.' },
  { step: '2', title: 'Explore', body: 'Full access to every feature for 14 days.' },
  { step: '3', title: 'Decide', body: 'Keep your plan or drop to Free. No charge either way.' },
]

/* One page block: gray label-face eyebrow + display title (+ optional lede),
   entering once with the section's own QUIET grammar, latched per block. */
function Block({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string
  title: string
  lede?: string
  children: ReactNode
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 })
  return (
    <div ref={ref} className={`pr-block${inView ? ' is-in' : ''}`}>
      <header className="pr-block__head">
        <p className="pr-block__eyebrow kz-eyebrow">{eyebrow}</p>
        <h3 className="pr-block__title">{title}</h3>
        {lede ? <p className="pr-block__lede">{lede}</p> : null}
      </header>
      {children}
    </div>
  )
}

export default function Pricing() {
  const { ref: sectionRef, inView } = useInView<HTMLElement>({ threshold: 0.15 })

  /* Annual is the default (owner, 2026-07-27) — the donor's pricing page
     opens on Annual too, with the save chip visible from first paint. */
  const [annual, setAnnual] = useState(true)

  /* ── the travelling indicator ───────────────────────────────────────────
     ObjectionLibrary's pattern, deliberately reused rather than re-invented:
     ONE persistent element measured against the active option's box and moved
     with a transform, while the options themselves paint no background at all.
     A per-option background toggle is what makes a segmented control read as a
     jump-cut. */
  const trackRef = useRef<HTMLDivElement>(null)
  const optRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [pill, setPill] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [armed, setArmed] = useState(false)

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current
      const el = optRefs.current[annual ? 1 : 0]
      if (!track || !el) return
      const tr = track.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      const next = {
        x: Math.round((er.left - tr.left) * 100) / 100,
        y: Math.round((er.top - tr.top) * 100) / 100,
        w: Math.round(er.width * 100) / 100,
        h: Math.round(er.height * 100) / 100,
      }
      setPill((prev) =>
        prev && prev.x === next.x && prev.y === next.y && prev.w === next.w && prev.h === next.h
          ? prev
          : next,
      )
    }
    measure()

    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    optRefs.current.forEach((o) => o && ro.observe(o))
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [annual])

  /* Armed one frame after the first measured paint, so the indicator never
     travels in from x=0 on mount. */
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setArmed(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const pick = useCallback((next: boolean) => setAnnual(next), [])

  return (
    <section
      ref={sectionRef}
      className={`pr${inView ? ' pr--in' : ''}${armed ? ' pr--armed' : ''}${
        annual ? ' pr--annual' : ''
      }`}
      aria-labelledby="pr-title"
    >
      <div className="pr__container">
        <header className="pr__head">
          <p className="pr-eyebrow kz-eyebrow">Transparent Pricing</p>
          <h2 id="pr-title" className="pr-heading">
            Choose your execution scale
          </h2>
          {/* Verbatim, em dash included. CHECKPOINT: the hero's em dash was
              removed by the user on sight; if that preference is a rule rather
              than a hero fix, this reads "…14-day free trial. No credit card
              required." with no other change. */}
          <p className="pr-sub">
            Start free. Scale with confidence. Every paid plan includes a 14-day free trial —
            no credit card required.
          </p>
        </header>

        <div ref={trackRef} className="pr-switch" role="group" aria-label="Billing period">
          <span
            className="pr-switch__pill"
            aria-hidden="true"
            style={
              pill
                ? {
                    transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`,
                    width: `${pill.w}px`,
                    height: `${pill.h}px`,
                    opacity: 1,
                  }
                : undefined
            }
          />
          {[false, true].map((isAnnual, i) => (
            <button
              key={isAnnual ? 'annual' : 'monthly'}
              ref={(el) => {
                optRefs.current[i] = el
              }}
              type="button"
              aria-pressed={annual === isAnnual}
              className={`pr-switch__opt kz-hover kz-focus-ring${
                annual === isAnnual ? ' is-active' : ''
              }`}
              onClick={() => pick(isAnnual)}
            >
              {isAnnual ? (
                <>
                  <span>Annual</span>
                  <span className="pr-switch__save">20% off</span>
                </>
              ) : (
                <span>Monthly</span>
              )}
            </button>
          ))}
        </div>

        <div className="pr__plans">
          {PLANS.map((plan, i) => (
            <article
              key={plan.id}
              className={`pr-card${plan.featured ? ' pr-card--featured' : ''}`}
              style={{ '--pr-i': i } as React.CSSProperties}
              aria-labelledby={`pr-plan-${plan.id}`}
            >
              <h3 id={`pr-plan-${plan.id}`} className="pr-card__name">
                {plan.name}
              </h3>

              <p className="pr-price">
                <span className="pr-price__cur">€</span>
                {/* Both numerals live in ONE grid cell and are always in the
                    DOM: the box is the wider string's width forever, so the
                    swap is provably incapable of moving anything. Tabular
                    figures keep the two strings the same width anyway. */}
                <span className="pr-price__num">
                  <span
                    className={`pr-price__v${annual ? '' : ' is-on'}`}
                    aria-hidden={annual}
                  >
                    {plan.monthly}
                  </span>
                  <span
                    className={`pr-price__v${annual ? ' is-on' : ''}`}
                    aria-hidden={!annual}
                  >
                    {plan.annual}
                  </span>
                </span>
                {/* the donor's save chip — space always reserved, ink fades,
                    only on plans where annual actually differs */}
                {plan.monthly > 0 ? (
                  <span className={`pr-price__chip${annual ? ' is-on' : ''}`} aria-hidden={!annual}>
                    Save 20%
                  </span>
                ) : null}
              </p>

              <p className="pr-card__caption">
                per seat/month
                <span className={`pr-card__billing${annual ? ' is-on' : ''}`}>
                  , billed annually
                </span>
              </p>

              <p className="pr-card__desc">{plan.desc}</p>

              <ul className="pr-feats">
                {plan.features.map((feature) => (
                  <li key={feature} className="pr-feat">
                    <Check
                      className="pr-feat__tick"
                      size={15}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`pr-cta kz-hover kz-focus-ring${
                  plan.featured ? ' pr-cta--ink' : ''
                }`}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </div>

        {/* ── the v2 page's structure below the cards, on v5's skin ───────── */}

        <Block eyebrow="Compare all features" title="See exactly what you get at every tier">
          <div className="pr-table__wrap">
            <table className="pr-table">
              <thead>
                <tr>
                  <th scope="col" className="pr-table__feat kz-eyebrow">
                    Feature
                  </th>
                  {COMPARE_COLS.map((p) => (
                    <th key={p} scope="col" className="kz-eyebrow">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="pr-table__feat">
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td key={i}>
                        {v === '✓' ? (
                          <Check size={16} strokeWidth={2} className="pr-table__tick" aria-label="Included" />
                        ) : (
                          <span className={v === '—' ? 'pr-table__none' : undefined}>{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        <Block eyebrow="Enterprise" title="Built for scale. Tailored for you.">
          {/* v2's one dark object, carried over on our own warm ink rather
              than a neutral black — DEVIATION FLAG: the page grammar keeps
              dark fills off section grounds; this is a panel inside a light
              section, the ink-pill convention at card scale. Checkpoint
              decides whether it stays. */}
          <div className="pr-ent">
            <p className="pr-ent__lede">
              For organizations with 50+ seats that need custom integrations, dedicated
              infrastructure, and white-glove onboarding. Everything in Professional, plus:
            </p>
            <ul className="pr-ent__grid">
              {ENTERPRISE_FEATURES.map((f) => (
                <li key={f} className="pr-ent__feat">
                  <Check size={15} strokeWidth={1.75} aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="pr-ent__actions">
              <button type="button" className="pr-ent__cta kz-hover kz-focus-ring">
                Talk to Sales
              </button>
              <button type="button" className="pr-ent__cta pr-ent__cta--ghost kz-hover kz-focus-ring">
                Request a Custom Quote
              </button>
            </div>
          </div>
        </Block>

        <Block
          eyebrow="Free trial"
          title="14 days. Full access. Zero risk."
          lede="Every paid plan starts with a 14-day free trial. No credit card required. Experience the full power of AI-driven sales execution before you commit."
        >
          <ol className="pr-steps">
            {TRIAL_STEPS.map((s) => (
              <li key={s.step} className="pr-step">
                <span className="pr-step__n" aria-hidden="true">
                  {s.step}
                </span>
                <h4 className="pr-step__title">{s.title}</h4>
                <p className="pr-step__body">{s.body}</p>
              </li>
            ))}
          </ol>
        </Block>
      </div>
    </section>
  )
}
