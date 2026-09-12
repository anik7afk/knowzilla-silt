import { ArrowUp, ChevronRight, Mail, Phone } from 'lucide-react'
import { PaneHead, PanelLabel, showFrom } from './kit'
import { bar, hide, hideAll, hidePointer, pointTo, q, qa, show, showAll, text } from './contract'
import type { Beat, PaneModule } from './contract'

/* =====================================================================
 * Playground — the practice surface, rebuilt as a screen where a session
 * LANDS and the account's numbers recompute because of it.
 *
 * PROVENANCE (design-assets/refs/session7/knowzilla-app/PRODUCT-NOTES.md)
 *   §3.2 "Playground (index)", frames t-009 / t-014 — confirmed:
 *     · two large MODE CARDS side by side: "Email Outreach" (envelope) →
 *       button "Customer Email Practice"; "Cold Calling" (phone) →
 *       button "Customer Call Practice".
 *     · a PRACTICE-HISTORY TABLE, columns Date | Type | Score | View
 *       Details. Type is a coloured pill (their blue "Email" / green
 *       "Call"); low scores render amber; each row carries a → in the
 *       View Details column.
 *     · a KPI STRIP, four metrics — "EMAIL PRACTICES COMPLETED",
 *       "AVG. EMAIL SCORE", "CALL PRACTICES COMPLETED", "AVG. CALL
 *       SCORE" — each with a green ↑ delta.
 *   §1 (t-009 / t-014) — the two mode blurbs, verbatim.
 *   §3.3 (t-013) + §3.4 (t-018) — a practice session is scored on a
 *     FIVE-AXIS RUBRIC out of 10: clarity, empathy, relevance,
 *     engagement, professionalism, under the label "RUBRIC".
 *
 * THE CAUSAL CHAIN (this is the whole point of the surface)
 *   The ref's own account is arithmetically self-consistent: it shows one
 *   Email 2/10 and one Call 2/10 in the table, and a KPI strip reading
 *   "1 sessions / 2/10 / 1 sessions / 2/10". The KPI strip IS the practice
 *   history aggregated. So ours is too — every number on this screen is
 *   DERIVED from `LEDGER` below, nothing is a literal. Which means a
 *   session landing has to move them, and it does:
 *
 *     a practice session finishes  → its row lands at the top of the
 *                                    history, still being scored
 *     the scoring resolves         → the row gets its coloured pill
 *     the ledger now has one more  → CALL PRACTICES COMPLETED flips 3→4
 *       call in it                   and AVG. CALL SCORE recomputes
 *                                    7.0 → 7.5, each with its ↑ delta
 *     the newest session changed   → the RUBRIC panel, which reads the
 *       which session is newest      most recent session, swaps to it
 *
 *   The two EMAIL metrics deliberately do not move. A recompute that
 *   moved everything would be decoration; one that moves exactly the two
 *   metrics a Call session can move is arithmetic.
 *
 * THE ARITHMETIC, so it can be checked against the rows on screen
 *   LEDGER (newest first) — all seven rows are visible at lg:
 *     4/12/26 Call 9 (the one that lands) · 4/10/26 Call 8 · 4/09/26
 *     Email 8 · 4/07/26 Call 7 · 4/06/26 Email 6 · 4/03/26 Call 6 ·
 *     4/02/26 Email 5
 *   Email: 8,6,5      → 3 sessions, 19/3 = 6.3
 *   Call before: 8,7,6   → 3 sessions, 21/3 = 7.0
 *   Call after:  9,8,7,6 → 4 sessions, 30/4 = 7.5
 *   The ↑ delta is growth against the same metric SEVEN DAYS AGO — the
 *   newest session is dated 4/12/26, so the baseline is every session on
 *   or before 4/05/26, i.e. the 4/03 call and the 4/02 email (also both
 *   on screen). Baseline: Email 1 session avg 5.0, Call 1 session avg 6.0.
 *     EMAIL COMPLETED 3 vs 1   → ↑200%      AVG. EMAIL 6.3 vs 5.0 → ↑27%
 *     CALL COMPLETED  3 vs 1   → ↑200%   …and 4 vs 1 → ↑300%
 *     AVG. CALL 7.0 vs 6.0 → ↑17%       …and 7.5 vs 6.0 → ↑25%
 *   A period baseline (rather than "the effect of the last session") is
 *   what makes the chips RISE when the session lands: marginal growth
 *   necessarily shrinks as an account matures, which would have shown a
 *   green ↑ getting smaller while its metric got bigger.
 *
 * SAMPLE DATA, not evidence: the ref's frames are a one-session demo
 * account ("1 sessions", "2/10", "↑100%"). The dates and scores here are
 * ours. Two strings are ours too and are flagged at the checkpoint: the
 * pending score reads "Scoring" (the ref has no unresolved state — every
 * row in t-014 is already scored; Attio's analogue is "AI is thinking…"),
 * and the 7-day delta convention above is stated nowhere in the product.
 *
 * COLOUR is functional product colour, mapped onto our owned ramps (their
 * blue/green/amber never enter the file): Email → accent tint, Call → gray
 * tint, strong score → won, middling → accent, weak → gray (risk red stays
 * reserved for genuine failure states). Same band mapping as
 * src/components/tour/Playground.tsx `bandText()`.
 *
 * NO SIGNAL BLUE ON THIS SURFACE, deliberately (colour sweep, 2026-07-27).
 * Playground is practice and scoring — there is nothing live on it — and
 * signal-600 sits only ~17° from accent-600, so a blue chip beside the
 * lavender Email/"Scoring" chips would read as one smeared hue rather than
 * two categories. Both roles the retired telemetry ramp used to hold go
 * NEUTRAL instead: a below-par practice score is not a signal, and "Call"
 * is already carried by its own icon and word.
 *
 * MOTION is written straight to the DOM by `beats` (zero React commits,
 * per panes/contract.ts). The markup ships the SETTLED end state — the
 * ledger WITH the new session and the KPIs already recomputed — so a
 * reduced-motion visitor, and a visitor whose JS never runs, reads a
 * finished scorecard; `rewind()` is what creates the "before".
 *
 * THE ROW ARRIVES WITHOUT A REFLOW. Rows are wrapped in a clipper; the
 * "before" state translates the list up by exactly one row height
 * (measured at rewind, so nothing hardcodes a type metric), which hides
 * the newest row behind the column header and leaves the slack at the
 * BOTTOM of the table where it is indistinguishable from the panel's own
 * slack. Landing is `transform: none` — the list slides down and the row
 * appears from under the header. Transform only; the six rows below it
 * never lay out. The row also carries `af-in`, so if the height ever
 * measures 0 it still fades in rather than silently not arriving.
 *
 * TWO KEYS PER HOVERABLE THING that also has an entrance: `.af-in` and
 * `.af-hoverable` both declare the `transition` shorthand at equal
 * specificity and `.af-hoverable` wins on source order, so one element
 * carrying both loses the house entrance's opacity + blur tweens. Mode
 * cards and KPI blocks therefore split into an OUTER entrance node
 * (`data-b="mode-N"` …) and an INNER hover/pointer node
 * (`data-b="mode-N-hit"` …).
 * ===================================================================== */

