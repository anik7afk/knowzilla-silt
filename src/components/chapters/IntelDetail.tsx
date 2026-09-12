import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  Check,
  Circle,
  Database,
  FileText,
  Flag,
  Gem,
  Heart,
  ListChecks,
  Mail,
  Megaphone,
  MessageSquare,
  PhoneOff,
  Plus,
} from 'lucide-react'
import { Plate } from './ChapterMock'
import type { MockProps } from './ChapterMock'
import { useInView } from '../../hooks/useInView'
import './IntelDetail.css'

/* Chapter 04 — Deal intelligence. "Every call becomes intel."
 *
 * REVISION 4 (2026-07-27, session 12 owner pivot): the showcase is the v2
 * WORKFLOW CANVAS — the "[05] After the call" band the owner picked as the
 * benchmark — ported per design-assets/v2-measure/v2-physicality-measure.md
 * §6 (v2 PostCall.tsx + canvas.tsx). The deal-room dossier + session-card
 * composition it replaces is recoverable from git.
 *
 * WHAT IS PORTED (v2 verbatim unless noted):
 *   · 720×584 authored coordinate space, scaled uniformly to the container
 *     width (transform: scale, origin top-left) — nodes positioned by % with
 *     centre translate. Node centres/widths, port positions, branch-label
 *     positions all v2's numbers.
 *   · dot-grid bed: 10×10px, 1px dot at 4.5/4.5, opacity 0.7 (v2 ink-300
 *     #b4b6bb → our gray-500 #afafaf, the luminance match).
 *   · connectors: one SVG viewBox 0 0 720 584, pathLength=1 dash-draw
 *     (stroke-dashoffset 1→0, cubic-bezier(0.5,0,0.3,1)), 5-unit Q elbows,
 *     separate arrowhead paths fading in at delay+dur−0.15s.
 *   · the full one-shot timeline (~3.25s), IO-triggered once at 0.35:
 *     0.05 trigger rises · 0.35 "Triggered" pill pops (scale 0.85→1,
 *     cb(0.34,1.4,0.64,1)) · 0.50–1.15 edge 1 draws · 0.95 notes rises ·
 *     1.30 "Completed" · 1.45/1.55 branch edges · 1.85/1.95 follow-up/CRM
 *     rise · 1.90/2.00 branch labels · 2.25/2.35 "Completed"/"Synced" ·
 *     2.50 grey stubs · 2.60 ghost fades to 0.45 · 2.75 "+" appears.
 *   · NodeCards: 12px radius, 14×12 pad, corner Trigger tab, icon tile +
 *     title + type pill, divider + sub; ghost at opacity 0.45, no shadow.
 *   · status pills straddling -top-12/right-8; branch-label pills; the "+"
 *     disc with the double halo; the "Coaching triggers · this week"
 *     FocusStack rail (2400ms roving focus, skipped under reduced motion);
 *     the left copy column; the ≤900px vertical-timeline variant (spine at
 *     x=38, ports at 15px, stagger i×0.18s, pills +0.3s, ghost + "+"
 *     dropped); the reduced-motion clamp.
 *
 * DELIBERATE TRANSLATIONS (all flagged for the checkpoint):
 *   · GREENS — owner directive (supersedes the "keep v2's #4ca368 family"
 *     brief): the executed path rides the ATTIO green grammar on our owned
 *     won ramp — won-100 fills, won-200 borders (#CBF7E1, Attio green-200
 *     exact), won-900 text, won-700 for saturated strokes/ports/arrows.
 *     v2's #4ca368/#8fcda4/#1d7f3c/#effaf1/#c4e6cd are NOT ported.
 *   · the "+" disc: v2 brand-400 → our signal-500, halos signal-600 at
 *     v2's exact alphas (.08/.04) — the sanctioned brand-blue → signal
 *     translation, judgment call flagged.
 *   · icon tiles: v2's amber/violet tiles are unowned ramps here — mapped
 *     to owned ones (notes→accent, trigger/mail→signal, CRM→won,
 *     ghost→gray). 24px tiles, radius 6, 13px icons @1.75 (v2 anatomy).
 *   · rail header set in the house label face (Inter 600 / 1.2px tracking /
 *     tabular-nums) — v2's 10px mono is retired here.
 *   · rail items: v2's five coaching categories → the product's five rubric
 *     axes (Clarity/Empathy/Engagement/Relevance/Professionalism —
 *     PRODUCT-NOTES §3.4, the page's established coaching vocabulary).
 *     Counts keep v2's design values ×1/×9/×4/×2 (+×3 for the fifth),
 *     weighted to the axes' established scores (Empathy 5 → ×9). Flagged.
 *
 * CONTENT: everything on the canvas is established page fiction — the
 * after-call flow (call ends → meeting notes → follow-up → CRM update →
 * coaching trigger) is v2's own run and the page's WriteBack story;
 * "HubSpot" is the page's standing CRM (WriteBack.tsx:185). No new
 * companies, people or numbers. */

