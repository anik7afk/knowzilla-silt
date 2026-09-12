import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import DotMatrix, { type MatrixState } from './DotMatrix'
import './SharedTruth.css'

/* SharedTruth — a faithful build of design-assets/refs/shared-truth.png, staged
   as ONE choreographed scene ("three voices synchronize") on a single gsap
   timeline. See SharedTruth.css for the full concept + graceful-default note.

   Timeline (≈9.2s, one play per viewport entry, overlapping so beats cause
   each other):
     0.00  eyebrow + headline serif words reveal (gray→ink, de-blur, stagger),
           subcopy follows
     1.15  "same" flips to accent — the headline punchline, last beat
     1.50  ACCOUNT EXECUTIVE speaks: a 1.5px gray-600 rule DRAWS under its name
           for exactly as long as the voice is talking while the quote
           transcribes; as the voice finishes its branch TRAVELS from the dot
           along the bus to the junction (a 1.05s draw, not a reveal) and the
           live rule hands over to a quiet gray-400 hairline — that voice is
           now on the record
     2.85  SALES LEADER speaks + branch travels + rule settles
     4.20  REVENUE OPERATIONS speaks + branch travels + rule settles
     6.25  all three have landed on the junction: the trunk runs out of it, the
           node settles once (a quiet scale, no ping), the arrow completes
     6.45  the record LANDS — the raised surface-100 panel fades up (session 9
           R2: the one object in the section with weight, which the arrow is
           pointing at) — then sets like letterpress: "ONE ACCOUNT · ONE SHARED
           TRUTH" arrives (tracking tightens, blur clears), the rule draws, the
           three ledger rows resolve one by one and the graphite check closes it
     after ambient: stillness — the poster is finished and holds

   Connector: NOT converging beziers (they crossed and read as noise). The three
   voices run out on straight hairlines, round into a shared vertical bus and
   merge at one junction, which trunks into the node — a routing diagram, so the
   "many become one" is legible when frozen.

   Geometry (dot centres → bus → node) is measured off the real DOM and written
   imperatively so the SVG elements always exist for gsap to target and stay
   aligned at any width. No per-frame React state; gsap's ticker is the single
   rAF. Reduced motion / no-JS → the settled poster (CSS base). */

type Role = { label: string; quote: string }
export type MatrixMode = 'off' | 'state-only' | 'full-ref'

const ROLES: Role[] = [
  { label: 'Account Executive', quote: '“I know what to ask next.”' },
  { label: 'Sales Leader', quote: '“I can see risk before the forecast.”' },
  { label: 'Revenue Operations', quote: '“The CRM finally reflects reality.”' },
]

/* the record the three voices resolve to — the right block states what the
   diagram just did, in the mono/hairline ledger idiom (no decoration). */
const LEDGER: { key: string; value: string }[] = [
  { key: 'Account', value: 'Northwind' },
  { key: 'Voices on the call', value: '3 · in sync' },
  { key: 'Source of truth', value: 'One timeline' },
]

/* headline split into two lines; --w carries a continuous stagger index so the
   reveal flows across the break. "same" (index 6) is the accent punchline. */
const HEAD_LINES: { text: string; accent?: boolean }[][] = [
  [{ text: 'The' }, { text: 'whole' }, { text: 'revenue' }, { text: 'team' }],
  [{ text: 'hears' }, { text: 'the' }, { text: 'same', accent: true }, { text: 'account.' }],
]

/* GSAP tweens `color` to a literal, so these cannot be `var(--…)` — they are
   read off the root at module load, with the token's own value as fallback for
   SSR / a missing sheet. Same pattern as ObjectionAnatomy.tsx:37. */
function readColorToken(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const INK = readColorToken('--color-ink', '#161514')
const GRAY = readColorToken('--color-gray-400', '#d7d6d4') /* pre-reveal */
const ACCENT = readColorToken('--color-accent-600', '#6a77e5')

/* Normalised path length for every drawn stroke. NOT 1: gsap rounds px-unit
   values to integers, so a 0→1 dashoffset can only ever render as 1px or 0px —
   the draw snaps instead of travelling. 1000 gives 0.1% steps. */
const DASH = 1000

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
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
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return visible
}