/* ---------- the ledger ---------------------------------------------- */

type Session = { date: string; type: 'Email' | 'Call'; score: number; from?: 'sm' | 'lg' }

/** Newest first — the order the table shows them. Row 0 is the session
 *  that lands during the scene; every number on the surface is derived
 *  from this list, so the table and the KPI strip cannot drift apart.
 *  Seven rows so the table fills at lg; two read on a phone, four from
 *  sm, all seven from lg — the tail drops rather than the rows squashing. */
const LEDGER: Session[] = [
  { date: '4/12/26', type: 'Call', score: 9 },
  { date: '4/10/26', type: 'Call', score: 8 },
  { date: '4/09/26', type: 'Email', score: 8, from: 'sm' },
  { date: '4/07/26', type: 'Call', score: 7, from: 'sm' },
  { date: '4/06/26', type: 'Email', score: 6, from: 'lg' },
  { date: '4/03/26', type: 'Call', score: 6, from: 'lg' },
  { date: '4/02/26', type: 'Email', score: 5, from: 'lg' },
]

/** The ledger as it stood before the session that lands. */
const PRIOR: Session[] = LEDGER.slice(1)

const MODES: {
  icon: typeof Mail
  name: string
  blurb: string
  action: string
  primary?: boolean
}[] = [
  {
    icon: Mail,
    name: 'Email Outreach',
    blurb: 'Master the art of written persuasion. Practice objection handling and closing via email.',
    action: 'Customer Email Practice',
    primary: true,
  },
  {
    icon: Phone,
    name: 'Cold Calling',
    blurb: 'Live voice simulation. Improve your pitch, tone, and real-time responses with AI feedback.',
    action: 'Customer Call Practice',
  },
]

