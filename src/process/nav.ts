/* ---------------------------------------------------------------------------
 * The chapter list, in its own module.
 *
 * It lives here rather than in ProcessPanel because the Overview renders the same
 * six rows as a chapter index, and importing them from the shell would put
 * Overview and ProcessPanel in an import cycle.
 *
 * COUNTS ARE DERIVED. `SCENES.length` and the picks.json item counts, never a
 * literal: the image chapters are pruned continuously, so a number typed here
 * would be stale before it was read.
 * ------------------------------------------------------------------------- */
import { ITERATION_ITEMS, MASCOT_ITEMS } from './picks'
import { POSES } from './poses'
import { SCENES } from './scenes'

export type ChapterKey =
  | 'overview'
  | 'design-system'
  | 'animation-system'
  | 'mascot'
  | 'components'
  | 'iterations'

export type Chapter = { key: ChapterKey; n: string; label: string; count?: number }

export const CHAPTERS: Chapter[] = [
  { key: 'overview', n: '01', label: 'Overview' },
  { key: 'design-system', n: '02', label: 'Design system' },
  { key: 'animation-system', n: '03', label: 'Animation system' },
  { key: 'mascot', n: '04', label: 'Mascot', count: MASCOT_ITEMS.length + POSES.length },
  { key: 'components', n: '05', label: 'Components', count: SCENES.length },
  { key: 'iterations', n: '06', label: 'Iterations & ideas', count: ITERATION_ITEMS.length },
]

/** The hash IS the address, so navigating is writing it. */
export function goToChapter(k: ChapterKey) {
  window.location.hash = k
  window.scrollTo({ top: 0 })
}
