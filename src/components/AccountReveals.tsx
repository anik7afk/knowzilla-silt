import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './AccountReveals.css'

/* Account reveals — a faithful clone of design-assets/refs/account-reveals.png.
   Four zones bounded by full-height hairlines: intro | source rail | transcript
   | RESOLVED NOW. The resting frame matches the reference exactly; a single rAF
   loop only descends the hollow playhead node down the dotted line, fades in the
   11:52 framed band, and lands the resolution cards. Turn centers / card
   triggers are measured off the real DOM so the choreography stays aligned at
   any width. (Architecture mirrors KineticConversation.tsx.) */

type Turn = {
  time: string
  who: string
  rep: boolean
  focus?: boolean
  lines: string[]
}

const TURNS: Turn[] = [
  {
    time: '11:14',
    who: 'Jordan (Northwind)',
    rep: false,
    lines: ['… our current process is holding us', 'back during renewals.'],
  },
  {
    time: '11:38',
    who: 'Alex (Rep)',
    rep: true,
    lines: ['Understood. What’s most important', 'to fix first?'],
  },
  {
    time: '11:52',
    who: 'Jordan (Northwind)',
    rep: false,
    focus: true,
    lines: ['It’s the inconsistent pricing.', 'We need more predictability.'],
  },
  {
    time: '12:07',
    who: 'Alex (Rep)',
    rep: true,
    lines: ['Makes sense. How does timing', 'look on your end?'],
  },
  {
    time: '12:21',
    who: 'Jordan (Northwind)',
    rep: false,
    lines: ['We’re targeting a rollout in', 'budget cycle aligns.'],
  },
  {
    time: '12:35',
    who: 'Alex (Rep)',
    rep: true,
    lines: ['Got it. I’ll share options that', 'match both timing and budget.'],
  },
  {
    time: '12:51',
    who: 'Jordan (Northwind)',
    rep: false,
    lines: ['Thanks. Let’s also loop in', 'finance early.'],
  },
]

const FOCUS_INDEX = TURNS.findIndex((t) => t.focus) // 11:52

/* source rail labels (top→bottom), drawn statically like the reference */
const SOURCES = ['CRM', 'EMAIL', 'PRICING', 'CALENDAR']

/* the resolution column; each row lands when the playhead crosses a point in
   the transcript. `at` is the turn whose center triggers it; `offset` nudges
   the "11:58" card to land just after the pricing turn, between 11:52 & 12:07. */
type CardDef = { icon: 'dollar' | 'user' | 'calendar'; title: string; time: string; at: number; offset: number }
const CARDS: CardDef[] = [
  { icon: 'dollar', title: 'Pricing concern', time: '11:52', at: 2, offset: 0 },
  // nbsp keeps the value together so the title wraps at the "·" like the ref
  { icon: 'user', title: 'Champion · Jordan Blake', time: '11:58', at: 2, offset: 0.5 },
  { icon: 'calendar', title: 'Rollout · June 30', time: '12:21', at: 4, offset: 0 },
]

/* timeline (ms) */
const DURATION = 8400 // playhead top → bottom
const HOLD = 1600 // rest on the composed frame
const FADE = 1000 // fade out, clear, blank gap before restart
const CYCLE = DURATION + HOLD + FADE

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

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
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.1,
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return visible
}

type Scene = { reached: number; cards: number; resetting: boolean }

