/* ---------------------------------------------------------------------------
 * §02 Design system — the tokens the finished page actually consumes.
 *
 * SOURCE OF TRUTH (owner mandate). This chapter documents the system AS BUILT,
 * not the pre-build v0.1 spec. Two consequences worth knowing before reading the
 * code:
 *   · Every swatch, shadow and radius is read out of the LIVE stylesheet at
 *     runtime — `getComputedStyle(document.documentElement)` against the real
 *     custom property, with the tokens.css value as a fallback. So a swatch here
 *     cannot disagree with the page: if someone edits tokens.css, this chapter
 *     changes with it, and if a property is deleted the fallback is visibly the
 *     only thing left.
 *   · The TYPE ladder is not read from tokens, because the page does not use the
 *     type tokens (see §02.6). The rungs below are the values the shipped
 *     components actually author, each cited to its call site.
 *
 * Retired things are presented as retired: olive is not shown as the telemetry
 * ramp (superseded by `--kz-signal-*`), and there is no monospace anywhere —
 * labels are Inter 500-600, tracked, with tabular figures.
 *
 * TWO REWRITES, 2026-07-29, both on the owner's instruction:
 *   · NO REFERENCE SITE IS NAMED. The chapter used to attribute half its values
 *     to one donor and half to the other, with an (N)/(A) provenance mark on
 *     every row. That is inside-baseball for the people who did the measuring.
 *     The distinction that survives is the one a reader can act on: MEASURED
 *     versus `~` INTERPOLATED. Code comments keep their references.
 *   · THE CALLOUTS ARE NOTES. Every bordered panel here was a paragraph; each is
 *     now one sentence carrying one load-bearing fact, at note size.
 * ------------------------------------------------------------------------- */
import { useState } from 'react'
import type { CSSProperties } from 'react'
import './DesignSystemChapter.css'

/* ------------------------------------------------------- live token reading */

/* One live CSSStyleDeclaration for the document root. It stays live, so it is
 * read once and reused; every lookup falls back to the tokens.css literal so a
 * missing property degrades to "documented but absent" rather than to blank. */
function useToken() {
  const [read] = useState(() => {
    const cs =
      typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null
    return (token: string, fallback: string): string => {
      const v = cs?.getPropertyValue(token).trim()
      return v && v.length > 0 ? v : fallback
    }
  })
  return read
}

