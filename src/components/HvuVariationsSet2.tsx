import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import './HvuVariationsSet2.css'

/* Round 2 — ten Attio-inspired compositions. Animation is the point:
   house blur-entrance, word flip, connector draw-on, mask wipe, lag tick,
   blue-glow resolve, once-play beats. Landing page untouched. */

const RAW =
  'yeah so look we we need more predict ability going into next year i mean every line item is is getting reviewed right now honestly'
const RAW_WORDS = RAW.split(' ')
const CLEAN = ['We', 'need', 'more', 'predictability.'] as const
const CTX = [
  { k: 'CRM', v: 'Renewal risk' },
  { k: 'Prior call', v: 'Budget pressure' },
  { k: 'Pricing', v: '12% discount' },
] as const
const LAG_LOCK = 1.3

function useReduced() {
  const [r, setR] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setR(mq.matches)
    const fn = () => setR(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return r
}

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
      { threshold: 0.28 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])
  return { ref, on }
}

/** Fires step indices at absolute ms offsets once `on` becomes true. */
function useBeat(on: boolean, offsets: readonly number[], reduced: boolean) {
  const [step, setStep] = useState(0)
  const key = offsets.join(',')
  useEffect(() => {
    if (!on) return
    if (reduced) {
      setStep(offsets.length)
      return
    }
    setStep(0)
    const timers = offsets.map((t, i) =>
      window.setTimeout(() => setStep(i + 1), t),
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- offsets identity via key
  }, [on, reduced, key])
  return step
}

function useLag(
  on: boolean,
  startMs: number,
  endMs: number,
  lock = LAG_LOCK,
  reduced = false,
) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!on || !ref.current) return
    if (reduced) {
      ref.current.textContent = lock.toFixed(2)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const e = now - t0
      let v = 0
      if (e >= startMs) {
        const u = Math.min(1, (e - startMs) / Math.max(1, endMs - startMs))
        v = u * lock
      }
      if (ref.current) ref.current.textContent = v.toFixed(2)
      if (e < endMs + 400) raf = requestAnimationFrame(tick)
      else if (ref.current) ref.current.textContent = lock.toFixed(2)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [on, startMs, endMs, lock, reduced])
  return ref
}

function Meta({ light = false }: { light?: boolean }) {
  return (
    <p className={`hv2-meta${light ? ' hv2-meta--light' : ''}`}>
      Northwind<span aria-hidden="true"> · </span>live call
      <span aria-hidden="true"> · </span>09:16
    </p>
  )
}

function Shell({
  id,
  n,
  name,
  thesis,
  tone,
  children,
}: {
  id: string
  n: string
  name: string
  thesis: string
  tone: string
  children: ReactNode
}) {
  return (
    <section className={`hvuv-sec hv2-sec--${tone}`} id={id}>
      <div className="hvuv-sec__tag">
        <span className="hvuv-sec__n">{n}</span>
        <span className="hvuv-sec__name">{name}</span>
        <span className="hvuv-sec__thesis">{thesis}</span>
      </div>
      {children}
    </section>
  )
}