/* ---------- the arithmetic ------------------------------------------ */

const parseDate = (d: string) => {
  const [m, day, y] = d.split('/').map(Number)
  return new Date(2000 + y, m - 1, day).getTime()
}

/** "Seven days ago", measured from the session that lands. */
const WEEK_AGO = parseDate(LEDGER[0].date) - 7 * 86_400_000

/** The account as it stood a week ago — the delta's baseline. Both of
 *  these rows are on screen at lg, so the delta is checkable too. */
const BASELINE = LEDGER.filter((s) => parseDate(s.date) <= WEEK_AGO)

const agg = (rows: Session[], type: Session['type']) => {
  const hit = rows.filter((r) => r.type === type)
  const n = hit.length
  return { n, avg: n ? hit.reduce((a, r) => a + r.score, 0) / n : 0 }
}

/** Labels verbatim (§3.2 crop of t-014). The two long "PRACTICES
 *  COMPLETED" labels are the ones that drop on phones — the short score
 *  labels stay, so nothing is ever read half-truncated. */
const KPIS: {
  label: string
  kind: 'n' | 'avg'
  type: Session['type']
  unit: string
  from?: 'sm' | 'lg'
}[] = [
  { label: 'Email practices completed', kind: 'n', type: 'Email', unit: 'sessions', from: 'sm' },
  { label: 'Avg. email score', kind: 'avg', type: 'Email', unit: '/10' },
  { label: 'Call practices completed', kind: 'n', type: 'Call', unit: 'sessions', from: 'sm' },
  { label: 'Avg. call score', kind: 'avg', type: 'Call', unit: '/10' },
]

type Readout = { num: number; v: string; d: string }

/** Every KPI, computed from a ledger. Counts print bare; averages print to
 *  one decimal, because an average over four sessions is not an integer
 *  and rounding it would be the one number on screen that does not check. */
const readout = (rows: Session[]): Readout[] =>
  KPIS.map((k) => {
    const now = agg(rows, k.type)
    const was = agg(BASELINE, k.type)
    const num = k.kind === 'n' ? now.n : now.avg
    const base = k.kind === 'n' ? was.n : was.avg
    return {
      num,
      v: k.kind === 'n' ? String(now.n) : now.avg.toFixed(1),
      d: `${Math.round((num / base - 1) * 100)}%`,
    }
  })

const KPI_AFTER = readout(LEDGER)
const KPI_BEFORE = readout(PRIOR)

/* ---------- the rubric ---------------------------------------------- */

/** The five axes, in the product's own order (§3.3 crop of t-013). The
 *  panel reads the account's MOST RECENT session, so it swaps when one
 *  lands. Each set averages to that session's overall score — a tighter
 *  promise than the ref's own frames keep (t-018 shows 6/10 over a rubric
 *  averaging 2.2), and the one a CTO is most likely to check. */
const AXES = ['Clarity', 'Empathy', 'Relevance', 'Engagement', 'Professionalism']

type Card = { date: string; type: Session['type']; score: number; axes: number[] }

/** 4/10/26 call, 8/10 — 8+8+9+7+8 = 40. */
const CARD_BEFORE: Card = { date: '4/10/26', type: 'Call', score: 8, axes: [8, 8, 9, 7, 8] }
/** 4/12/26 call, 9/10 — 9+10+9+8+9 = 45. Engagement stays the weak axis,
 *  one point better than last time: the rubric is a story, not a spread. */
const CARD_AFTER: Card = { date: '4/12/26', type: 'Call', score: 9, axes: [9, 10, 9, 8, 9] }

const cardMeta = (c: Card) => `${c.type} practice · ${c.date}`

/* ---------- colour bands (tour/Playground.tsx `bandText()`) ---------- */

/** Score pill: strong → won, middling → accent, weak → gray. The weak band
 *  is NEUTRAL on purpose: colour marks the exceptional reading, and a 5/10
 *  practice score is neither a live signal (blue) nor a failure (red). Same
 *  call as src/components/tour/Playground.tsx. gray-700 on gray-200 is
 *  4.65:1 — the quietest chip in the table, which is where it belongs. */
