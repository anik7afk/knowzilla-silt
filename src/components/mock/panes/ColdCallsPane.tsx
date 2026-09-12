import { CircleDot, Headphones, Mic, PhoneForwarded, User } from 'lucide-react'
import { PanelLabel, PaneHead } from './kit'
import {
  bar,
  hide,
  hideAll,
  hidePointer,
  pointTo,
  pressOn,
  q,
  qa,
  releaseOn,
  show,
  showAll,
  text,
} from './contract'
import type { Beat, PaneModule } from './contract'

/* =====================================================================
 * Cold Calls — "Customer Call Practice", the rep rehearsing against an AI
 * persona and then being graded by it.
 *
 * This is the frame's only CONVERSATION surface (speaker-labelled bubbles)
 * and its only SCORED surface (a five-axis rubric). Every other pane is a
 * list, which is exactly why this one exists: the tour needs a shape it
 * has not shown yet.
 *
 * ---------------------------------------------------------------------
 * PROVENANCE — design-assets/refs/session7/knowzilla-app/PRODUCT-NOTES.md
 * §3.4 "Playground → Cold call practice" (`t-015`/`t-016` config,
 * `t-017` live, `t-018` review), plus §3.3 for the persona format.
 *
 * VERBATIM from the frames:
 *   · "Cold Call Practice" / "Customer Call Practice"            (t-017)
 *   · Agent turn 1: "Office of the COO, Greg speaking. What is this
 *     regarding?"                                                (t-017)
 *   · speaker labels "Agent" (left) / "You" (right, coloured)    (t-017/018)
 *   · control bar: circular "Mute" (mic) + "Stop" (record), and a
 *     "Stop Session" primary button                              (t-017)
 *   · "SESSION REVIEW"                                           (t-018)
 *   · the review's SHAPE: an outcome line with a phone icon and a
 *     first-person reason from the persona, then "OVERALL SCORE" n/10 +
 *     "Goal Achieved: yes/no", then "RUBRIC" over the five axes Clarity /
 *     Empathy / Engagement / Relevance / Professionalism, then
 *     "PERFORMANCE FEEDBACK" → "Strengths" / "Areas for Improvement"
 *                                                                (t-018)
 *   · persona "Gatekeeper Greg", customer type "Startup", language
 *     "English", difficulty "Medium"                             (t-015/016)
 *
 * OUR COPY — written in the product's own voice, in evidenced slots.
 * Flagged here rather than smuggled (project practice, same as AppFrame's
 * TITLE_1/WHY_1):
 *   · **THE WHOLE ENDING.** `t-018` records a FAILED practice call:
 *     "Customer hung up the call" / "Caller not offering relevant value and
 *     repeatedly asking for help outside my role", OVERALL SCORE 6/10,
 *     "Goal Achieved: No", rubric 2/3/2/1/3, and the Strengths body "Polite
 *     tone and did not become aggressive or rude during the call." Every
 *     one of those strings is verbatim and every one of them is GONE.
 *     This surface sits in a marketing hero, and a red failure state is the
 *     wrong note to end a product tour on — the subject is a rep GETTING
 *     BETTER, not a rep failing. So the outcome, the score, the goal flag,
 *     the five rubric numbers and both feedback bodies below are OURS,
 *     written into slots the frame proves exist, in the frame's own
 *     grammar (persona speaks in the first person and gives a reason; one
 *     axis stays weak so the rubric reads as coaching rather than a
 *     trophy). This is a deliberate departure from the source recording,
 *     not an extraction of it.
 *   · transcript turns 2–5 (the "You" lines and the two later Agent lines).
 *     They are written to CAUSE the outcome above: the caller states a
 *     relevant reason in one line and asks for the right owner exactly
 *     once, which is verbatim the reason the review now gives for the
 *     transfer. `t-018` shows a partly-occluded "You" bubble ending
 *     "…me for a CRM project?", so CRM is the practice topic; the wording
 *     is ours.
 *   · the persona's role line "Office of the COO" — read off Greg's own
 *     verbatim greeting, not invented.
 *
 * NOT SHOWN, per PRODUCT-NOTES §6: no confidence score, no source
 * citation on the feedback, no latency telemetry, no objection taxonomy,
 * no sentiment meter, no cross-session analytics.
 * ---------------------------------------------------------------------
 * OUR STAGING — flagged, because it is not in any frame. `t-018` records
 * only the FINISHED review; the product's own loading state for it was
 * never on camera. This surface therefore shows the review being COMPUTED:
 * a pending panel (status chip "SCORING…", an em-dash where every number
 * will be) whose five rubric axes resolve one at a time, and only then an
 * overall score that counts up as their consequence. The chip's slot is
 * evidenced — a status chip beside a card header is the product's own
 * pattern ("● CRM not connected" §3.5, "Review before saving →" §3.6) —
 * and gerund-with-ellipsis is its own progress idiom ("Listening…" §5).
 * The WORD "Scoring" and the "—/10" placeholders are ours. Checkpoint item.
 * Nothing new is claimed: no confidence figure, no per-axis explanation,
 * no taxonomy — only the numbers `t-018` already shows, arriving in order.
 * ---------------------------------------------------------------------
 * COLOUR (all from our owned ramps — the real app's teal/red/amber are
 * mapped, never copied):
 *   · "You" bubble  → solid accent-600 fill, surface-100 text (the rep's own
 *     side reads as a sent message, iMessage-style — user, 2026-07-26);
 *     its avatar is an accent-600 mark at 24px. (App uses teal.)
 *   · "Agent" bubble → surface-300 + hairline-2, ink text.
 *   · rubric bars → gray-700 on a gray-300 track. Re-derived, not
 *     transposed, when the old telemetry ramp was retired (2026-07-27):
 *     this is a scored REVIEW of a finished call, not live telemetry, so it
 *     does not take the signal ramp — and a five-bar block is the largest
 *     coloured area on the surface, which would have made "average" the
 *     loudest thing on a screen whose subject is the conversation. Neutral
 *     bars measure and the numbers carry the band. Both steps are
 *     luminance matches for what they replace (fill ~0.165 vs ~0.178;
 *     track ~0.83 vs ~0.83), so the panel keeps its weight. The retired
 *     ramp's own note — that its 100 step was invisible on surface-200 —
 *     re-derives the same way: gray-200 IS surface-300, and on this
 *     surface-200 panel it is invisible too — so the track is gray-300.
 *   · PENDING vs RESOLVED is carried by the ink ramp, not by a new hue:
 *     gray-400 while a value is unknown, gray-700/-800/ink once it lands.
 *     That is the only thing the five-axis cascade needs to be legible,
 *     and it spends no colour to say it.
 *   · the outcome line is the pane's one tinted state row: won-100 tint,
 *     won-900 text. The risk ramp is now spent NOWHERE on this surface —
 *     a completed session is not an error. "Goal Achieved: Yes" stays
 *     gray-800 so the verdict does not shout twice.
 * No black, no shadows (the window carries the only one), depth is the
 * surface ladder + hairlines.
 * ---------------------------------------------------------------------
 * MOTION: zero React state, zero effects, zero refs. The markup below IS
 * the settled end frame — full transcript, review present, every number
 * resolved, bars at final width — so a reduced-motion or no-JS visitor
 * reads a finished screen. `rewind` makes the "before"; `beats` write
 * straight to the DOM. Nothing loops: after 8.6s the surface is still.
 *
 * TWO ACTS, and the second one is the subject. The call is deliberately
 * quick (five turns in 2.4s) so the machine grading it gets the bigger
 * half of the hold. While the call is running there is no review column
 * to look at, so the call column is CENTRED — the whole conversation
 * translates by half the review's width; when the session ends it steps
 * aside and the pending review takes the space it just left. That is a
 * transform on one node, so re-weighting the surface costs no layout.
 *
 * The surface is also DRIVEN, not merely animated: the frame's simulated
 * pointer (AppFrame.css `.af-cursor`, helpers in contract.ts) walks in,
 * reaches for the round call controls, and CLICKS "Stop Session" — the
 * session ends 200ms after that press because of it. The pointer then
 * settles on the panel that is now working, moves down as the score
 * resolves, and leaves. Every state it lights is `.af-hoverable`, i.e.
 * exactly the paint a visitor's own mouse gets; nothing is a parallel fake.
 *
 * GOTCHA for anyone adding hovers here: `.af-hoverable` declares a
 * `transition` shorthand and is defined AFTER `.af-in` / `.af-card` at the
 * same specificity, so putting both classes on ONE element silently kills
 * that element's opacity+filter arrival. Hover therefore always lives on a
 * child (the transcript row's inner box, the review card inside its
 * `af-card` shell), never on the animated node itself.
 * ===================================================================== */

