/* ---------------------------------------------------------------------------
 * The mascot pose library — 58 cut-out poses, read once, for every consumer.
 *
 * poses.json is GENERATED from `public/mascot/poses/manifest.json` (the output
 * of `scripts/split-mascot-pose-sheets.py`) — regenerate it there, never edit
 * it by hand. The images themselves are the transparent cut-outs under
 * `public/mascot/poses/transparent/`, so they sit directly on the chapter
 * ground with no well or card around them.
 *
 * Same eager-glob trick as picks.ts: `tsconfig.app.json` does not set
 * `resolveJsonModule`, so a typed glob is what keeps the import checkable.
 * ------------------------------------------------------------------------- */

export type Pose = {
  id: string
  name: string
  src: string
  width: number
  height: number
}

type PosesFile = { source?: string; poses?: Pose[] }

const poseModules = import.meta.glob<PosesFile>('./poses.json', {
  eager: true,
  import: 'default',
})

export const POSES: Pose[] = Object.values(poseModules)[0]?.poses ?? []
