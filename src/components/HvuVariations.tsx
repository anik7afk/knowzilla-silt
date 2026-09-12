import { useEffect, useRef, useState, type ReactNode } from 'react'
import './HvuVariations.css'
import { HvuVariationsSet2, SET2_NAV } from './HvuVariationsSet2'
import { HvuVariationsSet3, SET3_NAV } from './HvuVariationsSet3'

/* Standalone exploration gallery — NOT on the landing page.
   Five compositions that all argue the same point: raw hearing is not
   understanding; Knowzilla collapses that gap by bringing the account into
   the sentence. Full visual freedom; pick a direction, then we port. */

const RAW =
  'yeah so look we we need more predict ability going into next year i mean every line item is is getting reviewed right now honestly'

const CTX = [
  { k: 'CRM', v: 'Renewal risk' },
  { k: 'Prior call', v: 'Budget pressure' },
  { k: 'Pricing', v: '12% discount' },
] as const

function useInView(once = true) {
  const ref = useRef<HTMLElement | null>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          if (once) io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])
  return { ref, on }
}

function Meta() {
  return (
    <p className="hvuv-meta">
      Northwind<span aria-hidden="true"> · </span>live call
      <span aria-hidden="true"> · </span>09:16
    </p>
  )
}

function SectionShell({
  id,
  n,
  name,
  thesis,
  children,
  tone = 'light',
}: {
  id: string
  n: string
  name: string
  thesis: string
  children: ReactNode
  tone?: 'light' | 'warm' | 'ink' | 'paper' | 'cool'
}) {
  return (
    <section className={`hvuv-sec hvuv-sec--${tone}`} id={id}>
      <div className="hvuv-sec__tag">
        <span className="hvuv-sec__n">{n}</span>
        <span className="hvuv-sec__name">{name}</span>
        <span className="hvuv-sec__thesis">{thesis}</span>
      </div>
      {children}
    </section>
  )
}

/* ─── 01 CASCADE — vertical processing pipeline ─────────────────────────── */
function Cascade() {
  const { ref, on } = useInView()
  return (
    <SectionShell
      id="v1"
      n="01"
      name="Cascade"
      thesis="Processing pipeline — raw collapses into structure stage by stage"
      tone="cool"
    >
      <article
        ref={ref as React.RefObject<HTMLElement>}
        className={`hvuv-cascade${on ? ' is-on' : ''}`}
      >
        <header className="hvuv-cascade__head">
          <h2>Hearing is not understanding.</h2>
          <p>Knowzilla brings the account into every sentence.</p>
          <Meta />
        </header>

        <ol className="hvuv-cascade__pipe">
          <li className="hvuv-cascade__stage hvuv-cascade__stage--raw">
            <div className="hvuv-cascade__rail">
              <span className="hvuv-cascade__dot" />
              <span className="hvuv-cascade__line" />
            </div>
            <div className="hvuv-cascade__card">
              <div className="hvuv-cascade__labelrow">
                <span className="hvuv-cascade__label">01 · Heard</span>
                <span className="hvuv-cascade__chip">unresolved</span>
              </div>
              <p className="hvuv-cascade__raw">{RAW}</p>
            </div>
          </li>

          <li className="hvuv-cascade__stage hvuv-cascade__stage--match">
            <div className="hvuv-cascade__rail">
              <span className="hvuv-cascade__dot hvuv-cascade__dot--live" />
              <span className="hvuv-cascade__line" />
            </div>
            <div className="hvuv-cascade__card hvuv-cascade__card--match">
              <div className="hvuv-cascade__labelrow">
                <span className="hvuv-cascade__label">02 · Matching account</span>
                <span className="hvuv-cascade__chip hvuv-cascade__chip--signal">
                  Δ1.30s
                </span>
              </div>
              <div className="hvuv-cascade__matchrow">
                {CTX.map((c) => (
                  <span key={c.k} className="hvuv-cascade__src">
                    <em>{c.k}</em>
                    {c.v}
                  </span>
                ))}
              </div>
            </div>
          </li>

          <li className="hvuv-cascade__stage hvuv-cascade__stage--done">
            <div className="hvuv-cascade__rail">
              <span className="hvuv-cascade__dot hvuv-cascade__dot--done" />
            </div>
            <div className="hvuv-cascade__card hvuv-cascade__card--done">
              <div className="hvuv-cascade__labelrow">
                <span className="hvuv-cascade__label">03 · Understood</span>
                <span className="hvuv-cascade__chip hvuv-cascade__chip--ok">
                  resolved
                </span>
              </div>
              <h3>
                We need more <mark>predictability.</mark>
              </h3>
              <p className="hvuv-cascade__verdict">
                Pricing concern · <span>high confidence</span>
              </p>
            </div>
          </li>
        </ol>
      </article>
    </SectionShell>
  )
}