/* ---------- content ------------------------------------------------- */

type Turn = { who: 'Agent' | 'You'; line: string; at?: 'lg' | 'xl' }

/** Turn 1 is verbatim (`t-017`); turns 2–5 are ours. They earn the ending:
 *  a relevant reason in one line, the right owner asked for exactly once.
 *  Narrow frames render fewer turns rather than squashing them — the
 *  outcome and the score still land. */
const TURNS: Turn[] = [
  { who: 'Agent', line: 'Office of the COO, Greg speaking. What is this regarding?' },
  { who: 'You', line: 'Your CRM rollout — we cut handoff time for ops teams.' },
  { who: 'Agent', line: 'Operations owns that. Why should I pass this along?', at: 'lg' },
  { who: 'You', line: 'Fifteen minutes with whoever runs the handoff today.', at: 'lg' },
  { who: 'Agent', line: 'Fair enough. Putting you through to Operations now.', at: 'xl' },
]

/** Our rubric, on the frame's five real axes. Engagement is deliberately
 *  the weak one — it is what "Areas for Improvement" then addresses, and a
 *  flat row of nines would read as a trophy, not as coaching.
 *  Score out of 10 → bar width in percent. */
const RUBRIC: [string, number][] = [
  ['Clarity', 8],
  ['Empathy', 7],
  ['Engagement', 6],
  ['Relevance', 9],
  ['Professionalism', 8],
]

