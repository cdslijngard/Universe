import * as THREE from 'three'

const DEG = Math.PI / 180

/**
 * Equatorial (RA/Dec/distance) to a three.js Y-up cartesian frame.
 * RA in hours, Dec in degrees, distance in whatever unit you want back.
 * Celestial north ends up along +Y so "up" on screen is galactic-ish north.
 */
export function raDecToVec3(raHours: number, decDeg: number, dist: number): THREE.Vector3 {
  const ra = raHours * 15 * DEG
  const dec = decDeg * DEG
  return new THREE.Vector3(
    dist * Math.cos(dec) * Math.cos(ra),
    dist * Math.sin(dec),
    -dist * Math.cos(dec) * Math.sin(ra),
  )
}

/** Galactic longitude/latitude to the same Y-up frame. */
export function galacticToVec3(lDeg: number, bDeg: number, dist: number): THREE.Vector3 {
  const l = lDeg * DEG
  const b = bDeg * DEG
  return new THREE.Vector3(
    dist * Math.cos(b) * Math.cos(l),
    dist * Math.sin(b),
    -dist * Math.cos(b) * Math.sin(l),
  )
}

/** Approximate sRGB colour for a Morgan–Keenan spectral class. */
const CLASS_COLOURS: Record<string, string> = {
  O: '#9bb0ff',
  B: '#aabfff',
  A: '#cad7ff',
  F: '#f8f7ff',
  G: '#fff4ea',
  K: '#ffd2a1',
  M: '#ffb46b',
  L: '#ff8e5a',
  T: '#d96a53',
  D: '#dfe6ff', // white dwarf
}

export function spectralColour(spectralType: string): THREE.Color {
  const key = spectralType.trim().charAt(0).toUpperCase()
  return new THREE.Color(CLASS_COLOURS[key] ?? '#ffffff')
}

/**
 * Effective temperature from a spectral class, used to tint stars that have
 * no measured temperature in the dataset.
 */
export function spectralTemp(spectralType: string): number {
  const key = spectralType.trim().charAt(0).toUpperCase()
  const t: Record<string, number> = {
    O: 35_000, B: 18_000, A: 8_500, F: 6_600,
    G: 5_600, K: 4_400, M: 3_200, L: 1_900, T: 1_100, D: 10_000,
  }
  return t[key] ?? 5_600
}

/**
 * Visual radius for a star marker. Absolute magnitude spans ~20 magnitudes
 * across our neighbourhood, so this compresses hard — a literal luminosity
 * mapping would make Sirius a disc and every red dwarf invisible.
 */
export function starMarkerSize(absMag: number): number {
  const t = THREE.MathUtils.clamp((16 - absMag) / 20, 0, 1)
  return THREE.MathUtils.lerp(0.55, 2.0, Math.pow(t, 1.4))
}
