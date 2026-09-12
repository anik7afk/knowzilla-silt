import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useInView } from '../hooks/useInView'
import './BeforeAfterProofStack.css'

const BEFORE_ITEMS = ['Missed context', 'Manual CRM cleanup', 'Late risk discovery'] as const

export default function BeforeAfterProofStack() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 })
  const scope = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const root = scope.current
      if (!root || !inView) return

      const q = gsap.utils.selector(root)
      const number = root.querySelector<HTMLSpanElement>('.bap-metric__number')
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduce) {
        if (number) number.textContent = '3.2'
        return
      }

      if (number) number.textContent = '0.0'
      const counter = { value: 0 }
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .to(q('.bap-title'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55 }, 0)
        .fromTo(
          q('.bap-slip__paper'),
          { opacity: 0, x: -30, y: 16, rotation: -2, filter: 'blur(2px)' },
          { opacity: 1, x: 0, y: 0, rotation: 0, filter: 'blur(0px)', duration: 0.58, stagger: 0.13 },
          0.28,
        )
        .to(q('.bap-seam__line'), { scaleY: 1, duration: 0.38, ease: 'power2.inOut' }, 0.94)
        .to(q('.bap-seam__arrow'), { opacity: 1, scale: 1, duration: 0.28 }, 1.16)
        .to(q('.bap-sheet'), { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.72 }, 0.96)
        .to(q('.bap-after-tab'), { opacity: 1, y: 0, duration: 0.4 }, 1.26)
        .to(q('.bap-register'), { scaleX: 1, duration: 0.38, ease: 'power2.out' }, 1.42)
        .to(q('.bap-quote'), { opacity: 1, y: 0, filter: 'blur(0px)', clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 }, 1.38)
        .to(q('.bap-footer__rule'), { scaleX: 1, duration: 0.48, ease: 'power2.out' }, 1.82)
        .to(q('.bap-metric'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, 1.98)
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
          2.0,
        )
        .to(q('.bap-attribution'), { opacity: 1, y: 0, duration: 0.42 }, 2.34)
    },
    { scope, dependencies: [inView] },
  )

  return (
    <section
      ref={(node) => {
        ref.current = node
        scope.current = node
      }}
      className="bap-section"
      aria-labelledby="bap-title"
    >
      <div className="bap-shell">
        <h2 id="bap-title" className="bap-title">
          What changed after Knowzilla
        </h2>

        <div className="bap-composition">
          <div className="bap-before">
            <ul className="bap-slips">
              {BEFORE_ITEMS.map((item) => (
                <li key={item} className="bap-slip">
                  <div className="bap-slip__paper">{item}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bap-seam" aria-hidden="true">
            <span className="bap-seam__line" />
            <span className="bap-seam__arrow" />
          </div>

          <article className="bap-sheet">
            <span className="bap-after-tab">After</span>
            <span className="bap-register" aria-hidden="true" />
            <blockquote className="bap-quote">Our pipeline became explainable.</blockquote>
            <footer className="bap-footer">
              <span className="bap-footer__rule" aria-hidden="true" />
              <div className="bap-metric">
                <span className="bap-metric__figure">
                  <span className="bap-metric__number">3.2</span>
                  <span>×</span>
                </span>{' '}
                <span className="bap-metric__label">faster deal reviews</span>
              </div>
              <p className="bap-attribution">CRO · Global Services</p>
            </footer>
          </article>
        </div>
      </div>
    </section>
  )
}
