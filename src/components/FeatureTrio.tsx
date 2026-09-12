import { useInView } from '../hooks/useInView'

const MONO = "'Inter Variable',Inter,sans-serif" /* mono retired 2026-07-25 */

/* Small DealMap-idiom graphics: dot grid, lavender routes, olive ticks, mono labels. */

function RadarGraphic() {
  return (
    <svg viewBox="0 0 320 132" className="h-auto w-full" role="img" aria-label="Live deal radar">
      <defs>
        <pattern id="ft-dots-a" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#ECECEB" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="320" height="132" fill="url(#ft-dots-a)" />
      <g fill="none" stroke="#6A77E5" strokeWidth="1.5" strokeLinecap="round">
        <path d="M16,96 Q120,88 200,68 Q252,55 300,44" />
        <path d="M16,58 Q110,54 190,52 Q248,50 300,46" />
      </g>
      <path d="M200,68 Q248,50 300,34" fill="none" stroke="#9EA8F0" strokeWidth="1.5" strokeDasharray="2 7" />
      <circle cx="200" cy="68" r="4.5" fill="#6A77E5" />
      <circle cx="200" cy="68" r="10" fill="none" stroke="#BEC6F5" strokeWidth="1.5" />
      <circle cx="300" cy="34" r="4.5" fill="#ffffff" stroke="#6A77E5" strokeWidth="1.5" />
      <text x="14" y="122" fontFamily={MONO} fontSize="11" fill="#71706F">
        4 lanes live
      </text>
    </svg>
  )
}

function ActionGraphic() {
  return (
    <svg viewBox="0 0 320 132" className="h-auto w-full" role="img" aria-label="Next best action">
      <defs>
        <pattern id="ft-dots-b" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#ECECEB" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="320" height="132" fill="url(#ft-dots-b)" />
      <path d="M16,84 Q120,80 176,64" fill="none" stroke="#6A77E5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M176,64 Q240,50 300,40" fill="none" stroke="#9EA8F0" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 7" />
      <g stroke="#B3B980" strokeWidth="1.5" strokeLinecap="round">
        <line x1="72" y1="78" x2="72" y2="88" />
        <line x1="128" y1="72" x2="128" y2="82" />
      </g>
      <circle cx="176" cy="64" r="4.5" fill="#6A77E5" />
      <rect x="150" y="30" width="132" height="22" rx="8" fill="#ffffff" stroke="#ECECEB" />
      <text x="160" y="45" fontFamily={MONO} fontSize="11" fill="#161514">
        send follow-up · +12%
      </text>
    </svg>
  )
}

function SignalGraphic() {
  return (
    <svg viewBox="0 0 320 132" className="h-auto w-full" role="img" aria-label="Every signal, one map">
      <defs>
        <pattern id="ft-dots-c" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#ECECEB" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="320" height="132" fill="url(#ft-dots-c)" />
      <g fill="none" stroke="#6A77E5" strokeWidth="1.5" strokeLinecap="round">
        <path d="M16,32 Q110,50 180,66" />
        <path d="M16,66 Q100,66 180,66" />
        <path d="M16,104 Q110,86 180,66" />
      </g>
      <circle cx="16" cy="32" r="3" fill="#6A77E5" />
      <circle cx="16" cy="66" r="3" fill="#6A77E5" />
      <circle cx="16" cy="104" r="3" fill="#6A77E5" />
      <circle cx="180" cy="66" r="5" fill="#6A77E5" />
      <circle cx="180" cy="66" r="11" fill="none" stroke="#BEC6F5" strokeWidth="1.5" />
      <text x="200" y="70" fontFamily={MONO} fontSize="11" fill="#71706F">
        one map
      </text>
    </svg>
  )
}

const FEATURES = [
  {
    title: 'Live deal radar',
    body: 'Every open deal plotted as a lane, updating the moment a signal lands. No refresh, no stale board.',
    graphic: <RadarGraphic />,
  },
  {
    title: 'Next best action, computed',
    body: 'Each lane carries a projected path and the one move that shifts it. The model does the reading; you make the call.',
    graphic: <ActionGraphic />,
  },
  {
    title: 'Every signal, one map',
    body: 'Email, calls, product usage and CRM state converge into a single navigable view of where pipeline is heading.',
    graphic: <SignalGraphic />,
  },
]

export default function FeatureTrio() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section ref={ref} className={`${inView ? 'is-inview' : ''} bg-surface-100`}>
      <div className="mx-auto max-w-[1200px] px-6 pt-24 pb-24 md:px-10 md:pt-[152px]">
        <div className="max-w-[680px]">
          <span className="inline-flex h-6 items-center rounded-tag bg-surface-300 px-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.4px] text-ink-secondary">
            Radar
          </span>
          <h2 className="mt-5 [text-wrap:balance] font-display text-[40px] font-medium leading-[44px] tracking-[-0.4px]">
            <span className="text-ink">One live map for </span>
            <span className="text-ink-secondary">every deal in motion.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:mt-14 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="kz-graphic rounded-card border border-hairline-1 bg-surface-100 p-6"
              style={{ '--enter-delay': `${i * 100}ms` } as React.CSSProperties}
            >
              <div className="overflow-hidden rounded-tile border border-hairline-1">{f.graphic}</div>
              <h3 className="mt-5 font-display text-[17px] font-medium leading-6 tracking-[-0.17px] text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-[15px] font-[450] leading-6 tracking-[-0.1px] text-ink-secondary">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
