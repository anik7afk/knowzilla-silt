import type { CSSProperties, ReactNode } from 'react'

/* =====================================================================
 * ChapterMock — the shared mock kit for PlatformChapters.
 *
 * REVISION 2 (2026-07-27). Round 1 was rejected by the owner: "the
 * component it produced here are very basic and nothing like attios",
 * "attios one had animation and showcase of things happening our is just
 * plain cards". This file is the rebuild of the anatomy half of that;
 * PlatformChapters.css holds the choreography half.
 *
 * ANATOMY PROVENANCE (A): attio.com's platform tour, measured in
 * inspo/attio/DESIGN.md §4.4, design-assets/dumps4/article-*-tree.json,
 * shots/desktop-03-y2430.png, and the owner's 32s screen recording
 * (/tmp/attio-rec/f012.png is the clearest frame of the ch1 mock).
 *
 * What the donor's cells actually contain — and what round 1 was missing:
 *   · a leading CHECKBOX column, one row checked
 *   · a 16px LOGO/GLYPH CHIP beside an UNDERLINED entity name
 *   · a bordered, tinted numeric SCORE PILL
 *   · an AVATAR DISK + person name
 *   · a status DOT + text
 *   · trailing columns that run under a right-edge mask and read as
 *     cropped out of a bigger application
 * Cells run 12–13px; rows are 34–36px. Every one of those is now a
 * primitive below, so a chapter composes cells out of MARKS rather than
 * out of gray text.
 *
 * COLOUR CARRIES DATA (checkpoint flags — see the session report). Every
 * hue below is an owned ramp used as a MARK, never an area fill:
 *   accent-100/700  — provenance only (source chips, the ✳ knowledge glyph)
 *   won-100/900     — a good score / low risk / a saved state
 *   risk-100/900    — a weak score / high risk / an open objection
 *   gray-*          — everything else
 * The signal ramp is deliberately ABSENT from this section so the
 * accent/signal 17°-adjacency rule (CLAUDE.md #7) cannot be tripped.
 *
 * WINDOW CHROME — SUPERSEDED 2026-07-27 round 3 (owner, pointing at Attio's
 * "Companies to work" showcase: "they dont actually make it look like its
 * on a window or screen its just the section without the mac like those 3
 * pill... ours can be made like that too"). The WindowBar came OFF the
 * chapter plates: they are chromeless Attio-style showcase surfaces now —
 * card depth stays (16px radius, hairline, --shadow-float, hover lift; the
 * owner liked the depth), and the top-most chrome-like row is the app's own
 * in-product toolbar (AppCard's pc-bar / ch04's canvas copy column),
 * exactly like the donor's table toolbar. The `chrome="v2"` WindowBar
 * variant survives in mock/Window.tsx for the hero/WriteBack windows, which
 * are untouched — it is simply no longer called from chapters, which also
 * retires the traffic-triad-as-ornament flag this header used to carry.
 *
 * SHADOWS: the owner lifted the zero-shadow rule for this section on
 * 2026-07-27 ("no dont care about the zero shadow thing remove it").
 * Overlays carry --kz-shadow-float (the owned warm-ink float token);
 * flat table cards stay hairline-defined, so elevation means something.
 *
 * A11Y: the plate is a `role="img"` with a written description, matching
 * SignalConvergence's treatment of a composed scene. Making a reader walk
 * twelve rows of sample data at 12px would be noise.
 * ===================================================================== */

/* ── beat plumbing ──────────────────────────────────────────────────── */

export type BeatKind =
  | 'fade' /* opacity only — flat beds, where a blur just muddies children */
  | 'out' /* opacity 1→0 — a placeholder or a tint clearing */
  | 'soft' /* opacity + blur(2.25px) — the donor's entrance grammar */
  | 'row' /* opacity + 6px rise — table rows cascading (donor: 3px @ half scale) */
  | 'lift' /* opacity + 14px rise + blur(2.5px) — an overlay arriving */
  | 'pop' /* opacity + scale(0.92) — a mark landing */
  | 'bar' /* scaleX(0)→1 from the left — a value filling */
  | 'colbar' /* scaleY(0)→1 from the baseline — an analytics column drawing */

