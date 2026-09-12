import {
  ArrowRight,
  Ban,
  ChartColumn,
  Check,
  Flag,
  SquareCheck,
  Star,
  TriangleAlert,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { PaneHead, PanelLabel, showFrom } from './kit'
import {
  bar,
  hide,
  hidePointer,
  pointTo,
  pressOn,
  q,
  releaseOn,
  show,
  text,
} from './contract'
import type { Beat, PaneModule } from './contract'

/* =====================================================================
 * Deal Rooms · Session Review — the tour's payoff surface.
 *
 * The live call the hero just performed ends here: Knowzilla hands back
 * what it heard as four editable intel lists, the rep checks them, saves
 * them into the deal room, and the session's telemetry lands underneath.
 * It is also the only surface in the frame with a DASHBOARD shape — a 2×2
 * intel grid over a full-width analytics readout — where the other three
 * are lists.
 *
 * CONTENT PROVENANCE — everything below is from
 * design-assets/refs/session7/knowzilla-app/PRODUCT-NOTES.md §3.6
 * ("Session Review (post-call)", frames `scene-005` + `t-032`) unless
 * marked OURS.
 *   VERBATIM (PRODUCT-NOTES.md:193-215): the "Session review" framing; the
 *   status chip "Review before saving →"; the four panel names ⚠ PAIN
 *   POINTS / ⚑ GOALS / ⊘ BLOCKERS / ☑ DECISION CRITERIA; all five GOALS
 *   rows; the BLOCKERS empty state "No blockers identified yet"; three of
 *   the four DECISION CRITERIA rows; PAIN POINTS row 1; the per-row "×";
 *   the three "Add …" placeholders; "Skip" / "✓ Confirm & Save"; "Session
 *   duration: 04:44"; "SESSION ANALYTICS" with TALK RATIO / "you vs
 *   others" / a bar, PACING "⌄ Slow" / "Speed of speech", FILLER WORDS
 *   "0%" / "of total speech", TOTAL WORDS "106" / "Engagement volume"; and
 *   the feedback card "How was this session?" / "Quick rating helps us
 *   improve." / five stars / "Tell us why?".
 *
 * OUR COPY, not theirs — flagged rather than smuggled:
 *   · the deal room is "Northwind Discovery Q3" (AppFrame's ROOM), not
 *     "Acme Discovery24", so this is the session the hero just performed;
 *     GOALS row 5 follows it ("Assess fit for Northwind solutions" ←
 *     "Assess fit for Acme solutions").
 *   · PAIN POINTS rows 2-5 are OURS. The recorded frame's second row —
 *     "Unknown customer pain points (not yet captured in intel)" — is the
 *     product's PRE-discovery null row; it is the state the Assistant
 *     surface's own briefing describes thirty seconds earlier ("no captured
 *     pains, goals, blockers, or stakeholders in the current intel"), so
 *     shipping it AFTER the call would contradict the tour. It is replaced
 *     by four pains this call surfaced, written in the product's own
 *     register (§5 vocabulary: pains, budget, reps, deals, notes) — one of
 *     which ("Budget pressure to reduce spend this quarter") is the buyer
 *     line the page's own frozen wave section speaks.
 *   · DECISION CRITERIA row 4 "No formal procurement or RFP process" is
 *     OURS, lifted from the Assistant surface's chat answer in this same
 *     frame ("Confirm if there is a formal procurement or RFP process",
 *     verbatim t-028) — the criterion that answer implies.
 *   · TALK RATIO reads 54%, not the frame's 100%. 100% is their one-sided
 *     demo call, and it would contradict the live talk-time meter in the
 *     Assistant pane of this same frame (AppFrame RAMP ends at 54). One
 *     constant to revert: TALK_PCT. The bar is therefore signal (telemetry,
 *     healthy) rather than the frame's red-at-100%.
 *   · FILLER WORDS is rendered as a value "0%" + sub "of total speech". The
 *     frame leaves its big-value slot blank and puts the whole reading in
 *     the sub — see the ASYMMETRY note below.
 *   · PACING reads "✓ Steady", not the frame's "⌄ Slow" (user 2026-07-27, the
 *     same call as the Assistant strip's "PACE Steady" / "Ask a question" —
 *     no deficiency word anywhere inside the hero frame; the rail's standing
 *     rule in SideInstruments.tsx now applies in here too).
 *     The pill is signal-100/signal-700. The frame's pill is
 *     amber/cream and this system owns no amber; signal is its telemetry
 *     hue and this is the telemetry panel. Kept at the 100 tint, not 200,
 *     so the panel's one saturated element stays the TALK RATIO meter.
 *   · "Extracting from the call…" and the skeleton lines under it are ours
 *     — the panels' pre-fill frame. The video never shows the screen
 *     mid-extraction.
 *   · the duration line shares a row with Skip / Confirm & Save. In the
 *     frame it is a card of its own directly beneath them; a fixed 640px
 *     stage has no room for a third band.
 *
 * ASYMMETRY, decided not defaulted. The product's four analytics tiles are
 * structurally DIFFERENT: number + bar / pill / caption-only / number-only.
 * Three of those four are restored here — TALK RATIO is the wide tile and
 * the only one with a bar, PACING is a pill and carries no numeral, TOTAL
 * WORDS is a bare numeral. FILLER WORDS keeps a numeral instead of the
 * frame's empty value slot: reproducing a tile whose big value is blank
 * reproduces the exact dead-rectangle read this surface exists to kill, and
 * "0%" is the frame's own number, only moved up out of its caption.
 *
 * DELIBERATELY ABSENT (PRODUCT-NOTES §6 do-not-invent): confidence scores,
 * source citations, latency telemetry, cross-session/team analytics,
 * pipeline or forecast views, an objection taxonomy. Everything here is
 * per-session and was on camera.
 *
 * NOT the same device as src/components/ObjectionLibrary.tsx, which builds
 * this same screen as a TABBED card for the landing flow. Same evidence,
 * different shape on purpose: that one shows one list at a time, this one
 * shows all four at once and adds the analytics readout.
 *
 * MOTION: zero React state, zero effects, zero refs — the markup is the
 * SETTLED frame (`is-shown` already on), `rewind` makes the "before", and
 * the beats below write straight to the DOM via the contract helpers.
 * Nothing loops; after 7700ms the surface is completely still. This is also
 * the surface where the tour is USED rather than watched: the simulated
 * pointer reads the AI's write-up down the GOALS panel, watches the session
 * telemetry resolve, and CLICKS "Confirm & Save" — the payoff of the whole
 * frame, and the one press in the tour that decides something.
 *
 * TWO KEYS PER HOVERABLE THING that also has an entrance. `.af-in` and
 * `.af-hoverable` both declare the `transition` shorthand at equal
 * specificity and `.af-hoverable` is declared later in AppFrame.css, so one
 * element wearing both silently loses the house entrance's opacity + blur
 * tweens. Panels and intel rows therefore split into an OUTER entrance node
 * (`data-b="panel-goals"` / `data-b="row-4"`, what the beats show) and an
 * INNER hover/pointer node (`…-hit`). The row separator stays on the outer
 * node so it fades in WITH the row, which leaves the inner node free to own
 * a transparent border that the central hover rule colours in — and an
 * inline background the fill beats flash the row's category tint into.
 *
 * FIT (measured in the browser against AppFrame's fixed geometry — frame
 * 1120×640 at lg / 512 below, minus the 40px title bar, the 44px top bar and
 * the 220/56/0px sidebar). The intel grid is `items-start`, so BLOCKERS —
 * whose honest state is one empty-state row — is a SHORT panel rather than a
 * tall box with one line in it; the air under it is grid gap, not dead
 * panel. Zero clipping and zero horizontal overflow at 1600 / 1440 / 1296 /
 * 1280 / 1024 / 900 / 768 / 640 / 390.
 *
 * COLOUR: functional product colour, one tint per category, on the 18px
 * glyph tile, its uppercase label, and a 620ms landing flash behind the row
 * as it arrives — never as a standing panel fill (panels are surface-200 on
 * the frame's surface-100, hairlines for the rest).
 *   PAIN POINTS       risk-900 on risk-100
 *   GOALS             accent-700 on accent-100
 *   BLOCKERS          gray-800 on gray-300
 *   DECISION CRITERIA won-900 on won-100
 *   SESSION ANALYTICS signal-700 label, signal-600 bar, signal-100 pacing
 *                     pill (telemetry — the ramp that took the telemetry
 *                     role page-wide on 2026-07-27, and this panel is the one
 *                     place on the surface where the meaning is literally
 *                     "measured from the live call")
 *  Signal and accent sit ~17° apart, so only ONE of them is ever saturated
 *  here: the analytics meter. GOALS keeps accent as a tint + a 10px label,
 *  which is the tint role accent now holds inside the window.
 * ===================================================================== */

const ROOM = 'Northwind Discovery Q3' // AppFrame.tsx ROOM — the hero's session
const DURATION = '04:44' // §3.6 verbatim
const TALK_PCT = 54 // ours (frame reads 100 — see header)
const WORDS = 106 // §3.6 verbatim
const FILLER = '0%' // §3.6 verbatim ("0% of total speech")

/** `xl` exists because the frame reaches its 1120px cap only at ~1200px of
 *  viewport: between lg and xl the panel columns are ~350px wide, the long
 *  stakeholder rows wrap to three lines and the tail of GOALS / DECISION
 *  CRITERIA stops fitting. Measured, not guessed. */
type Show = 'sm' | 'md' | 'lg' | 'xl'

const showAt = (from?: Show) =>
  from === 'xl'
    ? 'hidden xl:flex'
    : from === 'md'
      ? 'hidden md:flex'
      : showFrom(from)

type Row = { t: string; from?: Show }

type Panel = {
  key: string
  /** the panel's name as the product writes it */
  label: string
  Icon: typeof Flag
  /** tint on the glyph tile */
  tile: string
  /** tint on the uppercase label */
  ink: string
  /** the category tint a row flashes as it lands */
  flash: string
  rows: Row[]
  /** the panel's "Add …" input, where the product has one */
  add?: string
  from?: Show
}

/* What this call produced, panel by panel. Rows carry a breakpoint rather
   than being squashed: a narrow frame shows fewer of them, never smaller
   ones. */
const PANELS: Panel[] = [
  {
    key: 'pain',
    label: 'Pain points',
    Icon: TriangleAlert,
    tile: 'bg-risk-100 text-risk-900',
    ink: 'text-risk-900',
    flash: 'var(--color-risk-100)',
    add: 'Add pain point...',
    rows: [
      { t: 'Unclear pain points with current processes' },
      { t: 'Call notes end up in three places afterwards' },
      { t: 'New reps take a full quarter to reach quota' },
      { t: 'Budget pressure to reduce spend this quarter', from: 'lg' },
      { t: 'Deals only get reviewed after they slip', from: 'sm' },
    ],
  },
  {
    key: 'goals',
    label: 'Goals',
    Icon: Flag,
    tile: 'bg-accent-100 text-accent-700',
    ink: 'text-accent-700',
    flash: 'var(--color-accent-100)',
    add: 'Add goal...',
    rows: [
      { t: 'Identify pains and value drivers' },
      { t: 'Confirm budget range' },
      { t: 'Confirm timeline and milestones' },
      { t: 'Identify stakeholders (economic buyer, technical/user champions)', from: 'lg' },
      { t: 'Assess fit for Northwind solutions' },
    ],
  },
  {
    key: 'blockers',
    label: 'Blockers',
    Icon: Ban,
    tile: 'bg-gray-300 text-gray-800',
    ink: 'text-gray-800',
    flash: 'var(--color-gray-300)',
    add: 'Add blocker...',
    from: 'sm',
    rows: [{ t: 'No blockers identified yet' }],
  },
  {
    key: 'criteria',
    label: 'Decision criteria',
    Icon: SquareCheck,
    tile: 'bg-won-100 text-won-900',
    ink: 'text-won-900',
    flash: 'var(--color-won-100)',
    from: 'sm',
    rows: [
      { t: "Alignment with customer's decision environment" },
      { t: 'Involvement of identified stakeholders (economic buyer, technical/user champions)', from: 'md' },
      { t: 'Clear budget range' },
      { t: 'No formal procurement or RFP process', from: 'md' },
    ],
  },
]

/** Flat row index → the panel it belongs to. Rows are keyed `row-<flat
 *  index>`, so this is also their beat order and the pointer's targets. */
const FLAT: { panel: number; row: number }[] = PANELS.flatMap((p, pi) =>
  p.rows.map((_r, ri) => ({ panel: pi, row: ri })),
)

/** Flat index of each panel's FIRST row, so a panel can key its own rows
 *  `row-<flat>` and the fill beats stay one flat sequence. */
const BASE: number[] = PANELS.reduce<number[]>(
  (acc, _p, i) => [...acc, i === 0 ? 0 : acc[i - 1] + PANELS[i - 1].rows.length],
  [],
)

/** Widths of the skeleton lines shown while a panel is still extracting.
 *  One fewer than the panel's rows (the "Extracting…" note occupies the
 *  first row's line), capped at three — so an honest one-row panel shows
 *  the note alone and never paints a skeleton over its own input. */
const SKEL = ['88%', '62%', '76%']

/** The count-up ladders. Steps are 200ms apart because the frame's clock
 *  ticks at 200ms — anything tighter lands two steps on one tick and the
 *  ladder silently loses rungs. */
const TALK_LADDER = [11, 26, 38, 47, TALK_PCT]
const WORDS_LADDER = [19, 47, 72, 93, WORDS]

/** The tinted category label. `PanelLabel` from kit.tsx encodes only the two
 *  page-wide voices (gray / accent), and these five labels are product colour
 *  coding — same recipe, one extra dial. */
function CatLabel({ ink, children }: { ink: string; children: string }) {
  return (
    <span className={`font-mono font-[550] text-[10px] tracking-[0.12em] uppercase ${ink}`}>{children}</span>
  )
}

function IntelPanel({ p, base }: { p: Panel; base: number }) {
  const skel = Math.min(Math.max(p.rows.length - 1, 0), SKEL.length)
  return (
    <div data-b={`panel-${p.key}`} className={`af-in is-shown min-w-0 ${showAt(p.from)}`}>
      <div
        data-b={`panel-${p.key}-hit`}
        className="af-hoverable af-lift flex min-w-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-hairline-2 bg-surface-200 p-2"
      >
        <span className="flex shrink-0 items-center gap-2">
          <span
            className={`flex size-[18px] shrink-0 items-center justify-center rounded-micro ${p.tile}`}
          >
            <p.Icon size={12} strokeWidth={1.5} />
          </span>
          <CatLabel ink={p.ink}>{p.label}</CatLabel>
        </span>

        {/* The rows are always in the layout — `af-in` moves opacity/transform/
            filter only — so the "still extracting" frame can sit absolutely
            over them and nothing ever reflows between the two states. The
            skeleton lines are what stop the pre-fill panel reading as an
            empty box: the panel is visibly WORKING, not blank. */}
        <div className="relative mt-1.5 flex min-w-0 flex-col">
          <span
            data-b={`extract-${p.key}`}
            className="af-in absolute inset-x-0 top-0 flex flex-col"
          >
            <span className="py-[3px] text-[11px] leading-[16px] text-gray-500 italic">
              Extracting from the call...
            </span>
            {SKEL.slice(0, skel).map((w) => (
              <span key={w} className="flex h-[20px] items-center">
                <span className="block h-[7px] rounded-full bg-gray-300" style={{ width: w }} />
              </span>
            ))}
          </span>
          {p.rows.map((r, ri) => (
            <span
              key={r.t}
              data-b={`row-${base + ri}`}
              className={`af-in is-shown flex-col border-b border-hairline-2 last:border-b-0 ${showAt(r.from)}`}
            >
              {/* Every row is genuinely interactive — it carries its own
                  remove "×" — so it is a hover target. The 1px transparent
                  border is what the frame's central rule paints gray-400 on
                  hover, and the inline background is what the fill beat
                  flashes the category tint into as the row lands. */}
              <span
                data-b={`row-${base + ri}-hit`}
                className="af-hoverable -mx-1 flex items-start gap-2 rounded-micro border border-transparent px-1 py-px sm:py-[2px]"
              >
                <span className="min-w-0 flex-1 text-[12px] leading-[16px] text-gray-800">
                  {r.t}
                </span>
                <X size={11} strokeWidth={1.5} className="mt-[3px] shrink-0 text-gray-500" />
              </span>
            </span>
          ))}
        </div>

        {p.add ? (
          <span
            data-b={`add-${p.key}`}
            className="af-hoverable mt-1 flex h-5 shrink-0 items-center rounded-input border border-hairline-2 bg-surface-100 px-2 text-[11px] text-gray-500 italic sm:mt-1.5 sm:h-[24px]"
          >
            {p.add}
          </span>
        ) : null}
      </div>
    </div>
  )
}

/** One of the three narrow analytics tiles. TALK RATIO is not one of these:
 *  it is twice as wide and owns the only bar in the panel. */
function Metric({
  n,
  label,
  sub,
  children,
}: {
  n: number
  label: string
  sub: string
  children: ReactNode
}) {
  return (
    <div
      data-b={`metric-${n}`}
      className="af-hoverable -mx-2 -my-1 flex min-w-0 flex-col justify-center rounded-micro border border-transparent px-2 py-1"
    >
      <span className="block truncate">
        <PanelLabel>{label}</PanelLabel>
      </span>
      {children}
      <span className="mt-[5px] truncate text-[11px] text-gray-600">{sub}</span>
    </div>
  )
}

function DealRoomsPane() {
  return (
    <>
      <div data-b="head" className="af-in is-shown shrink-0">
        <PaneHead
          title={ROOM}
          note="Session review"
          action={
            <span
              data-b="chip"
              className="af-in is-shown hidden h-7 shrink-0 items-center gap-1.5 rounded-micro border border-hairline-2 bg-surface-200 px-2 text-[11px] text-gray-700 sm:flex"
            >
              Review before saving
              <ArrowRight size={11} strokeWidth={1.5} className="text-gray-500" />
            </span>
          }
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-5 sm:p-6 lg:px-8 lg:py-5">
        {/* the 2×2 intel editor — this surface's whole reason to exist.
            `items-start` is load-bearing: it lets the one-row BLOCKERS panel
            be short instead of stretching a single empty-state line over a
            six-row box. */}
        <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-2.5 overflow-hidden sm:grid-cols-2">
          {PANELS.map((p, i) => (
            <IntelPanel key={p.key} p={p} base={BASE[i]} />
          ))}
        </div>

        {/* the review decision, with the session's length beside it */}
        <div className="flex shrink-0 items-center gap-4">
          <span data-b="duration" className="af-in is-shown truncate text-[12px] text-gray-600">
            Session duration: <span className="text-gray-800 tabular-nums">{DURATION}</span>
          </span>
          <span data-b="actions" className="af-in is-shown ml-auto flex shrink-0 items-center gap-3">
            <span
              data-b="skip"
              className="af-hoverable -my-1 rounded-micro border border-transparent px-2 py-1 text-[12px] text-gray-700"
            >
              Skip
            </span>
            {/* The primary action is an INK pill, and the frame's hover paint
                is a surface fill — put `af-hoverable` on the pill itself and it
                would turn white on hover. So the hover state lives on a 1px
                sleeve around it: the pill is unchanged, and hovering draws a
                gray-400 ring exactly 1px outside it. The negative margin keeps
                the sleeve free. */}
            <span
              data-b="confirm"
              className="af-hoverable -m-px flex rounded-button border border-transparent p-px"
            >
              <span className="flex h-8 items-center gap-1.5 rounded-button bg-ink px-3.5 text-[12px] font-medium text-surface-100">
                <Check size={12} strokeWidth={2} />
                Confirm &amp; Save
              </span>
            </span>
          </span>
        </div>

        {/* Telemetry: per-session only, signal, full width, and the LAST thing
            on the surface to resolve. It is the only data-visual the product
            owns, so it gets the whole width and the biggest numerals on the
            surface rather than four small tiles in a corner. Hidden below lg,
            where the frame is 512px tall and the intel needs every pixel. */}
        <div
          data-b="analytics"
          className="af-in is-shown hidden h-[136px] shrink-0 flex-col rounded-[10px] border border-hairline-2 bg-surface-200 p-3 lg:flex xl:h-[148px]"
        >
          <span className="flex shrink-0 items-center gap-2">
            <ChartColumn size={13} strokeWidth={1.5} className="text-signal-700" />
            <CatLabel ink="text-signal-700">Session analytics</CatLabel>
          </span>
          <div className="mt-2 grid min-h-0 flex-1 grid-cols-5 items-center gap-4 xl:gap-6">
            {/* TALK RATIO — the wide tile, and the only one with a bar (t-032) */}
            <div
              data-b="metric-0"
              className="af-hoverable col-span-2 -mx-2 -my-1 flex min-w-0 flex-col justify-center rounded-micro border border-transparent px-2 py-1"
            >
              <span className="block truncate">
                <PanelLabel>Talk ratio</PanelLabel>
              </span>
              <span className="mt-1 flex items-baseline gap-2">
                <span
                  data-b="talk"
                  /* The value's own width is reserved so that swapping "—" for
                     the counting numeral cannot nudge "you vs others" sideways.
                     Measured, not guessed: at these sizes tabular "11%" and
                     "54%" are both 61.84px / 70.67px, the dash is 27.17 / 31.05
                     — a 35–40px shift the moment the ladder starts. */
                  className="min-w-[62px] text-[28px] leading-none font-[600] tracking-[-0.03em] text-ink tabular-nums xl:min-w-[71px] xl:text-[32px]"
                >
                  {TALK_PCT}%
                </span>
                <span className="truncate text-[11px] text-gray-600">you vs others</span>
              </span>
              <span className="mt-2.5 block h-1.5 w-full overflow-hidden rounded-full bg-gray-300">
                <span
                  data-b="meter"
                  className="af-bar block h-full w-full rounded-full bg-signal-600"
                  style={{ transform: `scaleX(${TALK_PCT / 100})` }}
                />
              </span>
            </div>

            {/* PACING — a pill, not a numeral (t-032). The verdict is the last
                thing the readout resolves, so the slot holds the same "—" the
                two numerals hold until then; the pending dash is ABSOLUTE over
                the pill so the swap costs zero layout. */}
            <Metric n={1} label="Pacing" sub="Speed of speech">
              <span className="relative mt-1 flex h-[22px] items-center">
                <span
                  data-b="pace-pending"
                  className="af-in absolute left-0 text-[20px] leading-none font-[600] tracking-[-0.02em] text-ink xl:text-[22px]"
                >
                  {PENDING}
                </span>
                <span
                  data-b="pace"
                  className="af-in is-shown flex w-fit items-center gap-1 rounded-full bg-signal-100 px-2.5 py-1 text-[13px] leading-none font-[600] text-signal-700"
                >
                  <Check size={12} strokeWidth={2} />
                  Steady
                </span>
              </span>
            </Metric>

            <Metric n={2} label="Filler words" sub="of total speech">
              <span
                data-b="filler"
                className="mt-1 text-[20px] leading-none font-[600] tracking-[-0.02em] text-ink tabular-nums xl:text-[22px]"
              >
                {FILLER}
              </span>
            </Metric>

            <Metric n={3} label="Total words" sub="Engagement volume">
              <span
                data-b="words"
                className="mt-1 text-[20px] leading-none font-[600] tracking-[-0.02em] text-ink tabular-nums xl:text-[22px]"
              >
                {WORDS}
              </span>
            </Metric>
          </div>
        </div>

        {/* the feedback card, flattened to a strip so the analytics readout
            above it can have the full width (§3.6 — including "Tell us why?",
            which the taller card had no room for) */}
        <div
          data-b="rating"
          className="af-in is-shown hidden h-[32px] shrink-0 items-center gap-3 rounded-[10px] border border-hairline-2 bg-surface-200 px-3 xl:flex"
        >
          <span className="shrink-0 text-[12px] font-[550] text-ink">How was this session?</span>
          <span className="truncate text-[11px] text-gray-600">
            Quick rating helps us improve.
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-gray-400">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={13} strokeWidth={1.5} />
            ))}
          </span>
          <span className="shrink-0 text-[11px] text-gray-600 underline underline-offset-2">
            Tell us why?
          </span>
        </div>
      </div>
    </>
  )
}