/* ─── 06 WORKFLOW — Attio Convert-leads canvas ──────────────────────────── */
const WF_BEAT = [0, 600, 1400, 2200, 3000, 3800]
function Workflow() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const step = useBeat(on, WF_BEAT, reduced)
  const lag = useLag(on, 1400, 2700, LAG_LOCK, reduced)
  return (
    <Shell
      id="v6"
      n="06"
      name="Workflow"
      thesis="Attio Convert-leads canvas — nodes, blue connectors, status pills"
      tone="grid"
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv2-wf${on ? ' is-on' : ''} s${step}`}
      >
        <header className="hv2-head">
          <h2>
            Hearing is <span>not understanding.</span>
          </h2>
          <p>Knowzilla brings the account into every sentence.</p>
        </header>

        <div className="hv2-wf__canvas">
          <svg className="hv2-wf__wires" viewBox="0 0 900 220" aria-hidden="true">
            <path
              className="hv2-wf__wire hv2-wf__wire--1"
              d="M210 110 C300 110, 300 110, 345 110"
              fill="none"
              strokeWidth="1.5"
            />
            <path
              className="hv2-wf__wire hv2-wf__wire--2"
              d="M555 110 C640 110, 640 110, 690 110"
              fill="none"
              strokeWidth="1.5"
            />
          </svg>

          <div className="hv2-wf__lag">
            <span className="hv2-wf__laglab">{step >= 4 ? 'resolved' : 'matching…'}</span>
            <span className="hv2-wf__lagdelta">
              Δ<span ref={lag}>0.00</span>s
            </span>
          </div>

          <div className="hv2-wf__node hv2-wf__node--1">
            <span className="hv2-wf__pill">{step >= 1 ? '✓ Triggered' : 'Waiting'}</span>
            <h3>Live utterance</h3>
            <p className="hv2-wf__raw">{RAW}</p>
          </div>

          <div className="hv2-wf__node hv2-wf__node--2">
            <span className={`hv2-wf__ring${step >= 2 && step < 4 ? ' is-spin' : ''}`} />
            <span className="hv2-wf__pill hv2-wf__pill--run">
              {step >= 4 ? '✓ Completed' : step >= 2 ? 'Running' : 'Queued'}
            </span>
            <h3>Account lookup</h3>
            <ul>
              {CTX.map((c, i) => (
                <li
                  key={c.k}
                  style={{ '--i': i } as CSSProperties}
                  className={step >= 3 ? 'is-on' : ''}
                >
                  <em>{c.k}</em>
                  {c.v}
                </li>
              ))}
            </ul>
          </div>

          <div className="hv2-wf__node hv2-wf__node--3">
            <span className="hv2-wf__pill hv2-wf__pill--ok">
              {step >= 5 ? '✓ Resolved' : 'Pending'}
            </span>
            <h3>
              We need more <u>predictability.</u>
            </h3>
            <p>Pricing concern · high confidence</p>
          </div>
        </div>
        <Meta />
      </article>
    </Shell>
  )
}

/* ─── 07 MASK WIPE — Attio forecast mask-size reveal ────────────────────── */
const MW_BEAT = [400, 1200, 1800, 2400]
function MaskWipe() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const step = useBeat(on, MW_BEAT, reduced)
  return (
    <Shell
      id="v7"
      n="07"
      name="Mask wipe"
      thesis="Same words, two layers — mask wipe reveals understanding underneath"
      tone="wash"
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv2-mw${on ? ' is-on' : ''} s${step}`}
      >
        <header className="hv2-head hv2-head--center">
          <h2>
            Hearing is <span>not understanding.</span>
          </h2>
          <p>Knowzilla brings the account into every sentence.</p>
        </header>

        <div className="hv2-mw__stage">
          <p className="hv2-mw__raw" aria-hidden="true">
            {RAW}
          </p>
          <p className="hv2-mw__clean" aria-label="We need more predictability.">
            We need more <em>predictability.</em>
          </p>
          <div className="hv2-mw__ctx">
            {CTX.map((c, i) => (
              <div key={c.k} style={{ '--i': i } as CSSProperties}>
                <span>{c.k}</span>
                <strong>{c.v}</strong>
              </div>
            ))}
          </div>
          <p className="hv2-mw__verdict">
            Pricing concern · high confidence · resolved Δ1.30s
          </p>
        </div>
      </article>
    </Shell>
  )
}

