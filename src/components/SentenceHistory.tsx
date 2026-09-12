import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './SentenceHistory.css'

/* Sentence-on-a-timeline — a looping "recorded product moment": one buyer
   line transcribed live while the account's own history attaches itself to
   the speech in real time.

   A bar waveform reveals ink behind a lavender playhead and stays gray ahead
   of it; the sentence below karaoke-fills to exactly the same boundary; three
   history rows draw in as the playhead crosses their trigger words; an arrow
   then crosses the playhead into a black chip — "Pricing concern confirmed" —
   before the buyer has even said "on pricing".

   ARCHITECTURE (mirrors KineticConversation):
   • One rAF loop owns motion. It eases a single scalar `x` (the shared anchor,
     in stage px) toward the right edge of the last-spoken word, and each frame
     writes three consumers directly (NO React re-render): the playhead
     transform, the ink overlay's clip-path, and the canvas bar split. Those
     three literally read one number, so wave progress / sentence fill /
     playhead can never drift apart.
   • React state changes only at scene boundaries (~7 renders per 9.2s cycle),
     driving CSS classes for the rows / arrow / chip entrances.
   • Word right-edges + the sentence box are measured off real DOM rects after
     a poster-fit pass, so the anatomy stays aligned at any width.
   • prefers-reduced-motion → resolved end frame, no loop. */

type Word = { text: string; spoken: boolean }

/* The sentence. `spoken` words are the ones the playhead advances through and
   the ink fill reaches; the trailing gray words are never covered — the whole
   point is that the concern is confirmed before they're said. */
const WORDS: Word[] = [
  { text: 'We', spoken: true },
  { text: 'need', spoken: true },
  { text: 'more', spoken: true },
  { text: 'predictability', spoken: true },
  { text: 'on', spoken: false },
  { text: 'pricing.', spoken: false },
]
const LAST_SPOKEN = 3 // index the playhead parks at ("predictability")

type Row = { label: string; value: string }
const ROWS: Row[] = [
  { label: 'CRM', value: 'Renewal risk' },
  { label: 'Prior call', value: 'Budget pressure' },
  { label: 'Pricing history', value: '12% discount' },
]

/* timeline (ms) — playhead advances word by word, rows connect as it crosses,
   arrow + chip land while "on pricing" is still gray, then a long hold. */
const T_WORD = [900, 1450, 1950, 2450] // spoken index → time the playhead reaches its right edge
const T_ROW = [1550, 2050, 2650] // history row → connect time
const T_ARROW = 3350
const T_CHIP = 3600
const RESET_T = 8200
const CYCLE = 9200

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const hash = (v: number) => {
  const s = Math.sin(v) * 43758.5453
  return s - Math.floor(s)
}

/* ── waveform ─────────────────────────────────────────────────────────────
   Bars are cheap fillRects (no Path2D raster cliff). Heights are precomputed
   per width; only the ink/gray split and a faint breath move per frame. */
const PITCH = 7 // px between bar centers
const BAR_W = 2

/* canvas fillStyle needs a literal, and drawWave runs per frame — so the tokens
   are resolved ONCE here, not per draw. Same pattern as ObjectionAnatomy.tsx:37. */
