import { memo, useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import { LiveAssistant } from './tour/LiveAssistant'
import { KnowledgeBase } from './tour/KnowledgeBase'
import { Playground } from './tour/Playground'
import { Dashboard } from './tour/Dashboard'
import './Tour.css'

/* =====================================================================
 * Tour — the platform-tour centrepiece, rebuilt on Attio's measured
 * mechanism (inspo/attio/DESIGN.md §4.4): NOTHING is scroll-scrubbed.
 * The module articles scroll natively in document flow; only the left
 * rail is sticky, and its active pill follows scroll — the flip fires
 * when an article's top crosses ~38% of the viewport (Attio: 330–380px),
 * with a plain color/border transition. Showcases blur-enter once on
 * viewport entry (kz-enter) and then hold their settled frame — Session 5
 * rations this section to QUIET, so no module runs a scene of its own.
 * ===================================================================== */

type Module = {
  index: string
  module: string
  title: ReactNode
  body: string
  cta: string
  features: string[]
  Visual: ComponentType
}

const MODULES: Module[] = [
  {
    index: '01',
    module: 'Live Assistant',
    title: (
      <>
        A copilot in every call — <span className="text-ink-secondary">visible only to you.</span>
      </>
    ),
    body: 'Live answers, next-best actions and objection handling surface the moment a buyer speaks, drawn from your own playbooks.',
    cta: 'See the live assistant',
    features: ['Live answers', 'Next best action', 'Objection handling', 'Battlecards'],
    Visual: LiveAssistant,
  },
  {
    index: '02',
    module: 'Knowledge Base',
    title: (
      <>
        One source of truth <span className="text-ink-secondary">the AI reads from.</span>
      </>
    ),
    body: 'Playbooks, pricing and battlecards are indexed and kept in sync, so every answer on every call stays on-message.',
    cta: 'Explore the knowledge base',
    features: ['Playbooks', 'Pricing guides', 'Battlecards', 'CRM context'],
    Visual: KnowledgeBase,
  },
  {
    index: '03',
    module: 'Playground',
    title: (
      <>
        Practice the hard calls <span className="text-ink-secondary">before they’re real.</span>
      </>
    ),
    body: 'AI buyer personas roleplay cold calls and email threads, scored on the five moves that actually win deals.',
    cta: 'Open the playground',
    features: ['Cold-call sims', 'Email practice', '5-dimension scoring', 'AI buyer personas'],
    Visual: Playground,
  },
  {
    index: '04',
    module: 'Dashboard & Insights',
    title: (
      <>
        Roll live execution <span className="text-ink-secondary">up into the number.</span>
      </>
    ),
    body: 'Live sessions, practice scores and coaching triggers roll into one team view — so managers coach from signal, not a call sample.',
    cta: 'See the dashboard',
    features: ['Win-rate trends', 'Coaching triggers', 'Team scorecards', 'Deal insights'],
    Visual: Dashboard,
  },
]

/* Attio flips the rail when the next article's top reaches ~330–380px from
 * the viewport top (header 116 + ~220 margin). As a fraction of their 900px
 * measurement viewport that's ~0.38. */
const FLIP_LINE = 0.38

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const recalc = () => setReduced(mq.matches)
    mq.addEventListener('change', recalc)
    return () => mq.removeEventListener('change', recalc)
  }, [])
  return reduced
}

/* ── one natively-scrolling module article ──────────────────────────────── */

