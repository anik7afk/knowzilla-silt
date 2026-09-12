import { useInView } from '../hooks/useInView'

/* Fictional revenue-team wordmarks — Inter Display / mono mix, gray-500, text only. */
const LOGOS = [
  { name: 'Meridian', mono: false },
  { name: 'northwind', mono: true },
  { name: 'Halcyon', mono: false },
  { name: 'Cobalt', mono: false },
  { name: 'ridgeline', mono: true },
  { name: 'Axiom', mono: false },
  { name: 'Lumen', mono: false },
  { name: 'vanta', mono: true },
]

export default function LogoWall() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section ref={ref} className="border-t border-hairline-2 bg-surface-100">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-20">
        <p
          className={`${inView ? 'kz-enter' : 'opacity-0'} text-center font-mono text-[12px] font-medium uppercase tracking-[0.4px] text-ink-secondary`}
          style={{ '--enter-delay': '0ms' } as React.CSSProperties}
        >
          Trusted by revenue teams at
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:mt-10 md:gap-x-14">
          {LOGOS.map((logo, i) => (
            <span
              key={logo.name}
              className={`${inView ? 'kz-enter' : 'opacity-0'} text-[18px] text-gray-500 ${
                logo.mono
                  ? 'font-mono font-medium lowercase tracking-[-0.18px]'
                  : 'font-display font-medium tracking-[-0.18px]'
              }`}
              style={{ '--enter-delay': `${80 + i * 60}ms` } as React.CSSProperties}
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
