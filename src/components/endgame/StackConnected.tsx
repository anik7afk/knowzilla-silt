import { useInView } from '../../hooks/useInView'
import { INTEGRATION_MARKS } from '../logos'
import { EndgameShell, EndgameHead, egEnter } from './EndgameShell'
import './StackConnected.css'

/* /endgame/stack — Attio ecosystem-rail idiom with Knowzilla's real marks. */

const CALLOUTS = [
  { title: 'CRM stays the system of record', body: 'Write-back lands in HubSpot, Salesforce, Pipedrive, or Attio — Knowzilla doesn’t replace them.' },
  { title: 'Calendar context, not a meeting bot', body: 'Google Calendar and Microsoft 365 keep the schedule; audio arrives from the call the rep already joined.' },
  { title: 'Docs your team already wrote', body: 'Notion and the knowledge base ground every mid-call answer in a named source.' },
]

export default function StackConnected() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 })
  const loop = [...INTEGRATION_MARKS, ...INTEGRATION_MARKS]

  return (
    <EndgameShell ground="300">
      <div ref={ref as React.RefObject<HTMLDivElement>}>
        <EndgameHead
          lead="Your whole stack, connected."
          tail="CRM, calendar, and docs — the tools the team already runs."
          sub="Deeper than the logo strip: one connected-state story per surface."
          enter={egEnter(inView, 0)}
        />

        <div
          className={`stk-rail ${inView ? 'is-in' : ''}`}
          role="img"
          aria-label="Integration marks scrolling: Salesforce, HubSpot, Pipedrive, Attio, Google Calendar, Notion, Microsoft 365"
        >
          <div className="stk-rail__fade stk-rail__fade--l" aria-hidden />
          <div className="stk-rail__fade stk-rail__fade--r" aria-hidden />
          <div className="stk-rail__track">
            {loop.map((mark, i) => (
              <div
                key={`${mark.name}-${i}`}
                className="stk-tile"
                style={{ '--tile-delay': `${80 + (i % INTEGRATION_MARKS.length) * 70}ms` } as React.CSSProperties}
              >
                <span className="stk-tile__mark">{mark.mark}</span>
                <span className="stk-tile__name">{mark.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stk-callouts">
          {CALLOUTS.map((c, i) => (
            <article key={c.title} {...egEnter(inView, 280 + i * 120)}>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </EndgameShell>
  )
}
