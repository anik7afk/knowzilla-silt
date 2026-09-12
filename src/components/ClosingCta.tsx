import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { RegisterMark } from './craft'
import Lizzie from './Lizzie'
import './ClosingCta.css'

/* ---------------------------------------------------------------------------
 * ClosingCta — "Sales, navigated."
 *
 * Session 9 (2026-07-25), both changes straight from the user:
 *
 *  1. "it has a slight border on the top edge … i dont want that sharp line,
 *      it should be smooth and felt like the opacity increased while coming
 *      to center". Two causes, both measured before touching anything: the
 *      section's `border-t` hairline (a 10.1/255 luminance step across the
 *      full width — see design-assets/ours/session9/closing-cta/before-report
 *      .json) and a mask that still had ~24% alpha left when it hit the top
 *      edge, so the first dot row appeared at half the field's strength. The
 *      hairline is gone and the mask now reaches zero inside every edge (see
 *      ClosingCta.css). NOTE for integration: the Session-4 join rule wants a
 *      hairline where two adjacent sections share a ground, and Stats above
 *      is also surface-300 — removing it is exactly what the user asked for,
 *      but it is a join-rule knock-on for the main session to resolve.
 *
 *  2. "i want to have some hover animation for this dotted part like when i
 *      hover the dotts feels like getting stretched". The field is now a
 *      canvas: within RADIUS of the pointer each dot elongates into a short
 *      dash oriented along the vector to the cursor and drifts a little
 *      toward it, weighted by a smoothstep falloff that is exactly 0 at the
 *      radius edge — so the effect has no border either.
 *
 * Engineering rules this obeys:
 *  - one canvas, never hundreds of DOM nodes;
 *  - ONE stroke() per frame per INK PRESENT (every dot is a round-capped
 *    segment; a resting dot is a zero-length one) — one for the default field,
 *    at most six for a coloured variant — and only the dots inside the dirty rect —
 *    the union of the previous and current influence boxes — are touched, so
 *    a frame redraws ~1k dots, not the whole 4k field. KineticConversation's
 *    lesson (a huge multi-segment Path2D stroke falls off Chrome's raster
 *    fast path) is why the per-frame segment count is bounded rather than
 *    "the whole grid, every frame";
 *  - rAF runs ONLY while the pointer is inside the section, plus the settle
 *    tail; when the field is at rest there is zero rAF and zero repaint;
 *  - `prefers-reduced-motion` and coarse/no-hover pointers get the static
 *    field painted once and no listeners at all.
 *
 * ---------------------------------------------------------------------------
 * COLOUR VARIANTS (2026-07-26). The user picked out
 * `design-assets/ours/color-vibes/dotted/d1-5-colored-dot-field.png` — "i like
 * how the dots look here the colour lets do this too" — which recolours this
 * field into a focal region plus a small, separately-voiced telemetry cluster.
 *
 * The colour is an OPEN decision, so all three readings ship behind one prop
 * and NOTHING is chosen here: `ink` defaults to 'current', which paints exactly
 * the field that shipped before this change (verified as a zero-pixel diff on
 * the landing page). The two coloured readings are reachable only through the
 * `/stage` gallery until the owner picks one.
 *
 * Everything below is measured off the two reference mocks, not estimated —
 * both are the 1440 section rendered at ~1.494x, so their fractions map
 * straight onto this box:
 *
 *  - ground in both mocks is luminance 245; surface-300 is 246. The mocks'
 *    neutral dots sit at luminance 230, and gray-400 at alpha 0.5 over
 *    surface-300 computes to 230.5 — the resting field already matches the
 *    reference exactly, so its ink and alpha are untouched in every variant.
 *  - d1-5 (the mock the user picked): tinted dots span x 0.167-0.832,
 *    y 0.103-0.852, centred (0.500, 0.477); their luminance ladder runs
 *    226 (typical) -> 185 -> 163 (strongest). The telemetry cluster: 3% of dots,
 *    centred (0.721, 0.753), strongest luminance 186.
 *  - d2-a (the round-2 refinement of the same idea): tint compressed to
 *    x 0.178-0.800, y 0.298-0.625 centred (0.489, 0.462); cluster compressed to
 *    ~10 dots centred (0.616, 0.640).
 *  - the CTA action row's own centre, measured in the running page, is
 *    (0.500, 0.4714) of this box. That IS the references' focal centre, so the
 *    focus is anchored to the ELEMENT rather than to a fraction and lands on
 *    the ask at every breakpoint.
 *  - the elliptical mask in ClosingCta.css decides what survives: d2-a's cluster
 *    position sits at ~0.79 mask alpha, d1-5's at ~0.31. The cluster therefore
 *    takes d2-a's tighter offset — at d1-5's it is 2.5x weaker for no gain.
 *
 * TELEMETRY RAMP RETIRED (2026-07-27). The cluster took its ink from the ramp
 * that was retired page-wide, in both mocks and in both variants below, and it
 * is re-inked here. Neither variant ships on the landing page — `ink` defaults to
 * 'current', which has no cluster at all — so nothing on the page moved; what
 * changed is what the two /stage readings offer the owner. The replacement is
 * NOT one substitution, because the two variants are in different situations:
 *  - 'navy' paints its focal ramp in accent-1000 at alphas of 0.1-0.4, i.e. a
 *    near-neutral cool ink, so a saturated signal cluster is exactly the new
 *    palette rule ("signal is the saturated stroke, accent drops to tint" —
 *    tokens.css). Cluster -> signal-600.
 *  - 'lavender' paints accent-600 sparks at 0.7. signal-600 sits 17 degrees from
 *    accent-600, and the palette note forbids both saturated in one frame — at a
 *    2px dot the two would be indistinguishable and the cluster would stop being
 *    a second voice at all. So in THAT variant the cluster is graphite and speaks
 *    by weight instead of by hue. That is a real judgment call, not a mechanical
 *    swap; it is flagged for the checkpoint.
 * Alphas are re-solved in both cases, never carried over: each is the alpha at
 * which the new ink's composite over surface-300 lands on the SAME luminance the
 * retired step produced (209.6 for the fringe, 179.6 for the core), so the
 * cluster changes hue without changing weight.
 *
 * Each ink's alpha ladder is solved so its composite luminance over
 * surface-300 lands on the references' measured ladder (231 / 212 / 164), which
 * is why 'navy' runs at alphas an order of magnitude lower than 'lavender':
 * accent-1000 is 210 luminance steps from the ground, accent-200 is 20.
 *
 * THE ONE REAL COST: a canvas cannot stroke one path in two colours, so the
 * single stroke() per frame becomes one per ink actually present in the dirty
 * rect (1 for 'current', up to 6 for the coloured variants). The dirty-rect
 * walk itself is NOT repeated — each dot is appended to its own Path2D during
 * the SAME single walk, and the strokes are issued afterwards. Dots never
 * overlap (pitch 16 vs a 11.5px maximum stretched span) so paint order is
 * irrelevant. Which ink a dot belongs to depends only on its grid indices, so
 * it is resolved ONCE per resize into a Uint8Array role grid and the per-frame
 * loop stays a table lookup; it also means two dirty rectangles meeting can
 * never disagree about a dot's colour and leave a seam.
 * ------------------------------------------------------------------------- */