export type EnterProps = { className: string; style?: CSSProperties }
/** `beat(delayMs, kind, durationMs)` → the class + custom props for one beat. */
export type Beat = (delay: number, kind?: BeatKind, dur?: number) => EnterProps

export type MockProps = {
  beat: Beat
  /** the scenario has been triggered (band entered) and is running or done */
  go: boolean
  /** motion suppressed (prefers-reduced-motion) — render the settled state only */
  still: boolean
}

const ms = (n: number) => `${n}ms`

/* ── plate ──────────────────────────────────────────────────────────── */

/* (`Band` — a bare `<div className="pc-band">` wrapper — was removed in the
   session-13 rev-2 two-plane pass. The showcase band is a GROUND now, owned by
   PlatformChapters' `.pc-chapter__show`, so a spacer wrapper had nothing left
   to do.) */

export function Plate({
  label,
  enter,
  flow = false,
  children,
}: {
  label: string
  enter: EnterProps
  /** `flow` (2026-07-27 s12): the window body flows at its own height instead
   *  of the fixed 580px positioned stage — chapter 04's workflow-canvas band
   *  (copy column / canvas / trigger rail) owns its geometry the way v2's
   *  PostCall panel does. Chapters 01–03 keep the 580px stage. */
  flow?: boolean
  children: ReactNode
}) {
  /* chromeless since round 3 (see header §WINDOW CHROME — SUPERSEDED): no
     WindowBar, no title — the plate is the showcase surface itself */
  return (
    <div className={`pc-plate ${enter.className}`} style={enter.style} role="img" aria-label={label}>
      <div className={flow ? 'pc-stage pc-stage--flow' : 'pc-stage'}>{children}</div>
    </div>
  )
}

/* ── the app card (base surface) ────────────────────────────────────── */

export function AppCard({
  title,
  count,
  tools,
  wide,
  className,
  enter,
  children,
}: {
  title: string
  count?: string
  /** right-hand toolbar pills — an app toolbar, never window chrome */
  tools?: string[]
  wide?: boolean
  className?: string
  enter: EnterProps
  children: ReactNode
}) {
  return (
    <div
      className={`pc-card${wide ? ' pc-card--wide' : ''}${className ? ` ${className}` : ''} ${enter.className}`}
      style={enter.style}
    >
      <div className="pc-bar">
        <span className="pc-bar__title">{title}</span>
        {count ? <span className="pc-bar__count">{count}</span> : null}
        <span className="pc-bar__spacer" />
        {tools?.map((t) => (
          <span key={t} className="pc-ctl">
            {t}
            <svg viewBox="0 0 8 8" aria-hidden="true" className="pc-ctl__caret">
              <path d="M1.5 3l2.5 2.5L6.5 3" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ))}
      </div>
      {children}
    </div>
  )
}

/* ── table ──────────────────────────────────────────────────────────── */

export type Column = {
  key: string
  label: string
  /** shown as the sorted column in the header row */
  sorted?: boolean
  /** dropped from the layout ≤768px */
  drop?: boolean
  /** ≤768px this column keeps its disk/glyph but loses its text, so the
   *  primary column gets the width back instead of everything ellipsising */
  tight?: boolean
  nums?: boolean
}

export type Row = {
  id: string
  cells: ReactNode[]
  /** a full-row absolutely-positioned mark rendered UNDER the cells — the
   *  "this is the row the answer came from" highlight in chapter 01 */
  mark?: ReactNode
}

