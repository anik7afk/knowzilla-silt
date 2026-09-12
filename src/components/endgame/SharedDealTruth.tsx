import { Check } from 'lucide-react'
import { useInView } from '../../hooks/useInView'
import { EndgameShell, EndgameHead, egEnter } from './EndgameShell'
import './SharedDealTruth.css'

/* /endgame/shared-truth — dual-card Attio showcase: one session, three seats. */

const LEDGER = [
  { role: 'Account Executive', sees: 'Next ask · EU hosting options', tone: 'ink' as const },
  { role: 'Sales Leader', sees: 'Risk · data residency flagged', tone: 'risk' as const },
  { role: 'Revenue Operations', sees: 'CRM · Stage → Negotiation', tone: 'won' as const },
]

const REVIEW = [
  { k: 'Talk ratio', v: '58 / 42' },
  { k: 'Risk', v: 'Data residency (EU)' },
  { k: 'Commitment', v: 'Revised MSA this week' },
  { k: 'Champion', v: 'Dana Whitfield' },
]

export default function SharedDealTruth() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.22 })

  return (
    <EndgameShell ground="100">
      <div ref={ref as React.RefObject<HTMLDivElement>}>
        <EndgameHead
          lead="One call. One shared truth."
          tail="AE, leader, and ops read the same session — not three conflicting notes."
          sub="The post-call record is the product’s source of truth, not a private AE scratchpad."
          enter={egEnter(inView, 0)}
        />

        <div className="sdt-band">
          <div
            className={`sdt-base ${inView ? 'kz-enter' : 'opacity-0'}`}
            style={{ '--enter-delay': '120ms' } as React.CSSProperties}
            role="img"
            aria-label="Three roles reading the same Northwind session"
          >
            <div className="sdt-base__bar">
              <span>Northwind Traders</span>
              <em>Session · 24:18</em>
            </div>
            <ul className="sdt-roles">
              {LEDGER.map((row, i) => (
                <li
                  key={row.role}
                  className={inView ? 'kz-enter' : 'opacity-0'}
                  style={{ '--enter-delay': `${220 + i * 110}ms` } as React.CSSProperties}
                >
                  <span className="sdt-roles__label">{row.role}</span>
                  <span className={`sdt-roles__sees sdt-roles__sees--${row.tone}`}>{row.sees}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside
            className={`sdt-overlay ${inView ? 'is-in' : ''}`}
            aria-label="Shared session review card"
          >
            <header>
              <span>Session review</span>
              <span className="sdt-overlay__chip">
                <Check size={11} strokeWidth={2.5} />
                Shared
              </span>
            </header>
            <dl>
              {REVIEW.map((r) => (
                <div key={r.k}>
                  <dt>{r.k}</dt>
                  <dd>{r.v}</dd>
                </div>
              ))}
            </dl>
            <footer>Written once · visible to the whole deal room</footer>
          </aside>
        </div>

        <div className="sdt-features">
          {[
            {
              h: 'Forecast without the scramble.',
              p: 'Leaders see risk the moment the call ends — same panel the AE just confirmed.',
              d: 280,
            },
            {
              h: 'Ops stops chasing updates.',
              p: 'The CRM line and the session review are the same fact, not a Slack paraphrase.',
              d: 400,
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
