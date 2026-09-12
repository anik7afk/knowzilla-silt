/* ---------------------------------------------------------------------------
 * §05 Components — every retained scene this build produced, mounted LIVE.
 *
 * The chapter renders the curated registry in `../scenes` — the assembled pages,
 * the flow lineup, hero product windows, standalone scenes, retained variants,
 * endgame auditions and component labs.
 *
 * THE INVENTORY IS `../scenes`, NOT A SECOND LIST. That registry is the shared
 * source of truth — the shell reads `SCENES.length` for its sidebar badge, so a
 * private list here would put a different number in the nav than on the page.
 * (PlatformChapters has no standalone route, so its two rows deep-link the
 * assembled page — see their entries in the registry.)
 *
 * WHY EVERY SCENE IS AN IFRAME AND NONE IS MOUNTED INLINE. Three reasons, and
 * the first settles it:
 *   1. Not one entry is a widget. Every one is a full-bleed page section (or a
 *      whole page) that assumes the viewport IS its container; several are
 *      scroll-driven against `window`, and Hero + KineticConversation pin against
 *      it. Mounting those into a 1000px column would need width and
 *      scroll-container overrides inside the components themselves — which the
 *      brief forbids and the KineticConversation freeze makes non-negotiable. An
 *      iframe at a logical 1280px viewport, transform-scaled into the tile, hands
 *      each scene the width it was designed for and its own scroll root, with
 *      zero edits to any component.
 *   2. Fifty-odd scene clocks in one document is fifty-odd rAF loops,
 *      IntersectionObservers and count-up timers competing on one main thread. In
 *      separate documents an unmounted scene costs nothing and the two that are
 *      live get their own event loops.
 *   3. Bundle. Inline mounting pulls Hero, KineticConversation, every pane module
 *      and every variant into the /process chunk for a gallery whose job is to
 *      LOOK at them.
 *   The cheapest candidates (the integrations strip, the dot matrices) were
 *   considered for inline mounting and still lose on (1): both are full-bleed and
 *   would need a width override to read correctly in the column.
 *
 * THE FRAME BUDGET. At most MAX_LIVE (2) iframes exist at any moment. A tile
 * requests the budget once it is genuinely on screen — 40% visible for 300ms —
 * and hands it back 800ms after it has fully left; when a third tile asks, the
 * oldest holder is dropped and its iframe unmounts back to its placeholder. The
 * ratio gate rather than a rootMargin is deliberate and was verified at this
 * scale: with a margin, every tile in the first screenful requests on first
 * paint and the budget keeps whichever two asked LAST, which reads as the wrong
 * two loading. Both legs are delayed, so scrolling THROUGH the chapter loads
 * nothing. Placeholders reserve the tile's exact height through `aspect-ratio`,
 * so mounting and unmounting never shifts the page.
 *
 * POSTER, THEN INTERACTIVE. A live frame is `inert` by default: it plays, but it
 * cannot take the pointer, so the wheel keeps scrolling THIS page instead of
 * being swallowed by a scene. Clicking the veil makes one frame interactive so a
 * scroll-driven scene can be driven by hand; "Lock frame" gives it back.
 *
 * ------------------------------------------------------------------------- */
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { SCENES, SCENE_GROUPS, type Scene } from '../scenes'
import './ComponentsChapter.css'

/* The viewport width every scene is composed for — the page's own desktop
 * measure. The tile scales this down; it never reflows the scene. */
const LOGICAL_W = 1280
const MAX_LIVE = 2

const ALL_SCENES: Scene[] = SCENES

/* Logical viewport HEIGHT per tile. 800 is the 16:10 poster; a whole page, a
 * long exploration sheet or a full scene with a tall stage gets more, because a
 * poster cropped mid-scene is a poster of the crop. Keyed by slug where the
 * scene is specifically tall, by group otherwise. */
const TALL: Record<string, number> = {
  landing: 1000,
  'landing-page': 1000,
  'pricing-page': 1000,
  'platform-chapters': 1000,
  'platform-chapters-rail-b': 1000,
  'hvu-variations': 1000,
  'endgame-index': 1000,
  'kinetic-conversation': 900,
  'heard-vs-understood': 900,
  'objection-anatomy': 900,
  'objection-library': 900,
  'shared-truth': 900,
  'sentence-history': 900,
  'account-reveals': 900,
  'signal-convergence': 900,
}
const GROUP_H: Record<string, number> = {
  'Whole pages': 1000,
  Labs: 1000,
  'Endgame auditions': 900,
}
const heightOf = (s: Scene) => TALL[s.slug] ?? GROUP_H[s.group] ?? 800

