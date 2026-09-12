import { type CSSProperties, type ReactNode } from 'react'
import { useInView } from '../hooks/useInView'
import './Testimonials.css'

/* ===========================================================================
 * Testimonials / "Backed by" — donor-traced from Natural's `investors` section
 * (inspo/natural/DESIGN.md §s06 + the `investors` anatomy tree, lines 745-782):
 * a SMALL left-aligned header block over an edge-to-edge horizontally
 * scrolling row of saturated full-bleed brand-colour cards. Two width tiers
 * (fund 560 / angel 360), all 542px tall, 2px radius, 80/40/40 padding, a
 * 32px mark at the top, a 4-line quote, and a footer of name + 50%-alpha title
 * beside a 16px brand tile. Hovering an angel card expands it to fund width in
 * 150ms ease-out (donor's measured `opacity/width/margin-right .15s ease-out`).
 *
 * PALETTE — SANCTIONED EXCEPTION (user, 2026-07-26). The card fills are real
 * brand colours, i.e. saturated area fills, which the page's standing rules
 * ("accent is a mark", "no black/near-black neutrals") otherwise forbid. The
 * user authorised the break explicitly, and it is the donor's own argument:
 * this row is THE palette break of Natural's whole site. The exception is
 * scoped to the inside of the cards — the section ground, the header and every
 * structural value stay on our tokens. All fills live in ONE declared block in
 * Testimonials.css; see the header comment there for per-brand sourcing.
 *
 * MOTION CLASS: QUIET (pacing contract §3). Entrance only — opacity + blur(2px)
 * → 0 over 520ms on `--ease-entrance`, 120ms stagger, fired once on viewport
 * entry and latched by useInView, which never reports "left view". Nothing
 * loops. The hover expansion is an interactive state, not ambient motion.
 * The donor has no entrance at all; ours exists because every other section on
 * this page arrives, and a row that is simply *there* reads as a rendering bug
 * next to its neighbours.
 *
 * ---------------------------------------------------------------------------
 * CONTENT PROVENANCE — researched 2026-07-26, nothing invented.
 * ---------------------------------------------------------------------------
 * Every quote below is a real thing a real person said. What was done to each:
 *
 *  0. ORDER, 2026-07-27 (flow-B content pass). The row used to open on the
 *     Antler card, whose quote — real and verbatim, from Antler's announcement
 *     of the SmartCap-backed Antler Nordic Fund II — was NOT ABOUT KNOWZILLA:
 *     it was about backing Estonian founders generally. A row of endorsements
 *     that opens on words which never mention the product is the weakest
 *     possible lead in front of this reader. The checkpoint flag that used to
 *     sit here was taken up: the row now LEADS on Stewart Rogers, the one
 *     outside voice describing what the product does, and the Antler card
 *     carries a plain statement of the fact of the investment instead of a
 *     quote. Nothing was invented to fill the gap.
 *
 *  1. ANTLER — NOT A QUOTE. A statement of fact: Antler is Knowzilla's
 *     headline backer (€490k pre-seed, Antler Nordics, 2025). No praise is
 *     attributed to the fund or to any person at it, so the card is
 *     attributed to the firm, not to a partner.
 *
 *  2. SUPERANGEL · Kärt Siilats — REAL, TRANSLATED from Estonian
 *     (Äripäev / Äritehnoloogia, 21.11.2025) and TRIMMED. Investor confirmed
 *     independently: Usaldusfond Superangel Two holds 5% of the company in the
 *     Estonian business registry.
 *
 *  3. TRIIN HERTMANN — REAL, TRANSLATED from Estonian (same article), and
 *     LIGHTLY MERGED: two of her sentences from that piece are set as one
 *     quote. Angel in the round; co-founder of Grünfin, whose mark the card
 *     carries.
 *
 *  4. STEWART ROGERS — REAL, VERBATIM English, from his Product Hunt comment,
 *     TRIMMED to its first sentence so it fits the donor's 4-line quote box.
 *     The dropped tail read: "A sharp, pragmatic solution for teams that
 *     prioritize precision over guesswork."
 *
 *  5. LIINA LAAS — REAL, VERBATIM English, Product Hunt. She is Knowzilla's
 *     co-founder and CEO, i.e. NOT a backer: her card closes the row on the
 *     light tier (donor's `investor-card--dark` ink tier) so it reads as the
 *     house voice answering the outside ones, not as a fifth endorsement.
 *
 * TRANSLATION NOTE: the two Estonian quotes are rendered without em dashes.
 * Both are our translations, so the punctuation is the translator's choice,
 * and this page's copy avoids em dashes (Hero feedback round, 2026-07-25).
 * The two English quotes are verbatim, punctuation included.
 *
 * BRAND COLOURS — all five measured off the organisation's own live CSS or
 * inline logo SVG (antler.co `--swatch--dark-red`, superangel.io's header
 * ground, VentureBeat's logo wordmark fill, Grünfin's 2024 hero ground via the
 * Wayback Machine because the company is closed, and the donor's own light tier
 * for the founder card). Per-value sourcing, the two contrast-driven
 * substitutions and the one `~` are recorded in Testimonials.css.
 *
 * LOGO MARKS: the investor cards use compact symbol marks, not repeated names.
 * VentureBeat's favicon and Antler's public SVG are on Wikimedia Commons,
 * Superangel's mark is from their live SVG. Grünfin's site is closed, so the
 * card uses a compact leaf/globe symbol derived from public screenshots rather
 * than pretending a downloadable official SVG exists.
 * =========================================================================== */