/* ─── 08 CALL STAGE — Attio hero product window ─────────────────────────── */
const CS_BEAT = [200, 500, 900, 1400, 2000, 2600, 3200]
function CallStage() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const step = useBeat(on, CS_BEAT, reduced)
  const lag = useLag(on, 1400, 2600, LAG_LOCK, reduced)
  return (
    <Shell
      id="v8"
      n="08"
      name="Call stage"
      thesis="Attio hero product window — transcript pane + context rail in chrome"
      tone="stage"
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv2-cs${on ? ' is-on' : ''} s${step}`}
      >
        <header className="hv2-head hv2-head--center">
          <h2>
            Hearing is <span>not understanding.</span>
          </h2>
          <p>Knowzilla brings the account into every sentence.</p>
        </header>

        <div className="hv2-cs__win">
          <div className="hv2-cs__chrome">
            <span className="hv2-cs__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="hv2-cs__title">Northwind · live call · 09:16</span>
            <span className={`hv2-cs__badge${step >= 6 ? ' is-done' : ''}`}>
              {step >= 6 ? 'RESOLVED' : 'MATCHING'} · Δ<span ref={lag}>0.00</span>s
            </span>
          </div>
          <div className="hv2-cs__body">
            <div className="hv2-cs__left">
              <p className="hv2-lab">Transcript</p>
              <p className="hv2-cs__stream">
                {RAW_WORDS.map((w, i) => (
                  <span
                    key={i}
                    className="hv2-cs__w"
                    style={{ '--i': i } as CSSProperties}
                  >
                    {w}{' '}
                  </span>
                ))}
              </p>
            </div>
            <aside className="hv2-cs__rail">
              <p className="hv2-lab">Understood</p>
              <h3 className="hv2-cs__clean">
                We need more <u>predictability.</u>
              </h3>
              <ul className="hv2-cs__ctx">
                {CTX.map((c, i) => (
                  <li key={c.k} style={{ '--i': i } as CSSProperties}>
                    <span>{c.k}</span>
                    <strong>{c.v}</strong>
                  </li>
                ))}
              </ul>
              <p className="hv2-cs__verdict">
                Pricing concern · <em>high confidence</em>
              </p>
            </aside>
          </div>
        </div>
      </article>
    </Shell>
  )
}

/* ─── 09 WORD FLIP — Attio quote word colour resolve ────────────────────── */
const WF2_BEAT = [300, 900, 1600, 2200]
function WordFlip() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const step = useBeat(on, WF2_BEAT, reduced)
  return (
    <Shell
      id="v9"
      n="09"
      name="Word flip"
      thesis="Attio quote grammar — muted words flip to ink, then context lands"
      tone="quote"
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv2-flip${on ? ' is-on' : ''} s${step}`}
      >
        <p className="hv2-flip__eye">Account in the sentence</p>
        <h2 className="hv2-flip__h">
          Hearing is <span>not understanding.</span>
        </h2>

        <p className="hv2-flip__raw" aria-hidden={step >= 1}>
          {RAW_WORDS.map((w, i) => (
            <span key={i} style={{ '--i': i } as CSSProperties}>
              {w}{' '}
            </span>
          ))}
        </p>

        <p className="hv2-flip__clean" aria-label="We need more predictability.">
          {CLEAN.map((w, i) => (
            <span
              key={w}
              className={i === 3 ? 'hv2-flip__key' : undefined}
              style={{ '--i': i } as CSSProperties}
            >
              {w}{' '}
            </span>
          ))}
        </p>

        <div className="hv2-flip__ctx">
          {CTX.map((c, i) => (
            <span key={c.k} style={{ '--i': i } as CSSProperties}>
              <b>{c.k}</b>
              {c.v}
            </span>
          ))}
        </div>
        <p className="hv2-flip__verdict">
          Pricing concern · high confidence · Δ1.30s
        </p>
        <Meta />
      </article>
    </Shell>
  )
}