const asHex = (v: string) => (/^#[0-9a-f]{3,8}$/i.test(v) ? v.toUpperCase() : v)

/* ------------------------------------------------------------------ colour */

type Step = { step: number; token: string; fb: string; prov?: string }

type Ramp = {
  name: string
  use: string
  tag?: string
  steps: Step[]
}

const g = (n: number, fb: string): Step => ({ step: n, token: `--kz-gray-${n}`, fb })
const a = (n: number, fb: string): Step => ({ step: n, token: `--kz-accent-${n}`, fb })
const s = (n: number, fb: string, prov?: string): Step => ({
  step: n,
  token: `--kz-signal-${n}`,
  fb,
  prov,
})

const RAMPS: Ramp[] = [
  {
    name: 'Gray',
    use: 'the warm structural ramp — every edge, every quiet ground',
    steps: [
      g(100, '#fafafa'),
      g(200, '#f6f6f6'),
      g(300, '#ececeb'),
      g(400, '#d7d6d4'),
      g(500, '#afafaf'),
      g(600, '#8c8b8a'),
      g(700, '#71706f'),
      g(800, '#454545'),
      g(900, '#262524'),
      g(1000, '#161514'),
    ],
  },
  {
    name: 'Lavender',
    use: 'the interactive accent, anchored at 600 — a mark, never an area',
    steps: [
      a(100, '#f0f2fd'),
      a(200, '#dbe0fa'),
      a(300, '#bec6f5'),
      a(400, '#9ea8f0'),
      a(500, '#7e8be9'),
      a(600, '#6a77e5'),
      a(700, '#5461cc'),
      a(800, '#3f4baf'),
      a(900, '#2c3587'),
      a(1000, '#1a1f59'),
    ],
  },
  {
    name: 'Signal blue',
    tag: 'telemetry',
    use: 'live data — three steps measured, seven interpolated on one H 219 ladder',
    steps: [
      s(100, '#e8f0ff', 'measured'),
      s(200, '#c8dbfe', '~'),
      s(300, '#a2c1fb', '~'),
      s(400, '#73a1f7', '~'),
      s(500, '#4985f3', '~'),
      s(600, '#266df0', 'measured'),
      s(700, '#245bc2', 'measured'),
      s(800, '#1f4a98', '~'),
      s(900, '#193871', '~'),
      s(1000, '#122649', '~'),
    ],
  },
  {
    name: 'Won',
    tag: 'status only',
    use: 'deal-won. Four steps exist because four are needed — no ramp for its own sake',
    steps: [
      { step: 100, token: '--kz-green-100', fb: '#e0fced' },
      { step: 200, token: '--kz-green-200', fb: '#cbf7e1', prov: 'measured' },
      { step: 700, token: '--kz-green-700', fb: '#0fc27b' },
      { step: 900, token: '--kz-green-900', fb: '#007d53' },
    ],
  },
  {
    name: 'At risk',
    tag: 'status only',
    use: 'deal-at-risk. Never decorative, never a warning about the interface',
    steps: [
      { step: 100, token: '--kz-red-100', fb: '#ffecec' },
      { step: 700, token: '--kz-red-700', fb: '#ff5b59' },
      { step: 900, token: '--kz-red-900', fb: '#c42422' },
    ],
  },
]

const ROLES: { token: string; fb: string; name: string; role: string }[] = [
  { token: '--kz-ink', fb: '#161514', name: 'Ink', role: 'all primary type' },
  { token: '--kz-ink-secondary', fb: '#71706f', name: 'Ink secondary', role: 'ledes, captions' },
  { token: '--kz-surface-100', fb: '#ffffff', name: 'Surface 100', role: 'the page' },
  { token: '--kz-surface-200', fb: '#fafafa', name: 'Surface 200', role: 'a tinted ground' },
  { token: '--kz-surface-300', fb: '#f6f6f6', name: 'Surface 300', role: 'a well, a chip' },
  {
    token: '--kz-hairline-2',
    fb: '#ececeb',
    name: 'Hairline 2',
    role: 'the separator — 74 of 95 borders',
  },
  { token: '--kz-gray-400', fb: '#d7d6d4', name: 'Gray 400', role: 'a drawn line, 1.5px' },
  { token: '--kz-accent-600', fb: '#6a77e5', name: 'Accent 600', role: 'interaction — as a mark' },
  { token: '--kz-signal-600', fb: '#266df0', name: 'Signal 600', role: 'live telemetry stroke' },
  { token: '--kz-green-900', fb: '#007d53', name: 'Won 900', role: 'deal-won text only' },
]

const CONTRACT = [
  ['100', 'background'],
  ['200', 'hover bg'],
  ['300', 'active bg'],
  ['400', 'border'],
  ['500', 'hover border'],
  ['600', 'active border · the anchor'],
  ['700', 'solid'],
  ['800', 'solid hover'],
  ['900', 'secondary text'],
  ['1000', 'primary text'],
]

/* -------------------------------------------------------------------- type */

type Rung = {
  k: string
  meta: string
  src: string
  sample: string
  style?: CSSProperties
  cls?: string
}

const DISPLAY: Rung[] = [
  {
    k: 'Hero headline · 44 / 76px',
    meta: 'Inter · 500 · lh 1.02 · -0.03em · sans, not display',
    src: 'Hero.tsx:235',
    sample: 'Every deal on course',
    cls: 'pch-ds-t--h1',
  },
  {
    k: 'Scene headline · ≤64px',
    meta: 'clamp(40px, 4.8vw, 64px) · display · 550 · lh 1.02 · -0.035em',
    src: 'HvuGlass.css:44',
    sample: 'Heard, and understood',
    style: {
      fontFamily: 'var(--kz-font-display)',
      fontSize: 'clamp(40px, 4.8vw, 64px)',
      lineHeight: 1.02,
      fontWeight: 550,
      letterSpacing: '-0.035em',
    },
  },
  {
    k: 'Closing headline · 36 / 48px',
    meta: 'display · 500 · lh 52px · -0.48px',
    src: 'ClosingCta.tsx:600',
    sample: 'Start with one call',
    cls: 'pch-ds-t--cta',
  },
  {
    k: 'Outcome headline · ≤46px',
    meta: 'clamp(30px, 4vw, 46px) · display · 600 · lh 1.02 · -0.025em',
    src: 'BeforeAfter.css:28',
    sample: 'Before, and after',
    style: {
      fontFamily: 'var(--kz-font-display)',
      fontSize: 'clamp(30px, 4vw, 46px)',
      lineHeight: 1.02,
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
  },
  {
    k: 'Chapter headline · ≤44px',
    meta: 'clamp(36px, 3.6vw, 44px) · display · 600 · lh 1.1 · -0.02em',
    src: 'PlatformChapters.css:346',
    sample: 'Four chapters, one platform',
    style: {
      fontFamily: 'var(--kz-font-display)',
      fontSize: 'clamp(36px, 3.6vw, 44px)',
      lineHeight: 1.1,
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
  },
]

const HEADING: Rung[] = [
  {
    k: 'Section heading · 40px',
    meta: 'display · 500 · lh 44px · -0.4px',
    src: 'Stats.tsx:323',
    sample: 'What changes when the call is guided',
    style: {
      fontFamily: 'var(--kz-font-display)',
      fontSize: 40,
      lineHeight: '44px',
      fontWeight: 500,
      letterSpacing: '-0.4px',
    },
  },
  {
    k: 'Section heading · 32px',
    meta: 'display · 500 · lh 40px · -0.32px (28px below md)',
    src: 'Testimonials.css:141',
    sample: 'The people on the call',
    style: {
      fontFamily: 'var(--kz-font-display)',
      fontSize: 32,
      lineHeight: '40px',
      fontWeight: 500,
      letterSpacing: '-0.32px',
    },
  },
  {
    k: 'Chapter title · 27px',
    meta: 'display · 600 · lh 1.15',
    src: 'PlatformChapters.css:612',
    sample: 'Live navigation',
    style: {
      fontFamily: 'var(--kz-font-display)',
      fontSize: 27,
      lineHeight: 1.15,
      fontWeight: 600,
    },
  },
  {
    k: 'Feature title · 18px',
    meta: 'sans · 600 · lh 26px · -0.01em',
    src: 'PlatformChapters.css:1595',
    sample: 'Written back to the CRM',
    style: { fontSize: 18, lineHeight: '26px', fontWeight: 600, letterSpacing: '-0.01em' },
  },
]

const BODY: Rung[] = [
  {
    k: 'Lede · 21px',
    meta: 'sans · 450 · -0.01em',
    src: 'BeforeAfter.css:115',
    sample: 'One team, two quarters, the same pipeline.',
    style: { fontSize: 21, lineHeight: 1.5, fontWeight: 450, letterSpacing: '-0.01em' },
  },
  {
    k: 'Lede · 18px',
    meta: 'sans · 400 · lh 1.625 · -0.1px',
    src: 'PlatformChapters.css:361',
    sample:
      'Live guidance on every sales call. The next question to ask, the moment it matters.',
    style: { fontSize: 18, lineHeight: 1.625, fontWeight: 400, letterSpacing: '-0.1px' },
  },
  {
    k: 'Lede · 17px',
    meta: 'sans · 450 · lh 1.55 · -0.01em',
    src: 'HvuGlass.css:78',
    sample: 'A transcript records what was said. It does not record what mattered.',
    style: { fontSize: 17, lineHeight: 1.55, fontWeight: 450, letterSpacing: '-0.01em' },
  },
  {
    k: 'Body · 15px',
    meta: 'sans · 400-450 · lh 24px · -0.075px',
    src: 'Testimonials.css:329',
    sample:
      'The reps who used it stopped taking notes and started listening. That was the whole change.',
    style: { fontSize: 15, lineHeight: '24px', fontWeight: 400, letterSpacing: '-0.075px' },
  },
  {
    k: 'UI · 14px',
    meta: 'sans · 450-500 · lh 20px · -0.14px — every button, link and nav item',
    src: 'Nav.tsx:57 · Hero.tsx:256',
    sample: 'Start navigating',
    style: { fontSize: 14, lineHeight: '20px', fontWeight: 500, letterSpacing: '-0.14px' },
  },
  {
    k: 'Caption · 13px',
    meta: 'sans · 450-500 · lh 20px · -0.13px',
    src: 'Stats.tsx:94 · Footer.tsx:62',
    sample: 'Measured across 4,200 recorded calls.',
    style: { fontSize: 13, lineHeight: '20px', fontWeight: 450, letterSpacing: '-0.13px' },
  },
]

const LABEL: Rung[] = [
  {
    k: 'Label · 11px',
    meta: 'sans · 550 · +0.12em · uppercase · tabular',
    src: 'Hero.tsx:271',
    sample: 'Free plan · 14-day trial · No credit card',
    style: {
      fontSize: 11,
      lineHeight: '16px',
      fontWeight: 550,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--kz-gray-600)',
    },
  },
  {
    k: 'Label · 10px',
    meta: 'sans · 550 · +0.12em · uppercase — inside the product window',
    src: 'mock/AppFrame.tsx:156',
    sample: 'Next step',
    style: {
      fontSize: 10,
      lineHeight: '16px',
      fontWeight: 550,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--kz-gray-600)',
    },
  },
  {
    k: 'Label · 9px',
    meta: 'sans · 550 · +0.1em · uppercase — the smallest label that exists',
    src: 'mock/AppFrame.tsx:505',
    sample: 'Confidence',
    style: {
      fontSize: 9,
      lineHeight: '14px',
      fontWeight: 550,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--kz-gray-600)',
    },
  },
]

