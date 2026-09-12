import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react'
import Hero from './components/Hero'
import Window from './components/mock/Window'
import type { PaneModule } from './components/mock/panes/contract'
import KnowledgeBaseModule from './components/mock/panes/KnowledgeBasePane'
import PlaygroundModule from './components/mock/panes/PlaygroundPane'
import ColdCallsModule from './components/mock/panes/ColdCallsPane'
import DealRoomsModule from './components/mock/panes/DealRoomsPane'
import HeardVsUnderstood from './components/HeardVsUnderstood'
import HvuGlass from './components/HvuGlass'
import SentenceHistory from './components/SentenceHistory'
import AccountReveals from './components/AccountReveals'
import KineticConversation from './components/KineticConversation'
import KineticGlass from './components/KineticGlass'
import BeforeAfter from './components/BeforeAfter'
import BeforeAfterRouted from './components/BeforeAfterRouted'
import BeforeAfterProofStack from './components/BeforeAfterProofStack'
import SharedTruth from './components/SharedTruth'
import SignalConvergence from './components/SignalConvergence'
import ObjectionAnatomy from './components/ObjectionAnatomy'
import ObjectionLibrary from './components/ObjectionLibrary'
import IntegrationsStrip from './components/IntegrationsStrip'
import Stats from './components/Stats'
import ClosingCta from './components/ClosingCta'
import VoiceVisuals from './components/voice-visuals'
import Testimonials from './components/Testimonials'
import DotsReview from './components/DotsReview'
import { Rail } from './components/SideInstruments'
import './components/SideInstruments.css'

/* One poster component on stage at a time, switchable — the surface Stagecraft
 * mounts for point-and-edit sessions, and (since Session 9) the review surface
 * for judging a refined section in isolation before it is signed off on the
 * page. Selection lives in ?c= so a reload (or a Stagecraft target URL)
 * restores the same stage; bumping the key remounts the component so its
 * viewport-entry scene replays from the top.
 *
 * Sections whose landing usage is a demoted variant appear TWICE: once as the
 * page renders them (`… (page)`, the thing under review) and once as their full
 * standalone scene. Judging the full scene when the page ships the quiet one is
 * how a section gets approved and then disappoints in place. */
/* Grouped for browsing (owner ask, 2026-07-27: "toggle between them by name
 * and maybe find something that i might like"). Slugs are LOAD-BEARING —
 * Stagecraft target URLs and saved ?c= links resolve by slug — so grouping
 * and renaming touched labels only. Labels stay short on purpose: this
 * header wraps rather than overflows, but the <select>'s widest option still
 * sets the toolbar's width at 390/360. */
