import type { CSSProperties } from 'react'
import {
  AppCard,
  Check,
  Chip,
  Entity,
  Overlay,
  OverlayBody,
  OverlayFoot,
  OverlayHead,
  OverlayRow,
  Person,
  PillButton,
  Plate,
  Score,
  SourceChip,
  Swap,
  Table,
  TextAction,
} from './ChapterMock'
import type { Column, GlyphName, MockProps, Row } from './ChapterMock'

/* Chapter 01 — Knowledge. "Grounded in your truth."
 *
 * The Knowledge Base document library + the objection card one of its rows
 * just answered. The composition IS the argument: the library is the
 * evidence base, the card is one answer drawn out of it, and the scenario
 * shows the draw happening.
 *
 * THE PRODUCT MOMENT (Knowzilla's own, not a transplant of the donor's
 * ask-bar typing): rows cascade in → the row the answer came from marks
 * itself with an ink edge and a wash → the objection card lifts in over the
 * ghosted half of the table → the answer arrives one line at a time at
 * reading pace → its two source chips pop → the footer ticks from "Save to
 * library" to a saved state. One shot, latched, then settled forever.
 *
 * CONTENT PROVENANCE (design-assets/refs/session7/knowzilla-app/
 * PRODUCT-NOTES.md §3.1): the Knowledge Base is a typed, per-company,
 * timestamped library with a public/private visibility flag, and the five
 * type values are the product's own verbatim taxonomy — Sales Playbook,
 * Ideal Customer Profile, Product & Pricing Guide, Qualifying Questions,
 * Organizational Structure. Document names and owners are ours.
 *
 * FLAGGED INVENTIONS (PRODUCT-NOTES §6.2, "do not invent"):
 *  · the source citation on an answer — the product shows none. The build
 *    brief makes a sourced answer the quality bar for the whole section and
 *    this chapter's headline claims it, so it ships and goes to the
 *    checkpoint. Same call in LiveNavDetail.
 *  · the "Coverage" column — the product has no per-document score. It is
 *    the donor's ICP-Score cell in our context; it is also the only place
 *    this chapter uses colour to grade a value.
 *
 * COLOUR AS DATA (checkpoint flags): five owned type-glyph tints
 * (playbook→accent, pricing→won, ICP→ink, questions→gray, org→risk), the
 * won/gray/risk coverage pill, the won/gray visibility dot, and the accent
 * source chips. No signal ramp anywhere.
 *
 * Casing note: the product renders its visibility flag as "PUBLIC". This
 * section carries a no-uppercase rule (the eyebrow idiom is never-adjacent
 * and KineticConversation sits directly above), so it is sentence case.
 */

/* Column ORDER is a content decision: the mask runs the card opaque to 50%
 * and fades it to nothing at its right edge, so whatever the chapter
 * promises has to sit left of the fade. This chapter promises typed,
 * owned, sourced documents — hence document, coverage and owner first, with
 * type running out under the fade and the overlay.
 * SESSION 12 THINNING (owner: "too much info, messy"): six columns → five
 * (Visibility cut — the pub/private flag carried no chapter claim), eleven
 * rows → seven. v2/Attio density: the donor table runs FOUR data columns
 * (DESIGN.md:284 "checkbox | Company | ICP Score | Owner | Research agent"). */
const COLUMNS: Column[] = [
  { key: 'sel', label: '' },
  { key: 'doc', label: 'Document', sorted: true },
  { key: 'cov', label: 'Coverage', nums: true },
  { key: 'owner', label: 'Owner' , tight: true },
  { key: 'type', label: 'Type', drop: true },
]

const COLS = '20px minmax(0, 2.2fr) 56px minmax(0, 1.1fr) minmax(0, 0.8fr)'
/* ≤900px: type leaves with the mask; the four that carry the chapter's claim
 * keep their desktop proportions. */
const COLS_MD = '20px minmax(0, 2.2fr) 56px minmax(0, 1.1fr)'
const COLS_SM = '18px minmax(0, 1fr) 56px 22px'

type Doc = {
  id: string
  name: string
  type: string
  glyph: GlyphName
  tone: 'accent' | 'won' | 'ink' | 'gray' | 'risk'
  cov: number
  owner: string
  pub: boolean
}

/* Seven rows (was eleven) — enough to read as a library, few enough to
 * breathe at 38px row height in the 580px stage. */
const DOCS: Doc[] = [
  { id: 'd1', name: 'Enterprise pricing & packaging', type: 'Pricing guide', glyph: 'pricing', tone: 'won', cov: 96, owner: 'Maya Chen', pub: true },
  { id: 'd2', name: 'Objection cards — competitive', type: 'Sales playbook', glyph: 'playbook', tone: 'accent', cov: 92, owner: 'Priya Raman', pub: true },
  { id: 'd3', name: 'Security & DPA answers', type: 'Qualifying questions', glyph: 'questions', tone: 'gray', cov: 88, owner: 'Daniel Okafor', pub: true },
  { id: 'd4', name: 'Mid-market ICP', type: 'Customer profile', glyph: 'icp', tone: 'ink', cov: 84, owner: 'Maya Chen', pub: false },
  { id: 'd5', name: 'Discovery question bank', type: 'Qualifying questions', glyph: 'questions', tone: 'gray', cov: 79, owner: 'Tom Reyes', pub: true },
  { id: 'd6', name: 'Who owns what — EMEA', type: 'Org structure', glyph: 'org', tone: 'risk', cov: 74, owner: 'Lena Fischer', pub: false },
  { id: 'd7', name: 'Renewal & uplift playbook', type: 'Sales playbook', glyph: 'playbook', tone: 'accent', cov: 71, owner: 'Priya Raman', pub: true },
]

