import { create } from 'zustand'
import { getBody, moonsOf } from '../data/bodies'
import { innerOf, LEVELS, outerOf, PERCEPTUAL_ZOOM, type LevelId } from '../data/scales'

export type SelectionKind =
  | 'body' | 'star' | 'belt' | 'shell' | 'probe' | 'landmark' | 'member' | 'web' | 'structure'

export interface Selection {
  id: string
  kind: SelectionKind
}

export interface TransitionState {
  from: LevelId
  to: LevelId
  /** +1 when zooming out to a larger level, -1 when zooming in. */
  dir: 1 | -1
  startedAt: number
  duration: number
}

interface NavState {
  current: LevelId
  /** Which body the `body` level renders. */
  focusBody: string
  /** Which planet's moon system the `system` level renders. */
  focusSystem: string
  /** Selection is remembered per level, so returning feels continuous. */
  selectionByLevel: Partial<Record<LevelId, Selection>>
  /** Levels visited, most recent last. Drives the breadcrumb. */
  route: LevelId[]
  transition: TransitionState | null
  /** Draw moon orbits at true relative distance instead of compressed. */
  trueScale: boolean
  /** Show orbit paths and labels. */
  showLabels: boolean
  reducedMotion: boolean

  goTo: (to: LevelId, opts?: { focusBody?: string; focusSystem?: string }) => void
  zoomOut: () => void
  zoomIn: () => void
  select: (sel: Selection | null) => void
  /** Select, then descend into it. The main interaction on the big levels. */
  enter: (sel: Selection) => void
  endTransition: () => void
  setTrueScale: (v: boolean) => void
  setShowLabels: (v: boolean) => void
  setReducedMotion: (v: boolean) => void
}

/**
 * Transition progress lives outside React so the ~60 fps cross-fade does not
 * re-render the tree. Scene components read it inside useFrame.
 */
export const clock = {
  t: 1,
  from: null as LevelId | null,
  to: 'body' as LevelId | null,
  dir: 1 as 1 | -1,
}

export const TRANSITION_MS = 700

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Opacity for a level during a transition. The incoming level comes up a
 * little faster than the outgoing one goes down, which stops the screen from
 * dipping to black in the middle of a zoom.
 */
export function fadeFor(id: LevelId): number {
  if (clock.t >= 1) return id === clock.to ? 1 : 0
  const t = easeInOut(clock.t)
  if (id === clock.to) return Math.min(1, t * 1.45)
  if (id === clock.from) return Math.max(0, 1 - t * 1.25)
  return 0
}

/**
 * Scale for a level during a transition. Both levels move the same way — when
 * you zoom out, the scene you are leaving shrinks away and the scene you are
 * entering shrinks into place around it, because you were inside it all along.
 * The factor is PERCEPTUAL_ZOOM rather than the true ratio between levels,
 * which can be thousands and would spend the whole animation invisible.
 */
export function scaleFor(id: LevelId): number {
  if (clock.t >= 1) return 1
  const t = easeInOut(clock.t)
  const Z = PERCEPTUAL_ZOOM
  const out = clock.dir === 1
  if (id === clock.to) return lerp(out ? Z : 1 / Z, 1, t)
  if (id === clock.from) return lerp(1, out ? 1 / Z : Z, t)
  return 1
}

/** Levels that need to be mounted right now. */
export function activeLevels(current: LevelId, transition: TransitionState | null): LevelId[] {
  if (!transition) return [current]
  return transition.from === transition.to ? [current] : [transition.from, transition.to]
}

const levelIndexOf = (id: LevelId) => LEVELS.find((l) => l.id === id)!.index

/** Does this body warrant its own `system` level, or should we skip past it? */
function hasSystem(bodyId: string): boolean {
  return moonsOf(bodyId).length > 0
}

/** The planet whose system contains this body. */
function systemFor(bodyId: string): string {
  const b = getBody(bodyId)
  if (!b) return 'earth'
  if (b.kind === 'moon' && b.parent) return b.parent
  return bodyId
}

