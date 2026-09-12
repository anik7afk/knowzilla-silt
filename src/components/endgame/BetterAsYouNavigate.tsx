import { useInView } from '../../hooks/useInView'
import { EndgameShell, EndgameHead, egEnter } from './EndgameShell'
import './BetterAsYouNavigate.css'

/* /endgame/better — Attio changelog / “Better as you grow” grammar. */

const CARDS = [
  {
    when: 'After practice',
    title: 'Rubric scores compound',
    body: 'Clarity, empathy, relevance, engagement, professionalism — reps see the five moves that actually move deals.',
  },
  {
    when: 'Mid-call',
    title: 'Answers stay grounded',
    body: 'Every line names the doc it came from. The library gets sharper as the team saves what works.',
  },
  {
    when: 'After hang-up',
    title: 'Intel writes itself',
    body: 'Pain points, goals, blockers, decision criteria — editable once, then the CRM catches up.',
  },
  {
    when: 'Across the team',
    title: 'One deal room, same facts',
    body: 'AE, leader, and ops stop arguing from three notebooks. The session review is the shared record.',
  },
]

export default function BetterAsYouNavigate() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 })
  const closeEnter = egEnter(inView, 520)

  return (
    <EndgameShell ground="100">
      <div ref={ref as React.RefObject<HTMLDivElement>}>
        <EndgameHead
          lead="Better as you navigate."
          tail="Practice, live guidance, and write-back that compound with every session."
          sub="No fake usage counters — just the product loop getting tighter."
          enter={egEnter(inView, 0)}
        />

        <div
          className={`bay-scroller ${inView ? 'is-in' : ''}`}
          role="list"
          aria-label="Four ways Knowzilla compounds over time"
        >
          {CARDS.map((card, i) => (
            <article
              key={card.title}
              role="listitem"
              className="bay-card"
              style={{ '--card-delay': `${140 + i * 100}ms` } as React.CSSProperties}
            >
              <time>{card.when}</time>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>

        <div className={`bay-newsletter ${closeEnter.className}`} style={closeEnter.style}>
          <div>
            <p className="bay-newsletter__lead">
              Ready when the next call starts. <span>Sales, navigated.</span>
            </p>
          </div>
          <a className="bay-newsletter__cta" href="#start">
            Start navigating →
          </a>
        </div>
      </div>
    </EndgameShell>
  )
}