/* ─── 10 FLOATING BRIEF — Attio pipeline overlay card ───────────────────── */
const FB_BEAT = [200, 800, 1400, 2000, 2600]
function FloatingBrief() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const step = useBeat(on, FB_BEAT, reduced)
  const lag = useLag(on, 800, 2000, LAG_LOCK, reduced)
  return (
    <Shell
      id="v10"
      n="10"
      name="Floating brief"
      thesis="Transcript stream + floating resolve card that slides over it"
      tone="wash"
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv2-fb${on ? ' is-on' : ''} s${step}`}
      >
        <header className="hv2-head">
          <h2>
            Hearing is <span>not understanding.</span>
          </h2>
          <p>Knowzilla brings the account into every sentence.</p>
          <Meta />
        </header>

        <div className="hv2-fb__board">
          <div className="hv2-fb__stream">
            <p className="hv2-lab">Heard now</p>
            {RAW_WORDS.map((w, i) => (
              <span
                key={i}
                className="hv2-fb__tok"
                style={{ '--i': i } as CSSProperties}
              >
                {w}
              </span>
            ))}
          </div>

          <div className="hv2-fb__card">
            <div className="hv2-fb__bar">
              <span className="hv2-fb__live" />
              Understood in context
              <em>
                Δ<span ref={lag}>0.00</span>s
              </em>
            </div>
            <h3>
              We need more <u>predictability.</u>
            </h3>
            <ul>
              {CTX.map((c, i) => (
                <li key={c.k} style={{ '--i': i } as CSSProperties}>
                  <span>{c.k}</span>
                  <strong>{c.v}</strong>
                </li>
              ))}
            </ul>
            <p>Pricing concern · high confidence</p>
          </div>
        </div>
      </article>
    </Shell>
  )
}

/* ─── 11 SIGNAL CONVERGE — chips fall into a verdict ────────────────────── */
const SC_BEAT = [300, 900, 1600, 2300, 3000]
function SignalConverge() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const step = useBeat(on, SC_BEAT, reduced)
  return (
    <Shell
      id="v11"
      n="11"
      name="Signal converge"
      thesis="Context signals orbit then collapse into one resolved sentence"
      tone="dark"
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv2-sc${on ? ' is-on' : ''} s${step}`}
      >
        <header className="hv2-head hv2-head--light">
          <h2>
            Hearing is <span>not understanding.</span>
          </h2>
          <p>Knowzilla brings the account into every sentence.</p>
        </header>

        <div className="hv2-sc__orbit">
          <p className="hv2-sc__raw">{RAW}</p>
          {CTX.map((c, i) => (
            <div
              key={c.k}
              className={`hv2-sc__chip hv2-sc__chip--${i}`}
              style={{ '--i': i } as CSSProperties}
            >
              <em>{c.k}</em>
              {c.v}
            </div>
          ))}
          <div className="hv2-sc__core">
            <h3>
              We need more <em>predictability.</em>
            </h3>
            <p>Pricing concern · high confidence · Δ1.30s</p>
          </div>
        </div>
      </article>
    </Shell>
  )
}

