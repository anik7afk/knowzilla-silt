import { useInView } from '../../hooks/useInView'
import { EndgameShell, EndgameHead, egEnter } from './EndgameShell'
import './ObjectionCompound.css'

/* /endgame/objection-compound — table + floating sourced-answer overlay. */

const ROWS = [
  {
    objection: 'We already run HubSpot — how is this different?',
    status: 'Saved',
    tone: 'won' as const,
    owner: 'Maya Chen',
    uses: 14,
  },
  {
    objection: 'Can you host in the EU?',
    status: 'Saved',
    tone: 'won' as const,
    owner: 'Jordan Lee',
    uses: 9,
  },
  {
    objection: 'Budget is locked until Q4.',
    status: 'Open',
    tone: 'risk' as const,
    owner: 'Sam Ortiz',
    uses: 3,
  },
  {
    objection: 'Security review will take six weeks.',
    status: 'Saved',
    tone: 'won' as const,
    owner: 'Maya Chen',
    uses: 7,
  },
  {
    objection: 'We need SSO before a pilot.',
    status: 'Draft',
    tone: 'gray' as const,
    owner: '—',
    uses: 1,
  },
]

export default function ObjectionCompound() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 })

  return (
    <EndgameShell ground="200">
      <div ref={ref as React.RefObject<HTMLDivElement>}>
        <EndgameHead
          lead="Objections compound into a library."
          tail="Every sourced answer the team lands becomes the next rep’s starting line."
          sub="Not a wiki nobody opens — cards pulled mid-call, grounded in docs your team wrote."
          enter={egEnter(inView, 0)}
        />

        <div className="oc-band">
          <div
            className={`oc-table ${inView ? 'kz-enter' : 'opacity-0'}`}
            style={{ '--enter-delay': '100ms' } as React.CSSProperties}
            role="img"
            aria-label="Team objection library table with five rows"
          >
            <div className="oc-table__bar">
              <span>Objection library</span>
              <em>Team · 42 cards</em>
            </div>
            <div className="oc-table__head">
              <span></span>
              <span>Objection</span>
              <span>Status</span>
              <span>Owner</span>
              <span>Uses</span>
            </div>
            {ROWS.map((row, i) => (
              <div
                key={row.objection}
                className={`oc-row ${i === 0 ? 'is-active' : ''} ${inView ? 'is-in' : ''}`}
                style={{ '--row-delay': `${180 + i * 90}ms` } as React.CSSProperties}
              >
                <span className="oc-row__check">{i === 0 ? '✓' : ''}</span>
                <span className="oc-row__name">{row.objection}</span>
                <span className={`oc-pill oc-pill--${row.tone}`}>{row.status}</span>
                <span className="oc-row__owner">{row.owner}</span>
                <span className="oc-row__uses tabular-nums">{row.uses}</span>
              </div>
            ))}
            <div className="oc-table__fade" aria-hidden />
          </div>

          <aside className={`oc-overlay ${inView ? 'is-in' : ''}`} aria-label="Sourced objection card">
            <header>
              <span className="oc-overlay__ask">ASK</span>
              <span>Saved to library</span>
            </header>
            <h3>We already run HubSpot — how is this different?</h3>
            <p>
              Knowzilla navigates the live call; HubSpot stores the outcome. We write the fields back
              so your CRM stays the system of record — we don’t replace it.
            </p>
            <footer>
              <span className="oc-overlay__src">Pricing playbook · p.4</span>
              <span>Save to library</span>
            </footer>
          </aside>
        </div>

        <div className="oc-features">
          {[
            {
              h: 'Answers name their source.',
              p: 'Every card cites the playbook page — so reps trust the line and managers can audit it.',
              d: 260,
            },
            {
              h: 'Reuse beats reinvention.',
              p: 'Uses accumulate. The objections that close deals rise; drafts stay drafts until someone saves.',
              d: 380,
            },
          ].map((f) => (
            <div key={f.h} {...egEnter(inView, f.d)}>
              <h3>
                {f.h} <span>{f.p}</span>
              </h3>
            </div>
          ))}
        </div>
      </div>
    </EndgameShell>
  )
}