/* One line under each group heading, so the groups read as chapters of the work
 * rather than as buckets. Unknown groups simply get none — a group added to the
 * registry later must not break this chapter. */
const GROUP_BLURB: Record<string, string> = {
  'Whole pages': 'Everything a visitor can land on.',
  'Page sections': 'The flow lineup, each slot as the page renders it.',
  'Product windows': 'The hero’s panes, staged one at a time in real window chrome.',
  'Full scenes': 'Cut from the flow, kept whole on their own routes.',
  'Dials & variants': 'One variable moved, everything else held still.',
  'Hero stage fills': 'Five beds under the same hero window.',
  'Endgame auditions': 'Candidates for the page’s closing stretch.',
  Labs: 'The benches the smallest pieces were built on.',
}

/* Group order comes from the registry; EXTRA never introduces a new one. */
const GROUPS = SCENE_GROUPS.map((name) => ({
  name,
  scenes: ALL_SCENES.filter((s) => s.group === name),
})).filter((g) => g.scenes.length > 0)

/* ------------------------------------------------------------------ one tile */

type CardProps = {
  scene: Scene
  n: number
  mounted: boolean
  request: (id: string) => void
  release: (id: string) => void
}

/* memo, and it earns its keep: `live` lives in the chapter, so without it every
 * one of the ~54 tiles reconciles each time a single frame mounts or unmounts.
 * Every prop is stable by construction — the scene rows are module constants and
 * request/release are useCallback'd — so only the two tiles whose `mounted`
 * actually changed re-render. */
const SceneCard = memo(function SceneCard({
  scene,
  n,
  mounted,
  request,
  release,
}: CardProps) {
  const id = `component:${scene.slug}`
  const boxRef = useRef<HTMLDivElement>(null)
  /* 1000/1280 — the tile's width at the shell's full measure. Corrected by the
   * ResizeObserver on the first frame; seeding it avoids a visible re-scale. */
  const [scale, setScale] = useState(0.781)
  const [take, setTake] = useState(0)
  const [interactive, setInteractive] = useState(false)
  const h = heightOf(scene)

  /* Fit the logical viewport into whatever width the tile actually got. */
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setScale(w / LOGICAL_W)
    })
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  /* Ask for the budget when the tile is genuinely being looked at, hand it back
   * once it has fully left. The cleanup also releases, which matters when the
   * group filter unmounts a tile that is currently holding a slot. */
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    let enter = 0
    let leave = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.4) {
          window.clearTimeout(leave)
          window.clearTimeout(enter)
          enter = window.setTimeout(() => request(id), 300)
        } else if (!entry.isIntersecting) {
          window.clearTimeout(enter)
          window.clearTimeout(leave)
          leave = window.setTimeout(() => release(id), 800)
        }
      },
      { threshold: [0, 0.4] },
    )
    io.observe(box)
    return () => {
      io.disconnect()
      window.clearTimeout(enter)
      window.clearTimeout(leave)
      release(id)
    }
  }, [id, request, release])

  /* An evicted frame must not come back interactive. */
  useEffect(() => {
    if (!mounted) setInteractive(false)
  }, [mounted])

  return (
      <article className="pch-comp-card">
        <header className="pch-comp-card__head">
          <div className="pch-comp-card__id">
            <div className="pch-comp-card__nm">
              <span className="pch-comp-card__n">{String(n).padStart(2, '0')}</span>
              {scene.label}
            </div>
            <p className="pch-comp-card__note">{scene.note}</p>
          </div>
          <div className="pch-comp-card__act">
            <span className="pch-comp-card__path" title={scene.url}>
              {scene.url}
            </span>
            <button
              type="button"
              className="pp-btn pp-btn--sm"
              title="Remount the frame and replay the scene from the top"
              onClick={() => {
                request(id)
                setTake((t) => t + 1)
              }}
            >
              ↺ Replay
            </button>
          </div>
        </header>

        <div
          className={`pch-comp-frame${interactive ? ' is-interactive' : ''}`}
          ref={boxRef}
          style={
            {
              '--pch-comp-ar': `${LOGICAL_W} / ${h}`,
              '--pch-comp-scale': scale,
              '--pch-comp-h': `${h}px`,
            } as CSSProperties
          }
        >
          {mounted ? (
            <>
              <iframe
                key={take}
                className="pch-comp-frame__doc"
                src={scene.url}
                title={scene.label}
                loading="lazy"
                /* Same-origin, our own routes — nothing is granted here that the
                 * page does not already have. `inert` is what keeps the frame a
                 * poster: no pointer, no tab stop, out of the a11y tree, while
                 * the scene inside still plays. */
                inert={!interactive}
              />
              {interactive ? (
                /* While the reader drives a tall scene the card header (and its
                 * Replay) is off-screen, so the frame carries its own controls. */
                <div className="pch-comp-frame__ctl">
                  <button
                    type="button"
                    className="pp-btn pp-btn--sm"
                    title="Remount the frame and replay the scene from the top"
                    onClick={() => setTake((t) => t + 1)}
                  >
                    ↺ Replay
                  </button>
                  <button type="button" className="pp-btn pp-btn--sm" onClick={() => setInteractive(false)}>
                    Lock frame
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="pch-comp-frame__veil"
                  aria-label={`Explore ${scene.label} inside its frame`}
                  title="Click to drive the scene by hand — until then the frame is a poster and your scroll stays on this page"
                  onClick={() => setInteractive(true)}
                >
                  <span>Click to explore</span>
                </button>
              )}
            </>
          ) : (
            <div className="pch-comp-frame__ph">
              <span className="pch-comp-ph__nm">{scene.label}</span>
              <span className="pch-comp-ph__hint">loads on scroll</span>
              <button type="button" className="pp-btn pp-btn--sm" onClick={() => request(id)}>
                Load frame now
              </button>
            </div>
          )}
        </div>
      </article>
  )
})