const STAGES: { slug: string; label: string; group: string; Comp: ComponentType }[] = [
  /* — the page's sections, exactly as the landing page renders them — */
  { slug: 'hero-h3', label: 'Hero (as shipped)', group: 'Page sections', Comp: Hero },
  { slug: 'integrations-strip', label: 'Integrations Strip', group: 'Page sections', Comp: IntegrationsStrip },
  { slug: 'hvu-flow', label: 'Heard vs Understood (page)', group: 'Page sections', Comp: HeardVsUnderstoodFlow },
  { slug: 'stats', label: 'Stats', group: 'Page sections', Comp: Stats },
  { slug: 'testimonials', label: 'Testimonials', group: 'Page sections', Comp: Testimonials },
  { slug: 'closing-cta', label: 'Closing CTA (live field)', group: 'Page sections', Comp: ClosingCta },

  /* — the hero's product windows, staged one at a time on the wallpaper bed
   * (owner ask 2026-07-27: "we actually made components with the mockup
   * wallpapers"). Each replays its own beat list on mount; ↺ Replay reruns it. — */
  { slug: 'win-knowledge-base', label: 'Window · Knowledge Base', group: 'Product windows', Comp: KnowledgeWindow },
  { slug: 'win-playground', label: 'Window · Playground', group: 'Product windows', Comp: PlaygroundWindow },
  { slug: 'win-cold-calls', label: 'Window · Cold Calls', group: 'Product windows', Comp: ColdCallsWindow },
  { slug: 'win-deal-rooms', label: 'Window · Deal Rooms', group: 'Product windows', Comp: DealRoomsWindow },

  /* — full standalone scenes preserved from earlier rounds (several were cut
   * from the flow 2026-07-27 but kept whole — the hunting ground) — */
  { slug: 'kinetic-conversation', label: 'Kinetic Conversation', group: 'Full scenes', Comp: KineticConversation },
  { slug: 'kinetic-glass', label: 'Kinetic · frosted glass', group: 'Dials & variants', Comp: KineticGlass },
  { slug: 'heard-vs-understood', label: 'Heard vs Understood (full scene)', group: 'Full scenes', Comp: HeardVsUnderstood },
  { slug: 'objection-anatomy', label: 'Objection Anatomy (full scene)', group: 'Full scenes', Comp: ObjectionAnatomy },
  { slug: 'oa-quiet', label: 'Objection Anatomy (page cut)', group: 'Full scenes', Comp: ObjectionAnatomyQuiet },
  { slug: 'ol-quiet', label: 'Objection Library (page cut)', group: 'Full scenes', Comp: ObjectionLibraryQuiet },
  { slug: 'shared-truth', label: 'Shared Truth (full scene)', group: 'Full scenes', Comp: SharedTruth },
  { slug: 'st-quiet', label: 'Shared Truth (page cut)', group: 'Full scenes', Comp: SharedTruthQuiet },
  { slug: 'sentence-history', label: 'Sentence History', group: 'Full scenes', Comp: SentenceHistory },
  { slug: 'account-reveals', label: 'Account Reveals', group: 'Full scenes', Comp: AccountReveals },
  { slug: 'before-after', label: 'Before / After', group: 'Full scenes', Comp: BeforeAfter },
  { slug: 'before-after-routed', label: 'Before / After · routed', group: 'Dials & variants', Comp: BeforeAfterRouted },
  { slug: 'before-after-proof-stack', label: 'Before / After · proof stack', group: 'Dials & variants', Comp: BeforeAfterProofStack },
  { slug: 'signal-convergence', label: 'Signal Convergence', group: 'Full scenes', Comp: SignalConvergence },

  /* — hero stage-fill dials. The hero is a SCROLL-DRIVEN scene: judge it on
   * `/` (this gallery's 48px header parks the sticky stage 32px low); the
   * fills are here so they can be compared without leaving /stage. — */
  { slug: 'hero-h4-tahoe', label: 'Hero fill · Tahoe photo (page)', group: 'Hero stage fills', Comp: HeroStagePhotoTahoe },
  { slug: 'hero-h4-sequoia', label: 'Hero fill · Sequoia photo', group: 'Hero stage fills', Comp: HeroStagePhotoSequoia },
  { slug: 'hero-h4-wallpaper', label: 'Hero fill · gradient wallpaper', group: 'Hero stage fills', Comp: HeroStageWallpaper },
  { slug: 'hero-h4-lavender', label: 'Hero fill · lavender', group: 'Hero stage fills', Comp: HeroStageLavender },
  { slug: 'hero-h4-neutral', label: 'Hero fill · neutral', group: 'Hero stage fills', Comp: HeroStageNeutral },

  /* — variant dials kept from the review rounds, for comparison — */
  { slug: 'closing-cta-navy', label: 'CTA dot field · navy', group: 'Dials & variants', Comp: ClosingCtaNavy },
  { slug: 'closing-cta-lavender', label: 'CTA dot field · lavender', group: 'Dials & variants', Comp: ClosingCtaLavender },
  { slug: 'rails-ink', label: 'Hero rails · graphite vs navy', group: 'Dials & variants', Comp: RailsInkCompare },
  { slug: 'hvu-halo-added', label: 'HVU halo · added', group: 'Dials & variants', Comp: HvuHaloAdded },
  { slug: 'hvu-halo-as-beat', label: 'HVU halo · as-beat', group: 'Dials & variants', Comp: HvuHaloAsBeat },
  { slug: 'hvu-glass', label: 'HVU · iOS glass', group: 'Dials & variants', Comp: HvuGlass },
  { slug: 'oa-matrix-state', label: 'OA matrix · state', group: 'Dials & variants', Comp: OaMatrixState },
  { slug: 'oa-matrix-full', label: 'OA matrix · full', group: 'Dials & variants', Comp: OaMatrixFull },
  { slug: 'st-matrix-state', label: 'ST matrix · state', group: 'Dials & variants', Comp: StMatrixState },
  { slug: 'st-matrix-full', label: 'ST matrix · full', group: 'Dials & variants', Comp: StMatrixFull },

  /* — component labs — */
  { slug: 'voice-components', label: 'Voice Component Lab', group: 'Labs', Comp: VoiceVisuals },
  { slug: 'dots', label: 'Dot matrices', group: 'Labs', Comp: DotsReview },
]

