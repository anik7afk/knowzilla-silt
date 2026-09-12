import Nav from './components/Nav'
import Hero from './components/Hero'
import IntegrationsStrip from './components/IntegrationsStrip'
import VoiceVisuals from './components/voice-visuals'
import WriteBack from './components/WriteBack'
import Stats from './components/Stats'
import ClosingCta from './components/ClosingCta'
import Footer from './components/Footer'
import KineticConversation from './components/KineticConversation'
import PlatformChapters from './components/PlatformChapters'
import HeardVsUnderstood from './components/HeardVsUnderstood'
import SentenceHistory from './components/SentenceHistory'
import AccountReveals from './components/AccountReveals'
import BeforeAfter from './components/BeforeAfter'
import SharedTruth from './components/SharedTruth'
import SignalConvergence from './components/SignalConvergence'
import ObjectionAnatomy from './components/ObjectionAnatomy'
import ObjectionLibrary from './components/ObjectionLibrary'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import DotsReview from './components/DotsReview'
import HvuVariations from './components/HvuVariations'
import HvuGlass from './components/HvuGlass'
import KineticGlass from './components/KineticGlass'
import EndgameIndex from './components/endgame/EndgameIndex'
import CallToRecord from './components/endgame/CallToRecord'
import SharedDealTruth from './components/endgame/SharedDealTruth'
import ObjectionCompound from './components/endgame/ObjectionCompound'
import StackConnected from './components/endgame/StackConnected'
import BetterAsYouNavigate from './components/endgame/BetterAsYouNavigate'
import StageGallery from './StageGallery'
import ProcessPanel from './process/ProcessPanel'
import NotFound from './components/NotFound'
import Sheet from './components/Sheet'
import './components/PagePlanes.css'

/* v2's page-wide drafting side rails were removed 2026-07-25: a frame that
 * wraps nine of ten sections stops reading as a frame. The drafting idiom is
 * now rationed to sections whose content IS an instrument (see CLAUDE.md). */

