import { memo, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ComponentType, ReactNode } from 'react'
import { useInView } from '../hooks/useInView'
import type { Beat, MockProps } from './chapters/ChapterMock'
import KnowledgeDetail from './chapters/KnowledgeDetail'
import PracticeDetail from './chapters/PracticeDetail'
import LiveNavDetail from './chapters/LiveNavDetail'
import IntelDetail from './chapters/IntelDetail'
import './PlatformChapters.css'

/* =====================================================================
 * PlatformChapters — the deep product showcase. Archetype `chapter-stack`.
 *
 * The hero DEMOS the app running (five surfaces, ~44s loop, nothing holds
 * still). This section lets you STUDY it: four chapters organised by the
 * rep's job. No chapter re-tells a hero pane, which is the objection that
 * pulled the old Tour.tsx from the flow in session 7.
 *
 * REVISION 2 (2026-07-27) after the owner rejected round 1 in-browser:
 * "the component it produced here are very basic and nothing like attios
 * and also what i want in our context we explain our product in this place
 * simply and properly" / "also attios one had animation and showcase of
 * things happening our is just plain cards". Three changes live here:
 *   · the entrance is no longer a uniform fade cascade — each chapter plays
 *     a multi-beat SCENARIO (see `beat` below and the timelines at the top
 *     of each chapters/*Detail.tsx). Still QUIET: one-shot on first entry,
 *     latched by useInView disconnecting, settled forever, no timers, no
 *     loops, no scroll-linked values, transform/opacity/filter only.
 *   · every chapter now carries a two-column FEATURE ROW that says in plain
 *     language what the product does. The brief asked for two chapters;
 *     four is an owner-driven deviation ("we explain our product in this
 *     place simply and properly") and is flagged in the session report.
 *   · the section opens with a lede stating the whole loop.
 *
 * MECHANISM (A, measured — inspo/attio/DESIGN.md §4.4, dumps4/, and the
 * owner's screen recording of the live section): the donor's tour is NOT
 * pinned and NOT scroll-scrubbed. Articles scroll natively, only the rail
 * is sticky, an IntersectionObserver flips the active item at the ~0.38
 * viewport line, and each chapter plays one latched scenario on first
 * viewport entry.
 *
 * THE RAIL is ours, not the donor's plain list + blue bar: a continuous
 * neutral spine with a travelling 2px ink tick, like a gauge needle. Rows
 * are REAL anchors (`<a href="#chapter-id">` + scroll-margin-top) — v2's
 * rail hand-computed offsetTop and was broken; never compute a scroll
 * target.
 *
 * See PlatformChapters.css for the full provenance header, the measured
 * donor geometry the compositions are built on, every use of colour as
 * data, and the contract constraints this section is built against.
 * ===================================================================== */

/* Attio flips the rail when an article's top reaches ~330–380px from the top
 * of a 900px measurement viewport — ~0.38. Same value Tour.tsx:89 used, and
 * the value session 5 blessed as QUIET. */
const FLIP_LINE = 0.38

/* A zero-height IntersectionObserver band never intersects, so the flip line
 * is given ~0.6vh of thickness. Articles are contiguous, so exactly one is
 * across the line at any scroll position inside the section. */
const FLIP_ROOT_MARGIN = `-${FLIP_LINE * 100}% 0px -${100 - FLIP_LINE * 100 - 0.6}% 0px`

type Feature = { h: string; p: string }

type Chapter = {
  id: string
  index: string
  /** rail label — sentence case, never uppercase (the eyebrow idiom is capped
   *  and never-adjacent, and KineticConversation sits directly above) */
  label: string
  /** the one-line supporting sentence the description-reveal variant shows */
  desc: string
  /** dual-tone h3: ink claim + gray continuation. The continuation states
   *  MECHANICS — what gets ingested, what the rep sees, what gets written
   *  where — never a second slogan. */
  lead: string
  tail: string
  Detail: ComponentType<MockProps>
  /** dual-tone feature rows, Attio's pattern: one text block, ink claim then
   *  gray explanation, same size, reading as one sentence. Two per chapter;
   *  chapter 01 carries a third (the how-it-joins/no-bot answer, which had
   *  no home left after the 2026-07-27 tail-section cuts) — it wraps to a
   *  half-width second grid row. */
  features: Feature[]
}

