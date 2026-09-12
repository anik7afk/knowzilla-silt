import { AppCard, Bar, Chip, Overlay, OverlayBody, OverlayHead, Plate, SourceChip, Swap } from './ChapterMock'
import type { MockProps } from './ChapterMock'
import './PracticeDetail.css'

/* Chapter 02 — Practice. "Rehearse before it’s real."
 *
 * REVISION 4 (2026-07-27, session 12 owner pivot). Revision 3's three-region
 * composition (persona card + three move cards on a spine + scorecard) was
 * ruled "too much info, messy". This rebuild thins the pane to the section's
 * new standard anatomy: ONE focal surface + ONE floating overlay.
 *   · FOCAL: the practice scorecard as a real app card (toolbar + 20px body,
 *     v2's body-pad standard) — overall score arriving by dash→7/10 swap,
 *     the won-tinted goal chip, five rubric bars growing to value, and the
 *     written feedback line. This is the product moment and now it is the
 *     whole card.
 *   · OVERLAY: the persona — the AI buyer the rep drilled against — floating
 *     top-right over the card's ghosted columns: identity, the verbatim
 *     opening line, difficulty, and the two Knowledge-Base documents the
 *     drill was configured with (the chapter-01 hand-off).
 *   · CUT OUTRIGHT: the three move cards, the spine, the trait chips, the
 *     customer-type row. The drill's blow-by-blow was the crowding.
 *
 * CONTENT PROVENANCE — unchanged from revision 3 (PRODUCT-NOTES §3.2/3.4/§5):
 * persona "Gatekeeper Greg" + its opening line verbatim; the five rubric axes
 * Clarity/Empathy/Engagement/Relevance/Professionalism verbatim; Overall
 * Score n/10 + Goal Achieved vocabulary; the 04:52 timer format; a Sales
 * Playbook required + Customer Profile optional as drill inputs. The company
 * stays Northwind Traders (page cast unify, flagged in IntelDetail's r3
 * header). Difficulty "Hard" remains a flagged invention (only "Medium"
 * observed). All still sentence case (no-uppercase rule, KC adjacency).
 *
 * COLOUR: rubric bars graded won-700 ≥8 / ink 6–7 / risk ≤5 (bright green is
 * the stroke step — owner's Attio-green directive; solid won-900 fills are
 * banned); won-tinted goal chip; accent SourceChips for provenance. */

/* The product's five rubric axes, verbatim and in its own order
 * (PRODUCT-NOTES §3.4). Values mean 7 — the overall score. */
const RUBRIC: [string, number][] = [
  ['Clarity', 8],
  ['Empathy', 5],
  ['Engagement', 7],
  ['Relevance', 8],
  ['Professionalism', 7],
]

const axisTone = (n: number) => (n >= 8 ? 'won' : n >= 6 ? 'ink' : 'risk')

/* Both are real Cold Call Practice inputs — a Sales Playbook is REQUIRED, an
 * Ideal Customer Profile optional — so the provenance mark here is the
 * product's own configuration, not a citation we invented. */
const INPUTS = ['Sales playbook · Tolerate & Pay', 'Customer profile · Mid-market']

/* ── the scenario, in milliseconds ──────────────────────────────────────
 * Durations stay on the donor's measured 85ms ladder (340/425/500/595/680).
 * The persona (the setup) lifts in first; the scorecard (the consequence)
 * fills after it — reading order is the argument. */
const T = {
  plate: 0,
  overlay: 200,
  ovHead: 340,
  ovQuote: 460,
  ovMeta: 570,
  ovInputs: 680,
  ovInputStep: 90,
  card: 620,
  cardHead: 760,
  overall: 860,
  axis: 960,
  axisBar: 1000,
  axisStep: 70,
  swapOut: 1560,
  swapIn: 1650,
  goal: 1760,
  verdict: 1880,
}

