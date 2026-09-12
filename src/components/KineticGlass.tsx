import KineticConversation from './KineticConversation'
import './KineticGlass.css'

/* Standalone audition: same frozen KineticConversation scene, restyled as
   iOS frosted glass (HvuGlass grammar) over a soft lavender bed.
   Landing page and KineticConversation itself are untouched — review only
   at /kinetic-glass and /stage?c=kinetic-glass. */

export default function KineticGlass() {
  return (
    <div className="kinetic-glass">
      <KineticConversation />
    </div>
  )
}
