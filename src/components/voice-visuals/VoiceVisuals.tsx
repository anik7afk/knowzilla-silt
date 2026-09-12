import { useRef, useState, type ReactNode } from 'react'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Blocks,
  BrainCircuit,
  BriefcaseBusiness,
  Calendar,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Code2,
  Database,
  ExternalLink,
  Filter,
  FileText,
  Gauge,
  GitBranch,
  Globe2,
  Headphones,
  ListChecks,
  Network,
  Play,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  WandSparkles,
} from 'lucide-react'
import { useInView } from '../../hooks/useInView'
import { useTypeScene } from '../mock/typewriter'
import './VoiceVisuals.css'

type VisualProps = {
  className?: string
}

function cn(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ')
}

function VisualFrame({
  children,
  className,
  label,
}: VisualProps & { children: ReactNode; label: string }) {
  return (
    <div
      className={cn(
        'voice-frame overflow-hidden rounded-card border border-hairline-2 bg-surface-100 shadow-frame',
        className,
      )}
      aria-label={label}
    >
      {children}
    </div>
  )
}

function Eyebrow({
  children,
  tone = 'muted',
}: {
  children: ReactNode
  tone?: 'muted' | 'accent' | 'live' | 'risk' | 'signal'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.12em] uppercase',
        tone === 'muted' && 'text-ink-secondary',
        tone === 'accent' && 'text-accent-700',
        tone === 'live' && 'text-won-900',
        tone === 'risk' && 'text-risk-900',
        tone === 'signal' && 'text-signal-700',
      )}
    >
      {children}
    </span>
  )
}

function Dot({ tone = 'accent' }: { tone?: 'accent' | 'live' | 'risk' | 'signal' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-block size-2 rounded-full',
        tone === 'accent' && 'bg-accent-600',
        tone === 'live' && 'bg-won-700',
        tone === 'risk' && 'bg-risk-700',
        tone === 'signal' && 'bg-signal-600',
        tone === 'muted' && 'bg-gray-400',
      )}
    />
  )
}

export function LiveTranscript({ className }: VisualProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const buyerRef = useRef<HTMLSpanElement>(null)
  const repRef = useRef<HTMLSpanElement>(null)
  const buyerCaret = useRef<HTMLSpanElement>(null)
  const repCaret = useRef<HTMLSpanElement>(null)
  const responseRef = useRef<HTMLDivElement>(null)

  useTypeScene(
    () => [
      { kind: 'type', el: buyerRef, caret: buyerCaret, text: 'We need the rollout to be low risk.', cps: 34 },
      { kind: 'pause', ms: 420 },
      { kind: 'show', el: responseRef },
      { kind: 'type', el: repRef, caret: repCaret, text: 'That’s exactly what the two-rep pilot is for.', cps: 38 },
    ],
    { fadeRoot: sceneRef, holdMs: 3200, gapMs: 360 },
  )

  return (
    <VisualFrame className={className} label="Live transcript component">
      <div className="flex items-center justify-between border-b border-hairline-2 bg-surface-200 px-4 py-3">
        <Eyebrow>Live transcript</Eyebrow>
        <Eyebrow tone="live">
          <Dot tone="live" /> Transcribing
        </Eyebrow>
      </div>
      <div ref={sceneRef} className="mock-fade-root space-y-5 p-5">
        <div className="grid grid-cols-[32px_1fr] gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-surface-300 text-[12px] font-semibold text-gray-800">
            MC
          </span>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-semibold text-ink">Maya Chen</span>
              <span className="font-mono text-[10px] text-gray-700">00:08</span>
            </div>
            <p className="mt-2 min-h-10 text-[14px] leading-5 text-gray-800">
              <span ref={buyerRef} />
              <span ref={buyerCaret} className="tw-caret" aria-hidden="true" />
            </p>
          </div>
        </div>
        <div ref={responseRef} className="mock-reveal grid grid-cols-[32px_1fr] gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-accent-100 text-[12px] font-semibold text-accent-800">
            You
          </span>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-semibold text-ink">You</span>
              <span className="font-mono text-[10px] text-gray-700">00:14</span>
            </div>
            <p className="mt-2 min-h-10 text-[14px] leading-5 text-gray-800">
              <span ref={repRef} />
              <span ref={repCaret} className="tw-caret" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </VisualFrame>
  )
}

export function ObjectionDetected({ className }: VisualProps) {
  return (
    <VisualFrame className={className} label="Objection detected component">
      <div className="p-5">
        <Eyebrow tone="accent">
          <WandSparkles size={14} strokeWidth={1.75} /> Objection detected
        </Eyebrow>
        <p className="mt-4 text-[12px] font-medium text-ink-secondary">Question detected</p>
        <p className="mt-1 text-[17px] font-medium leading-6 tracking-[-0.17px] text-ink">
          How is this different from our CRM?
        </p>
        <div className="my-4 h-px bg-hairline-2" />
        <p className="text-[14px] leading-5 text-gray-800">
          Knowzilla guides the call live and writes outcomes back automatically.
        </p>
        <span className="mt-4 inline-flex h-7 items-center gap-2 rounded-tag border border-hairline-2 bg-surface-200 px-2.5 font-mono text-[10px] text-ink-secondary">
          <FileText size={13} strokeWidth={1.75} /> Competitive playbook · p.4
        </span>
      </div>
    </VisualFrame>
  )
}