const NUMERAL: Rung[] = [
  {
    k: 'KPI · 36px',
    meta: 'display · 500 · lh 40px · -0.36px · tabular-nums',
    src: 'Stats.tsx:90',
    sample: '41%',
    style: {
      fontFamily: 'var(--kz-font-display)',
      fontSize: 36,
      lineHeight: '40px',
      fontWeight: 500,
      letterSpacing: '-0.36px',
      fontVariantNumeric: 'tabular-nums',
    },
  },
  {
    k: 'Outcome · ≤72px',
    meta: 'clamp(48px, 6vw, 72px) · 600 · lh 1 · -0.03em · tabular-nums',
    src: 'BeforeAfter.css:317',
    sample: '3.2×',
    style: {
      fontSize: 'clamp(48px, 6vw, 72px)',
      lineHeight: 1,
      fontWeight: 600,
      letterSpacing: '-0.03em',
      fontVariantNumeric: 'tabular-nums',
    },
  },
]

/* ------------------------------------------------------------------- space */

const SPACE: { v: number; k: string; land?: boolean }[] = [
  { v: 24, k: 'card gap · mobile gutter (px-6)', land: true },
  { v: 40, k: 'container pad (px-10) — matched by hand, not by token', land: true },
  { v: 56, k: 'platform-chapter internal gutter' },
  { v: 64, k: 'chapter block top · testimonials close' },
  { v: 80, k: 'hero top, mobile · integrations top' },
  { v: 96, k: 'section close · testimonials top · closing-CTA top', land: true },
  { v: 104, k: 'heard-vs-understood top' },
  { v: 120, k: 'hero block, desktop · before/after top and bottom' },
  { v: 152, k: 'section intro — stats and platform chapters', land: true },
  { v: 240, k: 'CTA silence — the last thing before the footer', land: true },
]

