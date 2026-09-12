/* ---------------------------------------------------------------------------
 * /process — the design-process gallery SHELL.
 *
 * Fixed hairline-separated sidebar plus one scrollable main column, in the
 * `design-system/showcase.html` visual language rebuilt natively (see
 * ProcessPanel.css for what was taken and the two rules that forced departures).
 *
 * SCOPE. This file owns the page ground, the sidebar and the chapter nav. The
 * six chapters are separate components; five of them are
 * authored elsewhere and are imported from `./chapters/` — this shell never edits
 * them and makes no assumption about their internals beyond "default export, no
 * props". Chapters may opt into the shell's section-rhythm helpers (`.pp-sec`,
 * `.pp-eyebrow`, `.pp-h`, `.pp-p`) or bring their own styles entirely.
 *
 * CHAPTERS ARE VIEWS, NOT ANCHORS — a judgment call worth stating, since the
 * brief left it open. Views won because the chapters are heavy in ways that do
 * not coexist: one mounts live scenes in iframes and two carry ~250 images
 * between them. Anchored into a single document they would all be mounted at
 * once and the page would compete with itself. As views only one chapter is ever
 * in the DOM, switching unloads the previous one's work, and deep links still
 * work — the chapter lives in the hash, so /process#components is a real address
 * that reloads to the same place and survives back/forward.
 *
 * COUNTS ARE DERIVED, ALWAYS. The nav badges read `SCENES.length` and the
 * picks.json item counts. The image chapters are being pruned continuously, so a
 * hard-coded number here would be wrong within the hour.
 * ------------------------------------------------------------------------- */
import { useEffect, useState } from 'react'
import './ProcessPanel.css'
import Overview from './Overview'
import DesignSystemChapter from './chapters/DesignSystemChapter'
import AnimationSystemChapter from './chapters/AnimationSystemChapter'
import MascotChapter from './chapters/MascotChapter'
import ComponentsChapter from './chapters/ComponentsChapter'
import IterationsChapter from './chapters/IterationsChapter'
import { CHAPTERS, type ChapterKey } from './nav'

function keyFromHash(): ChapterKey {
  const h = window.location.hash.replace(/^#/, '')
  return CHAPTERS.some((c) => c.key === h) ? (h as ChapterKey) : 'overview'
}

/* ------------------------------------------------------------------ sidebar */

function Sidebar({
  current,
  onSelect,
}: {
  current: ChapterKey
  onSelect: (k: ChapterKey) => void
}) {
  return (
    <aside className="pp-side">
      <div className="pp-side__head">
        <h2 className="pp-side__title">Workboard</h2>
        <p className="pp-side__sub">Knowzilla</p>
      </div>

      <nav className="pp-nav" aria-label="Chapters">
        <div className="pp-nav__label">Chapters</div>
        <ul className="pp-nav__list">
          {CHAPTERS.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                className={`pp-nav__item${c.key === current ? ' is-active' : ''}`}
                aria-current={c.key === current ? 'page' : undefined}
                onClick={() => onSelect(c.key)}
              >
                <span className="pp-nav__n">{c.n}</span>
                {c.label}
                {c.count ? (
                  <span className="pp-nav__n" style={{ marginLeft: 'auto' }}>
                    {c.count}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

/* --------------------------------------------------------------------- page */

export default function ProcessPanel() {
  const [chapter, setChapter] = useState<ChapterKey>(keyFromHash)

  /* The hash is the address. Back/forward and a pasted link both work. */
  useEffect(() => {
    const onHash = () => setChapter(keyFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const select = (k: ChapterKey) => {
    if (k === chapter) return
    window.location.hash = k
    setChapter(k)
    window.scrollTo({ top: 0 })
  }

  /* An expression, not an inner component: a component declared inside render
   * gets a new identity every render, which would remount the whole chapter —
   * and in a chapter holding live iframes that means tearing them down and
   * reloading them on every state change. */
  let body
  switch (chapter) {
    case 'design-system':
      body = <DesignSystemChapter />
      break
    case 'animation-system':
      body = <AnimationSystemChapter />
      break
    case 'mascot':
      body = <MascotChapter />
      break
    case 'components':
      body = <ComponentsChapter />
      break
    case 'iterations':
      body = <IterationsChapter />
      break
    default:
      body = <Overview />
  }

  return (
    <div className="pp">
      <Sidebar current={chapter} onSelect={select} />
      <main className="pp-main">
        <div className="pp-wrap">{body}</div>
      </main>
    </div>
  )
}
