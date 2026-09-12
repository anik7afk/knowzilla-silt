import { useInView } from '../hooks/useInView'
import './Quote.css'

/* Attio quote grammar: split into words, each animating gray-400 -> ink (or
   -> ink-secondary for the de-emphasised trailing clause) with a per-word
   stagger, once on first viewport entry. Words keep their own trailing
   space so wrapping stays natural. */
const QUOTE_LEAD =
  'We stopped guessing which deals were slipping. Knowzilla shows the whole board moving in real time —'
const QUOTE_TRAIL = 'we just read the map and make the call.'

function QuoteWords({
  text,
  muted,
  startIndex,
}: {
  text: string
  muted?: boolean
  startIndex: number
}) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span
          key={startIndex + i}
          className={`kz-quote-word${muted ? ' kz-quote-word--muted' : ''}`}
          style={{ '--w': startIndex + i } as React.CSSProperties}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

export default function Quote() {
  const { ref, inView } = useInView<HTMLElement>()
  const leadWordCount = QUOTE_LEAD.split(' ').length

  return (
    <section ref={ref} className={`${inView ? 'is-inview' : ''} bg-surface-100`}>
      <div className="mx-auto max-w-[860px] px-6 pt-24 pb-16 text-center md:px-10 md:pt-[152px] md:pb-[96px]">
        <blockquote className="[text-wrap:balance] font-serif text-[36px] font-medium italic leading-[42px] tracking-[-0.36px]">
          <QuoteWords text={QUOTE_LEAD} startIndex={0} />{' '}
          <QuoteWords text={QUOTE_TRAIL} muted startIndex={leadWordCount} />
        </blockquote>

        <p
          className={`${inView ? 'kz-enter' : 'opacity-0'} mt-8 font-mono text-[13px] leading-5 text-ink-secondary`}
          style={{ '--enter-delay': '120ms' } as React.CSSProperties}
        >
          maya ellison · vp revenue · northwind
        </p>
      </div>
    </section>
  )
}
