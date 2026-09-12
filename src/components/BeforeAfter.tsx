import { Fragment, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useInView } from '../hooks/useInView'
import './BeforeAfter.css'

/* BeforeAfter — a "resolution" scene, not a decorated layout. One continuous
   gsap performance where the graphic's meaning happens in time.

   The BEFORE ledger opens restless: its three bar-waveform glyphs come alive as
   continuous audio-meters (karaoke voice-weaves that never freeze) and the
   dotted leaders draw only partway — an unresolved state, held for a few
   seconds. The → node on the divider is the hinge of the whole scene: when it
   fires, the BEFORE column visibly SETTLES — it DIMS (opacity, not stillness:
   the weaves keep bobbing), the leaders finish and their dots land. That energy
   transfers across the divider and the AFTER side inhales:
   the serif quote marks bloom, the quote is SPOKEN word-by-word (gray-400→ink)
   while the lavender stat waveform reacts in sync, as if the words are audio
   being transcribed. The waveform's energy then condenses into "3.2×", which
   counts up with a slight overshoot-settle as "faster deal reviews" locks in.
   End state: left dim but still weaving, right alive and resolved — both
   waveforms keep a continuous karaoke motion (the right at lower amplitude).

   Architecture: a single gsap timeline with overlapping position labels so each
   beat CAUSES the next (murmur converges INTO the hinge; the hinge overlaps the
   inhale). Easing stays in the ease-out / blur-entrance family (Attio grammar);
   the only overshoot is the count figure's back.out settle. Triggered once via
   IntersectionObserver (useInView). prefers-reduced-motion skips the timeline
   and paints the resolved end-state synchronously. Transform / opacity / filter
   / color / one clip only — no per-frame React state. */

const BEFORE_ITEMS = [
  { text: 'Missed context', wave: [0.4, 0.7, 0.55, 0.9, 0.65, 0.8, 0.45, 0.3, 0.18, 0.1, 0.08, 0.08, 0.06] },
  { text: 'Manual CRM cleanup', wave: [0.5, 0.85, 0.6, 1.0, 0.7, 0.5, 0.35, 0.22, 0.12, 0.09, 0.08, 0.06, 0.06] },
  { text: 'Late risk discovery', wave: [0.35, 0.6, 0.95, 0.7, 0.85, 0.55, 0.4, 0.28, 0.16, 0.1, 0.08, 0.07, 0.06] },
]

const AFTER_WAVE = [0.45, 0.8, 1.0, 0.65, 0.9, 0.6, 0.75, 0.4, 0.22, 0.12, 0.08]

const QUOTE_WORDS = ['Our', 'pipeline', 'became', 'explainable.']

/* 2026-07-29 (owner) — the AFTER column carries THREE outcomes, not one. The
   section moved into the landing flow directly ahead of the CTA, so it is the
   last number the reader sees; one figure read as a banner claim, three
   converging mid-size figures read as a case study. Deliberately kept inside
   the believable band (2–4×, tens of percent) — an inflated 10× buys nothing
   from a CTO scanning for plausibility. Each one traces to a surface the page
   actually shows: reviews ← Deal Rooms, CRM admin ← WriteBack, risk ← the
   objection/risk detection chapters. The hero figure alone COUNTS (one counter
   owns the beat); the two minors resolve as type so the row doesn't read like
   a slot machine. MOCK DATA, one anonymous attributed voice — no invented
   person, per the S9 ruling that pulled the fictional-VP Quote. */
const MINOR_STATS = [
  { figure: '−41%', label: 'less time on CRM admin' },
  { figure: '2.1×', label: 'more risk caught pre-close' },
]

/* GSAP tweens `color` to a literal, so these cannot be `var(--…)` — read off the
   root once at module load. Same pattern as ObjectionAnatomy.tsx:37. */
