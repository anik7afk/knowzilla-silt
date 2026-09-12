import type { ReactNode } from 'react'
import { siHubspot, siGooglecalendar, siNotion } from 'simple-icons'

/*
 * Real integration marks — Knowzilla's actual integrations (from knowzilla.eu):
 * Salesforce, HubSpot, Pipedrive, Attio, Google Calendar, Notion, Microsoft 365.
 * simple-icons only ships HubSpot/Google Calendar/Notion; the rest are drawn
 * inline (Microsoft's four squares, Salesforce's cloud) or set as monograms.
 *
 * COLOUR — every mark paints through `var(--mark-ink, <brand hex>)`, and as of
 * 2026-07-27 (user decision) `--mark-ink` is left UNSET on the landing strip, so
 * each mark renders in its own real brand colour. The hook stays in place: a
 * consumer that wants the monochrome read (the donors' own convention — Attio's
 * logo wall is `mask-image` spans filled `#232529`, inspo/attio/DESIGN.md:231,
 * and its ecosystem-rail glyphs ship as `fill="var(--fill-0, white)"`) sets
 * `--mark-ink: currentColor` on the row and every mark follows in one line.
 *
 * Hexes are first-party brand values, not sampled guesses:
 *   Salesforce   #00A1E0  cloud blue
 *   HubSpot      #FF7A59  simple-icons (their sprocket orange)
 *   Pipedrive    #08A742  "Green Haze", their 2023 brand refresh primary
 *   Attio        #1C1D1F  their ink, measured in inspo/attio/DESIGN.md
 *   G. Calendar  #4285F4  Google blue (single-colour glyph; the real app icon
 *                         is multicolour, which this 18px mark can't carry)
 *   Notion       #000000  simple-icons
 *   Microsoft    #F25022 / #7FBA00 / #00A4EF / #FFB900  the four squares
 */

const BRAND = (hex: string) => `var(--mark-ink, ${hex})`

function Si({ icon, size = 18 }: { icon: { path: string; hex: string }; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d={icon.path} fill={BRAND(`#${icon.hex}`)} />
    </svg>
  )
}

function SalesforceMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M10.06 5.88c.77-.8 1.85-1.3 3.04-1.3 1.58 0 2.96.88 3.7 2.19a5.1 5.1 0 0 1 2.08-.44A5.13 5.13 0 0 1 24 11.5a5.13 5.13 0 0 1-6.32 5 3.82 3.82 0 0 1-3.35 1.98 3.8 3.8 0 0 1-1.67-.38 4.37 4.37 0 0 1-8.1-.19 4.02 4.02 0 0 1-.83.09A4.16 4.16 0 0 1 1.68 10a4.78 4.78 0 0 1-.4-1.92A4.83 4.83 0 0 1 10.06 5.88Z"
        fill={BRAND('#00A1E0')}
      />
    </svg>
  )
}

function Microsoft365Mark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="9.2" height="9.2" fill={BRAND('#F25022')} />
      <rect x="12.8" y="2" width="9.2" height="9.2" fill={BRAND('#7FBA00')} />
      <rect x="2" y="12.8" width="9.2" height="9.2" fill={BRAND('#00A4EF')} />
      <rect x="12.8" y="12.8" width="9.2" height="9.2" fill={BRAND('#FFB900')} />
    </svg>
  )
}

/** Pipedrive's app icon: knocked-out "P" on a solid rounded square. */
function PipedriveMark({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="flex items-center justify-center rounded-md font-sans font-[650]"
      style={{ width: size, height: size, fontSize: size * 0.62, background: BRAND('#08A742') }}
    >
      {/* the knockout must live on a child: `currentColor` in the tile's
          background resolves against the TILE's own colour, so setting the
          letter colour here would paint the tile white too. */}
      <span className="text-surface-100">P</span>
    </span>
  )
}

/** Attio monogram — lowercase "a" knocked out of their ink tile. */
function AttioMark({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="flex items-center justify-center rounded-md font-sans font-[650]"
      style={{ width: size, height: size, fontSize: size * 0.66, background: BRAND('#1C1D1F') }}
    >
      {/* knockout on a child, same reason as Pipedrive above */}
      <span className="text-surface-100">a</span>
    </span>
  )
}

export type IntegrationMark = { name: string; mark: ReactNode }

export const INTEGRATION_MARKS: IntegrationMark[] = [
  { name: 'Salesforce', mark: <SalesforceMark /> },
  { name: 'HubSpot', mark: <Si icon={siHubspot} /> },
  { name: 'Pipedrive', mark: <PipedriveMark /> },
  { name: 'Attio', mark: <AttioMark /> },
  { name: 'Google Calendar', mark: <Si icon={siGooglecalendar} /> },
  { name: 'Notion', mark: <Si icon={siNotion} /> },
  { name: 'Microsoft 365', mark: <Microsoft365Mark /> },
]
