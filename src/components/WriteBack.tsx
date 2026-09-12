import { useEffect, useLayoutEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import Window from './mock/Window'
import { playScene, prefersReducedMotion, resolveSceneStatic, type SceneStep } from './mock/typewriter'
import { useInView } from '../hooks/useInView'
import './WriteBack.css'

/* ---------------------------------------------------------------------
 * WriteBack — replaces the decorative TelemetryBand with a real product
 * moment: the call ends, and Knowzilla writes the outcome into HubSpot
 * on its own. Centerpiece is a Window styled as a CRM deal record whose
 * field rows fill themselves in one after another (typewriter engine),
 * each landing a won-700 check tick, before a "synced" chip closes it
 * out. Reuses Window + the typewriter engine verbatim; nothing in
 * mock/* is touched. Below the window, a 3-stat mono row keeps
 * TelemetryBand's rhythm.
 *
 * MOTION CLASS: BEAT (pacing contract §3, Session 5). The record fills
 * itself exactly ONCE, on viewport entry, and latches — no hold, no soft
 * reset, no loop, nothing ambient after the last tick lands. The typing
 * is the section's subject so it stays, but as one condensed pass.
 * ------------------------------------------------------------------- */

// Northwind deal record — buyer account matches Hero's live-call script.
// Call summary runs a little longer than the other fields on purpose
// (~1-4 words elsewhere vs a full clause here), per the brief.
const FIELDS: { label: string; value: string; long?: boolean }[] = [
  { label: 'Stage', value: 'Negotiation' },
  { label: 'Next step', value: 'Send revised MSA' },
  { label: 'Champion', value: 'Dana Whitfield' },
  { label: 'Objection handled', value: 'Data residency (EU)' },
  {
    label: 'Call summary',
    value: 'Walked through EU hosting options — Dana confirmed Q3 budget is approved.',
    long: true,
  },
]

// ~ invented — no real usage data behind these; flagged per design.md
// provenance convention (every non-measured number gets a ~ somewhere).
const STATS = [
  { value: '9', label: 'fields written, this call' }, // ~
  { value: '0', label: 'manual edits required' },
  { value: '4s', label: 'from hang-up to synced record' }, // ~
]

/** A single field row: mono label, typed value, check tick on completion. */
function FieldRow({
  field,
  index,
  valueRefs,
  caretRefs,
  tickRefs,
}: {
  field: (typeof FIELDS)[number]
  index: number
  valueRefs: React.RefObject<Array<HTMLSpanElement | null>>
  caretRefs: React.RefObject<Array<HTMLSpanElement | null>>
  tickRefs: React.RefObject<Array<HTMLSpanElement | null>>
}) {
  const tick = (
    <span
      ref={(el) => {
        tickRefs.current[index] = el
      }}
      className="mock-reveal flex size-4 shrink-0 items-center justify-center rounded-full bg-won-100 text-won-700"
    >
      <Check size={9} strokeWidth={3} />
    </span>
  )

  if (field.long) {
    return (
      <div className="wb-row wb-row--long border-b border-hairline-2 px-5 py-3 last:border-b-0">
        <div className="wb-row__head">
          <span className="font-mono font-[550] text-[11px] tracking-[0.08em] text-ink-secondary uppercase">
            {field.label}
          </span>
          {tick}
        </div>
        <p className="mt-1.5 max-w-[440px] text-[13px] leading-snug text-ink">
          <span
            ref={(el) => {
              valueRefs.current[index] = el
            }}
          />
          <span
            ref={(el) => {
              caretRefs.current[index] = el
            }}
            className="tw-caret"
          />
        </p>
      </div>
    )
  }

  return (
    <div className="wb-row border-b border-hairline-2 px-5 py-3 last:border-b-0">
      <span className="font-mono font-[550] text-[11px] tracking-[0.08em] text-ink-secondary uppercase">
        {field.label}
      </span>
      <span className="min-w-0 truncate text-[13px] text-ink">
        <span
          ref={(el) => {
            valueRefs.current[index] = el
          }}
        />
        <span
          ref={(el) => {
            caretRefs.current[index] = el
          }}
          className="tw-caret"
        />
      </span>
      {tick}
    </div>
  )
}

/**
 * The CRM record scene: window chrome + field rows + a closing sync chip.
 * Paints its resolved (fully written) frame immediately on mount so the
 * window never looks broken while off-screen or under reduced motion,
 * then — only once `inView` flips true, and only if motion is allowed —
 * plays the fill-in pass ONCE via the shared typewriter engine.
 */
function RecordScene({ inView }: { inView: boolean }) {
  const valueRefs = useRef<Array<HTMLSpanElement | null>>([])
  const caretRefs = useRef<Array<HTMLSpanElement | null>>([])
  const tickRefs = useRef<Array<HTMLSpanElement | null>>([])
  const syncChip = useRef<HTMLDivElement>(null)
  const played = useRef(false)

  const buildSteps = (): SceneStep[] => {
    const steps: SceneStep[] = FIELDS.map((_, i) => ({
      kind: 'clear',
      el: () => valueRefs.current[i],
    }))
    // One condensed pass: type, tick, next. Beats are tight enough to read
    // as a single continuous fill rather than five separate events.
    FIELDS.forEach((field, i) => {
      steps.push({
        kind: 'type',
        el: () => valueRefs.current[i],
        caret: () => caretRefs.current[i],
        text: field.value,
      })
      steps.push({ kind: 'pause', ms: 150 })
      steps.push({ kind: 'show', el: () => tickRefs.current[i] })
      steps.push({ kind: 'pause', ms: i === FIELDS.length - 1 ? 300 : 170 })
    })
    steps.push({ kind: 'show', el: syncChip })
    return steps
  }

  // Resolve the static resting frame once, synchronously, before paint —
  // covers reduced-motion permanently and covers "not scrolled to yet".
  useLayoutEffect(() => {
    resolveSceneStatic(buildSteps())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // BEAT: one gesture, once. useInView only ever fires false -> true (see
  // hooks/useInView.ts) and `played` latches on top of that, so the pass
  // cannot be restarted by a re-render, a StrictMode double-invoke, or a
  // scroll back through the section. `loop: false` means the engine plays
  // the script and stops — no hold, no soft reset, no fade root.
  useEffect(() => {
    if (!inView || played.current || prefersReducedMotion()) return
    played.current = true
    const scene = playScene(buildSteps(), { loop: false })
    return () => {
      // Only reached on unmount (inView never flips back to false). Clearing
      // the latch here keeps StrictMode's mount/unmount/remount honest without
      // ever letting a live section replay itself.
      scene.stop()
      played.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return (
    <Window
      title="HubSpot — Northwind · deal record"
      meta={
        <span className="font-mono font-[550] text-[10px] tracking-[0.08em] text-gray-500 uppercase">
          call ended 14:31 · synced 14:31
        </span>
      }
    >
      {/* No `.mock-fade-root` here: BEAT never soft-resets, so there is
          nothing to fade out. */}
      <div>
        {FIELDS.map((field, i) => (
          <FieldRow
            key={field.label}
            field={field}
            index={i}
            valueRefs={valueRefs}
            caretRefs={caretRefs}
            tickRefs={tickRefs}
          />
        ))}
        <div ref={syncChip} className="mock-reveal flex items-center gap-2 px-5 py-3">
          <span className="flex size-4 items-center justify-center rounded-full bg-won-100 text-won-700">
            <Check size={9} strokeWidth={3} />
          </span>
          {/* telemetry readout inside the product window (where colour may
              carry data). 10px — signal-700 for contrast; the won-100/700
              check beside it keeps the success semantic. */}
          <span className="font-mono font-[550] text-[10px] tracking-[0.08em] text-signal-700 uppercase">
            synced · hubspot · auto
          </span>
        </div>
      </div>
    </Window>
  )
}

export default function WriteBack() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section ref={ref} className="border-t border-hairline-2 bg-surface-100">
      <div className="mx-auto max-w-[860px] px-6 pt-24 pb-16 md:px-10 md:pt-[152px] md:pb-[96px]">
        <div className="mx-auto max-w-[680px] text-center">
          <h2 className="font-display text-[40px] leading-[44px] font-medium tracking-[-0.4px] [text-wrap:balance]">
            <span className="text-ink">Your CRM updates itself. </span>
            <span className="text-ink-secondary">Before you're back at your desk.</span>
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-[640px] md:mt-14">
          <RecordScene inView={inView} />
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-display text-[32px] leading-9 font-medium tracking-[-0.32px] text-ink">
                {s.value}
              </div>
              <p className="mt-2 max-w-[240px] text-[14px] leading-5 font-[450] tracking-[-0.14px] text-gray-700">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