export default function PracticeDetail({ beat, go, still }: MockProps) {
  const head = beat(T.cardHead, 'soft', 425)
  const overall = beat(T.overall, 'soft', 340)
  const goal = beat(T.goal, 'pop', 340)
  const verdict = beat(T.verdict, 'soft', 425)
  const quote = beat(T.ovQuote, 'soft', 340)
  const meta = beat(T.ovMeta, 'soft', 340)

  return (
    <Plate
      enter={beat(T.plate, 'fade', 340)}
      label="A practice scorecard the moment a drill ends: overall 7 out of 10, the goal marked achieved, five rubric bars — clarity 8, empathy 5, engagement 7, relevance 8, professionalism 7 — and a written feedback line. Floating over it, the AI buyer the rep drilled against: Gatekeeper Greg, office of the COO at Northwind Traders, hard difficulty, configured from a sales playbook and a customer profile."
    >
      <AppCard
        title="Cold call practice · Gatekeeper Greg"
        count="04:52"
        wide
        className="pc-card--score"
        enter={beat(T.card, 'soft', 500)}
      >
        <div className="pc2-body">
          <div className={`pc2-overall ${overall.className}`} style={overall.style}>
            <span className="pc2-key">Overall score</span>
            <span className="pc2-big">
              <Swap
                go={go}
                still={still}
                outAt={T.swapOut}
                inAt={T.swapIn}
                a={<span className="pc2-big__n pc2-big__n--none">—</span>}
                b={
                  <span className="pc2-big__n">
                    7<i>/10</i>
                  </span>
                }
              />
            </span>
            <span className={goal.className} style={goal.style}>
              <Chip tone="won">Goal achieved</Chip>
            </span>
          </div>

          <div className="pc2-rubric">
            {RUBRIC.map(([axis, value], i) => {
              const label = beat(T.axis + i * T.axisStep, 'soft', 340)
              const bar = beat(T.axisBar + i * T.axisStep, 'bar', 425)
              return (
                <div className="pc2-axis" key={axis}>
                  <span className={`pc2-axis__k ${label.className}`} style={label.style}>
                    {axis}
                  </span>
                  <span className={`pc2-axis__v ${label.className}`} style={label.style}>
                    {value}
                  </span>
                  <Bar value={value * 10} tone={axisTone(value)} enter={bar} />
                </div>
              )
            })}
          </div>

          <div className={`pc2-foot ${head.className}`} style={head.style}>
            <span className="pc2-key">Feedback</span>
            <span className={`pc2-verdict ${verdict.className}`} style={verdict.style}>
              Strong on the open and the ask — <strong>empathy is the axis to work</strong>, you
              talked past two of Greg’s questions.
            </span>
          </div>
        </div>
      </AppCard>

      {/* the AI buyer — the pane's one floating element */}
      <Overlay place="tr" enter={beat(T.overlay, 'lift', 595)}>
        <OverlayHead
          glyph="persona"
          label="Persona"
          aside="picked before the drill"
          title="Gatekeeper Greg"
          sub="Office of the COO · Northwind Traders"
          enter={beat(T.ovHead, 'soft', 425)}
        />
        <OverlayBody>
          <div className={quote.className} style={quote.style}>
            <span className="pc2-key">Opens with</span>
            <p className="pc2-quote">“Office of the COO, Greg speaking. What is this regarding?”</p>
          </div>
          <div className={`pc2-meta ${meta.className}`} style={meta.style}>
            <span className="pc2-key">Difficulty</span>
            <span className="pc2-meta__v">
              {/* difficulty is not good-or-bad, so the meter stays ink */}
              <span className="pc2-meter" aria-hidden="true">
                <i className="is-on" />
                <i className="is-on" />
                <i className="is-on" />
              </span>
              Hard
            </span>
          </div>
          <div className="pc2-inputs">
            {INPUTS.map((s, i) => {
              const e = beat(T.ovInputs + i * T.ovInputStep, 'pop', 340)
              return (
                <span key={s} className={e.className} style={e.style}>
                  <SourceChip>{s}</SourceChip>
                </span>
              )
            })}
          </div>
        </OverlayBody>
      </Overlay>
    </Plate>
  )
}