type Card = {
  id: string
  /** brand the card's fill + mark belong to (may differ from the speaker) */
  brand: string
  tier: 'fund' | 'angel'
  /** donor's two ink tiers: light = white ink on a dark fill */
  ink: 'light' | 'dark'
  /** true = a statement of fact, not a quotation — rendered as <p>, no marks */
  fact?: boolean
  quote: string
  name: string
  title: string
  mark: ReactNode
}

/* ── marks: compact symbols; currentColor so they inherit each card ink ── */

const AntlerMark = (
  <svg className="tm-brand-mark tm-brand-mark--antler" viewBox="0 0 467 470" aria-hidden focusable="false">
    <path
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 235V470H233.5H467V235V0H233.5H0V235ZM311.193 233.5C342.383 305 368.135 364.063 368.42 364.75C368.825 365.73 363.809 365.995 345.219 365.979L321.5 365.958L277.591 262.229C253.441 205.178 233.381 158.15 233.013 157.722C232.646 157.295 212.395 203.982 188.012 261.472L143.678 366H120.89H98.102L99.461 362.75C102.944 354.42 211.294 106.319 212.135 104.747C213.014 103.105 214.776 102.982 233.788 103.23L254.484 103.5L311.193 233.5Z"
    />
  </svg>
)

const SuperangelMark = (
  <svg className="tm-brand-mark tm-brand-mark--superangel" viewBox="0 0 8.24 8.18" aria-hidden focusable="false">
    <path
      fill="currentColor"
      d="M4.12154 8.17908C3.30598 8.18054 2.50832 7.94193 1.8295 7.49345C1.15067 7.04497 0.621201 6.40678 0.308085 5.65964C-0.00503172 4.9125 -0.0877182 4.09 0.0704893 3.29623C0.228697 2.50245 0.620687 1.77307 1.19685 1.20041C1.77302 0.627736 2.50746 0.237514 3.30724 0.0791211C4.10702 -0.0792719 4.93618 0.00128404 5.6898 0.310595C6.44342 0.619905 7.08761 1.14407 7.54087 1.81675C7.99412 2.48943 8.23605 3.28039 8.23605 4.08954C8.2341 5.17228 7.80022 6.21024 7.02923 6.97654C6.25824 7.74285 5.21285 8.17519 4.12154 8.17908ZM4.12154 1.79469C3.66406 1.79469 3.21686 1.92928 2.83649 2.18144C2.45611 2.4336 2.15965 2.79201 1.98458 3.21134C1.80951 3.63067 1.7637 4.09208 1.85295 4.53724C1.9422 4.9824 2.1625 5.3913 2.48598 5.71224C2.80946 6.03318 3.2216 6.25175 3.67029 6.34029C4.11897 6.42884 4.58404 6.3834 5.00669 6.2097C5.42934 6.03601 5.79059 5.74188 6.04475 5.36449C6.29891 4.9871 6.43456 4.54342 6.43456 4.08954C6.43261 3.4815 6.18829 2.89892 5.75493 2.46898C5.32158 2.03903 4.73439 1.79663 4.12154 1.79469Z"
    />
  </svg>
)

