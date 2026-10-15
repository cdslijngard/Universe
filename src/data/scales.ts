import { AU, EARTH_RADIUS, KM, LY, MLY } from '../lib/constants'

/** The eight abstraction levels, ordered inward (1) to outward (8). */
export type LevelId =
  | 'body'
  | 'system'
  | 'solar'
  | 'kuiper'
  | 'stars'
  | 'galaxy'
  | 'localgroup'
  | 'cosmic'

export interface LevelDef {
  id: LevelId
  /** 1 = most zoomed in. "Zoom out" moves to index + 1. */
  index: number
  title: string
  tagline: string
  /**
   * Metres represented by one scene unit at this level. Chosen so every
   * coordinate in the level lands in roughly 0.1–500 units, which keeps us
   * inside float32's ~7 significant digits. The `body` level overrides this
   * with the focused body's own radius.
   */
  metresPerUnit: number
  camera: {
    /** Default orbit radius, in scene units. */
    distance: number
    fov: number
    /** Wheel-dolly bounds. Hitting one triggers a level change. */
    min: number
    max: number
  }
  /** Rough diameter of what is on screen, for the scale readout. */
  spanMetres: number
}

export const LEVELS: readonly LevelDef[] = [
  {
    id: 'body',
    index: 1,
    title: 'Body',
    tagline: 'One world, up close',
    metresPerUnit: EARTH_RADIUS,
    camera: { distance: 3.7, fov: 42, min: 1.4, max: 10 },
    spanMetres: 4 * EARTH_RADIUS,
  },
  {
    id: 'system',
    index: 2,
    title: 'Planetary system',
    tagline: 'Moons and rings in orbit',
    metresPerUnit: 1e5 * KM,
    camera: { distance: 26, fov: 40, min: 3.5, max: 110 },
    spanMetres: 40 * 1e5 * KM,
  },
  {
    id: 'solar',
    index: 3,
    title: 'Solar system',
    tagline: 'The Sun and its planets',
    metresPerUnit: AU,
    camera: { distance: 96, fov: 40, min: 8, max: 260 },
    spanMetres: 60 * AU,
  },
  {
    id: 'kuiper',
    index: 4,
    title: 'Kuiper belt',
    tagline: "The Sun's frozen frontier",
    metresPerUnit: 10 * AU,
    camera: { distance: 46, fov: 42, min: 6, max: 160 },
    spanMetres: 400 * AU,
  },
  {
    id: 'stars',
    index: 5,
    title: 'Local stars',
    tagline: 'Our stellar neighbourhood',
    metresPerUnit: LY,
    camera: { distance: 58, fov: 45, min: 6, max: 160 },
    spanMetres: 50 * LY,
  },
  {
    id: 'galaxy',
    index: 6,
    title: 'Milky Way',
    tagline: 'A barred spiral, and us inside it',
    metresPerUnit: 1e3 * LY,
    camera: { distance: 112, fov: 45, min: 14, max: 320 },
    spanMetres: 150e3 * LY,
  },
  {
    id: 'localgroup',
    index: 7,
    title: 'Local Group',
    tagline: 'Andromeda and our companions',
    metresPerUnit: 1e5 * LY,
    camera: { distance: 78, fov: 45, min: 9, max: 200 },
    spanMetres: 8 * MLY,
  },
  {
    id: 'cosmic',
    index: 8,
    title: 'Cosmic web',
    tagline: 'Filaments, voids, and the edge of sight',
    metresPerUnit: 10 * MLY,
    // Capped below the CMB shell radius: you cannot step outside the
    // observable universe, which is the point of the level.
    camera: { distance: 190, fov: 48, min: 14, max: 250 },
    spanMetres: 1_400 * MLY,
  },
] as const

export const LEVEL_IDS = LEVELS.map((l) => l.id)

const byId = new Map(LEVELS.map((l) => [l.id, l]))
export const level = (id: LevelId): LevelDef => byId.get(id)!

export const innerOf = (id: LevelId): LevelId | null =>
  level(id).index > 1 ? LEVELS[level(id).index - 2].id : null

export const outerOf = (id: LevelId): LevelId | null =>
  level(id).index < LEVELS.length ? LEVELS[level(id).index].id : null

/**
 * True scale ratio between two levels. Can reach ~6300x (Kuiper to local
 * stars), which is why transitions animate a clamped perceptual zoom instead
 * of this figure — see PERCEPTUAL_ZOOM.
 */
export const scaleRatio = (from: LevelId, to: LevelId): number =>
  level(to).metresPerUnit / level(from).metresPerUnit

/**
 * How far the outgoing level visibly recedes during a transition, regardless
 * of the true ratio. A literal 6300x zoom would spend the whole animation
 * with everything invisibly small; this keeps the motion legible while the
 * scale bar reports the honest number.
 */
export const PERCEPTUAL_ZOOM = 11

/**
 * Metres per scene unit for a level. The body level is the exception: it
 * normalises the focused body to unit radius, so its scale depends on which
 * world you are looking at rather than being fixed.
 */
export function metresPerUnitFor(id: LevelId, focusedRadiusMetres?: number): number {
  if (id === 'body' && focusedRadiusMetres) return focusedRadiusMetres
  return level(id).metresPerUnit
}
