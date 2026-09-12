import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useInView } from '../hooks/useInView'
import './SignalConvergence.css'

/* Signal Convergence — a standalone "poster" scene built on conservation of
   energy. Four scattered telemetry sources (CRM / EMAIL / CALLS / PRICING) are
   drawn as sparse graphite spikes crackling on gray baselines — restless,
   unresolved noise. Their lines curve and CONVERGE into one node. The
   convergence is a TRANSFORMATION, not a transport: as each curve finishes
   drawing into the ring, that row's spike activity DAMPS to stillness, and in
   exact counterpoint the single lavender buyer-intent waveform GROWS out of the
   ring — amplitude rising as the sources quiet, the scattered energy
   reconstituted as one coherent signal. The output line then extends right with
   its own momentum and resolves to BUYER INTENT · RISING.

   One continuous choreographed performance (~6.5s) on a single gsap timeline
   with overlapping position params so each beat causes the next. Compositor-only
   properties (transform / opacity / stroke-dashoffset); no per-frame React
   state, no canvas. Seeded (deterministic) spike + waveform data generated once
   at module load — no Math.random. Gated to viewport entry (useInView);
   prefers-reduced-motion skips the timeline and CSS paints the settled poster. */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const hash = (n: number) => {
  const s = Math.sin(n) * 43758.5453
  return s - Math.floor(s)
}

// ── seeded telemetry (module-level, deterministic — no Math.random) ─────────
const ROW_KEYS = ['CRM', 'EMAIL', 'CALLS', 'PRICING'] as const
type Spike = { u: number; h: number; s: number }
const ROW_SPEC = [
  { seed: 3.11, count: 13, tall: 0.9 }, // CRM — sparse, some tall
  { seed: 7.73, count: 22, tall: 0.42 }, // EMAIL — dense, short
  { seed: 12.37, count: 16, tall: 0.7 }, // CALLS — medium, occasional tall
  { seed: 19.51, count: 11, tall: 0.85 }, // PRICING — sparse
]
const SPIKES: Spike[][] = ROW_SPEC.map((spec) => {
  const arr: Spike[] = []
  for (let i = 0; i < spec.count; i++) {
    const a = hash(spec.seed + i * 1.37)
    const b = hash(spec.seed * 1.9 + i * 2.53)
    const c = hash(spec.seed * 0.7 + i * 3.11)
    const u = (i + 0.5) / spec.count + (a - 0.5) * (0.7 / spec.count)
    const isTall = b > 0.82
    const base = 0.16 + 0.3 * c
    const h = isTall ? Math.min(1, base + 0.5 + 0.4 * b * spec.tall) : base * (0.7 + 0.5 * spec.tall)
    arr.push({ u: clamp01(u), h: clamp01(h), s: a })
  }
  return arr
})

const WAVE_N = 44
type Bar = { u: number; half: number }
const WAVE: Bar[] = Array.from({ length: WAVE_N }, (_, i) => {
  const u = i / (WAVE_N - 1) // 0..1
  const c = Math.abs(u - 0.5) * 2 // 0 center → 1 ends
  const envelope = Math.pow(1 - c, 1.55) // diamond/bell taper
  const grain = 0.82 + 0.18 * hash(Math.min(i, WAVE_N - 1 - i) * 5.3 + 2.1) // symmetric
  return { u, half: clamp01(envelope * grain) }
})

// ── layout (desktop landscape vs mobile portrait) ──────────────────────────
type Layout = {
  vb: [number, number]
  rows: number[]
  baseX1: number
  baseX2: number
  labelX: number
  labelAnchor: 'start' | 'end'
  labelSize: number
  maxSpike: number
  ring1: [number, number]
  line1: [number, number, number, number]
  wave: { a: number; b: number; axis: number; half: number; vert: boolean }
  line2: [number, number, number, number]
  ring2: [number, number]
  label: { x: number; y: number; subY: number; anchor: 'start' | 'middle'; size: number; subSize: number }
  curve: (y: number) => string
}

