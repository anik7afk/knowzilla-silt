/* ---------------------------------------------------------------------------
 * §Iterations & ideas — the ideation rounds, shown unfiltered.
 *
 * Image studies, full-page directions, colour and vibe mocks, component concepts.
 * These are almost all SCREENSHOTS, so the grid differs from §Mascot on purpose —
 * wider tiles, a 16:10 reserved box and `object-fit: cover` anchored to the top,
 * which is where a page mock carries its information. There are enough rounds that
 * scanning blind is hopeless, so the chapter opens with a round index that scrolls
 * (it deliberately does NOT use `#` anchors: the /process shell keeps the active
 * chapter in the hash, and an anchor jump would navigate the gallery away).
 *
 * DATA IS NOT OWNED HERE. Rounds, counts, display names and captions are all
 * DERIVED from picks.json by `../picks`. The curation pass prunes items
 * continuously — whole rounds have disappeared — so nothing here names a round or
 * states a count: a round with no items left simply stops being rendered, and an
 * empty chapter degrades to one line of copy.
 *
 * PERF: `content-visibility: auto` + a `contain-intrinsic-size` estimate per round
 * block, `aspect-ratio` boxes reserved before load, `loading="lazy"` +
 * `decoding="async"`, and no scroll listener or per-frame state anywhere — the only
 * state is the lightbox.
 *
 * ------------------------------------------------------------------------- */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ITERATION_ITEMS,
  groupRounds,
  itemLabel,
  roundLabel,
  type PickItem,
  type Round,
} from '../picks'
import './IterationsChapter.css'

/* ------------------------------------------------------------------ lightbox */

function Lightbox({ item, onClose }: { item: PickItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="pch-iter__lb"
      role="dialog"
      aria-modal="true"
      aria-label={itemLabel(item)}
      onClick={onClose}
    >
      <figure className="pch-iter__lbfig" onClick={(e) => e.stopPropagation()}>
        <img className="pch-iter__lbimg" src={item.src} alt={itemLabel(item)} />
        <figcaption className="pch-iter__lbcap">
          <span className="pch-iter__lbtitle">{itemLabel(item)}</span>
          <span className="pch-iter__lbround">{item.round ? roundLabel(item.round) : null}</span>
        </figcaption>
      </figure>
      <button type="button" className="pch-iter__lbclose" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------- chapter */

/* `picks` is tolerated but unused — some shell revisions pass a preloaded picks
   object; the chapter always reads picks.json itself. */
export default function IterationsChapter(_props: { picks?: unknown } = {}) {
  const items = ITERATION_ITEMS
  const rounds = useMemo(() => groupRounds(items), [items])
  const [open, setOpen] = useState<PickItem | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const blocks = useRef(new Map<string, HTMLDivElement>())

  const jump = useCallback((key: string) => {
    const el = blocks.current.get(key)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }, [])

  const register = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) blocks.current.set(key, el)
    else blocks.current.delete(key)
  }, [])

  if (!items.length) {
    return (
      <section className="pch-iter" id="iterations">
        <p className="pch-iter__empty">Ideation curation in progress — no frames indexed yet.</p>
      </section>
    )
  }

  return (
    <section className="pch-iter" id="iterations">
      <p className="pch-iter__eyebrow">
        Iterations · {items.length} frames · {rounds.length} rounds
      </p>
      <h2 className="pch-iter__h">Unshipped rounds</h2>

      <nav className="pch-iter__index" aria-label="Rounds">
        <div className="pch-iter__index-chips">
          {rounds.map((round) => (
            <button
              key={round.key}
              type="button"
              className="pch-iter__indexitem"
              onClick={() => jump(round.key)}
            >
              {round.name}
              <span className="pch-iter__indexn">{String(round.items.length).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </nav>

      {rounds.map((round) => (
        <RoundBlock key={round.key} round={round} onOpen={setOpen} register={register} />
      ))}

      {open && <Lightbox item={open} onClose={close} />}
    </section>
  )
}

function RoundBlock({
  round,
  onOpen,
  register,
}: {
  round: Round
  onOpen: (i: PickItem) => void
  register: (key: string, el: HTMLDivElement | null) => void
}) {
  /* Coarse height reservation for content-visibility: 3 columns of 16:10 tiles
     at ~300px wide plus the caption and the round header. */
  const rows = Math.ceil(round.items.length / 3)

  return (
    <div
      ref={(el) => register(round.key, el)}
      className="pch-iter__round"
      style={{ containIntrinsicSize: `auto ${rows * 232 + 56}px` }}
    >
      <div className="pch-iter__rhead">
        <h3 className="pch-iter__rname">{round.name}</h3>
        <span className="pch-iter__rcount">{String(round.items.length).padStart(2, '0')} frames</span>
      </div>
      <div className="pch-iter__grid">
        {round.items.map((item) => (
          <div key={item.id} className="pch-iter__cell">
            <button type="button" className="pch-iter__tile" onClick={() => onOpen(item)}>
              <span className="pch-iter__well">
                <img
                  className="pch-iter__img"
                  src={item.src}
                  alt={itemLabel(item)}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="pch-iter__cap">{itemLabel(item)}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
