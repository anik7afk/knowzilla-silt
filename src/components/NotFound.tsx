import Lizzie from './Lizzie'

/* ---------------------------------------------------------------------------
 * 404. The one place the page can afford the mascot at size — it is entirely
 * off the critical path, nobody is being sold to here, and a visitor who has
 * hit a dead end is the one visitor warmth actually helps.
 *
 * Everything else obeys the page's standing rules: surface-100 ground, no
 * shadow, the accent used as a mark rather than an area fill, Inter Display
 * for the number, generous silence around it.
 *
 * The asset is the owner's LYING drawing (1045x621). It is exported at 3x of
 * its 360px display width, i.e. 1:1 with the source — nothing is enlarged.
 * See Lizzie.tsx.
 * ------------------------------------------------------------------------- */

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-surface-100">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 pt-8 md:px-10">
        <a
          href="/"
          className="font-display text-[18px] font-medium tracking-[-0.18px] text-ink"
        >
          Knowzilla
        </a>
        <a
          href="/"
          className="kz-hover kz-focus-ring flex h-9 items-center rounded-button border border-hairline-2 px-4 text-[14px] font-medium text-ink"
          style={{ transitionProperty: 'background-color' }}
        >
          Sign in
        </a>
      </div>

      <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center gap-12 px-6 py-24 md:flex-row md:justify-between md:gap-16 md:px-10">
        <div className="text-center md:text-left">
          <div className="font-display text-[88px] font-medium leading-none tracking-[-2px] text-ink md:text-[120px]">
            404
          </div>
          <h1 className="mt-4 font-display text-[26px] font-medium leading-8 tracking-[-0.26px] text-ink md:text-[32px] md:leading-10">
            {/* Voice: the page's own navigation metaphor, turned on itself. */}
            This page is off course.
          </h1>
          <a
            href="/"
            className="kz-cta-btn kz-hover kz-focus-ring mt-8 inline-flex h-9 items-center rounded-button bg-ink pl-4 pr-3.5 text-[14px] font-medium text-surface-100 hover:bg-gray-800"
            style={{ transitionProperty: 'background-color' }}
          >
            Back to Knowzilla
            <span className="kz-chevron ml-1.5" aria-hidden="true">
              →
            </span>
          </a>
        </div>

        {/* The lying pose. Owner's pick for this page, and it fits the
            meaning: the character is settled, not alarmed — a dead end should
            feel like a pause, not an error. It is also the one pose that is
            WIDE rather than tall, which suits a page whose text block is short.
            Sized by width (360px, giving 214 tall at the source's 1045x621
            ratio) so it never dictates the row height. */}
        <Lizzie variant="hero404" height={214} className="w-[280px] md:w-[360px]" style={{ height: 'auto' }} />
      </div>
    </main>
  )
}
