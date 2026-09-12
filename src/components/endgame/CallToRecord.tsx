import { useEffect, useState } from 'react'
import { Check, Database, FileText, Mail, PhoneOff } from 'lucide-react'
import { useInView } from '../../hooks/useInView'
import { EndgameShell, EndgameHead, egEnter } from './EndgameShell'
import './CallToRecord.css'

/* /endgame/call-to-record — Attio workflow-canvas idiom (DESIGN.md §4.4 art.2)
 * with Knowzilla's after-call loop. Standalone review only. */

type NodeDef = {
  id: string
  x: number
  y: number
  title: string
  type: string
  sub: string
  icon: 'phone' | 'notes' | 'mail' | 'crm'
  delay: number
  pillDelay: number
  pill: string
}

const NODES: NodeDef[] = [
  {
    id: 'n1',
    x: 12,
    y: 18,
    title: 'Call ends',
    type: 'Trigger',
    sub: 'Northwind · 24:18',
    icon: 'phone',
    delay: 80,
    pillDelay: 420,
    pill: 'Triggered',
  },
  {
    id: 'n2',
    x: 42,
    y: 18,
    title: 'Session review',
    type: 'Extract',
    sub: '4 intel lists drafted',
    icon: 'notes',
    delay: 520,
    pillDelay: 980,
    pill: 'Completed',
  },
  {
    id: 'n3',
    x: 72,
    y: 8,
    title: 'Follow-up email',
    type: 'Action',
    sub: 'Draft ready for Dana',
    icon: 'mail',
    delay: 1100,
    pillDelay: 1580,
    pill: 'Completed',
  },
  {
    id: 'n4',
    x: 72,
    y: 52,
    title: 'CRM write-back',
    type: 'Sync',
    sub: 'HubSpot · 5 fields',
    icon: 'crm',
    delay: 1220,
    pillDelay: 1720,
    pill: 'Synced',
  },
]

const EDGES: { d: string; delay: number; dur: number }[] = [
  { d: 'M 22 28 C 28 28, 32 28, 38 28', delay: 380, dur: 520 },
  { d: 'M 58 24 C 64 24, 66 16, 70 14', delay: 900, dur: 480 },
  { d: 'M 58 32 C 64 32, 66 48, 70 58', delay: 980, dur: 520 },
]

function NodeIcon({ kind }: { kind: NodeDef['icon'] }) {
  const props = { size: 13, strokeWidth: 2 }
  switch (kind) {
    case 'phone':
      return <PhoneOff {...props} />
    case 'notes':
      return <FileText {...props} />
    case 'mail':
      return <Mail {...props} />
    case 'crm':
      return <Database {...props} />
  }
}

export default function CallToRecord() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.25 })
  const [go, setGo] = useState(false)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setStill(mq.matches)
    const on = () => setStill(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    if (inView) setGo(true)
  }, [inView])

  const live = go || still

  return (
    <EndgameShell ground="300">
      <div ref={ref as React.RefObject<HTMLDivElement>}>
        <EndgameHead
          lead="The call becomes the record."
          tail="Intel drafts, the follow-up writes itself, and HubSpot updates without a second pass."
          sub="One execution loop after hang-up — the same story WriteBack tells, read as a motion."
          enter={egEnter(live, 0)}
        />

        <div
          className={`ctr-stage ${live ? 'is-live' : ''} ${still ? 'is-still' : ''}`}
          role="img"
          aria-label="After-call workflow: call ends, session review, follow-up email, CRM write-back"
        >
          <div className="ctr-dots" aria-hidden />

          <svg className="ctr-edges" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden>
            {EDGES.map((e, i) => (
              <path
                key={i}
                className="ctr-edge"
                d={e.d}
                style={
                  {
                    '--edge-delay': `${e.delay}ms`,
                    '--edge-dur': `${e.dur}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </svg>

          {NODES.map((n) => (
            <article
              key={n.id}
              className={`ctr-node ctr-node--${n.icon}`}
              style={
                {
                  left: `${n.x}%`,
                  top: `${n.y}%`,
                  '--node-delay': `${n.delay}ms`,
                  '--pill-delay': `${n.pillDelay}ms`,
                } as React.CSSProperties
              }
            >
              <span className="ctr-node__pill">
                <Check size={10} strokeWidth={2.5} />
                {n.pill}
              </span>
              <div className="ctr-node__card">
                <div className="ctr-node__top">
                  <span className="ctr-node__icon">
                    <NodeIcon kind={n.icon} />
                  </span>
                  <div>
                    <p className="ctr-node__title">{n.title}</p>
                    <span className="ctr-node__type">{n.type}</span>
                  </div>
                </div>
                <p className="ctr-node__sub">{n.sub}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="ctr-features">
          {[
            {
              h: 'Four intel lists, editable first.',
              p: 'Pain points, goals, blockers, decision criteria — review before they save.',
              d: 200,
            },
            {
              h: 'CRM fields fill themselves.',
              p: 'Stage, next step, champion, objection handled, call summary — then a synced chip.',
              d: 320,
            },
          ].map((f) => (
            <div key={f.h} {...egEnter(live, f.d)}>
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