export default function App() {
  if (window.location.pathname === '/404') {
    return <NotFound />
  }

  if (window.location.pathname === '/stage') {
    return <StageGallery />
  }

  /* 2026-07-29 — the design-process gallery, for the CTO/CEO read-through: the
   * design system, the motion grammar, the mascot, every scene mounted live, and
   * the ideation rounds. Chapters live in the hash (/process#components), and the
   * owner's cut pass runs on it via the sidebar's review mode. */
  if (window.location.pathname === '/process' || window.location.pathname === '/workboard') {
    return <ProcessPanel />
  }

  /* 2026-08-05 — standalone hero, added so Stagecraft can stage the hero on
   * its own (`?target=v5` points here). White ground = the sheet's tone; the
   * landing keeps the full Sheet wrapper, this route needs none of its pin. */
  if (window.location.pathname === '/hero') {
    return (
      <main className="min-h-screen bg-white text-ink">
        <Hero stageFill="photo-tahoe" />
      </main>
    )
  }

  if (window.location.pathname === '/voice-components') {
    return (
      <main className="min-h-screen bg-surface-200 text-ink">
        <VoiceVisuals />
      </main>
    )
  }

  if (window.location.pathname === '/heard-vs-understood') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <HeardVsUnderstood />
      </main>
    )
  }

  if (window.location.pathname === '/sentence-history') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <SentenceHistory />
      </main>
    )
  }

  if (window.location.pathname === '/account-reveals') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <AccountReveals />
      </main>
    )
  }

  if (window.location.pathname === '/before-after') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <BeforeAfter />
      </main>
    )
  }

  if (window.location.pathname === '/shared-truth') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <SharedTruth />
      </main>
    )
  }

  if (window.location.pathname === '/signal-convergence') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <SignalConvergence />
      </main>
    )
  }

  if (window.location.pathname === '/objection-anatomy') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <ObjectionAnatomy />
      </main>
    )
  }

  /* Routes added 2026-07-27 alongside the four flow cuts. ObjectionLibrary and
   * WriteBack had no standalone route because they had never been out of the
   * flow; now that they are, they get the same treatment ObjectionAnatomy and
   * SharedTruth already had — the full default variant, reviewable on its own
   * URL, so a cut section stays a decision that can be re-read rather than a
   * component nobody can see any more. */
  if (window.location.pathname === '/objection-library') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <ObjectionLibrary />
      </main>
    )
  }

  if (window.location.pathname === '/write-back') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <WriteBack />
      </main>
    )
  }

  /* 2026-07-27 (owner, second ruling of the day): Pricing is NOT in the
   * landing flow — "attio doesnt have it in the landing so we should do the
   * same". The donor keeps pricing off its landing entirely; ours lives here
   * alone, reached from the nav's Pricing link, rebuilt on the donor's own
   * four-flat-cards grammar (see Pricing.tsx). */
  if (window.location.pathname === '/pricing') {
    /* Full page chrome (owner, 2026-07-27): the nav's Pricing link lands
     * here, and the v2 reference it now mirrors is a complete page — so it
     * gets Nav + Footer, unlike the bare review routes above. */
    return (
      <main className="min-h-screen bg-surface-200 text-ink">
        <Nav />
        <Pricing />
        <Footer />
      </main>
    )
  }

  /* The /hero-instruments review harness is GONE (2026-07-26). Its one question
   * was answered — "Centred · GRAPHITE · Guidance / Every call" — and the rails
   * now live in Hero.tsx. Its two substantive gates (mirror symmetry, no
   * negative word in the instruments) moved to scripts/hero-instruments-shots.mjs
   * pointed at `/`, so the decisions it encoded still fail loudly if reverted. */

  if (window.location.pathname === '/kinetic-conversation') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <KineticConversation />
      </main>
    )
  }

  /* Standalone frosted-glass audition of KineticConversation — does not
   * touch the frozen landing instance or KineticConversation.css. */
  if (window.location.pathname === '/kinetic-glass') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <KineticGlass />
      </main>
    )
  }

  if (window.location.pathname === '/dots') {
    return <DotsReview />
  }

  /* Exploration gallery — five HVU compositions off the landing page.
   * Pick a direction here; port the winner into HeardVsUnderstood later. */
  if (window.location.pathname === '/hvu-variations') {
    return <HvuVariations />
  }

  /* Standalone iOS-glass audition of the HVU full scene — does not touch
   * HeardVsUnderstood. Review only. */
  if (window.location.pathname === '/hvu-glass') {
    return (
      <main className="min-h-screen text-ink">
        <HvuGlass />
      </main>
    )
  }

  /* 2026-07-28 — Endgame audition (Stats → ClosingCta candidates).
   * Standalone review only. The landing flow below is untouched. */
  if (window.location.pathname === '/endgame') {
    return <EndgameIndex />
  }
  if (window.location.pathname === '/endgame/call-to-record') {
    return (
      <main className="min-h-screen bg-surface-300 text-ink">
        <CallToRecord />
      </main>
    )
  }
  if (window.location.pathname === '/endgame/shared-truth') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <SharedDealTruth />
      </main>
    )
  }
  if (window.location.pathname === '/endgame/objection-compound') {
    return (
      <main className="min-h-screen bg-surface-200 text-ink">
        <ObjectionCompound />
      </main>
    )
  }
  if (window.location.pathname === '/endgame/stack') {
    return (
      <main className="min-h-screen bg-surface-300 text-ink">
        <StackConnected />
      </main>
    )
  }
  if (window.location.pathname === '/endgame/better') {
    return (
      <main className="min-h-screen bg-surface-100 text-ink">
        <BetterAsYouNavigate />
      </main>
    )
  }

  return (
    /* TWO-PLANE ROLLOUT (owner pivot 2026-07-29): the page's ground is the DESK
     * — surface-300 carrying the dot plane, not white. `.page` paints both (the
     * tone from this Tailwind class, the dots from a repeating tile in
     * PagePlanes.css §THE DESK TILE). Everything the page is made of is then
     * either a SHEET laid on that desk or a section standing directly on it.
     * Grammar, the sheet's pin and the KC→HVU transition: PagePlanes.css. */
    <div className="page min-h-screen bg-surface-300 text-ink">
      {/* Flow B lineup (2026-07-27, owner ruling after the full page audit).
        * Motion ration (§3.3) after the cuts: EVENT = Hero + KineticConversation
        * only; BEAT = HVU + Stats (WriteBack was the third and is out); every-
        * thing else QUIET. Demoted components keep their full scenes on their
        * standalone routes via the default variant.
        *
        * The argument the page makes, in order: what it is (Hero, whose frame
        * performs a live call and walks the real modules) → it fits your stack
        * (Strip) → the moment it catches (KineticConversation, FROZEN) → why
        * that moment is hard (HVU: heard is not understood) → so here is the
        * product that closes that gap, read standing still (PlatformChapters,
        * four surfaces organised by the rep's job) → proof, numbers, close.
        * Pricing is OFF the landing (owner, 2026-07-27 second ruling: the
        * donor keeps pricing off its landing, so do we) — it lives at
        * /pricing, linked from the nav.
        *
        * REORDER 2026-07-27 ("Variant B", owner): HVU moves ABOVE
        * PlatformChapters. The old lock — chapters directly after KC — was
        * explicitly re-opened. The reason B wins: KC states the problem as a
        * *moment*, HVU states it as a *mechanism*, and the chapters are the
        * answer. Answer-before-question was the old order's flaw. Grounds still
        * alternate at every join — SUPERSEDED for the first five slots by the
        * owner pivot 2026-07-29 (two-plane rollout). The old rule read "KC
        * #ffffff → HVU #fafafa → chapters #f6f6f6 → Testimonials #ffffff, so no
        * join takes a hairline". There are no alternating grounds to read
        * between Hero and HVU any more: Hero + Strip + KC are ONE white sheet on
        * the dotted desk (their internal joins are interior rules, not ground
        * changes), HVU is its own full-bleed white sheet (owner second ruling
        * 2026-07-29: "make this section white panel again"), and only
        * PlatformChapters stands directly ON the desk — so the joins ARE the
        * sheets' own full-bleed edges. The alternation
        * rule still governs the tail of the page (Testimonials #ffffff → Stats
        * #f6f6f6 → CTA #f6f6f6 → Footer #ffffff). Grammar + the KC→HVU pin:
        * components/PagePlanes.css.
        *
        * CUT 2026-07-27 (owner, page audit) — flow only, every file kept and
        * every scene reviewable on its own route:
        *   · ObjectionAnatomy — cut 2026-07-27, absorbed by chapters, per page
        *     audit (chapter 02 reads the live sentence). Route /objection-anatomy.
        *   · ObjectionLibrary — cut 2026-07-27, absorbed by chapters, per page
        *     audit (the post-call record is chapter 04's subject). New route
        *     /objection-library.
        *   · WriteBack — cut 2026-07-27, absorbed by chapters, per page audit
        *     (CRM write-back is shown inside the chapter mocks). New route
        *     /write-back.
        *   · SharedTruth — cut 2026-07-27, absorbed by chapters, per page audit
        *     (the team-wide view is the chapters' own framing). Route
        *     /shared-truth.
        * These four also carried two of the page's three `schematic` idiom
        * holders, so the schematic cap violation that had been open since
        * Session 3 closes with them rather than by re-declaring anything.
        *
        * OUT 2026-07-25: Tour — its job (walking Knowledge Base / Playground /
        * Assistant) moved INTO Hero's AppFrame, so a pinned section repeating
        * the same four modules was the page repeating itself. AccountReveals —
        * the third transcript scene on a page whose product has no transcript
        * (see design-assets/refs/session7/knowzilla-app/PRODUCT-NOTES.md).
        * Both keep their files; AccountReveals keeps its route below.
        * Previously OUT: DarkContext, Bento (files retained).
        *
        * OUT 2026-07-25 (Session 9, user): Quote — "this one single testimonial
        * will not gonna work remove it for now i will share inspo later". One
        * unattributed testimonial from a fictional VP was asking the reader to
        * take a stranger's word for it; a proof section returns when the user
        * supplies the reference. Quote.tsx/.css retained, unrendered. */}
      <Nav />
      {/* THE SHEET + the layer that climbs over it (owner, 2026-07-29). Hero,
        * IntegrationsStrip and the FROZEN KineticConversation are one continuous
        * white panel on the desk; HVU rides the layer above and slides up over
        * the sheet's pinned tail instead of being revealed beneath it. That
        * climb-over was briefly removed later the same day and immediately put
        * back at the owner's word — "wait maybe no dont remove the animation
        * scroll that we had from kinetic to hvu". KineticConversation itself is
        * only WRAPPED — not one line of it is touched, per the standing freeze.
        * All of the mechanics, and the honest `~` on the donor provenance, live
        * in PagePlanes.css. */}
      <div className="planes">
        <Sheet>
          <Hero stageFill="photo-tahoe" />
          <IntegrationsStrip />
          <KineticConversation />
        </Sheet>
        <div className="planes__over">
          {/* 2026-07-29 — the HVU slot holds the iOS-glass scene (owner: "add
            * this component in the hvu section, its an improved version"). It
            * replaces HeardVsUnderstood's Context Press plate HERE ONLY;
            * HeardVsUnderstood still serves /heard-vs-understood and /stage.
            * Type is re-scaled onto the page's ladder (HvuGlass.css) — the
            * headline sits on the same 40→64 step the press title used, so the
            * section's weight against its neighbours is unchanged. The meta row
            * is cut, the head is centred and the ground is white (surface-100,
            * so this layer still occludes the pinned sheet), all at the owner's
            * review the same day. */}
          <HvuGlass variant="flow" />
        </div>
      </div>
      {/* 2026-07-27 — the deep product showcase, per PLATFORM-CHAPTERS-BRIEF.md.
        * This is the "study it" register the page was missing: the hero DEMOS
        * the app running, this section lets you read four surfaces standing
        * still. It is not the retired Tour returning — Tour repeated the hero's
        * four modules; these four chapters are organised by the rep's JOB and
        * no chapter re-tells a hero pane. Since the Variant B reorder it sits
        * between HVU's #fafafa and Testimonials' #ffffff on its own #f6f6f6,
        * so both joins are ground changes and both go bare. It is also the
        * section the four cuts above were absorbed into — it now carries the
        * product detail those sections used to spread across five slots.
        * CHECKPOINT A/B: append `?rail=b` to the URL to see the variant where
        * the active rail row also reveals its one-line supporting sentence.
        * Same page, same scroll context — the only honest way to compare two
        * sticky-rail grammars. */}
      <PlatformChapters railDescriptions={window.location.search.includes('rail=b')} />
      {/* 2026-07-29 (owner) — the page tail was proof-thin into the CTA: backers
        * (Testimonials) then a SPEC SHEET (Stats: document types, rubric axes,
        * €39) then the ask, with nothing answering "what changes for me?".
        * BeforeAfter — until now a standalone-only scene — takes the slot
        * against ClosingCta, so the LAST number on the page is an outcome
        * rather than a price. Stats moves ABOVE Testimonials rather than
        * stacking on top of it: two schematic number sections back to back
        * blunt each other, and BeforeAfter's 3.2× only lands as a payoff if it
        * arrives alone. Grounds after the move — chapters (tail paints #ffffff,
        * measured at the seam) → Stats #f6f6f6 → Testimonials #ffffff →
        * BeforeAfter #fafafa → ClosingCta #f6f6f6: EVERY join in the tail is
        * now a ground change, so all four go bare and Stats' contained hairline
        * came off both edges (see the history in Stats.tsx). */}
      <Stats />
      {/* 2026-07-26 (user): a testimonial section modelled on Natural's
        * `investors` row takes the slot Quote used to hold — five real backers
        * and operators as full-bleed brand-colour cards on a white ground.
        * It originally also fixed the SharedTruth → Stats schematic adjacency
        * by putting a card row between two line drawings; after the 2026-07-27
        * cuts SharedTruth is gone and Stats is the page's only schematic, so
        * that job is retired and the section stands on the proof it carries.
        * Its ground change still carries both joins (Stats' #f6f6f6 above since
        * the 2026-07-29 reorder, BeforeAfter's #fafafa below), so neither gets
        * a hairline. */}
      <Testimonials />
      <BeforeAfter />
      <ClosingCta />
      <Footer />
    </div>
  )
}
