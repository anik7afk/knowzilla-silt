/* ---------------------------------------------------------------------------
 * §03 Animation system — the motion the finished page actually runs.
 *
 * SOURCE OF TRUTH. Every value on this page was read out of the shipped landing
 * flow (`src/components/**`, `src/index.css`) — not out of the pre-build motion
 * spec. `animation-system/showcase.html` supplied the FORMAT (replay tiles,
 * easing plots, a duration ladder) and none of the numbers; where it disagrees
 * with the code, the code wins and the code is cited.
 *
 * Two deliberate exclusions, both to avoid documenting motion no visitor can
 * trigger:
 *   · `src/index.css:199-334` still defines `.kz-graphic`, `.kz-bar`,
 *     `.kz-tab-panel`, `.tour-panel`, `.hero-frame` and `.dealmap-*`. They are
 *     UNREFERENCED by the current flow — the retired H3 hero and the retired
 *     tour. They are not presented here as grammar.
 *   · The HVU slot in the flow is `HvuGlass variant="flow"` (`src/App.tsx:328`).
 *     `HeardVsUnderstood`'s timings belong to a standalone route and are not
 *     quoted as page values.
 *
 * NO REAL COMPONENTS ARE IMPORTED. Each specimen is rebuilt from primitives with
 * the real durations and beziers as literals, so a tile can never drift from
 * what it claims while still being watchable in isolation. Measured curves stay
 * component-scoped literals by standing rule (CLAUDE.md §8) — see the header of
 * `AnimationSystemChapter.css`.
 *
 * PER-FRAME WORK NEVER ENTERS REACT: the rAF specimen writes to DOM refs,
 * matching the page's own rule that nothing re-renders per frame.
 * ------------------------------------------------------------------------- */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './AnimationSystemChapter.css'

/* Custom properties in inline styles — one cast, in one place. */
const vars = (o: Record<string, string | number>) => o as CSSProperties

/* --------------------------------------------------------------- primitives */

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  return reduced
}

/* Bezier plot. One unit box, one scale for every curve on the page, so the
 * shapes are comparable at a glance. Control points with y outside [0,1] draw
 * outside the box on purpose (see the .css note). */