/* grid + falloff. Tuned by eye against the section at 1440: the field should
   answer the cursor, not perform for it. */
const PITCH = 16 /* matches the shared DotGrid pitch the page uses elsewhere */
const DOT_R = 1
const DOT_ALPHA = 0.5
const RADIUS = 140 /* influence radius, px */
const MAX_LEN = 5.5 /* extra dash length at full weight, px */
const MAX_PULL = 2 /* drift toward the cursor at full weight, px */
const DEAD_ZONE = 16 /* below this the direction vector is unstable; ramp it in */
const EASE_POS = 0.2 /* pointer lerp — the elasticity */
const EASE_IN = 0.16
const EASE_OUT = 0.09
const GRAY_400 = '#d7d6d4' /* fallback only; the real value is read from the DOM */

export type FieldInk = 'current' | 'navy' | 'lavender'

/* Ink roles. Index 0 is the resting field and is always present; 1-3 are the
   focal ramp (weakest -> strongest) and 4-5 the telemetry cluster. A null slot
   means the variant does not use that role at all. */
const ROLE_NEUTRAL = 0
const ROLE_TINT = 1
const ROLE_CORE = 2
const ROLE_FOCUS = 3
const ROLE_TELE = 4
const ROLE_TELE_CORE = 5
const ROLE_COUNT = 6

