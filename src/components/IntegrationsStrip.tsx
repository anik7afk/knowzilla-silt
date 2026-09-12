import { type CSSProperties } from 'react'
import { INTEGRATION_MARKS } from './logos'
import { useInView } from '../hooks/useInView'
import './IntegrationsStrip.css'

/*
 * Knowzilla's site has no customer-logo wall (yet) — so instead of inventing
 * one, this strip shows the stack it really plugs into. The marks simply sit
 * there: no marquee, no travelling pulse.
 *
 * MOTION CLASS: QUIET (pacing contract §3, Session 5). The strip's entire
 * motion budget is its entrance — but the entrance is a single travelling
 * HIGHLIGHT rather than seven independent fades: the row sits as a ghost,
 * then one emphasis walks it left to right (560ms beat, 120ms step, so
 * 4–5 marks are always in flight), each mark peaking at full ink before
 * settling to the uniform resting value. See IntegrationsStrip.css for the
 * donor trace behind that resting value. Fired once on viewport entry and
 * latched by useInView (which never reports "left view"); after ~1.28s the
 * strip is completely static, which keeps it out of the way of the frozen
 * KineticConversation it hard-cuts into directly below.
 */
export default function IntegrationsStrip() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    /* TWO-PLANE ROLLOUT (owner, 2026-07-29): the strip is a BAND INSIDE the
       page's white sheet now, not a section with a ground of its own — so the
       `bg-surface-100` came off (it inherits the sheet's surface-100) and the
       join above it drops from hairline-2 to hairline-1. That is the line rule
       the prototype section locked: the EDGE of a sheet takes hairline-2, a rule
       INSIDE a sheet takes the quietest step (PlatformChapters.css §THE LINE
       RULE, where the chapter↔chapter seam does exactly this). White meets white
       across this join now that the hero's own tint is gone, so the rule is the
       only thing marking it — which is why it stays instead of being deleted. */
    <section ref={ref} className="border-t border-hairline-1">
      <div className="w-full px-6 pt-20 pb-0 md:px-10 md:pt-28 md:pb-0">
        <p className="text-center text-[14px] font-medium text-gray-600">
          Plugs into the stack you already run
        </p>

        <div
          className={`stack-row mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:mt-10 md:gap-x-14${
            inView ? ' is-in' : ''
          }`}
        >
          {INTEGRATION_MARKS.map((mark, i) => (
            <span
              key={mark.name}
              className="stack-mark flex items-center gap-2.5 whitespace-nowrap text-[17px] font-[550]"
              style={{ '--i': i } as CSSProperties}
            >
              {mark.mark}
              {mark.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