/* group names in first-appearance order, for <optgroup> rendering */
const GROUPS = STAGES.reduce<string[]>(
  (acc, s) => (acc.includes(s.group) ? acc : [...acc, s.group]),
  [],
)

/* One hero product window, standalone: real Window chrome on the Tahoe
 * wallpaper bed (the shipped hero bed — Hero.css is loaded via the Hero
 * import). The pane ships its settled markup; on mount we rewind it and
 * replay its beat list on plain timeouts — the same beats the hero's clock
 * drives, minus the tour. Reduced motion gets the settled frame, per the
 * pane contract. */
function PaneStage({ mod }: { mod: PaneModule }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const Pane = mod.Pane

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      mod.settle?.(root)
      return
    }
    mod.rewind?.(root)
    const timers = (mod.beats ?? []).map((b) => window.setTimeout(() => b.run(root), b.at))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [mod])

  return (
    <div className="overflow-x-auto bg-surface-200 px-6 py-20 md:px-10">
      <div className="relative mx-auto min-w-[900px] max-w-[1120px]">
        <div
          aria-hidden
          className="hero-curtain__card-bed hero-curtain__card-bed--photo-tahoe"
        />
        <Window title={mod.breadcrumb} className="relative">
          <div className="relative h-[620px]">
            <div ref={rootRef} className="absolute inset-0 flex flex-col overflow-hidden">
              <Pane />
            </div>
          </div>
        </Window>
      </div>
    </div>
  )
}

function KnowledgeWindow() {
  return <PaneStage mod={KnowledgeBaseModule} />
}
function PlaygroundWindow() {
  return <PaneStage mod={PlaygroundModule} />
}
function ColdCallsWindow() {
  return <PaneStage mod={ColdCallsModule} />
}
function DealRoomsWindow() {
  return <PaneStage mod={DealRoomsModule} />
}

/* Variant wrappers, module-level so their identity is stable across renders
 * (an inline arrow in STAGES would remount the stage on every keystroke). */
function HeardVsUnderstoodFlow() {
  return <HeardVsUnderstood variant="flow" />
}
function ObjectionAnatomyQuiet() {
  return <ObjectionAnatomy variant="quiet" />
}
function ObjectionLibraryQuiet() {
  return <ObjectionLibrary variant="quiet" />
}
function SharedTruthQuiet() {
  return <SharedTruth variant="quiet" />
}
function ClosingCtaNavy() {
  return <ClosingCta ink="navy" />
}
function ClosingCtaLavender() {
  return <ClosingCta ink="lavender" />
}
function HeroStagePhotoSequoia() {
  return <Hero stageFill="photo-sequoia" />
}
function HeroStagePhotoTahoe() {
  return <Hero stageFill="photo-tahoe" />
}
function HeroStageWallpaper() {
  return <Hero stageFill="wallpaper" />
}
function HeroStageLavender() {
  return <Hero stageFill="lavender" />
}
function HeroStageNeutral() {
  return <Hero stageFill="neutral" />
}
function HvuHaloAdded() {
  return <HeardVsUnderstood variant="flow" halo="added" />
}
function HvuHaloAsBeat() {
  return <HeardVsUnderstood variant="flow" halo="as-beat" />
}
function OaMatrixState() {
  return <ObjectionAnatomy variant="quiet" matrixMode="state-only" />
}
function OaMatrixFull() {
  return <ObjectionAnatomy variant="quiet" matrixMode="full-ref" />
}
function StMatrixState() {
  return <SharedTruth variant="quiet" matrixMode="state-only" />
}
function StMatrixFull() {
  return <SharedTruth variant="quiet" matrixMode="full-ref" />
}

