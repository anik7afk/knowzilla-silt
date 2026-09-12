import {
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  LayoutGrid,
  List,
  Network,
  Pencil,
  Search,
  Tag,
  Trash2,
  Users,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { PaneHead, showFrom } from './kit'
import {
  hide,
  hidePointer,
  pointTo,
  pressOn,
  q,
  releaseOn,
  show,
  text,
  type Beat,
  type PaneModule,
} from './contract'

/* =====================================================================
 * Knowledge Base — the product's document library.
 *
 * PROVENANCE — every element below is video-verified against
 * `design-assets/refs/session7/knowzilla-app/PRODUCT-NOTES.md` §3.1
 * ("Knowledge Base — t-007, t-008"), read alongside frames `t-007.png`
 * (header card) and `t-008.png` (the populated grid).
 *
 *   · Header card: title "Knowledge Base" + subtitle "Manage your sales
 *     materials", primary action "+ Create Document" right-aligned.
 *     — §3.1, `t-007`; the isolated button also in `t-005`/`t-006`.
 *     The action is DECLARED on the module (`actions`) so the frame's top
 *     bar carries it; PaneHead therefore ships without a duplicate.
 *   · Body card: section title "All Documents" with a right-aligned
 *     toolbar = search ("Search documents…") + type filter ("All Types")
 *     + a list/grid view toggle. — §3.1, `t-008`.
 *   · Content: a CARD GRID, 4 per row. Each card = coloured type icon,
 *     visibility badge top-right, title, type as a second line, an
 *     "Updated 3 days ago" timestamp, and a two-action row (pencil edit /
 *     trash delete). — §3.1, `t-008`.
 *   · Document TYPE TAXONOMY, all five values, verbatim: Ideal Customer
 *     Profile · Organizational Structure · Product & Pricing Guide ·
 *     Qualifying Questions · Sales Playbook. Each type has its own icon
 *     and colour in the real app. — §3.1, `t-008`.
 *   · The KB is typed, per-company, timestamped and carries a
 *     public/private visibility flag. — §3.1, closing note.
 *
 * COPY is ours, not the tenant's: the document names are our own sample
 * company's, mapped onto the five real type values. NOTHING on this
 * surface is a string the product does not have — the type filter's menu
 * is built from the documented taxonomy plus the documented default
 * ("All Types"), so opening it introduces zero new copy.
 *
 * CRAFT is the page's, not knowzilla.eu's: white cards on a surface-200
 * body, hairlines instead of borders, 1.5px line icons, and the one
 * sanctioned float (`shadow-float` = "chips/cards over product frames")
 * on the one thing that genuinely floats, the open filter menu. The one
 * place colour is allowed to be functional is inside the product frame —
 * so the five document types carry five token-derived covers and nothing
 * else on the surface is coloured.
 *
 * ⚠ DELIBERATE DEPARTURE FROM THE PRODUCT — SAY IT OUT LOUD.
 * The real Knowledge Base card (PRODUCT-NOTES §3.1, `t-008`) has NO cover
 * art: it is a white card with a small coloured type icon. The gradient
 * COVER PLATE below is OUR design decision, taken 2026-07-26 on the user's
 * direction and against two supplied references
 * (`design-assets/refs/session10/kb-cards/ref-01-card-layout.png` — the
 * cover-led card layout; `ref-02-gradient-closeup.png` — the texture). It
 * invents no FEATURE and no COPY: every string, every affordance and the
 * whole five-value taxonomy are still the product's. What it changes is
 * the visual design of the card, so this surface no longer looks like the
 * app knowzilla.eu shipped. That is a real divergence and it is a
 * checkpoint item, not a settled decision.
 *
 * What the plate is allowed to be is fixed by §3.1's own line — "each type
 * has its own icon and colour" — so HUE CARRIES DATA here: one cover per
 * document type, five covers, and the scene's whole point is that the
 * filtered library opens as four cards of ONE hue and clearing the filter
 * floods the other four hues in. Decoration would not survive the project's
 * accent rule; data does (Session 8 rule reversal — inside the product
 * window colour may carry data).
 *
 * MOTION — ONE TASK, NOT A TOUR OF THE BUTTONS. The surface opens on a
 * library that is ALREADY FILTERED: the type filter reads "Sales Playbook"
 * and the only documents on screen are the four playbooks. Someone then
 * clears the filter with the product's own control — pointer to the filter,
 * the select opens on the real taxonomy, "All Types" is clicked, the tick
 * moves, the menu closes, the label writes back — and THE GRID ANSWERS: it
 * dims for a beat while it recomputes, then the other four documents resolve
 * into the empty row one after another, 200ms apart, so the library ends
 * full and every one of the five types is on screen. The pointer then reads
 * two of the documents that just arrived and leaves at 5.8s of the 6.6s
 * hold. Nothing loops; once the pointer is gone the surface is completely
 * still and contributes zero to the ambient census. Below lg — where the
 * product does not render a filter control at all — the surface tells the
 * simpler true story instead (see `narrow`).
 *
 * The end state is the honest result of that interaction and it is what the
 * markup ships: filter = "All Types", eight cards, all five types visible.
 * `rewind()` is what builds the "before" (filtered), so a reduced-motion
 * visitor and a visitor who takes the frame over both land on the finished,
 * truthful frame.
 *
 * NOTHING REFLOWS. All eight card slots are always in the layout; the four
 * that the filter excludes are held at `af-in` opacity 0, which moves
 * opacity/transform/filter only. A "filter" here is therefore markup being
 * shown and hidden — never a React re-render, and never a grid that
 * re-measures.
 *
 * TWO KEYS PER HOVERABLE THING, deliberately. `.af-in` and `.af-hoverable`
 * both declare the `transition` shorthand at equal specificity, and
 * `.af-hoverable` is declared later in AppFrame.css — so putting both on one
 * element silently drops the house entrance's opacity + blur tweens. Every
 * card therefore has an OUTER node that owns the entrance (`data-b="doc-N"`,
 * what the beats show) and an INNER node that owns the box, the hover paint
 * and the pointer (`data-b="doc-N-hit"`, what `pointTo` lands on).
 * ===================================================================== */

/* ---------- the five real document types --------------------------- */

type DocType =
  | 'Ideal Customer Profile'
  | 'Organizational Structure'
  | 'Product & Pricing Guide'
  | 'Qualifying Questions'
  | 'Sales Playbook'

/** Icon + cover per type.
 *
 *  THE COVER FAMILY — five hues, no invented colour, nothing hand-mixed.
 *  Every gradient stop is an owned token taken from the DEEP end of an owned
 *  ramp (800/900/1000), which is what makes the five read as one family
 *  rather than five brands. The intermediate hues are not new colours: they
 *  are the pixels a gradient walks THROUGH between two owned stops.
 *
 *  All five sweep the SAME two accent stops (accent-800 → accent-1000) and
 *  are separated only by how far that sweep LEANS toward one other owned
 *  hue — won for the teal side, risk for the violet side. The spec and the
 *  measured mix values live with the CSS in `KB_CSS` below (`.kb-t--*`);
 *  this note deliberately does not restate them, because the two used to
 *  disagree. Ordered teal-blue → blue → indigo → indigo(light) → violet,
 *  which is the grid's own reading order, so adjacent cards are neighbours
 *  on the ramp — the user's "different colour for each card but not too
 *  separate". Sales Playbook holds the brand hue undiluted because it is
 *  the filter's opening value: the library opens as one indigo block and
 *  the other four leans arrive.
 *
 *  NO NEUTRALS, AND NO YELLOW-GREEN. The gray ramp is deliberately absent
 *  (a flat near-black neutral is banned as a ground). The yellow-green ramp
 *  this family once used is absent too, and was already gone from the CSS
 *  before the 2026-07-27 colour sweep: at 900/1000 that hue reads as brown
 *  beside four indigos, which is a jump, not a lean. Signal blue is not
 *  used here either — it would be a sixth near-accent hue on a plate whose
 *  whole point is that the five are one family. */
const TYPE_STYLE: Record<DocType, { icon: LucideIcon; tone: string }> = {
  'Sales Playbook': { icon: BookOpen, tone: 'kb-t--playbook' },
  'Ideal Customer Profile': { icon: Users, tone: 'kb-t--icp' },
  'Product & Pricing Guide': { icon: Tag, tone: 'kb-t--pricing' },
  'Qualifying Questions': { icon: CircleHelp, tone: 'kb-t--questions' },
  'Organizational Structure': { icon: Network, tone: 'kb-t--org' },
}

/* ---------- the cover plate ----------------------------------------
 * Co-located because it is this surface's own idiom and nothing else in the
 * frame has one; AppFrame.css stays the shared vocabulary. Everything here
 * is STATIC PAINT — five background layers, no animation, no canvas, no
 * per-frame work — because this surface lives inside a hero that holds a
 * 0-frames-over-25ms scroll gate.
 *
 * Layer order, top to bottom (ref-02: deep ground, soft diagonal light
 * streaks, a glow, visible fine grain, white type):
 *   1 grain    — one shared SVG turbulence tile, 96px, declared ONCE and
 *                reused by all eight covers, so it decodes once.
 *   2 scrim    — ink, bottom-up. The document name sits on it, so its
 *                contrast is guaranteed by construction on every hue rather
 *                than by luck on the lightest one.
 *   3 beams    — three light bands of unequal width and strength at ~112°,
 *                i.e. ~22° off vertical, the ref's angle. NOT a repeating
 *                gradient: a repeat put the identical stripe in the identical
 *                place on all eight covers and the grid read as wallpaper
 *                rather than as eight lit surfaces.
 *   4 glow     — upper-left-ish, where the chain's darkest stop lands.
 *   5 ground   — the type's own two owned stops, ~142°.
 *
 * ONE HUE PER TYPE, ONE LIGHT PER CARD. Hue is data and may not vary inside
 * a type — the four Sales Playbooks have to be one colour or the filter beat
 * stops meaning anything. So the four are separated by their LIGHTING
 * instead: `--kb-spin` turns every angled layer and `--kb-ox` moves the glow,
 * per card, from a four-entry table. Same pigment, different light — which is
 * also the honest answer to "different colour for each card, but not too
 * separate": the type is the colour, the card is the copy of it.
 *
 * Every non-token value here is a geometry or an alpha; every COLOUR is a
 * token, reached through `color-mix` rather than written down. */
const KB_CSS = `
.kb-cover{
  --kb-grain:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cfilter id='kbg'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='96' height='96' filter='url(%23kbg)' opacity='0.26'/%3E%3C/svg%3E");
  position:relative;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  border-radius:var(--radius-tile);
  /* Per-card hue walk. The type sets the pigment; this turns it a few degrees
     so no two cards in the grid are the same colour — the four Sales Playbooks
     are one type and were rendering as four identical tiles. Small angles
     (±18°) keep every cover inside the blue→violet band, and the light layers
     are achromatic so only the ground turns. */
  filter:hue-rotate(var(--kb-hue, 0deg));
  background-color:var(--kb-b);
  background-image:
    var(--kb-grain),
    linear-gradient(to top,
      color-mix(in srgb, var(--color-ink) 42%, transparent) 0%,
      transparent 66%),
    linear-gradient(calc(112deg + var(--kb-spin, 0deg)),
      transparent 0%, transparent 9%,
      color-mix(in srgb, var(--color-surface-100) 19%, transparent) 19%,
      transparent 29%, transparent 44%,
      color-mix(in srgb, var(--color-surface-100) 9%, transparent) 50%,
      transparent 57%, transparent 71%,
      color-mix(in srgb, var(--color-surface-100) 15%, transparent) 80%,
      transparent 91%),
    radial-gradient(130% 125% at var(--kb-ox, 14%) -14%,
      color-mix(in srgb, var(--color-surface-100) 22%, transparent) 0%,
      transparent 62%),
    linear-gradient(
      color-mix(in srgb, var(--color-accent-1000) 30%, transparent),
      color-mix(in srgb, var(--color-accent-1000) 30%, transparent)),
    linear-gradient(calc(142deg + var(--kb-spin, 0deg)), var(--kb-a) 0%, var(--kb-b) 100%);
  background-size:96px 96px, auto, auto, auto, auto, auto;
  background-repeat:repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat;
}
/* the same ground at 18px, for the filter menu — so the menu names the
   colours the grid is about to show, instead of a second colour language */
.kb-chip{
  background-image:linear-gradient(142deg, var(--kb-a) 0%, var(--kb-b) 100%);
}
/* Five hues, one band. The ref the user gave (design-assets/refs/session10/
   kb-cards/ref-02-gradient-closeup.png) is a saturated blue lit diagonally —
   so every type now sweeps between two stops of the ACCENT ramp, and the type
   is separated by leaning that sweep a measured amount toward another owned
   hue (won for the teal side, risk for the violet side) rather than by
   landing on that hue. The yellow-green stops this family used to carry are
   gone: at 900/1000 that hue read as brown beside four indigos —
   "different colour for each card but not too separate" is a lean, not a
   jump. Light stop is
   accent-800, not -900: -900 against -1000 was a 12-step sweep and read flat.
   Ordered teal-blue → blue → indigo → indigo(light) → violet. */
.kb-t--pricing  { --kb-a:color-mix(in oklab, var(--color-accent-800) 54%, var(--color-won-900));
                  --kb-b:color-mix(in oklab, var(--color-accent-1000) 70%, var(--color-won-900)); }
.kb-t--icp      { --kb-a:color-mix(in oklab, var(--color-accent-800) 78%, var(--color-won-900));
                  --kb-b:color-mix(in oklab, var(--color-accent-1000) 86%, var(--color-won-900)); }
.kb-t--playbook { --kb-a:var(--color-accent-800);  --kb-b:var(--color-accent-1000); }
.kb-t--questions{ --kb-a:color-mix(in oklab, var(--color-accent-800) 76%, var(--color-risk-900));
                  --kb-b:color-mix(in oklab, var(--color-accent-1000) 86%, var(--color-risk-900)); }
.kb-t--org      { --kb-a:color-mix(in oklab, var(--color-accent-800) 68%, var(--color-risk-900));
                  --kb-b:color-mix(in oklab, var(--color-accent-1000) 82%, var(--color-risk-900)); }

/* On the plate, the only ink available is the surface token — so the two
   chips read as glass rather than as a second palette. */
.kb-badge{
  color:var(--color-surface-100);
  background-color:color-mix(in srgb, var(--color-ink) 30%, transparent);
  border:1px solid color-mix(in srgb, var(--color-surface-100) 24%, transparent);
}
.kb-mark{ color:color-mix(in srgb, var(--color-surface-100) 82%, transparent); }
.kb-name{ color:var(--color-surface-100); }
`

/** One light per card. Hue belongs to the TYPE and may not vary inside it —
 *  four Sales Playbooks in four colours would make the filter beat meaningless
 *  — so the four are told apart by where the light falls instead: the angled
 *  layers turn, and the glow slides along the top edge. Indexed by position in
 *  the grid, so the repetition never lines up in a row. Pure geometry: no
 *  colour is involved, and nothing here animates. */
const LIGHT: { spin: string; ox: string; hue: string }[] = [
  { spin: '0deg', ox: '14%', hue: '-18deg' },
  { spin: '19deg', ox: '34%', hue: '-6deg' },
  { spin: '-15deg', ox: '4%', hue: '8deg' },
  { spin: '31deg', ox: '23%', hue: '20deg' },
]

/** The select's option list: the documented default, then the taxonomy in
 *  the order PRODUCT-NOTES §3.1 lists it (alphabetical). No new strings. */
const MENU_TYPES: DocType[] = [
  'Ideal Customer Profile',
  'Organizational Structure',
  'Product & Pricing Guide',
  'Qualifying Questions',
  'Sales Playbook',
]

/** The value the library opens filtered by, and the value it is cleared to. */
const FILTERED = 'Sales Playbook'
const UNFILTERED = 'All Types'

/* ---------- the library -------------------------------------------
 * ORDER IS LOAD-BEARING, twice over.
 *
 * 1 · The grid fills in DOM order, so the four Sales Playbooks are the
 *     first four entries: filtered, they are exactly the top row and the
 *     second row is empty; cleared, the other four drop in underneath and
 *     nothing that was already on screen moves. (That is also the honest
 *     sort — "Updated" descending, and the playbooks are the four most
 *     recently touched documents.)
 * 2 · `from` is the breakpoint a card first appears at: narrow frames drop
 *     the tail of the grid rather than squashing eight cards into it. The
 *     gating is interleaved so the "filtered → cleared" story survives every
 *     width — at each one, half the visible slots are playbooks (row 1) and
 *     half are the documents the filter was hiding (row 2):
 *       phone  1-across × 2 = 1 playbook  + 1 other
 *       sm/md  2-across × 2 = 2 playbooks + 2 others
 *       lg     4-across × 2 = 4 playbooks + 4 others
 */
const DOCS: {
  name: string
  type: DocType
  visibility: 'Public' | 'Private'
  updated: string
  from?: 'sm' | 'lg'
}[] = [
  {
    name: 'Sales playbook — 2026',
    type: 'Sales Playbook',
    visibility: 'Public',
    updated: 'Updated 2 days ago',
  },
  {
    name: 'Enterprise playbook',
    type: 'Sales Playbook',
    visibility: 'Private',
    updated: 'Updated 3 days ago',
    from: 'sm',
  },
  {
    name: 'Mid-market playbook',
    type: 'Sales Playbook',
    visibility: 'Public',
    updated: 'Updated 4 days ago',
    from: 'lg',
  },
  {
    name: 'EMEA playbook',
    type: 'Sales Playbook',
    visibility: 'Public',
    updated: 'Updated 5 days ago',
    from: 'lg',
  },
  {
    name: 'Mid-market ICP',
    type: 'Ideal Customer Profile',
    visibility: 'Public',
    updated: 'Updated 6 days ago',
  },
  {
    name: 'Product & pricing guide',
    type: 'Product & Pricing Guide',
    visibility: 'Public',
    updated: 'Updated 1 week ago',
    from: 'sm',
  },
  {
    name: 'Discovery questions',
    type: 'Qualifying Questions',
    visibility: 'Public',
    updated: 'Updated 2 weeks ago',
    from: 'lg',
  },
  {
    name: 'Who owns what',
    type: 'Organizational Structure',
    visibility: 'Private',
    updated: 'Updated 3 weeks ago',
    from: 'lg',
  },
]

/** Indices the "Sales Playbook" filter keeps, and the ones it excludes. */
const KEPT = DOCS.reduce<number[]>((a, d, i) => (d.type === FILTERED ? [...a, i] : a), [])
const EXCLUDED = DOCS.reduce<number[]>((a, d, i) => (d.type === FILTERED ? a : [...a, i]), [])

/* ---------- surface ------------------------------------------------ */

function KbPane() {
  return (
    <>
      {/* This surface's own idiom, kept with it. Rendered once — the frame
          mounts every pane exactly once — and it declares only static paint. */}
      <style>{KB_CSS}</style>

      <PaneHead title="Knowledge Base" note="Manage your sales materials" />

      <div className="flex min-h-0 flex-1 flex-col bg-surface-200 p-5 lg:p-8">
        {/* "All Documents" + the real toolbar, one row, exactly as t-008 */}
        <div className="flex shrink-0 items-center gap-3 border-b border-hairline-2 pb-2.5 lg:pb-3">
          <span className="shrink-0 text-[12.5px] font-[550] text-gray-800 lg:text-[13px]">
            All Documents
          </span>

          {/* Real controls, so they answer a real pointer: each one carries
              `af-hoverable` and the frame's central 50ms-in / 300ms-out hover
              paint. None of them writes its own hover CSS. */}
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <span
              data-b="search"
              className="af-hoverable flex min-w-0 items-center gap-2 rounded-input border border-hairline-2 bg-surface-100 px-2.5 py-1.5 text-gray-500"
            >
              <Search size={14} strokeWidth={1.5} className="shrink-0" />
              <span className="w-[112px] truncate text-[12px] lg:w-[168px] lg:text-[12.5px]">
                Search documents…
              </span>
            </span>

            {/* The type filter and the menu it opens. The wrapper is the
                positioning context, so the menu can never lay the toolbar
                out; the label has a floor width so writing the longer value
                into it cannot shuffle the controls beside it. */}
            <span className="relative hidden shrink-0 lg:block">
              <span
                data-b="filter"
                className="af-hoverable flex items-center gap-1.5 rounded-input border border-hairline-2 bg-surface-100 px-2.5 py-1.5 text-[12.5px] text-gray-700"
              >
                <span
                  data-b="filter-label"
                  className="inline-block min-w-[92px] text-left whitespace-nowrap"
                >
                  {UNFILTERED}
                </span>
                <ChevronDown size={13} strokeWidth={1.5} className="text-gray-500" />
              </span>

              {/* The open select. Closed in the settled frame (no `is-shown`),
                  so this is invisible to a reduced-motion visitor and to
                  anyone who takes the frame over. `pointer-events-none`
                  throughout: it is the simulated pointer's target, never a
                  real one, and it must not shadow the cards underneath it. */}
              <span
                data-b="menu"
                aria-hidden
                className="af-in pointer-events-none absolute top-[calc(100%+6px)] right-0 z-10 flex w-[204px] flex-col rounded-[10px] border border-hairline-2 bg-surface-100 p-1 shadow-float"
              >
                <span
                  data-b="opt-all"
                  className="af-hoverable flex items-center gap-2 rounded-micro border border-transparent px-2 py-[5px] text-[12px] text-gray-800"
                >
                  <span aria-hidden className="size-[18px] shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{UNFILTERED}</span>
                  <Check
                    data-b="tick-all"
                    size={12}
                    strokeWidth={2}
                    className="af-in is-shown shrink-0 text-ink"
                  />
                </span>

                <span aria-hidden className="my-1 h-px shrink-0 bg-hairline-2" />

                {MENU_TYPES.map((t) => {
                  const { icon: Icon, tone } = TYPE_STYLE[t]
                  const sel = t === FILTERED
                  return (
                    <span
                      key={t}
                      data-b={sel ? 'opt-play' : undefined}
                      className="af-hoverable flex items-center gap-2 rounded-micro border border-transparent px-2 py-[5px] text-[12px] text-gray-800"
                    >
                      <span
                        aria-hidden
                        className={`kb-chip ${tone} kb-name flex size-[18px] shrink-0 items-center justify-center rounded-micro`}
                      >
                        <Icon size={11} strokeWidth={1.5} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{t}</span>
                      {sel ? (
                        <Check
                          data-b="tick-play"
                          size={12}
                          strokeWidth={2}
                          className="af-in shrink-0 text-ink"
                        />
                      ) : null}
                    </span>
                  )
                })}
              </span>
            </span>

            {/* list / grid view toggle — grid is the view we are showing */}
            <span
              data-b="view"
              className="af-hoverable hidden shrink-0 items-center overflow-hidden rounded-input border border-hairline-2 bg-surface-100 sm:flex"
            >
              <span className="flex size-[26px] items-center justify-center text-gray-500">
                <List size={13} strokeWidth={1.5} />
              </span>
              <span className="flex size-[26px] items-center justify-center bg-surface-300 text-ink">
                <LayoutGrid size={13} strokeWidth={1.5} />
              </span>
            </span>
          </div>
        </div>

        {/* The grid — exactly two rows at every width, and always two rows:
            the filtered view empties the second one, it never removes it.
            The transition is what the "recomputing" beat rides on. */}
        <div
          data-b="grid"
          className="mt-3 grid min-h-0 flex-1 grid-cols-1 grid-rows-2 gap-2.5 transition-[opacity,filter] duration-[220ms] sm:grid-cols-2 lg:mt-4 lg:grid-cols-4 lg:gap-3"
        >
          {DOCS.map(({ name, type, visibility, updated, from }, i) => {
            const { icon: Icon, tone } = TYPE_STYLE[type]
            return (
              // outer node = the entrance only (see the two-keys note above)
              <div
                key={name}
                data-b={`doc-${i}`}
                className={`af-in is-shown min-h-0 min-w-0 ${showFrom(from)}`}
              >
                <article
                  data-b={`doc-${i}-hit`}
                  className="af-hoverable af-lift flex min-h-0 min-w-0 flex-1 flex-col rounded-[10px] border border-hairline-2 bg-surface-100 p-2 lg:p-2.5"
                >
                  {/* THE COVER. Inset inside the card's own padding rather than
                      bled to its edges: the white gutter is what keeps eight of
                      these from reading as a wall of dark tiles inside a white
                      product frame, and it is also what the reference does.
                      Height is a BAND, not a full tile, for the same reason —
                      see the note on the grid below. */}
                  <div
                    className={`kb-cover ${tone} max-h-[76px] min-h-[56px] flex-1 p-2.5 sm:max-h-[112px] sm:min-h-[64px] lg:max-h-[128px] lg:min-h-[88px] lg:p-3.5`}
                    style={
                      {
                        '--kb-spin': LIGHT[i % LIGHT.length].spin,
                        '--kb-ox': LIGHT[i % LIGHT.length].ox,
                        '--kb-hue': LIGHT[i % LIGHT.length].hue,
                      } as CSSProperties
                    }
                  >
                    <div className="flex shrink-0 items-start justify-between gap-2">
                      <span aria-hidden className="kb-mark shrink-0">
                        <Icon size={14} strokeWidth={1.5} className="lg:hidden" />
                        <Icon size={16} strokeWidth={1.5} className="hidden lg:block" />
                      </span>
                      <span className="kb-badge shrink-0 rounded-micro px-1.5 py-px text-[9px] font-[550] tracking-[0.1em] uppercase lg:text-[9.5px]">
                        {visibility}
                      </span>
                    </div>

                    {/* The document's own name, set on its cover — the ref's
                        one borrowed move. `mt-auto` drops it onto the ink
                        scrim, which is where its contrast comes from. */}
                    <h4 className="kb-name mt-auto line-clamp-2 pt-2 text-[12.5px] leading-[1.3] font-[550] tracking-[-0.01em] lg:text-[14px]">
                      {name}
                    </h4>
                  </div>

                  {/* Below the plate, the product's own metadata, unchanged in
                      substance: type caption, timestamp, and the two real
                      actions. The name is not repeated here — it is on the
                      cover, exactly as the reference sets it. The metadata
                      block is shrink-0 and the COVER is the flexible element
                      (clamped 88–128px at lg): the grid's surplus/deficit is
                      absorbed by the plate, never by collapsing the text — a
                      height-starved flex column was crushing "Updated …" to
                      0px and stranding the action icons under an empty band.
                      The two actions sit inline, right of the metadata (below
                      lg they stay dropped, per the frame's drop-the-tail
                      idiom): one row, no orphaned icon strip. */}
                  <div className="mt-auto flex shrink-0 items-center gap-1 px-1 pt-2.5 lg:px-1.5 lg:pt-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-[550] text-ink lg:text-[12.5px]">
                        {type}
                      </p>
                      <p className="mt-0.5 truncate text-[10.5px] text-gray-500 lg:text-[11px]">
                        {updated}
                      </p>
                    </div>
                    <span
                      data-b={`doc-${i}-edit`}
                      className="af-hoverable hidden shrink-0 items-center justify-center rounded-micro border border-transparent p-1 text-gray-500 lg:flex"
                    >
                      <Pencil size={13} strokeWidth={1.5} />
                    </span>
                    <span
                      data-b={`doc-${i}-del`}
                      className="af-hoverable hidden shrink-0 items-center justify-center rounded-micro border border-transparent p-1 text-risk-900 lg:flex"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </span>
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

/* ---------- the surface's own state writes -------------------------- */

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Below lg the type filter is not rendered at all, and neither is the menu
 *  it opens — so a "filtered" opening frame at those widths would be a
 *  library mysteriously showing one card, with no control on screen to
 *  explain it and no pointer to blame. There, the surface tells the simpler
 *  true story instead: the whole library arrives, in DOM order.
 *
 *  Measured once per turn, in `rewind()` — the pane is laid out behind the
 *  crossfade by then, so the filter's box is real. Module-level because the
 *  module is a singleton and beats may not hold React state. */
let narrow = false

/** Write the filter control's value. `applied` inks the label, which is how
 *  a real filter shows it is doing something. */
const setFilter = (root: HTMLElement, label: string, applied: boolean) => {
  const el = q(root, 'filter-label')
  if (!el) return
  text(el, label)
  el.classList.toggle('text-ink', applied)
}

/** Move the select's tick between the two options it ever sits on. */
const setTick = (root: HTMLElement, on: 'all' | 'play') => {
  show(q(root, on === 'all' ? 'tick-all' : 'tick-play'))
  hide(q(root, on === 'all' ? 'tick-play' : 'tick-all'))
}

/** The grid recomputing. Opacity + a house-grain blur, transform-free, on the
 *  container — so a filter being applied costs one composited layer and no
 *  layout. Skipped outright under reduced motion, where the surface is a
 *  still frame and a flash would be exactly the unrequested motion that mode
 *  exists to remove. */
const recompute = (root: HTMLElement) => {
  const g = q(root, 'grid')
  if (!g || narrow || prefersReduced()) return
  g.style.opacity = '0.55'
  g.style.filter = 'blur(1.5px)'
}

const resolved = (root: HTMLElement) => {
  const g = q(root, 'grid')
  if (!g) return
  g.style.opacity = ''
  g.style.filter = ''
}

/* ---------- module ------------------------------------------------- */

/** ONE task: a filtered library being cleared, and the grid answering.
 *
 *  1 · 0.2–0.8s — the four Sales Playbooks arrive in DOM order, 200ms apart.
 *      200, not 70: the frame's clock is a 200ms interval, so any two beats
 *      closer than that fire on the same tick and the cascade collapses into
 *      a group fade. `af-in` is a CSS transition, so adding the class is the
 *      whole animation and no beat ever touches React.
 *  2 · 1.2–1.8s — the pointer reaches the type filter and presses it; the
 *      select opens on the real taxonomy, and the control stays lit while its
 *      menu is open (`pointTo` clears every hover state, so the filter's is
 *      re-lit by hand — an open select does not look idle).
 *  3 · 2.2–3.0s — the pointer walks up to "All Types" and clicks: the tick
 *      moves, the menu closes, the label writes back and un-inks.
 *  4 · 3.0–4.0s — THE GRID ANSWERS. It dims and blurs for 400ms while it
 *      recomputes, then the four excluded documents resolve into the empty
 *      row one after another, 200ms apart. The library ends full, with all
 *      five document types on screen.
 *  5 · 4.4–5.8s — the pointer reads two of the documents that just arrived,
 *      then leaves, 800ms before the surface hands over.
 *
 *  Cards a width has dropped are simply never pointed at (`pointTo` no-ops on
 *  a zero-size target). Below lg the filter and its menu are not rendered at
 *  all, so beats 2–4 no-op and the surface falls back to the honest simple
 *  version of itself: the whole library arriving in DOM order (see `narrow`).
 *  A filtered opening frame at a width with no filter control on screen would
 *  just be a library inexplicably showing one card. */
const SCRIPT: Beat[] = [
  /* The arrival, in DOM order, 200ms apart. Wide: only the four the filter
     keeps — the rest of the row is what the interaction brings back. Narrow:
     everything, because there is no filter control at those widths to have
     applied one. */
  ...DOCS.map((_, i) => ({
    at: 200 + i * 200,
    run: (root: HTMLElement) => {
      if (narrow || KEPT.includes(i)) show(q(root, `doc-${i}`))
    },
  })),
  /* Using the filter. Every one of these is skipped outright at a width that
     does not render the control — a press on an unrendered select would
     otherwise leave real `is-press` / `is-shown` state behind for a menu
     nobody can see. */
  { at: 1200, run: (root: HTMLElement) => !narrow && pointTo(root, 'filter', 0.5, 0.5) },
  {
    at: 1600,
    run: (root: HTMLElement) => {
      if (narrow) return
      pressOn(root, 'filter')
      show(q(root, 'menu'))
    },
  },
  { at: 1800, run: (root: HTMLElement) => !narrow && releaseOn(root, 'filter') },
  {
    at: 2200,
    run: (root: HTMLElement) => {
      if (narrow) return
      pointTo(root, 'opt-all', 0.5, 0.5)
      q(root, 'filter')?.classList.add('is-hover')
    },
  },
  { at: 2800, run: (root: HTMLElement) => !narrow && pressOn(root, 'opt-all') },
  {
    at: 3000,
    run: (root: HTMLElement) => {
      if (narrow) return
      releaseOn(root, 'opt-all')
      setTick(root, 'all')
      hide(q(root, 'menu'))
      setFilter(root, UNFILTERED, false)
      q(root, 'filter')?.classList.remove('is-hover')
      recompute(root)
    },
  },
  ...EXCLUDED.map((d, i) => ({
    at: 3400 + i * 200,
    run: (root: HTMLElement) => {
      if (i === 0) resolved(root)
      show(q(root, `doc-${d}`))
    },
  })),
  { at: 4400, run: (root: HTMLElement) => pointTo(root, `doc-${EXCLUDED[0]}-hit`, 0.5, 0.42) },
  { at: 5000, run: (root: HTMLElement) => pointTo(root, `doc-${EXCLUDED[1]}-hit`, 0.5, 0.42) },
  { at: 5800, run: (root: HTMLElement) => hidePointer(root) },
]

/** The frame walks `beats` in array order — a beat whose `at` sits behind an
 *  earlier entry would simply never fire on time — so the script is sorted. */
const beats: Beat[] = [...SCRIPT].sort((a, b) => a.at - b.at)

const KnowledgeBase: PaneModule = {
  name: 'Knowledge Base',
  breadcrumb: 'Knowledge Base',
  actions: [{ label: '+ Create Document', primary: true }],
  hold: 6600,
  Pane: KbPane,
  beats,
  /** The "before": the library as someone left it, filtered to their
   *  playbooks. Every card is hidden because the kept four still have to
   *  arrive; the excluded four are what the interaction brings back. */
  rewind: (root) => {
    // The filter has no box below lg, so there is no filter story to tell.
    narrow = !q(root, 'filter')?.getBoundingClientRect().width
    DOCS.forEach((_, i) => hide(q(root, `doc-${i}`)))
    hide(q(root, 'menu'))
    setTick(root, narrow ? 'all' : 'play')
    setFilter(root, narrow ? UNFILTERED : FILTERED, !narrow)
    resolved(root)
    hidePointer(root)
  },
  /** The finished, truthful frame — identical to the markup: filter cleared,
   *  all eight documents, all five types, menu closed, nothing hovered. */
  settle: (root) => {
    DOCS.forEach((_, i) => show(q(root, `doc-${i}`)))
    hide(q(root, 'menu'))
    setTick(root, 'all')
    setFilter(root, UNFILTERED, false)
    resolved(root)
    hidePointer(root)
  },
}

export default KnowledgeBase
