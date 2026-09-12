import { useState, useEffect } from 'react'
import DotMatrix, { resolveMatrix, type MatrixState, type Ink } from './DotMatrix'
import './DotsReview.css'

const STATES: MatrixState[] = ['idle', 'listening', 'resolved', 'converged']
const INKS: Ink[] = ['graphite', 'accent', 'signal']
const SIZES = [2, 3] as const
const LABEL = 'CONVERGENCE'
const SENTENCE = 'Signal stabilises across all three axes.'

export default function DotsReview() {
  const [motionState, setMotionState] = useState<MatrixState>('idle')
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => {
    if (!autoPlay) return
    let i = 0
    const iv = setInterval(() => {
      i = (i + 1) % STATES.length
      setMotionState(STATES[i])
    }, 1800)
    return () => clearInterval(iv)
  }, [autoPlay])

  return (
    <main className="dr">
      <header className="dr__head">
        <h1 className="dr__title">DotMatrix · standalone review</h1>
        <p className="dr__sub">
          State is the only required prop. Size defaults to 2; the 3×3 is
          reserved for a single convergence point on the page. No ink has been
          chosen — all three candidates render below for the owner to decide.
        </p>
      </header>

      {/* §1 — resolver truth (no DOM needed; verify script tests resolveMatrix) */}
      <section className="dr__block">
        <h2 className="dr__h">1 · resolver table</h2>
        <ResolverTable />
      </section>

      {/* §2 — every size × state × ink, real size + 4x */}
      <section className="dr__block">
        <h2 className="dr__h">2 · every size × state × ink</h2>
        {SIZES.map((n) => (
          <div key={n} className="dr__matrix">
            <h3 className="dr__h2">{n}×{n}</h3>
            <div className="dr__grid">
              {STATES.map((s) =>
                INKS.map((ink) => (
                  <div key={`${n}-${s}-${ink}`} className="dr__cell">
                    <div className="dr__cell-real">
                      <DotMatrix state={s} size={n} ink={ink} />
                    </div>
                    <div className="dr__cell-4x">
                      <Scale4><DotMatrix state={s} size={n} ink={ink} /></Scale4>
                    </div>
                    <span className="dr__label">{s} · {ink}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </section>

      {/* §3 — in context: beside a 10px uppercase label and a 16px sentence */}
      <section className="dr__block">
        <h2 className="dr__h">3 · in context</h2>
        <p className="dr__note">
          A matrix must never exceed the height of the 10px uppercase label it
          qualifies. 2×2 = 6px, 3×3 = 10px. Both fit under the 10px cap-height.
        </p>
        {INKS.map((ink) => (
          <div key={ink} className="dr__ctx">
            <h3 className="dr__h2">{ink}</h3>
            <div className="dr__ctx-row">
              <span className="dr__ctx-label">{LABEL}</span>
              {STATES.map((s) => (
                <span key={s} className="dr__ctx-pair">
                  <DotMatrix state={s} size={2} ink={ink} />
                  <span className="dr__ctx-state">{s}</span>
                </span>
              ))}
            </div>
            <div className="dr__ctx-row">
              <span className="dr__ctx-label">{LABEL}</span>
              {STATES.map((s) => (
                <span key={s} className="dr__ctx-pair">
                  <DotMatrix state={s} size={3} ink={ink} />
                  <span className="dr__ctx-state">{s}</span>
                </span>
              ))}
            </div>
            <div className="dr__ctx-row dr__ctx-row--prose">
              <span className="dr__ctx-prose">{SENTENCE}</span>
              {STATES.map((s) => (
                <span key={s} className="dr__ctx-pair">
                  <DotMatrix state={s} size={2} ink={ink} />
                  <span className="dr__ctx-state">{s}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* §4 — motion: the only allowed anim is the state-change opacity fade */}
      <section className="dr__block">
        <h2 className="dr__h">4 · motion (state change only, then still)</h2>
        <div className="dr__motion">
          <div className="dr__motion-controls">
            {STATES.map((s) => (
              <button
                key={s}
                type="button"
                className={`dr__btn ${motionState === s ? 'is-active' : ''}`}
                onClick={() => { setAutoPlay(false); setMotionState(s) }}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              className={`dr__btn ${autoPlay ? 'is-active' : ''}`}
              onClick={() => setAutoPlay((a) => !a)}
            >
              {autoPlay ? 'stop' : 'auto'}
            </button>
          </div>
          <div className="dr__motion-stage">
            {INKS.map((ink) => (
              <div key={ink} className="dr__motion-cell">
                <Scale8><DotMatrix state={motionState} size={2} ink={ink} /></Scale8>
                <span className="dr__label">{ink} · {motionState}</span>
              </div>
            ))}
            {INKS.map((ink) => (
              <div key={`3-${ink}`} className="dr__motion-cell">
                <Scale8><DotMatrix state={motionState} size={3} ink={ink} /></Scale8>
                <span className="dr__label">3×3 {ink} · {motionState}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function ResolverTable() {
  return (
    <table className="dr__table">
      <thead>
        <tr>
          <th>matrix</th>
          <th>state</th>
          <th>pattern (● lit · ○ unlit)</th>
          <th>lit count</th>
        </tr>
      </thead>
      <tbody>
        {SIZES.flatMap((sz) =>
          STATES.map((s) => {
            const dots = resolveMatrix(s, sz)
            const pattern = dots.map((on) => (on ? '●' : '○')).join(' ')
            const lit = dots.filter(Boolean).length
            return (
              <tr key={`${sz}-${s}`}>
                <td>{sz}×{sz}</td>
                <td>{s}</td>
                <td className="dr__pattern">{pattern}</td>
                <td>{lit}/{dots.length}</td>
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  )
}

function Scale4({ children }: { children: React.ReactNode }) {
  return (
    <div className="dr__scale" style={{ '--s': 4 } as React.CSSProperties}>
      <div className="dr__scale-inner">{children}</div>
    </div>
  )
}

function Scale8({ children }: { children: React.ReactNode }) {
  return (
    <div className="dr__scale" style={{ '--s': 8 } as React.CSSProperties}>
      <div className="dr__scale-inner">{children}</div>
    </div>
  )
}