function buildLayout(narrow: boolean): Layout {
  if (narrow) {
    const c1: [number, number] = [196, 402]
    return {
      vb: [380, 660],
      rows: [70, 126, 182, 238],
      baseX1: 76,
      baseX2: 348,
      labelX: 68,
      labelAnchor: 'end',
      labelSize: 11.5,
      maxSpike: 40,
      ring1: c1,
      line1: [196, 408, 196, 434],
      wave: { a: 440, b: 560, axis: 196, half: 32, vert: true },
      line2: [196, 566, 196, 592],
      ring2: [196, 600],
      label: { x: 196, y: 628, subY: 650, anchor: 'middle', size: 12.5, subSize: 10.5 },
      curve: (y) => `M 348 ${y} C 376 ${y} 280 ${c1[1]} ${c1[0]} ${c1[1]}`,
    }
  }
  const CY = 157
  return {
    vb: [1200, 300],
    rows: [60, 125, 190, 255],
    baseX1: 96,
    baseX2: 450,
    labelX: 80,
    labelAnchor: 'end',
    labelSize: 13,
    maxSpike: 44,
    ring1: [590, CY],
    line1: [598, CY, 636, CY],
    wave: { a: 644, b: 824, axis: CY, half: 34, vert: false },
    line2: [832, CY, 870, CY],
    ring2: [878, CY],
    label: { x: 898, y: 153, subY: 176, anchor: 'start', size: 13.5, subSize: 11 },
    curve: (y) => `M 450 ${y} C 525 ${y} 525 ${CY} 590 ${CY}`,
  }
}

function useNarrow() {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)')
    const update = () => setNarrow(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return narrow
}

