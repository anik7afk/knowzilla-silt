import { useEffect, useRef } from 'react'

/* "Signals" was ours, not theirs: "signal"/"intent" appear essentially nowhere
   across knowzilla.eu's 42 posts + 15 pages (voice audit 2026-07-27). */
const LINKS = ['Product', 'Resources', 'Pricing', 'Docs']

export default function Nav() {
  const hairlineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false

    const apply = () => {
      ticking = false
      const el = hairlineRef.current
      if (!el) return
      if (window.scrollY > 8) {
        el.classList.add('is-visible')
      } else {
        el.classList.remove('is-visible')
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(apply)
      }
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 h-20 bg-surface-100">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6 md:px-10">
        <a
          /* Wordmark is the way home: on standalone routes (/pricing, /stage,
             …) "#" only appended a hash and left you where you were. */
          href="/"
          className="font-display text-[18px] font-medium tracking-[-0.18px] text-ink kz-focus-ring rounded-micro"
        >
          Knowzilla
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((label) => (
            <a
              key={label}
              /* Pricing is a real destination since it left the landing flow
                 (owner, 2026-07-27 — donor keeps pricing off its landing).
                 Product jumps to the chapter tour (owner, 2026-07-29): no
                 dropdown — the donor's hover panel is deliberately NOT copied,
                 one plain anchor instead. Rooted at `/` so it also works from
                 the standalone routes, same reasoning as the wordmark above.
                 Docs deliberately lands on the custom 404 until documentation
                 exists; Resources stays inert in this mock. */
              href={
                label === 'Pricing'
                  ? '/pricing'
                  : label === 'Product'
                    ? '/#platform'
                    : label === 'Docs'
                      ? '/404'
                      : '#'
              }
              className="kz-hover kz-focus-ring flex items-center rounded-micro py-1.5 text-[14px] font-medium tracking-[-0.14px] text-ink-secondary hover:text-ink"
              style={{ transitionProperty: 'color' }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className="kz-hover kz-focus-ring flex h-9 items-center rounded-button px-4 text-[14px] font-medium text-ink hover:bg-surface-300"
            style={{ transitionProperty: 'background-color' }}
          >
            Sign in
          </a>
          <a
            href="#"
            className="kz-hover kz-focus-ring flex h-9 items-center rounded-button bg-ink px-4 text-[14px] font-medium text-surface-100 hover:bg-gray-800"
            style={{ transitionProperty: 'background-color' }}
          >
            Start navigating
          </a>
        </div>
      </div>

      <div
        ref={hairlineRef}
        className="kz-nav-hairline absolute inset-x-0 bottom-0 h-px bg-hairline-2"
      />
    </header>
  )
}
