import { useEffect, useRef } from 'react'

/* ---------------------------------------------------------------------
 * SideInstruments — the hero's side RAILS: one calibration ruler,
 * mirrored on both sides of the composition.
 *
 * Transplanted from codex's hero iteration 11 (design-assets/ours/
 * hero-imagegen/hero-i11.png), then cut down twice on user feedback.
 *
 * USER FEEDBACK 2026-07-26 — what was REMOVED and why:
 *   · the right-hand READOUT (PACE / FILLERS + bracket + tick strip) is
 *     gone. "i dont like the right side rail thing" → both sides now carry
 *     the SAME rail, mirrored, so the pair brackets the headline instead of
 *     being two different devices shouting at each other.
 *   · the TALK TIME 50% cluster is gone.
 *   · NO NEGATIVE WORDS. i11's readout said "PACE / Slow", and "Slow" sitting
 *     beside a headline that promises "Every deal on course" reads as an
 *     admission. Every caption option in CAPTIONS below is neutral or
 *     positive, and this constraint is permanent — do not reintroduce a
 *     readout with a deficiency word (slow, low, missed, behind, risk).
 *
 * TWO THINGS THIS FILE DELIBERATELY DOES NOT DO
 *
 * 1. No vertical spine. i11 draws the rail as a STACK OF DASHES with no
 *    continuous rule, and that is worth keeping: a 1px vertical line here
 *    would land squarely in Session 9's R1 ("every line that structures or
 *    draws the layout is neutral, never accent") and would read as the
 *    scratch R1 exists to delete. Dashes are marks, not structure, so navy
 *    on them is defensible.
 *
 * 2. No metric name on the moving part. The marker tracks the product
 *    window's rise, so it must not be labelled with a call metric — scroll
 *    position is not talk time, and a number that changes as you scroll is
 *    nonsense. The rail is an unlabelled calibration ruler; any caption sits
 *    below it as a separate, static line.
 *
 * MOTION: zero React re-renders. One rAF-throttled scroll listener writes a
 * single custom property (--si-p, 0→1) on the root; all 21 ticks derive their
 * own opacity from it in CSS and the marker translates off it. House rule
 * (CLAUDE.md): "no per-frame React re-renders".
 *
 * Chromium note (Session 9, design.md): fractional BORDER widths floor to
 * whole device pixels, so every 1.5px dash is painted as a background box
 * with a height, never as a border.
 * ------------------------------------------------------------------- */

export type InstrumentInk = 'navy' | 'graphite'
export type CaptionSet = 'none' | 'live' | 'guidance'

/* Both palettes are existing tokens — nothing hand-mixed. Navy is
   accent-1000 (#1a1f59), the deep end of the lavender ladder and, by
   measurement, the exact navy codex used in hero iteration 01. Graphite is
   the R1-compliant neutral pair.

   H1 2026-07-26 — graphite's mark moved gray-500 → gray-700. This is the
   other half of the dim-state legibility fix documented in
   SideInstruments.css: with gray-500 there is NO opacity floor that leaves the
   dim track ≥40 luminance points off the ground while keeping the lit/dim
   delta ≥45 (the maths is in the CSS). gray-700 is also what the numerals
   already used, so the whole rail is now one ink and the dash/numeral pair
   lights together instead of the numeral leading it. Navy was never affected:
   accent-1000's ground-delta is 215.9, so even at the old 0.28 floor its dim
   state was 60 points off the ground. */
const INK: Record<InstrumentInk, { mark: string; num: string; label: string }> = {
  navy: { mark: 'bg-accent-1000', num: 'text-accent-1000', label: 'text-accent-1000/75' },
  graphite: { mark: 'bg-gray-700', num: 'text-gray-700', label: 'text-gray-600' },
}

/* Caption pairs. Left word / right word — the rails are identical rulers, so
   two different words read as a phrase bracketing the headline rather than as
   the same label printed twice. All drawn from the company's own vocabulary
   (CLAUDE.md voice note: reps, execution, steer, next-best action, playbook,
   objection handling, coaching, ramp, guidance, live — NOT "signal"/"intent",
   which they barely use). */
const CAPTIONS: Record<CaptionSet, [string, string] | null> = {
  none: null,
  live: ['Live', 'On course'],
  guidance: ['Guidance', 'Every call'],
}

const MAJORS = [100, 75, 50, 25, 0] // top → bottom, as i11 orders them
const MINORS_BETWEEN = 4

/* Tick ladder, top→bottom, each row tagged with `t` = its position on the
   rail normalised 0 (bottom, "00") → 1 (top, "100").

   THE RAIL IS CONSUMED, NOT FILLED (owner, 2026-07-27): "when the rail starts
   moving in term going from zero to hundred the lower part of it should
   disappare". So a tick holds its rest ink until the marker reaches its own
   `t`, then ERASES as the marker passes — the ruler is eaten from the bottom
   up and at --si-p: 1 only the top of the scale and the marker are left. The
   old two-state read (dim track / lit trail) is gone: there is no lit state
   any more, because the marks that used to light are exactly the ones now
   being removed. The maths lives in SideInstruments.css. */