/* ---------- the performance ----------------------------------------
 * One causal line inside the 8.0s hold: the review page opens on four
 * panels that are visibly still EXTRACTING (note + skeleton lines) → the
 * intel lands in them panel by panel, each row flashing its category tint
 * as it arrives, so the fill reads as computed rather than faded → the
 * call's length is stated → the rep is asked to save it → and only then
 * does the telemetry resolve: the readout has been sitting there since the
 * first second holding "—", and now the talk-ratio bar sweeps to 54%, both
 * numerals count up under the pointer, and the PACING verdict lands last. Because this is
 * the tour's final surface, the rep then DOES the thing: the pointer reads
 * down GOALS, watches the analytics finish, lands on "Confirm & Save" and
 * clicks it. Every value the beats write also ships in the markup, so a
 * reduced-motion or no-JS visitor sees the finished frame. */

/** What a not-yet-computed metric reads while the call is being written up. */
const PENDING = '\u2014'

/** Where each panel starts filling, and how far apart its own rows land. */
const PANEL_AT = [1000, 1700, 2420, 2620]
const ROW_STEP = 140
/** How long a landed row keeps its category tint before it decays. */
const FLASH_MS = 620

/** The landing flash. Inline background on the row's hover node: `.af-hoverable`
 *  already transitions background-color (300ms, killed entirely under
 *  prefers-reduced-motion), so setting it fades the tint in with the row and
 *  clearing it fades the tint out — no keyframes, and nothing to leave running. */
