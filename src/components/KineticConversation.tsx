import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './KineticConversation.css'

/* Kinetic conversation — the recorded-moment poster, staged on Natural's
   hero-scrub grammar (inspo/natural/DESIGN.md §hero: 48×48 textured square,
   position:sticky under the 80px nav, --progress custom property consumed in
   calc(), LINEAR growth, no lerp — the 1:1 native-scroll feel is load-bearing).

   Hybrid drive. The scroll owns the ENTRANCE over a ~260svh track:
     1. the card opens small-mid, "Knowzilla reads intent in real time"
        reading quietly at its centre
     2. one more scroll: the card reaches full size, the line docks to top
        centre and recedes further
   From there the performance is ARMED and plays on a real clock, by itself:
     3. the wave arrives; the buyer's words materialize letter-by-letter
        (smooth blur-ins only — no flicker, no steps)
     4. the spike erupts through the measured "reduce" glyphs
     5. the answer lands as the scene's one anchor: LIVE GUIDANCE over
        "Reframe around adoption speed" — two quiet lines, no punctuation
   Scrolling back below the hysteresis line hands the card straight back to
   the 1:1 scrub (donor reverse) while the content fades as one quick block;
   scrolling forward again replays the performance from zero. The wave's
   grain runs on real time either way.

   One rAF loop drives everything; React state changes only when a letter
   count or a beat threshold flips. */

type Word = { text: string; start: number; end: number; syllables: number }

/* HYBRID drive (user, 2026-07-25): the scroll owns only the ENTRANCE — card
   growth + the intro line docking. Once the card is full the performance is
   ARMED and the rest (wave, letters, spike, guidance) plays on a real clock,
   by itself, exactly once. Scrolling away pauses the clock; it resumes, never
   restarts, never reverses. */

/* scroll side */
const GROW_FLOOR = 0.42 // the card STARTS small-mid, line already reading
const P_FULL = 0.5 // scroll progress at which the card is full + docked
const P_EXIT = 0.42 // hysteresis: the scene disarms well BELOW the arm line —
// trackpad inertia / rubber-band jitter at exactly p=0.5 must not wipe a
// playing performance (a 25px dip used to fire the full staged exit)
const SHRINK_MS = 300 // card catch-down to the scrub curve on release

/* exit sequence (real ms after un-arming). The donor's reverse is the SAME
   1:1 scrub as its entrance — the card answers the scroll instantly and the
   content simply fades inside the shrinking box. So: the card is handed back
   to the scroll IMMEDIATELY, quote + guide leave as one quick block, the wave
   recedes just behind them. (The earlier 1300ms staged ladder held the box
   full while the user scrolled — read as a canned animation fighting the
   scroll; user, 2026-07-25.) */
const EXIT_WAVE_START = 100
const EXIT_WAVE_MS = 300
const EXIT_RESET = 340 // letters snap off behind the fully-faded block
const EXIT_DONE = 420 // exit cleared; the next entrance replays from zero

/* clock side (real ms after arming) */
const LINES: Word[][] = [
  [
    { text: 'We', start: 900, end: 1150, syllables: 1 },
    { text: 'need', start: 1250, end: 1500, syllables: 1 },
    { text: 'to', start: 1600, end: 1800, syllables: 1 },
  ],
  [
    { text: 'reduce', start: 2000, end: 2750, syllables: 2 },
    { text: 'spend', start: 3150, end: 3500, syllables: 1 },
  ],
  [
    { text: 'this', start: 3600, end: 3850, syllables: 1 },
    { text: 'quarter', start: 4000, end: 4600, syllables: 2 },
  ],
]
const WORDS = LINES.flat()
const HOT_WORD = 'reduce' // the word the system catches

/* per-letter reveal times: letters ink across their word's spoken window */
const LETTER_TIMES: number[] = []
for (const w of WORDS)
  for (let i = 0; i < w.text.length; i++)
    LETTER_TIMES.push(w.start + ((w.end - w.start) * i) / w.text.length)

const SPEECH_START = WORDS[0].start
const SPEECH_END = WORDS[WORDS.length - 1].end

/* clock beats. The PRICING CONCERN tick is GONE (its 1px stem read as a
   stray black line) — the wave spike stays as the caught moment, and the
   LIVE GUIDANCE stack at the bottom is the scene's one anchor. */
