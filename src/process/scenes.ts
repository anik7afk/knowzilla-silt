/* ---------------------------------------------------------------------------
 * The scene registry for /process — every standalone route the app already wires.
 *
 * Curated registry of the routes retained for the final process gallery.
 *
 * The shell consumes only `SCENES.length` (the count beside the Components entry
 * in the sidebar, and one figure in the Overview ledger). The rest of the shape —
 * `url`, `note`, `group`, and the `component:<slug>` id convention — is here for
 * whoever builds the §Components chapter: `url` is ready to iframe, and
 * `/stage?c=<slug>&bare=1` renders the stage WITHOUT that page's own 48px
 * toolbar (a param added to StageGallery.tsx on 2026-07-29 for exactly this).
 *
 * WHY THIS LIST IS SEPARATE FROM `StageGallery`'s `STAGES`. That array pairs each
 * slug with a live `ComponentType`, so importing it would pull the entire scene
 * graph — Hero, KineticConversation, every pane and every variant — into the
 * /process chunk for the sake of two strings per row. This file carries only the
 * strings. The cost is that a slug renamed in StageGallery.tsx must be renamed
 * here too; the `url` is the single point of drift and a dead one shows up
 * immediately as a 404 poster in the gallery.
 *
 * `url` prefers a real standalone route where the app has one (those render the
 * bare scene). Everything else goes through the stage gallery with `bare=1`,
 * which suppresses that page's own 48px toolbar so the poster is the scene and
 * nothing else.
 * ------------------------------------------------------------------------- */

export type Scene = {
  /** Stable id for the cut list — `component:<slug>`. */
  slug: string
  label: string
  group: string
  url: string
  /** One-line anatomy note: what the thing is made of, not what it claims. */
  note: string
}

const stage = (slug: string) => `/stage?c=${slug}&bare=1`

