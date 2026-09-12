import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'

const MONO = "'Inter Variable',Inter,sans-serif" /* mono retired 2026-07-25 */

function getUseScrub() {
  if (typeof window === 'undefined') return false
  const isDesktop = window.matchMedia('(min-width: 768px)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return isDesktop && !reduced
}

/* Per-tab product mockups in the DealMap idiom (dot grid, lavender routes,
   olive telemetry, mono labels). One wide viewBox each. */

function PanelFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 880 420" className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <pattern id="pt-dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#ECECEB" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="880" height="420" fill="#ffffff" />
      <rect x="0" y="0" width="880" height="420" fill="url(#pt-dots)" />
      {children}
    </svg>
  )
}

function RadarPanel() {
  return (
    <PanelFrame label="Radar view">
      <g fill="none" stroke="#6A77E5" strokeWidth="1.5" strokeLinecap="round">
        <path d="M80,120 Q320,104 560,92 Q680,86 780,80" />
        <path d="M70,246 Q220,236 340,220 Q420,208 500,196" />
        <path d="M100,322 Q260,316 380,308 Q460,302 520,296" />
      </g>
      <path d="M500,196 Q640,168 760,148" fill="none" stroke="#9EA8F0" strokeWidth="1.5" strokeDasharray="2 7" />
      <circle cx="500" cy="196" r="5" fill="#6A77E5" />
      <circle cx="500" cy="196" r="11" fill="none" stroke="#BEC6F5" strokeWidth="1.5" />
      <circle cx="780" cy="80" r="5" fill="#0FC27B" />
      <circle cx="520" cy="296" r="5" fill="#FF5B59" />
      <circle cx="760" cy="148" r="5" fill="#ffffff" stroke="#6A77E5" strokeWidth="1.5" />
      <rect x="392" y="150" width="216" height="26" rx="8" fill="#ffffff" stroke="#ECECEB" />
      <text x="404" y="167" fontFamily={MONO} fontSize="13" fill="#161514">acme-corp · stage 3 · 78%</text>
      <text x="798" y="84" fontFamily={MONO} fontSize="13" fill="#71706F">globex · won</text>
      <text x="70" y="382" fontFamily={MONO} fontSize="13" fill="#7E844F">signal latency 12ms</text>
    </PanelFrame>
  )
}

function SignalsPanel() {
  const rows = [
    { y: 120, label: 'email · reply after 2d', tone: '#6A77E5' },
    { y: 176, label: 'call · 14m, positive', tone: '#6A77E5' },
    { y: 232, label: 'product · 3 seats active', tone: '#B3B980' },
    { y: 288, label: 'crm · stage advanced', tone: '#6A77E5' },
  ]
  return (
    <PanelFrame label="Signals view">
      {rows.map((r) => (
        <g key={r.y}>
          <circle cx="90" cy={r.y} r="4.5" fill={r.tone} />
          <line x1="90" y1={r.y} x2="470" y2="210" stroke="#9EA8F0" strokeWidth="1" strokeDasharray="2 7" />
          <text x="108" y={r.y + 4} fontFamily={MONO} fontSize="13" fill="#71706F">{r.label}</text>
        </g>
      ))}
      <circle cx="470" cy="210" r="6" fill="#6A77E5" />
      <circle cx="470" cy="210" r="13" fill="none" stroke="#BEC6F5" strokeWidth="1.5" />
      <rect x="540" y="188" width="230" height="44" rx="10" fill="#ffffff" stroke="#ECECEB" />
      <text x="556" y="208" fontFamily={MONO} fontSize="13" fill="#161514">acme-corp</text>
      <text x="556" y="224" fontFamily={MONO} fontSize="13" fill="#7E844F">4 signals merged</text>
    </PanelFrame>
  )
}

function ForecastPanel() {
  return (
    <PanelFrame label="Forecast view">
      <path d="M80,300 Q240,280 400,250 Q560,220 700,196" fill="none" stroke="#6A77E5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M700,196 Q760,184 820,150" fill="none" stroke="#9EA8F0" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 7" />
      <path d="M700,196 Q760,204 820,240" fill="none" stroke="#BEC6F5" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 7" />
      <g stroke="#B3B980" strokeWidth="1.5" strokeLinecap="round">
        <line x1="240" y1="278" x2="240" y2="292" />
        <line x1="400" y1="243" x2="400" y2="257" />
        <line x1="560" y1="213" x2="560" y2="227" />
      </g>
      <circle cx="700" cy="196" r="5" fill="#6A77E5" />
      <circle cx="820" cy="150" r="5" fill="#ffffff" stroke="#6A77E5" strokeWidth="1.5" />
      <rect x="70" y="96" width="240" height="26" rx="8" fill="#ffffff" stroke="#ECECEB" />
      <text x="82" y="113" fontFamily={MONO} fontSize="13" fill="#7E844F">forecast accuracy 98.4%</text>
      <text x="640" y="150" fontFamily={MONO} fontSize="13" fill="#71706F">close · +18%</text>
    </PanelFrame>
  )
}

