import Lizzie from './Lizzie'

/* Product column lists Knowzilla's REAL four modules (knowzilla.eu/en/product/*).
   "Radar / Signals / Forecast / Actions" were invented names on an invented
   vocabulary — see the voice audit, 2026-07-27. */
const COLUMNS = [
  {
    heading: 'Product',
    links: ['Live Assistant', 'Knowledge Base', 'Playground', 'Dashboard', 'Pricing'],
  },
  {
    heading: 'Company',
    links: ['About', 'Careers', 'Customers', 'Contact'],
  },
  {
    heading: 'Resources',
    links: ['Docs', 'Changelog', 'API', 'Status'],
  },
  {
    heading: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'DPA'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-surface-100">
      <div className="mx-auto max-w-[1280px] px-6 pt-16 pb-8 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-[260px]">
            {/* The peek, ON TOP of the word (owner call, 2026-07-27 — moved
              * from beside the wordmark to over it). OCCLUSION is still the
              * whole idea: the wordmark is painted in FRONT of the character
              * with its own ground colour, so the export's straight-cut bottom
              * edge stays hidden and Lizzie reads as peeking up from behind
              * the type — head and paws over "zilla".
              *
              * The drawn rule in the owner's source art is cropped out at
              * export time — see Lizzie.tsx. This edge is the wordmark. */}
            <div className="relative w-fit">
              <Lizzie
                variant="peek"
                height={40}
                /* mirrored so she looks right; centered over the word */
                className="absolute bottom-[17px] left-1/2 z-0 -translate-x-1/2 -scale-x-100"
              />
              {/* leading-none so the occluding ground stops at the cap tops —
                * with default leading the box eats ~10px of air above the
                * letters and only the spine tips survived. */}
              <div className="relative z-10 bg-surface-100 font-display text-[18px] font-medium leading-none tracking-[-0.18px] text-ink">
                Knowzilla
              </div>
            </div>
            <p className="mt-3 text-[14px] font-[450] leading-5 tracking-[-0.14px] text-ink-secondary">
              {/* verbatim: knowzilla.eu footer tagline (all pages) */}
              AI execution for revenue-driven teams.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[13px] font-medium leading-4 tracking-[-0.13px] text-gray-700">
                {col.heading}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="kz-hover kz-focus-ring rounded-micro text-[14px] font-[450] tracking-[-0.14px] text-ink-secondary hover:text-ink"
                      style={{ transitionProperty: 'color' }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-hairline-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[13px] leading-5 text-ink-secondary">© 2026 Knowzilla</span>
          {/* NOT signal blue. Shot at 1440 with signal-700 it read as the one
              LINK in a footer made entirely of links — and it is not clickable.
              This line is a static piece of footer wit, not live telemetry, so
              per the sweep's "gray if it is not really signalling" branch it
              goes neutral and the row reads symmetrically with the © line. */}
          <span className="font-mono text-[13px] leading-5 text-gray-600">
            status: all systems nominal
          </span>
        </div>
      </div>
    </footer>
  )
}
