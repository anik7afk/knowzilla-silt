import type { ReactNode } from 'react'
import { Search, ShieldCheck } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import { INTEGRATION_MARKS } from './logos'
import './Bento.css'

/*
 * Platform surface grid — ported from v2 PlatformBento. Same idiom as the
 * donor (a full-width ruled grid, each cell a cropped, realistic product
 * vignette) rebuilt on v5 tokens: zero shadows, hairline-2 cell dividers,
 * hairline-1 for the lighter borders nested inside a vignette, tonal
 * surface steps instead of drop shadow. No routing exists in v5 (no
 * react-router, no /product/* pages) so cells carry a caption + blurb
 * (FeatureTrio's h3/p idiom) instead of the donor's CTA link.
 */

function Cell({
  index,
  title,
  blurb,
  vignette,
  className = '',
  vignetteClass = 'min-h-[220px]',
}: {
  index: number
  title: string
  blurb: string
  vignette: ReactNode
  className?: string
  vignetteClass?: string
}) {
  return (
    <div
      className={`kz-graphic kz-hover group relative flex flex-col overflow-hidden bg-surface-100 hover:bg-surface-200/60 ${className}`}
      style={{ '--enter-delay': `${index * 90}ms` } as React.CSSProperties}
    >
      <div className={`relative flex-1 ${vignetteClass}`}>{vignette}</div>
      <div className="relative z-10 px-6 pt-5 pb-7 sm:px-8">
        <h3 className="font-display text-[17px] font-medium leading-6 tracking-[-0.17px] text-ink">
          {title}
        </h3>
        <p className="mt-1.5 max-w-sm text-[14px] leading-5 font-[450] tracking-[-0.1px] text-ink-secondary">
          {blurb}
        </p>
      </div>
    </div>
  )
}

/* ── Vignettes — small, cropped restatements of the product's UI idioms ── */

const SEARCH_HITS = [
  { call: 'Acme GmbH — demo call', when: 'Tue 14:27', snippet: '"…pricing feels steep next to what HubSpot bundles…"' },
  { call: 'Fairwater — renewal', when: 'Mon 09:10', snippet: '"…budget pushback until the Q3 review lands…"' },
  { call: 'Vektra — discovery', when: 'Fri 16:02', snippet: '"…who signs off on spend at your end?…"' },
]