/* ── coordinate space (v2 verbatim) ─────────────────────────────────── */

const W = 720
const H = 584
const pos = (x: number, y: number): CSSProperties => ({
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
})

/* ── local diagram kit (port of v2 canvas.tsx, restyled to owned ramps) ── */

function StatusPill({
  children,
  show,
  delay = 0,
  still,
}: {
  children: ReactNode
  show: boolean
  delay?: number
  still: boolean
}) {
  return (
    <span
      className="pc4-pill"
      style={
        still
          ? undefined
          : {
              opacity: show ? 1 : 0,
              transform: show ? 'scale(1)' : 'scale(0.85)',
              transition: `opacity 0.3s ease ${delay}s, transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1) ${delay}s`,
            }
      }
    >
      <Check size={11} strokeWidth={2.5} />
      {children}
    </span>
  )
}

function Port({ active = false, style }: { active?: boolean; style?: CSSProperties }) {
  return <span aria-hidden className={`pc4-port${active ? ' is-active' : ''}`} style={style} />
}

function NodeCard({
  tab,
  icon,
  tile = 'gray',
  title,
  pill,
  sub,
  active = false,
  ghost = false,
  show,
  delay = 0,
  still,
}: {
  tab?: ReactNode
  icon?: ReactNode
  tile?: 'signal' | 'accent' | 'won' | 'gray'
  title: string
  pill?: string
  sub?: string
  active?: boolean
  ghost?: boolean
  show: boolean
  delay?: number
  still: boolean
}) {
  return (
    <div
      className={`pc4-node${active ? ' is-active' : ''}${ghost ? ' is-ghost' : ''}`}
      style={
        still
          ? undefined
          : {
              opacity: show ? (ghost ? 0.45 : 1) : 0,
              transform: show ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
            }
      }
    >
      {tab && <span className="pc4-tab">{tab}</span>}
      <div className="pc4-node__head">
        {icon && <span className={`pc4-tile pc4-tile--${tile}`}>{icon}</span>}
        <span className="pc4-node__title">{title}</span>
        {pill && <span className="pc4-node__pill">{pill}</span>}
      </div>
      {sub && (
        <>
          <div className="pc4-node__rule" />
          <p className="pc4-node__sub">{sub}</p>
        </>
      )}
    </div>
  )
}

/** A path that draws itself in (stroke-dashoffset 1→0) with an optional
 *  arrowhead fading in as the line arrives — v2 DrawnPath, verbatim. */
