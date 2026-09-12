import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './HvuGlass.css'

/* iOS-glass Heard vs Understood scene.
   - variant="standalone" (default): the audition, /hvu-glass or /stage?c=hvu-glass.
   - variant="flow": the landing page's HVU section (App.tsx `.planes__over`),
     section box re-measured for the page — see HvuGlass.css §FLOW VARIANT.
   Does NOT touch HeardVsUnderstood, which still serves its own routes. */

const LEFT_WORDS = ['We', 'need', 'more', 'predictability']
const REVEAL_T = [420, 900, 1360, 1788]
/* The raw sentence's final word starts at 100ms + (26 × 38ms), then settles
   over 700ms: 1,788ms total. Hold the completed left side for exactly 500ms
   before handing off to the arrow and the understood side. */
const HEARD_COMPLETE_T = 1788
const UNDERSTAND_T = HEARD_COMPLETE_T + 500
const CTX_T = [UNDERSTAND_T + 280, UNDERSTAND_T + 560, UNDERSTAND_T + 840]
const RESOLUTION_T = UNDERSTAND_T + 1380
/* THE SCENE PLAYS ONCE, THE WEAVE KEEPS RUNNING (owner, 2026-07-29: "it
   shouldnt loop after its done animating, its done, the component shouldnt be
   looping back again" — then, on the same review: "the sound wave should be
   looping though"). So the two clocks are split:
   - the SCENE clock is clamped at END_T (the verdict's 560ms entrance plus a
     beat of settle). The old RESET_T / CYCLE pair that rewound everything every
     9.8s is gone: nothing re-hears, re-matches or re-resolves.
   - the WEAVE is driven by `now`, not by the scene clock, so its carrier goes on
     breathing after the scene has settled — the section is a live session that
     has already been read, not a loop. */
const END_T = RESOLUTION_T + 1200

const COUNTER_BASE = 12.48 - HEARD_COMPLETE_T / 1000
const RAW_TEXT =
  'mm yeah so look uh we we need more predict ability going into next year i mean every line item is is getting reviewed right now honestly'
const RAW_WORDS = RAW_TEXT.split(' ')

const CTX_ROWS = [
  { k: 'Deal room', v: 'Acme Discovery24' },
  { k: 'Open goal', v: 'Confirm budget range' },
  { k: 'Open item', v: 'Identify stakeholders' },
]

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
  /* no rewind term any more — the scene never resets (see END_T) */
  const master = reduced ? 1 : clamp01(cycleT / 320)
  if (master <= 0) return

  const step = 6
  const bw = 2.5
  const count = Math.max(2, Math.floor(w / step))
  const progress = reduced ? 1 : clamp01(cycleT / HEARD_COMPLETE_T)

  const swept = new Path2D()
  const pending = new Path2D()
  for (let i = 0; i < count; i++) {
    const x = i * step + (step - bw) / 2
    const u = i / (count - 1)
    const envelope = 0.18 + 0.82 * Math.pow(Math.sin(Math.PI * u), 0.45)
    const grain = 0.28 + 0.72 * hash(i * 3.17 + 1.4)
    let amp = envelope * grain
    const past = u <= progress
    if (!reduced && past) {
      const phase = i * 0.42 - now / 560
      const carrier = (1 + Math.sin(phase)) / 2
      amp *= 0.5 + 0.5 * carrier * carrier
    }
    /* Tall bed weave — fills most of the stage height behind the glass */
    const half = Math.max(1.2, amp * (h * 0.48))
    const p = past ? swept : pending
    p.moveTo(x, cy - half)
    p.lineTo(x, cy + half)
  }

  ctx.lineWidth = bw
  ctx.lineCap = 'round'
  ctx.globalAlpha = master
  ctx.strokeStyle = colors.swept
  ctx.stroke(swept)
  ctx.globalAlpha = master * 0.4
  ctx.strokeStyle = colors.pending
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

/* LATCHED (owner, 2026-07-29: "its done, the component shouldnt be looping back
   again"). It used to report live intersection, so scrolling away and back
   un-set `is-visible` — the head faded out, the clock restarted from zero and
   the whole scene replayed. It now flips true on the first entry and stays
   there: the observer disconnects itself, the scene plays exactly once per page
   load, and a second look shows it settled rather than re-running. */
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
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
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