export const useNav = create<NavState>((set, get) => ({
  current: 'body',
  focusBody: 'earth',
  focusSystem: 'earth',
  selectionByLevel: { body: { id: 'earth', kind: 'body' } },
  route: ['body'],
  transition: null,
  trueScale: false,
  showLabels: true,
  reducedMotion: false,

  goTo: (to, opts) => {
    const s = get()
    if (to === s.current && !opts) return

    const from = s.current
    const dir: 1 | -1 = (outerOf(from) === to || levelIndexOf(to) > levelIndexOf(from)) ? 1 : -1
    const duration = s.reducedMotion ? 0 : TRANSITION_MS

    // Route keeps the trail the user actually took; revisiting a level
    // truncates back to it rather than appending a duplicate.
    const existing = s.route.lastIndexOf(to)
    const route = existing >= 0 ? s.route.slice(0, existing + 1) : [...s.route, to]

    clock.from = from
    clock.to = to
    clock.dir = dir
    clock.t = duration === 0 ? 1 : 0

    const focusBody = opts?.focusBody ?? s.focusBody
    const focusSystem = opts?.focusSystem ?? s.focusSystem

    // The body and system levels render one specific object, so arriving at
    // one selects it. Without this the info panel keeps describing whatever
    // was selected last — you land on Jupiter and read about Earth.
    const selectionByLevel = { ...s.selectionByLevel }
    if (to === 'body') selectionByLevel.body = { id: focusBody, kind: 'body' }
    if (to === 'system' && !selectionByLevel.system) {
      selectionByLevel.system = { id: focusSystem, kind: 'body' }
    }

    set({
      current: to,
      route,
      focusBody,
      focusSystem,
      selectionByLevel,
      transition: duration === 0 ? null : { from, to, dir, startedAt: performance.now(), duration },
    })
  },

  zoomOut: () => {
    const s = get()
    const next = outerOf(s.current)
    if (!next) return
    // A body with no moons has no meaningful system level; step over it.
    if (s.current === 'body' && next === 'system') {
      const sys = systemFor(s.focusBody)
      if (!hasSystem(sys)) return get().goTo('solar')
      return get().goTo('system', { focusSystem: sys })
    }
    get().goTo(next)
  },

  zoomIn: () => {
    const s = get()
    const prev = innerOf(s.current)
    if (!prev) return
    const sel = s.selectionByLevel[s.current]

    if (s.current === 'solar') {
      // Descend into whatever is selected, skipping the system level for
      // moonless worlds so you land straight on the planet.
      const target = sel?.kind === 'body' ? sel.id : 'earth'
      const body = getBody(target)
      if (body && (body.kind === 'planet' || body.kind === 'dwarf' || body.kind === 'star')) {
        if (hasSystem(target)) return get().goTo('system', { focusSystem: target, focusBody: target })
        return get().goTo('body', { focusBody: target })
      }
      return get().goTo('system', { focusSystem: 'earth', focusBody: 'earth' })
    }

    if (s.current === 'system') {
      const target = sel?.kind === 'body' ? sel.id : s.focusSystem
      return get().goTo('body', { focusBody: target })
    }

    get().goTo(prev)
  },

  select: (sel) =>
    set((s) => ({
      selectionByLevel: { ...s.selectionByLevel, [s.current]: sel ?? undefined },
    })),

  enter: (sel) => {
    get().select(sel)
    const s = get()

    if (s.current === 'system' && sel.kind === 'body') {
      return get().goTo('body', { focusBody: sel.id })
    }
    if (s.current === 'solar' && sel.kind === 'body') {
      const body = getBody(sel.id)
      if (body?.kind === 'moon') return get().goTo('body', { focusBody: sel.id })
      if (hasSystem(sel.id)) return get().goTo('system', { focusSystem: sel.id, focusBody: sel.id })
      return get().goTo('body', { focusBody: sel.id })
    }
    if (s.current === 'kuiper' && sel.kind === 'body') {
      return get().goTo('body', { focusBody: sel.id })
    }
    // Deeper levels have one canonical child scene.
    const prev = innerOf(s.current)
    if (prev) get().zoomIn()
  },

  endTransition: () => {
    clock.t = 1
    set({ transition: null })
  },

  setTrueScale: (v) => set({ trueScale: v }),
  setShowLabels: (v) => set({ showLabels: v }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
}))

/** Selection for the level currently on screen. */
export const useSelection = (): Selection | undefined =>
  useNav((s) => s.selectionByLevel[s.current])