/* ─── 12 STATE RAIL — Attio sticky rail + showcase swap ─────────────────── */
const SR_BEAT = [400, 1800, 3200]
function StateRail() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const step = useBeat(on, SR_BEAT, reduced)
  const mode = step >= 2 ? 'understood' : 'heard'
  return (
    <Shell
      id="v12"
      n="12"
      name="State rail"
      thesis="Sticky state rail — showcase crossfades Heard → Understood"
      tone="wash"
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv2-sr${on ? ' is-on' : ''} hv2-sr--${mode} s${step}`}
      >
        <header className="hv2-head">
          <h2>
            Hearing is <span>not understanding.</span>
          </h2>
          <p>Knowzilla brings the account into every sentence.</p>
        </header>

        <div className="hv2-sr__layout">
          <nav className="hv2-sr__rail" aria-label="State">
            <button type="button" className={mode === 'heard' ? 'is-active' : ''} tabIndex={-1}>
              Heard now
            </button>
            <button
              type="button"
              className={mode === 'understood' ? 'is-active' : ''}
              tabIndex={-1}
            >
              Understood
            </button>
            <span className="hv2-sr__lag">Δ1.30s</span>
          </nav>

          <div className="hv2-sr__stage">
            <div className="hv2-sr__pane hv2-sr__pane--heard">
              <p className="hv2-lab">Raw stream</p>
              <p>{RAW}</p>
            </div>
            <div className="hv2-sr__pane hv2-sr__pane--understood">
              <p className="hv2-lab">In context</p>
              <h3>
                We need more <u>predictability.</u>
              </h3>
              <ul>
                {CTX.map((c) => (
                  <li key={c.k}>
                    <span>{c.k}</span>
                    <strong>{c.v}</strong>
                  </li>
                ))}
              </ul>
              <p className="hv2-sr__verdict">Pricing concern · high confidence</p>
            </div>
          </div>
        </div>
        <Meta />
      </article>
    </Shell>
  )
}

/* ─── 13 ENRICH — Attio self-building blue-glow cells ───────────────────── */
const EN_BEAT = [200, 700, 1100, 1500, 1900, 2400]
function Enrich() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const step = useBeat(on, EN_BEAT, reduced)
  return (
    <Shell
      id="v13"
      n="13"
      name="Enrich"
      thesis="Self-building record — skeleton cells blue-glow into account context"
      tone="grid"
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv2-en${on ? ' is-on' : ''} s${step}`}
      >
        <header className="hv2-head">
          <h2>
            Hearing is <span>not understanding.</span>
          </h2>
          <p>Knowzilla brings the account into every sentence.</p>
          <Meta />
        </header>

        <div className="hv2-en__record">
          <div className="hv2-en__row hv2-en__row--utterance">
            <span className="hv2-en__k">Utterance</span>
            <div className="hv2-en__v">
              <span className="hv2-en__skel" />
              <span className="hv2-en__content hv2-en__content--raw">{RAW}</span>
            </div>
          </div>
          <div className="hv2-en__row hv2-en__row--resolved">
            <span className="hv2-en__k">Resolved</span>
            <div className="hv2-en__v">
              <span className="hv2-en__skel" />
              <span className="hv2-en__content">
                We need more <u>predictability.</u>
              </span>
            </div>
          </div>
          {CTX.map((c, i) => (
            <div
              key={c.k}
              className={`hv2-en__row hv2-en__row--c${i}`}
              style={{ '--i': i } as CSSProperties}
            >
              <span className="hv2-en__k">{c.k}</span>
              <div className="hv2-en__v">
                <span className="hv2-en__skel" />
                <span className="hv2-en__content">{c.v}</span>
              </div>
            </div>
          ))}
          <div className="hv2-en__row hv2-en__row--verdict">
            <span className="hv2-en__k">Verdict</span>
            <div className="hv2-en__v">
              <span className="hv2-en__skel" />
              <span className="hv2-en__content">
                Pricing concern · high confidence · Δ1.30s
              </span>
            </div>
          </div>
        </div>
      </article>
    </Shell>
  )
}