const WAVE_T = 0 // the wave arrives the moment the card is full
const SPIKE_T = 2450 // erupts while "reduce" is still inking
const GUIDE_T = 5300 // the answer: quiet two-line stack, no punctuation
const SETTLE_T = 6200 // clock cap — bounds the rewind, stops render scans
const STAGES = [GUIDE_T]

/* waveform tuning */
const UNIT = 42
const IDLE = 0.05
const ROOM = 0.13
const FLOOR = 0.3
const T_LEFT = -700 // call-time at the left canvas edge
const T_RIGHT = 5600

/* card geometry (the 48px seed lives in the CSS calc, donor-style) */
const NAV_H = 80 // sticky nav height — pin offset, same as the donor's
const NARROW = 768
const SIZE_MAX = 136 // serif line cap inside the card

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const hash = (v: number) => {
  const s = Math.sin(v) * 43758.5453
  return s - Math.floor(s)
}

function envAt(t: number) {
  let e = t > SPEECH_START - 250 && t < SPEECH_END + 250 ? FLOOR : ROOM
  for (const w of WORDS) {
    const pad = 90
    if (t < w.start - pad || t > w.end + pad) continue
    const u = clamp01((t - (w.start - pad)) / (w.end - w.start + pad * 2))
    const hump = Math.pow(Math.sin(Math.PI * u), 0.65)
    const syll = 0.78 + 0.22 * Math.sin(u * Math.PI * (w.syllables * 2 - 0.5))
    e = Math.max(e, (0.5 + 0.55 * hump) * syll)
  }
  return e
}

const ampScale = (w: number) => Math.min(1, Math.max(0.45, w / 1100))

function drawWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  now: number,
  spikeAt: number,
) {
  ctx.clearRect(0, 0, w, h)
  if (w === 0 || h === 0) return
  const unit = UNIT * ampScale(w)
  const cy = h / 2
  const spikeX = w * spikeAt
  const master = clamp01((t - WAVE_T) / 400)
  if (master === 0) return
  const breathe = 0.9 + 0.1 * Math.sin(now * 0.0019)
  const spikeU = clamp01((t - SPIKE_T) / 320)
  const spikeGrow = 1 - Math.pow(1 - spikeU, 3)

  /* granular flicker steps every ~95ms, interpolated so it reads as live
     audio jitter rather than strobing */
  const kf = now / 95
  const k0 = Math.floor(kf)
  const kMix = kf - k0

  /* raster budget: Chrome falls off a fast path when one Path2D carries
     ~500+ stroke segments (probe: 720 segs = 176ms, 360 segs = 2ms). So the
     halo is a single filled silhouette and the core strokes step every 4px. */
  const step = 2
  const count = Math.floor(w / step) + 1
  const amps = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const x = i * step
    const callT = T_LEFT + (x / w) * (T_RIGHT - T_LEFT)
    const gate = clamp01((t - callT) / 150)
    let env = IDLE + (envAt(callT) - IDLE) * gate
    if (spikeGrow > 0) {
      const dx = x - spikeX
      /* the primary peak has to out-reach the type it sits behind, or the
         section's one event is invisible */
      env +=
        spikeGrow *
        (6.2 * Math.exp(-(dx * dx) / 98) +
          2.8 * Math.exp(-((dx - 26) * (dx - 26)) / 48) +
          2.2 * Math.exp(-((dx + 21) * (dx + 21)) / 40))
    }
    const g0 = hash(i * 12.9898 + k0 * 78.233)
    const g1 = hash(i * 12.9898 + (k0 + 1) * 78.233)
    const grain = g0 + (g1 - g0) * kMix
    const swell = Math.abs(Math.sin(x * 0.043 + now * 0.0037))
    const n = 0.22 + 0.78 * (grain * 0.7 + swell * 0.3)
    amps[i] = Math.min(Math.max(0.8, unit * env * n * breathe), cy - 8)
  }

  const halo = new Path2D()
  halo.moveTo(0, cy - amps[0] * 1.3)
  for (let i = 1; i < count; i++) halo.lineTo(i * step, cy - amps[i] * 1.3)
  for (let i = count - 1; i >= 0; i--) halo.lineTo(i * step, cy + amps[i] * 1.3)
  halo.closePath()
  ctx.globalAlpha = master * 0.3
  ctx.fillStyle = '#9ea8f0' /* accent-400 */
  ctx.fill(halo)

  const core = new Path2D()
  for (let i = 0; i < count; i += 2) {
    const x = i * step + 0.5
    core.moveTo(x, cy - amps[i])
    core.lineTo(x, cy + amps[i])
  }
  ctx.globalAlpha = master
  ctx.strokeStyle = '#6a77e5' /* accent-600 */
  ctx.lineWidth = 1.25
  ctx.stroke(core)
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
      /* keep the loop warm a little beyond the track so the scrub never
         catches a cold frame */
      { rootMargin: '160px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return visible
}

