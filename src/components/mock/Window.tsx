import type { ReactNode } from 'react'
import './mock.css'

/* =====================================================================
 * Window — reusable product-window chrome for the mock scenes.
 *
 * Renders a titled frame: traffic-light dots, a title, an optional
 * right-aligned meta slot (e.g. a REC badge + timestamp), a hairline
 * border, radius-card corners, surface-100 body and the product-frame
 * `shadow-frame` exception. Everything passed as `children` renders below
 * the title bar untouched — the scene owns the body.
 *
 * Reused by later slices, so the API is deliberately tiny:
 *   title     — left title text/node in the title bar
 *   meta      — optional node pinned to the bar's right edge
 *   children  — the window body
 *   className — extra classes on the outer frame (positioning, width)
 *
 * The traffic-light dots are pure window ornament. Two of the three still
 * borrow the risk/won status hues (the approved v2→v5 remap); the middle
 * one used the ramp retired on 2026-07-27, and it is NEUTRAL now rather
 * than signal blue — a decorative light is not telemetry, and spending the
 * new live colour on chrome would devalue it. gray-500 is the luminance
 * match for the step it replaces (~0.43 vs ~0.48), so the triad keeps its
 * weight instead of reading as one dead light.
 *
 * `WindowBar` is the title bar on its own, exported 2026-07-27 so a frame
 * that owns its own body geometry can wear the SAME chrome instead of a
 * near-copy. PlatformChapters' plate is the first such caller: its body is
 * a positioned stage, so it cannot be `Window`'s children, but every pixel
 * of the bar — dot size, dot tones, gaps, padding, hairline, title size /
 * weight / colour — comes from here and can never drift.
 * ===================================================================== */

/* `chrome="v2"` (2026-07-27, session 12 owner pivot): the PlatformChapters
 * windows upgrade to v2's measured physicality (v2-physicality-measure.md §4)
 * while the hero AppFrame and WriteBack keep the house bar untouched. The v2
 * deltas the variant carries:
 *   · titlebar ground mist@60% — v2 paints #f7f8f9 at 60% over the white
 *     body; ours is surface-200/60 (the established remap).
 *   · all three traffic lights at /70 (house bar runs the middle at /80).
 *     v2's triad is red/AMBER/green; we hold the house risk/gray/won tones —
 *     an amber would be a new unowned ramp. Flagged for the checkpoint.
 * Everything else (12px dots, 6px gap, 16×12 pad, 13px/550 title, hairline)
 * already matches v2's measured values in both variants. */
export function WindowBar({
  title,
  meta,
  chrome = 'house',
}: {
  title: ReactNode
  meta?: ReactNode
  chrome?: 'house' | 'v2'
}) {
  const v2 = chrome === 'v2'
  return (
    <div
      className={`flex items-center gap-3 border-b border-hairline-2 px-4 py-3 ${
        v2 ? 'bg-surface-200/60' : 'bg-surface-200'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="size-3 rounded-full bg-risk-700/70" />
        <span className={`size-3 rounded-full ${v2 ? 'bg-gray-500/70' : 'bg-gray-500/80'}`} />
        <span className="size-3 rounded-full bg-won-700/70" />
      </div>
      <span className="ml-1 truncate text-[13px] font-[550] text-gray-800">{title}</span>
      {meta && <span className="ml-auto flex items-center">{meta}</span>}
    </div>
  )
}

export default function Window({
  title,
  meta,
  children,
  className = '',
}: {
  title: ReactNode
  meta?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-card border border-hairline-2 bg-surface-100 shadow-frame ${className}`}
    >
      <WindowBar title={title} meta={meta} />
      {children}
    </div>
  )
}