export default function HvuGlass({
  variant = 'standalone',
}: {
  variant?: 'standalone' | 'flow'
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const sceneRef = useRef<Scene>(EMPTY)
  const sizeRef = useRef({ w: 0, h: 0 })
  const lastCounter = useRef('')
  /* live intersection, in a REF not state: the weave loop runs for as long as the
     page lives, so it skips its canvas work while the section is off-screen. It
     cannot read `visible` for this — that one is latched true forever by design
     (see useVisible), which is what stops the SCENE from replaying. */
  const onScreenRef = useRef(true)

  const visible = useVisible(sectionRef)
  const reduced = useReducedMotion()
  const [scene, setScene] = useState<Scene>(EMPTY)

  const writeCounter = (sec: number) => {
    const txt = fmtCounter(sec)
    if (txt !== lastCounter.current && counterRef.current) {
      counterRef.current.textContent = txt
      lastCounter.current = txt
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
      drawStatic()
      return () => observer.disconnect()
    }

    if (!visible) {
      drawStatic()
      return () => observer.disconnect()
    }

    /* pauses the weave's canvas work while the section is off-screen (the loop
       itself never stops — see the tick) */
    const onScreen = new IntersectionObserver(
      ([entry]) => {
        onScreenRef.current = entry.isIntersecting
      },
      { rootMargin: '120px' },
    )
    const section = sectionRef.current
    if (section) onScreen.observe(section)

    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      /* SCENE clock: one pass, clamped — no modulo, so nothing wraps to zero */
      const cycleT = Math.min(now - t0, END_T)
      const next: Scene = {
        heard: REVEAL_T.reduce((n, t) => (cycleT >= t ? n + 1 : n), 0),
        heardComplete: cycleT >= HEARD_COMPLETE_T,
        understood: cycleT >= UNDERSTAND_T,
        ctx: CTX_T.reduce((n, t) => (cycleT >= t ? n + 1 : n), 0),
        resolved: cycleT >= RESOLUTION_T,
        live: true,
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

      const heardT = Math.min(cycleT, HEARD_COMPLETE_T)
      writeCounter(COUNTER_BASE + heardT / 1000)
      /* WEAVE clock: `now`, not the clamped scene clock, so the carrier keeps
         breathing after the scene has settled — "the sound wave should be
         looping though" (owner). The loop is therefore never torn down; it just
         skips the paint while nobody can see it. */
      if (onScreenRef.current) {
        drawWave(
          ctx,
          sizeRef.current.w,
          sizeRef.current.h,
          HEARD_COMPLETE_T,
          now,
          false,
          colors,
        )
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      onScreen.disconnect()
    }
  }, [visible, reduced])

  return (
    <section
      ref={sectionRef}
      className={`hvug${variant === 'flow' ? ' hvug--flow' : ''}${
        visible ? ' is-visible' : ''
      }${
        scene.live ? ' is-live' : ''
      }${
        scene.heardComplete ? ' is-heardfull' : ''
      }${scene.understood ? ' is-understood' : ''}${
        scene.resolved ? ' is-resolved' : ''
      }`}
      aria-labelledby="hvug-title"
    >
      <div className="hvug__container">
        {/* the ACME DISCOVERY24 · LIVE SESSION · SHARED TAB AUDIO meta row and
          * its hairline were cut by the owner (2026-07-29): the plate below
          * already says it is a live shared-tab session, so the row was the
          * caption to a picture that captions itself. */}
        <div className="hvug__head">
        <h2
          id="hvug-title"
          className="hvug__headline"
          aria-label="Hearing is not understanding"
        >
          {/* no full stop, here or on the card's resolved line (owner, 2026-07-29) */}
          {['Hearing', 'is', 'not', 'understanding'].map((word, i) => (
            <span
              key={word}
              aria-hidden="true"
              className="hvug__headline-word"
              style={{ '--wi': i } as CSSProperties}
            >
              {word}
              {i < 3 ? ' ' : ''}
            </span>
          ))}
        </h2>
        <p
          className="hvug__sub"
          style={{ '--enter-delay': '120ms' } as CSSProperties}
        >
          Knowzilla combines what was said with what the deal already knows.
        </p>
        </div>

        <div className="hvug__stage">
          <div className="hvug-wave hvug-wave--bed" aria-hidden="true">
            <canvas ref={canvasRef} className="hvug-wave__canvas" />
          </div>

          <div className="hvug__glass">
          <div className="hvug__col hvug__col--heard">
            <p className="hvug__eyebrow">Heard from the shared tab</p>
            <p
              className={`hvug-sentence hvug-sentence--raw${
                scene.live ? ' is-on' : ''
              }`}
              aria-label={RAW_TEXT}
            >
              {RAW_WORDS.map((word, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="hvug-word"
                  style={{ '--wi': i } as CSSProperties}
                >
                  {word}
                  {i < RAW_WORDS.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
            <span hidden ref={counterRef} />
          </div>

          <div className="hvug__divider" aria-hidden="true">
            <div className="hvug__chevron">
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
          </div>

          <div className="hvug__col hvug__col--understood">
            <p className="hvug__eyebrow">Understood with the deal room</p>
            <p
              className={`hvug-sentence hvug-sentence--understood${
                scene.understood ? ' is-on' : ''
              }`}
              aria-label="We need more predictability"
            >
              <span className="hvug-word" style={{ '--wi': 0 } as CSSProperties}>
                We{' '}
              </span>
              <span className="hvug-word" style={{ '--wi': 1 } as CSSProperties}>
                need{' '}
              </span>
              <span className="hvug-word" style={{ '--wi': 2 } as CSSProperties}>
                more{' '}
              </span>
              <span
                className="hvug-word hvug-word--key"
                style={{ '--wi': 3 } as CSSProperties}
              >
                predictability
                <span className="hvug-underline" aria-hidden="true" />
              </span>
            </p>

            <div className="hvug-ctx" role="list">
              {CTX_ROWS.map((c, i) => (
                <div
                  key={c.k}
                  role="listitem"
                  className={`hvug-ctx__item${i < scene.ctx ? ' is-shown' : ''}`}
                >
                  <span className="hvug-ctx__key">{c.k}</span>
                  <span className="hvug-ctx__val">{c.v}</span>
                </div>
              ))}
            </div>

            <div
              className={`hvug-resolution${scene.resolved ? ' is-shown' : ''}`}
            >
              <div className="hvug-resolution__head">
                <span>Live suggestion</span>
                <span className="hvug-resolution__ask">Ask</span>
              </div>
              <strong>Clarify current decision process</strong>
              <p>What budget range have you allocated for this project?</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