type Ramp = { token: string; alpha: number }

const NEUTRAL_RAMP: Ramp = { token: '--color-gray-400', alpha: DOT_ALPHA }

/* Alphas SOLVED, not tuned: each is the value whose composite luminance over
   surface-300 lands on the mocks' measured tinted-dot ladder — typical 226,
   5th percentile 185, strongest 163; telemetry typical 215, strongest 187.
   (A first pass solved the weakest step to the RESTING field's own 230 so the
   band would change hue without adding ink. Measured on the render, that step
   was invisible: a 2px dot spreads over four pixels, so ~78% of its colour
   survives, and a tint carrying no luminance difference simply disappears. The
   mocks' own typical tinted dot is 226 — darker than their neutral 230 — which
   is exactly accent-200 at full strength. The references were right.) */
const INKS: Record<FieldInk, (Ramp | null)[]> = {
  /* the field as it shipped — one ink, one stroke, byte-identical output */
  current: [NEUTRAL_RAMP, null, null, null, null, null],
  /* one hue for the whole focal ramp: at the outer step accent-1000 is a
     neutral dot with a whisper of cool in it, which is why this variant is the
     one that does not read as "more lavender". */
  navy: [
    NEUTRAL_RAMP,
    { token: '--color-accent-1000', alpha: 0.095 },
    { token: '--color-accent-1000', alpha: 0.214 },
    { token: '--color-accent-1000', alpha: 0.395 },
    /* the table for this variant says ONE cluster ink, so the fringe is that
       same ink held back to the luminance the lavender variant's fringe lands
       on. The retired ink ran @0.55/@1; signal-600 is 2.17x further from the
       ground, so the alphas divide by that and the composite is unchanged
       (209.6 / 179.6). */
    { token: '--color-signal-600', alpha: 0.256 },
    { token: '--color-signal-600', alpha: 0.465 },
  ],
  /* the literal reading of the mock: accent-200/300 body, accent-600 sparks.
     Two of the three focal steps are the token at full strength — the ladder
     the references measured IS this ramp, undiluted. */
  lavender: [
    NEUTRAL_RAMP,
    { token: '--color-accent-200', alpha: 1 },
    { token: '--color-accent-300', alpha: 1 },
    { token: '--color-accent-600', alpha: 0.7 },
    /* graphite, not signal: this variant's sparks ARE saturated accent-600, and
       signal-600 is 17 degrees away from it — see the OLIVE RETIRED note above.
       gray-700, at the alphas that reproduce the retired steps' composite
       luminance exactly (209.6 fringe / 179.6 core over surface-300). */
    { token: '--color-gray-700', alpha: 0.272 },
    { token: '--color-gray-700', alpha: 0.496 },
  ],
}

/* Focal field, as fractions of the canvas box, centred on the CTA action row.
   Half-extents sit between the two mocks' measured spans (d1-5 0.333w x
   0.375h, d2-a 0.311w x 0.164h) and leave a neutral surround on all four
   sides, so the section still reads as a drafting sheet with a focus rather
   than as a coloured section. */
const FOCUS_RX = 0.34
const FOCUS_RY = 0.38
/* Telemetry cluster: d2-a's measured offset from the focal centre (d1-5's own
   position is 2.5x weaker under this section's mask), sized between the two
   mocks' — at 1440 that is a 152x80px ellipse, ~37 grid slots, ~16 lit dots,
   1.4% of the field. A cluster, not a region, and off the CTA's axis so it
   reads as a second voice rather than as decoration on the first.
   The radii are FRACTIONS of the box, not fixed px: held at 76px they were 39%
   of the width at 390 — measured, the cluster stopped being a cluster on
   mobile. The px clamps keep it from dissolving into 4 dots on a narrow box or
   spreading on a very wide one. */
