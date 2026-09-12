import Lizzie from '../Lizzie'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import {
  BookOpen,
  Briefcase,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FlaskConical,
  Headphones,
  LogOut,
  PanelLeftClose,
  Phone,
  Send,
  Sparkles,
  UserPen,
} from 'lucide-react'
import { playScene, prefersReducedMotion, type SceneController } from './typewriter'
import {
  hidePointer,
  pointTo,
  pressOn,
  releaseOn,
  type PaneModule,
} from './panes/contract'
import KnowledgeBaseModule from './panes/KnowledgeBasePane'
import PlaygroundModule from './panes/PlaygroundPane'
import ColdCallsModule from './panes/ColdCallsPane'
import DealRoomsModule from './panes/DealRoomsPane'
import './AppFrame.css'

/* =====================================================================
 * AppFrame — the hero's wide product stage, and the page's ONLY product
 * tour. It does not present screenshots: it opens on the live session and
 * PERFORMS a ~9.8s call whose subject is THE REP BEING HELPED.
 *
 * WE JOIN A CALL THAT IS ALREADY 41 SECONDS OLD, so the opening frame is a
 * WORKING screen, not an empty one: a suggestion is standing, its questions
 * are listed under it, the meter is running. Nothing on this surface says
 * "None yet" except the two things that genuinely have not happened — the
 * rep has not asked the assistant anything, and has not written a note.
 * (That is a change: the surface used to open on "No suggestions at the
 * moment", "No next steps suggested yet" and an untouched right rail, which
 * put ~40% of the frame in an empty state for the first four seconds of the
 * first thing every visitor sees.)
 *
 * The beats are weighted, not evenly spread, and they are ONE causal chain
 * about the economic buyer:
 *   1 · The call is already producing intel: KEY PAIN POINTS goes from
 *       "None captured yet" to a captured pain, via a visible pending
 *       state. The briefing is being WRITTEN, not sitting still.
 *   2 · The standing suggestion says one champion has been named — so the
 *       rep runs down the questions it produced, CLICKS the economic-buyer
 *       one, and that click is what puts it into ASSISTANT CHAT.
 *   3 · The assistant answers with bulleted tactical advice; the answer is
 *       what the rep writes into MY NOTES.
 *   4 · Subordinate — the rep has kept talking, the meter's fill reaches
 *       its 50% target tick, the bar turns red and the "Ask a question"
 *       coaching pill arrives. This is WHY help is needed, not the
 *       subject, so it is the quietest beat.
 *   5 · Because the rep captured the buyer, the OPEN ITEM "Economic buyer
 *       not identified" resolves in the briefing. The rep's action closed a
 *       line in the deal record — that is the whole product in one beat.
 *   6 · HERO — only now does the call move on: the standing card LEAVES
 *       UPWARD and a new suggestion rises into its place and streams its
 *       own reasoning. It is the only element in the frame with an arrival
 *       of its own (`.af-card`: 10px travel, 3px blur, 420ms) and the only
 *       one wearing a 2px accent rule — "the call moved, and Knowzilla just
 *       handed you the move." A new OPEN ITEM lands beside it, because the
 *       new suggestion raised one.
 *
 * Only then does the same clock walk Knowledge Base → Playground → Cold
 * Calls → Deal Rooms and come back to the settled session (~39s in all).
 * One sequence, one thing happening at a time. A sidebar click hands
 * control over permanently.
 *
 * WHY FIVE SURFACES, NOT THREE (2026-07-25). The hero read "stale and not
 * impressive" beside attio.com's own hero demo. That demo cycles FIVE
 * structurally different surfaces — dashboard, AI home, AI chat, a dense
 * table, a workflow canvas — and every one of them visibly COMPUTES and
 * then RESOLVES (its table shows "AI is thinking…" and settles row by row;
 * its counters flip 149→150). Ours showed three surfaces that were all the
 * same shape — a list — with nothing ever resolving. So: Cold Calls and
 * Deal Rooms stop being inert rows and become real surfaces (a
 * speaker-labelled practice call + a scored review; the post-call Session
 * Review), every surface got a resolve beat, and the window chrome now
 * carries a breadcrumb and contextual actions that MUTATE with the active
 * module. Each surface is a self-contained module under panes/ that owns
 * its markup, beats, rewind and settled frame; this file owns only the
 * clock. Full analysis of the donor demo is in the session notes.
 *
 * CONTENT stays video-verified against
 * design-assets/refs/session7/knowzilla-app/PRODUCT-NOTES.md — the two new
 * surfaces are built from §3.4 (cold-call practice) and §3.6 (Session
 * Review), which the notes document even though the source video never
 * opens those nav items. Nothing outside the notes was invented; sample
 * copy sits only in evidenced slots and is flagged in each pane's header.
 *
 * Notably absent from the product, therefore absent here: a live
 * transcript during a REAL call (speech is consumed invisibly; the
 * speaker-labelled transcript exists only in the practice simulator),
 * source citations on guidance, confidence scores, latency readouts, an
 * objection taxonomy, sentiment meters, and any cross-session dashboard.
 *
 * ONE DELIBERATE DEPARTURE FROM THE FRAMES, FLAGGED FOR THE CHECKPOINT.
 * PRODUCT-NOTES §4.2 records PRE-CALL BRIEFING as "identical across t-026–
 * t-030 → it is computed BEFORE the call and does not move during it". We
 * now move two of its three lists during the call. The mechanism is
 * documented (§3.6: the Session Review shows the AI writing pain points,
 * goals, blockers and decision criteria OUT OF the call, human-editable
 * before saving); WHEN it surfaces is not — the frames only prove it by the
 * end. What we did NOT change is the narrative paragraph or SUGGESTED
 * APPROACH: those are genuinely pre-call, and they stand still. If the
 * checkpoint wants strict frame fidelity the fix is one line — drop the
 * three rail beats and the rail is static again.
 *
 * CRAFT is Notion — calm surfaces from the neutral ladder, 1.5px line
 * icons, hairlines instead of borders, an active nav row that is just a
 * soft grey fill. ONE RULE CHANGED: this file used to ban coloured pills
 * outright, and that ban is what made the frame read as a wireframe. Inside
 * the product window, colour is now allowed to CARRY DATA — document type,
 * practice mode, score band, intel category — because that is product UI
 * and the real app genuinely colour-codes all four. Every tint comes from
 * an owned ramp (accent / signal / won / risk / gray); none is hand-mixed,
 * none is a large area fill, and the page OUTSIDE this window is unchanged:
 * accent stays a mark there. Flagged for the checkpoint.
 *
 * Layout contract: the frame is a FIXED height at every breakpoint and
 * the panes are absolutely stacked inside it, so a module switch is a
 * pure crossfade (opacity + blur) and can never reflow anything.
 * ===================================================================== */

const ROOM = 'Northwind Discovery Q3'

/* ---------- shared pane furniture ---------------------------------- */

/** Pane header: screen name, one supporting line, optional right action.
 *  Same box in every pane so the eye lands in the same place on a switch. */
function PaneHead({ title, note, action }: { title: string; note: string; action?: ReactNode }) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline-2 px-6 py-4 lg:px-8 lg:py-5">
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-[550] tracking-[-0.01em] text-ink">{title}</h3>
        <p className="mt-0.5 truncate text-[12px] text-gray-600">{note}</p>
      </div>
      {action}
    </div>
  )
}

/** In-frame panel label — the product's own uppercase panel names. */
function PanelLabel({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span
      className={`font-mono font-[550] text-[10px] tracking-[0.12em] uppercase ${
        accent ? 'text-accent-600' : 'text-gray-600'
      }`}
    >
      {children}
    </span>
  )
}

/** Breakpoint a secondary row first appears at — smaller frames drop the
 *  tail of every list rather than clipping it. */
const showFrom = (from?: 'sm' | 'lg') =>
  from === 'lg' ? 'hidden lg:flex' : from === 'sm' ? 'hidden sm:flex' : 'flex'

/** Crossfade shell. All panes stay mounted; only opacity + blur move. */
function PaneShell({
  active,
  name,
  children,
}: {
  active: boolean
  name: string
  children: ReactNode
}) {
  return (
    <div
      data-pane={name}
      aria-hidden={!active}
      className={`absolute inset-0 flex flex-col overflow-hidden transition-[opacity,filter] duration-[340ms] ease-[var(--ease-entrance)] motion-reduce:transition-none ${
        active ? 'opacity-100 blur-[0px]' : 'pointer-events-none opacity-0 blur-[3px]'
      }`}
    >
      {children}
    </div>
  )
}