function CardIcon({ kind }: { kind: CardDef['icon'] }) {
  return (
    <svg viewBox="0 0 40 40" className="ar-card__icon" aria-hidden="true">
      <circle cx="20" cy="20" r="15.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
      {kind === 'dollar' && (
        <>
          <path d="M20 12.5v15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M23.5 16.2c0-1.7-1.6-2.8-3.5-2.8s-3.5 1-3.5 2.7c0 3.8 7 1.8 7 5.7 0 1.8-1.6 2.9-3.5 2.9s-3.5-1-3.5-2.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'user' && (
        <>
          <circle cx="20" cy="17" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M13.5 27c0-3.4 2.9-5.6 6.5-5.6s6.5 2.2 6.5 5.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'calendar' && (
        <>
          <rect x="13" y="14" width="14" height="13" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 18h14M17 12v3M23 12v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

/* `variant`:
   - 'full'  — the scripted scene (standalone route /account-reveals). Unchanged.
   - 'quiet' — the landing-page ration (design.md §3 Motion ration): the SETTLED
     frame only (rail drawn, 11:52 row hot, all three cards resolved), entering
     once on viewport with Attio's QUIET grammar (blur→0 + opacity, ~520ms,
     ease-entrance, 160ms stagger across four groups). No playhead travel, no
     ambient motion afterward; the entrance latches and never resets. */
export default function AccountReveals({
  variant = 'full',
}: {
  variant?: 'full' | 'quiet'
}) {
  const quiet = variant === 'quiet'
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const turnRefs = useRef<Array<HTMLDivElement | null>>([])
  const geomRef = useRef<{ centers: number[]; cardY: number[]; top: number; bottom: number }>({
    centers: [],
    cardY: [],
    top: 0,
    bottom: 0,
  })
  const sceneRef = useRef<Scene>({ reached: 0, cards: 0, resetting: false })

  const visible = useVisible(sectionRef)
  const reduced = useReducedMotion()
  const [scene, setScene] = useState<Scene>({ reached: 0, cards: 0, resetting: false })
  /* quiet entrance latch — set once when the section first enters, never unset */
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    if (visible) setEntered(true)
  }, [visible])

  /* measure turn centers + card triggers off the real DOM */
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const measure = () => {
      const turns = turnRefs.current
      const centers = turns.map((el) => (el ? el.offsetTop + el.offsetHeight / 2 : 0))
      if (!centers.length) return
      const cardY = CARDS.map((c) => {
        const base = centers[c.at] ?? 0
        const next = centers[c.at + 1] ?? base + 60
        return base + (next - base) * c.offset
      })
      geomRef.current = {
        centers,
        cardY,
        top: centers[0],
        bottom: centers[centers.length - 1],
      }
    }

    measure()
    document.fonts?.ready.then(measure).catch(() => {})
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const playhead = playheadRef.current
    if (!playhead) return

    const paint = (reached: number, cards: number, resetting: boolean) => {
      const prev = sceneRef.current
      if (prev.reached !== reached || prev.cards !== cards || prev.resetting !== resetting) {
        const next = { reached, cards, resetting }
        sceneRef.current = next
        setScene(next)
      }
    }

    const setNode = (y: number) => {
      playhead.style.transform = `translate3d(0, ${y}px, 0)`
    }

    /* reduced motion — and the quiet ration — → the reference frame, static:
       node parked on the 11:52 row, its band shown, all three cards resolved. */
    if (reduced || quiet) {
      const park = () => setNode(geomRef.current.centers[FOCUS_INDEX] || 0)
      park()
      paint(FOCUS_INDEX + 1, CARDS.length, false)
      document.fonts?.ready.then(park).catch(() => {})
      return
    }

    if (!visible) return

    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const cycleT = (now - t0) % CYCLE
      const { centers, cardY, top, bottom } = geomRef.current

      const resetting = cycleT >= DURATION + HOLD
      const p = cycleT < DURATION ? clamp01(cycleT / DURATION) : 1
      const y = resetting ? top : top + (bottom - top) * p
      setNode(y)

      if (resetting) {
        paint(0, 0, true)
      } else {
        let reached = 0
        for (const c of centers) if (y >= c - 0.5) reached++
        let cards = 0
        for (const cy of cardY) if (y >= cy - 0.5) cards++
        paint(reached, cards, false)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible, reduced, quiet])

  const focusReached = scene.reached > FOCUS_INDEX

  return (
    <section
      ref={sectionRef}
      className={['ar', quiet ? 'ar--quiet' : '', quiet && entered ? 'is-entered' : '']
        .filter(Boolean)
        .join(' ')}
      aria-labelledby="ar-title"
    >
      <div className="ar__grid">
        {/* ── (a) intro ───────────────────────────────────────────────── */}
        <div className="ar__intro">
          <p className="ar__eyebrow">
            <span className="ar__live" aria-hidden="true" />
            <span className="ar__on">live</span> <span className="ar__sep">·</span> northwind{' '}
            <span className="ar__sep">·</span> <span className="ar__clock">09:16</span>
          </p>
          <h2 id="ar-title" className="ar__title">
            The account reveals itself while they talk.
          </h2>
          <p className="ar__copy">
            Knowzilla connects every live sentence to the history behind it.
          </p>
          <button type="button" className="ar__cta kz-hover kz-focus-ring">
            Watch context resolve
          </button>
        </div>

        {/* ── (b) source rail ─────────────────────────────────────────── */}
        <div className="ar__rail" aria-hidden="true">
          {SOURCES.map((label) => (
            <div key={label} className="ar-src">
              <span className="ar-src__label">{label}</span>
              <span className="ar-src__stem" />
              <span className="ar-src__ticks">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`ar-src__tick${i === 2 ? ' ar-src__tick--key' : ''}`} />
                ))}
              </span>
            </div>
          ))}
        </div>

        {/* ── (c) transcript ──────────────────────────────────────────── */}
        <div ref={listRef} className={`ar__list${scene.resetting ? ' is-resetting' : ''}`} aria-hidden="true">
          <div className="ar__playline" />
          <div ref={playheadRef} className="ar__playhead">
            <span className="ar__node" />
          </div>
          <span className="ar__playarrow" aria-hidden="true">
            ↓
          </span>

          {TURNS.map((t, i) => {
            const isFocus = t.focus
            return (
              <div
                key={t.time}
                ref={(el) => {
                  turnRefs.current[i] = el
                }}
                className={[
                  'ar-turn',
                  t.rep ? 'is-rep' : '',
                  isFocus ? 'ar-turn--focus' : '',
                  isFocus && focusReached ? 'is-hot' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {isFocus && (
                  <span className="ar-turn__pill">
                    <span className="ar-turn__pill-mark" aria-hidden="true">
                      ⊙
                    </span>
                    Pricing concern
                  </span>
                )}
                <span className="ar-turn__time">{t.time}</span>
                <div className="ar-turn__body">
                  <span className="ar-turn__who">{t.who}</span>
                  {t.lines.map((line, li) => (
                    <span key={li} className="ar-turn__line">
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── (d) resolved now ────────────────────────────────────────── */}
        <div className="ar__resolved">
          <p className="ar__resolved-label">RESOLVED NOW</p>
          <div className="ar__cards">
            {CARDS.map((c, i) => (
              <div key={c.title} className={`ar-card${i < scene.cards ? ' is-in' : ''}`}>
                <span className="ar-card__badge">
                  <CardIcon kind={c.icon} />
                </span>
                <span className="ar-card__title">{c.title}</span>
                <time className="ar-card__time">{c.time}</time>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
