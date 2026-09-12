import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
/* opsz build: Inter 4's optical-size axis — large text auto-slides to the
   Display cut (font-optical-sizing:auto is the default), so "Inter Display"
   needs no separate family. Swapped from the wght-only build 2026-07-29. */
import '@fontsource-variable/inter/opsz.css'
/* JetBrains Mono removed 2026-07-25 — the mono label device is retired; Inter
   carries eyebrows and read-outs (see design-system/tokens.css). */
import '@fontsource-variable/newsreader'
import '@fontsource-variable/newsreader/wght-italic.css'
/* Didone display face for the kinetic buyer quote (user-directed from their
   poster reference, 2026-07-25) — used only in KineticConversation */
import '@fontsource-variable/bodoni-moda'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
