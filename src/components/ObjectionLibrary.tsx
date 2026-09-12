import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Ban, Check, Copy, Flag, SquareCheck, TriangleAlert } from 'lucide-react'
import './ObjectionLibrary.css'

/* ObjectionLibrary — the donor's tabbed card, carrying Knowzilla's real
 * post-call artefact: the four intel lists a session hands back.
 *
 * PATTERN PROVENANCE (N): natural.com §s04 "apiExplorer" — a centered pill tab
 * row over a white card with a tinted header strip (three window dots left, a
 * quiet text action right) and monospaced content, the whole block sitting on a
 * textured light ground. Measured values carried over from
 * inspo/natural/DESIGN.md §apiExplorer: tab row 38px tall, tab padding 9px/10px,
 * tabs→card gap 20px (panel 238 − tabs 38 − terminal 180), card radius 8px
 * (donor radii table, count 5), hairline 1px #ECECEB. Everything fitted rather
 * than measured is marked ~ at the site.
 *
 * CONTENT PROVENANCE (product video, design-assets/refs/session7/knowzilla-app/
 * PRODUCT-NOTES.md §3.6): the post-call **Session Review** screen presents its
 * AI-extracted intel as four editable list panels — PAIN POINTS, GOALS,
 * BLOCKERS, DECISION CRITERIA — "each with its own icon and colour", under a
 * "Review before saving →" status chip, with "Session duration: 04:44" beneath.
 * Those four labels, their four glyphs (⚠ ⚑ ⊘ ☑), the per-panel colour, that
 * chip, that duration line and the header's Copy-with-no-Send action are all
 * verbatim. The tabs are those four panels; the card is one session's review.
 *
 * SAMPLE COPY (flagged, per the do-not-invent list): the sixteen list rows are
 * OURS — written for Northwind Traders in the product's own vocabulary (§5:
 * economic buyer, technical champion, budget range, timeline and milestones,
 * RFP process, assess fit, intel). Only their SHAPE is evidenced. Two rows
 * paraphrase real ones ("Confirm budget range", "Confirm timeline and
 * milestones", "Assess fit", "Involvement of … economic buyer, technical
 * champions", "Clear budget range" are verbatim goal/criterion strings).
 *
 * Deliberately NOT here, per the notes' do-not-invent list: any objection
 * taxonomy (the only category pill ever rendered is "ASK"), source/evidence
 * citations, confidence scores, latency readouts, sentiment meters, a live
 * transcript. The list rows are also not interactive: the real screen has a per-
 * row × and Skip / Confirm & Save buttons, and a dead control in a marketing
 * card is worse than an honest one, so the review step is carried by the chip
 * alone.
 *
 * SESSION 9 — the four refinements the user asked for.
 *
 * 1. FOUR TABS THAT READ DIFFERENT. Each category now owns a glyph tint from an
 *    owned ramp (risk-900 / accent-600 / gray-900 / won-900 — all ≤14px marks,
 *    never a fill) AND a different ROW GRAMMAR, because these are not the same
 *    shape of thing: a pain point is a complaint (bare glyph, tight rows), a
 *    goal is an ordered agenda (mono ordinal gutter), a blocker is a gate
 *    (hairline-separated bands, heavier rhythm), a criterion is a checklist
 *    item (boxed check marker). Structure and emphasis only — no invented data
 *    fields (no owners, dates, states, scores, sources).
 * 2. EMPHASIS. Every row is now [lead, key, tail]: the phrase that actually
 *    matters is ink at 550, the connective text steps back to gray-700. One
 *    emphasised span per row, chosen for meaning.
 * 3. DEPTH THAT MEANS SOMETHING (contract R2). The card interior is now a
 *    tinted bed (surface-300) carrying the session's flat metadata — room name,
 *    status chip, duration — and the extracted intel LIFTS off it as a
 *    surface-100 sheet (hairline-2 + radius-card + shadow-frame). The answer is
 *    the thing that floats; the notes around it stay on the paper. Literal
 *    glassmorphism was built and rejected — see the note at .ol-intel.
 * 4. THE SWITCH. The active indicator is ONE persistent element that travels
 *    (see .ol-pill); the sheet measures the incoming panel and eases its height
 *    to it while the two panels cross-fade with a directional offset; and the
 *    tabs advance by themselves.
 *
 * MOTION CLASS: QUIET (CLAUDE.md §3.3) + ONE GRANTED EXCEPTION. The entrance is
 * unchanged: three groups (heading → tabs → card), blur(4px)→0 + opacity, 520ms
 * on --ease-entrance, 140ms stagger, latched by an IntersectionObserver that
 * disconnects on first hit. The exception is AUTO-ADVANCE — the user asked for
 * it explicitly ("it should switch between by itself too like animation"), so
 * the tab cycles every 5.2s. It is bounded, not ambient: it only runs while the
 * card is in the middle of the viewport, it pauses on hover/focus inside the
 * section, it STOPS FOREVER on the first real interaction (click, arrow key,
 * Copy) because a human who has taken over must never have the panel yanked out
 * from under them, and it does not exist at all under prefers-reduced-motion.
 * The dwell clock IS the progress bar's WAAPI animation, so pause/resume and
 * the visible hint can never disagree.
 *
 * NO REFLOW, PROVABLY. The sheet eases to the active panel's measured height
 * and a spacer below it eases by exactly the complement up to the tallest
 * panel, on the same curve over the same 420ms — so their sum is constant in
 * every frame and the card's box is still even mid-transition, not just at the
 * ends. Heights are kept fresh by a ResizeObserver on all four panels.
 */