/* ---------- Assistant · the live session ---------------------------
 * Verified anatomy: a live coaching telemetry strip across the top (talk
 * time + a target tick + pace + fillers), a session header (room name,
 * elapsed timer, Email, Stop), guidance in the PRIMARY column — LIVE
 * SUGGESTION (category pill + title + rationale, with History) over NEXT
 * STEPS (ready-to-ask question rows) — read-only context in a narrower
 * right rail (PRE-CALL BRIEFING, MEETING NOTES), and ASSISTANT CHAT +
 * MY NOTES along the bottom. No transcript: the product does not show
 * one during a live call. */

/** The two suggestions the scene plays. One card at a time, exactly as the
 *  product does it — the second supersedes the first and the first goes to
 *  History (t-026 / t-029: LIVE SUGGESTION carries a standing "History"
 *  link in both its empty and populated states). `TITLE_2` / `WHY_2` are
 *  verbatim from t-029; the superseded pair is our own sample copy in the
 *  same slot. */
const TITLE_1 = 'Confirm Who Else Is Involved'
const WHY_1 =
  'They have named one champion only — surface the economic buyer before the conversation turns to price.'
const TITLE_2 = 'Clarify Current Decision Process'
const WHY_2 =
  'Understanding their current process reveals stakeholders and pain points before detailing the solution, aligning with discovery and decision involvement focus.'
/** What the rep types into their own notes — the answer to NEXT STEPS row 3
 *  ("Who is the economic buyer for this project?"), so beat 4 is visibly a
 *  consequence of beat 2. */
const NOTE = 'econ buyer = VP Ops'

const NEXT_STEPS: { q: string; from?: 'sm' | 'lg' }[] = [
  { q: 'What budget range have you allocated for this project?' },
  { q: 'How long have you experienced these challenges?', from: 'sm' },
  { q: 'Who is the economic buyer for this project?', from: 'lg' },
]

/* The rep asks the assistant a question mid-call and gets tactical advice
 * back. Verbatim from t-027 / t-028 / scene-003: the rep's own bubbles are
 * right-aligned and carry the product's primary colour, the assistant's are
 * left-aligned with a circular AI avatar, and the answer is BULLETED
 * tactical advice — not prose. The question is NEXT STEPS row 1 sent into
 * the chat (two of the four NEXT STEPS strings appear verbatim as rep
 * bubbles in the source frames, which is how we know the rows are sendable).
 * The three bullets are verbatim from t-028. */
const CHAT_ASK = 'Who is the economic buyer for this project?'
const CHAT_REPLY: string[] = [
  'Identify all stakeholders early to avoid blockers ("stakeholder hygiene").',
  'Include the economic buyer, technical/user champions, and any other decision influencers.',
  'Confirm if there is a formal procurement or RFP process.',
]

/** Every DOM node the scene writes to. The scene never calls setState. */
type El = RefObject<HTMLElement | null>
interface SceneRefs {
  clock: El
  talkPct: El
  bar: El
  coach: El
  card: El
  title: El
  why: El
  steps: RefObject<(HTMLElement | null)[]>
  notesEmpty: El
  notes: El
  notesSaved: El
  chatEmpty: El
  chatAsk: El
  chatReply: El
  chatBullets: RefObject<(HTMLElement | null)[]>
  /* the briefing rows the call writes into */
  painNone: El
  painRow: El
  painVal: El
  openRow1: El
  openVal1: El
  openRow3: El
  openVal3: El
}

/* Verbatim (WRITEBACK-EVIDENCE.md Screen I) with two changes, both forced:
 * the deal-room name is our page-wide Northwind account, and the second
 * sentence is truncated at its first clause. The full 334-char briefing plus
 * its eight long bullets cannot fit a 290px rail inside a fixed 640px stage —
 * measured: the rail has ~467px and the full text needs ~100px more — so the
 * rail's bullets are compressions of their verbatim counterparts. Flagged,
 * not smuggled. */
const BRIEFING = `${ROOM} appears to be in early discovery with no captured pains, goals, blockers, or stakeholders in the current intel.`

/* The briefing's two LIVE lists. Provenance, row by row:
 *   PAIN_NONE   — the list's own empty state, our phrasing of §3.6's
 *                 "not yet captured in intel" idiom (shipped since S7).
 *   PAIN_1      — VERBATIM, PRODUCT-NOTES §3.6 PAIN POINTS row 2
 *                 ("Unclear pain points with current processes").
 *   OPEN_1/2    — our sample copy, shipped since S7, in the evidenced
 *                 OPEN ITEMS slot; both trace to §3.6 GOALS rows
 *                 ("Identify stakeholders (economic buyer, …)",
 *                 "Confirm budget range").
 *   OPEN_1_SET  — OUR copy. The value is the one the rep types into MY
 *                 NOTES, so the row the call closed says what the call
 *                 found. Plain text + a tint; no checkmark taxonomy, no
 *                 score (§6 items 3 and 4).
 *   OPEN_3      — OUR copy, from the second suggestion's own title
 *                 ("Clarify Current Decision Process") and §3.6's
 *                 DECISION CRITERIA panel. Flagged: composed, not verbatim.
 *   CAPTURING   — OUR word, in the product's own progressive idiom
 *                 ("Listening…", §5 verbs) built on its confirmed verb
 *                 "Capture". Flagged: an inflection, not a quote. */
const PAIN_NONE = 'None captured yet'
const PAIN_1 = 'Unclear pain points with current processes'
const OPEN_1 = 'Economic buyer not identified'
const OPEN_1_SET = 'Economic buyer: VP Ops'
const OPEN_2 = 'No budget range captured'
const OPEN_3 = 'Decision process not confirmed'
const APPROACH = 'Map stakeholders before pricing'
const CAPTURING = 'Capturing…'

/** The talk-time target the meter's tick marks (PRODUCT-NOTES §4.2: "a tick
 *  marker at roughly the 50% position — i.e. a target/threshold, not just a
 *  fill"). Crossing it is what turns the bar red. */
const TARGET_PCT = 50

/** A briefing row: a 4px state dot and the text the call writes into it. */
function RailRow({
  rowRef,
  valRef,
  db,
  cls = '',
  children,
}: {
  rowRef?: RefObject<HTMLLIElement | null>
  valRef?: RefObject<HTMLSpanElement | null>
  /** Probe handle (scripts/session7-scene.mjs), same convention as the panes. */
  db?: string
  cls?: string
  children: ReactNode
}) {
  return (
    <li
      ref={rowRef}
      data-b={db}
      /* The padding/negative-margin pair is exactly cancelling: it gives the
         `af-flash` wash a band to paint into without changing the row's
         margin box, so the rail's layout is identical with and without it. */
      className={`af-row -mx-1.5 -my-0.5 flex items-start gap-2 rounded-micro px-1.5 py-0.5 text-[12px] text-gray-700 ${cls}`}
    >
      <span aria-hidden className="af-row__dot mt-[5px] size-1 shrink-0 rounded-full" />
      <span ref={valRef} className="af-row__val min-w-0 flex-1">
        {children}
      </span>
    </li>
  )
}

/** The rail's list headings — the product's own uppercase panel names. */
function RailLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-[550] tracking-[0.04em] text-gray-800">{children}</span>
  )
}

