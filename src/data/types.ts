import type { Elements } from '../lib/kepler'
import type { LevelId } from './scales'

export type BodyKind =
  | 'star' | 'planet' | 'dwarf' | 'moon' | 'belt' | 'boundary'
  | 'probe' | 'galaxy' | 'cluster' | 'structure' | 'nebula'

/** Which procedural shader branch renders this body. */
export type SurfaceKind =
  | 'star' | 'gasGiant' | 'iceGiant' | 'terrestrial' | 'rocky' | 'icy' | 'volcanic'

export interface Appearance {
  surface: SurfaceKind
  /** Base palette, darkest to lightest. Hex strings. */
  palette: string[]
  /** Band contrast for giants; crater density for rocky worlds. 0–1. */
  roughness?: number
  /** Opacity of the separately-rotating cloud shell. 0 disables it. */
  clouds?: number
  /** A named storm: normalised latitude, angular size, tint. */
  storm?: { lat: number; size: number; colour: string; name?: string }
  /** Fresnel limb glow. */
  atmosphere?: { colour: string; strength: number }
  rings?: { innerR: number; outerR: number; tilt?: number; opacity?: number; gaps?: [number, number][] }
  /** Axial tilt in degrees — tilts the render, and it is a stated fact. */
  tilt?: number
  /**
   * Polar flattening, (equatorial − polar) / equatorial. Jupiter spins once
   * in under ten hours and is visibly 6.5% wider than it is tall; drawing
   * the giants as perfect spheres loses something real.
   */
  flattening?: number
  /** Sidereal rotation period in days; negative is retrograde. */
  day?: number
  /** Emissive bodies skip the sun-direction lighting term. */
  emissive?: boolean
}

export interface Fact {
  label: string
  value: string
}

export interface Body {
  id: string
  name: string
  kind: BodyKind
  /** Parent body id — the Sun for planets, a planet for moons. */
  parent?: string
  /** Mean radius in metres. */
  radius: number
  /** Mass in kg. */
  mass?: number
  /** Surface gravity, m/s². */
  gravity?: number
  /** Mean surface or effective temperature, K. */
  temp?: number
  /** Orbit about the parent. Moons use AU too, for one consistent unit. */
  orbit?: Elements
  appearance: Appearance
  /** One or two sentences. The voice of the app. */
  blurb: string
  /** Extra rows for the info panel beyond the derived ones. */
  facts?: Fact[]
  discovery?: { year?: number | string; by?: string }
  /** Deepest level at which this object can be focused. */
  deepest?: LevelId
  /** Highlight in lists and give a label in the 3D scene. */
  notable?: boolean
}

/** A star in the local-neighbourhood level. */
export interface Star {
  id: string
  name: string
  /** Right ascension in hours, declination in degrees. */
  ra: number
  dec: number
  /** Distance in light years. */
  dist: number
  /** Morgan–Keenan spectral type. */
  spectral: string
  /** Absolute visual magnitude. */
  absMag: number
  /** Apparent visual magnitude. */
  appMag?: number
  /** Known planets, if any. */
  planets?: number
  blurb: string
  facts?: Fact[]
  notable?: boolean
  /** Members of a multiple system share a system id and are drawn together. */
  system?: string
}

/** A galaxy or large-scale structure, positioned in its level's own frame. */
export interface DeepObject {
  id: string
  name: string
  kind: BodyKind
  /** Position in the level's scene units. */
  pos: [number, number, number]
  /** Diameter in light years (galaxies) or Mly (structures). */
  diameter: number
  /** Distance from us, in metres — used for the info panel, not placement. */
  distance: number
  morphology?: string
  colour: string
  /** Billboard style for procedural galaxy sprites. */
  shape?: 'spiral' | 'barred' | 'elliptical' | 'irregular' | 'dwarf'
  /** Rotation of the billboard, radians. */
  roll?: number
  blurb: string
  facts?: Fact[]
  notable?: boolean
}
