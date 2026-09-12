/* ---------------------------------------------------------------------------
 * §Mascot — the full mascot search, unfiltered.
 *
 * CURATED (owner, 2026-07-29): only the search rounds remain — the production
 * asset exports (@1x/2x/3x sets) and the sizing sweep were cut from the data.
 * Base V opens with the six approved poses, numbered rounds follow, and the
 * treatment sheet closes.
 *
 * POSE LIBRARY (2026-08-25): the 58 cut-out poses from `../poses` render as a
 * card-free group between Base V and the search rounds — see PoseLibrary below.
 *
 * DATA IS NOT OWNED HERE. Rounds, counts and captions are all DERIVED from
 * picks.json by `../picks`, which is also where the wording guard and the round
 * display names live. Items are pruned continuously by the curation pass, so this
 * file states no number of its own: a round that loses its last item stops being
 * rendered, and an empty chapter degrades to a line of copy rather than to an
 * empty grid.
 *
 * PERF (must stay smooth across ~150 images in the two image chapters):
 *   · every round block gets `content-visibility: auto` + a `contain-intrinsic-size`
 *     estimate, so off-screen rounds cost neither layout nor paint;
 *   · every tile reserves its box with `aspect-ratio` before the image lands, so
 *     the column never reflows while it fills;
 *   · `loading="lazy"` + `decoding="async"` on every img;
 *   · no scroll listener, no rAF, no per-frame state — the only React state in
 *     the chapter is the lightbox subject.
 *
 * ------------------------------------------------------------------------- */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MASCOT_ITEMS,
  groupRounds,
  itemLabel,
  roundLabel,
  type PickItem,
  type Round,
} from '../picks'
import { POSES } from '../poses'
import './MascotChapter.css'

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
      className="pch-mas__lb"
      role="dialog"
      aria-modal="true"
      aria-label={itemLabel(item)}
      onClick={onClose}
    >
      <figure className="pch-mas__lbfig" onClick={(e) => e.stopPropagation()}>
        <img className="pch-mas__lbimg" src={item.src} alt={itemLabel(item)} />
        <figcaption className="pch-mas__lbcap">
          <span className="pch-mas__lbtitle">{itemLabel(item)}</span>
          <span className="pch-mas__lbround">{item.round ? roundLabel(item.round) : null}</span>
        </figcaption>
      </figure>
      <button type="button" className="pch-mas__lbclose" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------- chapter */

/* `picks` is accepted but unused: the shell has passed a preloaded picks object
   in some revisions, and tolerating the prop keeps the call site typechecking
   either way. The chapter always reads picks.json itself. */
export default function MascotChapter(_props: { picks?: unknown } = {}) {
  const items = MASCOT_ITEMS
  const rounds = useMemo(() => groupRounds(items), [items])
  const [open, setOpen] = useState<PickItem | null>(null)
  const close = useCallback(() => setOpen(null), [])

  if (!items.length && !POSES.length) {
    return (
      <section className="pch-mas" id="mascot">
        <p className="pch-mas__empty">Mascot curation in progress — no frames indexed yet.</p>
      </section>
    )
  }

  /* The pose library reads best right after Base V (the approved character),
     before the historical search rounds. If Base V was ever pruned it simply
     leads the chapter instead. */
  const baseV = rounds.filter((r) => r.key === 'base-v')
  const searchRounds = rounds.filter((r) => r.key !== 'base-v')

  return (
    <section className="pch-mas" id="mascot">
      <p className="pch-mas__eyebrow">
        Mascot · {POSES.length ? `${POSES.length} poses · ` : ''}
        {items.length} frames · {rounds.length} rounds
      </p>
      <h2 className="pch-mas__h">Mascot search</h2>

      {baseV.map((round) => (
        <RoundBlock key={round.key} round={round} onOpen={setOpen} />
      ))}

      {POSES.length > 0 && <PoseLibrary onOpen={setOpen} />}

      {searchRounds.map((round) => (
        <RoundBlock key={round.key} round={round} onOpen={setOpen} />
      ))}

      {open && <Lightbox item={open} onClose={close} />}
    </section>
  )
}

/* ---------------------------------------------------------------- pose library */

/* The 58 cut-out poses, shown the way they will be USED: transparent PNGs
   sitting directly on the chapter ground — no well, no card, no hairline.
   Four to a row, every pose height-normalised so the row reads as one
   line-up (owner call, 2026-08-25: card grid rejected as cluttered). */
function PoseLibrary({ onOpen }: { onOpen: (i: PickItem) => void }) {
  const rows = Math.ceil(POSES.length / 4)

  return (
    <div
      className="pch-mas__round pch-mas__plib"
      style={{ containIntrinsicSize: `auto ${rows * 264 + 56}px` }}
    >
      <div className="pch-mas__rhead">
        <h3 className="pch-mas__rname">Pose library</h3>
        <span className="pch-mas__rcount">{String(POSES.length).padStart(2, '0')} poses</span>
      </div>
      <div className="pch-mas__pgrid">
        {POSES.map((pose) => (
          <button
            key={pose.id}
            type="button"
            className="pch-mas__pose"
            onClick={() => onOpen({ id: pose.id, src: pose.src, title: pose.name, round: 'Pose library' })}
          >
            <img
              className="pch-mas__pimg"
              src={pose.src}
              alt={pose.name}
              loading="lazy"
              decoding="async"
              width={pose.width}
              height={pose.height}
            />
            <span className="pch-mas__pcap">{pose.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function RoundBlock({ round, onOpen }: { round: Round; onOpen: (i: PickItem) => void }) {
  /* One row of ~240px tiles per 4 columns — a coarse but stable reservation for
     content-visibility, so the scrollbar does not jump as rounds render. */
  const rows = Math.ceil(round.items.length / 4)

  return (
    <div className="pch-mas__round" style={{ containIntrinsicSize: `auto ${rows * 268 + 56}px` }}>
      <div className="pch-mas__rhead">
        <h3 className="pch-mas__rname">{round.name}</h3>
        <span className="pch-mas__rcount">{String(round.items.length).padStart(2, '0')} frames</span>
      </div>
      <div className="pch-mas__grid">
        {round.items.map((item) => (
          <div key={item.id} className="pch-mas__cell">
            <button type="button" className="pch-mas__tile" onClick={() => onOpen(item)}>
              <span className="pch-mas__well">
                <img
                  className="pch-mas__img"
                  src={item.src}
                  alt={itemLabel(item)}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              {round.key === 'base-v' ? null : (
                <span className="pch-mas__cap">{itemLabel(item)}</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