/* ─── 02 LENS — raw field with a floating understanding lens ────────────── */
function Lens() {
  const { ref, on } = useInView()
  return (
    <SectionShell
      id="v2"
      n="02"
      name="Lens"
      thesis="Understanding as a lens over the raw stream — meaning floats above noise"
      tone="warm"
    >
      <article
        ref={ref as React.RefObject<HTMLElement>}
        className={`hvuv-lens${on ? ' is-on' : ''}`}
      >
        <header className="hvuv-lens__head">
          <h2>Hearing is not understanding.</h2>
          <p>Knowzilla brings the account into every sentence.</p>
        </header>

        <div className="hvuv-lens__field">
          <p className="hvuv-lens__raw" aria-hidden="true">
            {RAW} {RAW}
          </p>
          <div className="hvuv-lens__glass">
            <div className="hvuv-lens__glassbar">
              <span className="hvuv-lens__live" />
              <span>Northwind · live</span>
              <span className="hvuv-lens__delta">Δ1.30s</span>
            </div>
            <h3>
              We need more <em>predictability.</em>
            </h3>
            <ul className="hvuv-lens__ctx">
              {CTX.map((c) => (
                <li key={c.k}>
                  <span>{c.k}</span>
                  <strong>{c.v}</strong>
                </li>
              ))}
            </ul>
            <footer>
              Pricing concern · <span>high confidence</span>
            </footer>
          </div>
        </div>
      </article>
    </SectionShell>
  )
}

/* ─── 03 EDITORIAL — asymmetric type, insight dominates ─────────────────── */
function Editorial() {
  const { ref, on } = useInView()
  return (
    <SectionShell
      id="v3"
      n="03"
      name="Editorial"
      thesis="The insight is the hero — raw hearing is a footnote under it"
      tone="ink"
    >
      <article
        ref={ref as React.RefObject<HTMLElement>}
        className={`hvuv-ed${on ? ' is-on' : ''}`}
      >
        <div className="hvuv-ed__top">
          <p className="hvuv-ed__eyebrow">Account in the sentence</p>
          <Meta />
        </div>

        <h2 className="hvuv-ed__title">
          Hearing is not
          <br />
          understanding.
        </h2>

        <div className="hvuv-ed__insight">
          <p className="hvuv-ed__clean">
            We need more <span>predictability.</span>
          </p>
          <div className="hvuv-ed__chips">
            {CTX.map((c) => (
              <span key={c.k} className="hvuv-ed__chip">
                <b>{c.k}</b>
                {c.v}
              </span>
            ))}
          </div>
          <p className="hvuv-ed__verdict">
            <strong>Pricing concern</strong>
            <span>high confidence · resolved in 1.30s</span>
          </p>
        </div>

        <aside className="hvuv-ed__footnote">
          <span className="hvuv-ed__fnlabel">Heard now</span>
          <p>{RAW}</p>
        </aside>
      </article>
    </SectionShell>
  )
}