const TELE_DX = 0.116
const TELE_DY = 0.169
const TELE_RX_F = 0.053
const TELE_RY_F = 0.082
const TELE_RX_MIN = 40
const TELE_RX_MAX = 96
const TELE_RY_MIN = 26
const TELE_RY_MAX = 48
/* Density. SHARE is the fraction of dots joining that ink where the focal
   weight is 1; SPREAD is the exponent applied to the weight, so <1 widens a
   step's footprint and >1 concentrates it at the centre.
   The MIDDLE step carries the field. That is not a taste call: accent-200 sits
   only 20 luminance steps from surface-300, so at a 2px dot it is a whisper no
   matter what alpha it is given (measured — a band built on it read as bare
   sparks). accent-300 is 45 steps out and reads as tint, so it takes the body
   and accent-200 is demoted to the dissolving fringe. The strongest step stays
   rare everywhere — ~4% of tinted dots, matching the mocks' 5th percentile. */
const FOCUS_SHARE = 0.3
const FOCUS_SPREAD = 3
const CORE_SHARE = 0.98
const CORE_SPREAD = 1.3
const TINT_SHARE = 0.98
const TINT_SPREAD = 0.5
const TELE_SPREAD = 0.7
const TELE_CORE_AT = 0.45 /* cluster weight above which a dot takes the strong step */
const FALLBACK_FY = 0.47 /* if the CTA row cannot be located, the mocks' centre */

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/* Stable per-cell dither. Depends ONLY on the grid indices — the field repaints
   in dirty rectangles, so anything frame- or pointer-dependent here would leave
   a visible seam where two repaints met. */
const hash = (i: number, j: number, salt: number) => {
  let x = Math.imul(i + 0x9e37, 0x27d4eb2d) ^ Math.imul(j + 0x85eb, 0x165667b1) ^ salt
  x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d)
  x ^= x >>> 12
  x = Math.imul(x, 0x297a2d39)
  return ((x ^ (x >>> 15)) >>> 0) / 4294967296
}

type Box = { x0: number; y0: number; x1: number; y1: number }