function readColorToken(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const WAVE_SPOKEN = readColorToken('--color-ink', '#161514')
const WAVE_AHEAD = readColorToken('--color-gray-400', '#d7d6d4')

function buildBars(width: number, height: number): Float32Array {
  const n = Math.max(1, Math.floor(width / PITCH))
  const out = new Float32Array(n)
  const maxH = height * 0.92
  for (let i = 0; i < n; i++) {
    const u = i / n
    // gentle speech envelope: quieter at the very edges, busy through the body
    const envelope = 0.55 + 0.45 * Math.sin(Math.PI * clamp01((u - 0.02) / 0.96))
    const grain = hash(i * 12.9898) * 0.7 + hash(i * 3.71 + 9.2) * 0.3
    let amp = 0.14 + 0.86 * grain
    // occasional tall strokes, like consonant transients
    if (hash(i * 7.13 + 1.1) > 0.93) amp = Math.min(1, amp + 0.5)
    out[i] = Math.max(2, maxH * amp * envelope)
  }
  return out
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bars: Float32Array,
  splitX: number,
  master: number,
  breathe: number,
) {
  ctx.clearRect(0, 0, w, h)
  if (w === 0 || h === 0) return
  const cy = h / 2
  for (let i = 0; i < bars.length; i++) {
    const x = i * PITCH
    const bh = bars[i] * breathe * master
    ctx.fillStyle = x < splitX ? WAVE_SPOKEN : WAVE_AHEAD
    ctx.fillRect(x, cy - bh / 2, BAR_W, bh)
  }
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
      { threshold: 0.12 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return visible
}

type Scene = { spoken: number; rows: number; arrow: boolean; chip: boolean }
type Geom = { edges: number[]; sentLeft: number; sentWidth: number; parkX: number; narrow: boolean }

const REST_SCENE: Scene = { spoken: -1, rows: 0, arrow: false, chip: false }
const FINAL_SCENE: Scene = { spoken: LAST_SPOKEN, rows: ROWS.length, arrow: true, chip: true }

export default function SentenceHistory() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLSpanElement>(null)
  const baseRef = useRef<HTMLSpanElement>(null)
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([])

  const geomRef = useRef<Geom>({ edges: [], sentLeft: 0, sentWidth: 0, parkX: 0, narrow: false })
  const sizeRef = useRef({ w: 0, h: 0 })
  const barsRef = useRef<Float32Array>(new Float32Array(0))
  const xRef = useRef(0)
  const sceneRef = useRef<Scene>(REST_SCENE)

  const visible = useVisible(sectionRef)
  const reduced = useReducedMotion()
  const [scene, setScene] = useState<Scene>(REST_SCENE)

  /* target x for a given spoken index (in stage px). On narrow layouts the
     sentence wraps, so word edges are meaningless — the waveform split falls
     back to a spoken fraction across the canvas width. */
  const targetX = (spoken: number) => {
    const g = geomRef.current
    if (g.narrow) {
      const frac = (spoken + 1) / (LAST_SPOKEN + 1)
      return frac * sizeRef.current.w
    }
    if (spoken < 0) return g.sentLeft
    return g.edges[spoken] ?? g.parkX
  }

  const paintFrame = (x: number) => {
    const g = geomRef.current
    const ph = playheadRef.current
    const overlay = overlayRef.current
    if (ph) ph.style.transform = `translateX(${x}px)`
    if (overlay) {
      const fill = clamp01((x - g.sentLeft) / (g.sentWidth || 1)) * g.sentWidth
      overlay.style.clipPath = `inset(0 ${Math.max(0, g.sentWidth - fill)}px 0 0)`
    }
  }

  /* poster-fit + measure: scale the sentence to the stage width, then record
     each spoken word's right edge and the sentence box in stage coords. */
  useLayoutEffect(() => {
    const stage = stageRef.current
    const base = baseRef.current
    if (!stage || !base) return

    const measure = () => {
      const stageRect = stage.getBoundingClientRect()
      const words = wordRefs.current
      const edges: number[] = []
      for (let i = 0; i <= LAST_SPOKEN; i++) {
        const el = words[i]
        edges[i] = el ? el.getBoundingClientRect().right - stageRect.left : 0
      }
      const baseRect = base.getBoundingClientRect()
      const g: Geom = {
        edges,
        sentLeft: baseRect.left - stageRect.left,
        sentWidth: baseRect.width,
        parkX: edges[LAST_SPOKEN] ?? 0,
        narrow: stageRect.width < 720,
      }
      geomRef.current = g
      stage.style.setProperty('--park-x', `${g.parkX}px`)
      // repaint the current frame with fresh geometry
      xRef.current = targetX(sceneRef.current.spoken)
      paintFrame(xRef.current)
    }

    measure()
    document.fonts?.ready.then(measure).catch(() => {})
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* canvas + rAF loop */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w: rect.width, h: rect.height }
      barsRef.current = buildBars(rect.width, rect.height)
    }

    const drawStatic = () =>
      drawWave(ctx, sizeRef.current.w, sizeRef.current.h, barsRef.current, xRef.current, 1, 1)

    const observer = new ResizeObserver(() => {
      syncSize()
      if (reduced || !visible) drawStatic()
    })
    observer.observe(canvas)
    syncSize()

    if (reduced) {
      sceneRef.current = FINAL_SCENE
      setScene(FINAL_SCENE)
      xRef.current = targetX(LAST_SPOKEN)
      paintFrame(xRef.current)
      drawStatic()
      document.fonts?.ready.then(() => {
        xRef.current = targetX(LAST_SPOKEN)
        paintFrame(xRef.current)
        drawStatic()
      }).catch(() => {})
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

      let spoken = -1
      if (!resetting) {
        for (let i = 0; i <= LAST_SPOKEN; i++) if (cycleT >= T_WORD[i]) spoken = i
      }
      let rows = 0
      if (!resetting) for (let i = 0; i < ROWS.length; i++) if (cycleT >= T_ROW[i]) rows = i + 1
      const arrow = !resetting && cycleT >= T_ARROW
      const chip = !resetting && cycleT >= T_CHIP

      const prev = sceneRef.current
      if (
        prev.spoken !== spoken ||
        prev.rows !== rows ||
        prev.arrow !== arrow ||
        prev.chip !== chip
      ) {
        const next = { spoken, rows, arrow, chip }
        sceneRef.current = next
        setScene(next)
      }

      // ease the shared anchor toward the current word boundary
      const tx = targetX(spoken)
      xRef.current += (tx - xRef.current) * 0.14
      if (Math.abs(tx - xRef.current) < 0.3) xRef.current = tx
      paintFrame(xRef.current)

      // faint entrance/exit master + breath, like a live capture settling in
      const master = clamp01(cycleT / 420) * clamp01((CYCLE - cycleT) / 520)
      const breathe = 0.955 + 0.045 * Math.sin(now * 0.0021)
      drawWave(
        ctx,
        sizeRef.current.w,
        sizeRef.current.h,
        barsRef.current,
        xRef.current,
        master,
        breathe,
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
    <section ref={sectionRef} className="sh" aria-labelledby="sh-title">
      <div className="sh__head">
        <h2 id="sh-title" className="sh__title">
          Every sentence has history.
        </h2>
        <p className="sh__copy">
          Knowzilla connects what&rsquo;s said now to
          <br />
          everything the account already told you.
        </p>
        <p className="sh__meta" aria-hidden="true">
          <span className="sh__meta-live">LIVE</span>
          <span className="sh__meta-sep">·</span>NORTHWIND
          <span className="sh__meta-sep">·</span>09:16
        </p>
      </div>

      <div ref={stageRef} className="sh__stage">
        <canvas ref={canvasRef} className="sh__wave" aria-hidden="true" />

        <div
          ref={playheadRef}
          className={`sh-playhead${scene.spoken >= 0 ? ' is-live' : ''}`}
          aria-hidden="true"
        >
          <span className="sh-playhead__dot" />
        </div>

        <div className="sh__sentence" aria-label="Buyer, on a live call: We need more predictability on pricing.">
          <span className="sh-line sh-line--base" ref={baseRef} aria-hidden="true">
            {WORDS.map((w, i) => (
              <span
                key={i}
                className={`sh-line__word${w.spoken && i <= scene.spoken ? ' is-spoken' : ''}`}
                ref={(el) => {
                  wordRefs.current[i] = el
                }}
              >
                {w.text}
                {i < WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
          <span className="sh-line sh-line--ink" ref={overlayRef} aria-hidden="true">
            {WORDS.map((w, i) => (
              <span key={i} className="sh-line__word">
                {w.text}
                {i < WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
        </div>

        <div className="sh__rows" aria-hidden="true">
          {ROWS.map((row, i) => (
            <div key={i} className={`sh-row${scene.rows > i ? ' is-on' : ''}`}>
              <span className="sh-row__label">{row.label}</span>
              <span className="sh-row__line">
                <span className="sh-row__dot" />
              </span>
              <span className="sh-row__value">{row.value}</span>
            </div>
          ))}
        </div>

        <div
          className={`sh-verdict${scene.arrow ? ' is-arrow' : ''}${scene.chip ? ' is-chip' : ''}`}
          aria-hidden="true"
        >
          <span className="sh-verdict__line">
            <span className="sh-verdict__head" />
          </span>
          <span className="sh-verdict__chip">Pricing concern confirmed</span>
        </div>
      </div>
    </section>
  )
}