export function Table({
  columns,
  cols,
  colsMd,
  colsSm,
  rows,
  incoming,
  beat,
  headAt,
  rowsAt,
  rowStep = 46,
  rowDur = 340,
}: {
  columns: Column[]
  /** grid-template-columns for the row grid (fixed px on the columns that must
   *  stay left of the right-edge mask, fr on the ones that run under it) */
  cols: string
  /** ≤900px — the mask is gone and the `drop` columns with it, so the four
   *  that remain re-proportion instead of inheriting six tracks */
  colsMd: string
  /** ≤560px — the `tight` column is down to its disk */
  colsSm: string
  rows: Row[]
  /** a row that arrives late, into space reserved from the first paint */
  incoming?: { row: Row; at: number; dur: number; tintOut: number }
  beat: Beat
  headAt: number
  rowsAt: number
  rowStep?: number
  rowDur?: number
}) {
  const head = beat(headAt, 'soft', 380)
  const style = { '--pc-cols': cols, '--pc-cols-md': colsMd, '--pc-cols-sm': colsSm } as CSSProperties

  const renderRow = (r: Row, enter: EnterProps, extra?: string) => (
    <div
      key={r.id}
      className={`pc-tr${extra ? ` ${extra}` : ''} ${enter.className}`}
      style={{ ...style, ...enter.style }}
    >
      {r.mark}
      {r.cells.map((cell, i) => (
        <span
          key={columns[i].key}
          className={`pc-td${columns[i].nums ? ' pc-td--nums' : ''}${columns[i].drop ? ' pc-td--drop' : ''}${
            columns[i].tight ? ' pc-td--tight' : ''
          }`}
        >
          {cell}
        </span>
      ))}
    </div>
  )

  return (
    <div className="pc-table">
      <div className={`pc-tr pc-tr--head ${head.className}`} style={{ ...style, ...head.style }}>
        {columns.map((c) => (
          <span key={c.key} className={`pc-th${c.drop ? ' pc-td--drop' : ''}${c.tight ? ' pc-td--tight' : ''}`}>
            {c.label}
            {c.sorted ? (
              <svg viewBox="0 0 8 8" aria-hidden="true" className="pc-th__sort">
                <path d="M1.5 3l2.5 2.5L6.5 3" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </span>
        ))}
      </div>

      {incoming ? (
        <div className="pc-tr-slot">
          {(() => {
            const tint = beat(incoming.tintOut, 'out', 595)
            return <span className={`pc-tr__tint ${tint.className}`} style={tint.style} aria-hidden="true" />
          })()}
          {renderRow(incoming.row, beat(incoming.at, 'row', incoming.dur), 'pc-tr--new')}
        </div>
      ) : null}

      {rows.map((r, i) => renderRow(r, beat(rowsAt + i * rowStep, 'row', rowDur)))}
    </div>
  )
}

/* ── cell atoms ─────────────────────────────────────────────────────── */

/** Leading checkbox column. One row per table is checked, exactly as the
 *  donor does it — the checked box is INK, not accent: accent is reserved
 *  for provenance in this section so it stays one legible family. */
export function Check({ on }: { on?: boolean }) {
  return (
    <span className={`pc-check${on ? ' is-on' : ''}`} aria-hidden="true">
      {on ? (
        <svg viewBox="0 0 10 10">
          <path d="M2 5.2l2 2 4-4.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  )
}

export type GlyphName =
  | 'playbook'
  | 'pricing'
  | 'icp'
  | 'questions'
  | 'org'
  | 'persona'
  | 'account'
  | 'objection'
  | 'session'
  | 'intent'

const GLYPH_PATHS: Record<GlyphName, ReactNode> = {
  playbook: (
    <>
      <path d="M2 2.6h3.4v6.8H2z" />
      <path d="M6.6 2.6H10v6.8H6.6z" />
    </>
  ),
  pricing: (
    <>
      <path d="M2.2 6.3l3.5-3.5H9v3.3L5.5 9.6z" />
      <path d="M7.4 4.6h.01" />
    </>
  ),
  icp: (
    <>
      <circle cx="6" cy="6" r="3.6" />
      <circle cx="6" cy="6" r="1.2" />
    </>
  ),
  questions: (
    <>
      <path d="M2.3 3.1h7.4v4.6H6.2L4 9.4V7.7H2.3z" />
      <path d="M6 4.6v1.6" />
    </>
  ),
  org: (
    <>
      <path d="M4.6 1.9h2.8v2H4.6zM1.6 8.1h2.6v2H1.6zM7.8 8.1h2.6v2H7.8z" />
      <path d="M6 3.9v2.2M2.9 8.1V6.1h6.2v2" />
    </>
  ),
  persona: (
    <>
      <circle cx="6" cy="4.2" r="1.9" />
      <path d="M2.6 10c.5-2 1.8-3 3.4-3s2.9 1 3.4 3" />
    </>
  ),
  account: (
    <>
      <path d="M2.4 10V2.6h4.3V10" />
      <path d="M6.7 10V5.3h2.9V10M1.6 10h8.8" />
      <path d="M4 4.4h1.2M4 6.4h1.2" />
    </>
  ),
  objection: (
    <>
      <path d="M2.2 2.7h7.6v5.1H6.4L3.9 9.9V7.8H2.2z" />
      <path d="M6 4.1v1.5M6 6.6h.01" />
    </>
  ),
  session: (
    <>
      <circle cx="6" cy="6" r="4" />
      <path d="M6 3.6V6l1.7 1.1" />
    </>
  ),
  intent: (
    <>
      <path d="M1.8 8.4l2.6-3 2.1 1.9L10.2 3" />
      <path d="M7.6 3h2.6v2.6" />
    </>
  ),
}

/** 16px type/logo chip. Its TINT is the type's identity — five owned tints,
 *  one per document family, the way the donor uses five brand logos. */
export function Glyph({ name, tone = 'gray' }: { name: GlyphName; tone?: 'gray' | 'ink' | 'accent' | 'won' | 'risk' }) {
  return (
    <span className={`pc-glyph pc-glyph--${tone}`} aria-hidden="true">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round">
        {GLYPH_PATHS[name]}
      </svg>
    </span>
  )
}

/** Glyph chip + underlined entity name — the donor's primary cell. */
export function Entity({
  name,
  glyph,
  tone,
}: {
  name: string
  glyph: GlyphName
  tone?: 'gray' | 'ink' | 'accent' | 'won' | 'risk'
}) {
  return (
    <span className="pc-entity">
      <Glyph name={glyph} tone={tone} />
      <span className="pc-entity__name">{name}</span>
    </span>
  )
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
}

/** Avatar disk + person name. Disks stay neutral: the colour budget in a
 *  row is spent on the type glyph and the score pill. */
export function Person({ name }: { name: string }) {
  return (
    <span className="pc-person">
      <span className="pc-avatar" aria-hidden="true">
        {initials(name)}
      </span>
      <span className="pc-person__name">{name}</span>
    </span>
  )
}

export function Stack({ names }: { names: string[] }) {
  return (
    <span className="pc-stack" aria-hidden="true">
      {names.map((n) => (
        <span key={n} className="pc-avatar pc-avatar--sm">
          {initials(n)}
        </span>
      ))}
    </span>
  )
}

/** Bordered tinted numeric pill — the donor's score cell, exactly. */
export function Score({ children, tone = 'gray' }: { children: ReactNode; tone?: 'gray' | 'won' | 'risk' | 'ink' }) {
  return <span className={`pc-score pc-score--${tone}`}>{children}</span>
}

/** Dot + text status cell. */
export function Status({ children, tone = 'gray' }: { children: ReactNode; tone?: 'gray' | 'won' | 'risk' | 'ink' }) {
  return (
    <span className={`pc-status pc-status--${tone}`}>
      <span className="pc-status__dot" aria-hidden="true" />
      {children}
    </span>
  )
}

/** Neutral bordered pill — categories, stages, chip rows. */
export function Chip({ children, tone = 'gray' }: { children: ReactNode; tone?: 'gray' | 'won' | 'risk' | 'ink' }) {
  return <span className={`pc-chip pc-chip--${tone}`}>{children}</span>
}

/** Provenance mark. The ONLY lavender in this section, and a tint on 12px
 *  type — the tint-not-fill form the accent rule permits. */
export function SourceChip({ children }: { children: ReactNode }) {
  return (
    <span className="pc-source">
      <svg className="pc-source__glyph" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M3 1.5h4L9.5 4v6.5h-6.5z" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
        <path d="M4.5 6h3.5M4.5 8h2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
      {children}
    </span>
  )
}

/** A value bar that grows once, from the left, to its authored width.
 *  The width is markup; the beat only reveals it. No count-ups anywhere. */
export function Bar({ value, tone = 'ink', enter }: { value: number; tone?: 'ink' | 'won' | 'risk'; enter: EnterProps }) {
  return (
    <span className="pc-track">
      <span
        className={`pc-track__fill pc-track__fill--${tone} ${enter.className}`}
        style={{ ...enter.style, width: `${value}%` }}
      />
    </span>
  )
}

/** A column bar for the analytics strip — grows from the baseline up. */
export function ColBar({ value, enter }: { value: number; enter: EnterProps }) {
  return (
    <span className="pc-col">
      <span className={`pc-col__fill ${enter.className}`} style={{ ...enter.style, height: `${value}%` }} />
    </span>
  )
}

/* ── overlay ────────────────────────────────────────────────────────── */

export function Overlay({
  place = 'br',
  enter,
  children,
}: {
  place?: 'br' | 'tr' | 'cr'
  enter: EnterProps
  children: ReactNode
}) {
  return (
    <div className={`pc-ov pc-ov--${place} ${enter.className}`} style={enter.style}>
      {children}
    </div>
  )
}

export function OverlayHead({
  glyph,
  tone,
  label,
  aside,
  title,
  sub,
  enter,
}: {
  glyph: GlyphName
  tone?: 'gray' | 'ink' | 'accent' | 'won' | 'risk'
  label: string
  aside?: ReactNode
  title: ReactNode
  sub?: ReactNode
  enter: EnterProps
}) {
  return (
    <div className={`pc-ov__head ${enter.className}`} style={enter.style}>
      <div className="pc-ov__headrow">
        <Glyph name={glyph} tone={tone} />
        <span className="pc-ov__label">{label}</span>
        {aside ? <span className="pc-ov__aside">{aside}</span> : null}
      </div>
      <p className="pc-ov__title">{title}</p>
      {sub ? <p className="pc-ov__sub">{sub}</p> : null}
    </div>
  )
}

export function OverlayBody({ children }: { children: ReactNode }) {
  return <div className="pc-ov__body">{children}</div>
}

/** A labelled band inside the overlay body — the donor's "To / Subject"
 *  rows, generalised. */
export function OverlayRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pc-ov__row">
      <span className="pc-ov__rowlabel">{label}</span>
      <span className="pc-ov__rowvalue">{children}</span>
    </div>
  )
}

export function OverlayFoot({ children }: { children: ReactNode }) {
  return <div className="pc-ov__foot">{children}</div>
}

/** Filled primary action. Ink fill + pill radius — Natural's button, not
 *  the donor's blue. */
export function PillButton({ children, tone = 'ink' }: { children: ReactNode; tone?: 'ink' | 'won' }) {
  return <span className={`pc-btn pc-btn--${tone}`}>{children}</span>
}

export function TextAction({ children }: { children: ReactNode }) {
  return <span className="pc-textbtn">{children}</span>
}

/* ── the one-shot state change ──────────────────────────────────────── */

/** Two states stacked in one grid cell, so the swap costs zero layout.
 *  `a` crossfades out at `outAt`, `b` in at `inAt`, once, then settles on
 *  `b` forever. Under reduced motion only `b` is rendered. */
export function Swap({
  a,
  b,
  outAt,
  inAt,
  go,
  still,
}: {
  a: ReactNode
  b: ReactNode
  outAt: number
  inAt: number
  go: boolean
  still: boolean
}) {
  if (still) return <>{b}</>
  const cls = go ? ' pc-go' : ''
  return (
    <span className="pc-swap">
      <span className={`pc-swap__a${cls}`} style={{ '--pc-out': ms(outAt) } as CSSProperties}>
        {a}
      </span>
      <span className={`pc-swap__b${cls}`} style={{ '--pc-in': ms(inAt) } as CSSProperties}>
        {b}
      </span>
    </span>
  )
}

/** The travelling "now" mark for chapter 03's guidance feed: a 2px ink tick
 *  that appears as its row lands and clears when the next row arrives, so a
 *  single mark walks down the panel and stops on the last row. Same needle
 *  idiom as the section rail, one scale down. */
export function NowTick({ inAt, outAt, go, still }: { inAt: number; outAt?: number; go: boolean; still: boolean }) {
  if (still) return <span className={`pc-now${outAt === undefined ? ' is-on' : ''}`} aria-hidden="true" />
  return (
    <span
      className={`pc-now${go ? ' pc-go' : ''}${outAt === undefined ? ' pc-now--last' : ''}`}
      style={{ '--pc-in': ms(inAt), '--pc-out': ms(outAt ?? 0) } as CSSProperties}
      aria-hidden="true"
    />
  )
}
