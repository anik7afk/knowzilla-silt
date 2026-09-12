import { useEffect, useRef, useState } from 'react'

/* Shared once-per-viewport-entry trigger. Attaches an IntersectionObserver to
   `ref`, flips `inView` true the first time the element crosses the threshold,
   then disconnects — no per-frame work, fires exactly once. Components gate
   their entrance classes on `inView`; reduced-motion is handled in CSS. */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.2 },
) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
          break
        }
      }
    }, options)
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, inView }
}
