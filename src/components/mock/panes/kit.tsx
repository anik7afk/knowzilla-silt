import type { ReactNode } from 'react'

/* Shared in-frame furniture. Lifted out of AppFrame.tsx unchanged when the
 * product stage grew from three surfaces to five, so every pane keeps the
 * same header rhythm and the same panel-label voice. */

/** A surface's own header: title + one-line note, optional right-aligned action. */
export function PaneHead({
  title,
  note,
  action,
}: {
  title: string
  note: string
  action?: ReactNode
}) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline-2 px-6 py-4 lg:px-8 lg:py-5">
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-[550] tracking-[-0.01em] text-ink">{title}</h3>
        <p className="mt-0.5 truncate text-[12px] text-gray-600">{note}</p>
      </div>
      {action}
    </div>
  )
}

/** In-frame panel label — the product's own uppercase panel names. */
export function PanelLabel({
  children,
  accent = false,
}: {
  children: ReactNode
  accent?: boolean
}) {
  return (
    <span
      className={`font-mono font-[550] text-[10px] tracking-[0.12em] uppercase ${
        accent ? 'text-accent-600' : 'text-gray-600'
      }`}
    >
      {children}
    </span>
  )
}

/** Breakpoint a secondary row first appears at — smaller frames drop the
 *  tail of every list rather than clipping it. */
export const showFrom = (from?: 'sm' | 'lg') =>
  from === 'lg' ? 'hidden lg:flex' : from === 'sm' ? 'hidden sm:flex' : 'flex'