type KineticConversationProps = {
  className?: string
}

export default function KineticConversation({ className = '' }: KineticConversationProps) {
  const trackRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const hotRef = useRef<HTMLSpanElement>(null)
  const lineRefs = useRef<Array<HTMLSpanElement | null>>([])
  const fitRefs = useRef<Array<HTMLSpanElement | null>>([])
  const sizeRef = useRef({ w: 0, h: 0 })
  const spikeAtRef = useRef(0.45)
  /* scroll progress + last-pushed values, so the loop writes only on change */
  const progressRef = useRef(0)
  const growRef = useRef(-1)
  const litRef = useRef(-1)
  const stageRef2 = useRef(-1)
  /* performance clock: accumulates only while armed (card full) and visible */
  const elapsedRef = useRef(0)
  /* the wave's own clock: follows t forward, driven down by the exit */
  const waveTRef = useRef(0)
  /* card-size floor: full until the exit sequence has finished */
  const holdRef = useRef(0)
  /* staged exit state — survives effect restarts */
  const exitRef = useRef({ active: false, t: 0, waveFrom: 0 })

  const visible = useVisible(trackRef)
  const reduced = useReducedMotion()
  const [lit, setLit] = useState(0) // letters revealed
  const [stage, setStage] = useState(0) // clock beats passed
  const [docked, setDocked] = useState(false) // scroll beat: intro at top
  const [exiting, setExiting] = useState(false) // staged reverse in progress

  /* geometry pass: size the card, justify the serif lines to the card column,
     anchor the spike + tick to the measured "reduce" glyphs, and precompute
     the intro line's centre→dock travel as a pure transform */
  useLayoutEffect(() => {
    const pin = pinRef.current
    const card = cardRef.current
    const inner = innerRef.current
    const intro = introRef.current
    if (!pin || !card || !inner || !intro) return

    const fit = () => {
      const pinRect = pin.getBoundingClientRect()
      const narrow = pinRect.width <= NARROW
      const cw = Math.min(1200, pinRect.width - (narrow ? 32 : 96))
      const ch = Math.min(640, pinRect.height - (narrow ? 64 : 96))
      card.style.setProperty('--cw', `${cw}px`)
      card.style.setProperty('--ch', `${ch}px`)

      /* poster justification inside the card column */
      const lines = lineRefs.current
      const fits = fitRefs.current
      const pad = narrow ? 24 : 64
      const target = cw - pad * 2
      lines.forEach((line) => {
        if (line) line.style.fontSize = '100px'
      })
      const widths = fits.map((f) => f?.getBoundingClientRect().width ?? 0)
      if (widths.some((w) => !w)) return
      const ideal = widths.map((w) => (100 * target) / w)
      /* one shared factor: the label band above + chip band below must fit */
      const room = ch - (narrow ? 150 : 210)
      const stack = ideal.reduce((a, b) => a + b, 0) * 1.04
      const k = Math.min(1, room / stack, SIZE_MAX / Math.max(...ideal))
      lines.forEach((line, i) => {
        if (line) line.style.fontSize = `${(ideal[i] * k).toFixed(2)}px`
      })

      /* spike anchored to the caught word (mid-growth the inner box is
         clipped, but rects still measure true because it has fixed size) */
      const hot = hotRef.current
      if (hot) {
        const innerRect = inner.getBoundingClientRect()
        const hotRect = hot.getBoundingClientRect()
        const x = hotRect.left + hotRect.width * 0.58 - innerRect.left
        spikeAtRef.current = Math.min(0.9, Math.max(0.1, x / cw))
      }

      /* intro travel: rest position is the dock (card top CENTRE); the opening
         state drops it to the card's optical centre — a pure vertical
         transform, so the dock is one axis of motion, quiet like the donor */
      const dockY = narrow ? 18 : 26
      intro.style.setProperty('--dock-y', `${dockY}px`)
      const dy = ch * 0.42 - dockY
      intro.style.setProperty('--i-dy', `${dy.toFixed(1)}px`)
    }

    fit()
    document.fonts?.ready.then(fit).catch(() => {})
    const observer = new ResizeObserver(fit)
    observer.observe(pin)
    window.addEventListener('resize', fit)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [])

  /* scrub + canvas loop */
  useEffect(() => {
    const track = trackRef.current
    const pin = pinRef.current
    const card = cardRef.current
    const canvas = canvasRef.current
    if (!track || !pin || !card || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let scrubDist = 1
    const measure = () => {
      scrubDist = Math.max(1, track.offsetHeight - pin.offsetHeight)
    }

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w: rect.width, h: rect.height }
    }

    const applyScroll = (_p: number, grow: number) => {
      if (Math.abs(grow - growRef.current) > 0.0005) {
        growRef.current = grow
        card.style.setProperty('--grow', grow.toFixed(4))
      }
    }
    /* donor-linear card growth, from the mid-grown floor */
    const scrollGrow = (p: number) =>
      GROW_FLOOR + (1 - GROW_FLOOR) * clamp01(p / P_FULL)

    const applyClock = (t: number, waveT: number, now: number) => {
      /* letters lit + beat stage — recomputed from t both ways, so the same
         scan plays the scene forward AND rewinds it */
      let count = 0
      while (count < LETTER_TIMES.length && LETTER_TIMES[count] <= t) count++
      if (count !== litRef.current) {
        litRef.current = count
        setLit(count)
      }
      let s = 0
      while (s < STAGES.length && STAGES[s] <= t) s++
      if (s !== stageRef2.current) {
        stageRef2.current = s
        setStage(s)
      }
      /* the canvas runs on the wave's clock, not the text's */
      drawWave(ctx, sizeRef.current.w, sizeRef.current.h, waveT, now, spikeAtRef.current)
    }

    const settle = () => {
      applyScroll(1, 1)
      setDocked(true)
      waveTRef.current = SETTLE_T
      applyClock(SETTLE_T, SETTLE_T, 1234)
    }

    const observer = new ResizeObserver(() => {
      measure()
      syncSize()
      /* repaint the current state, never fast-forward an unseen scene */
      if (reduced) settle()
      else if (!visible) {
        const p = progressRef.current
        applyScroll(p, Math.max(scrollGrow(p), holdRef.current))
        applyClock(elapsedRef.current, waveTRef.current, 1234)
      }
    })
    observer.observe(canvas)
    measure()
    syncSize()

    if (reduced) {
      /* donor pattern: no pin, no scrub — the finished composition, straight
         away (CSS switches the track/pin to normal flow) */
      setDocked(true)
      settle()
      document.fonts?.ready.then(settle).catch(() => {})
      return () => observer.disconnect()
    }

    if (!visible) return () => observer.disconnect()

    let raf = 0
    /* resume the performance clock where it stopped — never from zero */
    let origin: number | null = null
    let lastNow = 0
    const tick = (now: number) => {
      const dt = lastNow ? Math.min(50, now - lastNow) : 16.7
      lastNow = now
      /* progress from the live rect: sticking starts when the track top
         reaches the pin line (NAV_H) — robust to layout shifts above us */
      const top = track.getBoundingClientRect().top
      const p = clamp01((NAV_H - top) / scrubDist)
      progressRef.current = p

      /* armed: the clock runs, and the BACK HALF of the track also feeds it
         (quadratically) so a fast scroller can't blow past the pin before
         the performance has played — t reaches SETTLE exactly at release.
         Un-armed: the staged EXIT plays — the entrance mirrored. */
      const ex = exitRef.current
      /* armed at P_FULL; STAYS armed down to P_EXIT (hysteresis band) so
         boundary jitter can't flicker the scene. Once the exit has begun,
         only a real return to P_FULL re-arms. */
      const armed =
        p >= P_FULL || (p >= P_EXIT && elapsedRef.current > 0 && !ex.active)
      if (armed) {
        if (ex.active) {
          /* re-armed mid-exit: cancel; the scene resumes where it was */
          ex.active = false
          setExiting(false)
        }
        if (origin === null) origin = now - elapsedRef.current
        const u = clamp01((p - P_FULL) / (1 - P_FULL))
        const t2 = Math.min(
          Math.max(now - origin, SETTLE_T * u * u),
          SETTLE_T + 400,
        )
        elapsedRef.current = t2
        origin = now - t2
        /* wave follows the clock (catches up smoothly after a cancel) */
        waveTRef.current = Math.min(t2, waveTRef.current + dt * 10)
        holdRef.current = 1
        setDocked(true)
      } else {
        origin = null
        if (elapsedRef.current > 0 || ex.active) {
          if (!ex.active) {
            ex.active = true
            ex.t = 0
            ex.waveFrom = waveTRef.current
            setExiting(true) // quote + guide fade as one block, fast
          }
          ex.t += dt
          /* wave recedes just behind the fading text */
          const u = clamp01((ex.t - EXIT_WAVE_START) / EXIT_WAVE_MS)
          waveTRef.current = ex.waveFrom * Math.pow(1 - u, 3)
          /* letters reset while the block is still faded out — is-exiting
             disables their transition so they can't ghost the quote back */
          if (ex.t >= EXIT_RESET) elapsedRef.current = 0
          if (ex.t >= EXIT_DONE) {
            waveTRef.current = 0
            ex.active = false
            setExiting(false)
          }
        }
        /* the card belongs to the scroll again IMMEDIATELY (donor reverse is
           a 1:1 scrub) — hold only bounds the first ~300ms so a fast flick
           can't snap the box; the intro starts its travel back at once */
        setDocked(false)
        holdRef.current = Math.max(0, holdRef.current - dt / SHRINK_MS)
      }

      applyScroll(p, Math.max(scrollGrow(p), holdRef.current))
      applyClock(elapsedRef.current, waveTRef.current, now)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      observer.disconnect()
    }
  }, [visible, reduced])

  const guideOn = stage >= 1 && !exiting

  let letterIndex = -1

  return (
    <section ref={trackRef} className={`kinetic ${className}`.trim()}>
      <div ref={pinRef} className="kinetic__pin">
        <div ref={cardRef} className="kinetic-card">
          <div ref={innerRef} className="kinetic-card__inner">
            <span
              ref={introRef}
              className={`kinetic-intro${docked ? ' is-docked' : ''}`}
            >
              Knowzilla reads intent in real time
            </span>

            <canvas ref={canvasRef} className="kinetic__wave" aria-hidden="true" />

            <p ref={quoteRef} className={`kinetic-quote${exiting ? ' is-exiting' : ''}`}>
              {LINES.map((line, li) => (
                <span
                  key={li}
                  className="kinetic-quote__line"
                  ref={(el) => {
                    lineRefs.current[li] = el
                  }}
                >
                  <span
                    className="kinetic-quote__fit"
                    ref={(el) => {
                      fitRefs.current[li] = el
                    }}
                  >
                    {li === 0 && (
                      <span
                        className={`kinetic-quote__mark kinetic-quote__mark--open${lit > 0 ? ' is-on' : ''}`}
                        aria-hidden="true"
                      >
                        “
                      </span>
                    )}
                    {line.map((word, wi) => {
                      const hot = word.text === HOT_WORD
                      return (
                        <span
                          key={word.text}
                          ref={hot ? hotRef : undefined}
                          className="kinetic-quote__word"
                        >
                          {word.text.split('').map((ch) => {
                            letterIndex += 1
                            const idx = letterIndex
                            return (
                              <span
                                key={idx}
                                className={`kinetic-quote__letter${idx < lit ? ' is-on' : ''}`}
                              >
                                {ch}
                              </span>
                            )
                          })}
                          {wi < line.length - 1 ? ' ' : ''}
                        </span>
                      )
                    })}
                    {li === LINES.length - 1 && (
                      <span
                        className={`kinetic-quote__mark kinetic-quote__mark--close${lit >= LETTER_TIMES.length ? ' is-on' : ''}`}
                        aria-hidden="true"
                      >
                        ”
                      </span>
                    )}
                  </span>
                </span>
              ))}
            </p>

            <div
              className={`kinetic-guide${guideOn ? ' is-on' : ''}${exiting ? ' is-exiting' : ''}`}
              aria-hidden={!guideOn}
            >
              <span className="kinetic-guide__eyebrow">LIVE GUIDANCE</span>
              <span className="kinetic-guide__text">Reframe around adoption speed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
