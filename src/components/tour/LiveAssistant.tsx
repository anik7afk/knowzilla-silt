import { ArrowRight, ChevronRight, FileText, Sparkles, Zap } from 'lucide-react'
import Window from '../mock/Window'

/* ---------------------------------------------------------------------
 * Live Assistant — the headline module, rendered as the SETTLED frame of
 * the recorded live call (Session 5 motion ration: Tour is QUIET, so the
 * scripted typewriter scene — typing, copilot wake, Insert self-press,
 * looping soft reset — is gone). What remains is exactly the frame that
 * scene ended on: both transcript turns delivered, the copilot's detected
 * question + answer + battlecard reference in place, the next-best-action
 * card resting with its Insert chip un-pressed.
 *
 * The module has no motion of its own. It enters once with its article via
 * the section's kz-enter (blur→0 + opacity, 420ms, ≤240ms sibling stagger)
 * and then holds still — no loops, no ambient ticking clock, no ping.
 * ------------------------------------------------------------------- */

const DANA_LINE = 'We already run HubSpot — how is this any different from what we have?'
const ANSWER_LINE =
  'Knowzilla isn’t a CRM. It’s the execution layer on top of HubSpot — guiding the call live and writing the outcome straight back.'
const YOU_LINE = 'Good question — we sit on top of HubSpot and guide the call live, we don’t replace it.'
const DANA_CLOSE = 'Okay. If it proves itself with two reps, that’s a different conversation.'

function Avatar({ initials, you = false }: { initials: string; you?: boolean }) {
  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-[650] ${
        you ? 'bg-accent-100 text-accent-700' : 'bg-surface-300 text-gray-700'
      }`}
    >
      {initials}
    </span>
  )
}

/** One delivered transcript line: avatar + speaker + timestamp + body. */
function Line({
  who,
  initials,
  time,
  you = false,
  text,
}: {
  who: string
  initials: string
  time: string
  you?: boolean
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Avatar initials={initials} you={you} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-baseline gap-2">
          <span className="text-[12px] font-[600] text-ink">{who}</span>
          <span className="font-mono text-[9px] text-gray-500">{time}</span>
        </span>
        <p className="text-[13px] leading-snug text-gray-700">{text}</p>
      </div>
    </div>
  )
}

export function LiveAssistant() {
  return (
    <div className="relative">
      <Window title="Live call — Northwind" meta={<RecMeta />}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          {/* transcript */}
          <div className="flex flex-col border-hairline-2 lg:border-r">
            <div className="flex items-center justify-between border-b border-hairline-1 px-5 py-3">
              <span className="font-mono font-[550] text-[10px] tracking-[0.12em] text-gray-600 uppercase">
                Live transcript
              </span>
              <span className="flex items-center gap-1.5 font-mono font-[550] text-[10px] tracking-[0.08em] text-gray-600 uppercase">
                <span className="size-1.5 rounded-full bg-won-700" />
                Transcribing
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-4 px-5 py-5">
              <Line who="Dana (Northwind)" initials="DA" time="14:26" text={DANA_LINE} />
              <Line who="You" initials="Y" time="14:27" you text={YOU_LINE} />
              <Line who="Dana (Northwind)" initials="DA" time="14:28" text={DANA_CLOSE} />
              {/* Reserved bottom band: the speaking indicator is off in the
                  settled frame, but it keeps the transcript column's
                  composition identical to the recorded moment. */}
              <div
                aria-hidden
                className="mt-auto flex items-center gap-3 pl-9 text-[11px] text-gray-500 opacity-0"
              >
                <span className="flex gap-1">
                  <span className="size-1.5 rounded-full bg-gray-500" />
                  <span className="size-1.5 rounded-full bg-gray-500" />
                  <span className="size-1.5 rounded-full bg-gray-500" />
                </span>
                Dana is speaking…
              </div>
            </div>
          </div>

          {/* copilot */}
          <div className="bg-surface-200">
            <div className="flex items-center gap-2 border-b border-hairline-1 px-5 py-3">
              <Sparkles size={13} strokeWidth={1.75} className="text-accent-600" />
              <span className="font-mono font-[550] text-[10px] tracking-[0.12em] text-gray-700 uppercase">
                Knowzilla copilot
              </span>
            </div>
            <div className="flex flex-col gap-3 px-5 py-5">
              {/* Live answer card */}
              <div className="relative overflow-hidden rounded-tag border border-hairline-2 bg-surface-100 p-4 shadow-float">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -top-10 h-20"
                  style={{
                    background:
                      'radial-gradient(ellipse at top, color-mix(in srgb, var(--color-accent-600) 13%, transparent), transparent 70%)',
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-mono font-[550] text-[10px] tracking-[0.12em] text-accent-600 uppercase">
                      <span className="flex size-4 items-center justify-center rounded-micro bg-accent-600 text-surface-100">
                        <Zap size={10} strokeWidth={2.25} />
                      </span>
                      Live
                    </span>
                    <span className="font-mono font-[550] text-[9px] tracking-[0.08em] text-gray-500 uppercase">0.4s</span>
                  </div>
                  <p className="mt-2.5 text-[11px] font-[550] text-gray-600">
                    Question detected — “How is this different from HubSpot?”
                  </p>
                  <p className="mt-1.5 text-[12px] leading-snug text-gray-800">{ANSWER_LINE}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-micro border border-hairline-2 bg-surface-200 px-2 py-0.5 font-mono font-[550] text-[9px] tracking-[0.06em] text-gray-700 uppercase">
                    <FileText size={11} strokeWidth={1.75} className="text-gray-500" />
                    Objection battlecards · p.4
                  </span>
                </div>
              </div>

              {/* Next best action card */}
              <div className="rounded-tag border border-hairline-2 bg-surface-100 p-4 shadow-float">
                <span className="font-mono font-[550] text-[10px] tracking-[0.12em] text-gray-600 uppercase">
                  Next best action
                </span>
                <div className="mt-2.5 flex items-start gap-2.5">
                  <ArrowRight size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent-600" />
                  <p className="text-[12px] leading-snug text-gray-800">
                    Reframe on ROI, not cost. Offer the free tier as a low-risk pilot for two reps this
                    quarter.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-hairline-1 pt-3">
                  <button
                    type="button"
                    className="kz-hover inline-flex items-center gap-1 rounded-tile bg-ink px-2.5 py-1 text-[11px] font-[550] text-surface-100 hover:bg-gray-800"
                    style={{ transitionProperty: 'background-color' }}
                  >
                    Insert
                    <ChevronRight size={13} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="kz-hover rounded-tile px-2.5 py-1 text-[11px] font-[550] text-gray-600 hover:bg-surface-300"
                    style={{ transitionProperty: 'background-color' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Window>
    </div>
  )
}

/** REC badge + the call clock, frozen at the moment the frame was taken. */
function RecMeta() {
  return (
    <span className="flex items-center gap-1.5 font-mono font-[550] text-[10px] tracking-[0.08em] text-gray-600 uppercase">
      <span className="size-1.5 rounded-full bg-risk-700" />
      Rec 14:28
    </span>
  )
}
