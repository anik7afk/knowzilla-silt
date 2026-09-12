import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import './HvuVariationsSet3.css'

/* Round 3 — ten takes on Signal Converge (v11). Orbit → collapse is the
   motion thesis. Same Knowzilla content. */

const RAW =
  'yeah so look we we need more predict ability going into next year i mean every line item is is getting reviewed right now honestly'
const CTX = [
  { k: 'CRM', v: 'Renewal risk' },
  { k: 'Prior call', v: 'Budget pressure' },
  { k: 'Pricing', v: '12% discount' },
] as const

function useReduced() {
  const [r, setR] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setR(mq.matches)
    const fn = () => setR(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return r
}

function useInView() {
  const ref = useRef<HTMLElement | null>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setOn(true)
      },
      { threshold: 0.32 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, on }
}

function useBeat(
  on: boolean,
  offsets: readonly number[],
  reduced: boolean,
  gen: number,
) {
  const [step, setStep] = useState(0)
  const key = `${gen}|${offsets.join(',')}`
  useEffect(() => {
    if (!on) return
    if (reduced) {
      setStep(offsets.length)
      return
    }
    setStep(0)
    const timers = offsets.map((t, i) =>
      window.setTimeout(() => setStep(i + 1), t),
    )
    return () => timers.forEach(clearTimeout)
  }, [on, reduced, key, offsets])
  return step
}

function useReplayable() {
  const [gen, setGen] = useState(0)
  return { gen, replay: () => setGen((g) => g + 1) }
}

function Shell({
  id,
  n,
  name,
  thesis,
  children,
  onReplay,
}: {
  id: string
  n: string
  name: string
  thesis: string
  children: ReactNode
  onReplay: () => void
}) {
  return (
    <section className="hvuv-sec hv3-sec" id={id} data-hvuv={id}>
      <div className="hvuv-sec__tag">
        <span className="hvuv-sec__n">{n}</span>
        <span className="hvuv-sec__name">{name}</span>
        <span className="hvuv-sec__thesis">{thesis}</span>
        <button type="button" className="hv3-replay" onClick={onReplay}>
          Replay
        </button>
      </div>
      {children}
    </section>
  )
}

function Core({ className = '' }: { className?: string }) {
  return (
    <div className={`hv3-core ${className}`.trim()}>
      <h3>
        We need more <em>predictability.</em>
      </h3>
      <p>Pricing concern · high confidence · Δ1.30s</p>
    </div>
  )
}

function Chip({
  c,
  i,
  className = '',
}: {
  c: (typeof CTX)[number]
  i: number
  className?: string
}) {
  return (
    <div
      className={`hv3-chip ${className}`.trim()}
      style={{ '--i': i } as CSSProperties}
    >
      <em>{c.k}</em>
      {c.v}
    </div>
  )
}

function Head() {
  return (
    <header className="hv3-head">
      <h2>
        Hearing is <span>not understanding.</span>
      </h2>
      <p>Knowzilla brings the account into every sentence.</p>
    </header>
  )
}

const B16 = [200, 800, 1600, 2400, 3200] as const
function OrbitPaths() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const { gen, replay } = useReplayable()
  const step = useBeat(on, B16, reduced, gen)
  return (
    <Shell
      id="v16"
      n="16"
      name="Orbit paths"
      thesis="Chips ride circular tracks, then peel off into the core"
      onReplay={replay}
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv3-op${on ? ' is-on' : ''} s${step}`}
      >
        <Head />
        <div key={gen} className="hv3-op__stage">
          <svg className="hv3-op__rings" viewBox="0 0 600 420" aria-hidden="true">
            <ellipse cx="300" cy="210" rx="210" ry="140" />
            <ellipse cx="300" cy="210" rx="150" ry="100" />
            <ellipse cx="300" cy="210" rx="90" ry="60" />
          </svg>
          <p className="hv3-op__raw">{RAW}</p>
          {CTX.map((c, i) => (
            <div key={c.k} className={`hv3-op__rider hv3-op__rider--${i}`}>
              <Chip c={c} i={i} />
            </div>
          ))}
          <Core className="hv3-op__core" />
        </div>
      </article>
    </Shell>
  )
}

const B17 = [200, 700, 1400, 2100, 2800] as const
function SpokeDraw() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const { gen, replay } = useReplayable()
  const step = useBeat(on, B17, reduced, gen)
  return (
    <Shell
      id="v17"
      n="17"
      name="Spoke draw"
      thesis="Blue spokes draw to center — chips travel the lines and dissolve"
      onReplay={replay}
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv3-sp${on ? ' is-on' : ''} s${step}`}
      >
        <Head />
        <div key={gen} className="hv3-sp__stage">
          <svg className="hv3-sp__spokes" viewBox="0 0 800 420" aria-hidden="true">
            <path className="hv3-sp__line hv3-sp__line--0" d="M120 80 L400 210" />
            <path className="hv3-sp__line hv3-sp__line--1" d="M680 90 L400 210" />
            <path className="hv3-sp__line hv3-sp__line--2" d="M140 340 L400 210" />
          </svg>
          {CTX.map((c, i) => (
            <div key={c.k} className={`hv3-sp__src hv3-sp__src--${i}`}>
              <Chip c={c} i={i} />
            </div>
          ))}
          <Core className="hv3-sp__core" />
        </div>
      </article>
    </Shell>
  )
}

