import { useId } from 'react'
import Window from '../mock/Window'

/* ---------------------------------------------------------------------
 * Dashboard & Insights — the trend that moves the number. Stat rows plus a
 * win-rate area chart, rendered fully drawn. Session 5 motion ration
 * (Tour = QUIET) removed the left-to-right clip-path wipe; the module
 * enters once with its article via kz-enter and then holds still.
 * ------------------------------------------------------------------- */

const STATS: [string, string, string][] = [
  ['Win rate', '41%', '+6 pts'],
  ['Live sessions', '48', '+12%'],
  ['Avg score', '78%', '+6 pts'],
]

const SERIES = [30, 44, 38, 56, 50, 68, 62, 80]

export function Dashboard() {
  const gradId = useId()
  const points = SERIES.map((v, i) => `${(i / (SERIES.length - 1)) * 100},${100 - v}`).join(' ')

  return (
    <Window title="Dashboard & insights" meta={<span className="font-mono font-[550] text-[10px] tracking-[0.08em] text-won-900 uppercase">+18% QoQ</span>}>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4 border-b border-hairline-1 p-5 sm:border-r sm:border-b-0">
          {STATS.map(([label, value, delta]) => (
            <div key={label}>
              <div className="font-mono font-[550] text-[10px] tracking-[0.1em] text-gray-600 uppercase">{label}</div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-2xl font-[650] tracking-[-0.02em] text-ink tabular-nums">{value}</span>
                <span className="font-mono text-[10px] text-won-900">{delta}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="relative p-5">
          <div aria-hidden className="tour-grid pointer-events-none absolute inset-0" />
          <div className="relative flex items-center justify-between">
            <span className="text-[11px] font-[600] text-gray-800">Win rate over time</span>
            <span className="font-mono font-[550] text-[10px] tracking-[0.06em] text-won-900 uppercase">Q1 → Q4</span>
          </div>
          <div className="relative mt-4 h-24 w-full">
            <div className="h-full w-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent-600)" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="var(--color-accent-600)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <polygon points={`${points} 100,100 0,100`} fill={`url(#${gradId})`} />
                <polyline
                  points={points}
                  fill="none"
                  stroke="var(--color-accent-600)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Window>
  )
}
