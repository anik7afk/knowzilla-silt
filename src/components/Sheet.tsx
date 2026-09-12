import { useEffect, useRef, type ReactNode } from 'react'

/* THE SHEET — the white panel the page opens on (Hero + IntegrationsStrip +
   the frozen KineticConversation), laid on the page's dotted desk.
   Grammar, geometry and the KC→HVU pin are documented in PagePlanes.css; this
   file exists for ONE reason, recorded here because it looks like something a
   later pass would try to delete (one did, on 2026-07-29, and the owner put the
   pin straight back: "wait maybe no dont remove the animation scroll that we had
   from kinetic to hvu"):

   THE PIN NEEDS THE SHEET'S OWN HEIGHT, AND CSS CANNOT NAME IT.
   The transition asks for "freeze this box when its bottom edge reaches the
   bottom of the viewport". The obvious spelling — `position: sticky;
   bottom: 0` — DOES NOT WORK for a box taller than the scrollport: measured in
   Chromium 2026-07-29 with a 2000px box in a 600px viewport, the box's bottom
   edge sails straight through the viewport bottom (0px of sticky offset at
   every scroll position), while the same declaration on a 400px box behaves.
   The formulation that does work is a NEGATIVE TOP inset — `top: calc(100svh −
   <the box's own height>)`, i.e. "hold once the top has risen that far", which
   is the same constraint written from the other end. Verified in the same
   matrix: the bottom edge holds at the viewport bottom for the whole hold and
   the next section climbs over it.
   CSS has no unit for "my own height" (a percentage in `top` resolves against
   the containing block, and a container-query unit needs an ancestor container
   — which would also be the sticky box's containing block and would therefore
   leave it zero travel). So the height is measured here, once, and handed to
   CSS as `--sheet-h`.

   COST, honestly: one ResizeObserver read + one custom-property write per
   layout change of the sheet. Nothing in the scroll path, nothing per frame, no
   React state, no re-render. If this effect never runs, `--sheet-h` falls back
   to a value so large that the pin can never engage (PagePlanes.css), so the
   page degrades to the old plain-flow join rather than to a frozen hero. */
export default function Sheet({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    /* border-box height, sub-pixel: the sheet carries its two full-bleed
       hairlines and the hero/KC tracks are svh-based, so both the integer
       rounding and the viewport term matter to where the freeze lands */
    const sync = () => el.style.setProperty('--sheet-h', `${el.getBoundingClientRect().height}px`)
    sync()
    /* writing --sheet-h only moves a sticky offset — it cannot change layout,
       so this observer cannot feed itself */
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    window.addEventListener('resize', sync, { passive: true })
    document.fonts?.ready.then(sync).catch(() => {})
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [])

  /* OWNER CORRECTION 2026-07-29: "when i said full screen with the 2nd white
     panel i meant complete full." The sheet is one full-viewport-width white
     surface — no container, no gutters, no inset vertical edges — so the wrapper
     that used to hold the 1440/30px measure and the white panel inside it are
     both gone. One element does all three jobs now: the pin, the ground, and the
     two full-bleed horizontals (as pseudo-elements). */
  return (
    <div ref={ref} className="sheet">
      {children}
    </div>
  )
}