/** The count-up ladder for OVERALL SCORE — three text writes, no easing
 *  engine. It runs LAST, after all five axes are in, because the overall
 *  is their consequence: 8+7+6+9+8 = 38/5 = 7.6, which rounds to the 8
 *  the settled markup ships. Steps sit at 200ms because the frame's clock
 *  ticks at 200ms; anything finer collapses into the same tick and
 *  silently drops a rung. */
const SCORE_LADDER = ['4', '6', '8']
const SCORE_FINAL = SCORE_LADDER[SCORE_LADDER.length - 1]
const SCORE_EMPTY = '—'
/** A rubric value the machine has not produced yet. Mono, so the em dash
 *  and a digit occupy the same cell and the resolve cannot jog the row. */
const VALUE_EMPTY = `${SCORE_EMPTY}/10`

/** Pending vs resolved, carried entirely on the ink ramp. */
const PENDING = 'text-gray-400'
const LABEL_ON = 'text-gray-700'
const VALUE_ON = 'text-gray-800'
const SCORE_ON = 'text-ink'

/* ---------- beat clock ----------------------------------------------
 * Front-loaded on purpose. The old script spent 3.8s letting five turns
 * arrive 800ms apart and then 3.2s on a review that mostly just appeared —
 * so the frame's right-hand third was blank white for two thirds of the
 * hold, and the tail (the written feedback) fell off the end of the 9s
 * entirely. Turns now land 600ms apart and the click comes at 3.8s, which
 * buys 4.2s for the thing worth watching. */
const T_CHROME = 200
const T_TURN_0 = 400
const TURN_GAP = 600
/** pointer walks on, reaching for the round call controls */
const T_REACH = 3000
/** …then over to the primary that actually ends the session */
const T_AIM = 3400
const T_PRESS = 3800
/** 400ms of press: the click ring is a 460ms one-shot, so releasing sooner
 *  snaps it out of existence mid-pulse instead of letting it fade. */
const T_RELEASE = 4200
/** the session ends BECAUSE of the click that just finished: the outcome
 *  lands, the controls go quiet, the call column steps aside and the
 *  review arrives in the space it left — one gesture, four consequences. */
const T_END = 4400
/** the persona's reason, a beat after its verdict — the left column's
 *  last word before it hands the surface over. */
const T_REASON = 4800
/** …and the pointer follows the work to the panel that is now doing it. */
const T_WATCH = 5000
/** the five axes resolve one at a time. 400ms = two clock ticks, which is
 *  slow enough to read as five separate events rather than a stagger. */
