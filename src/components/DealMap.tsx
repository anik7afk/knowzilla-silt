const MONO = "'Inter Variable',Inter,sans-serif" /* mono retired 2026-07-25 */

/* Each deal is its own route (lane), read left→right:
   solid = history, dashed = AI-projected path, node = current position.
   globex: already closed (won, green) · acme-corp: active deal, ring + projection
   northwind: mid-stage, quiet · initech: drifting down, at-risk (red). */

const SOLID_ROUTES = [
  { id: 'globex', d: 'M120,168 Q400,150 700,138 Q850,132 950,126' },
  { id: 'acme', d: 'M100,348 Q250,336 390,316 Q480,302 560,288' },
  { id: 'northwind', d: 'M140,452 Q300,446 430,438 Q520,432 590,426' },
  { id: 'initech', d: 'M160,508 Q350,516 520,526 Q640,532 720,538' },
]

const PROJECTIONS = [
  { id: 'acme-proj', d: 'M560,288 Q700,262 820,240 Q920,224 1010,210' },
  { id: 'northwind-proj', d: 'M590,426 Q700,416 790,408' },
]

/* olive distance markers along acme's solid route (points computed on-curve) */
const TICKS = [
  { x: 198, y: 339 },
  { x: 294, y: 329 },
  { x: 478, y: 302 },
]

export default function DealMap() {
  return (
    <svg
      viewBox="0 0 1120 600"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Abstract deal navigation map"
    >
      <defs>
        <pattern id="dm-dots" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#ECECEB" />
        </pattern>
      </defs>

      {/* base layer */}
      <rect x="0" y="0" width="1120" height="600" fill="#ffffff" />
      <rect x="0" y="0" width="1120" height="600" fill="url(#dm-dots)" />

      {/* solid route histories (draw in on reveal) */}
      <g fill="none" stroke="#6A77E5" strokeWidth="1.5" strokeLinecap="round">
        {SOLID_ROUTES.map((r) => (
          <path
            key={r.id}
            d={r.d}
            className="dealmap-route"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
          />
        ))}
      </g>

      {/* current-position nodes */}
      <circle cx="950" cy="126" r="5" fill="#0FC27B" />
      <circle cx="560" cy="288" r="5" fill="#6A77E5" />
      <circle cx="560" cy="288" r="11" fill="none" stroke="#BEC6F5" strokeWidth="1.5" />
      <circle cx="590" cy="426" r="5" fill="#6A77E5" />
      <circle cx="720" cy="538" r="5" fill="#FF5B59" />

      {/* reveal layer: projections, markers, labels, telemetry */}
      <g className="dealmap-reveal">
        {/* AI-projected paths — dashed, toward where each deal is going */}
        <g fill="none" stroke="#9EA8F0" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 7">
          {PROJECTIONS.map((p) => (
            <path key={p.id} d={p.d} />
          ))}
        </g>
        {/* acme's projected destination: open ring */}
        <circle cx="1010" cy="210" r="5" fill="#ffffff" stroke="#6A77E5" strokeWidth="1.5" />

        {/* olive distance ticks on the active route */}
        <g stroke="#B3B980" strokeWidth="1.5" strokeLinecap="round">
          {TICKS.map((t, i) => (
            <line key={i} x1={t.x} y1={t.y - 5} x2={t.x} y2={t.y + 5} />
          ))}
        </g>

        {/* acme-corp — active deal, tile above node with leader */}
        <line x1="560" y1="268" x2="560" y2="281" stroke="#ECECEB" strokeWidth="1" />
        <rect x="452" y="240" width="216" height="26" rx="8" fill="#ffffff" stroke="#ECECEB" />
        <text x="464" y="257" fontFamily={MONO} fontSize="13" fill="#161514">
          acme-corp · stage 3 · 78%
        </text>

        {/* northwind — tile below node */}
        <rect x="482" y="444" width="216" height="26" rx="8" fill="#ffffff" stroke="#ECECEB" />
        <text x="494" y="461" fontFamily={MONO} fontSize="13" fill="#71706F">
          northwind · stage 2 · 44%
        </text>

        {/* globex — closed won, plain label right of node */}
        <text x="968" y="130" fontFamily={MONO} fontSize="13" fill="#71706F">
          globex · won
        </text>

        {/* initech — at-risk tile right of node */}
        <rect x="748" y="525" width="160" height="26" rx="8" fill="#ffffff" stroke="#ECECEB" />
        <text x="760" y="542" fontFamily={MONO} fontSize="13" fill="#71706F">
          initech · at-risk
        </text>

        {/* telemetry readout, top-right */}
        <text x="880" y="64" fontFamily={MONO} fontSize="13" fill="#7E844F">
          signal latency 12ms
        </text>
        <text x="880" y="84" fontFamily={MONO} fontSize="13" fill="#7E844F">
          forecast accuracy 98.4%
        </text>
      </g>
    </svg>
  )
}
