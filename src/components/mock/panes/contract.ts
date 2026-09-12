import type { ReactNode } from 'react'

/* ---------- pane contract -------------------------------------------
 * Every surface inside the hero's product frame is a self-contained
 * module: its own markup, its own beat list, its own settled frame.
 *
 * The frame owns ONE virtual clock (AppFrame.tsx). When a surface becomes
 * active the clock rewinds it to its opening frame and then replays its
 * beats against a monotonically increasing offset. Beats are handed the
 * pane's own root element and write STRAIGHT TO THE DOM — textContent,
 * classList, style.transform. No beat may call setState: the whole tour
 * has to cost zero React commits (see scripts/session7-scene.mjs, which
 * counts them).
 *
 * Markup ships the SETTLED end state so a reduced-motion visitor — and a
 * visitor whose JS never runs — sees a finished, readable surface. The
 * rewind is what creates the "before", not the markup.
 * -------------------------------------------------------------------- */

/** One thing happening, at a fixed offset from the surface becoming active. */
export type Beat = {
  /** ms since this pane became active */
  at: number
  run: (root: HTMLElement) => void
}

export type PaneModule = {
  /** Sidebar label — must match the product's real nav wording. */
  name: string
  /** Left side of the frame's top bar while this surface is showing. */
  breadcrumb: string
  /** Right side of the top bar: this surface's contextual actions. */
  actions?: { label: string; primary?: boolean }[]
  Pane: () => ReactNode
  /** How long the tour holds this surface before moving on (ms). */
  hold: number
  beats?: Beat[]
  /** Put the surface back to its opening frame (called on entry). */
  rewind?: (root: HTMLElement) => void
  /** Jump to the finished frame (reduced motion, or the visitor taking over). */
  settle?: (root: HTMLElement) => void
}

/* ---------- DOM helpers shared by every pane ------------------------ */

/** The single element tagged `data-b="key"` inside this pane. */
export const q = (root: HTMLElement, key: string) =>
  root.querySelector<HTMLElement>(`[data-b="${key}"]`)

/** Every element tagged `data-b="key"`, in document order. */
export const qa = (root: HTMLElement, key: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(`[data-b="${key}"]`))

/** Reveal / hide, using the shared `.is-shown` convention from AppFrame.css. */
export const show = (el: HTMLElement | null) => el?.classList.add('is-shown')
export const hide = (el: HTMLElement | null) => el?.classList.remove('is-shown')

export const showAll = (root: HTMLElement, key: string) => qa(root, key).forEach(show)
export const hideAll = (root: HTMLElement, key: string) => qa(root, key).forEach(hide)

/** Write text without touching React state. */
export const text = (el: HTMLElement | null, v: string) => {
  if (el) el.textContent = v
}

/** Grow a bar that is transformed on scaleX (transform-only, compositor-safe). */
export const bar = (el: HTMLElement | null, pct: number) => {
  if (el) el.style.transform = `scaleX(${Math.max(0, Math.min(100, pct)) / 100})`
}

/* ---------- the simulated pointer ------------------------------------
 * The demo is meant to read as SOMEONE USING THE PRODUCT, not as a slide
 * deck. A single pointer lives in the frame; beats drive it, and wherever
 * it lands the real hover state lights up — the same `.af-hoverable`
 * state a visitor's own mouse gets, so nothing here is a special-case
 * fake. Hover is asymmetric (50ms in, 300ms out) per the donor's measured
 * hover grammar (inspo/attio/DESIGN.md §5).
 *
 * Everything is transform + opacity, and the pointer is a single node, so
 * driving it costs no layout and no React renders.
 * -------------------------------------------------------------------- */

const frameOf = (root: HTMLElement) => root.closest<HTMLElement>('[data-appframe]')
const cursorOf = (root: HTMLElement) =>
  frameOf(root)?.querySelector<HTMLElement>('[data-cursor]') ?? null

/** Clear every hover/press state in the frame. */
export const unhover = (root: HTMLElement) => {
  frameOf(root)
    ?.querySelectorAll('.is-hover, .is-press')
    .forEach((el) => el.classList.remove('is-hover', 'is-press'))
}

/** Send the pointer to the element tagged `key`, and light its hover state.
 *  `at` biases where on the target it lands (0 = left edge, 1 = right). */
export const pointTo = (root: HTMLElement, key: string, at = 0.5, yAt = 0.5) => {
  const frame = frameOf(root)
  const cur = cursorOf(root)
  const el = q(root, key)
  if (!frame || !cur || !el) return
  const f = frame.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  if (!r.width && !r.height) return
  unhover(root)
  el.classList.add('is-hover')
  cur.classList.add('is-shown')
  cur.style.transform = `translate3d(${r.left - f.left + r.width * at}px, ${
    r.top - f.top + r.height * yAt
  }px, 0)`
}

/** A visible click on whatever the pointer is currently over. */
export const pressOn = (root: HTMLElement, key: string) => {
  const el = q(root, key)
  const cur = cursorOf(root)
  el?.classList.add('is-press')
  cur?.classList.add('is-press')
}

export const releaseOn = (root: HTMLElement, key: string) => {
  q(root, key)?.classList.remove('is-press')
  cursorOf(root)?.classList.remove('is-press')
}

/** Take the pointer off-stage (end of a surface's turn). */
export const hidePointer = (root: HTMLElement) => {
  unhover(root)
  cursorOf(root)?.classList.remove('is-shown', 'is-press')
}

export type { ReactNode }