const TourArticle = memo(function TourArticle({
  m,
  reduced,
  articleRef,
}: {
  m: Module
  reduced: boolean
  articleRef: (el: HTMLElement | null) => void
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 })
  const Visual = m.Visual
  const enter = (delayMs: number) =>
    reduced
      ? {}
      : {
          className: inView ? 'kz-enter' : 'opacity-0',
          style: { '--enter-delay': `${delayMs}ms` } as React.CSSProperties,
        }
  const e0 = enter(0)
  const e1 = enter(60)
  const e2 = enter(140)
  const e3 = enter(220)

  return (
    <article ref={articleRef} className="border-b border-hairline-2 py-14 first:pt-2 last:border-b-0 md:py-20">
      <div ref={ref}>
        <span
          className={`font-mono font-[550] text-[10px] tracking-[0.14em] text-gray-500 uppercase lg:hidden ${e0.className ?? ''}`}
          style={e0.style}
        >
          [{m.index}] · {m.module}
        </span>
        <h3
          className={`mt-3 max-w-[560px] text-[24px] font-medium leading-tight tracking-[-0.01em] text-ink [text-wrap:balance] lg:mt-0 ${e0.className ?? ''}`}
          style={e0.style}
        >
          {m.title}
        </h3>
        <p className={`mt-3 max-w-[560px] text-[15px] leading-relaxed text-gray-700 ${e1.className ?? ''}`} style={e1.style}>
          {m.body}
        </p>

        <div className={`mt-8 ${e2.className ?? ''}`} style={e2.style}>
          <Visual />
        </div>

        <div className={`mt-7 flex flex-wrap items-center gap-x-7 gap-y-2.5 ${e3.className ?? ''}`} style={e3.style}>
          {m.features.map((f) => (
            <span
              key={f}
              className="flex items-center gap-2.5 font-mono font-[550] text-[11px] tracking-[0.08em] text-gray-600 uppercase"
            >
              <span className="size-1 shrink-0 rounded-full bg-accent-600" />
              {f}
            </span>
          ))}
          <a
            href="#"
            className="kz-hover kz-focus-ring group ml-auto inline-flex items-center gap-1.5 rounded-micro text-[14px] font-[550] text-ink hover:text-accent-600"
            style={{ transitionProperty: 'color' }}
          >
            {m.cta}
            <ArrowRight
              size={15}
              strokeWidth={1.75}
              className="transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </article>
  )
})

/* ── section ────────────────────────────────────────────────────────────── */

export default function Tour() {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState(0)
  const articleRefs = useRef<(HTMLElement | null)[]>([])

  // Rail follows scroll: the last article whose top has crossed the flip
  // line is active. rAF-throttled; setActive bails when unchanged, so this
  // re-renders only on actual flips (Attio measures the same behaviour).
  useEffect(() => {
    let raf = 0
    const recalc = () => {
      raf = 0
      const line = window.innerHeight * FLIP_LINE
      let idx = 0
      articleRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) idx = i
      })
      setActive((a) => (a === idx ? a : idx))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(recalc)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const jump = (i: number) => {
    const el = articleRefs.current[i]
    if (!el) return
    const top = window.scrollY + el.getBoundingClientRect().top - window.innerHeight * (FLIP_LINE - 0.08)
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <section className="border-t border-hairline-2 bg-surface-200 pb-24 md:pb-[152px]">
      <div className="mx-auto max-w-[1200px] px-6 pt-24 md:px-10 md:pt-[152px]">
        <div className="max-w-[680px]">
          <span className="inline-flex h-6 items-center rounded-tag bg-surface-100 px-2.5 font-mono text-[12px] font-medium tracking-[0.4px] text-ink-secondary uppercase">
            Platform
          </span>
          <h2 className="mt-5 font-display text-[40px] font-medium leading-[44px] tracking-[-0.4px] [text-wrap:balance]">
            <span className="text-ink">Four modules, </span>
            <span className="text-ink-secondary">one execution loop.</span>
          </h2>
          <p className="mt-5 max-w-[560px] text-[16px] leading-relaxed text-gray-700">
            From the docs that arm the copilot to the number a manager acts on — one continuous loop,
            live on every call.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 items-start gap-12 md:mt-14 lg:grid-cols-[268px_minmax(0,1fr)]">
          {/* sticky module rail (≥lg) — the only pinned thing in the section */}
          <nav className="sticky top-28 hidden flex-col gap-1 self-start pt-2 lg:flex" aria-label="Platform modules">
            {MODULES.map((m, i) => (
              <button
                key={m.index}
                type="button"
                onClick={() => jump(i)}
                className={`kz-focus-ring flex cursor-pointer flex-col items-start gap-0.5 rounded-micro border-l-[1.5px] py-2.5 pl-4 text-left transition-colors duration-500 ${
                  i === active ? 'border-accent-600' : 'border-hairline-2 hover:border-gray-400'
                }`}
              >
                <span
                  className={`font-mono font-[550] text-[10px] tracking-[0.14em] uppercase transition-colors duration-500 ${
                    i === active ? 'text-accent-600' : 'text-gray-500'
                  }`}
                >
                  [{m.index}]
                </span>
                <span
                  className={`text-[15px] font-[600] tracking-[-0.01em] transition-colors duration-500 ${
                    i === active ? 'text-ink' : 'text-gray-600'
                  }`}
                >
                  {m.module}
                </span>
              </button>
            ))}
          </nav>

          {/* module articles — native scroll, no scrubbing */}
          <div className="flex flex-col">
            {MODULES.map((m, i) => (
              <TourArticle
                key={m.index}
                m={m}
                reduced={reduced}
                articleRef={(el) => {
                  articleRefs.current[i] = el
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