export function NextBestAction({ className }: VisualProps) {
  const [inserted, setInserted] = useState(false)

  return (
    <VisualFrame className={className} label="Next best action component">
      <div className="p-5">
        <Eyebrow>Next best action</Eyebrow>
        <div className="mt-4 flex gap-3">
          <ArrowRight className="mt-0.5 shrink-0 text-accent-600" size={19} strokeWidth={1.75} />
          <p className="text-[15px] leading-6 text-ink">
            Reframe on ROI, not cost. Offer a two-rep pilot.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-hairline-2 pt-4">
          <Eyebrow tone="signal">
            <Gauge size={13} /> Confidence 92%
          </Eyebrow>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="voice-button voice-button--primary kz-focus-ring"
              onClick={() => setInserted((value) => !value)}
            >
              {inserted ? 'Inserted' : 'Insert'}
              {inserted ? <Check size={14} /> : <ChevronRight size={14} />}
            </button>
            <button type="button" className="voice-button voice-button--quiet kz-focus-ring">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </VisualFrame>
  )
}

const WRITEBACK_ROWS = [
  ['deal_stage', 'Evaluation'],
  ['next_step', 'Pilot · 2 reps'],
  ['next_meeting', 'Thu · 10:00'],
]

export function CrmWriteback({ className }: VisualProps) {
  return (
    <VisualFrame className={className} label="CRM writeback component">
      <div className="border-b border-hairline-2 bg-surface-200 px-4 py-3">
        <Eyebrow>CRM writeback</Eyebrow>
      </div>
      <div className="space-y-3 p-5">
        {WRITEBACK_ROWS.map(([field, value], index) => (
          <div key={field} className="grid grid-cols-[28px_1fr_auto] items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-tile bg-accent-100 text-accent-700">
              {index === 0 ? <Database size={14} /> : index === 1 ? <ListChecks size={14} /> : <Calendar size={14} />}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-ink-secondary">{field}</p>
              <p className="truncate text-[13px] font-medium text-ink">{value}</p>
            </div>
            <span className="voice-sync-dot" style={{ '--sync-index': index } as React.CSSProperties}>
              <Check size={11} />
            </span>
          </div>
        ))}
        <div className="flex items-center justify-end border-t border-hairline-2 pt-3">
          <Eyebrow tone="live">
            <Dot tone="live" /> Synced
          </Eyebrow>
        </div>
      </div>
    </VisualFrame>
  )
}

const INTENT_SIGNALS = [
  ['Security', 'High'],
  ['Timing', 'This quarter'],
  ['Budget', 'Confirmed'],
]

