import { useId } from 'react'
import type { CSSProperties } from 'react'

/* ---------------------------------------------------------------------
 * craft — shared drafting-table ornaments (ported from v2's framing kit).
 * DotGrid: faint dot field that fades out through its own radial mask, so
 * it never meets neighbouring surfaces with a hard edge. RegisterMark:
 * print-style (+) corner tick. Both are aria-hidden decoration.
 * ------------------------------------------------------------------- */

const FADE_MASK = 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)'

export function DotGrid({
  className = 'text-gray-400',
  pitch = 16,
  radius = 1,
  dotOpacity = 0.5,
  mask = FADE_MASK,
  style,
}: {
  className?: string
  pitch?: number
  radius?: number
  dotOpacity?: number
  /** CSS mask-image; pass `undefined` default for a centred fade, or `'none'` to clip hard. */
  mask?: string
  style?: CSSProperties
}) {
  const id = useId()
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{
        ...(mask !== 'none' ? { maskImage: mask, WebkitMaskImage: mask } : undefined),
        ...style,
      }}
    >
      <defs>
        <pattern id={id} width={pitch} height={pitch} patternUnits="userSpaceOnUse">
          <circle cx={radius} cy={radius} r={radius} fill="currentColor" fillOpacity={dotOpacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export function RegisterMark({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden width="11" height="11" viewBox="0 0 12 12" className={`text-gray-400 ${className}`}>
      <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
