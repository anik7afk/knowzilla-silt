import { useEffect, useRef, useState } from 'react'
import './HeardVsUnderstood.css'

/* Heard vs Understood — a looping "recorded product moment" that stages the
   lag between raw hearing and contextual understanding, and its collapse.

   LEFT ("HEARD NOW"): the utterance transcribes live in gray as a colorless
   bar-waveform sweeps under a playhead and a mono counter ticks — capture,
   no meaning. RIGHT ("UNDERSTOOD IN CONTEXT"): dead silence, until ~1.5s
   later the same words resolve to ink, "predictability." draws its accent
   underline, three context columns enter one by one, and the verdict lands.
   The gap between the two sides is made legible by a mono telemetry readout
   pinned to the divider chevron that counts the lag up, then locks when
   understanding catches hearing.

   Architecture mirrors KineticConversation: a single rAF loop draws the
   waveform canvas and writes the two live readouts straight to the DOM;
   React setState fires only at scene boundaries (~10 renders / cycle); CSS
   scene classes + transitions carry every entrance; reduced motion paints
   the resolved end-state with no loop. */

const LEFT_WORDS = ['We', 'need', 'more', 'predictability.']
const REVEAL_T = [420, 900, 1360, 1980] // per-word "heard" times
const HEARD_COMPLETE_T = 2680 // left utterance fully transcribed
const UNDERSTAND_T = 3580 // 0.9s after hearing — 40% shorter context-match wait
const CTX_T = [3860, 4140, 4420] // three context columns, one by one
const RESOLUTION_T = 4960 // suggestion lands
const RESET_T = 8400
const CYCLE = 9800

/* the counter reads elapsed utterance time; base is set so it lands on the
   reference's 00:12.48 exactly when the left side finishes hearing */
const COUNTER_BASE = 12.48 - HEARD_COMPLETE_T / 1000
const LAG_LOCK = (UNDERSTAND_T - HEARD_COMPLETE_T) / 1000

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const hash = (v: number) => {
  const s = Math.sin(v) * 43758.5453
  return s - Math.floor(s)
}