const CHAPTERS: Chapter[] = [
  {
    id: 'knowledge',
    index: '01',
    label: 'Knowledge',
    desc: 'The documents every answer is drawn from.',
    lead: 'Grounded in your truth.',
    tail:
      'It runs on the docs your team already wrote — ICP to playbook — and every answer names its source.',
    Detail: KnowledgeDetail,
    features: [
      {
        h: 'Five document types, not a folder of PDFs.',
        p: 'Each carries a type, an owner and a version.',
      },
      {
        h: 'Every answer names its source.',
        p: 'Document and page, attached to every suggestion.',
      },
      /* the how-it-joins answer (PRODUCT-NOTES §6.12: browser-tab capture,
         no meeting bot). Placed here because it is a trust claim — what
         happens to the call your truth is applied to — and no invented
         security claims ride along with it. */
      {
        h: 'No bot joins the call.',
        p: 'A shared browser tab — nothing the buyer sees.',
      },
    ],
  },
  {
    id: 'practice',
    index: '02',
    label: 'Practice',
    desc: 'Reps drill the hard calls before they happen.',
    lead: 'Rehearse before it’s real.',
    tail:
      'Run the call out loud against an AI buyer, and get it back scored on five axes.',
    Detail: PracticeDetail,
    features: [
      {
        h: 'An AI buyer that pushes back.',
        p: 'It objects, stalls and changes the subject.',
      },
      {
        h: 'Graded on five axes, not a gut feel.',
        p: 'The same rubric, every call.',
      },
    ],
  },
  {
    id: 'live-navigation',
    index: '03',
    label: 'Live navigation',
    desc: 'Guidance while the buyer is still talking.',
    lead: 'Navigated in the moment.',
    tail:
      'Mid-call, Knowzilla names the objection on the table and hands the rep the next line to say.',
    Detail: LiveNavDetail,
    features: [
      {
        h: 'It listens; it does not transcribe.',
        p: 'Signal only — no wall of text mid-call.',
      },
      {
        h: 'One line at a time.',
        p: 'A rep who is reading cannot listen.',
      },
    ],
  },
  /* Chapter 04, session 12: the showcase is now the after-call workflow
   * canvas (v2's "[05] After the call" run, ported in chapters/IntelDetail).
   * Copy retuned to what the canvas actually shows — every claim is
   * established page fiction: meeting notes / follow-up draft / HubSpot
   * write-back (WriteBack.tsx) and the review-before-saving loop
   * (PRODUCT-NOTES §3.6). No new companies, people or numbers. */
  {
    id: 'deal-intelligence',
    index: '04',
    label: 'Deal intelligence',
    desc: 'What the call leaves behind, written down.',
    lead: 'Every call becomes intel.',
    tail:
      'When the call ends, the notes, the follow-up and the HubSpot update draft themselves.',
    Detail: IntelDetail,
    features: [
      {
        h: 'The follow-through drafts itself.',
        p: 'Notes, follow-up, CRM update — before the tab closes.',
      },
      {
        h: 'Coaching moments get flagged.',
        p: 'They land on the manager’s list on their own.',
      },
    ],
  },
]

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const recalc = () => setReduced(mq.matches)
    mq.addEventListener('change', recalc)
    return () => mq.removeEventListener('change', recalc)
  }, [])
  return reduced
}

/** One chapter's scenario clock. `useInView` disconnects on first crossing,
 *  so `inView` can never go back to false — that is the latch. Under reduced
 *  motion `beat` returns no class at all, which renders the settled markup. */
function useScenario(reduced: boolean, threshold: number) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold })
  const beat: Beat = (delay, kind = 'soft', dur = 425) => {
    if (reduced) return { className: '' }
    return {
      className: `pc-a pc-a--${kind}${inView ? ' pc-go' : ''}`,
      style: { '--pc-dur': `${dur}ms`, '--enter-delay': `${delay}ms` } as CSSProperties,
    }
  }
  return { ref, beat, go: inView, still: reduced }
}

/* ── one natively-scrolling chapter article ─────────────────────────────── */