type Row = {
  /** text before the emphasised phrase */
  lead: string
  /** the phrase that carries the meaning — ink, 550 */
  key: string
  /** text after it */
  tail: string
}

type Shape = 'complaint' | 'agenda' | 'gate' | 'criterion'

type Panel = {
  id: string
  /** tab label */
  label: string
  /** the panel label as the product's own UI writes it */
  uiLabel: string
  Icon: typeof Flag
  /** row grammar — see refinement 1 */
  shape: Shape
  /** the extracted intel: what one call produced for this list */
  rows: Row[]
}

/* Deal room follows the product's own naming ("Acme Discovery24", §5) with the
   page's standing cast: Northwind Traders, Dana Whitfield, Sam Carter. */
const ROOM = 'Northwind Discovery24'
const DURATION = '04:44' // (product video §3.6, verbatim)

const PANELS: Panel[] = [
  {
    id: 'pain-points',
    label: 'Pain Points',
    uiLabel: 'Pain points',
    Icon: TriangleAlert,
    shape: 'complaint',
    rows: [
      {
        lead: 'Renewal quotes are assembled by hand — ',
        key: 'three weeks of spreadsheet work',
        tail: ' a cycle.',
      },
      {
        lead: '',
        key: 'Two systems of record',
        tail: ' for EU accounts, so pricing approvals stall in email.',
      },
      {
        lead: 'Finance sees committed revenue ',
        key: 'only once the quarter has closed',
        tail: '.',
      },
      {
        lead: 'The last two renewals ',
        key: 'slipped a quarter',
        tail: ' waiting on a data-residency answer.',
      },
    ],
  },
  {
    id: 'goals',
    label: 'Goals',
    uiLabel: 'Goals',
    Icon: Flag,
    shape: 'agenda',
    rows: [
      {
        lead: 'Confirm ',
        key: 'budget range',
        tail: ' for the EU rollout before the Q4 planning lock.',
      },
      { lead: 'Identify the ', key: 'economic buyer', tail: ' above Dana Whitfield.' },
      {
        lead: 'Confirm ',
        key: 'timeline and milestones',
        tail: ' for the January renewal.',
      },
      {
        lead: 'Assess fit for the ',
        key: 'residency schedule',
        tail: ' with Northwind’s security review.',
      },
    ],
  },
  {
    id: 'blockers',
    label: 'Blockers',
    uiLabel: 'Blockers',
    Icon: Ban,
    shape: 'gate',
    rows: [
      {
        lead: 'Legal will not review terms until the ',
        key: 'data-residency schedule',
        tail: ' is attached.',
      },
      {
        lead: '',
        key: 'No economic buyer identified',
        tail: ' — Dana confirms she cannot sign alone.',
      },
      {
        lead: 'Procurement runs a formal ',
        key: 'RFP process',
        tail: ' above the current contract value.',
      },
      {
        lead: 'Security review is queued behind Northwind’s own audit ',
        key: 'until mid-November',
        tail: '.',
      },
    ],
  },
  {
    id: 'decision-criteria',
    label: 'Decision Criteria',
    uiLabel: 'Decision criteria',
    Icon: SquareCheck,
    shape: 'criterion',
    rows: [
      {
        lead: '',
        key: 'Clear budget range',
        tail: ' agreed with finance before a proposal is issued.',
      },
      {
        lead: 'Involvement of the ',
        key: 'economic buyer',
        tail: ' and Northwind’s technical champion.',
      },
      { lead: '', key: 'EU data residency', tail: ' documented in the schedule, not in email.' },
      {
        lead: 'Migration off the ',
        key: 'second system of record',
        tail: ' inside one renewal cycle.',
      },
    ],
  },
]