const T_AXIS_0 = 5400
const AXIS_STEP = 400
/** the pointer drops to the score box just before the number appears in it */
const T_LOOK = 7200
const T_SCORE = 7400
const SCORE_STEP = 200
const T_GOAL = 8000
const T_FEEDBACK = 8200
const T_LEAVE = 8600
const HOLD = 9000

/** The call column stepping aside. Transform-only, so re-weighting the
 *  surface mid-scene costs no layout and no reflow of the transcript. */
const SLIDE_MS = 520

/** classList without a null dance at every call site. */
const cls = (el: HTMLElement | null, name: string, on: boolean) => {
  el?.classList.toggle(name, on)
}

/** Exchange one utility for another. Only ever one of the pair is present,
 *  so this never depends on the order Tailwind emitted them in. */
const swap = (el: HTMLElement | null, off: string, on: string) => {
  el?.classList.remove(off)
  el?.classList.add(on)
}

/** How far the call column must travel to sit centred in the whole content
 *  row while the review column is still empty: half of (gap + review).
 *  Measured rather than hardcoded, because the review is 300px at `lg` and
 *  330px at `xl`. Returns 0 when the two are STACKED (below `lg`), where
 *  the review is under the call and there is no space to borrow. */
const slideOffset = (root: HTMLElement) => {
  const call = q(root, 'call')
  const review = q(root, 'review')
  if (!call || !review) return 0
  const c = call.getBoundingClientRect()
  const r = review.getBoundingClientRect()
  if (!r.width || r.left < c.right - 1) return 0
  return Math.round((r.right - c.right) / 2)
}

/** The circular controls dim when the session stops — one class, one
 *  transition, no layout. */
const OFF = 'opacity-40'

/** A turn's own breakpoint gate. Block, not flex: the flex row is the
 *  hoverable child inside, because `.af-hoverable` on the `af-in` node
 *  would eat its arrival transition (see the header note). */
const turnVis = (at?: 'lg' | 'xl') =>
  at === 'xl' ? 'hidden xl:block' : at === 'lg' ? 'hidden lg:block' : 'block'

/** The two circular call controls (`t-017`). Both are hoverable and both
 *  lift — they are buttons, not rows. */
const CONTROLS: { Icon: typeof Mic; label: string; key: string }[] = [
  { Icon: Mic, label: 'Mute', key: 'ctl-mic' },
  { Icon: CircleDot, label: 'Stop', key: 'ctl-rec' },
]

/* ---------- the surface --------------------------------------------- */