/* ─── 04 INSTRUMENT — specimen on a drafting floor ──────────────────────── */
function Instrument() {
  const { ref, on } = useInView()
  return (
    <SectionShell
      id="v4"
      n="04"
      name="Instrument"
      thesis="Recorded product moment — a live call window on drafting paper"
      tone="paper"
    >
      <article
        ref={ref as React.RefObject<HTMLElement>}
        className={`hvuv-inst${on ? ' is-on' : ''}`}
      >
        <header className="hvuv-inst__head">
          <h2>Hearing is not understanding.</h2>
          <p>Knowzilla brings the account into every sentence.</p>
        </header>

        <div className="hvuv-inst__stage">
          <span className="hvuv-inst__tick hvuv-inst__tick--tl" />
          <span className="hvuv-inst__tick hvuv-inst__tick--tr" />
          <span className="hvuv-inst__tick hvuv-inst__tick--bl" />
          <span className="hvuv-inst__tick hvuv-inst__tick--br" />

          <div className="hvuv-inst__window">
            <div className="hvuv-inst__chrome">
              <span className="hvuv-inst__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="hvuv-inst__wtitle">Northwind · live call · 09:16</span>
              <span className="hvuv-inst__badge">RESOLVED · Δ1.30s</span>
            </div>

            <div className="hvuv-inst__body">
              <div className="hvuv-inst__col hvuv-inst__col--in">
                <p className="hvuv-inst__lab">Input</p>
                <p className="hvuv-inst__raw">{RAW}</p>
              </div>

              <div className="hvuv-inst__arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="hvuv-inst__col hvuv-inst__col--out">
                <p className="hvuv-inst__lab">Resolved</p>
                <h3>
                  We need more <u>predictability.</u>
                </h3>
                <dl className="hvuv-inst__dl">
                  {CTX.map((c) => (
                    <div key={c.k}>
                      <dt>{c.k}</dt>
                      <dd>{c.v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="hvuv-inst__foot">
                  Pricing concern · high confidence
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </SectionShell>
  )
}

/* ─── 05 ANNOTATION — document with margin notes ────────────────────────── */
function Annotation() {
  const { ref, on } = useInView()
  return (
    <SectionShell
      id="v5"
      n="05"
      name="Annotation"
      thesis="The account writes in the margins — hearing gets marked up in place"
      tone="light"
    >
      <article
        ref={ref as React.RefObject<HTMLElement>}
        className={`hvuv-ann${on ? ' is-on' : ''}`}
      >
        <header className="hvuv-ann__head">
          <div>
            <h2>Hearing is not understanding.</h2>
            <p>Knowzilla brings the account into every sentence.</p>
          </div>
          <Meta />
        </header>

        <div className="hvuv-ann__sheet">
          <div className="hvuv-ann__doc">
            <p className="hvuv-ann__raw">
              yeah so look we we need more{' '}
              <span className="hvuv-ann__mark">
                predict ability
                <span className="hvuv-ann__caret" />
              </span>{' '}
              going into next year i mean every line item is is getting reviewed
              right now honestly
            </p>

            <div className="hvuv-ann__rewrite">
              <span className="hvuv-ann__rwlab">Resolved sentence</span>
              <p>
                We need more <strong>predictability.</strong>
              </p>
            </div>
          </div>

          <aside className="hvuv-ann__margin">
            <div className="hvuv-ann__note hvuv-ann__note--1">
              <span className="hvuv-ann__nlab">CRM</span>
              <p>Renewal risk</p>
            </div>
            <div className="hvuv-ann__note hvuv-ann__note--2">
              <span className="hvuv-ann__nlab">Prior call</span>
              <p>Budget pressure</p>
            </div>
            <div className="hvuv-ann__note hvuv-ann__note--3">
              <span className="hvuv-ann__nlab">Pricing</span>
              <p>12% discount</p>
            </div>
            <div className="hvuv-ann__verdict">
              <span>Pricing concern</span>
              <em>high confidence · Δ1.30s</em>
            </div>
          </aside>
        </div>
      </article>
    </SectionShell>
  )
}

type NavItem = { id: string; label: string; group: string }

const NAV: NavItem[] = [
  { id: 'v1', label: '01 Cascade', group: 'Sketches' },
  { id: 'v2', label: '02 Lens', group: 'Sketches' },
  { id: 'v3', label: '03 Editorial', group: 'Sketches' },
  { id: 'v4', label: '04 Instrument', group: 'Sketches' },
  { id: 'v5', label: '05 Annotation', group: 'Sketches' },
  ...SET2_NAV,
  ...SET3_NAV,
]

const GROUPS = ['Sketches', 'Attio motion', 'Converge'] as const

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '')
  const key = ids.join(',')
  useEffect(() => {
    const list = key.split(',')
    const els = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [key])
  return active
}

function SideNav({ active }: { active: string }) {
  return (
    <aside className="hvuv-side" aria-label="Variation navigator">
      <div className="hvuv-side__brand">
        <p className="hvuv-side__kicker">HVU lab</p>
        <h1 className="hvuv-side__title">Heard vs Understood</h1>
        <p className="hvuv-side__count">{NAV.length} takes</p>
      </div>

      <nav className="hvuv-side__nav">
        {GROUPS.map((group) => {
          const items = NAV.filter((n) => n.group === group)
          if (!items.length) return null
          return (
            <div key={group} className="hvuv-side__group">
              <p className="hvuv-side__glabel">{group}</p>
              {items.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  className={
                    active === n.id
                      ? 'hvuv-side__link is-active'
                      : 'hvuv-side__link'
                  }
                >
                  {n.label}
                </a>
              ))}
            </div>
          )
        })}
      </nav>

      <p className="hvuv-side__hint">
        Scroll to play · Round 3 has Replay on each card
      </p>
    </aside>
  )
}

export default function HvuVariations() {
  const ids = NAV.map((n) => n.id)
  const active = useActiveSection(ids)

  return (
    <div className="hvuv hvuv--shell">
      <SideNav active={active} />

      <main className="hvuv-main">
        <header className="hvuv-hero">
          <p className="hvuv-hero__kicker">
            Exploration · not on the landing page
          </p>
          <h1>Heard vs Understood — {NAV.length} takes</h1>
          <p className="hvuv-hero__sub">
            Same value in every frame. Round 3 pushes the Signal Converge
            animation you liked — orbit, spokes, magnet, radar, funnel. Use the
            left rail to jump; hit Replay on 16–25 to rewatch.
          </p>
        </header>

        <Cascade />
        <Lens />
        <Editorial />
        <Instrument />
        <Annotation />

        <div className="hvuv-divider" id="round-2">
          <p>Round 2 · Attio motion grammar</p>
        </div>
        <HvuVariationsSet2 />

        <div className="hvuv-divider" id="round-3">
          <p>Round 3 · Signal Converge family</p>
        </div>
        <HvuVariationsSet3 />

        <footer className="hvuv-end">
          Tell me which number (or mix) to take forward.
        </footer>
      </main>
    </div>
  )
}