const rowText = (row: Row) => `${row.lead}${row.key}${row.tail}`

/** what the header's Copy action puts on the clipboard: the list, as text */
const asText = (panel: Panel) =>
  [panel.uiLabel.toUpperCase(), ...panel.rows.map(rowText)].join('\n')

const COPIED_MS = 1600

/* Auto-advance dwell. 5.2s: four rows at ~12 words is a ~4s read at 200wpm, so
   this leaves a beat to land on before it moves — and it is short enough that a
   passer-by sees the second tab arrive without waiting. */
const DWELL_MS = 5200

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

const sameNumbers = (a: number[], b: number[]) =>
  a.length === b.length && a.every((n, i) => n === b[i])

export default function ObjectionLibrary({
  variant = 'full',
}: {
  variant?: 'full' | 'quiet'
} = {}) {
  const sectionRef = useRef<HTMLElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const panelRefs = useRef<Array<HTMLDivElement | null>>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const reduced = useReducedMotion()

  /* ── QUIET entrance: once, on entry, latched. Reduced motion renders settled ── */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (reduced) {
      section.classList.add('ol--in')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add('ol--in')
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [reduced])

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    }
  }, [])

  /* ── the travelling pill ──────────────────────────────────────────────────
     ONE element, measured against the active tab's box and moved with a
     transform. A per-tab background toggle is what made the switch read as a
     jump-cut; this reads as the selection sliding. Width/height are animated
     alongside the transform rather than folded into a scaleX because the pill
     has an 8px radius and a --shadow-frame: scaling it stretches both. It is
     out of flow with `contain: strict` (see the CSS), so its size change costs
     no page layout — the trace across a switch is clean. */
  const [pill, setPill] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [armed, setArmed] = useState(false)

  useLayoutEffect(() => {
    const measure = () => {
      const list = tabsRef.current
      const el = tabRefs.current[active]
      if (!list || !el) return
      const lr = list.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      const next = {
        x: Math.round((er.left - lr.left) * 100) / 100,
        y: Math.round((er.top - lr.top) * 100) / 100,
        w: Math.round(er.width * 100) / 100,
        h: Math.round(er.height * 100) / 100,
      }
      setPill((prev) =>
        prev && prev.x === next.x && prev.y === next.y && prev.w === next.w && prev.h === next.h
          ? prev
          : next,
      )
    }
    measure()

    const ro = new ResizeObserver(measure)
    if (tabsRef.current) ro.observe(tabsRef.current)
    tabRefs.current.forEach((t) => t && ro.observe(t))
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [active])

  /* Arm the transitions one frame after the first measured paint, so the pill
     never travels in from 0,0 on mount. */
  useEffect(() => {
    const id = requestAnimationFrame(() => setArmed(true))
    return () => cancelAnimationFrame(id)
  }, [])

  /* ── panel heights: the sheet eases to the incoming panel, the card does not
        move. `heights` is every panel's natural height (all four are always in
        the DOM, absolutely stacked, so all four are always measurable). ───── */
  const [heights, setHeights] = useState<number[]>([])

  useLayoutEffect(() => {
    const measure = () => {
      const next = panelRefs.current.map((p) => (p ? Math.ceil(p.getBoundingClientRect().height) : 0))
      setHeights((prev) => (sameNumbers(prev, next) ? prev : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    panelRefs.current.forEach((p) => p && ro.observe(p))
    document.fonts?.ready.then(measure).catch(() => {})
    return () => ro.disconnect()
  }, [])

  /* The card cannot move, by construction. The sheet takes the active panel's
     height and a spacer below it takes exactly the remainder up to the tallest
     panel, both eased with the same curve over the same 420ms — so their sum is
     the tallest panel's height in EVERY frame, not just at the ends. (A
     min-height reservation on the body was tried first and drifted a pixel at
     some widths, and a 1px card jump is still a jump.) */
  const tallest = heights.length ? Math.max(...heights) : 0
  const slack = tallest && heights[active] ? tallest - heights[active] : 0

  /* ── auto-advance (granted exception — see the header) ─────────────────── */
  const [inView, setInView] = useState(false)
  const [paused, setPaused] = useState(false)
  const [tookOver, setTookOver] = useState(false)
  const remainingRef = useRef(DWELL_MS)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // the card has to be in the middle band of the viewport, not merely
      // touching it — the dwell should burn while it is being looked at
      { rootMargin: '-12% 0px -12% 0px', threshold: 0 },
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  /* A fresh dwell whenever the tab changes. Declared BEFORE the clock effect so
     it runs after that effect's cleanup has banked the leftover time. */
  useEffect(() => {
    remainingRef.current = DWELL_MS
  }, [active])

  const running = !reduced && !tookOver && inView && !paused

  useEffect(() => {
    const bar = progressRef.current
    if (!bar || !running) return
    const anim = bar.animate(
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: DWELL_MS, easing: 'linear', fill: 'forwards' },
    )
    // resume where the pause left off rather than restarting the read
    anim.currentTime = DWELL_MS - remainingRef.current
    anim.onfinish = () => setActive((i) => (i + 1) % PANELS.length)
    return () => {
      const played = typeof anim.currentTime === 'number' ? anim.currentTime : DWELL_MS
      remainingRef.current = Math.max(0, DWELL_MS - played)
      anim.cancel()
    }
  }, [running, active])

  /* Any real interaction is a takeover: the human is driving now, so the panel
     must never move again on its own. */
  const takeOver = useCallback(() => setTookOver(true), [])

  const select = useCallback((index: number) => {
    setActive(index)
    setCopied(false)
    if (copiedTimer.current) clearTimeout(copiedTimer.current)
  }, [])

  /* Roving tabindex + arrow keys, automatic activation (the panel follows the
     focus, which is the correct pattern when a panel holds nothing focusable). */
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = PANELS.length - 1
    let next = -1
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    if (next < 0) return
    event.preventDefault()
    takeOver()
    select(next)
    tabRefs.current[next]?.focus()
  }

  const onCopy = async () => {
    takeOver()
    try {
      await navigator.clipboard.writeText(asText(PANELS[active]))
    } catch {
      // No clipboard permission (or no secure context) — stay silent rather
      // than logging; a failed copy must not announce success either.
      return
    }
    setCopied(true)
    if (copiedTimer.current) clearTimeout(copiedTimer.current)
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_MS)
  }

  /* hover/focus anywhere in the interactive block holds the clock */
  const hold = {
    onPointerEnter: () => setPaused(true),
    onPointerLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: () => setPaused(false),
  }

  return (
    <section
      ref={sectionRef}
      className={`ol${variant === 'quiet' ? ' ol--quiet' : ''}${armed ? ' ol--armed' : ''}`}
      aria-labelledby="ol-title"
    >
      {/* Textured ground (N s04): a faint lavender wash over surface-300 plus a
          static grain tile. Two layers so the wash and the grain can carry
          different opacities. Never animated, never hit-tested. */}
      <span className="ol__wash" aria-hidden="true" />
      <span className="ol__grain" aria-hidden="true" />

      <div className="ol__container">
        <header className="ol__head">
          <h2 id="ol-title" className="ol-heading">
            The call ends.
            <span className="ol-heading__line2">The intel is already written.</span>
          </h2>
          <p className="ol-sub">
            {/* verbatim: knowzilla.eu blog, /personal-selling-repeatable-sales-process
                (2026-07-20) — the corpus's one crisp CRM write-back sentence. */}
            After the call, AI turns the conversation into structured CRM notes, tasks,
            and follow-up drafts.
          </p>
        </header>

        <div
          ref={tabsRef}
          className="ol__tabs"
          role="tablist"
          aria-label="Session review lists"
          {...hold}
        >
          {/* the one travelling indicator */}
          <span
            className="ol-pill"
            aria-hidden="true"
            style={
              pill
                ? {
                    transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`,
                    width: `${pill.w}px`,
                    height: `${pill.h}px`,
                    opacity: 1,
                  }
                : undefined
            }
          >
            {/* the dwell clock, made visible — neutral per contract R1 */}
            <span ref={progressRef} className="ol-pill__progress" />
          </span>

          {PANELS.map((panel, i) => {
            const isActive = i === active
            return (
              <button
                key={panel.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`ol-tab-${panel.id}`}
                aria-selected={isActive}
                aria-controls={`ol-panel-${panel.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`ol-tab ol-tab--${panel.shape} kz-hover kz-focus-ring${
                  isActive ? ' is-active' : ''
                }`}
                onClick={() => {
                  takeOver()
                  select(i)
                }}
                onKeyDown={(event) => onTabKeyDown(event, i)}
              >
                <panel.Icon size={15} strokeWidth={1.5} aria-hidden="true" />
                <span>{panel.label}</span>
              </button>
            )
          })}
        </div>

        <div ref={cardRef} className="ol__card" {...hold}>
          <div className="ol-card__head">
            {/* The donor's card carries three terminal dots. Dropped 2026-07-25:
              * this card is a session record, not a window, so the dots were
              * borrowed chrome that meant nothing here — and they put the
              * window-chrome idiom at 3 against a cap of 2, adjacent to
              * WriteBack. The header strip's tint + hairline hold the head on
              * their own. */}
            <span className="ol-card__label">Session record</span>
            <button type="button" className="ol-copy kz-hover kz-focus-ring" onClick={onCopy}>
              <span>{copied ? 'Copied' : 'Copy'}</span>
              {copied ? (
                <Check size={13} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Copy size={13} strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Tinted bed: the session's own flat metadata. */}
          <div className="ol-card__body">
            <div className="ol-room">
              <p className="ol-room__name">{ROOM}</p>
              {/* verbatim status chip from the Session Review screen */}
              <span className="ol-room__chip">Review before saving&nbsp;→</span>
            </div>

            {/* The lifted sheet: what the AI wrote. Contract R2 — the resolved
                answer is the thing that floats, the notes stay on the paper. */}
            <div className="ol-intel">
              <div
                className="ol-intel__stack"
                style={heights[active] ? { height: `${heights[active]}px` } : undefined}
              >
                {PANELS.map((panel, i) => {
                  const isActive = i === active
                  return (
                    <div
                      key={panel.id}
                      ref={(el) => {
                        panelRefs.current[i] = el
                      }}
                      role="tabpanel"
                      id={`ol-panel-${panel.id}`}
                      aria-labelledby={`ol-tab-${panel.id}`}
                      className={`ol-panel ol-panel--${panel.shape}${isActive ? ' is-active' : ''}`}
                      tabIndex={isActive ? 0 : -1}
                      /* Rest offset is signed by position, so the outgoing panel
                         always leaves the way you came from and the incoming one
                         always arrives from the way you are going — in both
                         directions, with no JS bookkeeping. */
                      style={
                        {
                          '--ol-off': i < active ? '-8px' : i > active ? '8px' : '0px',
                        } as React.CSSProperties
                      }
                    >
                      <p className="ol-micro">
                        <panel.Icon
                          className="ol-micro__glyph"
                          size={14}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span>{panel.uiLabel}</span>
                      </p>

                      <ul className="ol-items">
                        {panel.rows.map((row, r) => (
                          <li key={row.key} className="ol-row">
                            {/* one marker per grammar: an ordinal for the
                                agenda, a ticked box for a criterion, the
                                category's own glyph otherwise */}
                            <span className="ol-row__marker" aria-hidden="true">
                              {panel.shape === 'agenda' ? (
                                String(r + 1).padStart(2, '0')
                              ) : panel.shape === 'criterion' ? (
                                <Check size={12} strokeWidth={2.25} />
                              ) : (
                                <panel.Icon size={13} strokeWidth={1.75} />
                              )}
                            </span>
                            <span className="ol-row__text">
                              {row.lead}
                              <strong className="ol-row__key">{row.key}</strong>
                              {row.tail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* the sheet's complement — see the note on `slack` above */}
            <div className="ol-slack" style={{ height: `${slack}px` }} aria-hidden="true" />

            <p className="ol-duration">Session duration {DURATION}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
