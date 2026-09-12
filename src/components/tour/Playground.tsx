import { Target, TrendingUp } from 'lucide-react'
import Window from '../mock/Window'

/* ---------------------------------------------------------------------
 * Playground — the five-dimension practice score, rendered settled: the
 * bars sit at their scored width, tinted by band on the number. Session 5
 * motion ration (Tour = QUIET) removed the staggered width growth; the
 * module enters once with its article via kz-enter and then holds still.
 * ------------------------------------------------------------------- */

const DIMENSIONS: [string, number][] = [
  ['Opening & hook', 82],
  ['Value proposition', 74],
  ['Objection handling', 68],
  ['Qualifying questions', 79],
  ['Closing technique', 71],
]

/**
 * Score band → the *number's* colour: strong (won) / on-track (accent) /
 * needs work (gray). The bars themselves stay one neutral ink value —
 * accent is a mark on small type, never a wide area fill.
 * The weak band carried the retired telemetry ink until 2026-07-27, and it did
 * NOT become signal-700:
 * signal sits 17° from accent-600 (tokens.css), so two of the three bands would
 * be near-identical blues at 13px. Gray reads as "unremarkable", which is the
 * band's actual meaning, and keeps the three inks distinguishable.
 */
function bandText(score: number) {
  if (score >= 80) return 'text-won-900'
  if (score >= 72) return 'text-accent-600'
  return 'text-gray-700'
}

export function Playground() {
  return (
    <Window title="Playground — cold-call sim" meta={<span className="font-mono font-[550] text-[10px] tracking-[0.08em] text-gray-600 uppercase">Scored</span>}>
      <div className="p-5">
        {/* headline score */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-mono font-[550] text-[10px] tracking-[0.12em] text-gray-600 uppercase">
              Practice score
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[28px] font-[650] leading-none tracking-[-0.02em] text-ink tabular-nums">
                75<span className="text-lg text-gray-500">%</span>
              </span>
              <span className="flex items-center gap-0.5 font-mono text-[10px] text-won-900">
                <TrendingUp size={12} strokeWidth={2} />
                +8 pts
              </span>
            </div>
          </div>
          <span className="rounded-micro border border-hairline-2 bg-surface-200 px-2 py-0.5 font-mono font-[550] text-[10px] tracking-[0.06em] text-gray-600 uppercase">
            12 attempts
          </span>
        </div>

        {/* per-dimension bars */}
        <div className="mt-4 flex flex-col gap-3 rounded-tile border border-hairline-2 bg-surface-200 p-4">
          {DIMENSIONS.map(([label, score]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-[132px] shrink-0 truncate text-[12px] font-[500] text-gray-800">{label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-300">
                <span className="block h-full rounded-full bg-gray-800" style={{ width: `${score}%` }} />
              </span>
              <span className={`w-7 shrink-0 text-right font-mono text-[11px] font-[600] tabular-nums ${bandText(score)}`}>
                {score}
              </span>
            </div>
          ))}
        </div>

        {/* coaching takeaway */}
        <div className="mt-4 flex items-center gap-2 border-t border-hairline-1 pt-3 text-[11px] text-gray-600">
          <Target size={13} strokeWidth={1.75} className="shrink-0 text-gray-500" />
          Strongest <span className="font-[550] text-gray-800">Opening &amp; hook</span> · focus{' '}
          <span className="font-[550] text-gray-800">Objection handling</span>
        </div>
      </div>
    </Window>
  )
}
