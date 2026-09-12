import type { CSSProperties, ReactNode } from 'react'
import './EndgameShell.css'

/* Shared chrome for the /endgame review routes — measure, dual-tone head,
 * ground steps. Not mounted on the landing page. */

export type EndgameGround = '100' | '200' | '300'

export function EndgameShell({
  ground = '200',
  children,
  className = '',
}: {
  ground?: EndgameGround
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`eg-shell eg-shell--g${ground} ${className}`.trim()}>
      <div className="eg-shell__inner">{children}</div>
    </section>
  )
}

export function EndgameHead({
  lead,
  tail,
  sub,
  enter,
}: {
  lead: string
  tail: string
  sub?: string
  enter?: { className: string; style?: CSSProperties }
}) {
  return (
    <header className={`eg-head ${enter?.className ?? ''}`.trim()} style={enter?.style}>
      <h2 className="eg-head__h">
        {lead} <span>{tail}</span>
      </h2>
      {sub ? <p className="eg-head__sub">{sub}</p> : null}
    </header>
  )
}

export function egEnter(active: boolean, delay = 0): { className: string; style?: CSSProperties } {
  if (!active) return { className: 'opacity-0' }
  return {
    className: 'kz-enter',
    style: { '--enter-delay': `${delay}ms` } as CSSProperties,
  }
}
