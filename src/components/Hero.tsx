import { useEffect, useRef, type CSSProperties } from 'react'
import AppFrame from './mock/AppFrame'
import Lizzie from './Lizzie'
import { RegisterMark } from './craft'
import { Rail } from './SideInstruments'
import './SideInstruments.css'
import './Hero.css'

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties

/* H0 measured a binary target behind the donor's apparent opacity ladder.
   Six pixels is the donor's ~8px first-gesture threshold scaled from its
   116px header to ours at 80px. The damping is symmetric and time-normalised
   from the measured k=0.26 per 16.6ms frame. */
const CURTAIN_THRESHOLD = 6
const DAMPING_PER_FRAME = 0.26
const FRAME_MS = 1000 / 60
const SETTLE_EPSILON = 0.00015

export type StageFill =
  | 'none'
  | 'lavender'
  | 'neutral'
  | 'wallpaper'
  | 'photo-sequoia'
  | 'photo-tahoe'

/** The bed variants that paint a real desktop picture behind the frame. */
const PHOTO_FILLS: StageFill[] = ['photo-sequoia', 'photo-tahoe']

function quantizedBlur(opacity: number) {
  return Math.round((1 - opacity) * 5) / 2
}

export default function Hero({ stageFill = 'none' }: { stageFill?: StageFill }) {
  const headlineRef = useRef<HTMLDivElement>(null)
  const railsRef = useRef<HTMLDivElement>(null)
  const cardViewportRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const headline = headlineRef.current
    const rails = railsRef.current
    const viewport = cardViewportRef.current
    const card = cardRef.current
    if (!headline || !rails || !viewport || !card) return

    const desktop = window.matchMedia('(min-width: 1024px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf = 0
    let lastTime = 0
    let rendered = 1
    let target = 1
    let cardRestTop = 0
    let stepped: boolean | null = null

    /* The frame's step back rides the SAME binary flip that dissolves the
       headline — measured on the donor, which drives it off its own
       `data-hero-scrolling` state (see Hero.css). Written only on a real
       change so a scroll event can't invalidate style every frame. */
    const setStepped = (next: boolean) => {
      if (stepped === next) return
      stepped = next
      card.dataset.heroStepped = next ? 'true' : 'false'
    }

    const measureRail = () => {
      const rail = rails.querySelector<HTMLElement>('.si-rail')
      const marker = rail?.querySelector<HTMLElement>('.si-marker')
      const dashes = rail?.querySelectorAll<HTMLElement>('.si-dash')
      if (!rail || !marker || !dashes || dashes.length < 2) return

      const markerRect = marker.getBoundingClientRect()
      const markerMatrix = new DOMMatrixReadOnly(getComputedStyle(marker).transform)
      const markerBaseCenter = markerRect.top + markerRect.height / 2 - markerMatrix.m42
      const topCenter = dashes[0].getBoundingClientRect().top + dashes[0].getBoundingClientRect().height / 2
      const bottomDash = dashes[dashes.length - 1].getBoundingClientRect()
      const bottomCenter = bottomDash.top + bottomDash.height / 2
      rails.style.setProperty('--hero-marker-rest', `${bottomCenter - markerBaseCenter}px`)
      rails.style.setProperty('--hero-marker-travel', `${bottomCenter - topCenter}px`)
    }

    const setHeadline = (opacity: number) => {
      const blur = quantizedBlur(opacity)
      headline.style.opacity = String(opacity)
      headline.style.filter = blur === 0 ? 'none' : `blur(${blur}px)`
    }

    const measureCardRest = () => {
      /* The card is ordinary flow, so rect.top + scrollY is its invariant
         document-space rest position. Re-reading it also lets the entrance
         animation finish without baking its temporary translate into the
         rail's 00→100 range. */
      cardRestTop = card.getBoundingClientRect().top + window.scrollY
    }

    const setRailProgress = () => {
      measureCardRest()
      const viewportStyle = getComputedStyle(viewport)
      const paddingTop = parseFloat(viewportStyle.paddingTop) || 0
      const paddingBottom = parseFloat(viewportStyle.paddingBottom) || 0
      const frameHeight = card.getBoundingClientRect().height
      const settledTop =
        paddingTop +
        Math.max(0, (viewport.clientHeight - paddingTop - paddingBottom - frameHeight) / 2)
      const rise = cardRestTop - settledTop
      const progress = rise > 0 ? window.scrollY / rise : 0
      rails.style.setProperty('--si-p', String(Math.min(1, Math.max(0, progress))))
    }

    const settleWithoutMotion = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      lastTime = 0
      rendered = 1
      target = 1
      headline.style.opacity = '1'
      headline.style.filter = 'none'
      headline.style.pointerEvents = 'auto'
      headline.style.removeProperty('will-change')
      rails.style.setProperty('--si-p', reduced.matches ? '1' : '0')
      setStepped(false)
    }

    const tick = (time: number) => {
      raf = 0
      const elapsed = lastTime ? Math.min(50, time - lastTime) : FRAME_MS
      lastTime = time
      const frameDamping = 1 - (1 - DAMPING_PER_FRAME) ** (elapsed / FRAME_MS)
      rendered += (target - rendered) * frameDamping

      if (Math.abs(target - rendered) <= SETTLE_EPSILON) {
        rendered = target
      }

      setHeadline(rendered)
      setRailProgress()

      if (rendered !== target) {
        raf = requestAnimationFrame(tick)
      } else {
        lastTime = 0
        headline.style.removeProperty('will-change')
      }
    }

    const schedule = () => {
      if (!desktop.matches || reduced.matches) {
        settleWithoutMotion()
        return
      }

      target = window.scrollY > CURTAIN_THRESHOLD ? 0 : 1
      headline.style.pointerEvents = target === 0 ? 'none' : 'auto'
      setStepped(target === 0)
      if (rendered !== target) headline.style.willChange = 'opacity, filter'
      if (!raf) raf = requestAnimationFrame(tick)
    }

    measureCardRest()
    measureRail()
    setRailProgress()
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    const onResize = () => {
      measureRail()
      schedule()
    }
    window.addEventListener('resize', onResize, { passive: true })
    desktop.addEventListener('change', schedule)
    reduced.addEventListener('change', schedule)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
      desktop.removeEventListener('change', schedule)
      reduced.removeEventListener('change', schedule)
    }
  }, [])

  return (
    /* TWO-PLANE ROLLOUT (owner, 2026-07-29): the hero no longer paints a ground
       of its own. It is laid on the page's white SHEET (App.tsx → <Sheet>,
       surface-100 at complete full viewport width), which replaces the
       `bg-surface-200` tint this section used to carry. The dotted desk it used
       to sit on is now the PAGE's plane, and it shows only where a section
       stands on it — not beside this sheet. Nothing about the choreography
       moves: the curtain dissolve, the four sticky layers, the 0.95 step-back,
       the side rails and every measured width are untouched (the sheet spans the
       viewport, so the hero measures exactly what it measured before). */
    <section className="hero-curtain">
      {/* The stage kept its 16px dot field (v2 DotGrid, radial-masked) until the
          two-plane rollout DELETED it: the sheet under the hero is white, the
          desk is the page's own plane outside the sheet, and a second dot field
          on a different pitch (16px vs the desk's 10px) inside the sheet would
          have read as two papers stacked. The stage element itself stays — it
          still carries the stage-surface tints the /stage gallery auditions. */}
      <div aria-hidden className="hero-curtain__stage">
        <div
          data-hero-stage-fill={stageFill}
          className={`hero-curtain__stage-surface hero-curtain__stage-surface--${stageFill}`}
        />
      </div>

      {/* Rails pin independently of the headline so they remain fully visible
          after the curtain has dissolved. */}
      <div className="hero-curtain__rails" aria-hidden>
        <div className="relative mx-auto h-full max-w-[1440px] px-6 md:px-10">
          <div
            ref={railsRef}
            className="si kz-enter pointer-events-none absolute inset-x-6 top-24 hidden lg:inset-x-10 lg:block"
            style={delay(600)}
          >
            <div className="absolute top-0 left-0">
              <Rail ink="graphite" side="left" captions="guidance" />
            </div>
            <div className="absolute top-0 right-0">
              <Rail ink="graphite" side="right" captions="guidance" />
            </div>
          </div>
        </div>
      </div>

      <div className="hero-curtain__content">
        <div ref={headlineRef} data-hero-headline className="hero-curtain__headline">
          <div className="relative mx-auto w-full max-w-[1200px] px-6 md:px-10">
            <div className="pointer-events-none absolute inset-x-6 top-2 hidden justify-between md:flex lg:hidden md:inset-x-10">
              <RegisterMark />
              <RegisterMark />
            </div>

            <div className="flex flex-col items-center text-center">
              <h1
                className="kz-enter text-[44px] leading-[1.02] font-medium tracking-[-0.03em] text-ink [text-wrap:balance] md:text-[76px]"
                style={delay(0)}
              >
                Every deal
                <span className="block">on course</span>
              </h1>

              <p
                /* 16px below md: at 18px this ran FOUR lines in the 342px
                   mobile column (measured 342×117 at 390) and read as a grey
                   slab under the h1. Both donors step the hero sub DOWN on
                   phones — Attio to 15px/2 lines (dumps4/mobile-hero-tree.json),
                   Natural further still. Component-scoped on purpose: the
                   shared type ladder in design-system/tokens.css is unchanged,
                   so this needs no @theme sync. */
                className="kz-enter mx-auto mt-6 max-w-[600px] text-[16px] leading-relaxed text-gray-700 md:mt-7 md:text-[18px]"
                style={delay(120)}
              >
                Live guidance on every sales call. The next question to ask, the moment it matters.
                Then written back to your CRM.
              </p>

              <div
                className="kz-enter mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
                style={delay(240)}
              >
                <a
                  href="#try"
                  className="kz-hover kz-focus-ring flex h-10 items-center justify-center rounded-button bg-ink px-5 text-[14px] font-medium text-surface-100 hover:bg-gray-800"
                  style={{ transitionProperty: 'background-color' }}
                >
                  Try for free
                </a>
                <a
                  href="#demo"
                  className="kz-hover kz-focus-ring flex h-10 items-center justify-center rounded-button border border-gray-400 bg-surface-100 px-5 text-[14px] font-medium text-ink hover:border-gray-500 hover:bg-surface-200"
                  style={{ transitionProperty: 'background-color, border-color' }}
                >
                  Book a demo
                </a>
              </div>

              <p
                className="kz-enter mt-6 font-mono font-[550] text-[11px] tracking-[0.12em] text-gray-600 uppercase"
                style={delay(360)}
              >
                Free plan · 14-day trial · No credit card
              </p>
            </div>
          </div>
        </div>

        <div
          ref={cardViewportRef}
          data-hero-card-viewport
          className="hero-curtain__card-viewport"
        >
          <div
            ref={cardRef}
            data-hero-card
            className="hero-curtain__card hero-curtain__card--enter relative mx-auto w-full max-w-[1200px] px-6 md:px-10"
            style={delay(480)}
          >
            {/* The scale lives on this wrapper, never on [data-hero-card]: the
                card is the rail's layout anchor (measureCardRest / frameHeight
                read its rect), so scaling it would drift the 00→100 range. */}
            <div className="hero-curtain__card-scale">
              {(stageFill === 'wallpaper' || PHOTO_FILLS.includes(stageFill)) && (
                <div
                  aria-hidden
                  className={`hero-curtain__card-bed hero-curtain__card-bed--${stageFill}`}
                />
              )}
              {/* Between bed (z0) and frame (z1) in DOM order, so the chrome
                  is the occluder — the drawing ends at the paw line and the
                  window supplies the edge. Rides this wrapper's step-back
                  scale and the card entrance; no motion of its own. */}
              <Lizzie
                variant="heropeek"
                className="hero-curtain__card-peek"
                style={{ height: 'auto', width: '12.62%' }}
              />
              <div className="hero-curtain__card-app">
                <AppFrame />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