function SearchVignette() {
  return (
    <div className="absolute inset-x-6 top-8 sm:left-8 sm:right-[-32px]">
      <div className="overflow-hidden rounded-tile border border-hairline-1 bg-surface-100">
        <div className="flex items-center gap-2 border-b border-hairline-1 bg-surface-200 px-3.5 py-2.5 text-ink-secondary">
          <Search size={13} strokeWidth={1.75} />
          <span className="truncate text-xs">pricing pushback, last 90 days</span>
          <span className="ml-auto shrink-0 rounded-tag bg-surface-300 px-1.5 py-0.5 font-mono font-[550] text-[9px] tracking-[0.08em] text-ink-secondary uppercase">
            31 calls
          </span>
        </div>
        <div className="flex flex-col divide-y divide-hairline-1">
          {SEARCH_HITS.map((hit) => (
            <div key={hit.call} className="px-3.5 py-2.5">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-[12px] font-[600] text-ink">{hit.call}</span>
                <span className="shrink-0 font-mono text-[9px] tabular-nums text-gray-500">{hit.when}</span>
              </div>
              <p className="mt-0.5 truncate text-[11px] leading-relaxed text-ink-secondary">{hit.snippet}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const WEEKS = [34, 42, 38, 52, 47, 61, 58, 72, 66, 79, 84, 91]

function AnalyticsVignette() {
  return (
    <div className="absolute inset-x-6 top-8 bottom-0 sm:left-8 sm:right-[-40px]">
      <div className="flex h-full flex-col overflow-hidden rounded-tile border border-hairline-1 bg-surface-100">
        <div className="flex items-center justify-between border-b border-hairline-1 bg-surface-200 px-3.5 py-2.5">
          <span className="font-mono font-[550] text-[10px] tracking-[0.12em] text-ink-secondary uppercase">
            Win rate after objection · weekly
          </span>
          <span className="font-mono text-[10px] text-won-700">▲ 12.4%</span>
        </div>
        <div className="relative flex-1 px-3.5 pt-4">
          <div className="flex h-full items-end gap-[6px] pb-4">
            {WEEKS.map((v, i) => (
              <div
                key={i}
                className={`kz-bar min-w-0 flex-1 rounded-t-[3px] ${
                  i >= WEEKS.length - 3 ? 'bg-accent-500' : 'bg-gray-400/50'
                }`}
                style={{ height: `${v}%`, '--bar-delay': `${i * 24}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const WRITEBACKS = [
  { mark: 0, field: 'next_step', value: 'Pilot — 2 reps' },
  { mark: 1, field: 'deal_stage', value: 'Evaluation' },
  { mark: 4, field: 'next_meeting', value: 'Thu 10:00 AM' },
]

function IntegrationsVignette() {
  return (
    <div className="absolute inset-x-6 top-9 flex flex-col gap-4 sm:inset-x-8">
      {WRITEBACKS.map(({ mark, field, value }, i) => {
        const m = INTEGRATION_MARKS[mark]
        return (
          <div key={field} className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-tile border border-hairline-1 bg-surface-100">
              {m.mark}
            </span>
            <span
              className={`kz-sync min-w-4 flex-1 ${i % 2 ? 'kz-sync--rev' : ''}`}
              style={{ '--sync-delay': `${i * 300}ms` } as React.CSSProperties}
            />
            <span className="flex min-w-0 items-center gap-1.5 rounded-tag border border-hairline-1 bg-surface-200 px-2 py-1 font-mono text-[10px] text-ink-secondary">
              <span className="text-gray-500">{field}:</span>
              <span className="truncate text-ink">{value}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

const SCORES: [string, number][] = [
  ['Discovery depth', 86],
  ['Objection handling', 74],
  ['Talk / listen ratio', 62],
  ['Next-step clarity', 91],
]

function CoachingVignette() {
  return (
    <div className="absolute inset-x-6 top-9 flex flex-col gap-3.5 sm:inset-x-8">
      {SCORES.map(([label, score], i) => (
        <div key={label}>
          <div className="flex items-baseline justify-between">
            <span className="font-mono font-[550] text-[10px] tracking-[0.1em] text-ink-secondary uppercase">{label}</span>
            <span className="font-mono text-[10px] tabular-nums text-ink">{score}</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-300">
            <div
              className={`kz-fill h-full rounded-full ${
                score >= 85 ? 'bg-won-700' : score >= 70 ? 'bg-accent-500' : 'bg-olive-600'
              }`}
              style={{ width: `${score}%`, '--fill-delay': `${i * 90}ms` } as React.CSSProperties}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function ScaleVignette() {
  return (
    <div className="absolute inset-x-6 top-8 sm:inset-x-8">
      <div className="text-[56px] leading-none font-[650] tracking-[-0.04em] text-ink sm:text-[64px]">
        99.98<span className="text-gray-400">%</span>
      </div>
      <p className="mt-2 font-mono font-[550] text-[10px] tracking-[0.12em] text-ink-secondary uppercase">
        Uptime · trailing 12 months
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {['SOC 2', 'GDPR', 'EU data residency'].map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1.5 rounded-tag border border-hairline-1 bg-surface-200 px-2 py-1 font-mono font-[550] text-[10px] tracking-[0.06em] text-ink-secondary uppercase"
          >
            <ShieldCheck size={12} strokeWidth={1.75} className="text-gray-500" />
            {badge}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Section ─────────────────────────────────────────────────────────── */

export default function Bento() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section ref={ref} className={`${inView ? 'is-inview' : ''} bg-surface-100`}>
      <div className="mx-auto max-w-[1200px] px-6 pt-24 md:px-10 md:pt-[152px]">
        <div className="max-w-[680px]">
          <span className="inline-flex h-6 items-center rounded-tag bg-surface-300 px-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.4px] text-ink-secondary">
            Surface
          </span>
          <h2 className="mt-5 [text-wrap:balance] font-display text-[40px] font-medium leading-[44px] tracking-[-0.4px]">
            <span className="text-ink">One call, every surface. </span>
            <span className="text-ink-secondary">Search, sync, coaching — all live.</span>
          </h2>
        </div>
      </div>

      {/* full-width ruled grid — hairlines run edge to edge, cells share borders */}
      <div className="mt-12 border-y border-hairline-2 md:mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
          <Cell
            index={0}
            className="border-b border-hairline-2 lg:border-b-0"
            title="Call search"
            blurb="Ask across every call your team has taken. Answers cite the exact moment."
            vignette={<SearchVignette />}
            vignetteClass="min-h-[300px]"
          />
          <Cell
            index={1}
            className="border-b border-hairline-2 lg:border-b-0 lg:border-l"
            title="Analytics"
            blurb="Talk ratios and objection trends, measured from the call — not typed in."
            vignette={<AnalyticsVignette />}
            vignetteClass="min-h-[240px]"
          />
        </div>
        <div className="grid grid-cols-1 border-t border-hairline-2 lg:grid-cols-3">
          <Cell
            index={2}
            className="border-b border-hairline-2 lg:border-b-0"
            title="CRM sync"
            blurb="Fields, stage and next step land in your CRM the moment the call ends."
            vignette={<IntegrationsVignette />}
            vignetteClass="min-h-[200px]"
          />
          <Cell
            index={3}
            className="border-b border-hairline-2 lg:border-b-0 lg:border-l"
            title="Coaching"
            blurb="Every rep scored on the moments that decide deals, not gut feel."
            vignette={<CoachingVignette />}
            vignetteClass="min-h-[200px]"
          />
          <Cell
            index={4}
            className="lg:border-l"
            title="Security & scale"
            blurb="Call data stays encrypted, EU-resident, and available when it counts."
            vignette={<ScaleVignette />}
            vignetteClass="min-h-[200px]"
          />
        </div>
      </div>

      <div className="pb-24" />
    </section>
  )
}