const RHYTHM: [string, string, string][] = [
  ['Nav', 'h-20 sticky, no block padding', 'Nav.tsx:38'],
  ['Hero', '80 / 96 mobile · 128 desktop · top max(96px, 10svh)', 'Hero.css:4, 250, 345'],
  ['Integrations', '80 top · 0 bottom (112 at md)', 'IntegrationsStrip.tsx:36'],
  ['Kinetic conversation', 'no padding — 260svh tall, pinned at 100svh − 80px', 'KineticConversation.css:15'],
  ['Heard vs understood', '104 top · 120 bottom', 'HvuGlass.css:16'],
  ['Platform chapters', 'no root padding — intro 152 / 80, blocks 64 / 44', 'PlatformChapters.css:335, 548'],
  ['Stats', '96 / 64 mobile · 152 / 96 desktop', 'Stats.tsx:320'],
  ['Testimonials', '96 top · 64 bottom', 'Testimonials.css:95'],
  ['Before / after', '120 top · 120 bottom', 'BeforeAfter.css:16'],
  ['Closing CTA', '96 / 160 mobile · 120 / 240 desktop', 'ClosingCta.tsx:586'],
  ['Footer', '64 top · 32 bottom', 'Footer.tsx:28'],
]

const RADII: { token: string; fb: string; k: string }[] = [
  { token: '--kz-radius-button', fb: '20px', k: 'button · pill (N) · 10 sites' },
  { token: '--kz-radius-card', fb: '12px', k: 'card (A md) · 3 sites' },
  { token: '--kz-radius-tag', fb: '10px', k: 'tag (N) · 0 by name' },
  { token: '--kz-radius-tile', fb: '8px', k: 'tile (A sm)' },
  { token: '--kz-radius-input', fb: '8px', k: 'input · 6 sites' },
  { token: '--kz-radius-micro', fb: '4px', k: 'micro (N) · 34 sites' },
]

/* Kept, but at note size: the ledger's value is the pattern across nine rows, and
 * a paragraph per row buried it. One clause each, evidence in its own column. */