/* ─── 14 UNDERLINE DRAW — clip-path + underline scale ───────────────────── */
const UD_BEAT = [300, 1000, 1600, 2200, 2800]
function UnderlineDraw() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const step = useBeat(on, UD_BEAT, reduced)
  const lag = useLag(on, 1000, 2200, LAG_LOCK, reduced)
  return (
    <Shell
      id="v14"
      n="14"
      name="Underline draw"
      thesis="Clip-path insight reveal + signal underline draws across the key word"
      tone="wash"
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv2-ud${on ? ' is-on' : ''} s${step}`}
      >
        <div className="hv2-ud__grid">
          <div className="hv2-ud__copy">
            <h2>
              Hearing is
              <br />
              <span>not understanding.</span>
            </h2>
            <p>Knowzilla brings the account into every sentence.</p>
            <Meta />
          </div>

          <div className="hv2-ud__panel">
            <p className="hv2-ud__raw">{RAW}</p>
            <div className="hv2-ud__rule" aria-hidden="true" />
            <h3 className="hv2-ud__clean">
              We need more{' '}
              <span className="hv2-ud__key">
                predictability.
                <i />
              </span>
            </h3>
            <ul>
              {CTX.map((c, i) => (
                <li key={c.k} style={{ '--i': i } as CSSProperties}>
                  <span>{c.k}</span>
                  <strong>{c.v}</strong>
                </li>
              ))}
            </ul>
            <footer>
              Pricing concern · high confidence · Δ<span ref={lag}>0.00</span>s
            </footer>
          </div>
        </div>
      </article>
    </Shell>
  )
}

/* ─── 15 BEAT MACHINE — full timed HVU scene, Attio house entrance ──────── */
const BM_BEAT = [0, 400, 1200, 2000, 2600, 3200, 3800]
function BeatMachine() {
  const reduced = useReduced()
  const { ref, on } = useInView()
  const step = useBeat(on, BM_BEAT, reduced)
  const lag = useLag(on, 1200, 2600, LAG_LOCK, reduced)
  return (
    <Shell
      id="v15"
      n="15"
      name="Beat machine"
      thesis="Full Attio house-entrance beat — blur cascade, lag tick, once then settle"
      tone="stage"
    >
      <article
        ref={ref as RefObject<HTMLElement>}
        className={`hv2-bm${on ? ' is-on' : ''} s${step}`}
      >
        <header className="hv2-bm__head">
          <div>
            <h2>
              Hearing is <span>not understanding.</span>
            </h2>
            <p>Knowzilla brings the account into every sentence.</p>
          </div>
          <Meta />
        </header>

        <div className="hv2-bm__rule" aria-hidden="true">
          <span />
        </div>

        <div className="hv2-bm__body">
          <div className="hv2-bm__col">
            <p className="hv2-lab">Heard now</p>
            <p className="hv2-bm__raw">
              {RAW_WORDS.map((w, i) => (
                <span key={i} style={{ '--i': i } as CSSProperties}>
                  {w}{' '}
                </span>
              ))}
            </p>
          </div>

          <div className="hv2-bm__div" aria-hidden="true">
            <div className="hv2-bm__node">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="hv2-bm__lag">
              <span>{step >= 5 ? 'resolved' : 'matching…'}</span>
              <strong>
                Δ<span ref={lag}>0.00</span>s
              </strong>
            </div>
          </div>

          <div className="hv2-bm__col hv2-bm__col--out">
            <p className="hv2-lab">Understood in context</p>
            <div className="hv2-bm__panel">
              <h3>
                {CLEAN.map((w, i) => (
                  <span
                    key={w}
                    className={i === 3 ? 'is-key' : undefined}
                    style={{ '--i': i } as CSSProperties}
                  >
                    {w}{' '}
                    {i === 3 ? <i className="hv2-bm__ul" /> : null}
                  </span>
                ))}
              </h3>
              <ul>
                {CTX.map((c, i) => (
                  <li key={c.k} style={{ '--i': i } as CSSProperties}>
                    <span>{c.k}</span>
                    <strong>{c.v}</strong>
                  </li>
                ))}
              </ul>
              <p className="hv2-bm__verdict">
                Pricing concern · <em>high confidence</em>
              </p>
            </div>
          </div>
        </div>
      </article>
    </Shell>
  )
}

export const SET2_NAV = [
  { id: 'v6', label: '06 Workflow', group: 'Attio motion' },
  { id: 'v7', label: '07 Mask wipe', group: 'Attio motion' },
  { id: 'v8', label: '08 Call stage', group: 'Attio motion' },
  { id: 'v9', label: '09 Word flip', group: 'Attio motion' },
  { id: 'v10', label: '10 Float brief', group: 'Attio motion' },
  { id: 'v11', label: '11 Converge', group: 'Attio motion' },
  { id: 'v12', label: '12 State rail', group: 'Attio motion' },
  { id: 'v13', label: '13 Enrich', group: 'Attio motion' },
  { id: 'v14', label: '14 Underline', group: 'Attio motion' },
  { id: 'v15', label: '15 Beat machine', group: 'Attio motion' },
]

export function HvuVariationsSet2() {
  return (
    <>
      <Workflow />
      <MaskWipe />
      <CallStage />
      <WordFlip />
      <FloatingBrief />
      <SignalConverge />
      <StateRail />
      <Enrich />
      <UnderlineDraw />
      <BeatMachine />
    </>
  )
}