function AssistantPane({ s }: { s: SceneRefs }) {
  return (
    <>
      <PaneHead
        title="Live Assistant Session"
        note={`${ROOM} · Listening...`}
        action={
          <span className="hidden shrink-0 items-center gap-3 sm:flex">
            <span
              ref={s.clock as RefObject<HTMLSpanElement | null>}
              className="font-mono text-[13px] font-[550] text-won-900 tabular-nums"
            >
              {/* The settled clock, computed — not typed. The markup IS the
                  end state (what a reduced-motion visitor sees), and a
                  hardcoded time silently disagreed with what `settle()`
                  writes the moment SCENE_END moved, so the two settled paths
                  showed different clocks. */}
              {SETTLED_CLOCK}
            </span>
            <span className="flex h-7 items-center gap-1.5 rounded-micro border border-hairline-2 bg-surface-100 px-2 text-[11px] text-gray-700">
              <Send size={11} strokeWidth={1.5} className="text-gray-500" />
              Email
            </span>
            {/* The session header's open-in-new-window control (§4.2 region 2,
                between Email and Stop). Icon-only, as in the frames. */}
            <span className="hidden size-7 items-center justify-center rounded-micro border border-hairline-2 bg-surface-100 text-gray-600 lg:flex">
              <ExternalLink size={11} strokeWidth={1.5} />
            </span>
            <span className="flex h-7 items-center gap-1.5 rounded-micro border border-hairline-2 bg-surface-100 px-2 text-[11px] text-gray-700">
              {/* §4.2 region 2 renders this as a RED record dot, not an outline
                  square — the session is recording, and that is the one place
                  the product spends red on this screen besides the meter. */}
              <span aria-hidden className="size-2 rounded-full bg-risk-700" />
              Stop
            </span>
          </span>
        }
      />

      {/* Live coaching telemetry — the scene's SUBORDINATE beat. Verified
          against t-026 (01:00, un-escalated) and t-029 (04:10, escalated):
          across both frames PACE and FILLERS read UNCHANGED, so neither is a
          scene value and neither is written by the timeline. (The product's
          own reading is "Slow"; we render "Steady" — see the copy note below.)
          What DOES escalate, and now does here too: §4.2 records a TICK
          MARKER at ~50% ("a target/threshold, not just a fill") and the same
          bar teal at t-026 and RED at t-029/t-030 with a coaching pill
          inline. We rendered neither: the tick was a 1px white hairline lost
          inside a 6px bar, and the fill never changed colour. The tick
          is now a 2px gray-500 marker standing proud of the bar, the fill
          crossing it turns the bar risk-700 (owned ramp, and the one thing
          on this surface that IS a risk state), and the pill follows 400ms
          later so it reads as the consequence rather than a coincidence.
          The tick is absolutely positioned, so standing proud costs the
          strip no height. Every element is in the layout from the start —
          the pill only fades in, so the strip never reflows. */}
      <div className="flex shrink-0 flex-col gap-2 border-b border-hairline-2 bg-surface-200 px-4 py-2.5 lg:flex-row lg:items-center lg:gap-6 lg:px-8 lg:py-3.5">
        <span className="flex shrink-0 items-baseline gap-2">
          <span className="font-mono font-[550] text-[10px] tracking-[0.12em] text-gray-600 uppercase">
            Your talk time
          </span>
          <span
            ref={s.talkPct as RefObject<HTMLSpanElement | null>}
            className="w-9 text-[13px] font-[600] text-ink tabular-nums"
          >
            54%
          </span>
        </span>
        <span className="relative h-1.5 w-full shrink-0 lg:w-auto lg:min-w-0 lg:flex-1">
          <span className="block h-full w-full overflow-hidden rounded-full bg-gray-300">
            <span
              ref={s.bar as RefObject<HTMLSpanElement | null>}
              /* signal-600 — this bar IS the page's live telemetry, which is
                 the meaning the signal ramp took over on 2026-07-27.
                 `.is-over` still repaints it risk-700 on the crossing, so
                 the escalation is unaffected. */
              className="af-bar is-over block h-full w-full rounded-full bg-signal-600"
              style={{ transform: 'scaleX(0.54)' }}
            />
          </span>
          {/* the target tick */}
          <span
            aria-hidden
            data-b="tick"
            className="absolute -top-1 -bottom-1 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-gray-500"
          />
        </span>
        <span className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1.5 font-mono font-[550] text-[10px] tracking-[0.08em] text-gray-600 uppercase">
          {/* labels uppercase, readings mixed-case — as the product renders
              them ("PACE ⊖ Steady", "FILLERS ☆ 0%").
              USER 2026-07-27: the readings used to say "Slow" beside a pill
              that said "Slow down!" — the strip told the rep they were slow
              and then told them to slow down. Both are gone. The rail's
              standing constraint (SideInstruments.tsx: no deficiency word —
              slow, low, missed, behind, risk) now applies INSIDE the frame
              too: this strip reports steady state and the escalation hands
              over the next action instead of a scolding. */}
          <span>
            Pace <span className="text-gray-800 normal-case">Steady</span>
          </span>
          <span>
            Fillers <span className="text-gray-800 normal-case">0%</span>
          </span>
          <span
            ref={s.coach as RefObject<HTMLSpanElement | null>}
            /* `normal-case`: the strip's labels are uppercase but this is a
               message, not a label — the product renders those mixed-case.
               Accent, not risk: crossing your own talk-time target is the
               moment guidance arrives, and guidance is what this product
               sells. The bar keeps its risk tint because the CROSSING is
               data; only the words coach. */
            className="af-in is-shown flex items-center gap-1 rounded-micro bg-accent-100 px-1.5 py-0.5 text-accent-800 normal-case"
          >
            <CircleHelp size={10} strokeWidth={2} />
            Ask a question
          </span>
        </span>
      </div>

      {/* `min-h-0` is load-bearing: as a bare `flex-1` item this grid keeps
          its auto min-height, so it refused to shrink to its flex basis and
          spilled its bottom row (ASSISTANT CHAT / MY NOTES) past the
          frame's fixed 640px — silently, because the pane clips. With
          min-h-0 the `1fr` row resolves to the space that actually exists. */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:grid lg:grid-cols-[1fr_290px] lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-x-10 lg:gap-y-2 lg:px-8 lg:py-3">
        {/* primary column — the guidance itself.
            The gaps and the card box below are TIGHTER than they were, and
            that is a bug fix, not a taste change: measured at every lg width,
            this column's content was 351px inside a 316px grid row, so the
            third NEXT STEPS row was painting straight through the ASSISTANT
            CHAT divider beneath it (visible in
            design-assets/ours/session8/hero/01-assistant-live-1440.png). The
            card box was sized for a three-line rationale that only wraps to
            two at `lg`. */}
        <div className="flex min-w-0 flex-col gap-4 lg:gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between gap-4">
              <PanelLabel accent>Live suggestion</PanelLabel>
              {/* Standing panel furniture, not a beat: t-026 shows the
                  History link in the EMPTY state too, and it carries no
                  count in any frame. */}
              <span className="hidden text-[11px] text-gray-500 lg:block">History</span>
            </div>
            {/* Fixed-height box: one card at a time, and swapping its contents
                can never move anything below it. */}
            <div className="relative mt-3 h-[164px] shrink-0 sm:h-[150px] lg:mt-2 lg:h-[124px]">
              {/* The hero beat's carrier. `af-card` (not `af-in`) gives it
                  the frame's one bespoke arrival, and the 2px accent rule is
                  the product's own coloured left rule on this card (t-026 /
                  t-029) read through our accent-as-a-mark rule. */}
              <div
                ref={s.card as RefObject<HTMLDivElement | null>}
                data-b="suggestion"
                className="af-card af-hoverable is-shown absolute inset-0 overflow-hidden rounded-card border border-hairline-2 border-l-2 border-l-accent-600 bg-surface-100 p-3 shadow-float sm:p-4"
              >
                <span className="inline-flex items-center rounded-micro border border-hairline-2 bg-surface-200 px-2 py-0.5 font-mono font-[550] text-[9px] tracking-[0.1em] text-accent-600 uppercase">
                  Ask
                </span>
                <p
                  ref={s.title as RefObject<HTMLParagraphElement | null>}
                  className="mt-3 text-[15px] font-[550] tracking-[-0.01em] text-ink"
                >
                  {TITLE_2}
                </p>
                <p
                  ref={s.why as RefObject<HTMLParagraphElement | null>}
                  className="mt-2 text-[12px] leading-relaxed text-gray-700 lg:leading-snug"
                >
                  {WHY_2}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <PanelLabel>Next steps</PanelLabel>
            {/* No empty state here any more. A suggestion is standing when we
                join the call, so the questions it produced are standing too —
                and "No next steps suggested yet." sitting in the middle of the
                frame for four seconds was the single loudest "stale" signal on
                the surface. The product's verbatim empty state is therefore no
                longer rendered anywhere; flagged for the checkpoint. */}
            <div className="relative mt-2 flex flex-col lg:mt-1">
              {NEXT_STEPS.map(({ q, from }, i) => (
                <span
                  key={q}
                  ref={(el) => {
                    s.steps.current[i] = el
                  }}
                  data-b={`step-${i}`}
                  className={`af-in af-hoverable is-shown -mx-2 items-center gap-3 rounded-micro border-b border-hairline-2 px-2 py-1.5 lg:py-1 ${showFrom(from)}`}
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] text-gray-800">{q}</span>
                  <ChevronRight size={14} strokeWidth={1.5} className="shrink-0 text-gray-500" />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* right rail — the deal record, half of it standing still and half of
            it being written by the call in progress. The narrative paragraph
            and SUGGESTED APPROACH are genuinely pre-call and never move; KEY
            PAIN POINTS and OPEN ITEMS do (see the departure note at the top of
            this file).
            Every row that will ever exist is in the layout from the opening
            frame — hidden rows are `af-in` at opacity 0, and the pain slot
            stacks its empty state and its captured row in ONE grid cell — so
            a row landing can never reflow the rail under it. */}
        <div className="hidden min-w-0 flex-col gap-3 lg:flex">
          <div className="flex flex-col">
            <PanelLabel>Pre-call briefing</PanelLabel>
            <p className="mt-2 text-[12px] leading-relaxed text-gray-700">{BRIEFING}</p>
          </div>

          <div className="flex flex-col">
            <RailLabel>KEY PAIN POINTS</RailLabel>
            <ul className="mt-1 grid grid-cols-1">
              <li
                ref={s.painNone as RefObject<HTMLLIElement | null>}
                data-b="pain-none"
                className="af-in af-row col-start-1 row-start-1 -mx-1.5 -my-0.5 flex items-start gap-2 rounded-micro px-1.5 py-0.5 text-[12px] text-gray-700"
              >
                <span aria-hidden className="af-row__dot mt-[5px] size-1 shrink-0 rounded-full" />
                <span className="af-row__val min-w-0 flex-1">{PAIN_NONE}</span>
              </li>
              <RailRow
                rowRef={s.painRow as RefObject<HTMLLIElement | null>}
                valRef={s.painVal as RefObject<HTMLSpanElement | null>}
                db="pain"
                cls="af-in is-shown is-new col-start-1 row-start-1"
              >
                {PAIN_1}
              </RailRow>
            </ul>
          </div>

          <div className="flex flex-col">
            <RailLabel>OPEN ITEMS</RailLabel>
            <ul className="mt-1 flex flex-col gap-1.5">
              <RailRow
                rowRef={s.openRow1 as RefObject<HTMLLIElement | null>}
                valRef={s.openVal1 as RefObject<HTMLSpanElement | null>}
                db="open-1"
                cls="is-set"
              >
                {OPEN_1_SET}
              </RailRow>
              {/* Nothing on this call touches the budget, so this one stays
                  open — a list where every row resolves is a list nobody
                  believes. */}
              <RailRow>{OPEN_2}</RailRow>
              <RailRow
                rowRef={s.openRow3 as RefObject<HTMLLIElement | null>}
                valRef={s.openVal3 as RefObject<HTMLSpanElement | null>}
                db="open-3"
                cls="af-in is-shown is-new"
              >
                {OPEN_3}
              </RailRow>
            </ul>
          </div>

          <div className="flex flex-col">
            <RailLabel>SUGGESTED APPROACH</RailLabel>
            <ul className="mt-1 flex flex-col gap-1.5">
              <RailRow>{APPROACH}</RailRow>
            </ul>
          </div>
          {/* MEETING NOTES is real (t-027) but it is an EMPTY-STATE panel —
              "notes will appear here as they are generated" — and it is still
              empty at 04:39 in every source frame. It cost ~55px of the rail
              and said nothing, so the populated ASSISTANT CHAT below takes
              that height instead. Removed content, not invented content. */}
        </div>

        {/* bottom edge: the rep's two writing surfaces */}
        <div className="hidden gap-10 border-t border-hairline-2 pt-2 lg:col-span-2 lg:grid lg:grid-cols-[1fr_290px]">
          <div className="flex min-w-0 flex-col">
            <PanelLabel>Assistant chat</PanelLabel>
            {/* A real two-sided exchange, not an empty composer. The rep sends
                a NEXT STEPS row into the chat and the assistant answers with
                bulleted tactical advice (t-027 / t-028 / scene-003). The
                whole exchange lives in a FIXED-height box so the two bubbles
                arriving can never reflow the notes field beside them or the
                guidance column above. */}
            <div className="relative mt-1 h-[88px] min-w-0">
              <span
                ref={s.chatEmpty as RefObject<HTMLSpanElement | null>}
                className="af-in absolute inset-x-0 top-0 text-[12px] text-gray-500"
              >
                No messages yet. Start the conversation.
              </span>

              {/* the rep's own voice — right-aligned, accent-tinted */}
              <div
                ref={s.chatAsk as RefObject<HTMLDivElement | null>}
                className="af-in is-shown absolute inset-x-0 top-0 flex justify-end"
              >
                <span className="max-w-[86%] rounded-[10px] rounded-br-[3px] bg-accent-600 px-2.5 py-1.5 text-[12px] leading-snug text-surface-100">
                  {CHAT_ASK}
                </span>
              </div>

              {/* the assistant's answer — left-aligned, avatar, bulleted */}
              <div
                ref={s.chatReply as RefObject<HTMLDivElement | null>}
                className="af-in is-shown absolute inset-x-0 top-[30px] flex gap-2"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-600 text-surface-100"
                >
                  <Sparkles size={10} strokeWidth={2} />
                </span>
                <ul className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-[10px] rounded-tl-[3px] bg-surface-300 px-2.5 py-1.5">
                  {CHAT_REPLY.map((line, i) => (
                    <li
                      key={line}
                      ref={(el) => {
                        s.chatBullets.current[i] = el
                      }}
                      className="af-in is-shown flex items-start gap-1.5 text-[11px] leading-snug text-gray-800"
                    >
                      <span
                        aria-hidden
                        className="mt-[6px] size-1 shrink-0 rounded-full bg-accent-600"
                      />
                      <span className="min-w-0 flex-1 truncate">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <span className="mt-1 flex items-center gap-2.5 rounded-input border border-hairline-2 bg-surface-200 px-3 py-1 text-gray-500">
              <span className="min-w-0 flex-1 truncate text-[12px]">
                Type your message and press Enter...
              </span>
              <Send size={13} strokeWidth={1.5} className="shrink-0 text-gray-500" />
            </span>
          </div>
          <div className="flex min-w-0 flex-col">
            <PanelLabel>My notes</PanelLabel>
            <span
              data-b="notes"
              className="af-hoverable mt-2 flex items-center gap-2 rounded-input border border-hairline-2 bg-surface-200 px-3 py-2"
            >
              {/* The field's own placeholder, verbatim, stacked on the typed
                  value in ONE grid cell so the rep writing into it can never
                  reflow the rail. Grid rather than absolute: the value span is
                  empty at the opening frame, and an absolute placeholder over
                  an empty box collapses to zero height and clips itself. */}
              <span className="grid min-w-0 flex-1 grid-cols-1">
                <span
                  ref={s.notesEmpty as RefObject<HTMLSpanElement | null>}
                  className="af-in col-start-1 row-start-1 min-w-0 truncate text-[12px] text-gray-500"
                >
                  Type your notes here... Saved automatically.
                </span>
                <span
                  ref={s.notes as RefObject<HTMLSpanElement | null>}
                  className="col-start-1 row-start-1 min-w-0 truncate text-[12px] text-gray-800"
                >
                  {NOTE}
                </span>
              </span>
              <span
                ref={s.notesSaved as RefObject<HTMLSpanElement | null>}
                className="af-in is-shown shrink-0 text-[11px] text-gray-500"
              >
                Saved
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ---------- the frame --------------------------------------------- */

type NavItem = {
  name: string
  icon: typeof BookOpen
  /** Panes that don't perform simply ignore the scene refs. */
  Pane?: (props: { s: SceneRefs }) => ReactNode
  /** Window-chrome breadcrumb while this surface is active. */
  breadcrumb?: string
  /** This surface's contextual actions, rendered in the window chrome. */
  actions?: { label: string; primary?: boolean }[]
  /** Surfaces that own their choreography carry their whole module. */
  mod?: PaneModule
}

/** Adapt a self-contained pane module (panes/contract.ts) to a nav row. The
 *  module owns its markup, its beats, its rewind and its settled frame; the
 *  frame owns only the clock that plays them. */
const fromModule = (mod: PaneModule, icon: typeof BookOpen): NavItem => ({
  name: mod.name,
  icon,
  Pane: mod.Pane,
  breadcrumb: mod.breadcrumb,
  actions: mod.actions,
  mod,
})

/** The product's real primary group, in its real order. Cold Calls and
 *  Deal Rooms are never opened in the source video, so they carry no pane
 *  and no click affordance — we don't invent screens we haven't seen. */
const PRIMARY: NavItem[] = [
  fromModule(KnowledgeBaseModule, BookOpen),
  fromModule(PlaygroundModule, FlaskConical),
  {
    name: 'Assistant',
    icon: Headphones,
    Pane: AssistantPane,
    breadcrumb: `Assistant / ${ROOM}`,
    // No chrome action here: the live session's Email / Stop already sit in
    // its own header, and repeating "Stop" 40px above itself reads as a bug.
  },
  // Cold Calls and Deal Rooms are no longer inert. Both were dead nav rows
  // because the source video never opens them; the product notes DO document
  // the cold-call practice flow (§3.4) and the post-call Session Review
  // (§3.6), so both are now real surfaces built from that evidence.
  {
    ...fromModule(ColdCallsModule, Phone),
    // The pane's own control bar already carries "Stop Session"; the chrome
    // copy of it was the same button twice.
    actions: undefined,
  },
  {
    ...fromModule(DealRoomsModule, Briefcase),
    // Same reason as Cold Calls: "Confirm & Save" is already the loud primary
    // action inside the review itself, so the chrome doesn't repeat it.
    actions: undefined,
  },
]

/** Secondary group below the divider, as in the product. */
const SECONDARY: { name: string; icon: typeof BookOpen }[] = [
  { name: 'FAQ', icon: CircleHelp },
  { name: 'Edit Profile', icon: UserPen },
  { name: 'Logout', icon: LogOut },
]

/** Indices of the surfaces we have evidence for — the only ones with a pane
 *  and the only ones the sequence ever opens. */
const PANES: number[] = PRIMARY.reduce<number[]>((acc, item, i) => (item.Pane ? [...acc, i] : acc), [])

/** The live session is the product's heart, so the stage opens on it. */
const START = PRIMARY.findIndex((m) => m.name === 'Assistant')


/* ---------- the sequence -------------------------------------------
 * ONE virtual clock, not two. The frame opens on Assistant and PERFORMS
 * the live call; only when that scene has finished does the same clock
 * walk the module tour and return to the settled session. One thing
 * happens at a time.
 *
 * Donor mechanism (inspo/attio/DESIGN.md §4.2 + §5.2): Attio's hero card
 * is a TIME-driven scene machine with "no scroll gate" (M4c), scenes swap
 * by "content blur/fade out 300ms → next mounts" in ~6s bands (M4b), and
 * beats arrive at 250–300ms with a 250–500ms stagger (M4). Our two
 * suggestion bands are ~6s each, matching the donor's grain.
 *
 * The clock advances on a 200ms interval and ONLY while the frame is on
 * screen; the interval is destroyed when it leaves. `t` lives in a ref, so
 * scrolling away pauses and scrolling back RESUMES — it can never restart
 * or replay. Everything the scene touches is written straight to the DOM
 * (textContent / classList / transform), so the whole 12s performance
 * costs zero React renders. */
const TICK_MS = 200
const START_SECS = 41
const SCENE_END = 13200
/** The rate the assistant's rationale STREAMS at. Deliberately faster than
 *  the typewriter's 45cps human default — the rep types their note at human
 *  speed, the model streams its answer. 176 chars at 80cps ≈ 2.2s, which is
 *  what fills the last third of the scene. */
const STREAM_CPS = 80

/** The order the tour walks after the live call. Deal Rooms is last on
 *  purpose: the Session Review is what the call the hero just performed
 *  turns into, so the tour ends on the payoff and then returns home. */
const TOUR_ORDER = ['Knowledge Base', 'Playground', 'Cold Calls', 'Deal Rooms']

/** Let the 340ms crossfade land before a surface starts performing. */
const CROSSFADE = 400

type Stop = { idx: number; at: number; mod: PaneModule }

/** Absolute schedule, derived from each module's own declared `hold` rather
 *  than hand-tuned constants — adding or reordering a surface can't desync
 *  the clock. */
const STOPS: Stop[] = (() => {
  const out: Stop[] = []
  let t = SCENE_END + CROSSFADE
  for (const name of TOUR_ORDER) {
    const idx = PRIMARY.findIndex((m) => m.name === name)
    const mod = PRIMARY[idx]?.mod
    if (idx < 0 || !mod) continue
    out.push({ idx, at: t, mod })
    t += mod.hold
  }
  return out
})()

const TOUR_END = STOPS.length
  ? STOPS[STOPS.length - 1].at + STOPS[STOPS.length - 1].mod.hold
  : SCENE_END + CROSSFADE

/** How long the tour rests on the finished call before going round again.
 *  Short on purpose: it is a breath on the payoff frame, not a pause. */
const HOME_HOLD = 2000

/** Talk time creeps up while the rep keeps talking, crossing the 50% target
 *  tick at ~7.0s — which is what causes the escalation beat 400ms later.
 *
 *  The ramp is deliberately SHALLOW (44 → 54 over 9.8s). Talk time is a
 *  ratio over the whole call, and the call is already 41s old when we join:
 *  44% of 41s is ~18s talked, and talking through the next 9s gives
 *  (18+9)/50 ≈ 54%. A steeper climb would be arithmetically impossible,
 *  and a quiet climb is also what keeps this beat subordinate. */
const RAMP: [number, number][] = [
  [0, 44],
  [3000, 47],
  [7000, 50],
  [SCENE_END, 54],
]

function talkAt(t: number) {
  if (t <= 0) return RAMP[0][1]
  for (let i = 1; i < RAMP.length; i += 1) {
    const [t0, v0] = RAMP[i - 1]
    const [t1, v1] = RAMP[i]
    if (t <= t1) return Math.round(v0 + (v1 - v0) * ((t - t0) / (t1 - t0)))
  }
  return RAMP[RAMP.length - 1][1]
}

const mmss = (secs: number) =>
  `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

/** The elapsed time the session rests at. Rendered into the settled markup AND
 *  written by `settle()`, so the reduced-motion frame and the taken-over frame
 *  can never drift apart (they had, by 4s). */
const SETTLED_CLOCK = mmss(START_SECS + Math.floor(SCENE_END / 1000))

export default function AppFrame({ className = '' }: { className?: string }) {
  const [active, setActive] = useState(START)
  const rootRef = useRef<HTMLDivElement>(null)
  const takenRef = useRef(false)
  const settleRef = useRef<() => void>(() => {})

  // virtual-clock state — refs, so pausing/resuming never re-renders
  const tRef = useRef(0)
  const beatRef = useRef(0)
  const secRef = useRef(-1)
  const pctRef = useRef(-1)
  const doneRef = useRef(false)

  const scene: SceneRefs = {
    clock: useRef<HTMLElement | null>(null),
    talkPct: useRef<HTMLElement | null>(null),
    bar: useRef<HTMLElement | null>(null),
    coach: useRef<HTMLElement | null>(null),
    card: useRef<HTMLElement | null>(null),
    title: useRef<HTMLElement | null>(null),
    why: useRef<HTMLElement | null>(null),
    steps: useRef<(HTMLElement | null)[]>([]),
    notesEmpty: useRef<HTMLElement | null>(null),
    notes: useRef<HTMLElement | null>(null),
    notesSaved: useRef<HTMLElement | null>(null),
    chatEmpty: useRef<HTMLElement | null>(null),
    chatAsk: useRef<HTMLElement | null>(null),
    chatReply: useRef<HTMLElement | null>(null),
    chatBullets: useRef<(HTMLElement | null)[]>([]),
    painNone: useRef<HTMLElement | null>(null),
    painRow: useRef<HTMLElement | null>(null),
    painVal: useRef<HTMLElement | null>(null),
    openRow1: useRef<HTMLElement | null>(null),
    openVal1: useRef<HTMLElement | null>(null),
    openRow3: useRef<HTMLElement | null>(null),
    openVal3: useRef<HTMLElement | null>(null),
  }

  /* A LAYOUT effect, deliberately: the markup ships the SETTLED end state (so
   * a reduced-motion visitor needs no JavaScript), and the scene rewinds it to
   * the call's opening frame. Under `useEffect` that rewind lands after the
   * first paint, so the hero flashed its finished frame for ~100ms on every
   * load. Running before paint makes the rewind unobservable. */
  useLayoutEffect(() => {
    const s = scene
    /** A module's own DOM subtree. Panes all stay mounted, so this resolves
     *  whether or not the surface is currently the visible one. */
    const paneRoot = (name: string) =>
      rootRef.current?.querySelector<HTMLElement>(`[data-pane="${name}"]`) ?? null
    /* The pointer, addressed through the Assistant pane's own subtree. */
    const aim = (key: string, at = 0.5, yAt = 0.5) => {
      const el = paneRoot('Assistant')
      if (el) pointTo(el, key, at, yAt)
    }
    const press = (key: string) => {
      const el = paneRoot('Assistant')
      if (el) pressOn(el, key)
    }
    const release = (key: string) => {
      const el = paneRoot('Assistant')
      if (el) releaseOn(el, key)
    }
    const dropPointer = () => {
      const el = paneRoot('Assistant')
      if (el) hidePointer(el)
    }
    const show = (r: El) => r.current?.classList.add('is-shown')
    const hide = (r: El) => r.current?.classList.remove('is-shown')
    const text = (r: El, v: string) => {
      if (r.current) r.current.textContent = v
    }
    const bar = (pct: number) => {
      if (s.bar.current) s.bar.current.style.transform = `scaleX(${pct / 100})`
      // Crossing the target tick is what escalates the meter — the class is
      // driven by the VALUE, so retuning RAMP can never leave the colour and
      // the fill disagreeing.
      s.bar.current?.classList.toggle('is-over', pct >= TARGET_PCT)
    }
    /** Put a briefing row into its "the AI is writing this" state. */
    const railPending = (row: El, val: El) => {
      row.current?.classList.remove('is-new', 'is-set')
      row.current?.classList.add('is-pending', 'is-shown')
      text(val, CAPTURING)
    }
    /** …and resolve it. `is-new` = the call captured this; `is-set` = the
     *  call closed an open item. `af-flash` is the one-shot "just changed"
     *  wash and only ever exists here, never in the settled markup. */
    const railWrite = (row: El, val: El, v: string, kind: 'is-new' | 'is-set') => {
      row.current?.classList.remove('is-pending')
      row.current?.classList.add(kind, 'is-shown', 'af-flash')
      text(val, v)
    }

    /** The settled end state — identical to the markup, so this is also what
     *  a reduced-motion visitor sees and what a take-over click resolves to. */
    const settle = () => {
      text(s.clock, mmss(START_SECS + Math.floor(SCENE_END / 1000)))
      text(s.talkPct, `${RAMP[RAMP.length - 1][1]}%`)
      bar(RAMP[RAMP.length - 1][1])
      show(s.coach)
      hide(s.painNone)
      s.painRow.current?.classList.remove('is-pending')
      s.painRow.current?.classList.add('is-new', 'is-shown')
      text(s.painVal, PAIN_1)
      s.openRow1.current?.classList.remove('is-pending')
      s.openRow1.current?.classList.add('is-set')
      text(s.openVal1, OPEN_1_SET)
      s.openRow3.current?.classList.remove('is-pending')
      s.openRow3.current?.classList.add('is-new', 'is-shown')
      text(s.openVal3, OPEN_3)
      s.card.current?.classList.remove('is-out')
      show(s.card)
      text(s.title, TITLE_2)
      text(s.why, WHY_2)
      s.steps.current.forEach((el) => el?.classList.add('is-shown'))
      hide(s.notesEmpty)
      text(s.notes, NOTE)
      show(s.notesSaved)
      hide(s.chatEmpty)
      show(s.chatAsk)
      show(s.chatReply)
      s.chatBullets.current.forEach((el) => el?.classList.add('is-shown'))
      // The visitor's own mouse takes over from here, so the simulated one
      // gets out of the way.
      const asst = paneRoot('Assistant')
      if (asst) hidePointer(asst)
      // Every other surface resolves too, so a visitor who takes over mid-tour
      // never lands on a half-performed screen.
      STOPS.forEach(({ mod }) => {
        const el = paneRoot(mod.name)
        if (el) mod.settle?.(el)
      })
    }
    settleRef.current = settle

    // Reduced motion: no scene, no tour. The markup already IS the end state.
    if (prefersReducedMotion()) return

    const typers: SceneController[] = []
    /* `cps` is a real distinction, not a knob: MY NOTES is a human typing
     * (the engine's default 45cps) and the rationale is a model streaming
     * its answer, which is faster and is the donor's #5 aliveness mechanic
     * (ATTIO-HERO-SPEC §8: "AI response text streams in line-by-line"). */
    const type = (r: El, s2: string, cps?: number) =>
      typers.push(
        playScene([{ kind: 'type', el: r, text: s2, cps }], { loop: false, holdMs: 0 }),
      )
    const stopTypers = () => {
      typers.forEach((c) => c.stop())
      typers.length = 0
    }

    /* Rewind the settled markup to the call's opening frame, with every
       transition suppressed for one frame so the rewind is never seen. */
    const root = rootRef.current
    root?.classList.add('af-still')
    // We join a call already in progress, so the opening frame is a WORKING
    // screen: the standing suggestion and the questions it produced are
    // already there. Only the things that genuinely have not happened yet are
    // wound back — the chat, the note, the escalation, and the two briefing
    // lists the call is about to write.
    s.card.current?.classList.remove('is-out')
    show(s.card)
    s.steps.current.forEach((el) => el?.classList.add('is-shown'))
    hide(s.coach)
    hide(s.notesSaved)
    show(s.notesEmpty)
    hide(s.chatAsk)
    hide(s.chatReply)
    s.chatBullets.current.forEach((el) => el?.classList.remove('is-shown'))
    show(s.chatEmpty)
    show(s.painNone)
    hide(s.painRow)
    s.painRow.current?.classList.remove('is-new', 'is-set', 'is-pending', 'af-flash')
    text(s.painVal, '')
    s.openRow1.current?.classList.remove('is-new', 'is-set', 'is-pending', 'af-flash')
    text(s.openVal1, OPEN_1)
    hide(s.openRow3)
    s.openRow3.current?.classList.remove('is-new', 'is-set', 'is-pending', 'af-flash')
    text(s.openVal3, '')
    text(s.clock, mmss(START_SECS))
    text(s.talkPct, `${talkAt(0)}%`)
    bar(talkAt(0))
    // The standing suggestion is already written when we join the call: only
    // the one that SUPERSEDES it types itself, which is what gives the hero
    // beat its weight.
    text(s.title, TITLE_1)
    text(s.why, WHY_1)
    text(s.notes, '')
    void root?.offsetWidth
    root?.classList.remove('af-still')

    /* One causal timeline, weighted so the HELP is the subject. Each beat
     * happens BECAUSE of the last:
     *   the call is 41s old        → a suggestion and its questions stand
     *   the call is producing intel→ KEY PAIN POINTS computes, then resolves
     *   the standing card says one
     *     champion has been named  → the rep runs down its questions and
     *                                CLICKS the economic-buyer one, which
     *                                is what puts it into ASSISTANT CHAT
     *   the assistant answers      → its answer lands in MY NOTES
     *   the rep keeps talking past
     *     the target tick          → bar turns red, then "Ask a question"
     *                                (the quietest beat — it is the WHY,
     *                                not the subject)
     *   the buyer got captured     → the OPEN ITEM about the buyer resolves
     *   the call moves on          → HERO: the standing card is superseded —
     *                                it leaves upward, the new one rises in
     *                                and streams its own reasoning, and the
     *                                open item IT raises lands in the rail
     *
     * Supersession is a three-part move on ONE node, so the swap has to
     * reset the card from "out" back to its hidden start without tweening
     * (both states are invisible, but the transform would carry over and the
     * card would then enter from ABOVE instead of from below). `af-nt` kills
     * transitions for exactly one frame — the same trick as `af-still`,
     * scoped to one element. */
    const supersede = () => s.card.current?.classList.add('is-out')
    const swapIn = () => {
      const el = s.card.current
      if (!el) return
      el.classList.add('af-nt')
      el.classList.remove('is-shown', 'is-out')
      text(s.title, TITLE_2)
      text(s.why, '')
      void el.offsetWidth
      el.classList.remove('af-nt')
      el.classList.add('is-shown')
    }
    const BEATS: { at: number; fn: () => void }[] = [
      /* The rail computes first: within half a second of arriving, the thing
         that used to be 40% of a frozen screen is visibly being written. */
      { at: 400, fn: () => railPending(s.painRow, s.painVal) },
      { at: 1200, fn: () => (hide(s.painNone), railWrite(s.painRow, s.painVal, PAIN_1, 'is-new')) },

      /* From here the REP drives, and the pointer shows it. The chain is
         causal end to end: they read the standing suggestion, run down the
         questions it produced, CLICK one, that click is what puts the
         question into the assistant, the assistant answers it, and the
         answer is what they write into their own notes. Nothing in this
         stretch happens on its own.
         (PRODUCT-NOTES §4.3: NEXT STEPS rows carry a chevron affordance and
         two of the four appear verbatim as rep bubbles in ASSISTANT CHAT —
         so clicking a row to send it is the product's own mechanic.) */
      { at: 1600, fn: () => aim('suggestion', 0.3, 0.45) },
      { at: 2600, fn: () => aim('step-0', 0.32) },
      { at: 3200, fn: () => aim('step-2', 0.32) },
      { at: 3800, fn: () => press('step-2') },
      {
        at: 4000,
        fn: () => {
          release('step-2')
          hide(s.chatEmpty)
          show(s.chatAsk)
        },
      },
      { at: 4800, fn: () => show(s.chatReply) },
      /* 200ms apart, NOT 150: the clock is a 200ms interval, so two beats
         inside one tick fire on the same tick and the staircase collapses.
         Measured — at 150ms spacing bullets 0 and 1 both landed at 10918ms
         and only the third one staggered. Any beat pair closer than TICK_MS
         is a beat pair that does not exist. */
      { at: 5000, fn: () => s.chatBullets.current[0]?.classList.add('is-shown') },
      { at: 5200, fn: () => s.chatBullets.current[1]?.classList.add('is-shown') },
      { at: 5400, fn: () => s.chatBullets.current[2]?.classList.add('is-shown') },
      { at: 6000, fn: () => aim('notes', 0.2) },
      { at: 6400, fn: () => (hide(s.notesEmpty), type(s.notes, NOTE)) },
      /* The meter's fill reaches the target tick at t=7000 (see RAMP) and the
         bar turns red there, in the clock — the pill is 400ms behind it so
         the escalation reads as a consequence of the crossing. */
      { at: 7200, fn: () => show(s.notesSaved) },
      { at: 7400, fn: () => show(s.coach) },

      /* The rep captured the economic buyer, so the open item about the
         economic buyer closes. This is the product's own loop — §3.6 shows
         exactly these rows being written out of a call — and it is the beat
         that makes the briefing worth looking at. */
      { at: 8200, fn: () => railPending(s.openRow1, s.openVal1) },
      { at: 9000, fn: () => railWrite(s.openRow1, s.openVal1, OPEN_1_SET, 'is-set') },

      /* Only now does the call move on. The hero beat and the rationale
         streaming under it carry the last third of the scene. */
      { at: 9600, fn: supersede },
      { at: 10000, fn: swapIn },
      { at: 10400, fn: () => type(s.why, WHY_2, STREAM_CPS) },
      /* The rep turns back to the card. Without this the pointer sits parked
         on MY NOTES for the last 6.5s of the scene, which reads as abandoned
         rather than finished — and the last thing the visitor should watch a
         human do is look at the advice. */
      { at: 10800, fn: () => aim('suggestion', 0.3, 0.45) },
      { at: 11200, fn: () => railPending(s.openRow3, s.openVal3) },
      { at: 12000, fn: () => railWrite(s.openRow3, s.openVal3, OPEN_3, 'is-new') },
      // The pointer leaves before the tour moves on, so it is never left
      // frozen over a surface that is fading out.
      { at: 12900, fn: dropPointer },
      /* The tour. Each surface is rewound to its opening frame at the moment
         it becomes active — it is still behind the crossfade, so the rewind
         is never visible — and then plays its OWN beats against the same
         clock. The frame owns the schedule; the modules own what happens. */
      ...STOPS.flatMap(({ idx, at, mod }) => [
        {
          at,
          fn: () => {
            const el = paneRoot(mod.name)
            if (el) mod.rewind?.(el)
            setActive(idx)
          },
        },
        ...(mod.beats ?? []).map((b) => ({
          at: at + b.at,
          fn: () => {
            const el = paneRoot(mod.name)
            if (el) b.run(el)
          },
        })),
      ]),
      { at: TOUR_END, fn: () => setActive(START) },
      /* …and then it goes round again. See LOOP below. */
      { at: TOUR_END + HOME_HOLD, fn: () => loop() },
    ].sort((a, b) => a.at - b.at)

    /* THE TOUR LOOPS; THE CALL DOES NOT (owner, 2026-07-27: "compared to attio
       they always have something happening in a loop"). Measured before the
       change: the frame's last DOM mutation landed at 44.75s and it was dead
       for every second after that — 40.3% of a 75s sample, and 100% of any
       visit longer than a minute. Attio's hero cycles its surfaces on ~37s and
       never stops.
       Only the TOUR replays. The opening 13.2s live call does not: it would
       have to rewind a typed note, a chat exchange, a pointer path and a
       running 00:41 clock, and a call that visibly restarts reads as a
       cartoon. The four tour surfaces already declare `rewind()` (each stop
       calls it behind the crossfade), so cycling them costs no new state
       machine — the clock is simply wound back to the first stop. HOME_HOLD is
       a short breath on the completed call, which is the scene's payoff frame,
       before the tour starts over. */
    const LOOP_AT = STOPS.length ? STOPS[0].at : -1
    const LOOP_INDEX = BEATS.findIndex((b) => b.at >= LOOP_AT)
    function loop() {
      if (LOOP_AT < 0 || LOOP_INDEX < 0) return
      /* Park one tick BEFORE the first stop so the next tick lands on it
         exactly, rather than firing it inside the tick that requested the
         loop. Assigning beatRef here is only safe because the drain
         increments BEFORE it calls fn() — see the tick. */
      tRef.current = LOOP_AT - TICK_MS
      beatRef.current = LOOP_INDEX
    }
    /* SORTED, deliberately. The tick drains beats with
       `while (BEATS[i].at <= t)`, which silently stops at the first beat
       that is out of order — so a beat written above an earlier one, or a
       module whose beats interleave with the frame's, would just never
       fire. Sorting makes the list order in the source a matter of
       readability instead of a correctness trap. */

    let id: number | null = null
    const stop = () => {
      if (id !== null) {
        window.clearInterval(id)
        id = null
      }
    }
    const tick = () => {
      tRef.current += TICK_MS
      const t = tRef.current
      // the elapsed timer and the meter run only while the call is playing
      if (t <= SCENE_END) {
        const sec = START_SECS + Math.floor(t / 1000)
        if (sec !== secRef.current) {
          secRef.current = sec
          text(s.clock, mmss(sec))
        }
        const pct = talkAt(t)
        if (pct !== pctRef.current) {
          pctRef.current = pct
          text(s.talkPct, `${pct}%`)
          bar(pct)
        }
      }
      /* Reads tRef.current, not the `t` captured above, and advances the
         pointer BEFORE running the beat — both so `loop()` can rewind the
         clock and the pointer from inside a beat without this drain then
         stampeding through the whole tour on one tick or skipping the stop it
         just landed on. */
      while (beatRef.current < BEATS.length && BEATS[beatRef.current].at <= tRef.current) {
        const beat = BEATS[beatRef.current]
        beatRef.current += 1
        beat.fn()
      }
      if (beatRef.current >= BEATS.length) {
        doneRef.current = true
        stop()
      }
    }
    const start = () => {
      if (id !== null || doneRef.current || takenRef.current) return
      id = window.setInterval(tick, TICK_MS)
    }
    settleRef.current = () => {
      doneRef.current = true
      stop()
      stopTypers()
      settle()
    }

    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      start()
      return () => {
        stop()
        stopTypers()
      }
    }
    // Pause off-screen / resume on return. `t` persists, so the scene picks
    // up exactly where it stopped and can never replay.
    /* WAKE AT 30%, NOT AT ONE PIXEL (owner, 2026-07-27: "the moment it comes
       to 30% in screen it should start"). `threshold: 0` was measured waking
       the whole 13.2s scene on 30 visible pixels of a 640px frame
       (intersectionRatio 0.0494) — and because `t` persists and never
       replays, a visitor scrolling up from mid-page arrived after the opening
       had already played to itself off-screen.
       The ratio is checked against the VIEWPORT as well, because
       intersectionRatio is a fraction of the element: a frame taller than the
       viewport can never reach 0.3 of itself, which would leave the scene
       permanently unstarted on short/mobile screens. Whichever measure is
       satisfied first wakes it.
       Asymmetric on purpose — wake at 30%, sleep only when it is gone
       entirely — so a scroll parked near the boundary cannot flap the clock. */
    const WAKE_RATIO = 0.3
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          stop()
          return
        }
        const ofViewport = entry.intersectionRect.height / (window.innerHeight || 1)
        if (entry.intersectionRatio >= WAKE_RATIO || ofViewport >= WAKE_RATIO) start()
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.75, 1] },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      stop()
      stopTypers()
    }
    // Refs are stable; the sequence is built once per mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* A click is the visitor taking over: end the sequence for good and
   * resolve the session pane to its settled frame so it is never left
   * half-performed, then jump. */
  const pick = (i: number) => {
    takenRef.current = true
    settleRef.current()
    setActive(i)
  }

  // Chrome that tracks the content: both mutate with the active surface.
  const crumb = PRIMARY[active].breadcrumb ?? PRIMARY[active].name
  const actions = PRIMARY[active].actions ?? []

  return (
    <div
      ref={rootRef}
      data-appframe=""
      className={`relative mx-auto flex h-[512px] w-full max-w-[1120px] flex-col overflow-hidden rounded-[14px] border border-hairline-2 bg-surface-100 shadow-stage lg:h-[640px] ${className}`}
    >
      {/* The simulated pointer. ONE node for the whole frame, positioned by
          transform from the frame's top-left, so the tour can drive it
          without ever laying out. It exists so the stage reads as a product
          being USED: wherever it lands it lights the same `.af-hoverable`
          state a visitor's own mouse lights. Hidden entirely under
          prefers-reduced-motion. */}
      <span aria-hidden data-cursor className="af-cursor">
        <span className="af-cursor__ring" />
        <svg
          className="af-cursor__arrow"
          width="17"
          height="20"
          viewBox="0 0 17 20"
          fill="none"
        >
          <path
            d="M1 1.2 14.6 11.1h-6.2l-2.1 6.3z"
            fill="var(--color-ink)"
            stroke="var(--color-surface-100)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {/* Chrome: the house window device (mock/Window.tsx), nothing more. The
          product's ONLY clock is the session's elapsed timer in the session
          header — a second, absolute wall clock was our furniture and is
          gone. */}
      {/* Window chrome. The traffic lights are the house device; the
          BREADCRUMB and the surface's own contextual actions live here and
          MUTATE with the active module, so the chrome tracks the content
          instead of sitting inert above it. Keeping them in the existing
          40px bar costs the panes no height — a second toolbar would have
          taken 44px off every surface and repeated each pane's own title. */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-hairline-2 bg-surface-200 px-4">
        <div aria-hidden className="flex shrink-0 items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-gray-400" />
          <span className="size-2.5 rounded-full bg-gray-400" />
          <span className="size-2.5 rounded-full bg-gray-400" />
        </div>

        <span className="ml-2 hidden min-w-0 items-center gap-1.5 text-[11px] text-gray-700 sm:flex">
          <span className="shrink-0 text-gray-500">Knowzilla</span>
          <ChevronRight size={11} strokeWidth={1.5} className="shrink-0 text-gray-500" />
          <span className="min-w-0 truncate font-[550] text-ink">{crumb}</span>
        </span>

        <span className="ml-auto flex shrink-0 items-center gap-2">
          {actions.map(({ label, primary }) => (
            <span
              key={label}
              className={`hidden h-[22px] items-center rounded-micro px-2 text-[11px] lg:flex ${
                primary
                  ? 'bg-ink font-[550] text-surface-100'
                  : 'border border-hairline-2 bg-surface-100 text-gray-700'
              }`}
            >
              {label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
            {/* Workspace marker, not a status light: it names the tenant and
                signals nothing, so it stays on the neutral ramp with the
                label it belongs to. Blue here would spend the live/telemetry
                colour on chrome furniture. */}
            <span aria-hidden className="size-1.5 rounded-full bg-gray-600" />
            <span className="hidden sm:inline">Tolerate &amp; Pay, LLC</span>
          </span>
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* sidebar — 220px, collapses to a 56px icon rail, hidden on phones */}
        <aside className="hidden shrink-0 flex-col border-r border-hairline-2 bg-surface-200 py-3 md:flex md:w-14 lg:w-[220px]">
          <div className="flex h-8 items-center gap-2 px-2 md:justify-center lg:justify-start lg:px-3">
            <span
              aria-hidden
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-600 text-surface-100"
            >
              <Sparkles size={11} strokeWidth={2} />
            </span>
            <span className="hidden text-[13px] font-[550] text-ink lg:inline">Knowzilla</span>
            {/* The product's real sidebar collapse toggle (scene-002, top
                corner). There is no search row and no ⌘K anywhere in the
                sidebar — that was borrowed Notion convention. */}
            <PanelLeftClose
              size={13}
              strokeWidth={1.5}
              className="ml-auto hidden shrink-0 text-gray-500 lg:block"
            />
          </div>

          <nav className="mt-6 flex flex-col gap-0.5 px-2">
            {PRIMARY.map(({ name, icon: Icon, Pane }, i) => {
              const on = i === active
              const row = (
                <>
                  <Icon size={15} strokeWidth={1.5} className="shrink-0" />
                  <span className="hidden truncate text-[13px] lg:inline">{name}</span>
                </>
              )
              const base =
                'flex h-[30px] w-full items-center gap-2.5 rounded-micro px-1.5 md:justify-center lg:justify-start lg:px-2'
              // Surfaces we have never seen are shown, not faked: no pane, no
              // hover affordance, no click.
              return Pane ? (
                <button
                  key={name}
                  type="button"
                  aria-current={on ? 'true' : undefined}
                  onClick={() => pick(i)}
                  className={`kz-hover kz-focus-ring ${base} ${
                    on
                      ? 'bg-surface-300 font-[550] text-ink'
                      : 'text-gray-700 hover:bg-surface-300 hover:text-ink'
                  }`}
                  style={{ transitionProperty: 'background-color, color' }}
                >
                  {row}
                </button>
              ) : (
                <span key={name} className={`${base} text-gray-700`}>
                  {row}
                </span>
              )
            })}
          </nav>

          {/* Lizzie on the rail. The owner picked this spot himself: the column
            * between the last module and the utility group is genuinely dead
            * space, and the divider below is a REAL structural hairline she can
            * rest on — a ledge that already exists rather than a container
            * invented to hold her. Hidden below lg because the rail collapses
            * to icons there and she would crowd them.
            *
            * She is deliberately NOT given a semantic job here. Codex's round-5
            * analysis was right that a permanently visible mascot inside the
            * product would turn into ambient furniture and cannibalise any
            * meaning-carrying use (author avatar, empty state). Those uses are
            * not built, so nothing is being cannibalised — but if they ever are,
            * this is the one to drop. */}
          {/* Sits left-of-centre, not centred: the rail's own content (module
            * rows, utility links) is left-aligned, so a centred mascot floats
            * against that axis. Owner's call — "bit more on the left".
            *
            * The asset is the round-8 sitting pose, MIRRORED. Two reasons the
            * owner's own drawing lost this slot: it faces away from the rail's
            * content, and it holds one forepaw up by the cheek. Mirrored r8
            * faces into the column with both paws down in the lap, which reads
            * as settled rather than mid-gesture — right for something that is
            * permanently on screen. */}
          <div className="mt-auto hidden pb-1 pl-3 lg:flex">
            <Lizzie variant="sitting" height={64} className="translate-y-px" />
          </div>

          <div className="flex flex-col gap-0.5 border-t border-hairline-2 px-2 pt-3 lg:mt-0">
            {SECONDARY.map(({ name, icon: Icon }) => (
              <span
                key={name}
                className="flex h-[28px] w-full items-center gap-2.5 rounded-micro px-1.5 text-gray-600 md:justify-center lg:justify-start lg:px-2"
              >
                <Icon size={14} strokeWidth={1.5} className="shrink-0" />
                <span className="hidden truncate text-[12px] lg:inline">{name}</span>
              </span>
            ))}
          </div>
        </aside>

        {/* main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Phones: the five surfaces as a segmented control. FLEX, not
              grid — a grid item keeps `min-width: auto`, so with five tabs
              the labels refused to shrink and the row overflowed the frame
              on both sides at 390px. `min-w-0 flex-1` lets them truncate.

              RETIRED BELOW md (2026-07-29): even with truncation the five tabs
              only got 67–68px each at font-size 10px, and "Knowledge Base"
              still ellipsised — a control that looks tappable but is too small
              to aim at. Both donors refuse this: Attio's mobile hero swaps the
              whole composition for a SEALED 371×296 `overflow-hidden` card with
              no controls at all (`inspo/attio/design-assets/dumps4/
              mobile-hero-tree.json`), and its tablet drops the platform tab
              rail the same way (`ol.hidden lg:flex`, attio/DESIGN.md:571).
              The tour still walks TOUR_ORDER on its own clock, so the frame
              reads as a self-playing cropped window — which is exactly the
              donor's mobile grammar. The titlebar traffic dots stay, so the
              window still announces itself as product.
              Kept in the tree rather than deleted so this is one class to
              revert if the checkpoint wants the tabs back. */}
          <div className="hidden shrink-0 border-b border-hairline-2 bg-surface-200">
            {PANES.map((idx: number, n: number) => {
              const on = idx === active
              return (
                <button
                  key={PRIMARY[idx].name}
                  type="button"
                  aria-current={on ? 'true' : undefined}
                  onClick={() => pick(idx)}
                  className={`kz-hover kz-focus-ring block h-8 min-w-0 flex-1 truncate px-1 text-center text-[10px] leading-8 ${
                    n < PANES.length - 1 ? 'border-r border-hairline-2' : ''
                  } ${on ? 'bg-surface-300 font-[550] text-ink' : 'text-gray-700'}`}
                  style={{ transitionProperty: 'background-color, color' }}
                >
                  {PRIMARY[idx].name}
                </button>
              )
            })}
          </div>

          <div className="relative min-h-0 flex-1">
            {PRIMARY.map(({ name, Pane }, i) =>
              Pane ? (
                <PaneShell key={name} name={name} active={i === active}>
                  <Pane s={scene} />
                </PaneShell>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
