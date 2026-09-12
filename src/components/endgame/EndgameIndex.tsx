import CallToRecord from './CallToRecord'
import SharedDealTruth from './SharedDealTruth'
import ObjectionCompound from './ObjectionCompound'
import StackConnected from './StackConnected'
import BetterAsYouNavigate from './BetterAsYouNavigate'
import './EndgameIndex.css'

/* /endgame — gallery + optional stacked preview. Landing flow untouched. */

const LINKS = [
  {
    href: '/endgame/call-to-record',
    index: '01',
    title: 'Call → record',
    blurb: 'Workflow canvas: hang-up → intel → follow-up → HubSpot.',
    donor: 'Attio convert-leads canvas',
  },
  {
    href: '/endgame/shared-truth',
    index: '02',
    title: 'Shared deal truth',
    blurb: 'AE, leader, and ops reading the same session review.',
    donor: 'Attio dual-card showcase',
  },
  {
    href: '/endgame/objection-compound',
    index: '03',
    title: 'Objection compound',
    blurb: 'Library table + sourced answer overlay.',
    donor: 'Attio build-pipeline table',
  },
  {
    href: '/endgame/stack',
    index: '04',
    title: 'Stack connected',
    blurb: 'Ecosystem rail of real CRM / calendar / docs marks.',
    donor: 'Attio ecosystem rail',
  },
  {
    href: '/endgame/better',
    index: '05',
    title: 'Better as you navigate',
    blurb: 'Changelog-style cards + soft close band.',
    donor: 'Attio “Better as you grow”',
  },
]

export default function EndgameIndex({ stacked = false }: { stacked?: boolean }) {
  if (stacked || (typeof window !== 'undefined' && window.location.search.includes('stack=1'))) {
    return (
      <main className="eg-index eg-index--stack">
        <div className="eg-index__banner">
          <p>
            Endgame stacked preview · auditioning for <code>Stats → ClosingCta</code>
          </p>
          <a href="/endgame">Back to gallery</a>
        </div>
        <CallToRecord />
        <SharedDealTruth />
        <ObjectionCompound />
        <StackConnected />
        <BetterAsYouNavigate />
      </main>
    )
  }

  return (
    <main className="eg-index">
      <header className="eg-index__hero">
        <p className="eg-index__eyebrow">Standalone review · not on the landing page</p>
        <h1>
          Endgame sections <span>Stats → ClosingCta candidates</span>
        </h1>
        <p className="eg-index__lede">
          Five Attio-inspired ending beats with Knowzilla content. Open each alone, or scroll the
          stacked preview to feel the rhythm.
        </p>
        <a className="eg-index__stack-cta" href="/endgame?stack=1">
          Scroll all five →
        </a>
      </header>

      <ol className="eg-index__list">
        {LINKS.map((item) => (
          <li key={item.href}>
            <a href={item.href}>
              <span className="eg-index__n">{item.index}</span>
              <span className="eg-index__body">
                <strong>{item.title}</strong>
                <em>{item.blurb}</em>
                <small>{item.donor}</small>
              </span>
              <span className="eg-index__go" aria-hidden>
                →
              </span>
            </a>
          </li>
        ))}
      </ol>
    </main>
  )
}