function BezierPlot({ p }: { p: [number, number, number, number] }) {
  const [x1, y1, x2, y2] = p
  const S = 100
  const cx1 = x1 * S
  const cy1 = S - y1 * S
  const cx2 = x2 * S
  const cy2 = S - y2 * S

  return (
    <svg
      className="pch-anim-curve__svg"
      viewBox={`0 0 ${S} ${S}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* unit box + midlines */}
      <rect className="pch-anim-curve__grid" x="0" y="0" width={S} height={S} fill="none" />
      <line className="pch-anim-curve__grid" x1="0" y1={S / 2} x2={S} y2={S / 2} opacity="0.6" />
      <line className="pch-anim-curve__grid" x1={S / 2} y1="0" x2={S / 2} y2={S} opacity="0.6" />
      {/* linear reference */}
      <line className="pch-anim-curve__linear" x1="0" y1={S} x2={S} y2="0" />
      {/* control handles */}
      <line className="pch-anim-curve__handle" x1="0" y1={S} x2={cx1} y2={cy1} />
      <line className="pch-anim-curve__handle" x1={S} y1="0" x2={cx2} y2={cy2} />
      {/* the curve */}
      <path
        className="pch-anim-curve__path"
        d={`M 0 ${S} C ${cx1} ${cy1} ${cx2} ${cy2} ${S} 0`}
      />
      <circle className="pch-anim-curve__pt" cx={cx1} cy={cy1} r="3" />
      <circle className="pch-anim-curve__pt" cx={cx2} cy={cy2} r="3" />
    </svg>
  )
}

type Curve = {
  p: [number, number, number, number]
  name: string
  token?: string
  where: string
}

/* Every distinct bezier the shipped flow runs. Order: the two tokens first,
 * then the measured/fitted literals, then the single-purpose ones. */
const CURVES: Curve[] = [
  {
    p: [0.33, 1, 0.68, 1],
    name: 'Entrance',
    token: '--ease-entrance',
    where:
      'The house curve. .kz-enter, all eight pc-kf-* beats, .af-in / .af-card, tm-enter, stack-sweep. index.css:140',
  },
  {
    p: [0.2, 0, 0, 1],
    name: 'Hover out',
    token: '--ease-hover-out',
    where:
      'Both legs of every .kz-hover — the asymmetry is duration-only, not two curves. index.css:141',
  },
  {
    p: [0.22, 1, 0.36, 1],
    name: 'Scene',
    where:
      'The only curve inside the kinetic scene and Heard vs understood (--hvug-enter), plus the Stats chart clip. KineticConversation.css:115 · HvuGlass.css:6 · Stats.css:18',
  },
  {
    p: [0, 0, 0.58, 1],
    name: 'Hero frame · measured',
    where:
      'Traced frame by frame off a rendered page. Peak scale 0.999972 — a long ease-out, not a spring. Hero.css:230',
  },
  {
    p: [0.2, 0.1, 0.1, 0.92],
    name: 'Step-back · fitted ~',
    where:
      'Fitted to the donor trace at 0.013 rms; plain ease-out fits 8× worse (0.102). Hero.css:165',
  },
  {
    p: [0, 0, 0, 1],
    name: 'Instant out',
    where:
      'Leaves at once, arrives slowly — rail label colour and rail description. PlatformChapters.css:486, 507',
  },
  {
    p: [0.45, 0, 0.15, 1],
    name: 'Pointer travel',
    where:
      'Ease-in-out, because a simulated cursor has to accelerate away and decelerate in. mock/AppFrame.css:238',
  },
  {
    p: [0.34, 1.4, 0.64, 1],
    name: 'Overshoot',
    where: 'The only overshoot on the page: one pill in chapter 4, 300ms. chapters/IntelDetail.tsx:113',
  },
]

/* ------------------------------------------------------------------- tiles */

function Tile({
  name,
  tier,
  sub,
  spec,
  action,
  knob,
  children,
}: {
  name: string
  tier: string
  sub: string
  spec: ReactNode
  action: ReactNode
  knob?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="pch-anim-tile">
      <div className="pch-anim-tile__head">
        <div className="pch-anim-tile__nm">{name}</div>
        <div className="pch-anim-tile__tier">{tier}</div>
      </div>
      <p className="pch-anim-tile__sub">{sub}</p>
      <div className="pch-anim-stage">{children}</div>
      {knob}
      <div className="pch-anim-tile__foot">
        <div className="pch-anim-spec">{spec}</div>
        {action}
      </div>
    </div>
  )
}

/* A replay that remounts its specimen. Remounting is what makes a CSS animation
 * run again — restarting by class toggle needs a forced reflow and silently
 * fails when the browser batches. Under reduced motion the specimen still
 * remounts, but the stylesheet has swapped every animation for a 200ms opacity
 * fade, so "replay" is a crossfade and nothing travels. */
function useReplay(): [number, () => void] {
  const [run, setRun] = useState(0)
  return [run, useCallback(() => setRun((r) => r + 1), [])]
}

function ReplayButton({ onClick, label = 'Replay' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="pch-anim-replay" onClick={onClick}>
      {label}
    </button>
  )
}

/* 1 — the house entrance ---------------------------------------------------- */

function EnterTile() {
  const [run, replay] = useReplay()

  return (
    <Tile
      name="Section entrance"
      tier="quiet"
      sub="One recipe for the whole page: fade, 12px lift, 1.5px de-blur. It plays once, on the first crossing, and settles."
      spec={
        <>
          <div>
            <b>420ms</b> · cubic-bezier(0.33, 1, 0.68, 1) · both
          </div>
          <div>opacity 0→1 · translateY(12px)→0 · blur(1.5px)→0</div>
          <div>stagger 120ms · index.css:160-176</div>
        </>
      }
      action={<ReplayButton onClick={replay} />}
    >
      <div className="pch-anim-col" key={run}>
        <div
          className="pch-anim-enter pch-anim-bar pch-anim-bar--ink"
          style={vars({ '--pch-i': 0 })}
        />
        <div
          className="pch-anim-enter pch-anim-bar pch-anim-bar--mid"
          style={vars({ '--pch-i': 1 })}
        />
        <div
          className="pch-anim-enter pch-anim-bar pch-anim-bar--short"
          style={vars({ '--pch-i': 2 })}
        />
      </div>
    </Tile>
  )
}

/* 2 — the hero ladder ------------------------------------------------------- */

function HeroLadderTile() {
  const [run, replay] = useReplay()

  return (
    <Tile
      name="Hero entrance ladder"
      tier="event"
      sub="Six slots, 120ms apart, 0→600ms. Five ride the house 420ms recipe; the product frame is the only element on the page running the measured 900ms donor curve."
      spec={
        <>
          <div>
            h1 0 · lede 120 · buttons 240 · fine print 360 · <b>frame 480</b> · rails 600ms
          </div>
          <div>
            frame: 900ms cubic-bezier(0, 0, 0.58, 1) — opacity + scale(0.98), no lift, no blur
          </div>
          <div>Hero.tsx:236-289 · Hero.css:215-231</div>
        </>
      }
      action={<ReplayButton onClick={replay} />}
    >
      <div className="pch-anim-hero" key={run}>
        <div
          className="pch-anim-enter pch-anim-bar pch-anim-bar--ink"
          style={vars({ '--pch-i': 0 })}
        />
        <div
          className="pch-anim-enter pch-anim-bar pch-anim-bar--mid"
          style={vars({ '--pch-i': 1 })}
        />
        <div className="pch-anim-enter pch-anim-hero__btns" style={vars({ '--pch-i': 2 })}>
          <span className="pch-anim-hero__btn" />
          <span className="pch-anim-hero__btn pch-anim-hero__btn--ghost" />
        </div>
        <div
          className="pch-anim-enter pch-anim-bar pch-anim-bar--short"
          style={vars({ '--pch-i': 3 })}
        />
        <div className="pch-anim-hero-card pch-anim-card">product frame · 900ms</div>
        <div className="pch-anim-enter pch-anim-hero__rails" style={vars({ '--pch-i': 5 })}>
          <span>00</span>
          <span>100</span>
        </div>
      </div>
    </Tile>
  )
}

/* 3 — step-back ------------------------------------------------------------ */

function StepBackTile() {
  const [stepped, setStepped] = useState(false)

  return (
    <Tile
      name="Step-back"
      tier="event"
      sub="At six pixels of scroll the hero hands the page over: the frame steps back to 0.95 and stays there. A binary state flip, not a scrub — one transition, no per-frame work."
      spec={
        <>
          <div>
            <b>720ms</b> · cubic-bezier(0.2, 0.1, 0.1, 0.92) ~
          </div>
          <div>transform: scale(1) ⇄ scale(0.95) · origin 50% 50%</div>
          <div>threshold 6px · Hero.css:160-170 · Hero.tsx:61-65</div>
        </>
      }
      action={
        <ReplayButton onClick={() => setStepped((s) => !s)} label={stepped ? 'Return' : 'Flip'} />
      }
    >
      <div className="pch-anim-step__vp">
        <div className="pch-anim-step__card" data-stepped={stepped ? 'true' : 'false'}>
          <div className="pch-anim-card">{stepped ? 'scale 0.95' : 'scale 1'}</div>
        </div>
      </div>
    </Tile>
  )
}

/* 4 — curtain dissolve ----------------------------------------------------- */

/* Literals copied from src/components/Hero.tsx:15-18. */
const DAMPING_PER_FRAME = 0.26
const FRAME_MS = 1000 / 60
const SETTLE_EPSILON = 0.00015

function CurtainTile() {
  const reduced = useReducedMotion()
  const hlRef = useRef<HTMLDivElement>(null)
  const oRef = useRef<HTMLSpanElement>(null)
  const bRef = useRef<HTMLSpanElement>(null)
  const value = useRef(1)
  const target = useRef(1)
  const raf = useRef(0)
  const last = useRef(0)
  const [dissolved, setDissolved] = useState(false)

  /* Exactly the page's mapping: blur rides the inverse of opacity and is
   * quantized to half-pixel steps, so the compositor sees six discrete filter
   * values instead of a new one every frame — and `none` at rest drops the
   * layer entirely. Hero.tsx:31-33. */
  const paint = useCallback((o: number) => {
    const blur = Math.round((1 - o) * 5) / 2
    const hl = hlRef.current
    if (hl) {
      hl.style.opacity = String(o)
      hl.style.filter = blur === 0 ? 'none' : `blur(${blur}px)`
    }
    if (oRef.current) oRef.current.textContent = o.toFixed(3)
    if (bRef.current) bRef.current.textContent = `${blur.toFixed(1)}px`
  }, [])

  const tick = useCallback(
    (time: number) => {
      const dt = Math.min(50, time - last.current)
      last.current = time
      /* Frame-rate independent damping — the same normalisation the hero uses,
       * so a 120Hz display settles in the same wall-clock time as 60Hz. */
      const k = 1 - (1 - DAMPING_PER_FRAME) ** (dt / FRAME_MS)
      value.current += (target.current - value.current) * k

      if (Math.abs(target.current - value.current) < SETTLE_EPSILON) {
        value.current = target.current
        paint(value.current)
        raf.current = 0
        return
      }

      paint(value.current)
      raf.current = requestAnimationFrame(tick)
    },
    [paint],
  )

  useEffect(() => {
    paint(value.current)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [paint])

  const toggle = () => {
    const next = dissolved ? 1 : 0
    setDissolved(!dissolved)
    target.current = next

    if (reduced) {
      /* Never author the motion: paint the resolved frame and return. */
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = 0
      value.current = next
      paint(next)
      return
    }

    if (!raf.current) {
      last.current = performance.now()
      raf.current = requestAnimationFrame(tick)
    }
  }

  return (
    <Tile
      name="Curtain dissolve"
      tier="event"
      sub="The headline does not fade on a timer — it is damped towards its target every frame, so reversing mid-dissolve costs nothing. There is no keyframe and no transition for this."
      spec={
        <>
          <div>
            damping <b>0.26</b>/frame, normalised by dt · settle ε 0.00015 · ≈490ms
          </div>
          <div>opacity 1→0 · blur 0→2.5px in 0.5px steps · desktop ≥1024px only</div>
          <div>Hero.tsx:15-18, 31-33, 125-158</div>
        </>
      }
      action={<ReplayButton onClick={toggle} label={dissolved ? 'Restore' : 'Dissolve'} />}
    >
      <div className="pch-anim-curtain">
        <div className="pch-anim-curtain__hl" ref={hlRef}>
          Every deal
          <br />
          on course
        </div>
        <div className="pch-anim-curtain__read">
          <span>
            opacity <b ref={oRef}>1.000</b>
          </span>
          <span>
            blur <b ref={bRef}>0.0px</b>
          </span>
        </div>
      </div>
    </Tile>
  )
}

/* 5 — hover asymmetry ------------------------------------------------------ */

function HoverTile() {
  const reduced = useReducedMotion()
  const [sim, setSim] = useState(false)
  const timer = useRef(0)

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const simulate = () => {
    if (timer.current) window.clearTimeout(timer.current)
    setSim(true)
    timer.current = window.setTimeout(() => setSim(false), 900)
  }

  return (
    <Tile
      name="Asymmetric hover"
      tier="quiet"
      sub="Arrive in one frame, leave slowly. Both legs share one easing — only the duration is asymmetric, which is what makes the page feel answerable rather than animated."
      spec={
        <>
          <div>
            in <b>50ms</b> · out <b>300ms</b> · cubic-bezier(0.2, 0, 0, 1) both ways
          </div>
          <div>press 40ms — product window only (mock/AppFrame.css:211)</div>
          <div>.kz-hover · index.css:180-187 · 11 call sites in the flow</div>
        </>
      }
      action={<ReplayButton onClick={simulate} label="Simulate" />}
    >
      <div className="pch-anim-hover">
        <button
          type="button"
          className={`pch-anim-hover__pill${sim ? ' is-hover' : ''}`}
          onClick={(e) => e.preventDefault()}
        >
          Start navigating
        </button>
        <div className="pch-anim-hover__cap">
          {reduced
            ? 'Colour-only, so it survives reduced motion untouched.'
            : 'Hover it, then move away and watch the return take six times longer. Press for the 40ms state.'}
        </div>
      </div>
    </Tile>
  )
}

/* 6 — stagger -------------------------------------------------------------- */

const STEPS = [120, 90, 80, 70, 46, 38]

function StaggerTile() {
  const [step, setStep] = useState(120)
  const [run, replay] = useReplay()

  return (
    <Tile
      name="Stagger"
      tier="beat"
      sub="One expression, one house value: 120ms. Denser sets step down rather than speeding up — a table cannot wait 120ms per row without reading as a machine filling itself in."
      spec={
        <>
          <div>
            <b>calc(var(--i) * {step}ms)</b> · 425ms scaleY from the baseline
          </div>
          <div>
            120 house · 90 feature rows · 80 stats · 70 words · 46 table rows · 38 transcript
          </div>
          <div>Testimonials.css:398 · IntegrationsStrip.css:33 · Stats.tsx:339</div>
        </>
      }
      knob={
        <div className="pch-anim-knob">
          {STEPS.map((s) => (
            <button
              key={s}
              type="button"
              className="pch-anim-knob__b"
              aria-pressed={s === step}
              onClick={() => {
                setStep(s)
                replay()
              }}
            >
              {s}ms
            </button>
          ))}
        </div>
      }
      action={<ReplayButton onClick={replay} />}
    >
      <div className="pch-anim-stag" key={`${run}-${step}`}>
        {[28, 44, 36, 58, 48, 70, 62, 84].map((h, i) => (
          <div
            key={i}
            className="pch-anim-stag__b"
            style={vars({ '--pch-i': i, '--pch-step': `${step}ms`, height: `${h}px` })}
          />
        ))}
      </div>
    </Tile>
  )
}

/* 7 — the beat vocabulary -------------------------------------------------- */

function BeatsTile() {
  const [run, replay] = useReplay()

  return (
    <Tile
      name="Beat vocabulary"
      tier="beat"
      sub="The platform chapters do not have animations, they have a vocabulary: eight named beats a chapter script calls by name, all on the house curve, all fill-mode both so a beat that has played cannot un-play."
      spec={
        <>
          <div>
            duration ladder <b>340 · 425 · 500 · 595 · 680ms</b>
          </div>
          <div>
            soft blur(2.25px) · row translateY(6px) · lift 14px + scale(0.988) + blur(2.5px)
          </div>
          <div>+ fade, out, pop, bar, colbar — PlatformChapters.css:1619-1684</div>
        </>
      }
      action={<ReplayButton onClick={replay} />}
    >
      <div className="pch-anim-beats" key={run}>
        <div className="pch-anim-beat pch-anim-beat--soft">
          <div className="pch-anim-beat__k">soft 425</div>
          <div className="pch-anim-beat__s" />
        </div>
        <div className="pch-anim-beat pch-anim-beat--row">
          <div className="pch-anim-beat__k">row 340</div>
          <div className="pch-anim-beat__s" />
        </div>
        <div className="pch-anim-beat pch-anim-beat--lift">
          <div className="pch-anim-beat__k">lift 595</div>
          <div className="pch-anim-beat__s" />
        </div>
      </div>
    </Tile>
  )
}

/* 8 — travelling emphasis -------------------------------------------------- */

const MARKS = ['Salesforce', 'HubSpot', 'Zoom', 'Slack', 'Gong']

function SweepTile() {
  const [run, replay] = useReplay()

  return (
    <Tile
      name="Travelling emphasis"
      tier="beat"
      sub="Not a fade-in with a delay. Each mark ghosts in, overshoots past its resting weight with full ink, holds for a beat, then settles back — so attention travels along the row instead of arriving everywhere at once."
      spec={
        <>
          <div>
            <b>560ms</b> · cubic-bezier(0.33, 1, 0.68, 1) both · 120ms step
          </div>
          <div>
            0% blur(2px) scale(0.985) → 38% scale(1.035) ink → 52% hold → 100% gray-900
          </div>
          <div>stack-sweep · IntegrationsStrip.css:31-58</div>
        </>
      }
      action={<ReplayButton onClick={replay} />}
    >
      <div className="pch-anim-sweep" key={run}>
        {MARKS.map((m, i) => (
          <span key={m} className="pch-anim-sweep__m" style={vars({ '--pch-i': i })}>
            {m}
          </span>
        ))}
      </div>
    </Tile>
  )
}

/* ------------------------------------------------------------------- tables */

type Row = { band?: string; v?: string; sites?: string; what?: string; where?: string }

const DURATIONS: Row[] = [
  { band: 'Micro — state feedback' },
  {
    v: '40ms',
    sites: '1',
    what: 'Press state inside the product window',
    where: 'mock/AppFrame.css:211',
  },
  {
    v: '50ms',
    sites: '2',
    what: 'Hover in — the page and the product window',
    where: 'index.css:186',
  },
  { v: '120ms', sites: '2', what: 'Simulated cursor arrow squeeze', where: 'mock/AppFrame.css:253' },
  { v: '140ms', sites: '1', what: 'Nav hairline appears on first scroll', where: 'index.css:192' },

  { band: 'State — hover out, swaps, readouts' },
  {
    v: '200ms',
    sites: '5',
    what: 'Chapter plate hover lift (symmetric — ported from v2)',
    where: 'PlatformChapters.css:684',
  },
  {
    v: '220ms',
    sites: '3',
    what: 'Beat swap-out, product grid redraw',
    where: 'PlatformChapters.css:1711',
  },
  { v: '240ms', sites: '4', what: 'Needle move, chart endpoint dot', where: 'Stats.css:40' },
  {
    v: '260ms',
    sites: '2',
    what: 'Meter bar fill — linear, because a meter is not eased',
    where: 'mock/AppFrame.css:92',
  },
  {
    v: '300ms',
    sites: '15',
    what: 'Hover out; product-window card entrances',
    where: 'index.css:181',
  },
  { v: '340ms', sites: '3', what: 'Pane crossfade in the hero tour', where: 'mock/AppFrame.tsx:184' },

  { band: 'Entrance — the working band' },
  {
    v: '380ms',
    sites: '7',
    what: 'Kinetic letters — opacity and de-blur together',
    where: 'KineticConversation.css:208',
  },
  { v: '420ms', sites: '10', what: 'The house entrance, .kz-enter', where: 'index.css:174' },
  {
    v: '425ms',
    sites: '1',
    what: 'Default chapter beat, --pc-dur',
    where: 'PlatformChapters.css:1680',
  },
  {
    v: '450ms',
    sites: '4',
    what: 'Product-mock reveal; active rail row scale',
    where: 'mock/mock.css:67',
  },
  {
    v: '500ms',
    sites: '10',
    what: 'Rail colour flip, rail description',
    where: 'PlatformChapters.css:486',
  },
  {
    v: '520ms',
    sites: '6',
    what: 'Testimonial cards — blur-only, nothing moves',
    where: 'Testimonials.css:394',
  },
  { v: '560ms', sites: '4', what: 'Integration mark sweep', where: 'IntegrationsStrip.css:31' },
  {
    v: '620ms',
    sites: '5',
    what: 'Simulated cursor travel; raw transcript words',
    where: 'mock/AppFrame.css:238',
  },

  { band: 'Event — only where a scene is being told' },
  {
    v: '640ms',
    sites: '3',
    what: '"This row just changed" wash; guidance block in',
    where: 'mock/AppFrame.css:151',
  },
  { v: '680ms', sites: '—', what: 'Top of the chapter beat ladder', where: 'PlatformChapters.css:107' },
  {
    v: '700ms',
    sites: '2',
    what: 'Kinetic intro; raw-transcript transform',
    where: 'KineticConversation.css:115',
  },
  { v: '720ms', sites: '2', what: 'Hero step-back; understood de-blur', where: 'Hero.css:163' },
  { v: '900ms', sites: '3', what: 'Hero product frame; Stats series clip', where: 'Hero.css:227' },

  { band: 'Ambient — the only loops on the page' },
  {
    v: '900ms',
    sites: '1',
    what: 'Chevron nudge — hover-gated, stops on leave',
    where: 'index.css:364',
  },
  { v: '1000ms', sites: '2', what: 'Caret blink, steps(1); thinking dots', where: 'mock/mock.css:22' },
  { v: '1800ms', sites: '1', what: 'Recording indicator breathes', where: 'mock/mock.css:90' },
  {
    v: '32.0s',
    sites: '1',
    what: 'Hero tour period — 45.6s on the first pass',
    where: 'mock/AppFrame.tsx:858, 1217',
  },
]

const KEYFRAMES: Row[] = [
  {
    v: 'kz-enter-kf',
    what: 'The house entrance — fade, 12px lift, 1.5px de-blur',
    where: 'index.css:160 · 420ms',
  },
  {
    v: 'hero-card-enter',
    what: 'Fade out of scale(0.98). No lift, no blur',
    where: 'Hero.css:215 · 900ms',
  },
  {
    v: 'stack-sweep',
    what: 'Travelling emphasis with an overshoot and a hold',
    where: 'IntegrationsStrip.css:35 · 560ms',
  },
  { v: 'tm-enter', what: 'Blur-only arrival — nothing moves', where: 'Testimonials.css:401 · 520ms' },
  {
    v: 'pc-kf-soft',
    what: 'The donor entrance: fade out of blur(2.25px)',
    where: 'PlatformChapters.css:1629 · 425ms',
  },
  { v: 'pc-kf-row', what: 'Table row, 6px', where: 'PlatformChapters.css:1634 · 340ms' },
  {
    v: 'pc-kf-lift',
    what: 'Overlay lift, 14px + scale(0.988) + blur(2.5px)',
    where: 'PlatformChapters.css:1639 · 595ms',
  },
  { v: 'pc-kf-pop', what: 'Swap-in from scale(0.92)', where: 'PlatformChapters.css:1644 · 300ms' },
  {
    v: 'pc-kf-bar / -colbar',
    what: 'scaleX from the left; scaleY from the baseline',
    where: 'PlatformChapters.css:1649 · 425-500ms',
  },
  {
    v: 'pc-kf-fade / -out',
    what: 'The two bare opacity beats',
    where: 'PlatformChapters.css:1619 · 240 / 220ms',
  },
  { v: 'hvug-cross', what: 'Chevron pops to 1.28 at 35%, once', where: 'HvuGlass.css:231 · 520ms' },
  {
    v: 'af-flash',
    what: 'A row that just changed washes surface-300 → clear',
    where: 'mock/AppFrame.css:154 · 640ms',
  },
  {
    v: 'af-click',
    what: 'Click ring, opacity 0.55→0 while scale(0.3)→1.25',
    where: 'mock/AppFrame.css:277 · 460ms',
  },
  {
    v: 'tw-blink / mock-bounce / mock-ping-kf',
    what: 'Caret, thinking dots, recording breath',
    where: 'mock/mock.css:25 · 1s / 1s / 1.8s',
  },
  {
    v: 'kz-chevron-nudge-kf',
    what: 'translateX 0→2px→0, hover-gated',
    where: 'index.css:349 · 900ms',
  },
  {
    v: 'kz-fade-kf',
    what: 'The reduced-motion substitute for every entrance',
    where: 'index.css:389 · 200ms',
  },
]

function Table({ rows, head }: { rows: Row[]; head: [string, string, string, string?] }) {
  const cols = head[3] ? 4 : 3
  return (
    <div className="pch-anim-scroll">
      <table className="pch-anim-tbl">
        <thead>
          <tr>
            <th>{head[0]}</th>
            {head[3] ? <th>{head[3]}</th> : null}
            <th>{head[1]}</th>
            <th>{head[2]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) =>
            r.band ? (
              <tr key={`b${i}`} className="pch-anim-tbl__band">
                <td colSpan={cols}>{r.band}</td>
              </tr>
            ) : (
              <tr key={`r${i}`}>
                <td>{r.v}</td>
                {head[3] ? <td className="pch-anim-tbl__n">{r.sites}</td> : null}
                <td>{r.what}</td>
                <td className="pch-anim-tbl__n">{r.where}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}

/* --------------------------------------------------------------------- page */

export default function AnimationSystemChapter() {
  const reduced = useReducedMotion()

  return (
    <>
      <section className="pp-sec">
        <div className="pp-eyebrow">03 — Animation system</div>
        <h2 className="pp-h">Motion system</h2>

        <div className="pch-anim-legend">
          <span>
            <b>2</b> easing tokens
          </span>
          <span>
            <b>9</b> distinct beziers in the flow
          </span>
          <span>
            <b>1</b> overshoot on the whole page
          </span>
          <span>
            <b>4</b> ambient loops
          </span>
          <span>
            <b>120ms</b> house stagger
          </span>
        </div>

        <div className="pch-anim-rm">
          <span className="pch-anim-rm__k">
            prefers-reduced-motion <b>{reduced ? 'reduce' : 'no-preference'}</b>
          </span>
          <span>
            {reduced
              ? 'Every specimen is rendering its settled state; replay crossfades over 200ms and the rAF specimen never starts a loop.'
              : 'The specimens are running the real durations. Turn the OS setting on and this page reduces itself live, no reload.'}
          </span>
        </div>
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">03.1 — Easing</div>
        <h2 className="pp-h">Easing curves</h2>

        <div className="pch-anim-curves">
          {CURVES.map((c) => (
            <div className="pch-anim-curve" key={c.name}>
              <div className="pch-anim-curve__plot">
                <BezierPlot p={c.p} />
              </div>
              <div className="pch-anim-curve__nm">{c.name}</div>
              <div className="pch-anim-curve__lit">
                cubic-bezier({c.p.join(', ')})
                {c.token ? <> · {c.token}</> : null}
              </div>
              <div className="pch-anim-curve__where">{c.where}</div>
            </div>
          ))}
        </div>

        <p className="pch-anim-flag">
          <b>Plots four and five are the argument for measuring.</b> The traced peak is scale
          0.999972 — a long ease-out, not the spring a preset would have given it.
        </p>
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">03.2 — Specimens</div>
        <h2 className="pp-h">Motion specimens</h2>

        <div className="pch-anim-tiles">
          <EnterTile />
          <HeroLadderTile />
          <StepBackTile />
          <CurtainTile />
          <HoverTile />
          <StaggerTile />
          <BeatsTile />
          <SweepTile />
        </div>
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">03.3 — The ration</div>
        <h2 className="pp-h">Motion tiers</h2>

        <div className="pch-anim-ration">
          <div className="pch-anim-ration__c">
            <div className="pch-anim-ration__t">Event</div>
            <div className="pch-anim-ration__n">5 sections · a scene told in time</div>
            <ul className="pch-anim-ration__l">
              <li>
                <b>Hero</b> — curtain, step-back, 900ms frame
              </li>
              <li>
                <b>Product window</b> — five-pane tour, 32.0s period
              </li>
              <li>
                <b>Kinetic conversation</b> — 260svh scrub
              </li>
              <li>
                <b>Heard vs understood</b> — 6.16s scene clock
              </li>
              <li>
                <b>Before / after</b> — 4.69s GSAP timeline
              </li>
            </ul>
            <div className="pch-anim-ration__v">
              tour 32.0s period, 45.6s first pass — mock/AppFrame.tsx:858, 1217
            </div>
          </div>

          <div className="pch-anim-ration__c">
            <div className="pch-anim-ration__t">Beat</div>
            <div className="pch-anim-ration__n">4 sections · arrival order is the meaning</div>
            <ul className="pch-anim-ration__l">
              <li>
                <b>Stats</b> — 1740ms chart cascade
              </li>
              <li>
                <b>Platform chapters</b> — beat scores, 340-680ms
              </li>
              <li>
                <b>Testimonials</b> — 1120ms card cascade
              </li>
              <li>
                <b>Integrations</b> — 1280ms mark sweep
              </li>
            </ul>
            <div className="pch-anim-ration__v">
              transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 420ms — Stats.css:18
            </div>
          </div>

          <div className="pch-anim-ration__c">
            <div className="pch-anim-ration__t">Quiet</div>
            <div className="pch-anim-ration__n">everything else · state, not spectacle</div>
            <ul className="pch-anim-ration__l">
              <li>
                <b>Nav</b> — link colour, one hairline
              </li>
              <li>
                <b>Closing CTA</b> — entrance and hover only
              </li>
              <li>
                <b>Footer</b> — link colour
              </li>
              <li>
                <b>Page planes</b> — sticky only, nothing tweened
              </li>
            </ul>
            <div className="pch-anim-ration__v">
              .kz-hover 300ms / 50ms — index.css:181, 186 · hairline 140ms — index.css:192
            </div>
          </div>
        </div>

        <p className="pch-anim-flag">
          <b>Two sections outgrew the rule, and the rule is what noticed.</b> Heard vs understood and
          Before / after were written as BEAT and shipped as scored scenes, so they are listed as
          EVENT — five is over budget, recorded rather than rounded down.
        </p>
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">03.4 — The scale</div>
        <h2 className="pp-h">Duration inventory</h2>
        <Table rows={DURATIONS} head={['Value', 'What it moves', 'Source', 'Sites']} />
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">03.5 — Keyframes</div>
        <h2 className="pp-h">Named animations</h2>
        <Table rows={KEYFRAMES} head={['Keyframe', 'What it does', 'Source · duration']} />
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">03.6 — Reduced motion</div>
        <h2 className="pp-h">Reduced motion</h2>

        <div className="pch-anim-shapes">
          <div className="pch-anim-shape">
            <div className="pch-anim-shape__n">Shape 1 · dominant</div>
            <div className="pch-anim-shape__t">CSS resolves to the end state</div>
            <p className="pch-anim-shape__p">
              The entrance is replaced, not deleted: a 200ms opacity fade that keeps the delay ladder,
              so order still reads even though nothing travels. The hero's whole sticky construction
              un-sticks to static flow.
            </p>
            <div className="pch-anim-shape__f">index.css:367-387 · Hero.css:176-183, 350-398</div>
          </div>

          <div className="pch-anim-shape">
            <div className="pch-anim-shape__n">Shape 2 · the stronger half</div>
            <div className="pch-anim-shape__t">JS never authors the motion</div>
            <p className="pch-anim-shape__p">
              Every scene checks the query and paints its finished frame instead of running: no rAF,
              no interval, no typewriter, no listeners. The product window returns before its beat
              table exists, because the shipped markup already is the settled state.
            </p>
            <div className="pch-anim-shape__f">
              mock/AppFrame.tsx:1035 · KineticConversation.tsx:203 · BeforeAfter.tsx:120
            </div>
          </div>

          <div className="pch-anim-shape">
            <div className="pch-anim-shape__n">Shape 3 · one inconsistency</div>
            <div className="pch-anim-shape__t">A blanket clamp, inherited</div>
            <p className="pch-anim-shape__p">
              One band still uses the global{' '}
              <span className="pch-anim-code">0.01ms !important</span> clamp ported from v2 rather
              than authoring its settled state. It works, it is not the house pattern, and it is
              flagged here rather than papered over.
            </p>
            <div className="pch-anim-shape__f">chapters/IntelDetail.css:444-452</div>
          </div>
        </div>

        <p className="pch-anim-flag">
          All three subscribe to <span className="pch-anim-code">change</span> on the media query, so
          toggling the OS setting re-resolves the page live — no reload.
        </p>
      </section>
    </>
  )
}