type Tick = { t: number; major: number | null }
const TICKS: Tick[] = (() => {
  const rows: Tick[] = []
  MAJORS.forEach((m, i) => {
    rows.push({ t: 0, major: m })
    if (i < MAJORS.length - 1) for (let k = 0; k < MINORS_BETWEEN; k++) rows.push({ t: 0, major: null })
  })
  const last = rows.length - 1
  return rows.map((r, i) => ({ ...r, t: (last - i) / last }))
})()

/* ── the rail ────────────────────────────────────────────────────────── */

export function Rail({
  ink = 'navy',
  side = 'left',
  captions = 'none',
}: {
  ink?: InstrumentInk
  side?: 'left' | 'right'
  captions?: CaptionSet
}) {
  const c = INK[ink]
  const mirrored = side === 'right'
  const pair = CAPTIONS[captions]
  const caption = pair ? (mirrored ? pair[1] : pair[0]) : null

  /* `si-rail` / `si-dash` / `si-num` are GATE HOOKS, not styling. The rails'
     two substantive gates (mirror symmetry, no negative word) used to reach
     them through Tailwind class soup — `.absolute.md\:left-10` — which pointed
     at the harness's wrapper and would have silently stopped matching the
     moment the wrapper's utilities changed. See scripts/hero-instruments-shots.mjs. */
  return (
    <div
      aria-hidden
      className={`si-rail si-rail--${side} select-none ${mirrored ? 'text-right' : ''}`}
    >
      <div className="flex flex-col gap-[7px]">
        {TICKS.map((tick, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 ${mirrored ? 'flex-row-reverse' : ''}`}
            style={{ ['--t' as string]: tick.t }}
          >
            {/* opacity derives from --si-p entirely in CSS: a tick holds its
                rest ink until progress reaches its own --t, then erases over
                one row's worth of travel. One variable drives all 21 rows. */}
            <span
              className={`si-tick si-dash block h-[1.5px] rounded-full ${c.mark} ${tick.major !== null ? 'w-[11px]' : 'w-[6px]'}`}
            />
            {tick.major !== null && (
              <span className={`si-tick si-num font-mono text-[11px] font-[550] tabular-nums ${c.num}`}>
                {String(tick.major).padStart(2, '0')}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* the marker: one element, translated by the same variable. This is the
          part that "animates with scroll" — it rides the ruler as the product
          window climbs, and it is now the ONLY mark on the rail at full ink.

          Owner 2026-07-27: "instead of using dot to show the use the actual
          component that we see like a triangle kind of thing". It is a
          playhead pointing INWARD (right on the left rail, left on the right
          one), drawn as a CSS border triangle in SideInstruments.css — which
          is why it carries `c.num` (a text colour) rather than `c.mark` (a
          background): a border triangle has no background to paint, so its
          colour comes through `currentColor`. In both palettes `num` and
          `mark` are the same token, so the rail stays one ink. */}
      <div className="relative mt-1 h-0">
        <span
          className={`si-marker absolute -translate-y-1/2 ${c.num} ${mirrored ? 'right-0' : 'left-0'}`}
        />
      </div>

      {/* the caption sits BELOW the ruler, so it belongs to the part that gets
          consumed: it fades out early in the travel (see .si-caption). */}
      {caption && (
        <p className={`si-caption mt-6 font-mono text-[10px] font-[550] tracking-[0.14em] uppercase ${c.label}`}>
          {caption}
        </p>
      )}
    </div>
  )
}

/* ── the driver ──────────────────────────────────────────────────────── */

/**
 * Writes `--si-p` (0→1) on `ref` from how far `trackRef` has travelled
 * through the viewport. rAF-throttled, passive, and it bails out entirely
 * under prefers-reduced-motion with the rails parked at their settled state —
 * matching the donor's reduced-motion rule (DESIGN.md §5.2: entrances
 * disabled, content renders in final state).
 */
export function useInstrumentProgress(
  ref: React.RefObject<HTMLElement | null>,
  trackRef: React.RefObject<HTMLElement | null>,
) {
  const raf = useRef(0)
  useEffect(() => {
    const root = ref.current
    const track = trackRef.current
    if (!root || !track) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.style.setProperty('--si-p', '1')
      return
    }

    const read = () => {
      raf.current = 0
      const r = track.getBoundingClientRect()
      /* 0 when the track's top sits at the viewport bottom, 1 once it has
         risen to the top — i.e. the rail measures the rise. */
      const span = r.height + window.innerHeight
      const p = span > 0 ? 1 - r.bottom / span : 0
      root.style.setProperty('--si-p', String(Math.min(1, Math.max(0, p))))
    }
    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, trackRef])
}