const ChapterArticle = memo(function ChapterArticle({
  c,
  reduced,
  articleRef,
}: {
  c: Chapter
  reduced: boolean
  articleRef: (el: HTMLElement | null) => void
}) {
  const head = useScenario(reduced, 0.35)
  const band = useScenario(reduced, 0.25)
  const feats = useScenario(reduced, 0.3)

  const headEnter = head.beat(0, 'soft', 425)
  const Detail = c.Detail

  return (
    /* SESSION 13 REV 2 (owner correction 2026-07-29): a chapter is no longer a
       card. It is a PART of the one continuous panel — a ground band that runs
       edge to edge inside the sheet, opening on an interior rule (the quietest
       line) where a previous chapter sits above it. Chapters alternate white /
       surface-200 grounds, the donor's per-chapter rotation. */
    <article ref={articleRef} id={c.id} className="pc-chapter">
      {/* THREE BANDS, the donor's article anatomy verbatim (dumps4/article-*-
          tree.json): a text band on the panel ground, a showcase band one tonal
          step down, then the feature band back on the panel ground. That
          top-to-bottom white / light-gray / white rotation IS the alternation
          the owner asked for — Attio does not tint whole chapters, it tints the
          DEMO AREA of every chapter (#FAFAFB page ground → #F3F4F6 showcase
          band → #FAFAFB feature row). Bands run edge to edge of the content
          column and carry their own 48px inset, so the tint reaches the panel's
          right edge and the interior vertical divider on the left. */}
      <div ref={head.ref} className="pc-chapter__lead">
        {/* The chapter tag is an INTERIOR label now, not a desk annotation: it
            lives inside the panel, and dashed lines are reserved for the desk,
            so the v2 SectionTag dashed rule (`border-t border-dashed`) is
            DELETED here — the interior rule on .pc-chapter + .pc-chapter does
            the "a new chapter starts" work, and chapter 01 needs no line at all
            because the panel's own top edge is directly above it. The label
            face itself is unchanged (Inter 600 / 12px / 1.2px tracking /
            tabular-nums — mono is retired). STATIC on purpose. aria-hidden
            because the rail + h3 already carry the same wayfinding for AT;
            index + label are existing strings, no new copy. */}
        <div className="pc-chapter__tag" aria-hidden="true">
          <span className="pc-chapter__tagindex">{c.index}</span>
          <span className="pc-chapter__tagsep">·</span>
          <span>{c.label}</span>
        </div>

        <h3 className={`pc-chapter__h ${headEnter.className}`} style={headEnter.style}>
          {c.lead} <span>{c.tail}</span>
        </h3>
      </div>

      {/* the showcase band — the tinted one. `Band` (a bare wrapper div) was
          folded into this element in the two-plane rev-2 pass: the band is a
          GROUND now, not a spacer. */}
      <div ref={band.ref} className="pc-chapter__show">
        {/* chromeless since round 3 (owner, vs Attio's showcase: "its just
            the section without the mac") — the WindowBar and its title are
            gone; the mock's own toolbar is the top edge. The plate keeps its
            own hairline + --shadow-float: it is the APP on the sheet, one
            plane above it, which is the only depth step left in the section —
            and it now sits on a TINTED band, which is what the house shadow
            rule requires ("only on a tinted ground; a lift on #fff has no
            cause", tokens.css:149). On the deleted white sheet it did not. */}
        <Detail beat={band.beat} go={band.go} still={band.still} />
      </div>

      <div ref={feats.ref} className="pc-chapter__feat">
        <div className="pc-features">
          {/* Attio's tour feature row, structural: h4 18px/600 over a 16px gray
              paragraph (DESIGN.md:278) — replaced the single dual-tone block in
              session 12 (owner: "fonts look so shallow") */}
          {c.features.map((f, i) => {
            const e = feats.beat(i * 90, 'soft', 425)
            return (
              <div key={f.h} className={`pc-feature ${e.className}`} style={e.style}>
                <h4>{f.h}</h4>
                <p>{f.p}</p>
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
})

/* ── the sticky rail ────────────────────────────────────────────────────── */

/* ROUND 3 (owner): the gray spine + travelling ink tick are GONE — the rail
 * is bare text and the active row announces itself by growing: a composited
 * transform scale (no font-size reflow) riding the same 500ms window as the
 * colour flip. All measurement plumbing (rowRefs / tick state / resize
 * listener) left with the needle.
 *
 * SESSION 13 REV 2 (owner correction 2026-07-29): the rail is NOT a card. The
 * session-13 rev-1 pass had wrapped it in a small rounded white box with a
 * shadow — rejected verbatim ("not like this small card that our agent
 * applied"). Background / border / radius / shadow / padding are all gone; the
 * rail is bare sticky text inside the panel's first column, and the column's
 * own border-right is the only line near it. Donor-faithful (the Attio rail is
 * an <ol> with no box of its own). */
function Rail({ active, withDescriptions }: { active: number; withDescriptions: boolean }) {
  return (
    <nav className="pc-rail" aria-label="Platform chapters">
      <ol className="pc-rail__list">
        {CHAPTERS.map((c, i) => (
          <li key={c.id} className={`pc-rail__row${i === active ? ' is-active' : ''}`}>
            <a
              className="pc-rail__link kz-focus-ring"
              href={`#${c.id}`}
              aria-current={i === active ? 'true' : undefined}
            >
              <span className="pc-rail__label">{c.label}</span>
              {withDescriptions ? <span className="pc-rail__desc">{c.desc}</span> : null}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ── section ────────────────────────────────────────────────────────────── */

export default function PlatformChapters({
  /* CHECKPOINT A/B (build brief §"The left rail"). false = spine + numeral +
   * label only. true = the active row also reveals its one-line supporting
   * sentence, opacity/blur only, with the space permanently reserved so the
   * rail never shifts. Flip it at the mount in src/App.tsx. */
  railDescriptions = false,
}: {
  railDescriptions?: boolean
}): ReactNode {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState(0)
  const articleRefs = useRef<(HTMLElement | null)[]>([])

  /* HASH ON FIRST PAINT. The nav's Product link is `/#platform`, so arriving
   * from a standalone route (/pricing, /stage, …) is a full document load: the
   * browser looks for #platform before React has mounted this section, finds
   * nothing, and leaves you at the top of the hero. Measured 2026-07-29 —
   * scrollY 0, section 4857px down. So this section restores its own hash once
   * it exists, and only from a standing start, so it never fights a scroll the
   * browser DID manage or one the reader already made. */
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id || window.scrollY > 8) return
    const el = document.getElementById(id)
    if (!el || !el.closest('.pc')) return
    el.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [])

  useEffect(() => {
    const els = articleRefs.current.filter((el): el is HTMLElement => el !== null)
    if (els.length === 0 || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        /* Of the articles across the flip line, the one that crossed it most
         * recently is the one with the greatest top. */
        let best: IntersectionObserverEntry | null = null
        for (const e of entries) {
          if (!e.isIntersecting) continue
          if (!best || e.boundingClientRect.top > best.boundingClientRect.top) best = e
        }
        if (!best) return
        const idx = els.indexOf(best.target as HTMLElement)
        if (idx >= 0) setActive((a) => (a === idx ? a : idx))
      },
      { rootMargin: FLIP_ROOT_MARGIN, threshold: 0 },
    )
    for (const el of els) io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    /* `id` is the nav's Product destination (owner, 2026-07-29): clicking
       Product lands on this section's top hairline — the intro, not chapter
       01 — so the four chapters are still read in order and every chapter
       entrance plays on the way down as normal. */
    <section className="pc" id="platform">
      {/* THE DESK — no longer this section's own (session 14, owner two-plane
          rollout 2026-07-29). Session 13 prototyped the desk here, as a local
          `svg.pc__desk` over a local surface-300 ground. Both are DELETED: the
          desk is now the page's base plane (App.tsx → <PageDesk>, geometry and
          provenance in PageDesk.tsx / PagePlanes.css) and this section is simply
          transparent, so the ONE desk shows through its two gutters. Keeping a
          local copy would have double-printed the dots here — the two layers
          agree on tone and phase but not on alpha, so the section would have
          read a step darker than the rest of the plane — and put a tone seam at
          the section's top and bottom edges. */}
      <div className="pc__container">
        {/* THE PANEL — ONE continuous sheet (session 13 rev 2, owner
            correction; rev 3 corrections folded in). Everything the tour is
            made of lives inside it: the section intro, the sticky TOC rail AND
            all four chapter parts. It opens on a hairline top edge ABOVE the
            intro heading and closes on a hairline bottom edge after chapter 04,
            and because those two edges are the section's own top and bottom,
            the dotted desk shows ONLY as the two vertical gutters beside it —
            no desk band above or below (owner rev 3: "the main panel only is
            visible through horizontal side for this whole section").
            Square corners — the donor frame carries no radius
            (dumps2/anatomy-06-y1614.json: no borderRadius on section,
            container, frame, grid or article). NO overflow:hidden and no radius
            on purpose: an overflow-clipped ancestor would kill the rail's
            position:sticky. */}
        <div className="pc__panel">
          {/* The intro is INSIDE the sheet now (owner rev 3), spanning both
              columns — which is also what the donor does: a grid-cols-24 row at
              pt-152 pb-80 inside the bordered frame, its child 22/24 wide
              (dumps2/ALL-ANATOMY.txt:82-85). Spanning 1/-1 keeps the interior
              rail↔content divider from crossing the heading, exactly as the
              donor's x=372 divider starts below its intro row. */}
          <div className="pc__intro">
            <h2 className="pc__headline">
              One loop, four surfaces. <span>Here is each one, up close.</span>
            </h2>
            <p className="pc__lede">
              Your docs power it, reps rehearse against it, it navigates the live call — and every
              call writes intel back.
            </p>
          </div>

          {/* the rail's own column. It carries the interior vertical divider
              (border-right) so the line runs the full height of the rail+
              chapters row rather than only as far as the sticky nav's own box —
              the donor's divider runs the whole of that row too (probed at
              x=372, y 2027→8093, and NOT across the intro). */}
          <div className="pc__railcol">
            <Rail active={active} withDescriptions={railDescriptions} />
          </div>

          <div className="pc__articles">
            {CHAPTERS.map((c, i) => (
              <ChapterArticle
                key={c.id}
                c={c}
                reduced={reduced}
                articleRef={(el) => {
                  articleRefs.current[i] = el
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
