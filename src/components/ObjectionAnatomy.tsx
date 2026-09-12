import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import DotMatrix from './DotMatrix'
import './ObjectionAnatomy.css'

/* ObjectionAnatomy — "live annotation": the system parsing a buyer's objection
   AS it is spoken. One continuous gsap-timeline performance (~6s) where the
   karaoke reveal of the sentence is the TIMEBASE for everything: each phrase
   bracket draws WHILE its words ink (annotation racing alongside speech, not
   after it), its dotted connector + mono label landing like a stamp the instant
   the bracket completes. The sentence finishing is the cue for the verdict beat:
   the raised verdict CARD lands, the arrow settles into it, "Underlying concern"
   arrives as a single confident reveal, and "confidence · high" resolves last
   with "high" flipping signal blue — the quiet final stamp. Ambient after: near-total
   stillness.

   SESSION 9 (see design-assets/ours/session9/CONTRACT.md). R1: no lavender is
   drawn in this section any more. Brackets = gray-500 2px (the device line),
   dotted leaders = gray-400 1.5px, part labels = gray-700 mono, the verdict
   node ring = gray-400 1.5px with an ink glyph. Signal blue stays on "high"
   only — telemetry (the old warm ramp was retired 2026-07-27). R2: the section
   already sits on the tinted surface-200 chapter
   ground, so the verdict panel becomes the one sanctioned LIFT (surface-100 +
   hairline-2 + radius-card + shadow-card): the human's raw sentence stays flat
   on the paper it is annotated on, the machine's conclusion comes off it. The
   old 1px vertical `.oa__rule` divider is deleted — the card edge does that job
   and two parallel vertical edges fought.

   Motion architecture: ONE gsap.timeline with overlapping position params so the
   beats cause each other. Brackets are positioned from the ACTUAL rendered word
   spans (getBoundingClientRect, recomputed on resize / font load) — never
   hardcoded. The sentence auto-fits to one line on the stage so the anatomy
   stays anchored at any width down to the narrow breakpoint, where it gracefully
   drops to a stacked legend. prefers-reduced-motion → the timeline is seeked to
   its end before paint (the fully-composed poster, no motion).

   VARIANTS. `full` (default, /objection-anatomy route) = everything above,
   unchanged. `quiet` (landing flow, Session 5 motion ration) = the SETTLED
   poster only: no gsap timeline, no bracket drawing, no karaoke, no ambient —
   just Attio's QUIET entrance in CSS (blur 2px→0 + opacity, 520ms,
   --ease-entrance, 140ms stagger over four groups), once on viewport entry,
   latched. The measurement pass runs in both variants: the brackets are
   geometry, not motion. */

gsap.registerPlugin(CustomEase)
// exact --ease-entrance cubic-bezier(0.33,1,0.68,1) — a settle, no overshoot
const EASE = CustomEase.create('oaEntrance', 'M0,0 C0.33,1 0.68,1 1,1')