const B18 = [300, 900, 1500, 2200, 2900] as const
function MagnetPull() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const { gen, replay } = useReplayable()
  const step = useBeat(on, B18, reduced, gen)
  return (
    <Shell
      id="v18"
      n="18"
      name="Magnet pull"
      thesis="Signals appear at the rim, then snap-accelerate into the core"
      onReplay={replay}
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv3-mg${on ? ' is-on' : ''} s${step}`}
      >
        <Head />
        <div key={gen} className="hv3-mg__stage">
          <div className="hv3-mg__field" aria-hidden="true" />
          <p className="hv3-mg__raw">{RAW}</p>
          {CTX.map((c, i) => (
            <div key={c.k} className={`hv3-mg__chip hv3-mg__chip--${i}`}>
              <Chip c={c} i={i} />
              <span className="hv3-mg__trail" />
            </div>
          ))}
          <Core className="hv3-mg__core" />
        </div>
      </article>
    </Shell>
  )
}

const B19 = [200, 800, 1400, 2000, 2600] as const
function StackMerge() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const { gen, replay } = useReplayable()
  const step = useBeat(on, B19, reduced, gen)
  return (
    <Shell
      id="v19"
      n="19"
      name="Stack merge"
      thesis="Three context cards fly in from corners and fuse into the insight"
      onReplay={replay}
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv3-sm${on ? ' is-on' : ''} s${step}`}
      >
        <Head />
        <div key={gen} className="hv3-sm__stage">
          {CTX.map((c, i) => (
            <div key={c.k} className={`hv3-sm__card hv3-sm__card--${i}`}>
              <em>{c.k}</em>
              <strong>{c.v}</strong>
            </div>
          ))}
          <Core className="hv3-sm__core" />
        </div>
      </article>
    </Shell>
  )
}

const B20 = [200, 900, 1700, 2500, 3300] as const
function RadarSweep() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const { gen, replay } = useReplayable()
  const step = useBeat(on, B20, reduced, gen)
  return (
    <Shell
      id="v20"
      n="20"
      name="Radar sweep"
      thesis="A sweep catches each signal blip — then the verdict locks"
      onReplay={replay}
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv3-rd${on ? ' is-on' : ''} s${step}`}
      >
        <Head />
        <div key={gen} className="hv3-rd__stage">
          <div className="hv3-rd__disc">
            <div className="hv3-rd__sweep" />
            <div className="hv3-rd__rings" aria-hidden="true" />
            {CTX.map((c, i) => (
              <div key={c.k} className={`hv3-rd__blip hv3-rd__blip--${i}`}>
                <span />
                <Chip c={c} i={i} />
              </div>
            ))}
            <Core className="hv3-rd__core" />
          </div>
          <p className="hv3-rd__meta">
            Northwind · live · resolved Δ1.30s · high confidence
          </p>
        </div>
      </article>
    </Shell>
  )
}

const B21 = [200, 800, 1500, 2200, 2900] as const
function HaloAbsorb() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const { gen, replay } = useReplayable()
  const step = useBeat(on, B21, reduced, gen)
  return (
    <Shell
      id="v21"
      n="21"
      name="Halo absorb"
      thesis="Expanding halos wash over the field and absorb signals into ink"
      onReplay={replay}
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv3-ha${on ? ' is-on' : ''} s${step}`}
      >
        <Head />
        <div key={gen} className="hv3-ha__stage">
          <div className="hv3-ha__halo hv3-ha__halo--1" />
          <div className="hv3-ha__halo hv3-ha__halo--2" />
          <div className="hv3-ha__halo hv3-ha__halo--3" />
          <p className="hv3-ha__raw">{RAW}</p>
          {CTX.map((c, i) => (
            <div key={c.k} className={`hv3-ha__chip hv3-ha__chip--${i}`}>
              <Chip c={c} i={i} />
            </div>
          ))}
          <Core className="hv3-ha__core" />
        </div>
      </article>
    </Shell>
  )
}

