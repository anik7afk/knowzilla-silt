/* ---------------------------------------------------------------------------
 * Lizzie — the Knowzilla mascot.
 *
 * PROVENANCE. The character is the OWNER'S OWN ARTWORK. Six drawings, kept in
 * `design-assets/refs/session12/mascot/owner-poses/` plus `mascot-canonical.png`.
 * They are the sole source of truth and are never redrawn.
 *
 * Session 12 spent five generation rounds (6, 7, 8, 9, 10) trying to have a
 * model produce these poses. Rounds 6 and 7 silently deleted the fur, which IS
 * the character, and were rejected outright — they are quarantined under
 * `.../mascot/rejected/`. Rounds 8–10 got progressively closer but never
 * matched the owner's linework: paler spines, thinner ink, finer and less
 * deliberate fur tufts. The lesson worth keeping: an image generator cannot
 * EDIT a drawing, only redraw it, so every round is a fresh chance to drift.
 * Owner's call, 2026-07-27, and it is final: **use the owner's own drawings.**
 * The one exception is the favicon — see below.
 *
 * WHY RASTER ON AN OTHERWISE VECTOR PAGE. The art was also traced to SVG
 * (potrace, colour-separated — `.../mascot/trace.py`) and the trace is
 * technically good: fur silhouette intact, per-spine separation, labelled
 * parts. Rejected anyway, for a reason that generalises — the fur is thousands
 * of anti-aliased spikes and a tracer must DECIDE where each hair's edge falls.
 * Every decision is a small departure from the drawing. PNG decides nothing.
 * Owner: "i dont want the mascot to lose its vibe".
 *
 * RESOLUTION. Every placement is a fixed size, so each asset is exported at
 * exactly 1x/2x/3x of its display size and scaled DOWN, never up — enlarging
 * softens the art. Sizing was checked against the source: the sitting pose is
 * 1059px tall, which supports up to ~353px on screen at 3x. Nothing here is
 * near that ceiling. Re-export with `.../mascot/export.py`.
 *
 * BACKGROUND REMOVAL. The owner's files sit on a near-white ground and the
 * body is ALSO white, so a luminance key would erase the mascot and leave the
 * outline. Instead the exporter flood-fills inward from the four corners: only
 * background CONNECTED to the frame edge is removed, and the dark ink contour
 * is a closed wall that stops the fill. Verified leak-free on all six drawings.
 * A faint grey fringe survives on anti-aliased edges; it is invisible against
 * white / surface-100 / surface-300, which is every ground we place on. It
 * would show on the hero's lavender bed — do not place Lizzie there without
 * stripping it first.
 *
 * PEEK. The owner's peek drawing has a horizontal rule drawn INTO the artwork
 * (measured at row 549, running 76% of the width). It is cropped out at export
 * time, because the real page supplies that edge itself — it is the footer
 * wordmark, painted in front of the character. Occlusion is the whole idea; a
 * character cropped by a straight line near some type reads as a sticker.
 *
 * FAVICON. The one asset NOT from the owner's hand. A head crop of a detailed
 * drawing turns to mush at 16px, so the tab mark is round 10's purpose-built
 * simplification — fewer, larger spines, thicker outline — regenerated to the
 * owner's measured palette (spine RGB(160,184,248) @ 35% saturation; round 9's
 * was RGB(111,131,231) @ 52% and read as a different creature).
 * ------------------------------------------------------------------------- */

/** Design size in px (height) for each placement. */
const SIZES = {
  /** Closing CTA — leaning on the "d" of "Sales, navigated". */
  lean: 150,
  /** Product sidebar — on the utility divider above FAQ. */
  sitting: 64,
  /** Footer — head and paws over the wordmark. */
  peek: 96,
  /** Hero — peeking over the product window's top chrome (owner pick,
   *  2026-07-29, reviving r5-07 after rejecting all round-11/12 redraws).
   *  Same drawing as `peek` but defringed (`keyed/owner-peek-hero.png`):
   *  the flood-fill's grey AA ring is invisible on white but WOULD show on
   *  the hero's lavender bed — see BACKGROUND REMOVAL above. WIDTH-driven
   *  in situ (12.62% of the frame width, measured from r5-07); 75 is the
   *  design height at the 1120px desktop frame. */
  heropeek: 75,
  /** 404 page — the lying pose. WIDTH-driven, not height: this pose is wide
   *  and short (1045x621), so `height` is the wrong control. See NotFound. */
  hero404: 214,
} as const

export type LizzieVariant = keyof typeof SIZES

type Props = {
  variant: LizzieVariant
  /** Override the rendered height in px. Defaults to the variant's design size. */
  height?: number
  className?: string
  style?: React.CSSProperties
}

export default function Lizzie({ variant, height, className = '', style }: Props) {
  const h = height ?? SIZES[variant]
  const base = `/mascot/lizzie-${variant}`
  return (
    <img
      src={`${base}@1x.png`}
      srcSet={`${base}@1x.png 1x, ${base}@2x.png 2x, ${base}@3x.png 3x`}
      /* Decorative in every placement — the character never carries information
       * the surrounding copy does not already state. */
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none select-none ${className}`}
      style={{ height: h, width: 'auto', ...style }}
    />
  )
}
