import { StrictMode } from 'react'
/* Same global font + stylesheet imports as main.tsx, so the page paints
   identically when Silt mounts this file instead of the app entry. */
import '@fontsource-variable/inter/opsz.css'
import '@fontsource-variable/newsreader'
import '@fontsource-variable/newsreader/wght-italic.css'
import '@fontsource-variable/bodoni-moda'
import './index.css'
import App from './App'

/** Silt mount: the full Knowzilla landing flow — App's default (`/`) route,
 *  Nav → Hero → … → Footer — rendered as one page-sized component. */
export default function LandingPage() {
  return (
    <StrictMode>
      <App />
    </StrictMode>
  )
}