const DIVERGE: [string, string, string][] = [
  [
    'Type scale tokens',
    'Unreferenced. The page authors the same rungs as literals, which is why §02.2 documents the literals.',
    '0 hits in the flow',
  ],
  [
    'Inter Display',
    'Named first but never loaded, so every display heading falls through to Inter Variable — one face, two jobs, separated by weight and tracking.',
    'index.css:113 vs main.tsx:3-10',
  ],
  [
    'Spacing landmarks',
    'Unreferenced. The values survive as literals: 152, 96, 240.',
    'Stats.tsx:320 · ClosingCta.tsx:586',
  ],
  [
    'One container',
    'There is not one: 1200, 1216, 1280, 1120, 1024, 860px. The horizontal pad is consistent; the max-width is not.',
    '7 distinct widths',
  ],
  [
    'The label face',
    'Declared once, called never. Twenty ad-hoc label rules converged on it by hand.',
    'index.css:422 · 0 flow call sites',
  ],
  [
    'Two hairlines, one used',
    'The two-step hairline did not survive the build.',
    'hairline-1 5 sites vs hairline-2 74',
  ],
  [
    'Accent outside the frame',
    'One interaction border takes accent-600 in open page space — the clearest break of the mark rule.',
    'BeforeAfter.css:508',
  ],
  [
    'Off-token elevation',
    'Four glass shadows are built by hand instead of from the tokens. Deliberate for the material, unreconciled with the set.',
    'HvuGlass.css:145, 223, 396, 445',
  ],
  [
    'Olive · clean',
    'Retired page-wide, still defined so the decision is one revert away, referenced by nothing.',
    '0 references · as intended',
  ],
]

/* ------------------------------------------------------------- small parts */

function SpecRows({ rows }: { rows: Rung[] }) {
  return (
    <>
      {rows.map((r) => (
        <div className="pch-ds-spec" key={r.k}>
          <div>
            <div className="pch-ds-spec__k">{r.k}</div>
            <div className="pch-ds-spec__m">{r.meta}</div>
            <div className="pch-ds-spec__src">{r.src}</div>
          </div>
          <div className={`pch-ds-spec__s ${r.cls ?? ''}`} style={r.style}>
            {r.sample}
          </div>
        </div>
      ))}
    </>
  )
}

/* --------------------------------------------------------------------- page */