function ColdCallsPane() {
  return (
    <>
      {/* Beat 1 — the practice chrome. Header + persona strip arrive
          together; the strip is config metadata, so it is the first thing
          a 390px frame drops. */}
      <div data-b="chrome" className="af-in is-shown shrink-0">
        <PaneHead title="Cold Call Practice" note="Customer Call Practice" />
        <div className="hidden shrink-0 items-center gap-3 border-b border-hairline-2 bg-surface-200 px-6 py-2.5 sm:flex lg:px-8">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-hairline-2 bg-surface-100 text-[10px] font-[600] text-gray-700">
            G
          </span>
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-[12.5px] font-[550] text-ink">Gatekeeper Greg</span>
            <span className="hidden truncate text-[11.5px] text-gray-600 lg:inline">
              Office of the COO
            </span>
          </span>
          <span className="ml-auto hidden shrink-0 items-center gap-1.5 lg:flex">
            {['Startup', 'English', 'Medium'].map((chip) => (
              <span
                key={chip}
                className="rounded-micro border border-hairline-2 bg-surface-100 px-1.5 py-0.5 font-mono font-[550] text-[9px] tracking-[0.1em] text-gray-600 uppercase"
              >
                {chip}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 lg:flex-row lg:gap-5">
        {/* ---- the call itself ----
            `data-b="call"` because this column MOVES: while the review
            column is empty it is translated to the centre of the row, and
            it slides back when the review takes that space. The transform
            and its transition are written by `rewind`/`beats`, never by a
            class here — the settled frame (and therefore the reduced-motion
            frame) is the un-translated one. */}
        <div data-b="call" className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Beat 2 — turns arrive one at a time, 600ms apart, alternating
              sides. Brisk on purpose: the call is the setup, not the point,
              and every 200ms spent here is 200ms the review does not get.

              Each turn is TWO nodes: the `af-in` gate that arrives, and the
              hoverable row inside it — a real product highlights the turn
              you point at. The row's 6px padding is paid for by matching
              negative margins on the gate and a 2px container gap (10px
              gap − 4px of padding either side), so switching a dense list
              to hoverable rows moved the layout by exactly zero pixels. */}
          <div className="flex min-h-0 flex-1 flex-col gap-0.5">
            {TURNS.map(({ who, line, at }) => {
              const you = who === 'You'
              return (
                <div
                  key={line}
                  data-b="turn"
                  className={`af-in is-shown -mx-1.5 min-w-0 ${turnVis(at)}`}
                >
                  <div
                    className={`af-hoverable flex min-w-0 items-start gap-2 rounded-[10px] px-1.5 py-1 ${
                      you ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                        you
                          ? 'bg-accent-600 text-surface-100'
                          : 'border border-hairline-2 bg-surface-200 text-gray-700'
                      }`}
                    >
                      {you ? (
                        <User size={13} strokeWidth={1.5} />
                      ) : (
                        <Headphones size={13} strokeWidth={1.5} />
                      )}
                    </span>
                    <span
                      className={`flex min-w-0 max-w-[88%] flex-col ${
                        you ? 'items-end' : 'items-start'
                      }`}
                    >
                      <span className="text-[11px] text-gray-600">{who}</span>
                      <span
                        className={`mt-1 rounded-[12px] border px-3 py-2 text-[12.5px] leading-snug ${
                          you
                            ? 'border-accent-600 bg-accent-600 text-surface-100'
                            : 'border-hairline-2 bg-surface-300 text-ink'
                        }`}
                      >
                        {line}
                      </span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Beat 3a — the call ENDS, and it ends WELL: the gatekeeper does
              the one thing a gatekeeper can do for you. Our copy, in the
              frame's outcome slot (see the header note).

              Verdict and reason are two beats, not one: `t-018` shows the
              persona giving a reason for how the call went, and splitting
              them gives the left column a second event to spend while the
              review starts computing on the right. */}
          <div
            data-b="outcome"
            className="af-in is-shown mt-3 flex shrink-0 items-start gap-2 rounded-[10px] bg-won-100 px-3 py-2"
          >
            <PhoneForwarded size={13} strokeWidth={1.5} className="mt-px shrink-0 text-won-900" />
            <span className="min-w-0">
              <span className="block text-[12px] font-[550] text-won-900">
                Gatekeeper agreed to route the call
              </span>
              <span
                data-b="reason"
                className="af-in is-shown mt-0.5 hidden text-[11.5px] leading-snug text-gray-700 xl:block"
              >
                Caller gave a relevant reason and asked for the right owner once, so I passed them
                to Operations
              </span>
            </span>
          </div>

          {/* Beat 3b — the control bar goes to its stopped state: the two
              circular controls dim and the primary button is replaced by a
              quiet "Session ended" chip. The two chips are stacked in ONE
              grid cell so the swap can never reflow the bar.

              "Stop Session" is what the pointer clicks, and it is the one
              control here that does NOT carry `af-hoverable`: the shared
              hover paint is a surface-200 wash, which would bleach an ink
              pill. Its feedback is the cursor's own dip + click ring. */}
          <div
            data-b="ctlbar"
            className="af-in is-shown mt-3 flex shrink-0 flex-col items-center gap-2 border-t border-hairline-2 pt-3"
          >
            <span
              data-b="ctl-live"
              className={`flex items-center gap-6 transition-opacity duration-300 motion-reduce:transition-none ${OFF}`}
            >
              {CONTROLS.map(({ Icon, label, key }) => (
                <span key={label} className="flex flex-col items-center gap-0.5">
                  <span
                    data-b={key}
                    className="af-hoverable af-lift flex size-7 items-center justify-center rounded-full border border-hairline-2 bg-surface-200 text-gray-700"
                  >
                    <Icon size={13} strokeWidth={1.5} />
                  </span>
                  <span className="hidden text-[10px] text-gray-600 lg:block">{label}</span>
                </span>
              ))}
            </span>
            <span className="grid grid-cols-1 justify-items-center">
              <span
                data-b="ctl-stop"
                className="af-in col-start-1 row-start-1 flex h-8 items-center rounded-button bg-ink px-4 text-[12px] font-medium text-surface-100"
              >
                Stop Session
              </span>
              <span
                data-b="ctl-ended"
                className="af-in is-shown col-start-1 row-start-1 flex h-8 items-center rounded-button border border-hairline-2 bg-surface-200 px-4 text-[12px] font-medium text-gray-700"
              >
                Session ended
              </span>
            </span>
          </div>
        </div>

        {/* ---- Beat 4 — SESSION REVIEW. The heavier arrival (`af-card`:
            10px travel, 3px blur, 420ms), because it supersedes the call
            rather than adding to it — and it arrives EMPTY, into the space
            the call column gives back on the same beat. What follows is the
            machine filling it in, which is the point of the surface.
            Narrow frames keep the verdict and drop the rubric + feedback
            tail; there the review is stacked under the call, so there is no
            space to borrow and no slide.

            The `af-card` shell and the hoverable card are two nodes on
            purpose — see the header gotcha. ---- */}
        <aside
          data-b="review"
          className="af-card is-shown flex shrink-0 flex-col lg:w-[300px] xl:w-[330px]"
        >
          <div
            data-b="review-card"
            className="af-hoverable af-lift flex min-w-0 flex-1 flex-col gap-2.5 rounded-[10px] border border-hairline-2 bg-surface-200 p-2.5 lg:gap-3 lg:p-4"
          >
            {/* The card header carries a STATUS CHIP — the product's own
                pattern for "this card is in a state" (§3.5 "CRM not
                connected", §3.6 "Review before saving →"). Here it says the
                review is still being produced, and its disappearance is
                what says the machine has finished. Hidden in the settled
                markup, turned ON by `rewind`, off again by the goal beat. */}
            <span className="flex items-center justify-between gap-2">
              <PanelLabel accent>Session review</PanelLabel>
              <span
                data-b="chip"
                className="af-in shrink-0 rounded-micro border border-hairline-2 bg-surface-300 px-1.5 py-0.5 font-mono font-[550] text-[9px] tracking-[0.1em] text-gray-600 uppercase"
              >
                Scoring…
              </span>
            </span>

            <div className="flex flex-col">
              <span className="hidden lg:block">
                <PanelLabel>Overall score</PanelLabel>
              </span>
              {/* Beat 6 — the count-up, then the verdict. It runs AFTER the
                  rubric, because the overall score is what the five axes
                  add up to; the old order showed the answer first. */}
              <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:mt-2">
                <span className="flex items-baseline gap-1">
                  <span
                    data-b="score"
                    /* Fixed box, not min-width: the rewind placeholder is an
                       em dash (1em wide) and the ladder writes single digits,
                       so a fluid box would tug "/10" left mid count-up. */
                    className="inline-block w-[26px] text-[24px] leading-none font-[600] tracking-[-0.02em] text-ink tabular-nums lg:w-[36px] lg:text-[34px]"
                  >
                    {SCORE_FINAL}
                  </span>
                  <span className="text-[12px] text-gray-600">/10</span>
                </span>
                <span data-b="goal" className="af-in is-shown text-[12px] font-[550] text-gray-800">
                  Goal Achieved: Yes
                </span>
              </span>
            </div>

            {/* Beat 5 — the five axes RESOLVE, one at a time, 400ms apart.
                Each is three writes on one row: the axis name and its value
                come up out of gray-400, the value swaps its em dash for a
                number, and the bar grows. Nothing here fades in — the rows
                are present and empty from the moment the panel arrives, so
                what you watch is a machine filling them, not a list
                assembling itself.

                The bar is 6px, not 4: at the frame's real size on the page a
                4px line under a 300px card was not visible motion. */}
            <div className="hidden flex-col border-t border-hairline-2 pt-3 lg:flex">
              <PanelLabel>Rubric</PanelLabel>
              <div className="mt-2 flex flex-col gap-2">
                {RUBRIC.map(([axis, score]) => (
                  <span key={axis} className="grid grid-cols-[88px_1fr_38px] items-center gap-2.5">
                    <span data-b="rlabel" className="truncate text-[11px] text-gray-700">
                      {axis}
                    </span>
                    <span className="h-1.5 w-full overflow-hidden rounded-full bg-gray-300">
                      <span
                        data-b="bar"
                        className="af-bar block h-full w-full rounded-full bg-gray-700"
                        style={{ transform: `scaleX(${score / 10})` }}
                      />
                    </span>
                    <span
                      data-b="rvalue"
                      className="text-right font-mono text-[10.5px] text-gray-800 tabular-nums"
                    >
                      {score}/10
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Beat 7 — the written coaching, last and quietest. */}
            <div
              data-b="feedback"
              className="af-in is-shown hidden flex-col border-t border-hairline-2 pt-3 lg:flex"
            >
              <PanelLabel>Performance feedback</PanelLabel>
              <span className="mt-2 block text-[11.5px] font-[550] text-ink">Strengths</span>
              <span className="mt-0.5 block text-[11.5px] leading-snug text-gray-700">
                Stated a relevant reason in one line and asked for the right owner once.
              </span>
              <span className="mt-2 block text-[11.5px] font-[550] text-ink">
                Areas for Improvement
              </span>
              <span className="mt-0.5 block text-[11.5px] leading-snug text-gray-700">
                Get the owner's name and a time before accepting the transfer.
              </span>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

/* ---------- the module ---------------------------------------------- */

/** The opening frame: chrome and controls waiting, nothing said yet, no
 *  verdict, no pointer, and the review panel not merely hidden but UNFILLED
 *  — every number an em dash, every bar at zero, every label out of ink.
 *  Everything the beats below turn on, this turns off.
 *
 *  The pane is rewound at the moment it becomes active, i.e. behind the
 *  frame's 340ms crossfade. Everything reset here is therefore either
 *  inside the still-hidden review card or transition-free — except the call
 *  column's transform, which would otherwise animate its 177px into place
 *  in full view. Its transition is suppressed here and armed by the first
 *  beat instead. */
const rewind = (root: HTMLElement) => {
  hide(q(root, 'chrome'))
  hide(q(root, 'ctlbar'))
  hideAll(root, 'turn')
  hide(q(root, 'outcome'))
  hide(q(root, 'reason'))
  hide(q(root, 'review'))
  hide(q(root, 'goal'))
  hide(q(root, 'feedback'))
  show(q(root, 'chip'))
  cls(q(root, 'ctl-live'), OFF, false)
  show(q(root, 'ctl-stop'))
  hide(q(root, 'ctl-ended'))
  swap(q(root, 'score'), SCORE_ON, PENDING)
  text(q(root, 'score'), SCORE_EMPTY)
  qa(root, 'rlabel').forEach((el) => swap(el, LABEL_ON, PENDING))
  qa(root, 'rvalue').forEach((el) => {
    swap(el, VALUE_ON, PENDING)
    text(el, VALUE_EMPTY)
  })
  qa(root, 'bar').forEach((el) => bar(el, 0))
  const call = q(root, 'call')
  if (call) {
    call.style.transition = 'none'
    call.style.transform = ''
    // read AFTER clearing, so a stale offset can never compound
    call.style.transform = `translate3d(${slideOffset(root)}px, 0, 0)`
  }
  hidePointer(root)
}

/** The finished frame — identical to the markup above, so this is also
 *  what a reduced-motion visitor sees, and what a visitor who clicks into
 *  the frame mid-scene is resolved to. */
const settle = (root: HTMLElement) => {
  show(q(root, 'chrome'))
  show(q(root, 'ctlbar'))
  showAll(root, 'turn')
  show(q(root, 'outcome'))
  show(q(root, 'reason'))
  show(q(root, 'review'))
  show(q(root, 'goal'))
  show(q(root, 'feedback'))
  hide(q(root, 'chip'))
  cls(q(root, 'ctl-live'), OFF, true)
  hide(q(root, 'ctl-stop'))
  show(q(root, 'ctl-ended'))
  swap(q(root, 'score'), PENDING, SCORE_ON)
  text(q(root, 'score'), SCORE_FINAL)
  qa(root, 'rlabel').forEach((el) => swap(el, PENDING, LABEL_ON))
  qa(root, 'rvalue').forEach((el, i) => {
    swap(el, PENDING, VALUE_ON)
    text(el, `${RUBRIC[i][1]}/10`)
  })
  qa(root, 'bar').forEach((el, i) => bar(el, RUBRIC[i][1] * 10))
  const call = q(root, 'call')
  if (call) {
    /* Cleared, not set to `none`: the settled surface is one a visitor can
       poke at, and it should carry no inline residue. Clearing both in the
       same frame cannot tween — the after-change style's transition is the
       initial `all 0s`, so a take-over lands on the finished frame at once
       even if it interrupts the slide. */
    call.style.transition = ''
    call.style.transform = ''
  }
  hidePointer(root)
}

/** One call playing out, being ENDED BY HAND, and then GRADED IN FRONT OF
 *  YOU. Strictly ascending — the frame walks this list in order without
 *  sorting it, and stops at the first beat that is out of order. */
const beats: Beat[] = [
  {
    at: T_CHROME,
    run: (root) => {
      show(q(root, 'chrome'))
      show(q(root, 'ctlbar'))
      // Arm the slide now that the crossfade has landed. Nothing moves:
      // this only makes the transform animatable for the beat at T_END.
      const call = q(root, 'call')
      if (call) call.style.transition = `transform ${SLIDE_MS}ms var(--ease-entrance)`
    },
  },
  ...TURNS.map((_, i) => ({
    at: T_TURN_0 + i * TURN_GAP,
    run: (root: HTMLElement) => show(qa(root, 'turn')[i] ?? null),
  })),
  // The rep decides the call is done: hand reaches the round controls first,
  // then finds the primary. Two stops, so the travel reads as a decision.
  { at: T_REACH, run: (root) => pointTo(root, 'ctl-rec') },
  { at: T_AIM, run: (root) => pointTo(root, 'ctl-stop', 0.72, 0.55) },
  { at: T_PRESS, run: (root) => pressOn(root, 'ctl-stop') },
  { at: T_RELEASE, run: (root) => releaseOn(root, 'ctl-stop') },
  {
    at: T_END,
    run: (root) => {
      show(q(root, 'outcome'))
      cls(q(root, 'ctl-live'), OFF, true)
      hide(q(root, 'ctl-stop'))
      show(q(root, 'ctl-ended'))
      // …and the surface re-weights itself: the call gives back the space
      // it borrowed, and the review — pending, empty, already working —
      // takes it.
      const call = q(root, 'call')
      if (call) call.style.transform = 'translate3d(0px, 0, 0)'
      show(q(root, 'review'))
    },
  },
  { at: T_REASON, run: (root) => show(q(root, 'reason')) },
  // The pointer follows the work, and stays with the panel while it runs.
  { at: T_WATCH, run: (root) => pointTo(root, 'review-card', 0.5, 0.1) },
  /* The compute. One axis per beat: name and value come up out of gray-400,
     the em dash becomes a number, the bar grows. Five separate events. */
  ...RUBRIC.map(([, score], i) => ({
    at: T_AXIS_0 + i * AXIS_STEP,
    run: (root: HTMLElement) => {
      swap(qa(root, 'rlabel')[i] ?? null, PENDING, LABEL_ON)
      const value = qa(root, 'rvalue')[i] ?? null
      swap(value, PENDING, VALUE_ON)
      text(value, `${score}/10`)
      bar(qa(root, 'bar')[i] ?? null, score * 10)
    },
  })),
  // Every axis is in, so the pointer drops to the box the total lands in.
  { at: T_LOOK, run: (root) => pointTo(root, 'review-card', 0.3, 0.26) },
  ...SCORE_LADDER.map((v, i) => ({
    at: T_SCORE + i * SCORE_STEP,
    run: (root: HTMLElement) => {
      const el = q(root, 'score')
      if (i === 0) swap(el, PENDING, SCORE_ON)
      text(el, v)
    },
  })),
  // The number is final: the verdict lands and the "scoring" chip retires.
  {
    at: T_GOAL,
    run: (root) => {
      show(q(root, 'goal'))
      hide(q(root, 'chip'))
    },
  },
  { at: T_FEEDBACK, run: (root) => show(q(root, 'feedback')) },
  // …and the pointer leaves, so no frozen cursor is handed to the next
  // surface. 400ms of clear air before the tour moves on at HOLD.
  { at: T_LEAVE, run: (root) => hidePointer(root) },
]

const ColdCalls: PaneModule = {
  name: 'Cold Calls',
  breadcrumb: 'Cold Calls / Customer Call Practice',
  actions: [{ label: 'Stop Session', primary: true }],
  hold: HOLD,
  Pane: ColdCallsPane,
  beats,
  rewind,
  settle,
}

export default ColdCalls
