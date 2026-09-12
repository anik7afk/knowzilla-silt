import { useInView } from '../hooks/useInView'
import './Stats.css'

/*
 * Light-surface facts section — short two-tone headline, four product-fact
 * blocks, and a practice-score line chart in a raised panel.
 *
 * 2026-07-27 (flow-B content pass): this section used to state live usage
 * telemetry — "Live navigator sessions 312", "Answers surfaced mid-call
 * 18,400", "Avg. answer latency 340ms", "CRM fields written back 9" — all four
 * invented, all four falsifiable by the one reader who matters (Knowzilla's
 * CTO), and the latency one directly on PRODUCT-NOTES §6.5's do-not-invent
 * list. Replaced with four facts that are checkable against the product
 * itself or the pricing page; sources cited per stat below. The rAF count-up
 * went with them: counting a price up from zero is a telemetry gesture, and
 * these are static facts, not accumulating counters. The section's entrance
 * (kz-enter, BEAT, plays once and settles) is unchanged.
 *
 * Session 9 (2026-07-25): the chart was a lavender squiggle over a decorative
 * dot field with no scale, no baseline and no values — the "+18% WoW" claim was
 * unanchored. Rebuilt as a real chart: a telemetry-coloured series, gray
 * structural furniture per contract R1, and a raised surface-100 panel on the
 * surface-300 ground per R2.
 *
 * 2026-07-27: R1 put this series on the retired ramp because that ramp WAS this
 * system's telemetry colour. It is retired and signal blue inherits the role, so
 * the series moves to the signal ramp — the best-evidenced site of that sweep,
 * because the Attio extraction lists signal-600 under literally this use
 * ("active tab bar, workflow connectors, CHART LINE, glows",
 * inspo/attio/DESIGN.md:69). Weights were solved, not swapped step-for-step —
 * the two ramps are ~77 luminance steps apart at -600, so a step-for-step swap
 * would have darkened every mark here. Measured on the panel's white:
 *   line      old -800 step 3.96:1  ->  signal-600  4.64:1  (GAINS contrast)
 *   endpoint  old -900 step 6.52:1  ->  signal-700  6.27:1  (holds its weight)
 *   wash      old -400 @0.42, chroma 10  ->  signal-200 @0.42, chroma 11
 * so nothing here gained weight except the one line that carries the data.
 */

type Stat = {
  label: string
  value: string
  caption: string
}

/* Four checkable product facts. Sources:
 *  1. document types — the KB's own type taxonomy, five types, read off the
 *     product video: Ideal Customer Profile / Organizational Structure /
 *     Product & Pricing Guide / Qualifying Questions / Sales Playbook
 *     (design-assets/refs/session7/knowzilla-app/PRODUCT-NOTES.md §3.1).
 *  2. rubric axes — the practice scorer's five axes, identical in the email
 *     and cold-call reviews: clarity, empathy, relevance, engagement,
 *     professionalism (PRODUCT-NOTES §3.3 and §3.4).
 *  3. intel lists — the post-call Session Review's 2×2 intel editor: pain
 *     points, goals, blockers, decision criteria (PRODUCT-NOTES §3.6).
 *  4. price — Starter, billed annually, from the pricing page transcribed in
 *     src/components/Pricing.tsx (monthly 49 / annual 39, € per seat/month).
 */
const STATS: Stat[] = [
  {
    label: 'Document types',
    value: '5',
    caption: 'ICP, org structure, product & pricing, qualifying questions, playbook',
  },
  {
    label: 'Rubric axes per practice',
    value: '5',
    caption: 'clarity, empathy, relevance, engagement, professionalism',
  },
  {
    label: 'Intel lists per session',
    value: '4',
    caption: 'pain points, goals, blockers, decision criteria — editable before they save',
  },
  {
    label: 'Starter, billed annually',
    value: '€39',
    caption: 'per seat, per month. €49 on monthly billing',
  },
]