export function BuyerIntent({ className }: VisualProps) {
  return (
    <VisualFrame className={className} label="Buyer intent component">
      <div className="flex items-center justify-between border-b border-hairline-2 bg-surface-200 px-4 py-3">
        <Eyebrow>Buyer intent</Eyebrow>
        <Dot tone="live" />
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 divide-x divide-hairline-2">
          {INTENT_SIGNALS.map(([label, value]) => (
            <div key={label} className="px-3 first:pl-0 last:pr-0">
              <p className="text-[12px] text-ink-secondary">{label}</p>
              <p className="mt-1 text-[13px] font-semibold text-accent-700">{value}</p>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 320 72" className="mt-4 h-auto w-full" role="img" aria-label="Buyer intent rising">
          <path d="M4 54 C42 48, 66 58, 94 45 S145 50, 172 34 S220 38, 248 23 S284 26, 316 10" className="voice-intent-line" pathLength="1" />
          <path d="M4 38 H316" className="voice-intent-baseline" />
          <circle cx="316" cy="10" r="4" className="voice-intent-point" />
        </svg>
        <p className="mt-2 flex items-center gap-2 text-[12px] leading-5 text-gray-800">
          <Target size={14} className="shrink-0 text-accent-600" />
          Intent strengthened in the last 42 seconds.
        </p>
      </div>
    </VisualFrame>
  )
}

const CONTEXT_ROWS = [
  { icon: UserRound, source: 'CRM', value: 'Expansion · 120 seats' },
  { icon: FileText, source: 'Pricing', value: 'Enterprise · 14% ceiling' },
  { icon: Calendar, source: 'Calendar', value: 'Procurement review · Friday' },
]

export function AccountContext({ className }: VisualProps) {
  return (
    <VisualFrame className={className} label="Account context component">
      <div className="border-b border-hairline-2 bg-surface-200 px-4 py-3">
        <Eyebrow>Account context</Eyebrow>
      </div>
      <div className="space-y-2 p-4">
        {CONTEXT_ROWS.map(({ icon: Icon, source, value }) => (
          <div key={source} className="flex items-center gap-3 rounded-tile border border-hairline-1 bg-surface-100 p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-tile bg-accent-100 text-accent-700">
              <Icon size={15} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="font-mono font-[550] text-[10px] uppercase tracking-[0.1em] text-accent-700">{source}</p>
              <p className="truncate text-[12px] font-medium text-ink">{value}</p>
            </div>
            <ChevronRight className="ml-auto shrink-0 text-gray-500" size={14} />
          </div>
        ))}
        <div className="flex items-center gap-2 px-1 pt-1">
          <Dot tone="signal" />
          <Eyebrow tone="signal">Freshness 0.8s</Eyebrow>
        </div>
      </div>
    </VisualFrame>
  )
}

const COACHING_SCORES = [
  ['Discovery depth', 86],
  ['Objection handling', 74],
  ['Talk / listen', 62],
  ['Next-step clarity', 91],
] as const

export function CallCoaching({ className }: VisualProps) {
  return (
    <VisualFrame className={className} label="Live call coaching component">
      <div className="p-5">
        <Eyebrow tone="live">
          <Dot tone="live" /> Live coaching
        </Eyebrow>
        <div className="mt-5 space-y-4">
          {COACHING_SCORES.map(([label, score], index) => (
            <div key={label}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ink-secondary">{label}</span>
                <span className="font-mono text-[10px] text-ink">{score}</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-300">
                <span
                  className="voice-score-fill block h-full rounded-full bg-accent-500"
                  style={
                    {
                      '--score': `${score / 100}`,
                      '--score-index': index,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 flex items-start gap-2 border-t border-hairline-2 pt-4 text-[12px] leading-5 text-gray-800">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-accent-600" />
          Slow down. Ask one follow-up before pitching.
        </p>
      </div>
    </VisualFrame>
  )
}

export function FollowUpReady({ className }: VisualProps) {
  const [selected, setSelected] = useState('Tue · 10:30')
  const [scheduled, setScheduled] = useState(false)

  return (
    <VisualFrame className={className} label="Follow-up ready component">
      <div className="p-5">
        <Eyebrow tone="accent">
          <Calendar size={14} /> Follow-up ready
        </Eyebrow>
        <p className="mt-4 text-[15px] leading-6 text-ink">“Let’s bring procurement in next week.”</p>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-hairline-2 pt-4">
          {['Tue · 10:30', 'Thu · 14:00'].map((slot) => (
            <button
              type="button"
              key={slot}
              onClick={() => {
                setSelected(slot)
                setScheduled(false)
              }}
              className={cn(
                'voice-slot kz-focus-ring',
                selected === slot && 'border-accent-400 bg-accent-100 text-accent-900',
              )}
              aria-pressed={selected === slot}
            >
              <Clock3 size={13} /> {slot}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[12px] text-ink-secondary">
            <UsersRound size={14} /> 3 attendees
          </span>
          <button
            type="button"
            className="voice-button voice-button--primary kz-focus-ring"
            onClick={() => setScheduled(true)}
          >
            {scheduled ? 'Scheduled' : 'Schedule'}
            {scheduled ? <Check size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </VisualFrame>
  )
}

export function DealRisk({ className }: VisualProps) {
  const [opened, setOpened] = useState(false)

  return (
    <VisualFrame className={className} label="Deal risk component">
      <div className="p-5">
        <Eyebrow tone="risk">
          <CircleAlert size={14} /> Deal risk
        </Eyebrow>
        <div className="mt-4 flex items-center gap-3 border-y border-hairline-2 py-4">
          <span className="rounded-tag border border-risk-700 bg-risk-100 px-2 py-1 font-mono text-[10px] text-risk-900">
            Medium
          </span>
          <p className="text-[15px] font-medium text-ink">Legal review has no owner.</p>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ArrowRight className="shrink-0 text-accent-600" size={16} />
          <p className="min-w-0 flex-1 text-[12px] leading-5 text-ink-secondary">
            Assign an owner before the call ends.
          </p>
          <button
            type="button"
            className="voice-button voice-button--outline kz-focus-ring"
            onClick={() => setOpened((value) => !value)}
          >
            {opened ? 'Task open' : 'Open task'}
          </button>
        </div>
      </div>
    </VisualFrame>
  )
}

const SUMMARY_ROWS = [
  { icon: Check, label: 'Decision', value: 'Two-rep pilot approved' },
  { icon: ArrowRight, label: 'Next step', value: 'Send security pack' },
  { icon: UserRound, label: 'Owner', value: 'Amira' },
  { icon: Calendar, label: 'Due', value: 'Friday' },
]

export function PostCallSummary({ className }: VisualProps) {
  const [synced, setSynced] = useState(false)

  return (
    <VisualFrame className={className} label="Post-call summary component">
      <div className="flex items-center gap-2 border-b border-hairline-2 bg-surface-200 px-4 py-3">
        <Sparkles size={14} className="text-accent-600" />
        <Eyebrow>Post-call summary</Eyebrow>
      </div>
      <div className="divide-y divide-hairline-2 px-4">
        {SUMMARY_ROWS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="grid grid-cols-[24px_72px_1fr] items-center gap-2 py-3">
            <span className="flex size-6 items-center justify-center rounded-micro bg-surface-300 text-gray-700">
              <Icon size={12} />
            </span>
            <span className="font-mono font-[550] text-[10px] uppercase tracking-[0.08em] text-ink-secondary">{label}</span>
            <span className="truncate text-[12px] font-medium text-ink">{value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-hairline-2 bg-surface-200 px-4 py-3">
        <Eyebrow tone="live">
          <Dot tone="live" /> {synced ? 'Synced' : 'Ready to sync'}
        </Eyebrow>
        <button
          type="button"
          className="voice-button voice-button--quiet kz-focus-ring"
          onClick={() => setSynced(true)}
          disabled={synced}
        >
          {synced ? <Check size={14} /> : 'Sync'}
        </button>
      </div>
    </VisualFrame>
  )
}

const STAKEHOLDERS = [
  { initials: 'MC', name: 'Maya Chen', role: 'Champion', tone: 'live', position: 'one' },
  { initials: 'AL', name: 'Ava Liu', role: 'Economic buyer', tone: 'accent', position: 'two' },
  { initials: 'JB', name: 'Jon Bell', role: 'Legal · blocker', tone: 'risk', position: 'three' },
  { initials: 'RK', name: 'Rohan Kale', role: 'Security', tone: 'muted', position: 'four' },
] as const

export function StakeholderMap({ className }: VisualProps) {
  const [selected, setSelected] = useState('Maya Chen')

  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Stakeholder relationship map component">
      <div className="voice-deep-header">
        <div>
          <Eyebrow>Buying committee</Eyebrow>
          <p>GreenLeaf · $84k ARR</p>
        </div>
        <Eyebrow tone="signal">4 of 6 mapped</Eyebrow>
      </div>
      <div className="voice-map">
        <svg viewBox="0 0 500 260" aria-hidden="true">
          <path d="M250 130L82 54M250 130L418 54M250 130L82 206M250 130L418 206" />
        </svg>
        <div className="voice-map__account"><span>G</span><strong>GreenLeaf</strong><small>Evaluation</small></div>
        {STAKEHOLDERS.map((person) => (
          <button
            key={person.name}
            type="button"
            className={cn('voice-map__person kz-focus-ring', `is-${person.position}`, selected === person.name && 'is-selected')}
            onClick={() => setSelected(person.name)}
            aria-pressed={selected === person.name}
          >
            <span className="voice-person-avatar">{person.initials}</span>
            <span><strong>{person.name}</strong><small>{person.role}</small></span>
            <Dot tone={person.tone} />
          </button>
        ))}
      </div>
      <div className="voice-deep-footer">
        <Network size={13} /> Selected · {selected}
        <span className="voice-deep-spacer" />
        <button type="button" className="voice-text-action kz-focus-ring">Open record <ExternalLink size={12} /></button>
      </div>
    </VisualFrame>
  )
}

const PLAN_TASKS = [
  ['Discovery complete', 'Both', 'Sep 02'],
  ['Security package', 'Amira', 'Sep 06'],
  ['Legal review', 'Jon', 'Sep 11'],
  ['Pilot kickoff', 'Maya', 'Sep 18'],
]

export function MutualActionPlan({ className }: VisualProps) {
  const [done, setDone] = useState([true, true, false, false])
  const progress = done.filter(Boolean).length * 25

  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Mutual action plan component">
      <div className="voice-deep-header">
        <div><Eyebrow>Mutual action plan</Eyebrow><p>GreenLeaf pilot</p></div>
        <Eyebrow tone="signal">{progress}% complete</Eyebrow>
      </div>
      <div className="voice-plan-progress">
        <span><i style={{ '--plan-progress': progress / 100 } as React.CSSProperties} /></span>
        <b>{done.filter(Boolean).length}/4</b>
      </div>
      <div className="voice-plan-list">
        {PLAN_TASKS.map(([task, owner, date], index) => (
          <button
            key={task}
            type="button"
            className="kz-focus-ring"
            onClick={() => setDone((current) => current.map((value, item) => item === index ? !value : value))}
          >
            <span className={cn('voice-plan-check', done[index] && 'is-done')}>{done[index] && <Check size={11} />}</span>
            <strong>{task}</strong>
            <small>{owner}</small>
            <time>{date}</time>
          </button>
        ))}
      </div>
      <div className="voice-deep-footer"><UsersRound size={13} /> Shared with buyer <span className="voice-deep-spacer" /> Updated now</div>
    </VisualFrame>
  )
}

export function StageRecommendation({ className }: VisualProps) {
  const [approved, setApproved] = useState(false)

  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Explainable stage recommendation component">
      <div className="voice-deep-header">
        <div><Eyebrow tone="accent">New signal</Eyebrow><p>Stage recommendation</p></div>
        <Route size={16} className="text-accent-600" />
      </div>
      <div className="voice-stage-flow">
        <div><span>Current</span><strong>Discovery</strong><small>12 days</small></div>
        <ArrowRight size={18} />
        <div className="is-recommended"><span>Recommended</span><strong>Evaluation</strong><small>84% fit</small></div>
      </div>
      <div className="voice-proof-grid">
        {['Budget confirmed', 'Pilot scope agreed', 'Buyer engaged'].map((proof) => (
          <span key={proof}><Check size={12} />{proof}</span>
        ))}
      </div>
      <div className="voice-deep-footer">
        <BrainCircuit size={13} /> Inferred from this call
        <span className="voice-deep-spacer" />
        <button type="button" className="voice-button voice-button--primary kz-focus-ring" onClick={() => setApproved(true)} disabled={approved}>
          {approved ? <><Check size={13} /> Updated</> : <>Approve <ChevronRight size={13} /></>}
        </button>
      </div>
    </VisualFrame>
  )
}

const WORKFLOW_STEPS = [
  { name: 'Call ended', kind: 'Trigger', icon: Headphones },
  { name: 'Extract MEDDPICC', kind: 'AI agent', icon: BrainCircuit },
  { name: 'Route by risk', kind: 'Branch', icon: GitBranch },
  { name: 'Update CRM', kind: 'Action', icon: Database },
]

export function WorkflowCanvas({ className }: VisualProps) {
  const [running, setRunning] = useState(false)

  return (
    <VisualFrame className={cn('voice-deep-frame voice-workflow-frame', className)} label="Call follow-through workflow canvas component">
      <div className="voice-deep-header">
        <div><Eyebrow>Workflow</Eyebrow><p>Call follow-through</p></div>
        <button type="button" className="voice-button voice-button--primary kz-focus-ring" onClick={() => setRunning((value) => !value)}>
          {running ? <><RefreshCw size={13} /> Running</> : <><Play size={13} /> Test run</>}
        </button>
      </div>
      <div className={cn('voice-workflow-canvas', running && 'is-running')}>
        <svg viewBox="0 0 640 280" aria-hidden="true">
          <path pathLength="1" d="M116 70C180 70 176 140 244 140H320C390 140 382 210 452 210H528" />
        </svg>
        {WORKFLOW_STEPS.map(({ name, kind, icon: Icon }, index) => (
          <div key={name} className={cn('voice-workflow-node', `is-node-${index + 1}`)} style={{ '--node-index': index } as React.CSSProperties}>
            <span><Icon size={15} /></span>
            <div><strong>{name}</strong><small>{kind}</small></div>
            <em>{running ? index < 3 ? <RefreshCw size={11} /> : <Check size={11} /> : String(index + 1).padStart(2, '0')}</em>
          </div>
        ))}
      </div>
      <div className="voice-deep-footer"><Clock3 size={13} /> Last run · 2m ago <span className="voice-deep-spacer" /> Median 1.4s</div>
    </VisualFrame>
  )
}

const RUN_EVENTS = [
  ['Transcript received', '214 KB · 12:42:08'],
  ['Signals extracted', '8 buying signals · 12:42:09'],
  ['Risk classified', 'Medium confidence · 12:42:09'],
  ['Salesforce updated', '4 attributes · 12:42:10'],
]

export function AutomationRun({ className }: VisualProps) {
  const [open, setOpen] = useState(2)

  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Traceable automation run component">
      <div className="voice-deep-header">
        <div><Eyebrow>Run trace</Eyebrow><p>#KZ-2841</p></div>
        <Eyebrow tone="live"><Dot tone="live" /> Completed · 1.8s</Eyebrow>
      </div>
      <div className="voice-run-trace">
        {RUN_EVENTS.map(([title, detail], index) => (
          <button key={title} type="button" className={cn('kz-focus-ring', open === index && 'is-open')} onClick={() => setOpen(open === index ? -1 : index)}>
            <span className="voice-run-marker"><i><Check size={10} /></i></span>
            <span><strong>{title}</strong><small>{detail}</small>{open === index && <em>Input verified · policy matched · no fallback used</em>}</span>
            <ChevronRight size={13} />
          </button>
        ))}
      </div>
      <div className="voice-deep-footer"><ShieldCheck size={13} /> Traceable by default <span className="voice-deep-spacer" /><Code2 size={13} /> View JSON</div>
    </VisualFrame>
  )
}

export function SignalRouting({ className }: VisualProps) {
  const [route, setRoute] = useState('Enterprise')

  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Signal based lead routing component">
      <div className="voice-deep-header"><div><Eyebrow>Signal routing</Eyebrow><p>Preview mode</p></div><GitBranch size={16} /></div>
      <div className="voice-route-source">
        <span>G</span><div><strong>GreenLeaf</strong><small>120 seats · US East · intent 84</small></div>
      </div>
      <div className="voice-route-rule"><b>IF</b><code>seats ≥ 100</code><b>AND</b><code>intent ≥ 70</code></div>
      <div className="voice-route-options">
        {['Enterprise', 'Mid-market'].map((name, index) => (
          <button key={name} type="button" className={cn('kz-focus-ring', route === name && 'is-active')} onClick={() => setRoute(name)} aria-pressed={route === name}>
            <span>{index === 0 ? <BriefcaseBusiness size={15} /> : <UsersRound size={15} />}</span>
            <strong>{name}</strong><small>{index === 0 ? 'Amira · 12 open' : 'Rohan · 8 open'}</small>
            {route === name && <Check size={12} />}
          </button>
        ))}
      </div>
      <div className="voice-deep-footer"><Route size={13} /> Routed to {route} <span className="voice-deep-spacer" /> 0.2s</div>
    </VisualFrame>
  )
}

const ENRICH_SOURCES = [
  { icon: Globe2, source: 'Website', value: 'greenleaf.io', state: 'done', progress: 100 },
  { icon: Database, source: 'Firmographics', value: '240 employees', state: 'done', progress: 100 },
  { icon: UsersRound, source: 'Buying committee', value: '6 people', state: 'active', progress: 72 },
  { icon: Sparkles, source: 'AI summary', value: 'Generating…', state: 'pending', progress: 36 },
]

export function EnrichmentWaterfall({ className }: VisualProps) {
  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Account enrichment waterfall component">
      <div className="voice-deep-header"><div><Eyebrow>Enrichment cascade</Eyebrow><p>GreenLeaf account</p></div><Eyebrow tone="live"><Dot tone="live" /> Running</Eyebrow></div>
      <div className="voice-enrich-head"><span>G</span><div><strong>GreenLeaf</strong><small>Record confidence</small></div><b>72 → 94%</b></div>
      <div className="voice-enrich-list">
        {ENRICH_SOURCES.map(({ icon: Icon, source, value, state, progress }, index) => (
          <div key={source} style={{ '--row-index': index } as React.CSSProperties}>
            <span className={cn('voice-enrich-state', `is-${state}`)}>{state === 'done' ? <Check size={11} /> : <Icon size={13} />}</span>
            <div><strong>{source}</strong><small>{value}</small></div>
            <span className="voice-enrich-bar"><i style={{ '--enrich-progress': progress / 100 } as React.CSSProperties} /></span>
          </div>
        ))}
      </div>
      <div className="voice-deep-footer"><Blocks size={13} /> 4 providers <span className="voice-deep-spacer" /> Waterfall strategy</div>
    </VisualFrame>
  )
}

const WEBHOOK_EVENTS = [
  ['12:42:08', 'call.signal.created', '200', '142 ms'],
  ['12:42:09', 'deal.attribute.updated', '200', '188 ms'],
  ['12:42:10', 'task.created', '200', '96 ms'],
  ['12:42:11', 'summary.completed', '200', '221 ms'],
]

export function EventStream({ className }: VisualProps) {
  const [paused, setPaused] = useState(false)

  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Developer event stream component">
      <div className="voice-deep-header">
        <div><Eyebrow>Developer surface</Eyebrow><p>Event stream</p></div>
        <button type="button" className="voice-button voice-button--quiet kz-focus-ring" onClick={() => setPaused((value) => !value)}>{paused ? 'Resume' : 'Pause'}</button>
      </div>
      <div className={cn('voice-event-terminal', paused && 'is-paused')}>
        <div className="voice-event-terminal__bar"><i /><i /><i /><span>live-events.log</span></div>
        <div className="voice-event-terminal__body">
          {WEBHOOK_EVENTS.map(([time, event, code, latency], index) => (
            <div key={event} style={{ '--event-index': index } as React.CSSProperties}>
              <span>{time}</span><code>{event}</code><b>{code}</b><em>{latency}</em>
            </div>
          ))}
          <p><span>›</span><i /></p>
        </div>
      </div>
      <div className="voice-deep-footer"><Globe2 size={13} /> api.knowzilla.com/v1/events <span className="voice-deep-spacer" /><Dot tone={paused ? 'muted' : 'live'} /></div>
    </VisualFrame>
  )
}

export function ForecastPulse({ className }: VisualProps) {
  const [mode, setMode] = useState('Commit')
  const values = mode === 'Commit' ? [42, 58, 48, 72, 64, 86, 78, 92] : [54, 68, 62, 78, 74, 92, 86, 98]

  return (
    <VisualFrame className={cn('voice-deep-frame voice-chart-frame', className)} label="Revenue forecast pulse component">
      <div className="voice-deep-header">
        <div><Eyebrow>Forecast pulse</Eyebrow><p>Q3 · Enterprise</p></div>
        <div className="voice-segmented">
          {['Commit', 'Best case'].map((item) => <button key={item} type="button" className="kz-focus-ring" aria-pressed={mode === item} onClick={() => setMode(item)}>{item}</button>)}
        </div>
      </div>
      <div className="voice-forecast-total"><div><span>Projected ARR</span><strong>{mode === 'Commit' ? '$1.84m' : '$2.16m'}</strong></div><b><TrendingUp size={13} /> 8.4%</b></div>
      <div className="voice-forecast-chart">
        {values.map((value, index) => <span key={index}><i style={{ '--forecast-height': value / 100, '--bar-index': index } as React.CSSProperties} /><small>W{index + 1}</small></span>)}
        <svg viewBox="0 0 520 150" aria-hidden="true"><path pathLength="1" d="M0 124C72 116 108 126 164 90S260 82 316 58S420 50 520 18" /></svg>
      </div>
      <div className="voice-chart-legend"><span><Dot tone="accent" /> AI projection</span><span><Dot tone="muted" /> Team commit</span><b>+$142k since Monday</b></div>
    </VisualFrame>
  )
}

const FUNNEL_STAGES = [
  ['Discovery', '48 deals', '$2.4m', 100],
  ['Evaluation', '31 deals', '$1.8m', 78],
  ['Procurement', '18 deals', '$1.1m', 54],
  ['Commit', '11 deals', '$720k', 34],
]

export function PipelineFunnel({ className }: VisualProps) {
  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Pipeline conversion funnel component">
      <div className="voice-deep-header"><div><Eyebrow>Pipeline conversion</Eyebrow><p>Enterprise · Q3</p></div><Filter size={16} /></div>
      <div className="voice-funnel">
        {FUNNEL_STAGES.map(([stage, deals, value, width], index) => (
          <div key={stage}>
            <div><strong>{stage}</strong><span>{deals}</span><b>{value}</b></div>
            <span><i style={{ '--funnel-width': Number(width) / 100, '--bar-index': index } as React.CSSProperties} /></span>
            {index < 3 && <em>{[65, 58, 61][index]}%</em>}
          </div>
        ))}
      </div>
      <div className="voice-deep-footer"><TrendingUp size={13} /> Evaluation conversion +6% <span className="voice-deep-spacer" /> vs last quarter</div>
    </VisualFrame>
  )
}

export function ConversationBalance({ className }: VisualProps) {
  const [view, setView] = useState('This call')
  const rep = view === 'This call' ? 42 : 48
  const turns = [18, 34, 12, 42, 24, 56, 16, 38, 28, 48, 20, 32]

  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Conversation balance component">
      <div className="voice-deep-header">
        <div><Eyebrow>Conversation balance</Eyebrow><p>Product demo · 12:42</p></div>
        <div className="voice-segmented">{['This call', 'Team'].map((item) => <button key={item} type="button" className="kz-focus-ring" aria-pressed={view === item} onClick={() => setView(item)}>{item}</button>)}</div>
      </div>
      <div className="voice-ratio">
        <div className="voice-ratio-ring" style={{ '--rep-ratio': `${rep}%` } as React.CSSProperties}><strong>{rep}%</strong><span>rep talk time</span></div>
        <div className="voice-ratio-copy">
          <div><span><Dot tone="accent" /> You</span><b>{view === 'This call' ? '05:18' : '48%'}</b></div>
          <div><span><Dot tone="muted" /> Buyer</span><b>{view === 'This call' ? '07:24' : '52%'}</b></div>
          <p>Healthy range is 35–50% for evaluation calls.</p>
        </div>
      </div>
      <div className="voice-turns" aria-label="Speaking turn timeline">
        {turns.map((height, index) => <i key={index} className={index % 2 ? 'is-buyer' : 'is-rep'} style={{ '--turn-height': `${height}px`, '--turn-index': index } as React.CSSProperties} />)}
      </div>
    </VisualFrame>
  )
}

const QUESTION_TOPICS = [
  ['Security', 18, 'High'],
  ['Implementation', 14, 'High'],
  ['Pricing', 9, 'Medium'],
  ['Integrations', 7, 'Medium'],
  ['Reporting', 4, 'Low'],
]

export function QuestionIntelligence({ className }: VisualProps) {
  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Cross call question intelligence component">
      <div className="voice-deep-header"><div><Eyebrow>Question intelligence</Eyebrow><p>48 questions · 24 calls</p></div><Target size={16} /></div>
      <div className="voice-question-head"><span>Topic</span><span>Frequency</span><span>Intent</span></div>
      <div className="voice-question-list">
        {QUESTION_TOPICS.map(([topic, count, intent], index) => (
          <div key={topic} style={{ '--row-index': index } as React.CSSProperties}>
            <strong>{topic}</strong>
            <span><i style={{ '--question-width': Number(count) / 18 } as React.CSSProperties} /></span>
            <b>{count}</b>
            <em className={`is-${String(intent).toLowerCase()}`}>{intent}</em>
          </div>
        ))}
      </div>
      <div className="voice-insight"><Sparkles size={14} /><p><strong>Security questions rose 38%.</strong> Add the SOC 2 proof point earlier in discovery.</p></div>
    </VisualFrame>
  )
}

const COACHING_REPS = [
  ['AS', 'Amira Shah', 92, '+8'],
  ['RK', 'Rohan Kale', 86, '+3'],
  ['NB', 'Nora Bell', 78, '+11'],
  ['JL', 'Jules Lee', 74, '-2'],
]

export function TeamCoaching({ className }: VisualProps) {
  return (
    <VisualFrame className={cn('voice-deep-frame', className)} label="Team coaching leaderboard component">
      <div className="voice-deep-header"><div><Eyebrow>Coaching room</Eyebrow><p>This week · 42 calls</p></div><UsersRound size={16} /></div>
      <div className="voice-leaderboard">
        {COACHING_REPS.map(([initials, name, score, delta], index) => (
          <div key={name}>
            <span>{index + 1}</span>
            <i>{initials}</i>
            <div><strong>{name}</strong><span><b style={{ '--coach-score': Number(score) / 100, '--row-index': index } as React.CSSProperties} /></span></div>
            <b>{score}</b>
            <em className={String(delta).startsWith('+') ? 'is-up' : 'is-down'}>{delta}</em>
          </div>
        ))}
      </div>
      <div className="voice-coaching-note"><BadgeCheck size={15} /><div><strong>Most improved · Nora Bell</strong><span>Discovery depth +18 after two coaching clips.</span></div><ChevronRight size={14} /></div>
    </VisualFrame>
  )
}

const VISUALS = [
  { n: '01', title: 'Live transcript', text: 'Streams speaker-aware call context while it happens.', category: 'Live call', featured: true, component: <LiveTranscript /> },
  { n: '02', title: 'Objection room', text: 'Turns buyer questions into grounded, sourced answers.', category: 'Live call', component: <ObjectionDetected /> },
  { n: '03', title: 'Next best action', text: 'Prioritizes one useful move from similar winning calls.', category: 'Live call', component: <NextBestAction /> },
  { n: '04', title: 'CRM writeback', text: 'Stages structured field changes before anything is synced.', category: 'Automation', component: <CrmWriteback /> },
  { n: '05', title: 'Buyer intent', text: 'Maps strengthening signals to the moment they appeared.', category: 'Intelligence', featured: true, component: <BuyerIntent /> },
  { n: '06', title: 'Account context', text: 'Surfaces the exact record and source the rep needs now.', category: 'Live call', component: <AccountContext /> },
  { n: '07', title: 'Live coaching', text: 'Measures call quality and offers one specific correction.', category: 'Live call', component: <CallCoaching /> },
  { n: '08', title: 'Follow-up ready', text: 'Converts spoken commitments into the next scheduled step.', category: 'Deal desk', component: <FollowUpReady /> },
  { n: '09', title: 'Deal risk', text: 'Connects missing ownership to historical deal impact.', category: 'Deal desk', component: <DealRisk /> },
  { n: '10', title: 'Post-call summary', text: 'Leaves decisions, owners, due dates, and evidence ready.', category: 'Intelligence', component: <PostCallSummary /> },
  { n: '11', title: 'Stakeholder map', text: 'Makes the buying committee and relationship health visible.', category: 'Deal desk', featured: true, component: <StakeholderMap /> },
  { n: '12', title: 'Mutual action plan', text: 'Keeps buyer and seller milestones in one shared path.', category: 'Deal desk', component: <MutualActionPlan /> },
  { n: '13', title: 'Stage recommendation', text: 'Explains why live evidence supports moving the deal.', category: 'Deal desk', component: <StageRecommendation /> },
  { n: '14', title: 'Workflow canvas', text: 'Connects a call trigger to AI reasoning, branching, and action.', category: 'Automation', featured: true, component: <WorkflowCanvas /> },
  { n: '15', title: 'Run trace', text: 'Exposes every automated read, decision, and write for review.', category: 'Automation', component: <AutomationRun /> },
  { n: '16', title: 'Signal routing', text: 'Routes live account signals through explicit revenue logic.', category: 'Automation', component: <SignalRouting /> },
  { n: '17', title: 'Enrichment cascade', text: 'Shows the provider waterfall improving record confidence.', category: 'Automation', component: <EnrichmentWaterfall /> },
  { n: '18', title: 'Developer event stream', text: 'Gives operators visibility into every emitted webhook.', category: 'Automation', component: <EventStream /> },
  { n: '19', title: 'Forecast pulse', text: 'Compares the team commit with an explainable AI projection.', category: 'Intelligence', featured: true, component: <ForecastPulse /> },
  { n: '20', title: 'Pipeline conversion', text: 'Shows stage value, volume, and conversion without dashboard noise.', category: 'Intelligence', component: <PipelineFunnel /> },
  { n: '21', title: 'Conversation balance', text: 'Benchmarks buyer and rep talk time across speaking turns.', category: 'Intelligence', component: <ConversationBalance /> },
  { n: '22', title: 'Question intelligence', text: 'Connects cross-call topic frequency to purchase intent.', category: 'Intelligence', component: <QuestionIntelligence /> },
  { n: '23', title: 'Team coaching', text: 'Ranks call quality and highlights the next coaching opportunity.', category: 'Intelligence', component: <TeamCoaching /> },
] as const

const CATEGORIES = ['All', 'Live call', 'Deal desk', 'Automation', 'Intelligence'] as const

export default function VoiceVisuals() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.01 })
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All')
  const visibleVisuals = category === 'All'
    ? VISUALS
    : VISUALS.filter((visual) => visual.category === category)
  const Heading = window.location.pathname === '/voice-components' ? 'h1' : 'h2'
  const SpecimenHeading = window.location.pathname === '/voice-components' ? 'h2' : 'h3'

  return (
    <section
      id="voice-visuals"
      ref={ref}
      className={cn('voice-visuals bg-surface-200', inView && 'is-inview')}
    >
      <div className="voice-lab-shell mx-auto max-w-[1200px] px-6 pt-24 pb-24 md:px-10 md:pt-[152px]">
        <div className="voice-lab-intro">
          <div className="max-w-[760px]">
            <span className="inline-flex h-6 items-center rounded-tag bg-surface-100 px-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.4px] text-ink-secondary">
              Knowzilla component lab · v2
            </span>
            <Heading className="mt-5 [text-wrap:balance] font-display text-[40px] font-medium leading-[44px] tracking-[-0.4px]">
              <span className="text-ink">
                The interface between <span className="font-serif font-normal italic text-ink-secondary">conversation</span> and revenue.
              </span>
            </Heading>
            <p className="mt-5 max-w-[620px] text-[15px] font-[450] leading-6 text-ink-secondary">
              Twenty-three reusable product moments for listening, deciding, acting, and learning—operationally deep, visually quiet.
            </p>
          </div>
          <div className="voice-lab-status">
            <div><Dot tone="live" /><span>System live</span><strong>23 components</strong></div>
            <div><Activity size={13} /><span>Median response</span><strong>420 ms</strong></div>
            <div><ShieldCheck size={13} /><span>Writebacks reviewed</span><strong>100%</strong></div>
          </div>
        </div>

        <div className="voice-lab-toolbar">
          <div className="voice-lab-tabs" role="tablist" aria-label="Filter component specimens">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className="kz-focus-ring"
                onClick={() => setCategory(item)}
              >
                {item}
                <span>{item === 'All' ? VISUALS.length : VISUALS.filter((visual) => visual.category === item).length}</span>
              </button>
            ))}
          </div>
          <span className="voice-lab-toolbar__meta"><Blocks size={13} /> Standalone React components</span>
        </div>

        <div className="voice-lab-grid" key={category}>
          {visibleVisuals.map((visual, index) => (
            <article
              key={visual.title}
              className={cn('voice-gallery-item voice-specimen', 'featured' in visual && visual.featured && 'voice-specimen--featured')}
              style={{ '--voice-delay': `${Math.min(index % 4, 3) * 80}ms` } as React.CSSProperties}
            >
              <div className="voice-specimen__caption">
                <span>{visual.n}</span>
                <div className="min-w-0">
                  <SpecimenHeading className="text-[17px] font-medium leading-6 tracking-[-0.17px] text-ink">{visual.title}</SpecimenHeading>
                  <p className="mt-1 text-[13px] leading-5 text-ink-secondary">{visual.text}</p>
                </div>
                <Eyebrow>{visual.category}</Eyebrow>
              </div>
              <div className="voice-specimen__stage">{visual.component}</div>
            </article>
          ))}
        </div>

        <div className="voice-lab-footer">
          <Eyebrow tone="signal">Signal latency 12ms</Eyebrow>
          <Eyebrow>Voice → context → action → record</Eyebrow>
          <span className="ml-auto flex items-center gap-2 text-[12px] text-ink-secondary">
            <Headphones size={14} /> Built for the full revenue motion
          </span>
        </div>
      </div>
    </section>
  )
}
