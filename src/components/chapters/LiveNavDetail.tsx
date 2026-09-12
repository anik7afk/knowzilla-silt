import type { CSSProperties } from 'react'
import {
  AppCard,
  Bar,
  Chip,
  NowTick,
  Overlay,
  OverlayBody,
  OverlayFoot,
  OverlayHead,
  PillButton,
  Plate,
  Score,
  SourceChip,
} from './ChapterMock'
import type { MockProps } from './ChapterMock'

/* Chapter 03 — Live navigation. "Navigated in the moment."
 *
 * The live-call guidance panel + a floating intent readout. This is the only
 * chapter whose base card is not a table: a two-column panel — the guidance
 * feed on the left, the call's own context on the right — so the four
 * showcases are four compositions rather than one repeated.
 *
 * THE PRODUCT MOMENT: the guidance rows arrive SEQUENTIALLY at reading pace
 * (300ms apart, not a cascade), so the panel reads as guidance landing while
 * a call is happening, and a 2px ink "now" needle walks down the feed with
 * them and stops on the newest row. That needle is the section rail's own
 * idiom at one scale down — a Knowzilla device, not a copy of the donor's
 * workflow run-through. The intent readout then lifts in and its four
 * confidence bars fill.
 *
 * IT MUST NOT READ AS A TRANSCRIPT. The transcript idiom is at its cap of 1
 * and already spent, and the product genuinely has no transcript panel on a
 * live call (PRODUCT-NOTES §4.3 — "speech is consumed invisibly; only
 * derived artefacts are shown"). So: no timestamps on the rows, no speaker
 * labels, no turn-taking, no waveform (cap 1, KineticConversation, adjacent).
 * Every row is a derived artefact — a category, a title, the line to say, the
 * document it came from, and how sure the model is. Flagged as a borderline
 * idiom call for the Fable pass regardless.
 *
 * CONTENT PROVENANCE (§4.2): the LIVE SUGGESTION panel is a card with a
 * category pill, a bold title and a rationale, one at a time, with a
 * "History" link top-right; NEXT STEPS is a list of ready-to-ask questions.
 *
 * FLAGGED INVENTIONS (PRODUCT-NOTES §6.2/6.3/6.4 "do not invent"): the source
 * chips, the category taxonomy beyond "Ask" (the only pill value observed),
 * the per-row confidence numbers and the intent readout. All are specified by
 * the build brief and all carry the chapter's headline claim.
 *
 * COLOUR AS DATA (checkpoint flags): the category dot grades risk (objection)
 * / gray (ask) / won (confirm); the confidence pill is won ≥70, gray below;
 * source chips are accent tint. No signal ramp.
 */

type Guidance = {
  id: string
  kind: string
  tone: 'risk' | 'gray' | 'won'
  title: string
  line: string
  source: string
  conf: number
}

const FEED: Guidance[] = [
  {
    id: 'g1',
    kind: 'Objection',
    tone: 'risk',
    title: 'Incumbent comparison',
    line: '“Ask what their call notes miss today — then name the gap, don’t list features.”',
    source: 'Objection cards — competitive · p.2',
    conf: 91,
  },
  {
    id: 'g2',
    kind: 'Ask',
    tone: 'gray',
    title: 'Clarify the decision process',
    line: '“Who signs this off, and what has to be true before they do?”',
    source: 'Discovery question bank',
    conf: 84,
  },
  {
    id: 'g3',
    kind: 'Confirm',
    tone: 'won',
    title: 'Budget range stated',
    line: '“Read the €40–60k band back to them before you move on.”',
    source: 'Enterprise pricing & packaging · p.4',
    conf: 77,
  },
]

/* SESSION 12 THINNING (owner: "too much info, messy"): the fourth guidance
 * row and the whole call-context column were cut outright. The card is now
 * the guidance feed alone — three suggestions at reading pace — and the
 * intent readout is the pane's one floating element. */

const SIGNALS: [string, string, number][] = [
  ['Alternatives in play', 'Named', 88],
  ['Budget signalled', 'Range given', 74],
  ['Champion identified', 'Partial', 51],
  ['Timeline pressure', 'Low', 28],
]

/* Three rows at 300ms apart is the "reading pace" beat: fast enough to feel
 * like one event, slow enough that each suggestion is read as it lands. */
const T = {
  plate: 0,
  bar: 60,
  feed: 220,
  feedStep: 300,
  chipLag: 180,
  overlay: 1160,
  ovHead: 1300,
  conf: 1400,
  confStep: 90,
  confBar: 1440,
  foot: 1680,
}

export default function LiveNavDetail({ beat, go, still }: MockProps) {
  const last = FEED.length - 1

  return (
    <Plate
      enter={beat(T.plate, 'fade', 340)}
      label="The live-call guidance panel during a Northwind Traders discovery call: three suggestions, each with a category, a title, the exact line to say, the document it was drawn from and a confidence score — with an intent readout floating over it showing four signals and their confidence bars."
    >
      <AppCard
        title="Live call · Northwind Traders"
        count="12:04"
        tools={['History']}
        className="pc-card--live"
        enter={beat(T.bar, 'soft', 500)}
      >
        <div className="pc-live">
          <div className="pc-live__feed">
            {FEED.map((g, i) => {
              const at = T.feed + i * T.feedStep
              const row = beat(at, 'row', 425)
              const chip = beat(at + T.chipLag, 'pop', 340)
              return (
                <div className={`pc-guide ${row.className}`} style={row.style} key={g.id}>
                  <NowTick
                    go={go}
                    still={still}
                    inAt={at + 120}
                    outAt={i === last ? undefined : T.feed + (i + 1) * T.feedStep + 120}
                  />
                  <div className="pc-guide__top">
                    <Chip tone={g.tone}>{g.kind}</Chip>
                    <span className="pc-guide__title">{g.title}</span>
                  </div>
                  <p className="pc-guide__line">{g.line}</p>
                  <div className="pc-guide__foot">
                    <span className={chip.className} style={chip.style as CSSProperties}>
                      <SourceChip>{g.source}</SourceChip>
                    </span>
                    <span className="pc-guide__conf">
                      <Score tone={g.conf >= 70 ? 'won' : 'gray'}>{g.conf}</Score>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </AppCard>

      <Overlay enter={beat(T.overlay, 'lift', 595)}>
        <OverlayHead
          glyph="intent"
          label="Intent read"
          aside="this call"
          title="Evaluating, not browsing"
          sub="Re-read on every objection · 4 signals"
          enter={beat(T.ovHead, 'soft', 425)}
        />
        <OverlayBody>
          {/* session 12: the "Speaking to" row was cut — the readout leads
              with its four signals, which are the claim */}
          <div className="pc-ov__block">
            {SIGNALS.map(([label, state, value], i) => {
              const top = beat(T.conf + i * T.confStep, 'soft', 340)
              const bar = beat(T.confBar + i * T.confStep, 'bar', 500)
              return (
                <div className="pc-conf" key={label}>
                  <div className={`pc-conf__top ${top.className}`} style={top.style}>
                    <Chip>{label}</Chip>
                    <span className="pc-conf__state">{state}</span>
                    <span className="pc-rubric__value">{value}</span>
                  </div>
                  <Bar value={value} tone={value >= 70 ? 'won' : 'ink'} enter={bar} />
                </div>
              )
            })}
          </div>
        </OverlayBody>

        <div className={beat(T.foot, 'soft', 425).className} style={beat(T.foot, 'soft', 425).style}>
          <OverlayFoot>
            <PillButton>Open the playbook</PillButton>
          </OverlayFoot>
        </div>
      </Overlay>
    </Plate>
  )
}