function StatBlock({ stat, active, delay }: { stat: Stat; active: boolean; delay: number }) {
  return (
    <div
      className={`${active ? 'kz-enter' : 'opacity-0'} border-l-[1.5px] border-gray-400 pl-5`}
      style={{ '--enter-delay': `${delay}ms` } as React.CSSProperties}
    >
      <div className="font-mono font-[550] text-[11px] tracking-[0.4px] text-ink-secondary uppercase">{stat.label}</div>
      <div
        data-stat-value
        className="mt-1 font-display text-[36px] leading-10 font-medium tracking-[-0.36px] text-ink tabular-nums"
      >
        {stat.value}
      </div>
      <p className="mt-1 max-w-[220px] text-[13px] leading-5 text-gray-700">{stat.caption}</p>
    </div>
  )
}

/* ── chart data ────────────────────────────────────────────────────────────
 * 2026-07-27: this plotted "live navigator sessions per week", i.e. a
 * cross-session usage trend, and annotated it "+18% vs last week". That is a
 * team-analytics-over-time surface, and PRODUCT-NOTES §6.6 records it as a
 * confirmed absence — the only analytics the product actually shows are
 * per-session (Session Review) or per-rep practice history (the Playground's
 * history table + AVG SCORE KPIs, §3.2). Re-labelled to that second, real
 * surface: one rep's practice score across their practice sessions, on the
 * product's own 0–10 rubric scale.
 *
 * ~ ILLUSTRATIVE: the twelve scores are a sample trajectory, not measured
 * data — a chart needs a series. The two anchors are real: the scale is the
 * product's /10 score, and the opening 2/10 is the score the product video's
 * own history table shows (`t-014`). The delta chip is derived from the
 * series (last − first), not asserted separately.
 */
const SERIES = [2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7, 8]
const V_MAX = 10 // the rubric's own ceiling
const GRIDLINES = [10, 5] // labelled reference lines; 0 is the CSS baseline
const X_LABELS = [0, 3, 7, 11] // S1 · S4 · S8 · S12
const VB_W = 600
const VB_H = 240

const PTS = SERIES.map((v, i) => ({
  x: (i / (SERIES.length - 1)) * VB_W,
  y: VB_H * (1 - v / V_MAX),
}))

/** Fritsch–Carlson monotone cubic — smooth without inventing overshoot
 * between samples (a plain bezier would imply values the data never had). */
function monotonePath(pts: { x: number; y: number }[]) {
  const n = pts.length
  const dx: number[] = []
  const slope: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x
    slope[i] = (pts[i + 1].y - pts[i].y) / dx[i]
  }
  const tan: number[] = new Array(n)
  tan[0] = slope[0]
  tan[n - 1] = slope[n - 2]
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) {
      tan[i] = 0
    } else {
      const w1 = 2 * dx[i] + dx[i - 1]
      const w2 = dx[i] + 2 * dx[i - 1]
      tan[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i])
    }
  }
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += ` C ${(pts[i].x + h).toFixed(2)} ${(pts[i].y + tan[i] * h).toFixed(2)}`
    d += `, ${(pts[i + 1].x - h).toFixed(2)} ${(pts[i + 1].y - tan[i + 1] * h).toFixed(2)}`
    d += `, ${pts[i + 1].x.toFixed(2)} ${pts[i + 1].y.toFixed(2)}`
  }
  return d
}

const LINE_D = monotonePath(PTS)
const AREA_D = `${LINE_D} L ${VB_W} ${VB_H} L 0 ${VB_H} Z`
const LAST = SERIES[SERIES.length - 1]
const LAST_TOP = (1 - LAST / V_MAX) * 100
const GAIN = LAST - SERIES[0] // points gained since the first session