export default function ClosingCta({ ink = 'current' }: { ink?: FieldInk } = {}) {
  const { ref, inView } = useInView<HTMLElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  /* the focal anchor: the field's focus is the ask, not a fraction */
  const anchorRef = useRef<HTMLDivElement>(null)
  /* false until proven otherwise: reduced motion and coarse pointers never
     get the reactive field, and neither does the first paint. */
  const [reactive, setReactive] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setReactive(!reduce.matches && fine.matches)
    update()
    reduce.addEventListener('change', update)
    fine.addEventListener('change', update)
    return () => {
      reduce.removeEventListener('change', update)
      fine.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const section = ref.current
    if (!canvas || !section) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /* Every ink is read from the DOM, never written here — a missing token
       degrades to the resting field's own colour rather than to an invented
       one, so this file introduces no colour value of its own. */
    const rootStyle = getComputedStyle(section)
    const ramps = INKS[ink]
    const neutral = rootStyle.getPropertyValue('--color-gray-400').trim() || GRAY_400
    const colors = ramps.map((r) => (r ? rootStyle.getPropertyValue(r.token).trim() || neutral : neutral))
    const alphas = ramps.map((r) => (r ? r.alpha : DOT_ALPHA))
    const colored = ramps[ROLE_TINT] !== null

    let w = 0
    let h = 0
    let cols = 0
    let rows = 0
    /* which ink each grid cell belongs to; rebuilt on resize only */
    let roles = new Uint8Array(0)

    /* pointer state, in CSS px relative to the canvas */
    let targetX = 0
    let targetY = 0
    let posX = 0
    let posY = 0
    let amp = 0 /* 0 = resting field, 1 = fully engaged */
    let want = 0
    let raf: number | null = null
    let prevBox: Box | null = null

    const MARGIN = RADIUS + MAX_LEN + MAX_PULL + DOT_R + 2

    /* The CTA action row's centre in canvas px. Read from LAYOUT offsets, not
       getBoundingClientRect: `kz-enter` translates the row 12px on entry, and a
       rect measured mid-entrance would anchor the field 12px low and stay
       there. Offsets ignore the element's own transform. */
    const anchorAt = () => {
      const el = anchorRef.current
      if (el) {
        let x = el.offsetWidth / 2
        let y = el.offsetHeight / 2
        let node: HTMLElement | null = el
        while (node && node !== section) {
          x += node.offsetLeft
          y += node.offsetTop
          node = node.offsetParent as HTMLElement | null
        }
        if (node === section) return { x, y }
      }
      return { x: w / 2, y: h * FALLBACK_FY }
    }

    /* Resolve every cell's ink once. Pure function of (i, j) + the box, so a
       repaint of any sub-rectangle agrees with every other repaint. */
    const buildRoles = () => {
      const n = cols * rows
      if (roles.length !== n) roles = new Uint8Array(n)
      /* 'current' never reads the grid, so it never pays to build one */
      if (!colored) return
      const { x: ax, y: ay } = anchorAt()
      const fRx = Math.max(1, FOCUS_RX * w)
      const fRy = Math.max(1, FOCUS_RY * h)
      const tCx = ax + TELE_DX * w
      const tCy = ay + TELE_DY * h
      const tRx = Math.min(TELE_RX_MAX, Math.max(TELE_RX_MIN, TELE_RX_F * w))
      const tRy = Math.min(TELE_RY_MAX, Math.max(TELE_RY_MIN, TELE_RY_F * h))
      for (let j = 0; j < rows; j++) {
        const cy = j * PITCH + 1
        for (let i = 0; i < cols; i++) {
          const cx = i * PITCH + 1
          let role = ROLE_NEUTRAL
          /* Telemetry is resolved first: it is the section's one secondary
             signal and must not be eaten by the focal ramp it sits inside.
             Cluster cells the dither leaves unlit fall through to the focal
             test below, so the cluster dissolves into the field. */
          const tdx = (cx - tCx) / tRx
          const tdy = (cy - tCy) / tRy
          const td = Math.sqrt(tdx * tdx + tdy * tdy)
          if (td < 1) {
            const o = smoothstep(1 - td)
            if (hash(i, j, 0x51ed) < Math.pow(o, TELE_SPREAD))
              role = o > TELE_CORE_AT ? ROLE_TELE_CORE : ROLE_TELE
          }
          if (role === ROLE_NEUTRAL) {
            const fdx = (cx - ax) / fRx
            const fdy = (cy - ay) / fRy
            const fd = Math.sqrt(fdx * fdx + fdy * fdy)
            if (fd < 1) {
              const g = smoothstep(1 - fd)
              const r = hash(i, j, 0x1b87)
              if (r < Math.pow(g, FOCUS_SPREAD) * FOCUS_SHARE) role = ROLE_FOCUS
              else if (r < Math.pow(g, CORE_SPREAD) * CORE_SHARE) role = ROLE_CORE
              else if (r < Math.pow(g, TINT_SPREAD) * TINT_SHARE) role = ROLE_TINT
            }
          }
          roles[j * cols + i] = role
        }
      }
    }

    /* One path per ink, filled during a SINGLE walk of the dirty rectangle and
       stroked afterwards — so the walk is never repeated per colour. Hoisted
       so the array itself is allocated once. */
    const paths: (Path2D | null)[] = new Array(ROLE_COUNT).fill(null)

    /* Repaint one rectangle of the field. Every dot is a round-capped stroke
       segment — a resting dot is a zero-length one — so each ink present in the
       region is one path and one stroke call. */
    const paint = (b: Box) => {
      const x0 = Math.max(0, b.x0)
      const y0 = Math.max(0, b.y0)
      const x1 = Math.min(w, b.x1)
      const y1 = Math.min(h, b.y1)
      if (x1 <= x0 || y1 <= y0) return
      ctx.clearRect(x0, y0, x1 - x0, y1 - y0)

      const i0 = Math.max(0, Math.floor((x0 - DOT_R - 1) / PITCH))
      const i1 = Math.min(cols - 1, Math.ceil((x1 - 1) / PITCH))
      const j0 = Math.max(0, Math.floor((y0 - DOT_R - 1) / PITCH))
      const j1 = Math.min(rows - 1, Math.ceil((y1 - 1) / PITCH))

      const live = amp > 0.002
      for (let k = 0; k < ROLE_COUNT; k++) paths[k] = null
      for (let j = j0; j <= j1; j++) {
        const cy = j * PITCH + 1
        const rowBase = j * cols
        for (let i = i0; i <= i1; i++) {
          const cx = i * PITCH + 1
          const role = colored ? roles[rowBase + i] : ROLE_NEUTRAL
          let path = paths[role]
          if (path === null) path = paths[role] = new Path2D()
          if (live) {
            const dx = posX - cx
            const dy = posY - cy
            const d2 = dx * dx + dy * dy
            if (d2 < RADIUS * RADIUS) {
              const d = Math.sqrt(d2)
              const t = 1 - d / RADIUS
              /* smoothstep falloff: 1 at the cursor, 0 with zero slope at the
                 radius edge, so dots do not pop in or out of the influence */
              const weight = t * t * (3 - 2 * t) * amp * Math.min(1, d / DEAD_ZONE)
              if (weight > 0.002) {
                const inv = 1 / (d || 1)
                const ux = dx * inv
                const uy = dy * inv
                const half = (MAX_LEN * weight) / 2
                const ox = cx + ux * MAX_PULL * weight
                const oy = cy + uy * MAX_PULL * weight
                path.moveTo(ox - ux * half, oy - uy * half)
                path.lineTo(ox + ux * half, oy + uy * half)
                continue
              }
            }
          }
          path.moveTo(cx, cy)
          path.lineTo(cx + 0.01, cy)
        }
      }
      for (let k = 0; k < ROLE_COUNT; k++) {
        const path = paths[k]
        if (path === null) continue
        ctx.strokeStyle = colors[k]
        ctx.globalAlpha = alphas[k]
        ctx.stroke(path)
      }
    }

    const paintAll = () => {
      prevBox = null
      paint({ x0: 0, y0: 0, x1: w, y1: h })
    }

    const size = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = DOT_R * 2
      /* strokeStyle / globalAlpha are set per ink inside paint() */
      cols = Math.ceil(w / PITCH) + 1
      rows = Math.ceil(h / PITCH) + 1
      buildRoles()
      paintAll()
    }

    let resizeTimer: number | undefined
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(size, 120)
    })
    ro.observe(canvas)
    size()

    if (!reactive) {
      /* static field: no listeners, no rAF, nothing to stop */
      return () => {
        window.clearTimeout(resizeTimer)
        ro.disconnect()
      }
    }

    const boxAt = (x: number, y: number): Box => ({
      x0: x - MARGIN,
      y0: y - MARGIN,
      x1: x + MARGIN,
      y1: y + MARGIN,
    })

    const frame = () => {
      posX += (targetX - posX) * EASE_POS
      posY += (targetY - posY) * EASE_POS
      amp += (want - amp) * (want > amp ? EASE_IN : EASE_OUT)
      if (want === 0 && amp < 0.004) amp = 0

      const box = amp > 0 ? boxAt(posX, posY) : null
      const dirty =
        box && prevBox
          ? {
              x0: Math.min(box.x0, prevBox.x0),
              y0: Math.min(box.y0, prevBox.y0),
              x1: Math.max(box.x1, prevBox.x1),
              y1: Math.max(box.y1, prevBox.y1),
            }
          : box || prevBox
      if (dirty) paint(dirty)
      prevBox = box

      if (amp === 0) {
        raf = null /* settled — the section goes completely quiet again */
        return
      }
      raf = requestAnimationFrame(frame)
    }

    const wake = () => {
      if (raf === null) raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const rect = canvas.getBoundingClientRect()
      targetX = e.clientX - rect.left
      targetY = e.clientY - rect.top
      if (amp === 0) {
        /* entering from rest: start where the cursor actually is, never swoosh
           in from wherever it left last time. Re-entering mid-settle keeps its
           position so the field carries on elastically instead of teleporting. */
        posX = targetX
        posY = targetY
      }
      want = 1
      wake()
    }

    const onLeave = () => {
      want = 0
      wake()
    }

    section.addEventListener('pointermove', onMove)
    section.addEventListener('pointerleave', onLeave)
    section.addEventListener('pointercancel', onLeave)

    /* scrolling the section away counts as leaving it */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (!entry.isIntersecting) onLeave()
      },
      { threshold: 0 },
    )
    io.observe(section)

    return () => {
      window.clearTimeout(resizeTimer)
      ro.disconnect()
      io.disconnect()
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
      section.removeEventListener('pointercancel', onLeave)
      if (raf !== null) cancelAnimationFrame(raf)
      raf = null
    }
  }, [reactive, ref, ink])

  return (
    /* No border-t: the top hairline WAS the sharp line the user called out
     * (measured, see the header comment). The join with Stats — same
     * surface-300 ground — is now carried by the field emerging out of
     * nothing instead. */
    <section ref={ref} className="cta relative bg-surface-300">
      {/* drafting-sheet backdrop — closes the motif the hero opens */}
      <div aria-hidden className="cta__field">
        <canvas ref={canvasRef} className="cta__canvas" />
      </div>

      {/* Measure narrowed 1280 → 860 (2026-07-25). Stats now precedes the CTA on
        * the same surface-300 ground, and two adjacent sections may not share
        * both ground and measure. Narrowing is the better of the two fixes: the
        * page closes by drawing in to a single ask rather than holding the wide
        * band for one more beat, and it echoes WriteBack's intimate 860. */}
      <div className="relative mx-auto max-w-[860px] px-6 pt-[96px] pb-[160px] text-center md:px-10 md:pt-[120px] md:pb-[240px]">
        {/* Register marks pinning the sheet's corners. They deliberately live
          * OUTSIDE the masked field: the mask is zero at exactly the corners
          * they occupy, so masking them would erase them. They are drawn
          * marks, not texture — the field fades, the marks stay. */}
        <div className="pointer-events-none absolute inset-x-6 top-10 hidden justify-between md:flex md:inset-x-10">
          <RegisterMark />
          <RegisterMark />
        </div>
        <div className="pointer-events-none absolute inset-x-6 bottom-10 hidden justify-between md:flex md:inset-x-10">
          <RegisterMark />
          <RegisterMark />
        </div>
        <h2
          className={`${inView ? 'kz-enter' : 'opacity-0'} mx-auto max-w-[900px] [text-wrap:balance] font-display text-[36px] font-medium leading-[40px] tracking-[-0.4px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.48px]`}
          style={{ '--enter-delay': '0ms' } as React.CSSProperties}
        >
          {/* The full stop is GONE (owner, 2026-07-27) — Lizzie leans on the
            * "d" instead, so the character replaces the punctuation rather
            * than standing next to it. She sits INLINE on the same baseline,
            * which is what makes headline + character centre as one lockup
            * instead of two objects sharing a band.
            *
            * The offset is small on purpose. The paw is at the very left edge
            * of the artwork's bounding box, so -0.06em brings the paw into
            * contact with the "d" — pull it further and the body starts
            * covering the letter, which is the failure the owner caught in an
            * earlier mock ("its completely hiding the d"). Touch, not overlap. */}
          Sales, navigated
          <Lizzie
            variant="lean"
            className="ml-[-0.06em] inline-block align-baseline"
            style={{ height: '2.1em', marginBottom: '-0.14em' }}
          />
        </h2>

        <div
          ref={anchorRef}
          className={`${inView ? 'kz-enter' : 'opacity-0'} mt-10 flex flex-wrap items-center justify-center gap-3`}
          style={{ '--enter-delay': '120ms' } as React.CSSProperties}
        >
          <a
            href="#"
            className="kz-cta-btn kz-hover kz-focus-ring flex h-9 items-center rounded-button bg-ink pl-4 pr-3.5 text-[14px] font-medium text-surface-100 hover:bg-gray-800"
            style={{ transitionProperty: 'background-color' }}
          >
            Start navigating
            <span className="kz-chevron ml-1.5" aria-hidden="true">
              →
            </span>
          </a>
          <a
            href="#"
            className="kz-hover kz-focus-ring flex h-9 items-center rounded-micro px-2 text-[14px] font-medium text-ink-secondary hover:text-ink"
            style={{ transitionProperty: 'color' }}
          >
            Book a demo
          </a>
        </div>
      </div>
    </section>
  )
}