const GrunfinMark = (
  <svg className="tm-brand-mark tm-brand-mark--grunfin" viewBox="0 0 32 32" aria-hidden focusable="false">
    <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <path d="M10 18c5.8-.4 9.4-3.1 12-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M16 23c-.2-5.7 2-9.8 7.4-12.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)

const VentureBeatMark = (
  <svg className="tm-brand-mark tm-brand-mark--venturebeat" viewBox="0 0 177.75 100" aria-hidden focusable="false">
    <path
      d="M140 0c10.06.29 22.25.72 29.6 8.36 4.26 4.53 6.67 11.9 6.67 18.41 0 8.79-4 13.74-6.24 15.87-2.83 2.83-6.52 4.67-10.05 6.37 4.1 1.29 8.36 2.55 12.17 6.24 4.12 4.1 6.94 11.18 6.94 18.69a24.19 24.19 0 0 1-6.94 17.56c-7.92 8.07-18.41 8.22-29.74 8.5h-46V79.6l8.92.14V20.26l-8.92.14V0Zm-8.64 40.22c8.08.15 9.21.15 11.2-.27A9.65 9.65 0 0 0 150.23 30c0-5.24-3-8.21-5.09-9.21s-3.69-1.13-13.75-1.27Zm0 39.38h7.8c5.52 0 13.31-.13 13.31-9.62 0-5-2.69-8.36-6.1-9.64-2.4-1-3.53-1-15-1Z"
      fill="#e21216"
    />
    <polygon
      points="0 0 42.92 0 42.92 20.4 34.13 20.26 48.72 77.48 64.45 20.26 55.67 20.4 55.67 0 95.04 0 95.04 20.4 88.38 20.26 63.6 100 31.3 100 6.23 20.26 0 20.4 0 0"
      fill="currentColor"
    />
  </svg>
)

/* the one mark we actually own — the nav wordmark, set at the mark slot's height */
const KnowzillaMark = <span className="tm-wordmark">Knowzilla</span>

/* ORDER (flow-B content pass, 2026-07-27) — the row leads on Rogers, the one
   outside voice describing what the product actually does, then the backer
   fact, then the two angel voices, then the house answering. Colour check
   (the reason the previous order existed): the fills now run near-black,
   red, green, yellow, light — no red-yellow-green run anywhere, so the
   traffic-light adjacency the old order was arranged around cannot occur at
   any scroll position. */
const CARDS: Card[] = [
  {
    id: 'venturebeat',
    brand: 'VentureBeat',
    tier: 'angel',
    ink: 'light',
    quote:
      '“The situational awareness required to handle complex objections without the mental tax of searching through playbooks is gold.”',
    name: 'Stewart Rogers',
    title: 'VentureBeat',
    mark: VentureBeatMark,
  },
  {
    id: 'antler',
    brand: 'Antler',
    tier: 'fund',
    ink: 'light',
    /* NOT a quote (provenance note 1) — a statement of the fact of the
       investment, set without quote marks and rendered as a <p>, attributed
       to the firm rather than to any person at it. */
    fact: true,
    quote:
      'Antler led Knowzilla’s €490k pre-seed round in 2025 through Antler Nordics.',
    name: 'Antler',
    title: 'Pre-seed lead investor',
    mark: AntlerMark,
  },
  {
    id: 'grunfin',
    brand: 'Grünfin',
    tier: 'angel',
    ink: 'light',
    quote:
      '“They have the chance to do what Pipedrive did. The market pull is already enormous. Now you pour on the rocket fuel.”',
    name: 'Triin Hertmann',
    /* full affiliation is "angel investor; co-founder of Grünfin" — set short
       because the donor's title line is one ellipsised row inside a 50px
       footer, and the long form clipped to "…Co-founder, Grü…" on a card whose
       own mark is Grünfin's */
    title: 'Angel investor · Grünfin',
    mark: GrunfinMark,
  },
  {
    id: 'superangel',
    brand: 'Superangel',
    tier: 'angel',
    /* their brand ground is a yellow — white ink on it is 1.58:1, so this card
       takes the donor's dark ink tier, exactly as superangel.io itself does */
    ink: 'dark',
    quote:
      '“A complete cast of superstars, each with unicorn experience. Beyond the team there is a big, hungry market.”',
    name: 'Kärt Siilats',
    title: 'Venture Partner, Superangel',
    mark: SuperangelMark,
  },
  {
    id: 'knowzilla',
    brand: 'Knowzilla',
    tier: 'angel',
    ink: 'dark',
    quote:
      '“Selling is not rocket science. You need the right answers and confidence — the rest can be automated.”',
    name: 'Liina Laas',
    title: 'Co-founder & CEO, Knowzilla',
    mark: KnowzillaMark,
  },
]

export default function Testimonials() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section ref={ref} className={`tm${inView ? ' is-in' : ''}`} aria-labelledby="tm-title">
      {/* Donor's header block: a 480px measure so the H2 wraps to exactly two
          lines, kept small on purpose — the cards are the section, the sentence
          only names them. NO eyebrow: SharedTruth immediately above opens with
          the page's one retained eyebrow stack, and the pacing contract bars
          adjacent eyebrows. The donor's own lead-in is not the tracked
          uppercase eyebrow idiom either — it is a plain 15px/24px gray-700
          label (anatomy: 63.7px wide for "Investors") — so this is the donor's
          treatment, not a substitute for it. */}
      <div className="tm__head">
        <p className="tm__lead">Investors and operators</p>
        {/* Headline: user considered replacing this (close to Natural's own
            line), rejected the alternative ("…who built Estonian tech.") and
            settled on keeping it — 2026-07-26. */}
        <h2 id="tm-title" className="tm__headline">
          Backed by the best investors and operators in the Baltics.
        </h2>
      </div>

      {/* The row breaks the page measure and scrolls natively. It is a direct
          child of the section rather than of a centred container, so the
          breakout needs no `100vw` — which would include the classic scrollbar
          gutter and put a horizontal scrollbar on the whole page. `100%` here
          is the viewport's content width by construction. The inset then
          re-aligns the first card with the header above it. */}
      {/* tabIndex makes the scrollable region keyboard-reachable (WCAG 2.1.1 —
          it has no focusable children, so without it the last three cards are
          unreachable without a mouse). It does NOT use `.kz-focus-ring`: that
          ring is an OUTER box-shadow, and this element runs edge to edge, so
          half of it would fall outside the viewport. See Testimonials.css. */}
      <ul
        className="tm__row"
        tabIndex={0}
        role="list"
        aria-label="Investors and operators, scrollable"
      >
        {CARDS.map((card, i) => (
          <li
            key={card.id}
            className={`tm__slot tm__slot--${card.tier}`}
            style={{ '--i': i + 1 } as CSSProperties}
          >
            <figure className={`tm-card tm-card--${card.id} tm-card--${card.ink}`}>
              <div className="tm-card__mark">{card.mark}</div>

              {card.fact ? (
                <p className="tm-card__quote">{card.quote}</p>
              ) : (
                <blockquote className="tm-card__quote">{card.quote}</blockquote>
              )}

              <figcaption className="tm-card__footer">
                <div className="tm-card__info">
                  <span className="tm-card__name">{card.name}</span>
                  <span className="tm-card__title">{card.title}</span>
                </div>
                {/* donor's 16×16 currentColor brand tile, bottom-right */}
                <span className="tm-card__tile" aria-hidden />
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