export const SCENES: Scene[] = [
  /* ——— the assembled page ——— */
  {
    slug: 'landing-page',
    label: 'The landing page, assembled',
    group: 'Whole pages',
    url: '/',
    note: 'Ten sections on one dotted desk: a white sheet carrying Hero + Strip + Kinetic, then HVU climbing over its pinned tail, then chapters, proof, outcome, close.',
  },
  {
    slug: 'pricing-page',
    label: 'Pricing page',
    group: 'Whole pages',
    url: '/pricing',
    note: 'Off the landing page on purpose: four flat cards, Nav and Footer, its own route.',
  },
  {
    slug: 'not-found',
    label: '404',
    group: 'Whole pages',
    url: '/404',
    note: 'The one page where the mascot is the subject — the lying pose, width-driven, on an otherwise empty measure.',
  },

  /* ——— sections exactly as the page renders them ——— */
  {
    slug: 'hero-h3',
    label: 'Hero (as shipped)',
    group: 'Page sections',
    url: stage('hero-h3'),
    note: 'Text ladder over a sticky product window: curtain dissolve, wallpaper bed, 0.95 step-back on scroll, consumable side rails, a looping ~44s tour of five panes.',
  },
  {
    slug: 'integrations-strip',
    label: 'Integrations strip',
    group: 'Page sections',
    url: stage('integrations-strip'),
    note: 'Full-bleed logo row, entrance staggered 120ms per item — the blur resolves inside a held grayscale, so the marks never gain colour.',
  },
  {
    slug: 'hvu-flow',
    label: 'Heard vs Understood (page cut)',
    group: 'Page sections',
    url: stage('hvu-flow'),
    note: 'The rationed BEAT variant of the full scene: raw stream on the left at 55ms per word, the resolved line on the right at 70ms out of a deeper blur.',
  },
  {
    slug: 'stats',
    label: 'Stats',
    group: 'Page sections',
    url: stage('stats'),
    note: 'Count-ups written straight to textContent from one rAF loop, beside a route drawn on a normalised pathLength so the 900ms is geometry-independent.',
  },
  {
    slug: 'testimonials',
    label: 'Testimonials',
    group: 'Page sections',
    url: stage('testimonials'),
    note: 'The page’s one sanctioned brand-fill exception: full-bleed brand-colour cards on white.',
  },
  {
    slug: 'closing-cta',
    label: 'Closing CTA',
    group: 'Page sections',
    url: stage('closing-cta'),
    note: 'One line of display type inside 120/240px of vertical silence, over a masked 16px dot field with print register ticks at the corners.',
  },

  /* ——— the hero's product windows, staged one at a time ——— */
  {
    slug: 'win-knowledge-base',
    label: 'Window · Knowledge Base',
    group: 'Product windows',
    url: stage('win-knowledge-base'),
    note: 'Real window chrome on the shipped wallpaper bed; the pane replays its own beat list on mount.',
  },
  {
    slug: 'win-playground',
    label: 'Window · Playground',
    group: 'Product windows',
    url: stage('win-playground'),
    note: 'Same chrome, same bed, different pane module — each one ships settled markup plus a rewind and a beat list.',
  },
  {
    slug: 'win-cold-calls',
    label: 'Window · Cold Calls',
    group: 'Product windows',
    url: stage('win-cold-calls'),
    note: 'Pane module three of five, staged standalone at the hero’s own frame width.',
  },
  {
    slug: 'win-deal-rooms',
    label: 'Window · Deal Rooms',
    group: 'Product windows',
    url: stage('win-deal-rooms'),
    note: 'Pane module four of five — the one the Live Suggestion / Next Step content was verified against.',
  },

  /* ——— full standalone scenes (several cut from the flow, all kept whole) ——— */
  {
    slug: 'kinetic-conversation',
    label: 'Kinetic Conversation',
    group: 'Full scenes',
    url: '/kinetic-conversation',
    note: 'FROZEN. Hybrid drive: scroll owns only the entrance (card opens mid-grown at 0.42, complete at half the track), then the performance plays on its own clock.',
  },
  {
    slug: 'heard-vs-understood',
    label: 'Heard vs Understood (full scene)',
    group: 'Full scenes',
    url: '/heard-vs-understood',
    note: 'The evolved full scene: a continuously live signal waveform, stronger word choreography, one physical stage.',
  },
  {
    slug: 'hvu-glass',
    label: 'Heard vs Understood · iOS glass',
    group: 'Full scenes',
    url: '/hvu-glass',
    note: 'The glass treatment that took the HVU slot on the page — same argument, re-scaled onto the page’s type ladder.',
  },
  {
    slug: 'objection-anatomy',
    label: 'Objection Anatomy (full scene)',
    group: 'Full scenes',
    url: '/objection-anatomy',
    note: 'A sentence taken apart into its parts, four groups entering at 140ms steps and then latching so scrolling back does not replay.',
  },
  {
    slug: 'oa-quiet',
    label: 'Objection Anatomy (page cut)',
    group: 'Full scenes',
    url: stage('oa-quiet'),
    note: 'The rationed variant the page used to ship — the same scene with the motion taken down to entrance only.',
  },
  {
    slug: 'objection-library',
    label: 'Objection Library (full scene)',
    group: 'Full scenes',
    url: '/objection-library',
    note: 'The post-call record as a tabbed set; the one QUIET section allowed an auto-advance.',
  },
  {
    slug: 'ol-quiet',
    label: 'Objection Library (page cut)',
    group: 'Full scenes',
    url: stage('ol-quiet'),
    note: 'The demoted variant, kept so the cut stays a decision that can be re-read.',
  },
  {
    slug: 'shared-truth',
    label: 'Shared Truth (full scene)',
    group: 'Full scenes',
    url: '/shared-truth',
    note: 'The team-wide view as a line drawing — a schematic idiom holder, absorbed by the chapters section in the 2026-07-27 cuts.',
  },
  {
    slug: 'st-quiet',
    label: 'Shared Truth (page cut)',
    group: 'Full scenes',
    url: stage('st-quiet'),
    note: 'Same scene, entrance-only motion.',
  },
  {
    slug: 'sentence-history',
    label: 'Sentence History',
    group: 'Full scenes',
    url: '/sentence-history',
    note: 'One sentence and everything that produced it, read as an editorial column rather than a UI.',
  },
  {
    slug: 'account-reveals',
    label: 'Account Reveals',
    group: 'Full scenes',
    url: '/account-reveals',
    note: 'Editorial account turns on a 60px/1fr grid, separators bleeding past the measure, groups entering at 160ms steps.',
  },
  {
    slug: 'write-back',
    label: 'Write Back',
    group: 'Full scenes',
    url: '/write-back',
    note: 'Five CRM fields typing themselves once at ~45 characters a second with a hard steps(1,end) caret, then stopping.',
  },
  {
    slug: 'before-after',
    label: 'Before / After',
    group: 'Full scenes',
    url: '/before-after',
    note: 'The shipped variant, now in the page tail so the last number a visitor reads is an outcome rather than a price.',
  },
  {
    slug: 'signal-convergence',
    label: 'Signal Convergence',
    group: 'Full scenes',
    url: '/signal-convergence',
    note: 'Many inputs resolving to one route; the section the signal-blue ramp was introduced for.',
  },

  /* ——— dials & variants kept from the review rounds ——— */
  {
    slug: 'before-after-routed',
    label: 'Before / After · routed',
    group: 'Dials & variants',
    url: stage('before-after-routed'),
    note: 'Alternative one of two, awaiting review: the outcome told as a route rather than a pair.',
  },
  {
    slug: 'before-after-proof-stack',
    label: 'Before / After · proof stack',
    group: 'Dials & variants',
    url: stage('before-after-proof-stack'),
    note: 'Alternative two of two: the same three outcomes stacked as proof under one attributed voice.',
  },
  {
    slug: 'hvu-variations',
    label: 'HVU · five compositions',
    group: 'Dials & variants',
    url: '/hvu-variations',
    note: 'The exploration sheet the HVU direction was picked from — five compositions of one idea, side by side.',
  },
  {
    slug: 'hvu-halo-added',
    label: 'HVU halo · added',
    group: 'Dials & variants',
    url: stage('hvu-halo-added'),
    note: 'Halo dial, position A.',
  },
  {
    slug: 'hvu-halo-as-beat',
    label: 'HVU halo · as beat',
    group: 'Dials & variants',
    url: stage('hvu-halo-as-beat'),
    note: 'Halo dial, position B — the halo promoted from decoration to one of the scene’s beats.',
  },
  {
    slug: 'closing-cta-navy',
    label: 'CTA dot field · navy',
    group: 'Dials & variants',
    url: stage('closing-cta-navy'),
    note: 'Ink dial on the closing dot field.',
  },
  {
    slug: 'closing-cta-lavender',
    label: 'CTA dot field · lavender',
    group: 'Dials & variants',
    url: stage('closing-cta-lavender'),
    note: 'The same field in the interactive accent — the test of whether accent can carry an area at all.',
  },
  {
    slug: 'rails-ink',
    label: 'Hero rails · graphite vs navy',
    group: 'Dials & variants',
    url: stage('rails-ink'),
    note: 'Both inks at the same mid-scene progress on the hero’s own ground, dim and lit states visible together.',
  },
  {
    slug: 'oa-matrix-state',
    label: 'OA matrix · state',
    group: 'Dials & variants',
    url: stage('oa-matrix-state'),
    note: 'Dot-matrix indicator dial: state only.',
  },
  {
    slug: 'oa-matrix-full',
    label: 'OA matrix · full',
    group: 'Dials & variants',
    url: stage('oa-matrix-full'),
    note: 'Dot-matrix indicator dial: the full reference grid.',
  },
  {
    slug: 'st-matrix-state',
    label: 'ST matrix · state',
    group: 'Dials & variants',
    url: stage('st-matrix-state'),
    note: 'The same dial carried onto Shared Truth, state only.',
  },
  {
    slug: 'st-matrix-full',
    label: 'ST matrix · full',
    group: 'Dials & variants',
    url: stage('st-matrix-full'),
    note: 'The same dial carried onto Shared Truth, full reference.',
  },

  /* ——— hero stage fills ——— */
  {
    slug: 'hero-h4-tahoe',
    label: 'Hero fill · Tahoe photo (shipped)',
    group: 'Hero stage fills',
    url: stage('hero-h4-tahoe'),
    note: 'The shipped bed. Five fills, one variable — what the product window is standing on.',
  },
  {
    slug: 'hero-h4-sequoia',
    label: 'Hero fill · Sequoia photo',
    group: 'Hero stage fills',
    url: stage('hero-h4-sequoia'),
    note: 'Photo bed, warmer.',
  },
  {
    slug: 'hero-h4-wallpaper',
    label: 'Hero fill · gradient wallpaper',
    group: 'Hero stage fills',
    url: stage('hero-h4-wallpaper'),
    note: 'Gradient bed — no photograph in the frame at all.',
  },
  {
    slug: 'hero-h4-lavender',
    label: 'Hero fill · lavender',
    group: 'Hero stage fills',
    url: stage('hero-h4-lavender'),
    note: 'The accent as an area, at the one place the rules allow colour to carry data.',
  },
  {
    slug: 'hero-h4-neutral',
    label: 'Hero fill · neutral',
    group: 'Hero stage fills',
    url: stage('hero-h4-neutral'),
    note: 'The null option: tonal step only.',
  },

  /* ——— endgame auditions ——— */
  {
    slug: 'endgame-index',
    label: 'Endgame · the audition sheet',
    group: 'Endgame auditions',
    url: '/endgame',
    note: 'Five candidates for the Stats → Closing CTA stretch, indexed on one page.',
  },
  {
    slug: 'endgame-call-to-record',
    label: 'Endgame · Call to Record',
    group: 'Endgame auditions',
    url: '/endgame/call-to-record',
    note: 'Candidate one: the call becoming the record.',
  },
  {
    slug: 'endgame-shared-truth',
    label: 'Endgame · Shared Deal Truth',
    group: 'Endgame auditions',
    url: '/endgame/shared-truth',
    note: 'Candidate two: one account, every reader.',
  },
  {
    slug: 'endgame-objection-compound',
    label: 'Endgame · Objection Compound',
    group: 'Endgame auditions',
    url: '/endgame/objection-compound',
    note: 'Candidate three: objections compounding rather than resolving one at a time.',
  },
  {
    slug: 'endgame-stack',
    label: 'Endgame · Stack Connected',
    group: 'Endgame auditions',
    url: '/endgame/stack',
    note: 'Candidate four: the stack as the subject.',
  },
  {
    slug: 'endgame-better',
    label: 'Endgame · Better As You Navigate',
    group: 'Endgame auditions',
    url: '/endgame/better',
    note: 'Candidate five: improvement over time as the closing argument.',
  },

  /* ——— labs ——— */
  {
    slug: 'voice-components',
    label: 'Voice component lab',
    group: 'Labs',
    url: '/voice-components',
    note: 'The voice-visual primitives on one bench, each state operable.',
  },
  {
    slug: 'dots',
    label: 'Dot matrices',
    group: 'Labs',
    url: '/dots',
    note: 'The 2×2 and 3×3 indicator grids across four states and three inks — the smallest component in the system.',
  },
  /* PlatformChapters ships in the landing flow with no standalone route and no
   * stage slug, so its two rows deep-link the assembled page instead: the
   * section's own first chapter id, and the `?rail=b` flag it already reads. */
  {
    slug: 'platform-chapters',
    label: 'Platform chapters',
    group: 'Page sections',
    url: '/#knowledge',
    note: 'The deep product read: four surfaces organised by the rep’s job, a sticky rail flipping its active row on scroll. No standalone route — this frame deep-links the assembled page at chapter 01.',
  },
  {
    slug: 'platform-chapters-rail-b',
    label: 'Platform chapters · rail B',
    group: 'Dials & variants',
    url: '/?rail=b#knowledge',
    note: 'Sticky-rail dial: the active row also reveals its one supporting line. Same page, same scroll context — the only honest way to compare two rail grammars.',
  },
]

/** Group names in first-appearance order. */
export const SCENE_GROUPS: string[] = SCENES.reduce<string[]>(
  (acc, s) => (acc.includes(s.group) ? acc : [...acc, s.group]),
  [],
)