export default function SignalConvergence() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 })
  const scope = useRef<HTMLElement | null>(null)
  const narrow = useNarrow()
  const L = useMemo(() => buildLayout(narrow), [narrow])

  const [W, H] = L.vb
  const { a: wa, b: wb, axis: wAxis, half: wHalf, vert: wVert } = L.wave
  const waveMid = (wa + wb) / 2
  const barClass = `sc-bar${wVert ? ' sc-bar--h' : ''}`

  useGSAP(
    () => {
      const root = scope.current
      if (!root || !inView) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return // CSS paints the settled poster

      const q = gsap.utils.selector(root)
      const ampAxis = wVert ? 'scaleX' : 'scaleY'
      const barInit = wVert ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 }
      const bars = q('.sc-bar')

      // ── initial (hidden) states — deterministic FROM values ─────────────
      gsap.set(q('.sc__ink, .sc__accent'), { autoAlpha: 0, y: 14, filter: 'blur(2px)' })
      gsap.set(q('.sc-label--row'), { autoAlpha: 0, y: 6 })
      gsap.set(q('.sc-label--intent, .sc-label--sub'), { autoAlpha: 0, x: -8 })
      gsap.set(q('.sc-base, .sc-curve, .sc-line'), { strokeDasharray: 1, strokeDashoffset: 1 })
      // each rect's bbox is centered on its own translate-group pivot, so
      // keyword origins resolve to (0,0) locally — gsap bakes no stray translate
      // (the pattern that survives SVG view-box coordinate space).
      gsap.set(q('.sc-spike'), { scaleY: 0, transformOrigin: 'center bottom' })
      gsap.set(bars, { ...barInit, transformOrigin: 'center center' })
      gsap.set(q('.sc-ring1, .sc-ring2'), { autoAlpha: 0, scale: 0.3, transformOrigin: 'center center' })

      // ── per-row crackle: infinite seeded yoyo, created paused (tracked) ──
      const crackleByRow: gsap.core.Tween[][] = [[], [], [], []]
      for (let r = 0; r < 4; r++) {
        q(`.sc-spike[data-row="${r}"]`).forEach((el) => {
          const s = parseFloat(el.getAttribute('data-s') || '0')
          const amp = 0.42 + s * 0.3 // low bound — never fully collapses while live
          const dur = 0.24 + ((s * 1.7) % 1) * 0.42
          crackleByRow[r].push(
            gsap.to(el, {
              scaleY: amp,
              duration: dur,
              ease: 'power1.inOut',
              yoyo: true,
              repeat: -1,
              delay: s * 0.55,
              paused: true,
            }),
          )
        })
      }

      // ── ambient (post-scene), created paused ────────────────────────────
      const breathe = gsap.to(q('.sc-wave'), {
        [ampAxis]: 1.06,
        transformOrigin: 'center center',
        duration: 2.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true,
      })
      // occasional single-spike flicker — a system still listening
      const flickPicks = q('.sc-spike').filter((_, i) => i % 7 === 3)
      const flick = gsap.timeline({ repeat: -1, repeatDelay: 1.1, paused: true })
      flickPicks.forEach((el, i) => {
        flick
          .to(el, { scaleY: 0.62, duration: 0.16, ease: 'power2.out' }, i * 1.7)
          .to(el, { scaleY: 0, duration: 0.6, ease: 'power2.in' }, i * 1.7 + 0.16)
      })

      // ── master timeline ─────────────────────────────────────────────────
      const CURVE_START = 2.4
      const CURVE_DUR = 0.85
      const ROW_GAP = 0.42
      const WAVE_AT = CURVE_START + CURVE_DUR - 0.15
      const END_AT = 5.0

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // establish: headline, labels, baselines
      tl.to(q('.sc__ink'), { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }, 0)
        .to(q('.sc__accent'), { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }, 0.16)
        .to(q('.sc-label--row'), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.35)
        .to(q('.sc-base'), { strokeDashoffset: 0, duration: 0.55, stagger: 0.07, ease: 'power2.out' }, 0.35)

      // scattered spikes grow in, then start crackling — restless, unresolved
      tl.to(q('.sc-spike'), { scaleY: 1, duration: 0.45, ease: 'power2.out', stagger: { each: 0.018, from: 'start' } }, 0.7)
      tl.call(() => crackleByRow.forEach((row) => row.forEach((t) => t.play())), undefined, 1.25)

      // CONVERGENCE — curves draw into the ring; the ring wakes as the first arrives
      tl.to(q('.sc-curve'), { strokeDashoffset: 0, duration: CURVE_DUR, stagger: ROW_GAP, ease: 'power2.inOut' }, CURVE_START)
      tl.to(q('.sc-ring1'), { autoAlpha: 1, scale: 1, duration: 0.5 }, CURVE_START + 0.4)
      tl.to(q('.sc-line1'), { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, WAVE_AT - 0.1)

      // SEESAW — each row damps to stillness as its curve lands; in exact
      // counterpoint the waveform blooms out of the ring, amplitude rising
      for (let r = 0; r < 4; r++) {
        const at = CURVE_START + CURVE_DUR + r * ROW_GAP - 0.15
        tl.call(() => crackleByRow[r].forEach((t) => t.kill()), undefined, at)
        tl.to(q(`.sc-spike[data-row="${r}"]`), { scaleY: 0, duration: 0.7, ease: 'power2.inOut', stagger: 0.015 }, at)
      }
      tl.to(bars, { [ampAxis]: 1, duration: 1.5, ease: 'power2.out', stagger: { each: 0.02, from: 'center' } }, WAVE_AT)

      // RESOLVE — the output line extends with momentum, endpoint lands, read arrives
      tl.to(q('.sc-line2'), { strokeDashoffset: 0, duration: 0.6, ease: 'expo.out' }, END_AT)
        .to(q('.sc-ring2'), { autoAlpha: 1, scale: 1, duration: 0.45 }, END_AT + 0.3)
        .to(q('.sc-label--intent'), { autoAlpha: 1, x: 0, duration: 0.5 }, END_AT + 0.45)
        // "RISING" lands with a one-step upward settle
        .from(q('.sc-rising'), { attr: { dy: 5 }, duration: 0.5, ease: 'power3.out' }, END_AT + 0.6)
        // mono sub-line fades in last
        .to(q('.sc-label--sub'), { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, END_AT + 0.9)

      // AMBIENT — waveform breathes very calmly; rows stay near-silent
      tl.call(() => breathe.play(), undefined, '>-0.2')
      tl.call(() => flick.play(), undefined, '>+0.3')
    },
    { scope, dependencies: [inView, wVert] },
  )

  return (
    <section
      ref={(node) => {
        ref.current = node
        scope.current = node
      }}
      className="sc"
      aria-labelledby="sc-title"
    >
      <div className="sc__container">
        <h2 id="sc-title" className="sc__headline">
          <span className="sc__ink">Scattered signals.</span>{' '}
          <span className="sc__accent">One direction.</span>
        </h2>

        <div className="sc__diagram">
          <svg
            className="sc__svg"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Four scattered signal sources — CRM, email, calls and pricing — converging into a single rising buyer-intent waveform."
            preserveAspectRatio="xMidYMid meet"
          >
            {/* ── rows: labels, baselines, graphite spikes, convergence curves ── */}
            {L.rows.map((y, r) => {
              const key = ROW_KEYS[r]
              const spikes = SPIKES[r]
              const x1 = L.baseX1 + 6
              const x2 = L.baseX2 - 12
              return (
                <g key={key}>
                  <text
                    className="sc-label sc-label--row"
                    x={L.labelX}
                    y={y + 4}
                    textAnchor={L.labelAnchor}
                    fontSize={L.labelSize}
                  >
                    {key}
                  </text>
                  <line className="sc-base" x1={L.baseX1} y1={y} x2={L.baseX2} y2={y} pathLength={1} />
                  {spikes.map((sp, i) => {
                    const x = x1 + sp.u * (x2 - x1)
                    const height = Math.max(1.2, sp.h * L.maxSpike)
                    // pivot at the baseline; rect drawn ABOVE local origin so gsap
                    // can scaleY around (0,0) with no baked translate to go wrong
                    return (
                      <g key={i} transform={`translate(${x} ${y})`}>
                        <rect
                          className="sc-spike"
                          data-row={r}
                          data-s={sp.s.toFixed(4)}
                          x={-0.9}
                          y={-height}
                          width={1.8}
                          height={height}
                          rx={0.9}
                        />
                      </g>
                    )
                  })}
                  <path className="sc-curve" d={L.curve(y)} pathLength={1} />
                </g>
              )
            })}

            {/* ── convergence ring node (centered at local origin) ──────── */}
            <g transform={`translate(${L.ring1[0]} ${L.ring1[1]})`}>
              <circle className="sc-ring1" cx={0} cy={0} r={6} />
            </g>

            {/* ── ring → waveform → endpoint ─────────────────────────────── */}
            <line
              className="sc-line"
              x1={L.line1[0]}
              y1={L.line1[1]}
              x2={L.line1[2]}
              y2={L.line1[3]}
              pathLength={1}
            />

            {/* waveform centered on the axis so both the group breathe and each
                bar's bloom scale around a local (0,0) origin — no baked translate.
                desktop: bars laid along X, axis is the Y center; mobile (vertical):
                bars laid along Y, axis is the X center. */}
            <g transform={`translate(${wVert ? wAxis : waveMid} ${wVert ? waveMid : wAxis})`}>
              <g className="sc-wave">
                {WAVE.map((bar, i) => {
                  const half = Math.max(0.7, bar.half * wHalf)
                  const pos = wa + bar.u * (wb - wa) - waveMid
                  const coords = wVert
                    ? { x: -half, y: -1, width: half * 2, height: 2 }
                    : { x: -1, y: -half, width: 2, height: half * 2 }
                  return (
                    <g key={i} transform={`translate(${wVert ? 0 : pos} ${wVert ? pos : 0})`}>
                      <rect className={barClass} rx={1} {...coords} />
                    </g>
                  )
                })}
              </g>
            </g>

            <line
              className="sc-line"
              x1={L.line2[0]}
              y1={L.line2[1]}
              x2={L.line2[2]}
              y2={L.line2[3]}
              pathLength={1}
            />

            <g transform={`translate(${L.ring2[0]} ${L.ring2[1]})`}>
              <circle className="sc-ring2" cx={0} cy={0} r={6} />
            </g>

            {/* ── endpoint label ────────────────────────────────────────── */}
            <text
              className="sc-label sc-label--intent"
              x={L.label.x}
              y={L.label.y}
              textAnchor={L.label.anchor}
              fontSize={L.label.size}
            >
              BUYER INTENT ·{' '}
              <tspan className="sc-rising">RISING</tspan>
            </text>
            <text
              className="sc-label sc-label--sub"
              x={L.label.x}
              y={L.label.subY}
              textAnchor={L.label.anchor}
              fontSize={L.label.subSize}
            >
              recommended · ask for the decision path
            </text>
          </svg>
        </div>
      </div>
    </section>
  )
}