function fmtCounter(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  const cs = Math.floor((sec * 100) % 100)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(m)}:${p(s)}.${p(cs)}`
}

/* Colorless bar-waveform. Two Path2Ds (swept vs pending), each well under the
   ~400-segment raster budget (~110 bars max). A playhead position gates which
   bars are "captured"; bars behind it flicker with live audio jitter. */
function drawWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cycleT: number,
  now: number,
  reduced: boolean,
  colors: { swept: string; pending: string },
) {
  ctx.clearRect(0, 0, w, h)
  if (w === 0 || h === 0) return
  const cy = h / 2
  const resetting = cycleT >= RESET_T
  const master = reduced
    ? 1
    : clamp01(cycleT / 320) *
      (resetting ? clamp01((CYCLE - cycleT) / 700) : 1)
  if (master <= 0) return

  const step = 5
  const bw = 2
  const count = Math.max(2, Math.floor(w / step))
  const progress = reduced ? 1 : clamp01(cycleT / HEARD_COMPLETE_T)

  const swept = new Path2D()
  const pending = new Path2D()
  for (let i = 0; i < count; i++) {
    const x = i * step + (step - bw) / 2
    const u = i / (count - 1)
    const envelope = 0.22 + 0.78 * Math.pow(Math.sin(Math.PI * u), 0.55)
    const grain = 0.28 + 0.72 * hash(i * 3.17 + 1.4)
    let amp = envelope * grain
    const past = u <= progress
    if (!reduced && past) {
      /* A slow phase travelling toward larger bar indices makes the voice
         read left → right. Random frame-to-frame jitter had no direction and
         could make the wave appear to flow backwards. */
      const phase = i * 0.42 - now / 560
      const carrier = (1 + Math.sin(phase)) / 2
      amp *= 0.5 + 0.5 * carrier * carrier
    }
    const half = Math.max(0.75, amp * (h * 0.44))
    const p = past ? swept : pending
    p.moveTo(x, cy - half)
    p.lineTo(x, cy + half)
  }

  ctx.lineWidth = bw
  ctx.lineCap = 'round'
  ctx.globalAlpha = master
  ctx.strokeStyle = colors.swept /* gray-600 — raw capture, no color */
  ctx.stroke(swept)
  ctx.globalAlpha = master * 0.4
  ctx.strokeStyle = colors.pending /* gray-400 — not yet heard */
  ctx.stroke(pending)
  ctx.globalAlpha = 1
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return reduced
}

function useVisible(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return visible
}

type Scene = {
  heard: number
  heardComplete: boolean
  understood: boolean
  ctx: number
  resolved: boolean
  live: boolean
}

const FINAL: Scene = {
  heard: LEFT_WORDS.length,
  heardComplete: true,
  understood: true,
  ctx: CTX_T.length,
  resolved: true,
  live: true,
}
const EMPTY: Scene = {
  heard: 0,
  heardComplete: false,
  understood: false,
  ctx: 0,
  resolved: false,
  live: false,
}

/* ─────────────────────────────────────────────────────────────────────────
   DOT HALO (task D3, 2026-07-26) — three modes, default OFF.

   The user asked for a dot halo around the resolved panel with one hard
   constraint: *"the dotts shouldnt cross the middle line that divides it
   into left and right."* That constraint is the section's whole argument —
   a field bleeding across the spine would say the two sides are the same.

   So the mask is STRUCTURAL, not a clip: the canvas is sized to the RIGHT
   HALF ONLY (`.hvu-f__halo` is absolutely positioned inside the resolved
   column and bleeds outward by `--hvu-halo-bleed`, which is smaller than
   the column's own inset from the spine). Nothing is drawn and then thrown
   away, and a future refactor of a mask cannot leak dots leftward, because
   there is no mask to refactor.

   The field itself: three CONTOUR RINGS offset 8 / 22 / 36px from the
   panel's rounded-rect outline, sampled at the page's 16px dot spacing
   (craft.tsx DotGrid), thinning outward 100% / 55% / 22%. Rings rather than
   a cropped lattice for a measured reason: the divider clearance caps the
   field at 37px, and a 16px lattice inside 37px yields only two rings whose
   offsets are `panel size mod 16` — so the halo was visibly denser on the
   left than the right and changed shape with the viewport. Rings are
   deterministic, mirror-symmetric, and use the same mark at the same spacing.

   Every DRAWN dot carries one constant alpha; the falloff is density, not
   opacity. That is deliberate — HVU's flow ground is surface-200, not
   white, and an alpha ramp would push most of the field under the
   perceptual floor. gray-500 @0.52 over the surface-200 ground composites
   to L≈211 against the ground's 250: ΔL ≈ 39, clear of the ≥30 requirement.
   Dot centres are snapped to half-pixels so the measured core matches that
   analytic value. See scripts/hvu-halo-verify.mjs.

   HALO IS NOT CHOSEN. `off` is the default and the landing page renders
   exactly as before (no canvas in the DOM, every new CSS rule scoped under
   `.hvu--halo*`). `added` and `as-beat` both exist for the owner to judge.
   ───────────────────────────────────────────────────────────────────────── */

export type HaloMode = 'off' | 'added' | 'as-beat'

const HALO_STEP = 16 /* dot spacing along a ring — the page's shared pitch */
const HALO_DOT_R = 1
const HALO_ALPHA = 0.52 /* gray-500 @0.52 over surface-200 → ΔL ≈ 39 */
/* ring offsets from the panel's outline, and how much of each ring survives.
   The outermost (36 + the dot's own 1px) must stay inside the canvas bleed
   (40px, set in the CSS) — that inequality is what keeps the field off the
   divider without a mask. */
const HALO_RINGS = [8, 22, 36] as const
const HALO_RING_DENSITY = [1, 0.55, 0.22] as const
const HALO_EXTENT = HALO_RINGS[HALO_RINGS.length - 1]
const HALO_LABEL_PAD = 8 /* the field yields to the column's label */
const HALO_BLOOM_MS = 620
/* Width of the bloom front, in units of extent. Wide enough (0.6 vs the
   0.39 spacing between ring offsets) that all three rings are ramping at
   once — a narrower band made the three rings light in sequence, which read
   as three flashes rather than one outward wash. */
const HALO_BAND = 0.6
const HALO_BUCKETS = 8 /* alpha quantisation for the moving front only */

/* Even-arc-length samples around a rounded rectangle, walked in one direction
   from the top-left of the top edge. Spacing is `total / round(total / step)`
   so the ring closes without a double dot at the seam. */
function ringSamples(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  step: number,
): Array<[number, number]> {
  const w = x1 - x0
  const h = y1 - y0
  if (w <= 0 || h <= 0) return []
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  const sw = w - 2 * rr
  const sh = h - 2 * rr
  const arc = (Math.PI / 2) * rr
  const segs: Array<{ len: number; at: (t: number) => [number, number] }> = [
    { len: sw, at: (t) => [x0 + rr + t, y0] },
    { len: arc, at: (t) => corner(x1 - rr, y0 + rr, rr, -Math.PI / 2 + t / rr) },
    { len: sh, at: (t) => [x1, y0 + rr + t] },
    { len: arc, at: (t) => corner(x1 - rr, y1 - rr, rr, t / rr) },
    { len: sw, at: (t) => [x1 - rr - t, y1] },
    { len: arc, at: (t) => corner(x0 + rr, y1 - rr, rr, Math.PI / 2 + t / rr) },
    { len: sh, at: (t) => [x0, y1 - rr - t] },
    { len: arc, at: (t) => corner(x0 + rr, y0 + rr, rr, Math.PI + t / rr) },
  ]
  const total = segs.reduce((n, s) => n + s.len, 0)
  const n = Math.max(4, Math.round(total / step))
  const pitch = total / n
  const out: Array<[number, number]> = []
  let seg = 0
  let base = 0
  for (let k = 0; k < n; k++) {
    const s = k * pitch
    while (seg < segs.length - 1 && s >= base + segs[seg].len) {
      base += segs[seg].len
      seg++
    }
    if (segs[seg].len <= 0) continue
    out.push(segs[seg].at(s - base))
  }
  return out
}

function corner(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

/* half-pixel snap: at dpr 1 a r=1 dot centred on an integer splits its
   coverage across four pixels (0.785 each) and the composited core lands at
   ΔL ≈ 31 — one point off the gate. On a half-pixel one whole pixel is
   covered, so the measured core matches the analytic value. */
const snapHalf = (v: number) => Math.floor(v) + 0.5

/* Review hook, NOT a product feature. The landing page and the /stage
   gallery both mount this component with no `halo` prop, so the only way a
   reviewer can see the two candidate modes is a harness override. An
   explicit prop always wins; the global is read once, at mount. */
declare global {
  interface Window {
    __KZ_HVU_HALO__?: HaloMode
  }
}
const HALO_MODES: readonly HaloMode[] = ['off', 'added', 'as-beat']
function haloOverride(): HaloMode | undefined {
  if (typeof window === 'undefined') return undefined
  const v = window.__KZ_HVU_HALO__
  return v && HALO_MODES.includes(v) ? v : undefined
}

export default function HeardVsUnderstood({
  variant = 'full',
  halo,
}: {
  variant?: 'full' | 'flow'
  /** dot halo behind the resolved panel. Default `off` — see the block above. */
  halo?: HaloMode
}) {
  /* the halo is a device of the FLOW panel; the full scene has no
     `.hvu-f__panel`, so /heard-vs-understood is untouched by it */
  return variant === 'flow' ? <FlowScene halo={halo} /> : <FullScene />
}

function FullScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const lagRef = useRef<HTMLSpanElement>(null)
  const sceneRef = useRef<Scene>(EMPTY)
  const sizeRef = useRef({ w: 0, h: 0 })
  const lastText = useRef({ counter: '', lag: '' })

  const visible = useVisible(sectionRef)
  const reduced = useReducedMotion()
  const [scene, setScene] = useState<Scene>(EMPTY)

  const writeCounter = (sec: number) => {
    const txt = fmtCounter(sec)
    if (txt !== lastText.current.counter && counterRef.current) {
      counterRef.current.textContent = txt
      lastText.current.counter = txt
    }
  }
  const writeLag = (sec: number) => {
    const txt = `${sec.toFixed(2)}s`
    if (txt !== lastText.current.lag && lagRef.current) {
      lagRef.current.textContent = txt
      lastText.current.lag = txt
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rootStyle = getComputedStyle(document.documentElement)
    const colors = {
      swept:
        rootStyle.getPropertyValue('--color-signal-600').trim() || '#266df0',
      pending: rootStyle.getPropertyValue('--color-gray-400').trim() || '#d7d6d4',
    }

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w: rect.width, h: rect.height }
    }

    const drawStatic = () =>
      drawWave(ctx, sizeRef.current.w, sizeRef.current.h, HEARD_COMPLETE_T, 0, true, colors)

    const observer = new ResizeObserver(() => {
      syncSize()
      if (reduced || !visible) drawStatic()
    })
    observer.observe(canvas)
    syncSize()

    if (reduced) {
      sceneRef.current = FINAL
      setScene(FINAL)
      writeCounter(12.48)
      writeLag(LAG_LOCK)
      drawStatic()
      return () => observer.disconnect()
    }

    if (!visible) {
      drawStatic()
      return () => observer.disconnect()
    }

    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const cycleT = (now - t0) % CYCLE
      const resetting = cycleT >= RESET_T
      const heard = resetting
        ? 0
        : REVEAL_T.reduce((n, t) => (cycleT >= t ? n + 1 : n), 0)
      const next: Scene = {
        heard,
        heardComplete: !resetting && cycleT >= HEARD_COMPLETE_T,
        understood: !resetting && cycleT >= UNDERSTAND_T,
        ctx: resetting ? 0 : CTX_T.reduce((n, t) => (cycleT >= t ? n + 1 : n), 0),
        resolved: !resetting && cycleT >= RESOLUTION_T,
        live: !resetting,
      }
      const prev = sceneRef.current
      if (
        prev.heard !== next.heard ||
        prev.heardComplete !== next.heardComplete ||
        prev.understood !== next.understood ||
        prev.ctx !== next.ctx ||
        prev.resolved !== next.resolved ||
        prev.live !== next.live
      ) {
        sceneRef.current = next
        setScene(next)
      }

      const heardT = Math.min(resetting ? 0 : cycleT, HEARD_COMPLETE_T)
      writeCounter(COUNTER_BASE + heardT / 1000)
      const lagT = clamp(cycleT, HEARD_COMPLETE_T, UNDERSTAND_T) - HEARD_COMPLETE_T
      writeLag(Math.max(0, lagT) / 1000)

      /* The voice remains alive for the whole visible scene. Text and context
         can cycle, but shared-tab audio never fades or resets underneath. */
      drawWave(
        ctx,
        sizeRef.current.w,
        sizeRef.current.h,
        HEARD_COMPLETE_T,
        now,
        false,
        colors,
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [visible, reduced])

  return (
    <section
      ref={sectionRef}
      className={`hvu hvu--full${visible ? ' is-visible' : ''}${
        scene.live ? ' is-live' : ''
      }${
        scene.heardComplete ? ' is-heardfull' : ''
      }${scene.understood ? ' is-understood' : ''}${
        scene.resolved ? ' is-resolved' : ''
      }`}
      aria-labelledby="hvu-title"
    >
      <div className="hvu__container">
        <div className="hvu__meta kz-enter">
          <span>ACME DISCOVERY24</span>
          <span className="hvu__dot" aria-hidden="true">
            ·
          </span>
          <span className="hvu__live">LIVE SESSION</span>
          <span className="hvu__dot" aria-hidden="true">
            ·
          </span>
          <span>SHARED TAB AUDIO</span>
        </div>

        <h2
          id="hvu-title"
          className="hvu__headline"
          aria-label="Hearing is not understanding."
        >
          {['Hearing', 'is', 'not', 'understanding.'].map((word, i) => (
            <span
              key={word}
              aria-hidden="true"
              className="hvu__headline-word"
              style={{ '--wi': i } as React.CSSProperties}
            >
              {word}
              {i < 3 ? ' ' : ''}
            </span>
          ))}
        </h2>
        <p
          className="hvu__sub kz-enter"
          style={{ '--enter-delay': '120ms' } as React.CSSProperties}
        >
          Knowzilla combines what was said with what the deal already knows.
        </p>

        <div className="hvu__body">
          {/* ── HEARD NOW ─────────────────────────────────────────── */}
          <div className="hvu__col hvu__col--heard">
            <p className="hvu__eyebrow">Heard from the shared tab</p>
            <p
              className={`hvu-sentence hvu-sentence--heard hvu-sentence--raw${
                scene.live ? ' is-on' : ''
              }`}
              aria-label={RAW_TEXT}
            >
              {RAW_WORDS.map((word, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="hvu-word"
                  style={{ '--wi': i } as React.CSSProperties}
                >
                  {word}
                  {i < RAW_WORDS.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
            <div className="hvu-wave" aria-hidden="true">
              <canvas ref={canvasRef} className="hvu-wave__canvas" />
            </div>
            <span hidden ref={counterRef} />
          </div>

          {/* ── divider + chevron + lag telemetry ─────────────────── */}
          <div className="hvu__divider" aria-hidden="true">
            <div className="hvu__chevron">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  style={{ stroke: 'var(--color-ink)' }}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="hvu-lag">
              <span className="hvu-lag__label">
                {scene.understood ? 'context matched' : 'matching context…'}
              </span>
              <span hidden ref={lagRef} />
            </div>
          </div>

          {/* ── UNDERSTOOD IN CONTEXT ─────────────────────────────── */}
          <div className="hvu__col hvu__col--understood">
            <p className="hvu__eyebrow hvu__eyebrow--accent">
              Understood with the deal room
            </p>
            <p
              className={`hvu-sentence hvu-sentence--understood${
                scene.understood ? ' is-on' : ''
              }`}
              aria-label="We need more predictability."
            >
              <span className="hvu-word" style={{ '--wi': 0 } as React.CSSProperties}>
                We{' '}
              </span>
              <span className="hvu-word" style={{ '--wi': 1 } as React.CSSProperties}>
                need{' '}
              </span>
              <span className="hvu-word" style={{ '--wi': 2 } as React.CSSProperties}>
                more{' '}
              </span>
              <span className="hvu-word hvu-word--key" style={{ '--wi': 3 } as React.CSSProperties}>
                predictability.
                <span className="hvu-underline" aria-hidden="true" />
              </span>
            </p>

            <div className="hvu-ctx" role="list">
              {F_CTX_ROWS.map((c, i) => (
                <div
                  key={c.k}
                  role="listitem"
                  className={`hvu-ctx__item${i < scene.ctx ? ' is-shown' : ''}`}
                >
                  <span className="hvu-ctx__key">{c.k}</span>
                  <span className="hvu-ctx__val">{c.v}</span>
                </div>
              ))}
            </div>

            <div
              className={`hvu-resolution${
                scene.resolved ? ' is-shown' : ''
              }`}
            >
              <div className="hvu-resolution__head">
                <span>Live suggestion</span>
                <span className="hvu-resolution__ask">Ask</span>
              </div>
              <strong>Clarify current decision process</strong>
              <p>What budget range have you allocated for this project?</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   FLOW VARIANT — the version the landing page uses.

   The frozen KineticConversation wave sits directly above this section, so
   the collision is resolved by DEVICE, not tint: no canvas, no waveform, no
   oscilloscope anywhere here. LEFT is what the machine literally hears — a
   run-on lowercase stream with fillers, a doubled word and one plausible
   mis-split ("predict ability"), set in mono. RIGHT is the same utterance
   after context lands, at reading scale (nothing over 48px — the
   giant-sentence idiom is spent by the neighbours). The divider's Δ-lag
   telemetry is the section's signature and stays.

   Motion is a BEAT, not an EVENT: one gesture, once, on viewport entry, then
   settled forever. No loop, no reset. The stream staggers purely in CSS
   (one class flip + per-word --wi delays — zero per-word React renders); a
   short rAF exists only to tick the Δ readout straight into the DOM and
   stops for good when the beat lands. Reduced motion paints the end state.
   ───────────────────────────────────────────────────────────────────────── */

const RAW_TEXT =
  'yeah so look we we need more predict ability going into next year i mean every line item is is getting reviewed right now honestly'
const RAW_WORDS = RAW_TEXT.split(' ')

const F_RAW_STEP = 55 // ms between heard words (CSS delay, mirrored here)
const F_RAW_START = 160
const F_RAW_DONE = F_RAW_START + (RAW_WORDS.length - 1) * F_RAW_STEP + 180
const F_UNDERSTAND = F_RAW_DONE + 1300 // the lag the telemetry counts
const F_CTX = F_UNDERSTAND + 280
const F_RESOLVED = F_CTX + 940
const F_END = F_RESOLVED + 560
const F_LAG_LOCK = (F_UNDERSTAND - F_RAW_DONE) / 1000

/* The rule under the head row is the section's progress readout, not a
   decoration: it advances with the beats, hesitates through the very lag
   it is measuring, and reaches the far edge exactly as the verdict lands.
   Anchors are the scene constants above, so the two can never drift. */
const F_RULE_STOPS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [F_RAW_DONE, 0.44], // the raw stream has all landed
  [F_UNDERSTAND, 0.58], // …then it crawls: this stretch IS the lag
  [F_RESOLVED, 0.88], // sentence resolved, context filled
  [F_END, 1], // the verdict has landed — full measure
]

function ruleProgress(t: number) {
  if (t <= 0) return 0
  for (let i = 1; i < F_RULE_STOPS.length; i++) {
    const [t1, p1] = F_RULE_STOPS[i]
    if (t < t1) {
      const [t0, p0] = F_RULE_STOPS[i - 1]
      return p0 + ((p1 - p0) * (t - t0)) / (t1 - t0)
    }
  }
  return 1
}

const F_CTX_ROWS = [
  { k: 'Deal room', v: 'Acme Discovery24' },
  { k: 'Open goal', v: 'Confirm budget range' },
  { k: 'Open item', v: 'Identify stakeholders' },
]

type FlowScene = {
  stream: boolean
  heardFull: boolean
  understood: boolean
  ctx: boolean
  resolved: boolean
}

const F_EMPTY: FlowScene = {
  stream: false,
  heardFull: false,
  understood: false,
  ctx: false,
  resolved: false,
}
const F_FINAL: FlowScene = {
  stream: true,
  heardFull: true,
  understood: true,
  ctx: true,
  resolved: true,
}

type HaloBox = { x0: number; y0: number; x1: number; y1: number }
type HaloGeo = {
  w: number
  h: number
  px0: number
  py0: number
  px1: number
  py1: number
  r: number
  /** boxes the field yields to — the column's label and the Δ-lag readout */
  avoid: HaloBox[]
}

function FlowScene({ halo }: { halo?: HaloMode }) {
  const sectionRef = useRef<HTMLElement>(null)
  const lagRef = useRef<HTMLSpanElement>(null)
  const ruleRef = useRef<HTMLSpanElement>(null)
  const sceneRef = useRef<FlowScene>(F_EMPTY)
  const doneRef = useRef(false)
  const elapsedRef = useRef(0)
  const lastLag = useRef('')
  const lastRule = useRef(0)

  const haloRef = useRef<HTMLCanvasElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  /** the halo painter, installed by the halo effect and called by the tick */
  const paintHalo = useRef<((bloom: number) => void) | null>(null)
  const bloomRef = useRef(-1)

  const visible = useVisible(sectionRef)
  const reduced = useReducedMotion()
  const [scene, setScene] = useState<FlowScene>(F_EMPTY)
  /* resolved once, at mount: an explicit prop wins, else the review hook,
     else off. Never re-read, so a mode can't change under a live scene. */
  const [haloMode] = useState<HaloMode>(() => halo ?? haloOverride() ?? 'off')

  /* (The session-14 desk-phase lock effect lived here while the flow variant
     painted its own copy of the dotted desk. The owner's 2026-07-29 second
     ruling put the section back on a plain white sheet — see
     HeardVsUnderstood.css §sheet — so there is no tile to phase-align and the
     effect is gone with it.) */

  /* ── the halo field ───────────────────────────────────────────────────
     Declared BEFORE the scene effect so `paintHalo` is installed before the
     tick can ask for a frame. Draws the whole field in at most 1 + 7 fills:
     one path for every dot at full alpha, and a handful of quantised paths
     for the dots the bloom front is currently crossing. At bloom = 1 every
     dot is in the full-alpha path by construction, so the settled field has
     exactly one alpha — which is what the luminance gate measures. */
  useEffect(() => {
    if (haloMode === 'off') return
    const canvas = haloRef.current
    const panel = panelRef.current
    if (!canvas || !panel) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /* one line, house pattern: the token is the source, the literal is only a
       fallback (scripts/session7-gates.mjs Gate 7 sanctions this shape) */
    const cs = getComputedStyle(canvas)
    const color = cs.getPropertyValue('--color-gray-500').trim() || '#afafaf'

    let geo: HaloGeo | null = null

    /* the label is a block `p`, so its own rect is the full column width — a
       Range over its contents gives the INK box, which is what the field
       should actually yield to. */
    const inkBox = (el: Element | null | undefined): DOMRect | null => {
      if (!el) return null
      const range = document.createRange()
      range.selectNodeContents(el)
      const r = range.getBoundingClientRect()
      range.detach()
      return r.width > 0 && r.height > 0 ? r : el.getBoundingClientRect()
    }

    const measure = () => {
      const cr = canvas.getBoundingClientRect()
      const pr = panel.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.round(cr.width * dpr))
      canvas.height = Math.max(1, Math.round(cr.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const radius =
        parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 12
      const pad = (r: DOMRect | null): HaloBox[] =>
        r
          ? [
              {
                x0: r.left - cr.left - HALO_LABEL_PAD,
                y0: r.top - cr.top - HALO_LABEL_PAD,
                x1: r.right - cr.left + HALO_LABEL_PAD,
                y1: r.bottom - cr.top + HALO_LABEL_PAD,
              },
            ]
          : []
      geo = {
        w: cr.width,
        h: cr.height,
        px0: pr.left - cr.left,
        py0: pr.top - cr.top,
        px1: pr.right - cr.left,
        py1: pr.bottom - cr.top,
        r: radius,
        /* the Δ-lag readout is centred on the divider but its nowrap box
           reaches ~10px into the canvas; the field yields rather than
           painting over the section's signature telemetry */
        avoid: [
          ...pad(inkBox(labelRef.current)),
          ...pad(lagRef.current?.closest('.hvu-lag')?.getBoundingClientRect() ?? null),
        ],
      }
    }

    const draw = (bloom: number) => {
      if (!geo) return
      const { w, h } = geo
      ctx.clearRect(0, 0, w, h)
      if (w <= 0 || h <= 0) return
      const front = bloom * (1 + HALO_BAND)
      if (front <= 0) return

      const full = new Path2D()
      const partial: Array<Path2D | null> = Array.from(
        { length: HALO_BUCKETS },
        () => null,
      )
      const addDot = (p: Path2D, x: number, y: number) => {
        p.moveTo(x + HALO_DOT_R, y)
        p.arc(x, y, HALO_DOT_R, 0, Math.PI * 2)
      }

      for (let ri = 0; ri < HALO_RINGS.length; ri++) {
        const off = HALO_RINGS[ri]
        /* the bloom front sweeps outward, so a ring's dots ramp to full alpha
           as it passes — nothing pops, and nothing can settle part-lit */
        const u = off / HALO_EXTENT
        const a = clamp01((front - u) / HALO_BAND)
        if (a <= 0) continue
        const bucket = a >= 1 ? -1 : Math.floor(a * HALO_BUCKETS)
        if (bucket === 0) continue
        const density = HALO_RING_DENSITY[ri]
        const pts = ringSamples(
          geo.px0 - off,
          geo.py0 - off,
          geo.px1 + off,
          geo.py1 + off,
          geo.r + off,
          HALO_STEP,
        )
        for (let si = 0; si < pts.length; si++) {
          /* stable per-dot draw/skip decision — never re-rolled, so the field
             is identical on every repaint and on every re-entry */
          if (density < 1 && hash(ri * 97.13 + si * 12.9898) >= density) continue
          const x = snapHalf(pts[si][0])
          const y = snapHalf(pts[si][1])
          if (x < 0 || x > w || y < 0 || y > h) continue
          if (
            geo.avoid.some(
              (b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1,
            )
          )
            continue
          addDot(bucket === -1 ? full : (partial[bucket] ??= new Path2D()), x, y)
        }
      }

      ctx.fillStyle = color
      ctx.globalAlpha = HALO_ALPHA
      ctx.fill(full)
      for (let k = 1; k < HALO_BUCKETS; k++) {
        const p = partial[k]
        if (!p) continue
        ctx.globalAlpha = HALO_ALPHA * ((k + 0.5) / HALO_BUCKETS)
        ctx.fill(p)
      }
      ctx.globalAlpha = 1
    }

    /* `added` is ambient texture: painted once, complete, forever. `as-beat`
       starts empty and is driven by the scene clock — except under reduced
       motion, where it is simply already there. */
    const settled = haloMode === 'added' || reduced
    paintHalo.current = draw
    bloomRef.current = settled ? 1 : 0

    const sync = () => {
      measure()
      draw(Math.max(0, bloomRef.current))
    }
    sync()

    const observer = new ResizeObserver(sync)
    observer.observe(canvas)
    observer.observe(panel)
    return () => {
      observer.disconnect()
      paintHalo.current = null
    }
  }, [haloMode, reduced])

  useEffect(() => {
    const writeLag = (sec: number) => {
      const txt = `${sec.toFixed(2)}s`
      if (txt !== lastLag.current && lagRef.current) {
        lagRef.current.textContent = txt
        lastLag.current = txt
      }
    }
    /* one transform on one element; monotonic by construction, so the rule
       can never walk backwards or re-run */
    const writeRule = (p: number) => {
      const v = Math.min(1, Math.max(lastRule.current, +p.toFixed(4)))
      if (v !== lastRule.current && ruleRef.current) {
        lastRule.current = v
        ruleRef.current.style.transform = `scaleX(${v})`
      }
    }
    /* `as-beat` only: the halo bloom IS the arrival gesture, so it is caused
       by the same clock as everything else and, like the rule, is monotonic
       — it can never walk backwards or replay on re-entry. */
    const writeBloom = (b: number) => {
      if (haloMode !== 'as-beat') return
      const v = Math.min(1, Math.max(bloomRef.current, +b.toFixed(3)))
      if (v !== bloomRef.current) {
        bloomRef.current = v
        paintHalo.current?.(v)
      }
    }

    if (reduced) {
      doneRef.current = true
      sceneRef.current = F_FINAL
      setScene(F_FINAL)
      writeLag(F_LAG_LOCK)
      writeRule(1)
      return
    }
    if (!visible || doneRef.current) return

    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      /* elapsed accumulates only while the section is on screen, so
         scrolling away pauses the beat and coming back resumes it — it
         never restarts (BEAT: once, then settled) */
      elapsedRef.current += Math.min(64, now - last)
      last = now
      const t = elapsedRef.current
      const next: FlowScene = {
        stream: true,
        heardFull: t >= F_RAW_DONE,
        understood: t >= F_UNDERSTAND,
        ctx: t >= F_CTX,
        resolved: t >= F_RESOLVED,
      }
      const prev = sceneRef.current
      if (
        prev.stream !== next.stream ||
        prev.heardFull !== next.heardFull ||
        prev.understood !== next.understood ||
        prev.ctx !== next.ctx ||
        prev.resolved !== next.resolved
      ) {
        sceneRef.current = next
        setScene(next)
      }

      writeLag(
        (clamp(t, F_RAW_DONE, F_UNDERSTAND) - F_RAW_DONE) / 1000,
      )
      writeRule(ruleProgress(t))
      writeBloom((t - F_UNDERSTAND) / HALO_BLOOM_MS)

      if (t >= F_END) {
        writeRule(1)
        writeBloom(1)
        doneRef.current = true // plays once — never resets, never loops
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible, reduced, haloMode])

  return (
    <section
      ref={sectionRef}
      className={`hvu hvu--flow hvu--press${visible ? ' is-visible' : ''}${
        scene.heardFull ? ' is-heardfull' : ''
      }${scene.understood ? ' is-understood' : ''}${scene.ctx ? ' is-contextual' : ''}${
        scene.resolved ? ' is-resolved' : ''
      }${
        haloMode === 'off'
          ? ''
          : haloMode === 'added'
            ? ' hvu--halo hvu--halo-added'
            : ' hvu--halo hvu--halo-beat'
      }`}
      aria-labelledby="hvu-title"
    >
      <div className="hvu__container">
        <header className="hvu-p__intro">
          <div className="kz-enter">
            <p className="hvu-p__eyebrow">From words to useful guidance</p>
            <h2 id="hvu-title" className="hvu-p__title">
              Hearing is not understanding.
            </h2>
          </div>
          <p
            className="hvu-p__sub kz-enter"
            style={{ '--enter-delay': '80ms' } as React.CSSProperties}
          >
            Knowzilla pairs the live call with the deal room, then turns both
            into the next useful question.
          </p>
        </header>

        <div className="hvu-p__machine">
          <div className="hvu-p__bar">
            <div className="hvu-p__status">
              <span className="hvu-p__live-dot" aria-hidden="true" />
              Shared tab audio
            </div>
            <span className="hvu-p__bar-sep" aria-hidden="true" />
            <span>Live session</span>
            <span className="hvu-p__progress" aria-hidden="true">
              <span ref={ruleRef} />
            </span>
          </div>

          <div className="hvu-p__stage">
            <div className="hvu-p__sources">
              <article
                className={`hvu-p__audio${scene.stream ? ' is-on' : ''}`}
              >
                <div className="hvu-p__card-head">
                  <span>Heard</span>
                  <span>Illustrative fragment</span>
                </div>
                <div className="hvu-p__audio-body">
                  <div className="hvu-p__wave" aria-hidden="true">
                    {[8, 15, 23, 12, 28, 18, 10, 24, 31, 16, 22, 9].map(
                      (height, i) => (
                        <span
                          key={i}
                          style={
                            {
                              '--h': `${height}px`,
                              '--i': i,
                            } as React.CSSProperties
                          }
                        />
                      ),
                    )}
                  </div>
                  <p aria-label={RAW_TEXT}>
                    {RAW_WORDS.map((word, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        className="hvu-p__raw-word"
                        style={{ '--wi': i } as React.CSSProperties}
                      >
                        {word}
                        {i < RAW_WORDS.length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
              </article>

              <article className="hvu-p__context">
                <div className="hvu-p__card-head">
                  <span>Deal room context</span>
                  <span>{scene.ctx ? 'Ready' : 'Matching…'}</span>
                </div>
                <div className="hvu-p__context-list" role="list">
                  {F_CTX_ROWS.map((item, i) => (
                    <div
                      key={item.k}
                      className="hvu-p__context-row"
                      role="listitem"
                      style={{ '--wi': i } as React.CSSProperties}
                    >
                      <span>{item.k}</span>
                      <strong>{item.v}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="hvu-p__transfer" aria-hidden="true">
              <span className="hvu-p__transfer-line" />
              <span className="hvu-p__transfer-node">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
                  <path
                    d="M5 3.5 9.5 8 5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <div className="hvu-p__result-wrap">
              {haloMode !== 'off' && (
                <canvas
                  ref={haloRef}
                  className="hvu-f__halo"
                  aria-hidden="true"
                />
              )}
              <p className="hvu-p__result-label" ref={labelRef}>
                Understood in context
              </p>
              <article className="hvu-p__result" ref={panelRef}>
                <div className="hvu-p__suggestion-head">
                  <span>Live suggestion</span>
                  <span className="hvu-p__ask">Ask</span>
                </div>
                <h3 aria-label="Clarify current decision process">
                  {['Clarify', 'current', 'decision', 'process'].map((word, i) => (
                    <span
                      key={word}
                      aria-hidden="true"
                      className="hvu-p__result-word"
                      style={{ '--wi': i } as React.CSSProperties}
                    >
                      {word}
                      {i < 3 ? ' ' : ''}
                    </span>
                  ))}
                </h3>
                <p className="hvu-p__rationale">
                  Understanding their current process reveals stakeholders and
                  pain points before detailing the solution.
                </p>
                <div className="hvu-p__next">
                  <span>Next step</span>
                  <p>What budget range have you allocated for this project?</p>
                  <svg
                    viewBox="0 0 16 16"
                    width="15"
                    height="15"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.5 8h9M9 4.5 12.5 8 9 11.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </article>
              <span hidden aria-hidden="true" ref={lagRef} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