const tint = (el: HTMLElement | null, v: string) => {
  if (el) el.style.backgroundColor = v
}

/** The ladder runs LAST, and it runs under the pointer: the cursor reaches
 *  the talk-ratio tile at ~5.5s, which is where the ladder ends and the
 *  PACING verdict drops. */
const COUNT_AT = [4600, 4800, 5000, 5200, 5400]

const SCRIPT: Beat[] = [
  { at: 200, run: (root) => show(q(root, 'head')) },
  { at: 380, run: (root) => show(q(root, 'chip')) },
  /* 80ms apart against the frame's 200ms tick, i.e. deliberately BELOW the
     tick: the four panels drain in two pairs, which is the 2×2 grid arriving
     one ROW at a time rather than four separate pops. Same reasoning for the
     140ms row step inside a panel — a panel's rows land in clumps of two,
     which reads as a burst of extraction; the landing flash is what keeps a
     clumped pair legible as two events. */
  ...PANELS.map((p, i) => ({
    at: 520 + i * 80,
    run: (root: HTMLElement) => show(q(root, `panel-${p.key}`)),
  })),
  /* The telemetry PANEL arrives with the intel panels, holding "—" where its
     values will be, and only its VALUES resolve at the end. Holding the whole
     readout back until 4s left the bottom third of the surface as blank white
     paper for most of the performance — the exact read this rebuild exists to
     kill — and a structure that is already there while its numbers compute is
     also the donor's own mechanic (attio's table resolves cells inside a table
     that never wasn't there). */
  { at: 860, run: (root) => show(q(root, 'analytics')) },
  { at: 960, run: (root) => show(q(root, 'rating')) },

  // the extraction resolves panel by panel, one row at a time
  ...FLAT.flatMap((f, n) => {
    const at = PANEL_AT[f.panel] + f.row * ROW_STEP
    const p = PANELS[f.panel]
    return [
      {
        at,
        run: (root: HTMLElement) => {
          if (f.row === 0) hide(q(root, `extract-${p.key}`))
          show(q(root, `row-${n}`))
          tint(q(root, `row-${n}-hit`), p.flash)
        },
      },
      { at: at + FLASH_MS, run: (root: HTMLElement) => tint(q(root, `row-${n}-hit`), '') },
    ]
  }),

  { at: 3150, run: (root) => show(q(root, 'duration')) },
  { at: 3400, run: (root) => show(q(root, 'actions')) },

  { at: 4600, run: (root) => bar(q(root, 'meter'), TALK_PCT) },
  ...COUNT_AT.map((at, i) => ({
    at,
    run: (root: HTMLElement) => {
      text(q(root, 'talk'), `${TALK_LADDER[i]}%`)
      text(q(root, 'words'), `${WORDS_LADDER[i]}`)
      // Filler words has nothing to count — its value is zero — so it lands
      // whole on the ladder's last rung rather than counting 0 → 0.
      if (i === COUNT_AT.length - 1) text(q(root, 'filler'), FILLER)
    },
  })),
  {
    at: 5600,
    run: (root) => {
      hide(q(root, 'pace-pending'))
      show(q(root, 'pace'))
    },
  },

  /* The rep works the review. GOALS is the panel the call actually changed,
   * so the pointer enters there once its rows have landed (last GOALS row is
   * in at 2.26s), reads the three rows every width shows — flat 5/6/7 — then
   * moves to the talk ratio and arrives as the ladder finishes and the
   * PACING verdict drops. Hops are 650ms against the cursor's 620ms travel.
   * The click is deliberately the LAST thing that happens: the ring pulses
   * for 460ms, the pointer holds the button for another ~460ms, and only
   * then leaves, so the payoff is never stepped on. */
  { at: 2500, run: (root) => pointTo(root, 'panel-goals-hit', 0.5, 0.08) },
  { at: 3050, run: (root) => pointTo(root, 'row-5-hit', 0.45, 0.5) },
  { at: 3670, run: (root) => pointTo(root, 'row-6-hit', 0.45, 0.5) },
  { at: 4290, run: (root) => pointTo(root, 'row-7-hit', 0.45, 0.5) },
  { at: 4910, run: (root) => pointTo(root, 'metric-0', 0.32, 0.5) },
  { at: 6100, run: (root) => pointTo(root, 'confirm', 0.5, 0.5) },
  { at: 6800, run: (root) => pressOn(root, 'confirm') },
  { at: 7040, run: (root) => releaseOn(root, 'confirm') },
  { at: 7600, run: (root) => hidePointer(root) },
]

