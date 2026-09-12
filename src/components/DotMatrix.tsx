import './DotMatrix.css'

export type MatrixState = 'idle' | 'listening' | 'resolved' | 'converged'

export function resolveMatrix(
  state: MatrixState,
  size: 2 | 3,
): boolean[] {
  if (size === 2) {
    switch (state) {
      case 'idle':      return [false, false, false, false]
      case 'listening': return [true,  false, false, false]
      case 'resolved':  return [true,  false, false, true]
      case 'converged': return [true,  true,  true,  true]
    }
  }
  switch (state) {
    case 'idle':      return [false, false, false, false, false, false, false, false, false]
    case 'listening': return [true,  false, false, false, false, false, false, false, false]
    case 'resolved':  return [false, true,  false, true,  true,  true,  false, true,  false]
    case 'converged': return [true,  true,  true,  true,  true,  true,  true,  true,  true]
  }
}

const INKS = ['graphite', 'accent', 'signal'] as const
type Ink = (typeof INKS)[number]

export default function DotMatrix({
  state,
  size = 2,
  ink = 'graphite',
}: {
  state: MatrixState
  size?: 2 | 3
  ink?: Ink
}) {
  const lit = resolveMatrix(state, size)
  return (
    <div
      className={`kz-dm kz-dm--${size}x${size} kz-dm--${ink}`}
      data-state={state}
      role="presentation"
      aria-hidden="true"
    >
      {lit.map((on, i) => (
        <span
          key={i}
          className={`kz-dm__dot ${on ? 'is-lit' : 'is-unlit'}`}
        />
      ))}
    </div>
  )
}

export type { Ink }
