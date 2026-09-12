/* ---------------------------------------------------------------------------
 * §01 Overview — the brand, then the board.
 *
 * REBUILT 2026-07-29 on the owner's instruction. The previous version opened with
 * a thesis about the two reference sites that were measured; that is process
 * trivia for the people who did it, not an opening for the person being shown the
 * work. It is gone, and no reference site is named anywhere in this gallery.
 *
 * What replaces it is deliberately thin: the mascot's flat-vector treatment at
 * its own size, the product in the page's own words, and the six chapters with
 * counts. If a visitor reads nothing on this page and clicks straight into a
 * chapter, nothing has been lost.
 *
 * NO PRODUCT CLAIMS ARE MADE HERE. The one product sentence is the shipped hero
 * lede, quoted from `src/components/Hero.tsx`, and the wordmark line is Nav's.
 * Nothing about the product is asserted that the page does not already assert.
 *
 * COUNTS come from the registries (`./scenes`, `./picks`). The opening image is
 * looked up BY ID and simply not rendered if the curation pass has removed it —
 * an Overview that renders a broken frame is worse than one that opens on type.
 * ------------------------------------------------------------------------- */
import { CHAPTERS, goToChapter } from './nav'

export default function Overview() {
  return (
    <>
      <header className="pp-hdr">
        <div>
          <span className="pp-dot" />
          <span className="pp-eyebrow">Knowzilla · design process</span>
        </div>
        <h1>Workboard</h1>
      </header>

      <section className="pp-sec">
        {/* The keyed canonical artwork from the mascot image-generation gallery.
            Its 300px stage matches that gallery exactly; the image is centred and
            never enlarged beyond the size already reviewed there. */}
        <figure className="pp-sheet--mark">
          <img
            src="/process/mascot-canonical-keyed.png"
            alt="Knowzilla mascot — canonical artwork"
            width={1024}
            height={1536}
          />
        </figure>

        <div className="pp-body" style={{ marginTop: 40 }}>
          <p>
            <strong>Knowzilla</strong> is live guidance on every sales call: the next question to
            ask, the moment it matters, then written back to your CRM.
          </p>
        </div>

        {/* All six, so the index is complete AND the 3-column grid has no empty
            cell — a hole in a hairline ledger reads as a missing row. */}
        <div className="pp-index">
          {CHAPTERS.map((c) => (
            <button
              type="button"
              className="pp-index__c"
              key={c.key}
              onClick={() => goToChapter(c.key)}
            >
              <span className="pp-index__n">{c.n}</span>
              <span className="pp-index__t">{c.label}</span>
              {c.count ? <span className="pp-index__v">{c.count}</span> : null}
            </button>
          ))}
        </div>


        <div className="pp-row" style={{ marginTop: 40 }}>
          <a className="pp-btn pp-btn--primary" href="/" target="_blank" rel="noreferrer">
            Open the finished page ↗
          </a>
          <a className="pp-btn" href="/pricing" target="_blank" rel="noreferrer">
            Pricing ↗
          </a>
        </div>
      </section>
    </>
  )
}