/** The frame walks `beats` in array order — a beat whose `at` sits behind an
 *  earlier entry would simply never fire on time — so the script is sorted. */
const beats: Beat[] = [...SCRIPT].sort((a, b) => a.at - b.at)

/** Everything both end-states have to agree on, in one place: forgetting a
 *  node here is how the reduced-motion frame and the taken-over frame drift
 *  apart. */
const PARTS = ['head', 'chip', 'duration', 'actions', 'analytics', 'rating', 'pace']

const DealRooms: PaneModule = {
  name: 'Deal Rooms',
  breadcrumb: `Deal Rooms / ${ROOM}`,
  actions: [{ label: 'Confirm & Save', primary: true }],
  // 7400 → 8000: the review ends in a real click, and the press ring plus
  // its hold needs the extra 600ms to land without being cut off by the
  // crossfade back to the live session.
  hold: 8000,
  Pane: DealRoomsPane,
  beats,

  /** the opening frame: four panels still being written */
  rewind: (root) => {
    hidePointer(root)
    PANELS.forEach((p) => {
      hide(q(root, `panel-${p.key}`))
      show(q(root, `extract-${p.key}`))
    })
    FLAT.forEach((_f, n) => {
      hide(q(root, `row-${n}`))
      tint(q(root, `row-${n}-hit`), '')
    })
    PARTS.forEach((k) => hide(q(root, k)))
    show(q(root, 'pace-pending'))
    // "—", not "0%": the readout is on screen from the first second, and a
    // rendered zero would be a WRONG measurement sitting there for four
    // seconds rather than a value that has not been computed yet.
    text(q(root, 'talk'), PENDING)
    text(q(root, 'words'), PENDING)
    text(q(root, 'filler'), PENDING)
    bar(q(root, 'meter'), 0)
  },

  /** the finished frame — identical to the markup */
  settle: (root) => {
    hidePointer(root)
    PANELS.forEach((p) => {
      show(q(root, `panel-${p.key}`))
      hide(q(root, `extract-${p.key}`))
    })
    FLAT.forEach((_f, n) => {
      show(q(root, `row-${n}`))
      tint(q(root, `row-${n}-hit`), '')
    })
    PARTS.forEach((k) => show(q(root, k)))
    hide(q(root, 'pace-pending'))
    text(q(root, 'talk'), `${TALK_PCT}%`)
    text(q(root, 'words'), `${WORDS}`)
    text(q(root, 'filler'), FILLER)
    bar(q(root, 'meter'), TALK_PCT)
  },
}

export default DealRooms