function ActionsPanel() {
  const actions = [
    { y: 130, label: 'send renewal terms to acme-corp', lift: '+12%' },
    { y: 200, label: 'loop in champion at northwind', lift: '+8%' },
    { y: 270, label: 'flag initech to deal desk', lift: 'risk' },
  ]
  return (
    <PanelFrame label="Actions view">
      {actions.map((a, i) => (
        <g key={a.y}>
          <rect x="80" y={a.y - 20} width="560" height="40" rx="10" fill="#ffffff" stroke="#ECECEB" />
          <circle cx="104" cy={a.y} r="4.5" fill={i === 2 ? '#FF5B59' : '#6A77E5'} />
          <text x="124" y={a.y + 4} fontFamily={MONO} fontSize="13" fill="#161514">{a.label}</text>
          <text x="560" y={a.y + 4} fontFamily={MONO} fontSize="13" fill={i === 2 ? '#C42422' : '#7E844F'}>{a.lift}</text>
        </g>
      ))}
      <text x="80" y="360" fontFamily={MONO} fontSize="13" fill="#7E844F">3 actions queued</text>
    </PanelFrame>
  )
}

const TABS = [
  { id: 'radar', label: 'Radar', desc: 'Every open deal as a live lane.', panel: <RadarPanel /> },
  { id: 'signals', label: 'Signals', desc: 'Raw activity, merged per account.', panel: <SignalsPanel /> },
  { id: 'forecast', label: 'Forecast', desc: 'Where the quarter actually lands.', panel: <ForecastPanel /> },
  { id: 'actions', label: 'Actions', desc: 'The next move, ranked by lift.', panel: <ActionsPanel /> },
]

export default function PlatformTour() {
  const { ref: viewRef, inView } = useInView<HTMLElement>()
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState('8px')
  const [useScrub, setUseScrub] = useState(getUseScrub)
  const panelRef = useRef<HTMLDivElement>(null)

  const select = (i: number) => {
    if (i === active) return
    setDir(i > active ? '8px' : '-8px')
    setActive(i)
  }

  // Flip between scrub and static on breakpoint / reduced-motion change.
  useEffect(() => {
    const mqDesktop = window.matchMedia('(min-width: 768px)')
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const recalc = () => setUseScrub(getUseScrub())
    mqDesktop.addEventListener('change', recalc)
    mqReduced.addEventListener('change', recalc)
    return () => {
      mqDesktop.removeEventListener('change', recalc)
      mqReduced.removeEventListener('change', recalc)
    }
  }, [])

  // Scroll-scrub: scale .96→1 + opacity over ~300px as the panel enters.
  // One passive scroll listener + rAF flag; writes only a CSS custom prop.
  useEffect(() => {
    if (!useScrub) return
    const panel = panelRef.current
    if (!panel) return

    let ticking = false
    const update = () => {
      ticking = false
      const rect = panel.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh - rect.top) / 300))
      panel.style.setProperty('--tp', String(p))
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [useScrub])

  return (
    <section ref={viewRef} className={`${inView ? 'is-inview' : ''} bg-surface-200`}>
      <div className="mx-auto max-w-[1200px] px-6 pt-24 pb-24 md:px-10 md:pt-[152px]">
        <div className="max-w-[680px]">
          <span className="inline-flex h-6 items-center rounded-tag bg-surface-100 px-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.4px] text-ink-secondary">
            Platform
          </span>
          <h2 className="mt-5 [text-wrap:balance] font-display text-[40px] font-medium leading-[44px] tracking-[-0.4px]">
            <span className="text-ink">The whole pipeline, </span>
            <span className="text-ink-secondary">one instrument.</span>
          </h2>
        </div>

        {/* tab rail — scrolls horizontally on small screens */}
        <div className="mt-10 -mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
          <div className="flex min-w-max gap-8 border-b border-hairline-2">
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => select(i)}
                className={`kz-hover kz-focus-ring -mb-px flex flex-col items-start gap-0.5 rounded-micro border-b-[1.5px] pb-3 text-left ${
                  i === active
                    ? 'border-accent-600 text-ink'
                    : 'border-transparent text-ink-secondary hover:text-ink'
                }`}
                style={{ transitionProperty: 'color, border-color' }}
              >
                <span className="text-[15px] font-medium tracking-[-0.15px]">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* product panel */}
        <div ref={panelRef} className="tour-panel mt-8 overflow-hidden rounded-card border border-hairline-2 bg-surface-100">
          <div className="border-b border-hairline-1 px-5 py-3">
            <p className="font-mono text-[13px] leading-5 text-ink-secondary">
              knowzilla / {TABS[active].label.toLowerCase()} —{' '}
              <span className="text-ink">{TABS[active].desc}</span>
            </p>
          </div>
          <div
            key={active}
            className="kz-tab-panel p-4 md:p-6"
            style={{ '--tab-from': dir } as React.CSSProperties}
          >
            {TABS[active].panel}
          </div>
        </div>
      </div>
    </section>
  )
}
