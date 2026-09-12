import { useEffect, useState } from 'react'
import { useInView } from '../hooks/useInView'
import './DarkContext.css'

/*
 * Dark context-flow section — DarkSection's typographic power (two-tone
 * headline, olive telemetry mono, generous dark silence) with the ported
 * ContextFlow schematic underneath: 5 source pills read into a lavender "K"
 * hub before the call, 4 write-back pills leave it after. A single comet
 * travels one transfer at a time; the hub blips on arrival. Ported from
 * v2 ContextHub.tsx/ContextFlow.tsx — remapped ink-900→surface-dark,
 * brand-blue comet→lavender accent-600, pill chrome→gray-900/gray-800
 * (the same hairline-on-dark idiom as DarkSection's CTA button).
 */

const TELEMETRY = ['context window · 4,120 accounts', 'freshness · 0.8s behind live']

function getUseMotion() {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type Row = { label: string; sub: string }

const SOURCES: Row[] = [
  { label: 'Sales playbook', sub: 'Plays & talk tracks' },
  { label: 'Pricing guide', sub: 'Packaging & discounts' },
  { label: 'CRM records', sub: 'Account & deal context' },
  { label: 'Calendar', sub: 'Attendees & agenda' },
  { label: 'Docs', sub: 'Notes & references' },
]

const WRITEBACKS: Row[] = [
  { label: 'Call notes', sub: 'Summary & decisions' },
  { label: 'Next steps', sub: 'Owned & dated' },
  { label: 'CRM field updates', sub: 'Pain · goals · blockers' },
  { label: 'Coaching flags', sub: 'Moments to review' },
]

// ---- fixed 1120x480 coordinate space, scaled uniformly by the viewBox ----
const CHIP = { x: 500, y: 180, w: 120, h: 120 } // center (560, 240)
const PORT_L = 300
const PORT_R = 820
const PIN_L = 500
const PIN_R = 620

const LEFT_YS = [48, 144, 240, 336, 432]
const LEFT_PINS = [200, 220, 240, 260, 280]
const LEFT_XV = [460, 380, 0, 380, 460]

const RIGHT_YS = [48, 176, 304, 432]
const RIGHT_PINS = [195, 225, 255, 285]
const RIGHT_XV = [660, 740, 740, 660]

const COMET = 42
const SPEED = 0.2 // units/ms
const REST = 450
const DRAW_DELAY = 900

function trace(x0: number, y0: number, x1: number, y1: number, xv: number, r = 10) {
  if (y0 === y1) return `M ${x0} ${y0} H ${x1}`
  const dy = y1 > y0 ? 1 : -1
  return `M ${x0} ${y0} H ${xv - r} Q ${xv} ${y0} ${xv} ${y0 + dy * r} V ${y1 - dy * r} Q ${xv} ${y1} ${xv + r} ${y1} H ${x1}`
}

const traceLen = (y0: number, y1: number) => 200 + Math.abs(y1 - y0)
const travelMs = (len: number) => Math.round((len + COMET) / SPEED)

const LEFT_TRACES = LEFT_YS.map((y, i) => trace(PORT_L, y, PIN_L, LEFT_PINS[i], LEFT_XV[i]))
const RIGHT_TRACES = RIGHT_YS.map((y, i) => trace(PIN_R, RIGHT_PINS[i], PORT_R, y, RIGHT_XV[i]))
const LEFT_LENS = LEFT_YS.map((y, i) => traceLen(y, LEFT_PINS[i]))
const RIGHT_LENS = RIGHT_YS.map((y, i) => traceLen(RIGHT_PINS[i], y))

type Transfer = { side: 'L' | 'R'; i: number }
const ORDER: Transfer[] = [
  { side: 'L', i: 0 },
  { side: 'R', i: 0 },
  { side: 'L', i: 1 },
  { side: 'R', i: 1 },
  { side: 'L', i: 2 },
  { side: 'R', i: 2 },
  { side: 'L', i: 3 },
  { side: 'R', i: 3 },
  { side: 'L', i: 4 },
]

function Pill({
  row,
  x,
  yc,
  align,
  lit,
  delay,
}: {
  row: Row
  x: number
  yc: number
  align: 'left' | 'right'
  lit: boolean
  delay: number
}) {
  const w = 280
  const h = 60
  const tx = align === 'left' ? x + 16 : x + w - 16
  const anchor = align === 'left' ? 'start' : 'end'
  return (
    <g>
      <rect
        x={x}
        y={yc - h / 2}
        width={w}
        height={h}
        rx="10"
        fill={lit ? '#2c3587' : '#262524'}
        stroke={lit ? '#6a77e5' : '#454545'}
        strokeWidth="1"
        className="ctx-pill-rect"
        style={{ transitionDelay: `${delay}ms` }}
      />
      <text
        x={tx}
        y={yc - 6}
        textAnchor={anchor}
        fontFamily="'Inter Variable', Inter, sans-serif"
        fontSize="13"
        fontWeight="600"
        fill="#fafafa"
      >
        {row.label}
      </text>
      <text
        x={tx}
        y={yc + 12}
        textAnchor={anchor}
        fontFamily="'Inter Variable', Inter, sans-serif"
        fontSize="11"
        fill="#8c8b8a"
      >
        {row.sub}
      </text>
    </g>
  )
}

function Comet({ d, len, delay, duration }: { d: string; len: number; delay: number; duration: number }) {
  const style = {
    '--comet-from': `${COMET}`,
    '--comet-to': `${-len}`,
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
  } as React.CSSProperties
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="#6a77e5"
        strokeOpacity="0.35"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${COMET} ${len + COMET}`}
        className="ctx-comet"
        style={style}
      />
      <path
        d={d}
        fill="none"
        stroke="#bec6f5"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray={`${COMET} ${len + COMET}`}
        className="ctx-comet"
        style={style}
      />
    </g>
  )
}

function DesktopFlow({ inView }: { inView: boolean }) {
  const [useMotion, setUseMotion] = useState(getUseMotion)
  const [step, setStep] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [arrived, setArrived] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const recalc = () => setUseMotion(getUseMotion())
    mq.addEventListener('change', recalc)
    return () => mq.removeEventListener('change', recalc)
  }, [])

  const running = inView && useMotion

  useEffect(() => {
    if (!running) return
    const { side, i } = ORDER[step]
    const len = side === 'L' ? LEFT_LENS[i] : RIGHT_LENS[i]
    const dur = travelMs(len)
    const startDelay = cycle === 0 ? DRAW_DELAY : 0
    const tArrive = setTimeout(() => setArrived(true), startDelay + dur * 0.72)
    const tNext = setTimeout(
      () => {
        setArrived(false)
        setStep((s) => (s + 1) % ORDER.length)
        setCycle((c) => c + 1)
      },
      startDelay + dur + REST,
    )
    return () => {
      clearTimeout(tArrive)
      clearTimeout(tNext)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, step, cycle])

  const active = ORDER[step]
  const activeD = active.side === 'L' ? LEFT_TRACES[active.i] : RIGHT_TRACES[active.i]
  const activeLen = active.side === 'L' ? LEFT_LENS[active.i] : RIGHT_LENS[active.i]
  const litLeft = running && active.side === 'L' ? active.i : -1
  const litRight = running && active.side === 'R' && arrived ? active.i : -1
  const blipNow = running && arrived

  return (
    <div className={`${inView ? 'is-inview' : ''} relative hidden w-full lg:block`}>
      <svg viewBox="0 0 1120 480" className="h-auto w-full" role="img" aria-label="Diagram of five sources reading into a live context hub, which writes four fields back after each call">
        <text x="0" y="20" fontFamily="'Inter Variable',Inter,sans-serif" fontSize="11" letterSpacing="1" fill="#9da369">
          READS · BEFORE THE CALL
        </text>
        <text x="1120" y="20" textAnchor="end" fontFamily="'Inter Variable',Inter,sans-serif" fontSize="11" letterSpacing="1" fill="#9da369">
          WRITES BACK · AFTER THE CALL
        </text>

        {/* chip context rings */}
        <circle cx="560" cy="240" r="90" fill="none" stroke="#262524" strokeWidth="1" />
        <circle cx="560" cy="240" r="112" fill="none" stroke="#262524" strokeWidth="1" />

        {/* base traces — draw in once via .is-inview, active one lifts to lavender */}
        {LEFT_TRACES.map((d, i) => (
          <path
            key={`l${i}`}
            d={d}
            pathLength={100}
            fill="none"
            strokeWidth="1.25"
            stroke={litLeft === i ? '#7e8be9' : '#454545'}
            className="ctx-trace-draw"
            style={{ transitionDelay: `${i * 60}ms` }}
          />
        ))}
        {RIGHT_TRACES.map((d, i) => (
          <path
            key={`r${i}`}
            d={d}
            pathLength={100}
            fill="none"
            strokeWidth="1.25"
            stroke={litRight === i ? '#7e8be9' : '#454545'}
            className="ctx-trace-draw"
            style={{ transitionDelay: `${(i + 5) * 60}ms` }}
          />
        ))}

        {running && <Comet key={`comet-${cycle}`} d={activeD} len={activeLen} delay={cycle === 0 ? DRAW_DELAY : 0} duration={travelMs(activeLen)} />}

        {/* chip pin stubs */}
        {LEFT_PINS.map((y) => (
          <path key={`pl${y}`} d={`M ${CHIP.x - 12} ${y} H ${CHIP.x}`} stroke="#71706f" strokeWidth="1.5" />
        ))}
        {RIGHT_PINS.map((y) => (
          <path key={`pr${y}`} d={`M ${CHIP.x + CHIP.w} ${y} H ${CHIP.x + CHIP.w + 12}`} stroke="#71706f" strokeWidth="1.5" />
        ))}

        {/* ports at the pill edges */}
        {LEFT_YS.map((y) => (
          <circle key={`ol${y}`} cx={PORT_L} cy={y} r="3" fill="#111400" stroke="#71706f" strokeWidth="1" />
        ))}
        {RIGHT_YS.map((y) => (
          <circle key={`or${y}`} cx={PORT_R} cy={y} r="3" fill="#111400" stroke="#71706f" strokeWidth="1" />
        ))}

        {/* hub chip */}
        <rect x={CHIP.x} y={CHIP.y} width={CHIP.w} height={CHIP.h} rx="20" fill="#161514" stroke="#454545" strokeWidth="1" />
        {blipNow && (
          <rect key={`blip-${cycle}`} x={CHIP.x} y={CHIP.y} width={CHIP.w} height={CHIP.h} rx="20" fill="none" stroke="#6a77e5" strokeWidth="1.5" className="ctx-hub-blip" />
        )}
        <rect x={CHIP.x + 25} y={CHIP.y + 25} width="70" height="70" rx="12" fill="#6a77e5" />
        <text x={CHIP.x + 60} y={CHIP.y + 70} textAnchor="middle" fontFamily="'Inter Display','Inter Variable',Inter,sans-serif" fontSize="26" fontWeight="650" fill="#fafafa">
          K
        </text>
        <text x="560" y="352" textAnchor="middle" fontFamily="'Inter Variable',Inter,sans-serif" fontSize="10" letterSpacing="1.5" fill="#9da369">
          LIVE CONTEXT HUB
        </text>

        {SOURCES.map((row, i) => (
          <Pill key={row.label} row={row} x={0} yc={LEFT_YS[i]} align="left" lit={litLeft === i} delay={i * 60} />
        ))}
        {WRITEBACKS.map((row, i) => (
          <Pill key={row.label} row={row} x={PORT_R} yc={RIGHT_YS[i]} align="right" lit={litRight === i} delay={(i + 5) * 60} />
        ))}
      </svg>
    </div>
  )
}

/** < lg: sources stacked, a vertical bus pulses down into the hub, another
 * pulses out to the stacked write-backs. Bus alternates every ~1.8s. */
function MobileFlow({ inView }: { inView: boolean }) {
  const [useMotion, setUseMotion] = useState(getUseMotion)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const recalc = () => setUseMotion(getUseMotion())
    mq.addEventListener('change', recalc)
    return () => mq.removeEventListener('change', recalc)
  }, [])

  const running = inView && useMotion

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setTick((n) => n + 1), 1800)
    return () => clearInterval(t)
  }, [running])

  const activeBus = tick % 2

  const Bus = ({ which }: { which: number }) => (
    <svg viewBox="0 0 24 40" className="mx-auto h-9 w-6" aria-hidden>
      <path d="M 12 2 V 38" stroke="#454545" strokeWidth="1.25" />
      {running && activeBus === which && (
        <path
          key={tick}
          d="M 12 2 V 38"
          stroke="#bec6f5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="14 50"
          className="ctx-comet"
          style={{ '--comet-from': '14', '--comet-to': '-36', animationDuration: '1200ms' } as React.CSSProperties}
        />
      )}
    </svg>
  )

  return (
    <div className={`${inView ? 'is-inview' : ''} flex flex-col gap-3 lg:hidden`}>
      <p className="font-mono font-[550] text-[10px] tracking-[1.5px] text-olive-700 uppercase">Reads · before the call</p>
      <div className="flex flex-col gap-2">
        {SOURCES.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-tile border border-gray-800 bg-gray-900 px-3.5 py-2.5">
            <span className="text-[13px] font-medium text-surface-100">{row.label}</span>
            <span className="text-[11px] text-gray-600">{row.sub}</span>
          </div>
        ))}
      </div>
      <Bus which={0} />
      <div className="mx-auto flex size-16 items-center justify-center rounded-card border border-gray-800 bg-ink">
        <span className="flex size-11 items-center justify-center rounded-tile bg-accent-600 font-display text-lg font-[650] text-surface-100">K</span>
      </div>
      <p className="text-center font-mono font-[550] text-[10px] tracking-[1.5px] text-olive-700 uppercase">Live context hub</p>
      <Bus which={1} />
      <p className="font-mono font-[550] text-[10px] tracking-[1.5px] text-olive-700 uppercase">Writes back · after the call</p>
      <div className="flex flex-col gap-2">
        {WRITEBACKS.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-tile border border-gray-800 bg-gray-900 px-3.5 py-2.5">
            <span className="text-[13px] font-medium text-surface-100">{row.label}</span>
            <span className="text-[11px] text-gray-600">{row.sub}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DarkContext() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section ref={ref} className="relative overflow-hidden bg-surface-dark text-surface-100">
      {/* faint dot-grid backdrop — matches DarkSection's, unique pattern id */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="context-dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#ffffff" fillOpacity="0.05" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#context-dots)" />
      </svg>

      <div className="relative mx-auto max-w-[1200px] px-6 pt-24 pb-24 md:px-10 md:pt-[152px] md:pb-[120px]">
        <h2
          className={`${inView ? 'kz-enter' : 'opacity-0'} max-w-[860px] [text-wrap:balance] font-display text-[40px] font-medium leading-[44px] tracking-[-0.4px]`}
          style={{ '--enter-delay': '0ms' } as React.CSSProperties}
        >
          <span className="text-surface-100">Every signal your team has ever seen, </span>
          <span className="text-gray-500">held in one context.</span>
        </h2>

        <p
          className={`${inView ? 'kz-enter' : 'opacity-0'} mt-5 max-w-[560px] text-[16px] leading-6 text-gray-500`}
          style={{ '--enter-delay': '80ms' } as React.CSSProperties}
        >
          Before the call, Knowzilla reads your playbook, pricing and CRM. When it ends, notes, next
          steps and CRM fields are written straight back — no manual entry.
        </p>

        <div
          className={`${inView ? 'kz-enter' : 'opacity-0'} mt-8 flex flex-wrap gap-x-8 gap-y-2`}
          style={{ '--enter-delay': '160ms' } as React.CSSProperties}
        >
          {TELEMETRY.map((line) => (
            <span key={line} className="font-mono text-[13px] leading-5 text-olive-500">
              {line}
            </span>
          ))}
        </div>

        <div
          className={`${inView ? 'kz-enter' : 'opacity-0'} mt-16 md:mt-20`}
          style={{ '--enter-delay': '240ms' } as React.CSSProperties}
        >
          <DesktopFlow inView={inView} />
          <MobileFlow inView={inView} />
        </div>

        <div
          className={`${inView ? 'kz-enter' : 'opacity-0'} mt-12`}
          style={{ '--enter-delay': '320ms' } as React.CSSProperties}
        >
          <a
            href="#"
            className="kz-hover kz-focus-ring inline-flex h-9 items-center rounded-button border border-gray-800 px-4 text-[14px] font-medium text-surface-100 hover:border-gray-700 hover:bg-gray-900"
            style={{ transitionProperty: 'background-color, border-color' }}
          >
            See how context works
          </a>
        </div>
      </div>
    </section>
  )
}