function readColorToken(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const INK = readColorToken('--color-ink', '#161514')
const GRAY_600 = readColorToken('--color-gray-600', '#8c8b8a')
const ACCENT_600 = readColorToken('--color-accent-600', '#6a77e5')

/* a continuous audio-meter (karaoke) loop for a set of bars: each bar bobs on
   its own quick, re-randomised cycle (repeatRefresh re-rolls the target each
   iteration, tweening from wherever it is), so the group shimmers organically
   and NEVER freezes. Bars start at scaleY 0, so the first cycle reads as the
   weave "coming alive". Pure transform — compositor-friendly. Returns the tweens
   so the caller can hold them (useGSAP's scope cleans them up on unmount). */
function equalize(
  bars: Element[],
  { lo, hi, durLo, durHi, step, delay = 0 }: { lo: number; hi: number; durLo: number; durHi: number; step: number; delay?: number },
) {
  return bars.map((bar, i) =>
    gsap.to(bar, {
      scaleY: () => gsap.utils.random(lo, hi),
      duration: () => gsap.utils.random(durLo, durHi),
      ease: 'sine.inOut',
      repeat: -1,
      repeatRefresh: true,
      delay: delay + i * step,
    }),
  )
}

function Waveform({
  bars,
  variant,
  max,
}: {
  bars: number[]
  variant: 'before' | 'after'
  max: number
}) {
  return (
    <span className={`ba-wave ba-wave--${variant}`} aria-hidden="true" style={{ height: max }}>
      {bars.map((h, i) => (
        <span key={i} className="ba-wave__bar" style={{ height: Math.max(2, Math.round(h * max)) }} />
      ))}
    </span>
  )
}

export default function BeforeAfter() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.25 })
  const scope = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const root = scope.current
      if (!root || !inView) return
      const numEl = root.querySelector<HTMLSpanElement>('.ba-stat__num')
      const q = gsap.utils.selector(root)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // ── reduced motion → resolved end-state, no timeline ────────────────
      if (reduce) {
        gsap.set(q('.ba__title, .ba__eyebrow, .ba-row, .ba-stat__label, .ba-minor'), {
          opacity: 1,
          y: 0,
          filter: 'none',
        })
        gsap.set(q('.ba-wave__bar'), { scaleY: 1 })
        gsap.set(q('.ba-leader'), { '--lc': '0%' })
        gsap.set(q('.ba-leader__dot'), { opacity: 1, scale: 1 })
        gsap.set(q('.ba-quote__word'), { color: INK, filter: 'none', y: 0 })
        gsap.set(q('.ba-quote__mark'), { opacity: 1, scale: 1, filter: 'none' })
        gsap.set(q('.ba__col--before'), { opacity: 0.58 })
        gsap.set(q('.ba-row__text'), { color: GRAY_600 })
        gsap.set(q('.ba__divider-line'), { scaleY: 1 })
        gsap.set(q('.ba__arrow'), { scale: 1, borderColor: ACCENT_600 })
        // y too: ≤720px rotates the node, so the icon's slide-in is on Y
        gsap.set(q('.ba__arrow-icon'), { opacity: 1, x: 0, y: 0 })
        gsap.set(q('.ba-rule'), { scaleX: 1 })
        gsap.set(q('.ba-stat__figure'), { opacity: 1, scale: 1, filter: 'none' })
        gsap.set(q('.ba-stat__sep'), { scaleY: 1, opacity: 1 })
        if (numEl) numEl.textContent = '3.2'
        return
      }

      const beforeBars = q('.ba-wave--before .ba-wave__bar')
      const afterBars = q('.ba-wave--after .ba-wave__bar')
      const wordStep = 0.17
      const counter = { v: 0 }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // ── ESTABLISH the BEFORE ledger (fast, overlapping) ────────────────
      tl.to('.ba__title', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }, 0)
        .to('.ba__divider-line', { scaleY: 1, duration: 0.7, ease: 'power2.out' }, 0.05)
        .to('.ba__eyebrow--before', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, 0.15)
        .to('.ba-row', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.1 }, 0.2)
        // leaders draw only PARTWAY — incomplete, unresolved
        .to('.ba-leader', { '--lc': '36%', duration: 0.75, ease: 'power2.out' }, 0.35)

      // ── LIVE: the BEFORE weaves come alive as continuous audio-meters and
      //    keep bobbing for the whole scene. The hinge only DIMS the column
      //    (opacity) — the weaves never freeze. ────────────────────────────
      equalize(beforeBars, { lo: 0.28, hi: 1, durLo: 0.32, durHi: 0.6, step: 0.02, delay: 0.25 })

      // ── HINGE (~2.35s): the → fires, BEFORE settles, energy transfers ──
      tl.addLabel('hinge', 2.35)
      tl.to('.ba__arrow', { scale: 1, duration: 0.55, ease: 'power3.out' }, 'hinge')
        .to('.ba__arrow', { borderColor: ACCENT_600, duration: 0.4 }, 'hinge')
        // x AND y: the ≤720px stack rotates the node and slides the icon on Y
        // instead of X — clearing only x left the glyph 5px off the circle's
        // centre for the whole settled state on phones.
        .to('.ba__arrow-icon', { opacity: 1, x: 0, y: 0, duration: 0.5, ease: 'power3.out' }, 'hinge')
        // BEFORE settles: dim + desaturate a step
        .to('.ba__col--before', { opacity: 0.58, duration: 0.85, ease: 'power2.out' }, 'hinge')
        .to('.ba-row__text', { color: GRAY_600, duration: 0.85 }, 'hinge')
        // the leaders finish and their dots land — the ledger closes
        .to('.ba-leader', { '--lc': '0%', duration: 0.6, ease: 'power2.out' }, 'hinge')
        .to('.ba-leader__dot', { opacity: 1, scale: 1, duration: 0.4, stagger: 0.06 }, 'hinge+=0.3')

      // ── AFTER inhales ──────────────────────────────────────────────────
      tl.addLabel('inhale', 'hinge+=0.12')
      tl.to('.ba__eyebrow--accent', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, 'inhale')
        .to('.ba-quote__mark', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, stagger: 0.06 }, 'inhale')
        .to('.ba-rule--accent', { scaleX: 1, duration: 0.6, ease: 'power3.out' }, 'inhale+=0.1')

      // ── SPOKEN: quote resolves word-by-word, waveform reacts in sync ───
      tl.addLabel('speak', 'inhale+=0.15')
      tl.to('.ba-quote__word', { color: INK, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: wordStep }, 'speak')
      // one burst of bar activity per spoken word (repeatRefresh re-randomises)
      tl.to(
        afterBars,
        {
          scaleY: () => 0.42 + Math.random() * 0.58,
          duration: wordStep,
          ease: 'power1.inOut',
          stagger: { each: 0.015, from: 'random' },
          repeat: QUOTE_WORDS.length - 1,
          repeatRefresh: true,
        },
        'speak',
      )

      // ── the waveform's energy condenses into the number ───────────────
      tl.addLabel('count', 'speak+=0.9')
      tl.to(afterBars, { scaleY: 0.55, duration: 0.5, ease: 'power2.out' }, 'count')
        .to(
          counter,
          {
            v: 3.2,
            duration: 1.0,
            ease: 'power2.out',
            onUpdate: () => {
              if (numEl) numEl.textContent = counter.v.toFixed(1)
            },
          },
          'count',
        )
        // slight overshoot-settle on the figure (the one allowed overshoot)
        .to('.ba-stat__figure', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'back.out(1.5)' }, 'count')
        .to('.ba-stat__sep', { scaleY: 1, opacity: 1, duration: 0.4 }, 'count+=0.1')
        .to('.ba-stat__label', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, 'count+=0.25')
        .to('.ba-rule--bottom', { scaleX: 1, duration: 0.6, ease: 'power3.out' }, 'count+=0.15')
        // the two supporting outcomes land AFTER the hero figure settles, so the
        // count keeps the beat to itself and they read as corroboration
        .to('.ba-minor', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.12 }, 'count+=0.5')

      // ── AMBIENT: once the count lands, the AFTER weave picks up the same
      //    live karaoke motion (lower amplitude) — so it, too, never freezes.
      //    (The BEFORE weave has been bobbing continuously since the start.) ─
      tl.call(
        () => equalize(afterBars, { lo: 0.4, hi: 0.9, durLo: 0.34, durHi: 0.58, step: 0.03 }),
        undefined,
        'count+=1.1',
      )
    },
    { scope, dependencies: [inView] },
  )

  return (
    <section
      ref={(node) => {
        ref.current = node
        scope.current = node
      }}
      className="ba"
      aria-labelledby="ba-title"
    >
      <div className="ba__container">
        <h2 id="ba-title" className="ba__title">
          What changed after Knowzilla
        </h2>

        <div className="ba__split">
          {/* ── BEFORE ─────────────────────────────────────────────── */}
          <div className="ba__col ba__col--before">
            <p className="ba__eyebrow ba__eyebrow--before">Before</p>

            <ul className="ba__list" role="list">
              {BEFORE_ITEMS.map((item) => (
                <li key={item.text} className="ba-row">
                  <Waveform bars={item.wave} variant="before" max={22} />
                  <span className="ba-row__text">{item.text}</span>
                  <span className="ba-leader" aria-hidden="true">
                    <span className="ba-leader__line" />
                    <span className="ba-leader__dot" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── divider + → node ───────────────────────────────────── */}
          <div className="ba__divider" aria-hidden="true">
            <span className="ba__divider-line" />
            <span className="ba__arrow">
              <svg className="ba__arrow-icon" viewBox="0 0 24 24" width="15" height="15" fill="none">
                <path
                  d="M5 12h13M13 7l5 5-5 5"
                  stroke={ACCENT_600}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          {/* ── AFTER ──────────────────────────────────────────────── */}
          <div className="ba__col ba__col--after">
            <p className="ba__eyebrow ba__eyebrow--accent">After</p>

            <blockquote className="ba-quote">
              <span className="ba-quote__mark ba-quote__mark--open" aria-hidden="true">
                &ldquo;
              </span>
              <span className="ba-quote__text">
                {QUOTE_WORDS.map((w, i) => (
                  <Fragment key={i}>
                    <span className="ba-quote__word">{w}</span>
                    {i < QUOTE_WORDS.length - 1 ? ' ' : null}
                  </Fragment>
                ))}
                <span className="ba-quote__mark ba-quote__mark--close" aria-hidden="true">
                  &rdquo;
                </span>
              </span>
            </blockquote>

            <span className="ba-rule ba-rule--accent" aria-hidden="true" />

            <div className="ba-stat">
              <Waveform bars={AFTER_WAVE} variant="after" max={30} />
              <span className="ba-stat__sep" aria-hidden="true" />
              <span className="ba-stat__figure">
                <span className="ba-stat__num">0.0</span>
                <span className="ba-stat__x">&times;</span>
              </span>
              <span className="ba-stat__label">faster deal reviews</span>
            </div>

            <span className="ba-rule ba-rule--bottom" aria-hidden="true" />

            {/* the two supporting outcomes — same voice, smaller register */}
            <ul className="ba-minors" role="list">
              {MINOR_STATS.map((stat) => (
                <li key={stat.label} className="ba-minor">
                  <span className="ba-minor__figure">{stat.figure}</span>
                  <span className="ba-minor__label">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