/* Session 5 motion ration: the landing page gets `variant="quiet"` — the SAME
   settled poster (the exact end-state of the timeline below / of reduced
   motion), entered with Attio's house QUIET grammar only (blur 2px→0 + opacity,
   520ms, cubic-bezier(0.33,1,0.68,1), 120ms stagger across three groups), once
   on viewport entry, latched. No speaking sequence, no draws, no gsap. The
   standalone route /shared-truth keeps `variant="full"` — the whole scene,
   unchanged. The imperative geometry pass runs in BOTH (it is layout, not
   motion: without it the branch/trunk/arrow paths have no `d`). */
export default function SharedTruth({
  variant = 'full',
  matrixMode,
}: {
  variant?: 'full' | 'quiet'
  matrixMode?: MatrixMode
}) {
  const requestedMode =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('matrix')
  const resolvedMode: MatrixMode =
    matrixMode ??
    (requestedMode === 'state-only' || requestedMode === 'full-ref' ? requestedMode : 'off')
  return <Scene quiet={variant === 'quiet'} matrixMode={resolvedMode} />
}

function Scene({ quiet, matrixMode }: { quiet: boolean; matrixMode: MatrixMode }) {
  const rootRef = useRef<HTMLElement>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([])
  const lineRefs = useRef<Array<SVGPathElement | null>>([])
  const trunkRef = useRef<SVGPathElement>(null)
  const arrowRef = useRef<SVGPathElement>(null)
  const nodeRef = useRef<SVGCircleElement>(null)
  const nodeMatrixRef = useRef<HTMLDivElement>(null)

  const visible = useVisible(rootRef)
  const reduced = useReducedMotion()
  const settledMatrices = quiet || reduced
  const [voiceMatrixStates, setVoiceMatrixStates] = useState<MatrixState[]>(() =>
    Array.from({ length: ROLES.length }, () => (settledMatrices ? 'resolved' : 'idle')),
  )

  useEffect(() => {
    setVoiceMatrixStates(
      Array.from({ length: ROLES.length }, () => (settledMatrices ? 'resolved' : 'idle')),
    )
  }, [settledMatrices, matrixMode])

  const setVoiceMatrixState = (index: number, state: MatrixState) => {
    if (matrixMode !== 'full-ref') return
    setVoiceMatrixStates((current) =>
      current.map((value, i) => (i === index ? state : value)),
    )
  }

  /* ── measure dot centres → build converging paths + node + arrow ──────── */
  useLayoutEffect(() => {
    const flow = flowRef.current
    if (!flow) return

    const measure = () => {
      const box = flow.getBoundingClientRect()
      const w = box.width
      const h = box.height
      if (w === 0 || h === 0) return
      const dots = dotRefs.current.map((el) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }
      })
      if (dots.some((d) => !d)) return
      const pts = dots as { x: number; y: number }[]

      /* bus routing: each voice runs out horizontally (under its own quote, in
         the band the -0.4em text lift leaves clear), rounds into a shared
         vertical bus and merges at ONE junction on the middle row's baseline;
         the junction trunks into the node. Straight runs + fixed-radius
         corners, so the frozen frame reads as a routing diagram.

         The bus MUST clear the widest quote — a vertical crossing live text is
         what made the old converging beziers read as noise — so it is measured
         off the quote right edges, not off the container. Node + arrow follow
         it, borrowing the column gutter when the flow itself is short. */
      let quotesRight = 0
      flow.querySelectorAll('.st-row__text').forEach((el) => {
        quotesRight = Math.max(quotesRight, el.getBoundingClientRect().right - box.left)
      })
      const rightMostDot = Math.max(...pts.map((p) => p.x))
      const junctionX = Math.max(quotesRight + 42, rightMostDot + 56)
      // …but never so far that the arrow tip reaches the record's divider
      const node = { x: Math.min(Math.max(w - 56, junctionX + 42), w - 4), y: pts[1].y }
      const RADIUS = 14

      pts.forEach((p, i) => {
        const dy = node.y - p.y
        let d: string
        if (Math.abs(dy) < 1) {
          d = `M ${p.x} ${p.y} H ${junctionX}` // middle row runs straight in
        } else {
          const dir = Math.sign(dy)
          const r = Math.min(RADIUS, Math.abs(dy), junctionX - p.x)
          d =
            `M ${p.x} ${p.y} H ${junctionX - r}` +
            ` Q ${junctionX} ${p.y} ${junctionX} ${p.y + dir * r}` +
            ` V ${node.y}`
        }
        lineRefs.current[i]?.setAttribute('d', d)
      })

      trunkRef.current?.setAttribute('d', `M ${junctionX} ${node.y} H ${node.x}`)

      const nodeEl = nodeRef.current
      if (nodeEl) {
        nodeEl.setAttribute('cx', String(node.x))
        nodeEl.setAttribute('cy', String(node.y))
      }
      const nodeMatrix = nodeMatrixRef.current
      if (nodeMatrix) {
        nodeMatrix.style.left = `${node.x - 5}px`
        nodeMatrix.style.top = `${node.y - 5}px`
      }
      // short arrow continuing right out of the node, into the record. The
      // head is scaled for the session-9 2px stroke — at the old 7×9 chevron a
      // 2px line reads as a blunt stub instead of an arrow. Tip stays at ax−4,
      // ~43px clear of the raised panel's left edge at 1440.
      const ax = node.x + 40
      arrowRef.current?.setAttribute(
        'd',
        `M ${node.x + 10} ${node.y} H ${ax - 7} M ${ax - 12} ${node.y - 5} L ${ax - 4} ${node.y} L ${ax - 12} ${node.y + 5}`,
      )
    }

    measure()
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    fonts?.ready.then(measure).catch(() => {})
    const observer = new ResizeObserver(measure)
    observer.observe(flow)
    return () => observer.disconnect()
  }, [])

  /* ── the single choreographed timeline ────────────────────────────────── */
  useLayoutEffect(() => {
    if (quiet) return // rationed cut: settled poster + a CSS entrance, no timeline
    if (reduced) return // CSS base is the settled poster

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.st-row')
      const lines = gsap.utils.toArray<SVGPathElement>('.st-line--base')

      // hidden initial state (overrides the settled CSS base) — set before paint
      gsap.set('.st__eyebrow, .st__sub', { opacity: 0, y: 6 })
      gsap.set('.st-word', { opacity: 0, filter: 'blur(6px)', color: GRAY })
      gsap.set('.st-qword', { opacity: 0, filter: 'blur(5px)', color: GRAY })
      gsap.set('.st-row__rule', { scaleX: 0 })
      gsap.set('.st-row__rule-live', { scaleX: 0, opacity: 1 })
      gsap.set(lines, { strokeDashoffset: DASH })
      gsap.set('.st-trunk, .st-arrow', { strokeDashoffset: DASH })
      gsap.set('.st-node', { scale: 0, opacity: 0, transformOrigin: 'center' })
      /* the raised record panel — opacity only: a filter would blur its own
         shadow-card and it gains nothing over a clean fade-up */
      gsap.set('.st__truth', { opacity: 0 })
      gsap.set('.st__truth-title', { opacity: 0, filter: 'blur(6px)', letterSpacing: '0.3em' })
      gsap.set('.st__truth-rule', { scaleX: 0 })
      gsap.set('.st-led', { opacity: 0, y: 8 })
      gsap.set('.st-led__hair', { scaleX: 0 })
      gsap.set('.st-check__c, .st-check__k', { strokeDashoffset: DASH })
      gsap.set('.st__truth-sign-text', { opacity: 0 })

      if (!visible) return

      const SPEAK0 = 1.5
      const GAP = 1.35
      const tl = gsap.timeline()

      // eyebrow → headline reveal + the "same" punchline → subcopy
      tl.to('.st__eyebrow', { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0)
      tl.fromTo(
        '.st-word',
        { opacity: 0, filter: 'blur(6px)', color: GRAY },
        { opacity: 1, filter: 'blur(0px)', color: INK, duration: 0.55, stagger: 0.07, ease: 'power2.out' },
        0.18,
      )
        // the punchline — flips only after the whole line has settled to ink,
        // so there is no color conflict with the reveal tween above
        .to('.st-word--accent', { color: ACCENT, duration: 0.5, ease: 'power2.out' }, 1.15)
        .to('.st__sub', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.0)

      // three voices speak in turn; each line draws as its voice finishes
      rows.forEach((row, i) => {
        const live = row.querySelector('.st-row__rule-live')
        const rule = row.querySelector('.st-row__rule')
        const qwords = row.querySelectorAll('.st-qword')
        const t = SPEAK0 + i * GAP

        // the speaking indicator: NOT amplitude. A 1px accent rule draws under
        // the speaker's name for exactly as long as that voice is talking.
        tl.call(() => setVoiceMatrixState(i, 'listening'), [], t)
          .to(live, { scaleX: 1, duration: 0.95, ease: 'power1.inOut' }, t)
          .fromTo(
            qwords,
            { opacity: 0, filter: 'blur(5px)', color: GRAY },
            { opacity: 1, filter: 'blur(0px)', color: INK, duration: 0.5, stagger: 0.09, ease: 'power2.out' },
            t + 0.1,
          )
          // the voice finishes: its branch travels out to the bus…
          .to(lines[i], { strokeDashoffset: 0, duration: 1.05, ease: 'power2.inOut' }, t + 0.95)
          // …and the live rule hands over to a quiet gray hairline underneath —
          // that voice is now on the record, permanently, without moving again.
          .to(rule, { scaleX: 1, duration: 0.45, ease: 'power2.out' }, t + 0.95)
          .to(live, { opacity: 0, duration: 0.5, ease: 'power2.out' }, t + 1.0)
          .call(() => setVoiceMatrixState(i, 'resolved'), [], t + 1.05)
      })

      // the three branches have merged: the trunk runs out of the junction, the
      // node settles once (no ping), the arrow completes into the record
      tl.to('.st-trunk', { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 6.25)
        .fromTo(
          '.st-node',
          { scale: 0, opacity: 0, transformOrigin: 'center' },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' },
          6.6,
        )
        .to('.st-arrow', { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, 6.9)

      // the record LANDS (the raised panel the arrow is pointing at) and then
      // sets like letterpress: title arrives, the rule draws, the ledger rows
      // resolve one by one, the graphite check closes it
      tl.to('.st__truth', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 6.45)
        .to(
          '.st__truth-title',
          { opacity: 1, filter: 'blur(0px)', letterSpacing: '0.02em', duration: 0.75, ease: 'power3.out' },
          6.9,
        )
        .to('.st__truth-rule', { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, 7.4)
        .to('.st-led__hair', { scaleX: 1, duration: 0.45, ease: 'power2.inOut', stagger: 0.18 }, 7.6)
        .to('.st-led', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.18 }, 7.7)
        .to('.st-check__c, .st-check__k', { strokeDashoffset: 0, duration: 0.55, ease: 'power2.out', stagger: 0.15 }, 8.45)
        .to('.st__truth-sign-text', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 8.7)
    }, rootRef)

    return () => ctx.revert()
  }, [visible, reduced, quiet, matrixMode])

  /* quiet: hidden-then-entered is carried entirely by two classes. `visible`
     latches (the observer disconnects on first intersection), so this never
     resets; reduced motion arms it on the first paint and the CSS drops the
     transitions, so the poster is simply there. */
  const armed = quiet && (reduced || visible)

  return (
    <section
      ref={rootRef}
      className={`st${matrixMode !== 'off' ? ` st--matrix-${matrixMode}` : ''}${quiet ? ' st--quiet' : ''}${armed ? ' is-in' : ''}`}
      aria-labelledby="st-title"
    >
      <div className="st__container">
        <p className="st__eyebrow">The shared record</p>
        <h2 id="st-title" className="st__headline">
          {HEAD_LINES.map((line, li) => (
            <span className="st__line" key={li}>
              {line.map((word, k) => (
                <span key={k} className={`st-word${word.accent ? ' st-word--accent' : ''}`}>
                  {word.text}
                  {k < line.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
          ))}
        </h2>

        <p className="st__sub">
          The rep, the manager and ops work every handoff from the same record — one call, one
          playbook, nothing re-litigated after the fact.
        </p>

        <div className="st__diagram">
          <div ref={flowRef} className="st__flow">
            {/* bus branches + trunk + node + arrow — geometry written imperatively */}
            <svg ref={svgRef} className="st__lines" aria-hidden="true">
              {ROLES.map((_, i) => (
                <path
                  key={i}
                  ref={(el) => {
                    lineRefs.current[i] = el
                  }}
                  className="st-line st-line--base"
                  d=""
                  pathLength={DASH}
                />
              ))}
              <path ref={trunkRef} className="st-line st-trunk" d="" pathLength={DASH} />
              <path ref={arrowRef} className="st-arrow" d="" pathLength={DASH} />
              <circle
                ref={nodeRef}
                className={`st-node${matrixMode !== 'off' ? ' st-node--circle' : ''}`}
                cx="0"
                cy="0"
                r="5.5"
              />
            </svg>
            {matrixMode !== 'off' && (
              <div ref={nodeMatrixRef} className="st-node st-node-matrix" aria-hidden="true">
                <DotMatrix state="converged" size={3} ink="accent" />
              </div>
            )}

            <div className="st__roles">
              {ROLES.map((role, i) => (
                <div className="st-row" key={role.label}>
                  <div className="st-row__id">
                    <span className={`st-row__label${matrixMode === 'full-ref' ? ' st-row__label--matrix' : ''}`}>
                      {matrixMode === 'full-ref' && (
                        <DotMatrix state={voiceMatrixStates[i]} size={2} ink="graphite" />
                      )}
                      {role.label}
                    </span>
                    {/* speaking indicator — a drawn rule, never an amplitude
                        readout: a stronger neutral while the voice talks, then
                        a settled gray-400 hairline once it is on the record */}
                    <span className="st-row__rules" aria-hidden="true">
                      <span className="st-row__rule" />
                      <span className="st-row__rule-live" />
                    </span>
                  </div>
                  <div className="st-row__quote">
                    <span className="st-row__text">
                      {role.quote.split(' ').map((word, k, arr) => (
                        <span className="st-qword" key={k}>
                          {word}
                          {k < arr.length - 1 ? ' ' : ''}
                        </span>
                      ))}
                    </span>
                    {/* the branch rail: the dot is the terminal of this voice's
                        line and sits ON the same rail y as the label's hairline
                        opposite it, so name + utterance ride ONE rail. It lives
                        BELOW the words (not beside them) — at the old inline
                        placement the measured line ran through the quote's own
                        glyph box and clipped the closing quote mark. */}
                    <span className="st-row__rail" aria-hidden="true">
                      <span
                        className="st-row__dot"
                        ref={(el) => {
                          dotRefs.current[i] = el
                        }}
                      />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* the record the three voices resolve to — a ledger, not a flourish:
              it states what the diagram just produced, then signs off. Session 9
              R2: this is the one RAISED object in the section (the vertical
              divider it used to carry is gone — the panel edge is the division). */}
          <div className="st__truth">
            <h3 className="st__truth-title">
              One account &middot;
              <br />
              One shared truth
            </h3>
            <span className="st__truth-rule" aria-hidden="true" />
            <dl className="st__ledger">
              {LEDGER.map((row) => (
                <div className="st-led" key={row.key}>
                  <span className="st-led__hair" aria-hidden="true" />
                  <dt className="st-led__k">{row.key}</dt>
                  <dd className="st-led__v">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="st__truth-sign">
              <svg className="st-check" viewBox="0 0 34 34" aria-hidden="true">
                <circle className="st-check__c" cx="17" cy="17" r="13" pathLength={DASH} />
                <path className="st-check__k" d="M11 17.5l4.2 4.2 7.6-9.2" pathLength={DASH} />
              </svg>
              {matrixMode !== 'off' && (
                <span className="st__truth-status-matrix" aria-hidden="true">
                  <DotMatrix
                    state="resolved"
                    size={2}
                    /* the full-ref ink (the retired warm ramp) is gone as of
                       this section's accent budget is already spent on two
                       lavender marks, so both matrix modes now render graphite.
                       full-ref is off by default and was never shipped. */
                    ink="graphite"
                  />
                </span>
              )}
              {/* verbatim: knowzilla.eu/en/solutions/teams/sales-managers hero.
                  Replaces "Written back the moment the call ends", which restated
                  WriteBack's point one section earlier; this one names THIS
                  section's subject — rep, manager and ops on one record. */}
              <span className="st__truth-sign-text">
                Coach your whole team, not just the ones you can hear
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
