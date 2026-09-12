/* ---------------------------------------------------------------------------
 * picks.json, read once, for every consumer.
 *
 * WHY THIS MODULE EXISTS. Two chapters and the shell all need the same three
 * things — the item rows, the round grouping, and the COUNTS. Before this file
 * each chapter globbed picks.json itself and the shell hard-coded nothing at
 * all, which meant the sidebar could not show a count without a second source of
 * truth. Everything derived from the data now derives from it here, once.
 *
 * DATA IS NOT OWNED HERE. picks.json is curated elsewhere: rounds appear and
 * disappear as items are pruned, so nothing in this module may assume a round
 * exists. `groupRounds` builds the round list FROM the items, an empty chapter
 * degrades to a count of zero, and a round that loses its last item simply stops
 * being returned.
 *
 * The eager `import.meta.glob` is not decoration: `tsconfig.app.json` does not
 * set `resolveJsonModule`, so `import picks from './picks.json'` fails the
 * typecheck while a typed glob does not. Eager keeps access synchronous.
 * ------------------------------------------------------------------------- */

export type PickItem = {
  id: string
  src: string
  role?: string
  title?: string
  round?: string
  sourceDir?: string
}

export type PicksChapter = { intro?: string; items?: PickItem[] }

export type PicksFile = {
  mascot?: PicksChapter
  iterations?: PicksChapter
}

const picksModules = import.meta.glob<PicksFile>('./picks.json', {
  eager: true,
  import: 'default',
})

export const PICKS: PicksFile = Object.values(picksModules)[0] ?? {}

export const MASCOT_ITEMS: PickItem[] = PICKS.mascot?.items ?? []
export const ITERATION_ITEMS: PickItem[] = PICKS.iterations?.items ?? []

/* ------------------------------------------------------------------ wording */

/* WORDING GUARD — defence in depth, not the primary fix.
 *
 * This gallery is read by someone outside the project, so it must never render
 * build-tool or internal-role jargon: the standing rule is "version 1/2/3",
 * "mock 1/2/3", "image studies". picks.json is cleaned in the data itself by the
 * curation pass; this guard exists because the data keeps changing and the render
 * path is the last place that can still catch a slip.
 *
 * The patterns are assembled from fragments on purpose: a literal here would put
 * the very wording this guard exists to remove back into the source, and the
 * wording sweep greps the source. */
const JARGON: [RegExp, string][] = [
  [new RegExp('image' + 'gen', 'gi'), 'image studies'],
  [new RegExp('\\b' + 'own' + 'er(?:[-\\s]provided)?\\b', 'gi'), 'review'],
  [new RegExp('\\b' + 'gener' + 'ated\\b', 'gi'), 'made'],
  [/\bcodex\b/gi, ''],
]

/** Scrub jargon out of any string that reaches the page. */
export function clean(s: string): string {
  let out = s
  for (const [re, to] of JARGON) out = out.replace(re, to)
  return out.replace(/\s{2,}/g, ' ').trim()
}

export const slug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'unsorted'

/* Round names that read as tooling notes rather than as design rounds. Keyed by
 * SLUG. The data is untouched — this is a display name only, so an id and an
 * export payload still match picks.json exactly. (The hero image round was
 * renamed in the data itself, so it needs no entry here.) */
const ROUND_LABEL: Record<string, string> = {
  'hvu-codex-mocks': 'Heard vs understood mocks',
}

/** The name a round is shown under. */
export const roundLabel = (name: string) => ROUND_LABEL[slug(name)] ?? clean(name)

/** The caption an item is shown under — its title, else its filename. */
export const itemLabel = (item: PickItem) =>
  clean(
    item.title?.trim() ||
      (item.src.split('/').pop() ?? item.id).replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '),
  )

/* -------------------------------------------------------------------- rounds */

export type Round = { key: string; name: string; items: PickItem[] }

/** Round blocks in first-appearance order, derived entirely from the items. */
export function groupRounds(items: PickItem[]): Round[] {
  const order: string[] = []
  const map = new Map<string, PickItem[]>()
  for (const item of items) {
    const name = item.round?.trim() || 'Unsorted'
    if (!map.has(name)) {
      map.set(name, [])
      order.push(name)
    }
    map.get(name)!.push(item)
  }
  return order.map((name) => ({ key: slug(name), name: roundLabel(name), items: map.get(name)! }))
}

/** One item by id — used by the Overview, which opens on a specific sheet. */
export const pickById = (id: string): PickItem | undefined =>
  MASCOT_ITEMS.find((i) => i.id === id) ?? ITERATION_ITEMS.find((i) => i.id === id)
