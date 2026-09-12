import { useLayoutEffect } from 'react'
import './mock.css'

/* =====================================================================
 * typewriter — a small, reusable "screen-recording" typing engine.
 *
 * Streams text into DOM nodes character-by-character on a single rAF loop
 * (NEVER via per-char React state), then scripts a whole scene — type a
 * line, pause, flash a "thinking" indicator, reveal a floating card, type
 * the next line, hold, then soft-fade and loop. Motion is transform /
 * opacity / filter only; nothing here triggers a React re-render.
 *
 * Two later hero-adjacent slices import this, so the surface is kept small:
 *
 *   useTypeScene(build, options)   ← the one hook most callers want
 *       build:   () => SceneStep[]   (closes over refs; called once on mount)
 *       options: { reduced?, loop?, holdMs?, fadeRoot?, resetFadeMs?, gapMs? }
 *     On mount it plays the scene on a loop; on unmount it cancels cleanly.
 *     If prefers-reduced-motion is set (or options.reduced is true) it skips
 *     all animation and paints the fully-resolved FINAL frame synchronously
 *     (before browser paint — no empty flash).
 *
 *   playScene(steps, options) -> { stop() }   imperative controller
 *   resolveSceneStatic(steps)                 paint the resolved final frame
 *   typeInto(el, text, opts, signal)          low-level single-line typer
 *   prefersReducedMotion()                    media-query helper
 *
 * Targets are passed as a `RefLike`: either a React ref object
 * ({ current }) or a `() => HTMLElement | null` getter — resolved lazily so
 * layout can change (e.g. a card that is in-flow on mobile, absolute on
 * desktop) without touching the script.
 *
 * SceneStep kinds:
 *   type   — type `text` into `el.textContent`; blinks `caret` while active
 *   pause  — wait `ms`
 *   show   — add `.is-shown` to `el` (pair with a `.mock-reveal` base class)
 *   hide   — remove `.is-shown` from `el`
 *   clear  — empty `el.textContent`
 *   run    — call `fn()` (imperative escape hatch)
 *
 * NOTE on the static frame: resolveSceneStatic replays type/show/hide/clear
 * only (pauses are skipped, `run` is NOT executed). So any state that must
 * exist in the resting frame has to be expressed with those four kinds, not
 * hidden inside a `run`. A "thinking" indicator shown-then-hidden in the
 * script therefore correctly ends up hidden in the static frame.
 *
 * The loop's soft reset is derived automatically from the script: every
 * `type` target is cleared and every `show` target is hidden, while
 * `fadeRoot` (if given) fades out and back via the `.mock-resetting` class.
 * Keep the script's own steps to a single build-up pass — do not script the
 * reset yourself.
 * ===================================================================== */

export type RefLike =
  | { current: HTMLElement | null }
  | (() => HTMLElement | null)

export type SceneStep =
  | { kind: 'type'; el: RefLike; text: string; caret?: RefLike; cps?: number }
  | { kind: 'pause'; ms: number }
  | { kind: 'show'; el: RefLike }
  | { kind: 'hide'; el: RefLike }
  | { kind: 'clear'; el: RefLike }
  | { kind: 'run'; fn: () => void }

export interface SceneOptions {
  /** Loop the scene forever (default true). */
  loop?: boolean
  /** Hold the fully-composed frame before resetting, ms (default 4000). */
  holdMs?: number
  /** Element faded out/in during the soft reset (usually the transcript body). */
  fadeRoot?: RefLike
  /** Reset fade duration, ms (default 420). Keep in sync with .mock-fade-root. */
  resetFadeMs?: number
  /** Blank gap after reset before the next pass, ms (default 400). */
  gapMs?: number
}

export interface UseTypeSceneOptions extends SceneOptions {
  /** Force the static (no-animation) path regardless of the media query. */
  reduced?: boolean
}

export interface SceneController {
  stop(): void
}

/* ~ estimated feel — centre speed with jitter spreads the effective rate to
   roughly 37–56 chars/sec, the target "someone typing on a live call" band. */
const DEFAULT_CPS = 45
const DEFAULT_JITTER = 0.2