function SessionsChart() {
  return (
    <div className="stats-panel flex h-full flex-col rounded-card border border-hairline-2 bg-surface-100 shadow-card">
      <header className="flex items-center justify-between gap-4 border-b border-hairline-2 px-5 py-3.5">
        <span className="font-mono font-[550] text-[11px] tracking-[0.4px] text-gray-700 uppercase">
          Practice score, one rep
        </span>
        {/* delta chip on the signal ramp — same ramp as the series it annotates,
            and the donor's own badge pairing (signal-100 bg / signal-700 text,
            inspo/attio/DESIGN.md:68,269). won-* stays reserved for CRM outcome
            semantics (WriteBack, ColdCallsPane), not chart deltas. */}
        <span className="stats-delta inline-flex items-center gap-1 rounded-micro bg-signal-100 px-2 py-[3px] font-mono text-[10px] tracking-[0.3px] text-signal-700 tabular-nums">
          ↑ {GAIN} pts since session 1
        </span>
      </header>

      <div className="flex min-h-[228px] flex-1 flex-col pt-5 pr-5 pb-[26px] pl-[62px] md:min-h-[300px]">
        <div className="stats-plot relative flex-1 border-b-[1.5px] border-l border-gray-400">
          {/* y-axis reference values — sit on their gridlines, 0 on the baseline */}
          {[...GRIDLINES, 0].map((v) => (
            <span
              key={v}
              className="absolute right-full mr-2.5 -translate-y-1/2 font-mono text-[10px] tracking-[0.3px] text-gray-600 tabular-nums"
              style={{ top: `${(1 - v / V_MAX) * 100}%` }}
            >
              {v.toLocaleString('en-US')}
            </span>
          ))}

          <svg
            className="stats-svg absolute inset-0 h-full w-full"
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="stats-area-fill" x1="0" y1="0" x2="0" y2="1">
                {/* wash under the series. signal-200, NOT the signal step at the
                    retired ramp's own index: the two ramps are ~52 luminance
                    steps apart at -400, so that swap would have doubled this
                    wash's weight. Solving purely on luminance (signal-200 @0.5)
                    matched it to 0.6/255 but overshot on CHROMA by 30% — blue
                    reads more saturated than khaki at equal luminance. Sampled
                    at the wash's strongest point instead: @0.42 measures
                    (243,247,254), chroma 11 against the retired wash's 10, one
                    luminance step lighter. Weight held, hue changed. */}
                <stop offset="0%" style={{ stopColor: 'var(--color-signal-200)', stopOpacity: 0.42 }} />
                <stop offset="100%" style={{ stopColor: 'var(--color-signal-200)', stopOpacity: 0 }} />
              </linearGradient>
              {/* the draw: a clip that widens left → right. A stroke-dasharray
                  reveal is BOTH costlier (re-tessellates the stroke every frame)
                  and wrong here — dash lengths are measured in host space under
                  vector-effect="non-scaling-stroke", so a pathLength=1 dash stops
                  short of the last point once the viewBox is stretched. */}
              <clipPath id="stats-reveal" clipPathUnits="userSpaceOnUse">
                <rect className="stats-reveal" x={-4} y={-60} width={VB_W + 8} height={VB_H + 120} />
              </clipPath>
            </defs>

            {/* furniture — present before the series arrives */}
            {GRIDLINES.map((v) => (
              <line
                key={v}
                x1="0"
                x2={VB_W}
                y1={VB_H * (1 - v / V_MAX)}
                y2={VB_H * (1 - v / V_MAX)}
                style={{ stroke: 'var(--color-gray-400)' }}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <path className="stats-area" d={AREA_D} fill="url(#stats-area-fill)" />

            <g clipPath="url(#stats-reveal)">
              <path
                className="stats-line"
                d={LINE_D}
                fill="none"
                style={{ stroke: 'var(--color-signal-600)' }}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </svg>

          {/* the one emphasized point: where the series is now — one ramp step
              darker than the line, the relationship it has always had */}
          <span
            className="stats-end absolute block h-[9px] w-[9px] rounded-full bg-signal-700"
            style={{ left: '100%', top: `${LAST_TOP}%` }}
          />
          <span
            className="stats-endval absolute font-mono text-[11px] font-medium tracking-[0.2px] text-ink tabular-nums"
            style={{ left: '100%', top: `${LAST_TOP}%` }}
          >
            {LAST.toLocaleString('en-US')}
          </span>

          {/* x axis — a tick per practice session, labels at S1 · S4 · S8 · S12 */}
          <div className="absolute top-full right-0 left-0 mt-[1.5px] h-[22px]">
            {SERIES.map((_, i) => (
              <span
                key={i}
                className="absolute top-0 block h-[4px] w-px bg-gray-400"
                style={{ left: `${(i / (SERIES.length - 1)) * 100}%` }}
              />
            ))}
            {X_LABELS.map((i) => (
              <span
                key={i}
                className="absolute top-[9px] font-mono font-[550] text-[10px] tracking-[0.3px] text-gray-600 uppercase"
                style={{
                  left: `${(i / (SERIES.length - 1)) * 100}%`,
                  transform: i === 0 ? 'none' : i === SERIES.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                }}
              >
                S{i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Stats() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    /* Hairline history, because it has moved twice: dropped in S7 (Stats then
     * followed white Quote, and the join rule marks a join only where the
     * ground does NOT change), restored in S9 (Quote was pulled and Stats
     * landed on SharedTruth's own surface-300), and dropped AGAIN 2026-07-26
     * when Testimonials took that slot on a white ground — Stats now follows a
     * ground change, so the join carries itself. The join below — Stats →
     * ClosingCta, same-ground — was an open exception until 2026-07-27: with
     * no line at all the owner read the seam as dead space ("doesn't look in
     * flow"). The resolution is a CONTAINED rule, not the full-bleed border
     * of S9 — it stops at the content measure, so it closes Stats without
     * ever underlining the CTA's dot field the way the rejected border did.
     * 2026-07-29: the reorder retired the rule entirely — Stats moved above
     * Testimonials, so BOTH its edges are now ground changes and the join rule
     * leaves both bare. Above: PlatformChapters declares #f6f6f6 on the
     * section but its TAIL paints white (`pc__panel` is #ffffff, measured at
     * the seam, not inferred from the section's own ground) → #fff→#f6f6f6.
     * Below: #f6f6f6 → Testimonials' #ffffff. A hairline on either would be a
     * doubled join, which is the mistake this comment exists to prevent. The
     * contained-rule recipe stays in the history above for when the same-ground
     * seam against ClosingCta returns. */
    <section ref={ref} className={`${inView ? 'is-inview' : ''} bg-surface-300`}>
      <div className="mx-auto max-w-[1280px] px-6 pt-24 pb-16 md:px-10 md:pt-[152px] md:pb-[96px]">
        <div className="max-w-[680px]">
          <h2
            className={`${inView ? 'kz-enter' : 'opacity-0'} [text-wrap:balance] font-display text-[40px] leading-[44px] font-medium tracking-[-0.4px]`}
            style={{ '--enter-delay': '0ms' } as React.CSSProperties}
          >
            <span className="text-ink">What's actually in the product. </span>
            <span className="text-ink-secondary">Counted, not estimated.</span>
          </h2>
        </div>

        {/* 2026-07-27: the four facts sit 2×2 at desktop, not stacked. The
            stacked rail + stretch-aligned chart meant the chart's height was
            the sum of four blocks — with this round's longer captions the
            section stopped fitting a viewport (owner flag). 2×2 halves the
            column, and the chart panel's stretch now lands ~400px tall. */}
        <div className="mt-12 grid gap-12 md:mt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:gap-y-11">
            {STATS.map((stat, i) => (
              <StatBlock key={stat.label} stat={stat} active={inView} delay={160 + i * 80} />
            ))}
          </div>

          <div
            className={`${inView ? 'kz-enter' : 'opacity-0'}`}
            style={{ '--enter-delay': '200ms' } as React.CSSProperties}
          >
            <SessionsChart />
          </div>
        </div>
      </div>
    </section>
  )
}