export default function DesignSystemChapter() {
  const t = useToken()

  return (
    <>
      <section className="pp-sec">
        <div className="pp-eyebrow">02.1 — Colour</div>
        <h2 className="pp-h">Colour system</h2>

        <div className="pch-ds-contract">
          {CONTRACT.map(([n, role]) => (
            <span key={n}>
              <b>{n}</b> {role}
            </span>
          ))}
        </div>

        <div className="pch-ds-grp">Roles</div>
        <div className="pch-ds-roles">
          {ROLES.map((r) => {
            const v = t(r.token, r.fb)
            return (
              <div key={r.token}>
                <div className="pch-ds-role__sw" style={{ background: v }} />
                <div className="pch-ds-role__nm">{r.name}</div>
                <div className="pch-ds-role__hx">{asHex(v)}</div>
                <div className="pch-ds-role__rl">{r.role}</div>
              </div>
            )
          })}
        </div>

        <div className="pch-ds-grp">Ramps</div>
        {RAMPS.map((ramp) => (
          <div className="pch-ds-ramp" key={ramp.name}>
            <div className="pch-ds-ramp__head">
              <span className="pch-ds-ramp__nm">{ramp.name}</span>
              {ramp.tag ? <span className="pch-ds-tag">{ramp.tag}</span> : null}
              <span className="pch-ds-ramp__use">{ramp.use}</span>
            </div>
            <div className="pch-ds-scroll">
              <div className="pch-ds-chips">
                {ramp.steps.map((st) => {
                  const v = t(st.token, st.fb)
                  return (
                    <div key={st.token} style={{ gridColumn: st.step / 100 }}>
                      <div className="pch-ds-chip__sw" style={{ background: v }} />
                      <div className="pch-ds-chip__st">
                        {st.step}
                        {st.prov === '~' ? ' ~' : ''}
                      </div>
                      <div className="pch-ds-chip__hx">{asHex(v)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}

        <p className="pch-ds-note">
          The olive telemetry accent measured <b>2.07:1</b> on white and was replaced page-wide by
          the signal ramp, at <b>4.64:1</b>.
        </p>

        <p className="pch-ds-note pch-ds-note--rule">
          Signal (H 219) and accent (H 236) are <b>17° apart</b> — never both saturated in one frame:
          signal is the stroke, accent drops to a tint.
        </p>

        <div className="pch-ds-grp">Tonal grounds</div>
        <div className="pch-ds-grounds">
          {[
            ['--kz-surface-100', '#ffffff', 'Surface 100', 'the page itself'],
            ['--kz-surface-200', '#fafafa', 'Surface 200', 'a section that needs to sit back'],
            ['--kz-surface-300', '#f6f6f6', 'Surface 300', 'a well, a chip, an inset'],
          ].map(([tok, fb, nm, role]) => {
            const v = t(tok, fb)
            return (
              <div className="pch-ds-ground" key={tok} style={{ background: v }}>
                <span>
                  {nm} — {role}
                </span>
                <span className="pch-ds-ground__m">
                  {asHex(v)} · {tok}
                </span>
              </div>
            )
          })}
        </div>
        <p className="pch-ds-note">
          Three steps, four percent apart, and no shadow between them — a section changes ground
          instead of casting.
        </p>

        <div className="pch-ds-grp">Accent is a mark, not an area</div>
        <div className="pch-ds-pair">
          <div className="pch-ds-pair__c">
            <div className="pch-ds-pair__lbl">Permitted</div>
            <div className="pch-ds-marks">
              <span className="pch-ds-marks__t">Start navigating</span>
              <span className="pch-ds-marks__rule" />
              <span className="pch-ds-marks__dot" />
              <span className="pch-ds-marks__glyph" />
            </div>
            <div className="pch-ds-pair__cap">
              Type at ≤16px, lines at 1-2px, marks at ≤24px. Anything larger comes from the neutral
              ladder.
            </div>
          </div>
          <div className="pch-ds-pair__c">
            <div className="pch-ds-pair__lbl pch-ds-pair__lbl--no">Not permitted</div>
            <div className="pch-ds-fill" />
            <div className="pch-ds-pair__cap">
              An accent area fill. One exception exists, and it is scoped: inside the hero product
              window colour may carry data, because there it means something.
            </div>
          </div>
        </div>
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">02.2 — Type</div>
        <h2 className="pp-h">Type system</h2>

        <div className="pch-ds-grp">Faces loaded</div>
        <div className="pch-ds-faces">
          <div className="pch-ds-face">
            <div className="pch-ds-face__g" style={{ fontFamily: 'var(--kz-font-body)' }}>
              Aa Kk 0123
            </div>
            <div className="pch-ds-face__nm">Inter Variable</div>
            <div className="pch-ds-face__m">
              wght 100-900 · carries body, headings, labels and figures — everything
            </div>
          </div>
          <div className="pch-ds-face">
            <div
              className="pch-ds-face__g"
              style={{ fontFamily: 'var(--kz-font-serif)', fontStyle: 'italic', fontWeight: 400 }}
            >
              Aa Kk 0123
            </div>
            <div className="pch-ds-face__nm">Newsreader Variable</div>
            <div className="pch-ds-face__m">
              roman + italic · an italic flourish inside a headline, and pull-quotes
            </div>
          </div>
          <div className="pch-ds-face">
            <div
              className="pch-ds-face__g"
              style={{ fontFamily: "'Bodoni Moda Variable', var(--kz-font-serif)", fontWeight: 500 }}
            >
              Aa Kk 0123
            </div>
            <div className="pch-ds-face__nm">Bodoni Moda Variable</div>
            <div className="pch-ds-face__m">
              one element on the page — the buyer's line in the kinetic scene
            </div>
          </div>
        </div>

        <p className="pch-ds-note">
          <b>No monospace, anywhere.</b> The mono eyebrow was a genre tic, not a measurement; the{' '}
          <span className="pch-ds-code">--font-mono</span> slot resolves to Inter so its forty call
          sites keep their tabular numerals.
        </p>

        <div className="pch-ds-grp">Weight — one variable axis, six stops in use</div>
        <div className="pch-ds-wts">
          {[
            [400, 'body, ledes'],
            [450, 'the default body weight ~'],
            [500, 'headings, UI'],
            [550, 'every uppercase label'],
            [600, 'chapter and outcome heads'],
          ].map(([w, use]) => (
            <div className="pch-ds-wt" key={String(w)}>
              <div className="pch-ds-wt__s" style={{ fontWeight: w as number }}>
                Navigate
              </div>
              <div className="pch-ds-wt__k">
                {w} — {use}
              </div>
            </div>
          ))}
        </div>
        <p className="pch-ds-note">
          Uppercase at 9-11px reads thinner than the mono it replaced, so every uppercase label sits
          at <b>550 or above</b>.
        </p>

        <div className="pch-ds-grp">Display</div>
        <SpecRows rows={DISPLAY} />

        <div className="pch-ds-grp">Heading</div>
        <SpecRows rows={HEADING} />

        <div className="pch-ds-grp">Lede and body</div>
        <SpecRows rows={BODY} />

        <div className="pch-ds-grp">Label</div>
        <SpecRows rows={LABEL} />

        <div className="pch-ds-grp">Numeral</div>
        <SpecRows rows={NUMERAL} />
        <p className="pch-ds-note">
          <b>Every figure on the page is tabular.</b> A count-up whose digits shift width reads as
          broken, so <span className="pch-ds-code">tabular-nums</span> travels with every number, and
          a build gate checks it.
        </p>
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">02.3 — Space</div>
        <h2 className="pp-h">Spacing system</h2>

        <div>
          {SPACE.map((sp) => (
            <div className="pch-ds-sp" key={sp.v}>
              <span className="pch-ds-sp__v">{sp.v}</span>
              <span
                className={`pch-ds-sp__bar${sp.land ? ' pch-ds-sp__bar--land' : ''}`}
                style={{ width: sp.v }}
              />
              <span className="pch-ds-sp__k">{sp.k}</span>
            </div>
          ))}
        </div>

        <div className="pch-ds-rhythm">
          <div className="pch-ds-lump">A section ends</div>
          <div className="pch-ds-gap" style={{ height: 48 }}>
            <span className="pch-ds-gap__t">96px — section close</span>
          </div>
          <div className="pch-ds-lump">The next one opens</div>
          <div className="pch-ds-gap" style={{ height: 76 }}>
            <span className="pch-ds-gap__t">152px — section intro</span>
          </div>
          <div className="pch-ds-lump">Its content</div>
          <div className="pch-ds-gap" style={{ height: 120 }}>
            <span className="pch-ds-gap__t">240px — CTA silence</span>
          </div>
          <div className="pch-ds-lump">One line, and the footer</div>
        </div>
        <p className="pch-ds-live" style={{ marginTop: 16 }}>
          Gaps in the diagram are drawn at half scale so the whole rhythm fits; the ladder above is
          the true one.
        </p>

        <div className="pch-ds-grp">The rhythm as shipped</div>
        <div className="pch-ds-tbl__wrap">
          <table className="pch-ds-tbl">
            <thead>
              <tr>
                <th>Section</th>
                <th>Block padding</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {RHYTHM.map(([sec, pad, src]) => (
                <tr key={sec}>
                  <td>{sec}</td>
                  <td>{pad}</td>
                  <td className="pch-ds-tbl__n">{src}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">02.4 — Line</div>
        <h2 className="pp-h">Line system</h2>

        <div className="pch-ds-lines">
          {[
            ['--kz-hairline-1', '#f6f6f6', 'Hairline 1', 'inside a component — 5 sites', false],
            ['--kz-hairline-2', '#ececeb', 'Hairline 2', 'the separator — ~74 sites', false],
            ['--kz-gray-300', '#ececeb', 'Gray 300', 'the same value, named for a role', true],
            ['--kz-gray-400', '#d7d6d4', 'Gray 400', 'quiet structure, at 1.5px', true],
          ].map(([tok, fb, nm, role, tinted]) => {
            const v = t(tok as string, fb as string)
            return (
              <div
                className={`pch-ds-line${tinted ? ' pch-ds-line--tinted' : ''}`}
                key={tok as string}
              >
                <div
                  className="pch-ds-line__r"
                  style={{ borderTop: `1px solid ${v}` }}
                />
                <div className="pch-ds-line__k">
                  <span>
                    {nm as string} — {role as string}
                  </span>
                  <span className="pch-ds-line__m">
                    {asHex(v)} · {tok as string}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="pch-ds-strokes">
          <div className="pch-ds-stroke pch-ds-stroke--thin">1px hairline</div>
          <div className="pch-ds-stroke pch-ds-stroke--quiet">1.5px · gray-400</div>
          <div className="pch-ds-stroke pch-ds-stroke--device">2px · gray-500</div>
        </div>
        <p className="pch-ds-note">
          <b>A 1.5px border silently computes to 1px</b> — Chromium floors fractional border-widths,
          so the two thick specimens are painted as an inset box-shadow and verified on the computed
          value.
        </p>
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">02.5 — Elevation & radius</div>
        <h2 className="pp-h">Elevation system</h2>

        <div className="pch-ds-elev">
          <div className="pch-ds-elev--frame">
            <div className="pch-ds-elev__bed pch-ds-elev__bed--white">
              <div className="pch-ds-elev__win">recorded product moment</div>
            </div>
            <div className="pch-ds-elev__cap">--kz-shadow-frame · product windows only · 3 sites</div>
            <div className="pch-ds-elev__val">{t('--kz-shadow-frame', 'not defined')}</div>
          </div>

          <div className="pch-ds-elev--frame">
            <div className="pch-ds-elev__bed pch-ds-elev__bed--white">
              <div className="pch-ds-elev__win">
                a frame
                <span className="pch-ds-elev__chip">Next step · 2 days</span>
              </div>
            </div>
            <div className="pch-ds-elev__cap">
              --kz-shadow-float · chips that float over a frame · 6 sites
            </div>
            <div className="pch-ds-elev__val">{t('--kz-shadow-float', 'not defined')}</div>
          </div>

          <div className="pch-ds-elev--card">
            <div className="pch-ds-elev__bed">
              <div className="pch-ds-elev__win">a card that genuinely floats</div>
            </div>
            <div className="pch-ds-elev__cap">
              --kz-shadow-card ~ · tinted grounds only · 1 site
            </div>
            <div className="pch-ds-elev__val">{t('--kz-shadow-card', 'not defined')}</div>
          </div>

          <div>
            <div className="pch-ds-elev__bed">
              <div className="pch-ds-elev__win pch-ds-plate">hover me</div>
            </div>
            <div className="pch-ds-elev__cap">
              --kz-shadow-hover · float → hover, with a 2px lift over 200ms
            </div>
            <div className="pch-ds-elev__val">{t('--kz-shadow-hover', 'not defined')}</div>
          </div>

          <div className="pch-ds-elev--stage">
            <div className="pch-ds-elev__bed">
              <div className="pch-ds-elev__win">the hero stage — 1200px wide</div>
            </div>
            <div className="pch-ds-elev__cap">
              --kz-shadow-stage ~ · one element on the page
            </div>
            <div className="pch-ds-elev__val">{t('--kz-shadow-stage', 'not defined')}</div>
          </div>

          <div>
            <div className="pch-ds-elev__bed pch-ds-elev__bed--white">
              <div className="pch-ds-elev__win" style={{ border: 'none' }}>
                <button type="button" className="pch-ds-focus">
                  Tab to me
                </button>
              </div>
            </div>
            <div className="pch-ds-elev__cap">
              The focus ring — the only other box-shadow allowed anywhere
            </div>
            <div className="pch-ds-elev__val">
              0 0 0 2px #fff, 0 0 0 4px {asHex(t('--kz-accent-300', '#bec6f5'))} · index.css:434
            </div>
          </div>
        </div>

        <p className="pch-ds-note pch-ds-note--rule">
          <b>A lift on white has no cause.</b> The card shadow is permitted only on a tinted ground,
          where it confirms a separation the ground already states.
        </p>

        <div className="pch-ds-grp">Radius</div>
        <div className="pch-ds-radii">
          {RADII.map((r) => {
            const v = t(r.token, r.fb)
            return (
              <div key={r.token}>
                <div className="pch-ds-radius__b" style={{ borderRadius: v }} />
                <div className="pch-ds-radius__k">
                  {r.k} · {v}
                </div>
              </div>
            )
          })}
        </div>
        <p className="pch-ds-note">
          Nothing calls <span className="pch-ds-code">rounded-tag</span> by name; twelve places write{' '}
          <span className="pch-ds-code">rounded-[10px]</span> — same number, no name.
        </p>
      </section>

      <section className="pp-sec">
        <div className="pp-eyebrow">02.6 — The audit</div>
        <h2 className="pp-h">Token audit</h2>

        <div className="pch-ds-tbl__wrap">
          <table className="pch-ds-tbl">
            <thead>
              <tr>
                <th>Token</th>
                <th>What the build actually does</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {DIVERGE.map(([k, what, ev]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{what}</td>
                  <td className="pch-ds-tbl__n">{ev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="pch-ds-note">
          <b>The pattern:</b> colour, elevation and radius held as tokens; type and spacing were
          re-authored as literals and converged on the same values by hand. The fix is mechanical, not
          a redesign.
        </p>
      </section>
    </>
  )
}