function resolve(t: RefLike | undefined): HTMLElement | null {
  if (!t) return null
  return typeof t === 'function' ? t() : t.current
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/* Cancellation token shared across a scene's timers and rAF handles. */
class SceneSignal {
  cancelled = false
  private cleanups = new Set<() => void>()
  onCancel(fn: () => void): () => void {
    if (this.cancelled) {
      fn()
      return () => {}
    }
    this.cleanups.add(fn)
    return () => this.cleanups.delete(fn)
  }
  cancel(): void {
    if (this.cancelled) return
    this.cancelled = true
    this.cleanups.forEach((fn) => fn())
    this.cleanups.clear()
  }
}

function wait(ms: number, signal: SceneSignal): Promise<void> {
  return new Promise((res) => {
    if (signal.cancelled) return res()
    let off = () => {}
    const id = window.setTimeout(() => {
      off()
      res()
    }, ms)
    off = signal.onCancel(() => {
      window.clearTimeout(id)
      res()
    })
  })
}

/**
 * Types `text` into `el.textContent`, one glyph at a time, on a single rAF
 * loop with per-glyph jitter. Blinks `caret` (adds `.is-on`) while active.
 * Resolves when finished or when `signal` is cancelled. Never re-renders.
 */
export function typeInto(
  el: HTMLElement,
  text: string,
  opts: { cps?: number; jitter?: number; caret?: HTMLElement | null } = {},
  signal: SceneSignal,
): Promise<void> {
  const cps = opts.cps ?? DEFAULT_CPS
  const jitter = opts.jitter ?? DEFAULT_JITTER
  const caret = opts.caret ?? null
  const base = 1000 / cps
  const nextDelay = () => base * (1 + (Math.random() * 2 - 1) * jitter)

  return new Promise((res) => {
    el.textContent = ''
    if (caret) caret.classList.add('is-on')

    let i = 0
    let last = performance.now()
    let acc = 0
    let delay = nextDelay()
    let rafId = 0

    const finish = () => {
      if (caret) caret.classList.remove('is-on')
      offCancel()
      res()
    }

    const frame = (now: number) => {
      if (signal.cancelled) return finish()
      acc += now - last
      last = now
      while (acc >= delay && i < text.length) {
        acc -= delay
        i += 1
        el.textContent = text.slice(0, i)
        delay = nextDelay()
      }
      if (i >= text.length) return finish()
      rafId = requestAnimationFrame(frame)
    }

    const offCancel = signal.onCancel(() => {
      cancelAnimationFrame(rafId)
      if (caret) caret.classList.remove('is-on')
    })

    rafId = requestAnimationFrame(frame)
  })
}

async function runSteps(steps: SceneStep[], signal: SceneSignal): Promise<void> {
  for (const step of steps) {
    if (signal.cancelled) return
    switch (step.kind) {
      case 'type': {
        const el = resolve(step.el)
        if (el) {
          await typeInto(
            el,
            step.text,
            { cps: step.cps, caret: resolve(step.caret) },
            signal,
          )
        }
        break
      }
      case 'pause':
        await wait(step.ms, signal)
        break
      case 'show':
        resolve(step.el)?.classList.add('is-shown')
        break
      case 'hide':
        resolve(step.el)?.classList.remove('is-shown')
        break
      case 'clear': {
        const el = resolve(step.el)
        if (el) el.textContent = ''
        break
      }
      case 'run':
        step.fn()
        break
    }
  }
}

/**
 * Applies the fully-resolved final frame instantly (no timing). Used for the
 * reduced-motion path. `run` steps and pauses are intentionally skipped.
 */
export function resolveSceneStatic(steps: SceneStep[]): void {
  for (const step of steps) {
    switch (step.kind) {
      case 'type': {
        const el = resolve(step.el)
        if (el) el.textContent = step.text
        resolve(step.caret)?.classList.remove('is-on')
        break
      }
      case 'show':
        resolve(step.el)?.classList.add('is-shown')
        break
      case 'hide':
        resolve(step.el)?.classList.remove('is-shown')
        break
      case 'clear': {
        const el = resolve(step.el)
        if (el) el.textContent = ''
        break
      }
      // 'pause' and 'run' are no-ops for the static frame.
    }
  }
}

/**
 * Plays `steps` once, then (if looping) holds, soft-resets, and repeats.
 * Returns a controller whose `stop()` cancels every pending timer / rAF.
 */
export function playScene(steps: SceneStep[], opts: SceneOptions = {}): SceneController {
  const {
    loop = true,
    holdMs = 4000,
    fadeRoot,
    resetFadeMs = 420,
    gapMs = 400,
  } = opts
  const signal = new SceneSignal()

  // Derive the soft-reset from the script: clear typed lines, hide reveals.
  const typeRefs = steps.filter((s) => s.kind === 'type').map((s) => (s as { el: RefLike }).el)
  const showRefs = steps.filter((s) => s.kind === 'show').map((s) => (s as { el: RefLike }).el)

  const softReset = async () => {
    for (const ref of showRefs) resolve(ref)?.classList.remove('is-shown')
    const root = resolve(fadeRoot)
    if (root) root.classList.add('mock-resetting')
    await wait(resetFadeMs, signal)
    if (signal.cancelled) return
    for (const ref of typeRefs) {
      const el = resolve(ref)
      if (el) el.textContent = ''
    }
    if (root) root.classList.remove('mock-resetting')
  }

  const run = async () => {
    do {
      await runSteps(steps, signal)
      if (signal.cancelled) return
      await wait(holdMs, signal)
      if (!loop || signal.cancelled) return
      await softReset()
      if (signal.cancelled) return
      await wait(gapMs, signal)
    } while (loop && !signal.cancelled)
  }

  void run()
  return {
    stop() {
      signal.cancel()
    },
  }
}

/**
 * React entry point. Plays the scene for the lifetime of the component,
 * cancelling on unmount. Reduced motion → resolved static frame, painted
 * before the browser's first paint (via layout effect) so nothing flashes.
 */
export function useTypeScene(
  build: () => SceneStep[],
  options: UseTypeSceneOptions = {},
): void {
  const { reduced, ...sceneOptions } = options
  useLayoutEffect(() => {
    const steps = build()
    if (reduced || prefersReducedMotion()) {
      resolveSceneStatic(steps)
      return
    }
    const scene = playScene(steps, sceneOptions)
    return () => scene.stop()
    // Refs are stable; the scene is (re)built once per mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