const scoreTint = (s: number) =>
  s >= 8
    ? 'bg-won-100 text-won-900'
    : s >= 7
      ? 'bg-accent-100 text-accent-700'
      : 'bg-gray-200 text-gray-700'

/** Same three bands as bare type, for the rubric's /10 values. */
const bandText = (s: number) =>
  s >= 8 ? 'text-won-900' : s >= 7 ? 'text-accent-600' : 'text-gray-700'

const BANDS = ['text-won-900', 'text-accent-600', 'text-gray-700']

/** Re-band a numeral a beat has just rewritten. All three class strings are
 *  written literally above, so Tailwind's scanner emits them. */
const setBand = (el: HTMLElement | null, s: number) => {
  if (!el) return
  el.classList.remove(...BANDS)
  el.classList.add(bandText(s))
}

/** Practice type: Email (the primary mode) keeps the accent tint; Call goes
 *  neutral. One step DEEPER than the weak-score chip (gray-300 vs gray-200)
 *  so the two grays in a row are never the same chip, and a luminance match
 *  for the tint it replaces (~0.83 both) so the column keeps its
 *  weight. Type is also carried by an icon and a word — it does not need a
 *  hue of its own, and the only two hues left that would read against
 *  accent are won and risk, which the score column already speaks. */
const typeTint = (t: Session['type']) =>
  t === 'Email' ? 'bg-accent-100 text-accent-700' : 'bg-gray-300 text-gray-800'

/* ---------- the surface --------------------------------------------- */

/** The list's slide. Held as a constant because `rewind()` has to kill the
 *  transition for one frame and then put exactly this back. */
const SLIDE = 'transform 420ms var(--ease-entrance)'

