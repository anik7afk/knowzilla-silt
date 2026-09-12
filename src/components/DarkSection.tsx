import { useInView } from '../hooks/useInView'

const TELEMETRY = ['context window · 4,120 accounts', 'freshness · 0.8s behind live']

export default function DarkSection() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section ref={ref} className="relative overflow-hidden bg-surface-dark text-surface-100">
      {/* faint dot-grid backdrop — dots only, no gradients */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="dark-dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#ffffff" fillOpacity="0.05" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#dark-dots)" />
      </svg>

      <div className="relative mx-auto max-w-[1200px] px-6 pt-24 pb-24 md:px-10 md:pt-[152px] md:pb-[120px]">
        <h2
          className={`${inView ? 'kz-enter' : 'opacity-0'} max-w-[860px] [text-wrap:balance] font-display text-[40px] font-medium leading-[44px] tracking-[-0.4px]`}
          style={{ '--enter-delay': '0ms' } as React.CSSProperties}
        >
          <span className="text-surface-100">Every signal your team has ever seen, </span>
          <span className="text-gray-500">held in one context.</span>
        </h2>

        <div
          className={`${inView ? 'kz-enter' : 'opacity-0'} mt-8 flex flex-wrap gap-x-8 gap-y-2`}
          style={{ '--enter-delay': '120ms' } as React.CSSProperties}
        >
          {TELEMETRY.map((line) => (
            <span key={line} className="font-mono text-[13px] leading-5 text-olive-500">
              {line}
            </span>
          ))}
        </div>

        <div
          className={`${inView ? 'kz-enter' : 'opacity-0'} mt-10`}
          style={{ '--enter-delay': '240ms' } as React.CSSProperties}
        >
          <a
            href="#"
            className="kz-hover kz-focus-ring inline-flex h-9 items-center rounded-button border border-gray-800 px-4 text-[14px] font-medium text-surface-100 hover:border-gray-700 hover:bg-gray-900"
            style={{ transitionProperty: 'background-color, border-color' }}
          >
            See how context works
          </a>
        </div>
      </div>
    </section>
  )
}