/* H1's decision was made against a broken graphite (the old 0.28 dim floor);
 * this panel is the honest re-look: both inks at the same mid-scene progress,
 * on the hero's own surface-200 ground, dim and lit states both visible.
 * --si-p is inline on each panel — the fill is static here on purpose; the
 * moving version is the hero itself. */
function RailsInkCompare() {
  return (
    <div className="bg-surface-200 px-6 py-24">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-16 lg:flex-row lg:justify-center">
        {(['graphite', 'navy'] as const).map((ink) => (
          <div key={ink} className="flex flex-col items-center gap-6">
            <p className="text-[13px] font-[550] tracking-[0.12em] text-gray-600 uppercase">
              {ink}
              {ink === 'graphite' ? ' · shipped' : ''}
            </p>
            <div
              className="si relative h-[320px] w-[420px] max-w-full"
              style={{ '--si-p': 0.62 } as CSSProperties}
            >
              <div className="absolute top-0 left-0">
                <Rail ink={ink} side="left" captions="guidance" />
              </div>
              <div className="absolute top-0 right-0">
                <Rail ink={ink} side="right" captions="guidance" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function slugFromUrl() {
  const c = new URLSearchParams(window.location.search).get('c')
  return STAGES.some((s) => s.slug === c) ? (c as string) : STAGES[0].slug
}

export default function StageGallery() {
  const [slug, setSlug] = useState(slugFromUrl)
  const [take, setTake] = useState(0)
  /* `?bare=1` suppresses this page's own toolbar. Added 2026-07-29 for the
   * /process gallery, which embeds these stages as posters — there the scene has
   * to BE the frame, and a sticky 48px chrome bar inside a scaled-down iframe
   * reads as a bug. Nothing else passes it, so /stage is unchanged by default. */
  const bare = new URLSearchParams(window.location.search).get('bare') === '1'

  const index = STAGES.findIndex((s) => s.slug === slug)
  const { label, Comp } = STAGES[index]

  const select = (next: string) => {
    setSlug(next)
    setTake(0)
    const url = new URL(window.location.href)
    url.searchParams.set('c', next)
    window.history.replaceState(null, '', url)
  }
  const step = (dir: -1 | 1) =>
    select(STAGES[(index + dir + STAGES.length) % STAGES.length].slug)

  const btn =
    'kz-hover rounded-button border border-hairline-2 bg-surface-100 px-3 py-1 ' +
    'font-mono text-[11px] tracking-[0.08em] text-gray-700 hover:border-gray-400 hover:text-ink'

  return (
    <div className="min-h-screen bg-surface-100 text-ink">
      {!bare && (
      <header className="sticky top-0 z-50 border-b border-hairline-2 bg-surface-100">
        {/* min-h + wrap, not a fixed h-12: the <select>'s widest option used to
            set this row's intrinsic width, pushing /stage 164/194px into
            horizontal overflow at 390/360. Wrapping + min-w-0 lets the select
            shrink instead. */}
        <div className="mx-auto flex min-h-12 max-w-[1200px] flex-wrap items-center gap-x-3 gap-y-1 px-6 py-1">
          <span className="font-mono font-[550] text-[11px] uppercase tracking-[0.14em] text-gray-600">
            Stage
          </span>
          <span className="font-mono text-[11px] text-gray-400">
            {String(index + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
          </span>
          <select
            value={slug}
            onChange={(e) => select(e.target.value)}
            className="kz-hover min-w-0 flex-1 basis-40 rounded-button border border-hairline-2 bg-surface-100 px-3 py-1 font-mono text-[11px] tracking-[0.08em] text-ink hover:border-gray-400"
            aria-label="Select component"
          >
            {GROUPS.map((g) => (
              <optgroup key={g} label={g}>
                {STAGES.filter((s) => s.group === g).map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className={btn} onClick={() => step(-1)}>
              ← Prev
            </button>
            <button type="button" className={btn} onClick={() => step(1)}>
              Next →
            </button>
            <button type="button" className={btn} onClick={() => setTake((t) => t + 1)}>
              ↺ Replay
            </button>
          </div>
        </div>
      </header>
      )}
      <main key={`${slug}-${take}`} aria-label={label}>
        <Comp />
      </main>
    </div>
  )
}