const covTone = (n: number) => (n >= 80 ? 'won' : n >= 60 ? 'gray' : 'risk')

/* The row the floating answer was drawn from. */
const CITED = 'd2'

/* ── the scenario, in milliseconds ──────────────────────────────────────
 * Durations stay on the donor's measured 85ms ladder (340/425/500/595/680)
 * and the row cascade uses its measured row beat (opacity + 6px rise). */
/* Retimed for the thinner pane (7 rows, one overlay row): the cascade ends at
 * ~520ms, so the citation mark and the card pull forward and the whole
 * scenario still lands in ~2.4s. */
const T = {
  plate: 0,
  bar: 60,
  head: 140,
  rows: 200,
  rowStep: 46,
  cite: 800,
  overlay: 880,
  ovHead: 1020,
  ovRow: 1110,
  ovRowStep: 80,
  answer: 1240,
  answerStep: 120,
  source: 1580,
  sourceStep: 110,
  foot: 1460,
  swapOut: 1880,
  swapIn: 1970,
}

/* Split by CLAUSE, not by rendered line: each clause reveals as one beat, so
 * the answer reads as it is being written even when a clause wraps. */
const ANSWER = [
  'Call notes record what happened after the call.',
  'Knowzilla changes what happens during it.',
  'The objection is named and answered while the buyer is still on the line.',
]

export default function KnowledgeDetail({ beat, go, still }: MockProps) {
  const rows: Row[] = DOCS.map((d) => ({
    id: d.id,
    mark:
      d.id === CITED ? (
        <span
          className={`pc-cite ${beat(T.cite, 'fade', 425).className}`}
          style={beat(T.cite, 'fade', 425).style}
          aria-hidden="true"
        />
      ) : undefined,
    cells: [
      <Check on={d.id === CITED} />,
      <Entity name={d.name} glyph={d.glyph} tone={d.tone} />,
      <Score tone={covTone(d.cov)}>{d.cov}</Score>,
      <Person name={d.owner} />,
      d.type,
    ],
  }))

  return (
    <Plate
      enter={beat(T.plate, 'fade', 340)}
      label="The Knowledge Base document library — seven typed documents with their coverage score, owner and type — with an objection card floating over it, answering “We already run our CRM’s call notes — how is this different?” and citing the two documents it drew the answer from."
    >
      <AppCard
        title="Knowledge base"
        count="24 documents"
        tools={['All types']}
        wide
        enter={beat(T.bar, 'soft', 500)}
      >
        <Table
          columns={COLUMNS}
          cols={COLS}
          colsMd={COLS_MD}
          colsSm={COLS_SM}
          rows={rows}
          beat={beat}
          headAt={T.head}
          rowsAt={T.rows}
          rowStep={T.rowStep}
        />
      </AppCard>

      <Overlay enter={beat(T.overlay, 'lift', 595)}>
        <OverlayHead
          glyph="objection"
          tone="risk"
          label="Objection card"
          aside="asked 14×"
          title="“We already run our CRM’s call notes — how is this different?”"
          sub="Northwind Traders · raised 3 min ago"
          enter={beat(T.ovHead, 'soft', 425)}
        />
        <OverlayBody>
          {/* session 12: the "Raised by" row was cut — one labelled row is
              context, two was clutter (owner: "too much info") */}
          <div className={beat(T.ovRow, 'soft', 340).className} style={beat(T.ovRow, 'soft', 340).style}>
            <OverlayRow label="Category">
              <Chip>Competitive</Chip>
              <Chip tone="risk">Open</Chip>
            </OverlayRow>
          </div>

          <div className="pc-ov__block">
            <p className="pc-answer">
              {ANSWER.map((line, i) => {
                const e = beat(T.answer + i * T.answerStep, 'soft', 340)
                return (
                  <span key={line} className={e.className} style={e.style}>
                    {line}
                  </span>
                )
              })}
            </p>
            <div className="pc-sources">
              {['Objection cards — competitive · p.2', 'Enterprise pricing & packaging · p.4'].map((s, i) => {
                const e = beat(T.source + i * T.sourceStep, 'pop', 340)
                return (
                  <span key={s} className={e.className} style={e.style as CSSProperties}>
                    <SourceChip>{s}</SourceChip>
                  </span>
                )
              })}
            </div>
          </div>
        </OverlayBody>

        <div className={beat(T.foot, 'soft', 425).className} style={beat(T.foot, 'soft', 425).style}>
          <OverlayFoot>
            <Swap
              go={go}
              still={still}
              outAt={T.swapOut}
              inAt={T.swapIn}
              a={<PillButton>Save to library</PillButton>}
              b={
                <PillButton tone="won">
                  <svg viewBox="0 0 10 10" aria-hidden="true" className="pc-btn__tick">
                    <path d="M1.8 5.2l2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Saved to library
                </PillButton>
              }
            />
            <TextAction>Copy the line</TextAction>
          </OverlayFoot>
        </div>
      </Overlay>
    </Plate>
  )
}