/* ------------------------------------------------------------------- chapter */

export default function ComponentsChapter() {
  const [filter, setFilter] = useState<string>('all')
  const [live, setLive] = useState<string[]>([])

  const request = useCallback((id: string) => {
    setLive((prev) => (prev.includes(id) ? prev : [...prev, id].slice(-MAX_LIVE)))
  }, [])

  const release = useCallback((id: string) => {
    setLive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev))
  }, [])

  const groups = useMemo(
    () => (filter === 'all' ? GROUPS : GROUPS.filter((g) => g.name === filter)),
    [filter],
  )

  /* Running index across the WHOLE inventory, so a card keeps its number when
   * the list is filtered. */
  const numberOf = useMemo(() => {
    const map = new Map<string, number>()
    GROUPS.flatMap((g) => g.scenes).forEach((s, i) => map.set(s.slug, i + 1))
    return map
  }, [])

  const total = ALL_SCENES.length

  return (
    <section className="pp-sec pch-comp">
      <div className="pp-eyebrow">05 — Components</div>
      <h2 className="pp-h">Live components</h2>

      <div className="pch-comp-bar">
        <div className="pch-comp-bar__chips" role="group" aria-label="Filter by group">
          <button
            type="button"
            className={`pch-comp-chip${filter === 'all' ? ' is-on' : ''}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            Everything <span className="pch-comp-chip__n">{total}</span>
          </button>
          {GROUPS.map((g) => (
            <button
              key={g.name}
              type="button"
              className={`pch-comp-chip${filter === g.name ? ' is-on' : ''}`}
              aria-pressed={filter === g.name}
              onClick={() => setFilter(g.name)}
            >
              {g.name} <span className="pch-comp-chip__n">{g.scenes.length}</span>
            </button>
          ))}
        </div>
        <div className="pch-comp-bar__live">
          <span className="pp-meta">
            {live.length} of {MAX_LIVE} live
          </span>
          <button
            type="button"
            className="pp-btn pp-btn--sm"
            disabled={live.length === 0}
            onClick={() => setLive([])}
          >
            Unload
          </button>
        </div>
      </div>

      {groups.map((g) => (
        <div className="pch-comp-grp" key={g.name}>
          <div className="pch-comp-grp__head">
            <div className="pp-grp">{g.name}</div>
            <span className="pp-meta">{g.scenes.length}</span>
          </div>
          {GROUP_BLURB[g.name] ? (
            <p className="pch-comp-grp__blurb">{GROUP_BLURB[g.name]}</p>
          ) : null}
          <div className="pch-comp-list">
            {g.scenes.map((s) => (
              <SceneCard
                key={s.slug}
                scene={s}
                n={numberOf.get(s.slug) ?? 0}
                mounted={live.includes(`component:${s.slug}`)}
                request={request}
                release={release}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