function DrawnPath({
  d,
  show,
  delay = 0,
  duration = 0.6,
  active = false,
  still,
  arrow,
}: {
  d: string
  show: boolean
  delay?: number
  duration?: number
  /** executed path (won-700 stroke) vs grey stub (gray-400) */
  active?: boolean
  still: boolean
  arrow?: { x: number; y: number; angle: number }
}) {
  const drawn = still || show
  return (
    <g className={active ? 'pc4-edge--won' : 'pc4-edge--gray'}>
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeDasharray="1"
        strokeDashoffset={drawn ? 0 : 1}
        style={
          still
            ? undefined
            : { transition: `stroke-dashoffset ${duration}s cubic-bezier(0.5, 0, 0.3, 1) ${delay}s` }
        }
      />
      {arrow && (
        <path
          d="M -4.5 -3.2 L 0.5 0 L -4.5 3.2"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`}
          style={
            still
              ? undefined
              : { opacity: drawn ? 1 : 0, transition: `opacity 0.25s ease ${delay + duration - 0.15}s` }
          }
        />
      )}
    </g>
  )
}

function BranchLabel({
  children,
  show,
  delay = 0,
  still,
  style,
}: {
  children: ReactNode
  show: boolean
  delay?: number
  still: boolean
  style?: CSSProperties
}) {
  return (
    <span
      className="pc4-branch"
      style={{
        ...style,
        ...(still
          ? undefined
          : { opacity: show ? 1 : 0, transition: `opacity 0.4s ease ${delay}s` }),
      }}
    >
      {children}
    </span>
  )
}

/* ── fluid scale: authored 720px, scaled to the measured column width ──── */

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, width }
}

/* ── the desktop canvas: v2's exact run ─────────────────────────────── */

function DesktopCanvas({ still }: { still: boolean }) {
  /* the brief's own trigger: IO once at 0.35, latched (useInView disconnects) */
  const { ref: ioRef, inView } = useInView<HTMLDivElement>({ threshold: 0.35 })
  const { ref: sizeRef, width } = useElementWidth<HTMLDivElement>()
  const show = inView

  return (
    <div
      className="pc4-canvas"
      ref={(el) => {
        ioRef.current = el
        sizeRef.current = el
      }}
    >
      <div
        className="pc4-space"
        style={{ width: W, height: H, transform: `scale(${width ? width / W : 1})` }}
      >
        <span className="pc4-dots" aria-hidden="true" />

        {/* connectors — drawn in execution order (v2 path data verbatim) */}
        <svg viewBox={`0 0 ${W} ${H}`} fill="none" className="pc4-svg" aria-hidden>
          <DrawnPath
            d="M 185 132 V 168 Q 185 173 190 173 H 355 Q 360 173 360 178 V 202"
            show={show}
            delay={0.5}
            duration={0.65}
            active
            still={still}
            arrow={{ x: 360, y: 202, angle: 90 }}
          />
          <DrawnPath
            d="M 360 286 V 315 Q 360 320 355 320 H 185 Q 180 320 180 325 V 356"
            show={show}
            delay={1.45}
            duration={0.6}
            active
            still={still}
            arrow={{ x: 180, y: 356, angle: 90 }}
          />
          <DrawnPath
            d="M 360 286 V 315 Q 360 320 365 320 H 535 Q 540 320 540 325 V 356"
            show={show}
            delay={1.55}
            duration={0.6}
            active
            still={still}
            arrow={{ x: 540, y: 356, angle: 90 }}
          />
          {/* branch not always taken: coaching trigger */}
          <DrawnPath d="M 540 444 V 482" show={show} delay={2.5} duration={0.35} still={still} />
          {/* extension stub to the + */}
          <DrawnPath d="M 180 444 V 472" show={show} delay={2.5} duration={0.35} still={still} />
        </svg>

        {/* ports at every junction */}
        <Port active style={pos(185, 132)} />
        <Port active style={pos(360, 286)} />
        <Port style={pos(180, 444)} />
        <Port style={pos(540, 444)} />

        {/* branch labels */}
        <BranchLabel show={show} delay={1.9} still={still} style={pos(272, 320)}>
          Follow-up
        </BranchLabel>
        <BranchLabel show={show} delay={2.0} still={still} style={pos(452, 320)}>
          CRM sync
        </BranchLabel>

        {/* trigger */}
        <div className="pc4-at pc4-w246" style={pos(185, 92)}>
          <NodeCard
            tab={
              <>
                <Circle size={9} strokeWidth={2.5} />
                Trigger
              </>
            }
            icon={<PhoneOff size={13} strokeWidth={1.75} />}
            tile="signal"
            title="When call ends"
            pill="Session"
            sub="Runs after every session"
            active
            show={show}
            delay={0.05}
            still={still}
          />
          <span className="pc4-pillslot">
            <StatusPill show={show} delay={0.35} still={still}>
              Triggered
            </StatusPill>
          </span>
        </div>

        {/* meeting notes */}
        <div className="pc4-at pc4-w246" style={pos(360, 246)}>
          <NodeCard
            icon={<FileText size={13} strokeWidth={1.75} />}
            tile="accent"
            title="Draft meeting notes"
            pill="Notes"
            sub="Key points, decisions, actions"
            active
            show={show}
            delay={0.95}
            still={still}
          />
          <span className="pc4-pillslot">
            <StatusPill show={show} delay={1.3} still={still}>
              Completed
            </StatusPill>
          </span>
        </div>

        {/* follow-up email */}
        <div className="pc4-at pc4-w240" style={pos(180, 404)}>
          <NodeCard
            icon={<Mail size={13} strokeWidth={1.75} />}
            tile="signal"
            title="Draft follow-up"
            pill="Email"
            sub="Recap draft, ready to send"
            active
            show={show}
            delay={1.85}
            still={still}
          />
          <span className="pc4-pillslot">
            <StatusPill show={show} delay={2.25} still={still}>
              Completed
            </StatusPill>
          </span>
        </div>

        {/* CRM writeback — HubSpot is the page's standing CRM (WriteBack) */}
        <div className="pc4-at pc4-w240" style={pos(540, 404)}>
          <NodeCard
            icon={<Database size={13} strokeWidth={1.75} />}
            tile="won"
            title="Update CRM"
            pill="HubSpot"
            sub="Pain points · goals · blockers"
            active
            show={show}
            delay={1.95}
            still={still}
          />
          <span className="pc4-pillslot">
            <StatusPill show={show} delay={2.35} still={still}>
              Synced
            </StatusPill>
          </span>
        </div>

        {/* conditional coaching flag — the branch not taken this run */}
        <div className="pc4-at pc4-w240" style={pos(540, 524)}>
          <NodeCard
            icon={<Flag size={13} strokeWidth={1.75} />}
            title="Coaching trigger"
            pill="Manager"
            sub="When a moment needs review"
            ghost
            show={show}
            delay={2.6}
            still={still}
          />
        </div>

        {/* extend the playbook — v2 brand-400 disc → owned signal (flagged) */}
        <span
          className="pc4-plus"
          style={{
            ...pos(180, 494),
            ...(still ? undefined : { opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 2.75s' }),
          }}
        >
          <Plus size={16} strokeWidth={2} />
        </span>
      </div>
    </div>
  )
}

/* ── mobile: the same run as a vertical timeline (v2 verbatim) ──────── */

const STEPS = [
  { icon: PhoneOff, tile: 'signal', title: 'When call ends', pill: 'Session', sub: 'Runs after every session', status: 'Triggered' },
  { icon: FileText, tile: 'accent', title: 'Draft meeting notes', pill: 'Notes', sub: 'Key points, decisions, actions', status: 'Completed' },
  { icon: Mail, tile: 'signal', title: 'Draft follow-up', pill: 'Email', sub: 'Recap draft, ready to send', status: 'Completed' },
  { icon: Database, tile: 'won', title: 'Update CRM', pill: 'HubSpot', sub: 'Pain points · goals · blockers', status: 'Synced' },
] as const

function MobileCanvas({ still }: { still: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })
  return (
    <div ref={ref} className="pc4-mobile">
      <span className="pc4-dots" aria-hidden="true" />
      <span className="pc4-spine" aria-hidden="true" />
      {STEPS.map((s, i) => {
        const Icon = s.icon
        return (
          <div key={s.title} className="pc4-step">
            <Port active style={{ left: 15, top: '50%' }} />
            <NodeCard
              icon={<Icon size={13} strokeWidth={1.75} />}
              tile={s.tile}
              title={s.title}
              pill={s.pill}
              sub={s.sub}
              active
              show={inView}
              delay={i * 0.18}
              still={still}
            />
            <span className="pc4-pillslot pc4-pillslot--step">
              <StatusPill show={inView} delay={i * 0.18 + 0.3} still={still}>
                {s.status}
              </StatusPill>
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── the coaching-triggers rail: v2 FocusStack, restyled ────────────── */

/* v2's five coaching categories → the product's five rubric axes (the page's
 * established coaching vocabulary, PRODUCT-NOTES §3.4). Counts weighted to
 * the axes' established scores — Empathy (5, the weak axis) carries the ×9.
 * Tints are owned ramps only. */
const TRIGGER_ITEMS = [
  { icon: Megaphone, tint: 'won', label: 'Clarity', meta: '×1' },
  { icon: Heart, tint: 'risk', label: 'Empathy', meta: '×9' },
  { icon: MessageSquare, tint: 'accent', label: 'Engagement', meta: '×4' },
  { icon: ListChecks, tint: 'signal', label: 'Relevance', meta: '×2' },
  { icon: Gem, tint: 'gray', label: 'Professionalism', meta: '×3' },
] as const

function FocusStack({ show, still }: { show: boolean; still: boolean }) {
  const [focus, setFocus] = useState(Math.floor(TRIGGER_ITEMS.length / 2))

  useEffect(() => {
    if (!show || still) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setFocus((f) => (f + 1) % TRIGGER_ITEMS.length), 1600)
    return () => clearInterval(t)
  }, [show, still])

  return (
    <div className="pc4-stack">
      {TRIGGER_ITEMS.map((item, i) => {
        const Icon = item.icon
        const d = Math.min(Math.abs(i - focus), 3)
        const opacity = still || show ? [1, 0.52, 0.3, 0.2][d] : 0
        return (
          <div
            key={item.label}
            className={`pc4-chip${d === 0 ? ' is-focus' : ''}`}
            style={{
              opacity,
              transform: `scale(${d === 0 ? 1.07 : 1})`,
              ...(still
                ? undefined
                : {
                    transition: 'opacity 500ms cubic-bezier(0, 0, 0, 1), transform 450ms cubic-bezier(0.33, 1, 0.68, 1), box-shadow 500ms cubic-bezier(0, 0, 0, 1), border-color 500ms cubic-bezier(0, 0, 0, 1), color 500ms cubic-bezier(0, 0, 0, 1)',
                  }),
            }}
          >
            <span className={`pc4-tile pc4-tile--sm pc4-tile--${item.tint}`}>
              <Icon size={12} strokeWidth={1.75} />
            </span>
            <span className="pc4-chip__label">{item.label}</span>
            <span className="pc4-chip__meta">{item.meta}</span>
          </div>
        )
      })}
    </div>
  )
}

function TriggerRail({ still }: { still: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  return (
    <div ref={ref} className="pc4-rail">
      {/* house label face — v2's 10px mono header, mono retired */}
      <p className="pc4-rail__head">Coaching triggers · this week</p>
      <FocusStack show={inView} still={still} />
      <p className="pc4-rail__foot">
        Moments worth a manager's attention, flagged automatically across every rep.
      </p>
    </div>
  )
}

/* ── the chapter band: copy column | canvas | trigger rail ──────────── */

export default function IntelDetail({ beat, still }: MockProps) {
  return (
    <Plate
      flow
      enter={beat(0, 'fade', 340)}
      label="The after-call workflow, drawn as a run of the real pipeline: when a call ends, Knowzilla drafts the meeting notes, branches into the follow-up email and the HubSpot write-back, and flags coaching triggers — each node card lighting up green in execution order on a dotted canvas, beside a rail of the five coaching axes a manager watches this week."
    >
      <div className="pc4-band">
        {/* copy column — v2 PostCall's copy, laid as a full-width strip:
            our band is 860px against v2's 1152, and keeping v2's tri-column
            would have starved the canvas to a 0.54 scale (v2 runs ~0.9).
            The strip buys the canvas back to ~0.87. Measured deviation,
            flagged for the checkpoint. */}
        <div className={`pc4-copy ${beat(120, 'soft', 500).className}`} style={beat(120, 'soft', 500).style}>
          <h4 className="pc4-copy__h">The call ends. The follow-through is already done.</h4>
          <div className="pc4-copy__side">
            <p className="pc4-copy__p">
              Meeting notes, a personalised follow-up draft and structured CRM updates land in your
              stack before the tab is closed — and the moments a manager should hear get flagged on
              their own.
            </p>
            <a className="pc4-copy__link kz-focus-ring" href="#live-navigation">
              See live navigation
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        <div className="pc4-lower">
          {/* the canvas */}
          <div className="pc4-mid">
            <DesktopCanvas still={still} />
            <MobileCanvas still={still} />
          </div>

          <TriggerRail still={still} />
        </div>
      </div>
    </Plate>
  )
}
