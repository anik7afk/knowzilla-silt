import { useInView } from '../hooks/useInView'

/* 35 deterministic bar heights (%). Peaks (olive-600) at chosen indices,
   the rest ride olive-300/400 — telemetry that reads as live throughput. */
const BAR_HEIGHTS = [
  38, 52, 44, 61, 49, 73, 55, 42, 68, 58, 47, 82, 63, 51, 45, 70, 88, 66, 54,
  48, 76, 60, 43, 57, 91, 64, 50, 46, 72, 59, 41, 67, 53, 78, 49,
]
const PEAKS = new Set([11, 16, 24, 33])
const MIDS = new Set([5, 8, 15, 20, 28])

const READOUTS = [
  'signal latency 12ms',
  'forecast accuracy 98.4%',
  'pipelines synced 4,120',
]

const STATS = [
  { value: '12ms', label: 'median signal-to-map latency' },
  { value: '98.4%', label: 'forecast accuracy, trailing 90d' },
  { value: '4,120', label: 'pipelines synced in real time' },
]

export default function TelemetryBand() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section ref={ref} className={`${inView ? 'is-inview' : ''} bg-surface-100`}>
      <div className="mx-auto max-w-[1200px] px-6 pt-24 pb-24 md:px-10 md:pt-[152px]">
        <div className="max-w-[680px]">
          <span className="inline-flex h-6 items-center rounded-tag bg-surface-300 px-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.4px] text-ink-secondary">
            Telemetry
          </span>
          <h2 className="mt-5 [text-wrap:balance] font-display text-[40px] font-medium leading-[44px] tracking-[-0.4px]">
            <span className="text-ink">Navigate with confidence. </span>
            <span className="text-ink-secondary">The signal never goes quiet.</span>
          </h2>
        </div>

        {/* live throughput bars */}
        <div className="mt-12 flex h-40 items-end gap-[6px] md:mt-14">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className={`kz-bar flex-1 rounded-[2px] ${
                PEAKS.has(i) ? 'bg-olive-600' : MIDS.has(i) ? 'bg-olive-400' : 'bg-olive-300'
              }`}
              style={{ height: `${h}%`, '--bar-delay': `${i * 8}ms` } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-hairline-2 pt-6">
          {READOUTS.map((line) => (
            <span key={line} className="font-mono text-[13px] leading-5 text-olive-800">
              {line}
            </span>
          ))}
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-display text-[32px] font-medium leading-9 tracking-[-0.32px] text-ink">
                {s.value}
              </div>
              <p className="mt-2 max-w-[240px] text-[14px] font-[450] leading-5 tracking-[-0.14px] text-gray-700">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
