import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useInView } from '../hooks/useInView'
import './BeforeAfterRouted.css'

const BEFORE_ITEMS = ['Missed context', 'Manual CRM cleanup', 'Late risk discovery'] as const

function SignalGlyph() {
  return (
    <span className="bar-glyph" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index} />
      ))}
    </span>
  )
}

function RoutedConnector() {
  return (
    <div className="bar-route" aria-hidden="true">
      <svg className="bar-route__desktop" viewBox="0 0 72 240" preserveAspectRatio="none">
        <path className="bar-route__neutral" pathLength="1" d="M0 45H18Q34 45 36 120" />
        <path className="bar-route__neutral" pathLength="1" d="M0 120H36" />
        <path className="bar-route__neutral" pathLength="1" d="M0 195H18Q34 195 36 120" />
        <path className="bar-route__signal" pathLength="1" d="M36 120H64" />
        <path className="bar-route__arrow" d="M58 112L68 120L58 128Z" />
      </svg>
      <span className="bar-route__mobile">
        <span className="bar-route__mobile-neutral" />
        <span className="bar-route__mobile-signal" />
        <span className="bar-route__mobile-arrow" />
      </span>
    </div>
  )
}

export default function BeforeAfterRouted() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 })
  const scope = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const root = scope.current
      if (!root || !inView) return

      const q = gsap.utils.selector(root)
      const number = root.querySelector<HTMLSpanElement>('.bar-metric__number')
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduce) {
        if (number) number.textContent = '3.2'
        return
      }

      if (number) number.textContent = '0.0'
      const counter = { value: 0 }
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .to(q('.bar-title'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55 }, 0)
        .to(q('.bar-panel'), { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.65 }, 0.08)
        .to(q('.bar-node'), { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.1 }, 0.38)
        .to(q('.bar-route__neutral'), { strokeDashoffset: 0, duration: 0.65, stagger: 0.08, ease: 'power2.inOut' }, 0.72)
        .to(q('.bar-route__mobile-neutral'), { scaleY: 1, duration: 0.45, ease: 'power2.inOut' }, 0.72)
        .to(q('.bar-route__signal'), { strokeDashoffset: 0, duration: 0.55, ease: 'power2.out' }, 1.24)
        .to(q('.bar-route__arrow'), { opacity: 1, scale: 1, duration: 0.32 }, 1.58)
        .to(q('.bar-route__mobile-signal'), { scaleY: 1, duration: 0.32 }, 1.24)
        .to(q('.bar-route__mobile-arrow'), { opacity: 1, scale: 1, duration: 0.28 }, 1.48)
        .to(q('.bar-after__eyebrow'), { opacity: 1, y: 0, duration: 0.4 }, 1.42)
        .to(q('.bar-quote'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.62 }, 1.52)
        .to(q('.bar-after__rule'), { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 1.88)
        .to(q('.bar-metric'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.52 }, 2.02)
        .to(
          counter,
          {
            value: 3.2,
            duration: 0.82,
            ease: 'power2.out',
            onUpdate: () => {
              if (number) number.textContent = counter.value.toFixed(1)
            },
          },
          2.08,
        )
        .to(q('.bar-attribution'), { opacity: 1, y: 0, duration: 0.42 }, 2.46)
    },
    { scope, dependencies: [inView] },
  )

  return (
    <section
      ref={(node) => {
        ref.current = node
        scope.current = node
      }}
      className="bar-section"
      aria-labelledby="bar-title"
    >
      <div className="bar-shell">
        <h2 id="bar-title" className="bar-title">
          What changed after Knowzilla
        </h2>

        <div className="bar-panel">
          <div className="bar-before">
            <ul className="bar-nodes">
              {BEFORE_ITEMS.map((item) => (
                <li key={item} className="bar-node">
                  <SignalGlyph />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <RoutedConnector />

          <div className="bar-after">
            <p className="bar-after__eyebrow">After</p>
            <blockquote className="bar-quote">Our pipeline became explainable.</blockquote>
            <span className="bar-after__rule" aria-hidden="true" />
            <div className="bar-metric">
              <span className="bar-metric__figure">
                <span className="bar-metric__number">3.2</span>
                <span className="bar-metric__times">×</span>
              </span>{' '}
              <span className="bar-metric__label">faster deal reviews</span>
            </div>
            <p className="bar-attribution">CRO · Global Services</p>
          </div>
        </div>
      </div>
    </section>
  )
}