function readColorToken(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const GRAY_400 = readColorToken('--color-gray-400', '#d7d6d4')
const GRAY_600 = readColorToken('--color-gray-600', '#8c8b8a')

const WORDS = ['I’m', 'not', 'sure', 'we', 'can', 'justify', 'this', 'now.']

type Group = {
  label: string
  phrase: string
  s: number
  e: number
  pos: 'top' | 'bottom'
}
const GROUPS: Group[] = [
  { label: 'TIMING', phrase: 'I’m not sure', s: 0, e: 2, pos: 'top' },
  { label: 'VALUE', phrase: 'we can justify', s: 3, e: 5, pos: 'top' },
  { label: 'AUTHORITY', phrase: 'this now.', s: 6, e: 7, pos: 'bottom' },
]
export type MatrixMode = 'off' | 'state-only' | 'full-ref'

/* auto-fit bounds for the one-line sentence */
const BASE_FS = 56
const MIN_FS = 24
const NARROW_STAGE = 560

/* timebase (seconds) */
const W0 = 1.0
const STEP = 0.4
const WDUR = 0.38
const wordT = (i: number) => W0 + i * STEP

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

export default function ObjectionAnatomy({
  variant = 'full',
  matrixMode,
}: {
  variant?: 'full' | 'quiet'
  matrixMode?: MatrixMode
} = {}) {
  const requestedMode =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('matrix')
  const resolvedMode: MatrixMode =
    matrixMode ??
    (requestedMode === 'state-only' || requestedMode === 'full-ref' ? requestedMode : 'off')
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sentenceRef = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion()

  /* ── measure: auto-fit the sentence to one line, then anchor every bracket
       to its phrase's real word rects. Writes geometry straight to the DOM
       (no React state → no re-render churn); reruns on resize + font load. ── */
  useLayoutEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const sent = sentenceRef.current
    if (!section || !stage || !sent) return

    const measure = () => {
      const stageRect = stage.getBoundingClientRect()
      if (stageRect.width === 0) return
      const narrow = stageRect.width < NARROW_STAGE
      section.classList.toggle('oa--narrow', narrow)

      if (!narrow) {
        sent.style.whiteSpace = 'nowrap'
        sent.style.fontSize = `${BASE_FS}px`
        const natural = sent.scrollWidth
        const avail = stageRect.width
        const fs = natural > avail ? Math.max(MIN_FS, BASE_FS * (avail / natural)) : BASE_FS
        sent.style.fontSize = `${fs}px`
      } else {
        sent.style.whiteSpace = ''
        sent.style.fontSize = ''
      }

      const sRect = sent.getBoundingClientRect()
      stage.style.setProperty('--oa-bar-y', `${sRect.top - stageRect.top - 16}px`)
      stage.style.setProperty('--oa-auth-y', `${sRect.bottom - stageRect.top + 16}px`)

      const words = section.querySelectorAll<HTMLElement>('.oa-word')
      const parts = section.querySelectorAll<HTMLElement>('.oa-part')
      const matrixAnchors = section.querySelectorAll<HTMLElement>('.oa-part__matrix-anchor')
      GROUPS.forEach((g, gi) => {
        const a = words[g.s]?.getBoundingClientRect()
        const b = words[g.e]?.getBoundingClientRect()
        const part = parts[gi]
        if (a && b && part) {
          part.style.left = `${a.left - stageRect.left}px`
          part.style.width = `${b.right - a.left}px`
          const matrixAnchor = matrixAnchors[gi]
          const bar = part.querySelector<HTMLElement>('.oa-part__bar')
          if (matrixAnchor && bar) {
            const barRect = bar.getBoundingClientRect()
            matrixAnchor.style.left = `${(a.left + b.right) / 2 - stageRect.left}px`
            matrixAnchor.style.top = `${barRect.top + barRect.height / 2 - stageRect.top}px`
          }
        }
      })
    }

    measure()
    document.fonts?.ready.then(measure).catch(() => {})
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  /* ── the performance: one timeline, built before paint so the .from start
       states hide everything without a flash. Plays on viewport entry;
       reduced motion seeks straight to the composed end. ── */
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section || variant !== 'full') return

    let observer: IntersectionObserver | null = null
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } })

      // header — Attio blur-entrance, handing off just as speech begins
      tl.from('.oa-heading', { opacity: 0, y: 18, filter: 'blur(7px)', duration: 0.75 }, 0)
        .from('.oa-body', { opacity: 0, y: 12, filter: 'blur(5px)', duration: 0.7 }, 0.14)

      // karaoke — the timebase. each word inks gray-400 → ink
      const words = gsap.utils.toArray<HTMLElement>('.oa-word')
      words.forEach((w, i) => {
        tl.from(w, { color: GRAY_400, duration: WDUR, ease: 'none' }, wordT(i))
      })

      // brackets — each draws WHILE its phrase inks, stamped on completion
      const parts = gsap.utils.toArray<HTMLElement>('.oa-part')
      const matrixAnchors = gsap.utils.toArray<HTMLElement>('.oa-part__matrix-anchor')
      GROUPS.forEach((g, gi) => {
        const part = parts[gi]
        if (!part) return
        const bar = part.querySelector('.oa-part__bar')
        const caps = part.querySelectorAll('.oa-part__cap')
        const conn = part.querySelector('.oa-part__conn')
        const label = part.querySelector('.oa-part__label')
        const matrixAnchor = matrixAnchors[gi]
        const start = wordT(g.s) + 0.12
        const end = wordT(g.e) + 0.18
        const dur = Math.max(0.32, end - start)
        const top = g.pos === 'top'
        tl.from(bar, { scaleX: 0, transformOrigin: 'center', duration: dur, ease: 'power1.out' }, start)
          .from(
            caps,
            { scaleY: 0, opacity: 0, transformOrigin: top ? 'center top' : 'center bottom', duration: 0.26 },
            end - 0.04,
          )
          .from(
            conn,
            { scaleY: 0, opacity: 0, transformOrigin: top ? 'center bottom' : 'center top', duration: 0.28 },
            end + 0.02,
          )
          .from(
            label,
            { opacity: 0, y: top ? 6 : -6, filter: 'blur(4px)', duration: 0.34 },
            end + 0.08,
          )
        if (matrixAnchor) {
          tl.from(
            matrixAnchor,
            { opacity: 0, filter: 'blur(2px)', duration: 0.34 },
            end + 0.08,
          )
        }
      })

      // verdict — cued by the sentence finishing. Session 9: the beat that used
      // to draw the vertical divider now LANDS THE CARD (the divider is gone;
      // the raised card's own edge separates stage from readout), then the
      // conclusion is written into it.
      const sentenceEnd = wordT(WORDS.length - 1) + WDUR
      const C = sentenceEnd + 0.15
      tl.from('.oa__panel', { opacity: 0, y: 14, filter: 'blur(6px)', duration: 0.62 }, C)
        .from('.oa-arrow', { opacity: 0, scale: 0.82, filter: 'blur(4px)', duration: 0.55 }, C + 0.25)
        .from('.oa-verdict', { opacity: 0, y: 10, filter: 'blur(6px)', duration: 0.6 }, C + 0.45)
        .from('.oa-panel__hr', { scaleX: 0, transformOrigin: 'left center', opacity: 0, duration: 0.4 }, C + 0.7)
        .from('.oa-conf', { opacity: 0, y: 8, filter: 'blur(4px)', duration: 0.45 }, C + 0.9)
        .from('.oa-conf__high', { color: GRAY_600, duration: 0.45 }, C + 1.15) // the final signal stamp

      if (reduced) {
        tl.progress(1)
        return
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            tl.play()
            observer?.disconnect()
          }
        },
        { threshold: 0.25 },
      )
      observer.observe(section)
    }, section)

    return () => {
      observer?.disconnect()
      ctx.revert()
    }
  }, [reduced, variant, resolvedMode])

  /* ── quiet variant (landing page, motion ration): no timeline at all. The
       settled poster — the same end state the full scene composes — enters
       once with Attio's house QUIET grammar, CSS-only (blur 2px→0 + opacity,
       520ms, --ease-entrance, 140ms stagger across four groups). Latches on
       entry and never resets; reduced motion renders it settled with no
       transition (also enforced in CSS). ── */
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section || variant !== 'quiet') return

    if (reduced) {
      section.classList.add('oa--in')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add('oa--in')
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [reduced, variant])

  return (
    <section
      ref={sectionRef}
      className={`oa${resolvedMode !== 'off' ? ` oa--matrix-${resolvedMode}` : ''}${variant === 'quiet' ? ' oa--quiet' : ''}`}
      aria-labelledby="oa-title"
    >
      <div className="oa__container">
        <header className="oa__head">
          <h2 id="oa-title" className="oa-heading">
            An objection has parts.
          </h2>
          <p className="oa-body">
            We break objections into their core components
            <br />
            to reveal what&rsquo;s really being said.
          </p>
        </header>

        <div className="oa__composition">
          <div ref={stageRef} className="oa__stage">
            {/* the measured brackets — hidden in the narrow legend fallback */}
            {GROUPS.map((g) => (
              <Fragment key={g.label}>
                <div className={`oa-part oa-part--${g.pos}`} aria-hidden="true">
                  <span className="oa-part__bar" />
                  <span className="oa-part__cap oa-part__cap--l" />
                  <span className="oa-part__cap oa-part__cap--r" />
                  <span className="oa-part__conn" />
                  <span className="oa-part__label oa-mono">{g.label}</span>
                </div>
                {resolvedMode !== 'off' && (
                  <span
                    className="oa-part__matrix-anchor"
                    data-matrix-anchor={g.label.toLowerCase()}
                    aria-hidden="true"
                  >
                    <DotMatrix
                      state="resolved"
                      size={3}
                      ink={resolvedMode === 'full-ref' ? 'accent' : 'graphite'}
                    />
                  </span>
                )}
              </Fragment>
            ))}

            <p
              ref={sentenceRef}
              className="oa-sentence"
              aria-label="Buyer, on a live call: I’m not sure we can justify this now."
            >
              {WORDS.map((w, i) => (
                <span key={i} className="oa-word">
                  {w}
                  {i < WORDS.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>

            {/* graceful narrow fallback: the three parts as a stacked legend */}
            <ul className="oa-legend oa-mono" aria-hidden="true">
              {GROUPS.map((g) => (
                <li key={g.label} className="oa-legend__row">
                  <span className="oa-legend__label">{g.label}</span>
                  <span className="oa-legend__phrase">{g.phrase}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="oa__panel">
            <div className="oa-panel__row">
              <span className="oa-arrow" aria-hidden="true">
                {resolvedMode === 'full-ref' ? (
                  <DotMatrix state="converged" size={2} ink="accent" />
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path
                      d="M5 12h13M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <p className="oa-verdict">
                <strong>Underlying concern&nbsp;·</strong>
                <br />
                internal ROI case
              </p>
            </div>
            <span className="oa-panel__hr" aria-hidden="true" />
            {resolvedMode === 'off' ? (
              <p className="oa-conf oa-mono">
                confidence&nbsp;·&nbsp;<span className="oa-conf__high">high</span>
              </p>
            ) : (
              <div className="oa-conf oa-mono">
                <span className="oa-conf__matrix" aria-hidden="true">
                  <DotMatrix
                    state="resolved"
                    size={2}
                    ink={resolvedMode === 'full-ref' ? 'accent' : 'graphite'}
                  />
                </span>
                <span>
                  confidence&nbsp;·&nbsp;<span className="oa-conf__high">high</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