const B22 = [200, 700, 1300, 2000, 2700] as const
function LatticeCollapse() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const { gen, replay } = useReplayable()
  const step = useBeat(on, B22, reduced, gen)
  const cells = [
    ...CTX.map((c) => ({ k: c.k, v: c.v })),
    { k: 'Account', v: 'Northwind' },
    { k: 'Moment', v: '09:16 live' },
    { k: 'Lag', v: 'Δ1.30s' },
  ]
  return (
    <Shell
      id="v22"
      n="22"
      name="Lattice"
      thesis="A context lattice folds cell-by-cell into one resolved card"
      onReplay={replay}
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv3-lt${on ? ' is-on' : ''} s${step}`}
      >
        <Head />
        <div key={gen} className="hv3-lt__stage">
          <div className="hv3-lt__grid">
            {cells.map((c, i) => (
              <div
                key={c.k}
                className="hv3-lt__cell"
                style={{ '--i': i } as CSSProperties}
              >
                <em>{c.k}</em>
                <strong>{c.v}</strong>
              </div>
            ))}
          </div>
          <Core className="hv3-lt__core" />
        </div>
      </article>
    </Shell>
  )
}

const B23 = [200, 800, 1500, 2200, 2900] as const
function DualField() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const { gen, replay } = useReplayable()
  const step = useBeat(on, B23, reduced, gen)
  return (
    <Shell
      id="v23"
      n="23"
      name="Dual field"
      thesis="Heard stream left, account signals right — both collapse to center"
      onReplay={replay}
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv3-df${on ? ' is-on' : ''} s${step}`}
      >
        <Head />
        <div key={gen} className="hv3-df__stage">
          <div className="hv3-df__side hv3-df__side--raw">
            <p className="hv3-lab">Heard now</p>
            <p>{RAW}</p>
          </div>
          <div className="hv3-df__side hv3-df__side--ctx">
            <p className="hv3-lab">Account</p>
            {CTX.map((c, i) => (
              <Chip key={c.k} c={c} i={i} className="hv3-df__chip" />
            ))}
          </div>
          <Core className="hv3-df__core" />
        </div>
      </article>
    </Shell>
  )
}

const B24 = [200, 900, 1600, 2400, 3200] as const
function ParticleFunnel() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const { gen, replay } = useReplayable()
  const step = useBeat(on, B24, reduced, gen)
  const dots = Array.from({ length: 18 }, (_, i) => i)
  return (
    <Shell
      id="v24"
      n="24"
      name="Particle funnel"
      thesis="Gravity-well funnel — particles + chips drain into the verdict"
      onReplay={replay}
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv3-pf${on ? ' is-on' : ''} s${step}`}
      >
        <Head />
        <div key={gen} className="hv3-pf__stage">
          <div className="hv3-pf__well" aria-hidden="true">
            {dots.map((i) => (
              <span
                key={i}
                className="hv3-pf__dot"
                style={{ '--i': i } as CSSProperties}
              />
            ))}
          </div>
          {CTX.map((c, i) => (
            <div key={c.k} className={`hv3-pf__chip hv3-pf__chip--${i}`}>
              <Chip c={c} i={i} />
            </div>
          ))}
          <Core className="hv3-pf__core" />
        </div>
      </article>
    </Shell>
  )
}

const B25 = [300, 1000, 2200, 3000, 3800] as const
function ConvergePro() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const { gen, replay } = useReplayable()
  const step = useBeat(on, B25, reduced, gen)
  return (
    <Shell
      id="v25"
      n="25"
      name="Converge pro"
      thesis="Polished Signal Converge — true orbit, lag tick, snap settle"
      onReplay={replay}
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv3-cp${on ? ' is-on' : ''} s${step}`}
      >
        <Head />
        <div key={gen} className="hv3-cp__stage">
          <div className="hv3-cp__glow" aria-hidden="true" />
          <p className="hv3-cp__raw">{RAW}</p>
          <div className="hv3-cp__orbit">
            {CTX.map((c, i) => (
              <div key={c.k} className={`hv3-cp__sat hv3-cp__sat--${i}`}>
                <Chip c={c} i={i} />
              </div>
            ))}
          </div>
          <Core className="hv3-cp__core" />
          <div className="hv3-cp__lag">
            <span>{step >= 4 ? 'resolved' : 'matching…'}</span>
            <strong>
              Δ{step >= 4 ? '1.30' : step >= 2 ? '0.84' : '0.00'}s
            </strong>
          </div>
        </div>
      </article>
    </Shell>
  )
}

export const SET3_NAV = [
  { id: 'v16', label: '16 Orbit paths', group: 'Converge' },
  { id: 'v17', label: '17 Spoke draw', group: 'Converge' },
  { id: 'v18', label: '18 Magnet pull', group: 'Converge' },
  { id: 'v19', label: '19 Stack merge', group: 'Converge' },
  { id: 'v20', label: '20 Radar sweep', group: 'Converge' },
  { id: 'v21', label: '21 Halo absorb', group: 'Converge' },
  { id: 'v22', label: '22 Lattice', group: 'Converge' },
  { id: 'v23', label: '23 Dual field', group: 'Converge' },
  { id: 'v24', label: '24 Funnel', group: 'Converge' },
  { id: 'v25', label: '25 Converge pro', group: 'Converge' },
]

export function HvuVariationsSet3() {
  return (
    <>
      <OrbitPaths />
      <SpokeDraw />
      <MagnetPull />
      <StackMerge />
      <RadarSweep />
      <HaloAbsorb />
      <LatticeCollapse />
      <DualField />
      <ParticleFunnel />
      <ConvergePro />
    </>
  )
}