function PlayPane() {
  return (
    <>
      <PaneHead
        title="Playground"
        note="Practice against AI personas — email outreach and cold calling"
      />

      {/* Height is the hard constraint: the frame is 512px tall (640 at lg)
          and the pane may neither scroll nor clip. Measured against the live
          frame — ~532px of body at lg, ~404 at md, ~370 on a phone — so the
          blurbs are lg-only, the two long KPI labels drop below sm, and the
          history shows 2 / 4 / 7 rows. The tail drops; nothing squashes. */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-5 py-4 sm:px-6 lg:px-8">
        {/* the two practice modes */}
        <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:gap-5">
          {MODES.map(({ icon: Icon, name, blurb, action, primary }, i) => (
            <div key={name} data-b={`mode-${i}`} className="af-in is-shown flex min-w-0">
              <div
                data-b={`mode-${i}-hit`}
                className="af-hoverable af-lift flex min-w-0 flex-1 flex-col rounded-[10px] border border-hairline-2 bg-surface-200 p-3.5 lg:p-4"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-micro border border-hairline-2 bg-surface-100 text-gray-700">
                    <Icon size={14} strokeWidth={1.5} />
                  </span>
                  <span className="truncate text-[13px] font-[550] text-ink">{name}</span>
                </span>
                <p className="mt-2 hidden text-[12px] leading-[1.4] text-gray-700 lg:block">
                  {blurb}
                </p>
                <span
                  className={`mt-3 hidden h-7 w-fit items-center rounded-button px-3.5 text-[12px] font-medium lg:flex ${
                    primary
                      ? 'bg-ink text-surface-100'
                      : 'border border-gray-400 bg-surface-100 text-ink'
                  }`}
                >
                  {action}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* KPI strip — the four metrics, each with its ↑ delta. Values and
            deltas are both computed from the ledger, and both are rewritten
            when a session lands. */}
        <div className="grid shrink-0 grid-cols-2 gap-x-5 gap-y-3 border-t border-hairline-2 pt-3 sm:grid-cols-4">
          {KPIS.map(({ label, unit, from }, i) => (
            <div key={label} data-b="kpi" className={`af-in is-shown min-w-0 ${showFrom(from)}`}>
              {/* The negative margins cancel the padding and the transparent
                  border exactly, so a metric getting a real hover box costs the
                  strip zero height. */}
              <div
                data-b={`kpi-${i}-hit`}
                className="af-hoverable -mx-[9px] -my-[5px] flex min-w-0 flex-1 flex-col rounded-micro border border-transparent px-2 py-1"
              >
                {/* wraps rather than truncating — a metric read half-way is
                    worse than a two-line label */}
                <span className="block font-mono font-[550] text-[10px] leading-[1.4] tracking-[0.08em] text-gray-600 uppercase">
                  {label}
                </span>
                <span className="mt-1 flex min-w-0 items-baseline gap-1.5">
                  {/* `af-in` on the numeral itself: a recompute blurs the old
                      value out and the new one back in, which is what makes a
                      counter read as having FLIPPED rather than been edited. */}
                  <span
                    data-b="kpi-n"
                    className="af-in is-shown text-[20px] leading-none font-[600] tracking-[-0.02em] text-ink tabular-nums"
                  >
                    {KPI_AFTER[i].v}
                  </span>
                  <span className="truncate text-[11px] text-gray-600">{unit}</span>
                  <span className="flex shrink-0 items-center gap-0.5 font-mono text-[10px] text-won-900 tabular-nums">
                    <ArrowUp size={10} strokeWidth={2} className="shrink-0" />
                    <span data-b="kpi-d" className="af-in is-shown">
                      {KPI_AFTER[i].d}
                    </span>
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* practice history + the newest session's rubric */}
        <div className="flex min-h-0 min-w-0 flex-1 gap-6">
          <div data-b="hist" className="af-in is-shown flex min-w-0 flex-1 flex-col">
            <span className="mb-1.5 hidden sm:block">
              <PanelLabel>Practice history</PanelLabel>
            </span>
            <div className="flex items-baseline gap-4 border-b border-hairline-2 pb-2 text-[11px] text-gray-500">
              <span className="w-[76px] shrink-0 lg:w-[92px]">Date</span>
              <span className="flex-1">Type</span>
              <span className="w-[68px] shrink-0 text-right">Score</span>
              <span className="hidden w-[72px] shrink-0 text-right lg:block">View Details</span>
            </div>
            {/* The clipper. It keeps its full height whatever the list inside
                does — a transform never lays out — so the newest row hides
                UNDER the column header in the opening frame and the table
                simply looks one row shorter. */}
            <div className="overflow-hidden">
              <div data-b="rows" style={{ transition: SLIDE }}>
                {/* A history row's separator lives one level up: the frame's
                    hover rule repaints `border-color` on all four sides, so the
                    hoverable node keeps a 1px transparent border of its own and
                    hover draws a full gray-400 outline around the row (the same
                    read as the intel rows in Deal Rooms). `py-1` + that
                    border keeps the row compact, so the outline costs the
                    table zero height. */}
                {LEDGER.map(({ date, type, score, from }, i) => (
                  <div
                    key={date}
                    {...(i === 0 ? { 'data-b': 'new-row' } : {})}
                    className={`flex-col border-b border-hairline-2 ${
                      i === 0 ? 'af-in is-shown ' : ''
                    }${showFrom(from)}`}
                  >
                    <div
                      data-b={`hist-${i}`}
                      className="af-hoverable flex items-center gap-4 rounded-micro border border-transparent py-1"
                    >
                      <span className="w-[76px] shrink-0 font-mono text-[12px] text-gray-700 tabular-nums lg:w-[92px]">
                        {date}
                      </span>
                      <span className="flex min-w-0 flex-1">
                        <span
                          className={`inline-flex min-w-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-[550] ${typeTint(type)}`}
                        >
                          {type === 'Email' ? (
                            <Mail size={11} strokeWidth={1.5} className="shrink-0" />
                          ) : (
                            <Phone size={11} strokeWidth={1.5} className="shrink-0" />
                          )}
                          <span className="truncate">{type}</span>
                        </span>
                      </span>
                      {/* The resolve, on the row that lands only: the pending
                          chip and the final pill are stacked on ONE grid cell,
                          so the flip can never reflow the row. Every other row
                          is history — already scored — and renders its pill
                          straight out. */}
                      <span className="grid w-[68px] shrink-0 justify-items-end">
                        {i === 0 && (
                          <span
                            data-b="new-pending"
                            /* The one moment the machine is visible, so it is
                               not a gray chip: accent is this system's AI /
                               working colour, and resolving lavender → won
                               green is what makes the score READ as having
                               been computed. A mark, 20px tall, inside the
                               product window. */
                            className="af-in col-start-1 row-start-1 rounded-full bg-accent-100 px-2 py-0.5 font-mono text-[10px] font-[550] text-accent-700"
                          >
                            Scoring
                          </span>
                        )}
                        <span
                          {...(i === 0 ? { 'data-b': 'new-score' } : {})}
                          className={`col-start-1 row-start-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-[600] tabular-nums ${
                            i === 0 ? 'af-in is-shown ' : ''
                          }${scoreTint(score)}`}
                        >
                          {score}/10
                        </span>
                      </span>
                      <span className="hidden w-[72px] shrink-0 justify-end lg:flex">
                        <ChevronRight
                          size={14}
                          strokeWidth={1.5}
                          className="shrink-0 text-gray-500"
                        />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* the five-axis rubric — first thing to go at narrow widths */}
          <div
            data-b="rubric"
            className="af-in is-shown hidden w-[228px] shrink-0 flex-col self-start rounded-[10px] border border-hairline-2 bg-surface-200 p-4 lg:flex"
          >
            {/* One inner node for the whole scorecard, so switching to a newer
                session is a single blur-swap of the panel's contents rather
                than five values changing under a header that did not. */}
            <div data-b="rub" className="af-in is-shown flex min-w-0 flex-col">
              <span className="flex items-baseline justify-between gap-2">
                <PanelLabel>Rubric</PanelLabel>
                <span
                  data-b="rub-score"
                  className={`font-mono text-[11px] font-[600] tabular-nums ${bandText(CARD_AFTER.score)}`}
                >
                  {CARD_AFTER.score}/10
                </span>
              </span>
              <span data-b="rub-meta" className="mt-1 truncate text-[11px] text-gray-600">
                {cardMeta(CARD_AFTER)}
              </span>

              <div className="mt-3.5 flex flex-col gap-3">
                {AXES.map((axis, i) => (
                  <span key={axis} className="flex">
                    {/* margins cancel padding + border, so the hit box is free */}
                    <span
                      data-b={`axis-${i}-hit`}
                      className="af-hoverable -mx-[9px] -my-[5px] flex min-w-0 flex-1 items-center gap-2.5 rounded-micro border border-transparent px-2 py-1"
                    >
                      <span className="w-[84px] shrink-0 truncate text-[11px] text-gray-700">
                        {axis}
                      </span>
                      <span className="relative h-[3px] min-w-0 flex-1 overflow-hidden rounded-full bg-gray-300">
                        <span
                          data-b="axis-bar"
                          className="af-bar absolute inset-0 rounded-full bg-gray-800"
                          style={{ transform: `scaleX(${CARD_AFTER.axes[i] / 10})` }}
                        />
                      </span>
                      {/* bare number: the panel header already carries the /10,
                          and the two characters it saves go to the bar. 18px
                          holds a two-digit 10/10 axis without clipping. */}
                      <span
                        data-b="axis-v"
                        className={`w-[18px] shrink-0 text-right font-mono text-[11px] font-[600] tabular-nums ${bandText(CARD_AFTER.axes[i])}`}
                      >
                        {CARD_AFTER.axes[i]}
                      </span>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ---------- the performance ----------------------------------------- */

/* Every gap below is >= 200ms on purpose. The frame's clock is a 200ms
 * interval and beats are drained with `while (at <= t)`, so any two beats
 * closer than one tick fire on the SAME tick — a staircase written at
 * 90ms spacing (which is what this file used to do to its count-up) is a
 * staircase that does not exist. Beats written at the same `at` are
 * deliberate: they are one moment, not two. */

/** Count-up rungs. Four for an average, three for a small count — a
 *  counter that reaches its target on rung two and then sits there is not
 *  a counter, and 3 sessions cannot be climbed in seven steps. The last
 *  rung is the target exactly. */
const RUNGS_AVG = [0.4, 0.68, 0.9, 1]
const RUNGS_N = [1 / 3, 2 / 3, 1]

const RAMP_FROM = 960
const RAMP_TO = 1620

/** The recompute walk for AVG. CALL SCORE: it does not swap from 7.0 to
 *  7.5, it moves — interpolated between the two computed values, so the
 *  intermediate rungs cannot drift from the ledger either. */
const CALL_WALK = [0.4, 0.75, 1].map((f) =>
  (KPI_BEFORE[3].num + (KPI_AFTER[3].num - KPI_BEFORE[3].num) * f).toFixed(1),
)

/** The ladder for one metric, spread across the same window whatever its
 *  rung count, so all four land together. */
const rampBeats = (i: number): Beat[] => {
  const { kind } = KPIS[i]
  const target = KPI_BEFORE[i].num
  const rungs = kind === 'n' ? RUNGS_N : RUNGS_AVG
  return rungs.map((f, k) => ({
    at: Math.round(RAMP_FROM + ((RAMP_TO - RAMP_FROM) * k) / (rungs.length - 1)),
    run: (root: HTMLElement) =>
      text(qa(root, 'kpi-n')[i], kind === 'n' ? String(Math.round(target * f)) : (target * f).toFixed(1)),
  }))
}

/** Move the newest row out of / into view. Transform only: the six rows
 *  under it never lay out, and the clipper's height never changes.
 *  `instant` kills the transition for exactly one frame — the same trick
 *  as `af-still` in AppFrame — because `rewind()` runs while the surface
 *  is crossfading IN, and a list visibly sliding up as the pane appears
 *  would show the audience the rewind. */
const slide = (root: HTMLElement, up: boolean, instant = false) => {
  const list = q(root, 'rows')
  if (!list) return
  const h = q(root, 'new-row')?.getBoundingClientRect().height ?? 0
  if (instant) list.style.transition = 'none'
  list.style.transform = up && h ? `translate3d(0, ${-h}px, 0)` : 'none'
  if (instant) {
    void list.offsetWidth
    list.style.transition = SLIDE
  }
}

/** Write a whole scorecard into the rubric panel. */
const writeCard = (root: HTMLElement, c: Card, grow = true) => {
  const score = q(root, 'rub-score')
  text(score, `${c.score}/10`)
  setBand(score, c.score)
  text(q(root, 'rub-meta'), cardMeta(c))
  qa(root, 'axis-v').forEach((el, i) => {
    text(el, String(c.axes[i]))
    setBand(el, c.axes[i])
  })
  qa(root, 'axis-bar').forEach((el, i) => bar(el, grow ? c.axes[i] * 10 : 0))
}

const SCRIPT: Beat[] = [
  /* 1 · the surface arrives: the two modes, the strip, the table */
  { at: 160, run: (root) => show(q(root, 'mode-0')) },
  { at: 360, run: (root) => show(q(root, 'mode-1')) },
  { at: 560, run: (root) => showAll(root, 'kpi') },
  { at: 760, run: (root) => show(q(root, 'hist')) },

  /* 2 · the account's numbers compute */
  ...KPIS.flatMap((_, i) => rampBeats(i)),

  /* 3 · the rubric, showing the session that was newest until now */
  {
    at: 1820,
    run: (root) => {
      show(q(root, 'rubric'))
      qa(root, 'axis-bar').forEach((el, i) => bar(el, CARD_BEFORE.axes[i] * 10))
    },
  },

  /* 4 · a practice session lands. It arrives still being scored — the
   *     machine has to be visible, or a row appearing already scored is
   *     just a row appearing. */
  {
    at: 2400,
    run: (root) => {
      slide(root, false)
      show(q(root, 'new-row'))
    },
  },
  { at: 2600, run: (root) => text(q(root, 'new-pending'), 'Scoring.') },
  { at: 2800, run: (root) => text(q(root, 'new-pending'), 'Scoring..') },
  { at: 3000, run: (root) => text(q(root, 'new-pending'), 'Scoring...') },
  {
    at: 3200,
    run: (root) => {
      hide(q(root, 'new-pending'))
      show(q(root, 'new-score'))
    },
  },

  /* 5 · …and the strip recomputes BECAUSE of it. The count flips; the
   *     average walks, because an average recomputing is not a swap. The
   *     two EMAIL metrics do not move: a Call session cannot move them. */
  {
    at: 3600,
    run: (root) => {
      hide(qa(root, 'kpi-n')[2])
      hide(qa(root, 'kpi-d')[2])
    },
  },
  {
    at: 3800,
    run: (root) => {
      text(qa(root, 'kpi-n')[2], KPI_AFTER[2].v)
      text(qa(root, 'kpi-d')[2], KPI_AFTER[2].d)
      show(qa(root, 'kpi-n')[2])
      show(qa(root, 'kpi-d')[2])
    },
  },
  { at: 4000, run: (root) => text(qa(root, 'kpi-n')[3], CALL_WALK[0]) },
  {
    at: 4200,
    run: (root) => {
      text(qa(root, 'kpi-n')[3], CALL_WALK[1])
      hide(qa(root, 'kpi-d')[3])
    },
  },
  {
    at: 4400,
    run: (root) => {
      text(qa(root, 'kpi-n')[3], CALL_WALK[2])
      text(qa(root, 'kpi-d')[3], KPI_AFTER[3].d)
      show(qa(root, 'kpi-d')[3])
    },
  },

  /* 6 · the rubric reads the account's newest session, and the newest
   *     session just changed. */
  { at: 4800, run: (root) => hide(q(root, 'rub')) },
  {
    at: 5000,
    run: (root) => {
      writeCard(root, CARD_AFTER)
      show(q(root, 'rub'))
    },
  },

  /* 7 · a rep reading their own scorecard, over the top of all of it.
   *     Weigh up the two practice modes, watch the session land, follow
   *     the two numbers it moved, and finish on the axis that is still
   *     the weakest. Hops are >= 600ms apart against a 620ms travel, so
   *     the cursor is always still arriving, never teleporting. Rows and
   *     panels the current width has dropped are simply never pointed at
   *     (`pointTo` no-ops on a zero-size target), so a phone runs the
   *     same path over the parts it actually shows. */
  { at: 1000, run: (root) => pointTo(root, 'mode-0-hit', 0.5, 0.4) },
  { at: 1600, run: (root) => pointTo(root, 'mode-1-hit', 0.5, 0.4) },
  { at: 2620, run: (root) => pointTo(root, 'hist-0', 0.42, 0.5) },
  { at: 3820, run: (root) => pointTo(root, 'kpi-2-hit', 0.3, 0.6) },
  { at: 4420, run: (root) => pointTo(root, 'kpi-3-hit', 0.3, 0.6) },
  { at: 5100, run: (root) => pointTo(root, 'axis-3-hit', 0.5, 0.5) },
  { at: 5700, run: (root) => hidePointer(root) },
]

/** The frame walks `beats` in array order — a beat whose `at` sits behind an
 *  earlier entry would simply never fire on time — so the script is sorted. */
const beats: Beat[] = [...SCRIPT].sort((a, b) => a.at - b.at)

/** The opening frame: nothing has arrived, no number has been computed, and
 *  the account has one fewer session in it than the markup ships. */
const rewind = (root: HTMLElement) => {
  hidePointer(root)
  MODES.forEach((_, i) => hide(q(root, `mode-${i}`)))
  hideAll(root, 'kpi')
  hide(q(root, 'hist'))
  hide(q(root, 'rubric'))
  qa(root, 'kpi-n').forEach((el) => {
    text(el, '—')
    show(el)
  })
  qa(root, 'kpi-d').forEach((el, i) => {
    text(el, KPI_BEFORE[i].d)
    show(el)
  })
  hide(q(root, 'new-row'))
  show(q(root, 'new-pending'))
  text(q(root, 'new-pending'), 'Scoring')
  hide(q(root, 'new-score'))
  slide(root, true, true)
  show(q(root, 'rub'))
  writeCard(root, CARD_BEFORE, false)
}

/** The finished frame — identical to the markup, so this is what a visitor
 *  taking the frame over mid-scene resolves to. */
const settle = (root: HTMLElement) => {
  hidePointer(root)
  MODES.forEach((_, i) => show(q(root, `mode-${i}`)))
  showAll(root, 'kpi')
  show(q(root, 'hist'))
  show(q(root, 'rubric'))
  qa(root, 'kpi-n').forEach((el, i) => {
    text(el, KPI_AFTER[i].v)
    show(el)
  })
  qa(root, 'kpi-d').forEach((el, i) => {
    text(el, KPI_AFTER[i].d)
    show(el)
  })
  show(q(root, 'new-row'))
  hide(q(root, 'new-pending'))
  show(q(root, 'new-score'))
  slide(root, false, true)
  show(q(root, 'rub'))
  writeCard(root, CARD_AFTER)
}

const Playground: PaneModule = {
  name: 'Playground',
  breadcrumb: 'Playground',
  actions: [{ label: 'New practice session', primary: true }],
  /* 6400: the last beat is the pointer leaving at 5700, then the surface is
     completely still for 700ms before the tour moves on. Nothing loops. */
  hold: 6400,
  Pane: PlayPane,
  beats,
  rewind,
  settle,
}

export default Playground
