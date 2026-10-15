import * as THREE from 'three'
import { ARMS, BULGE_RADIUS, BAR_LENGTH, DISC_RADIUS } from '../data/galaxy'
import { mulberry32 } from './Starfield'

/** Winding rate that carries an arm from rStart to rEnd over its sweep. */
export const armGrowth = (arm: { rStart: number; rEnd: number; sweep: number }): number =>
  Math.log(arm.rEnd / arm.rStart) / arm.sweep

/** Box–Muller, for the gaussian scatter that gives arms soft edges. */
function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
}

const YOUNG = new THREE.Color('#9fc4ff')
const MID = new THREE.Color('#fff0d8')
const OLD = new THREE.Color('#ffc98a')
const CORE = new THREE.Color('#fff3c4')

export interface GalaxyBuffers {
  position: Float32Array
  colour: Float32Array
  size: Float32Array
  count: number
}

/**
 * A barred spiral built from logarithmic arms, a central bar, a bulge and a
 * sparse halo. Stellar populations are coloured by where they are: blue and
 * young in the arms, yellow and old in the core, which is what gives a real
 * spiral its colour gradient.
 */
export function buildMilkyWay(): GalaxyBuffers {
  const rand = mulberry32(0xa11ce)
  const pos: number[] = []
  const col: number[] = []
  const siz: number[] = []

  const push = (x: number, y: number, z: number, c: THREE.Color, s: number) => {
    pos.push(x, y, z)
    col.push(c.r, c.g, c.b)
    siz.push(s)
  }

  // --- Spiral arms -------------------------------------------------------
  for (const arm of ARMS) {
    for (let i = 0; i < arm.count; i++) {
      const t = Math.pow(rand(), 0.75)
      const theta = arm.startAngle + t * arm.sweep
      // Logarithmic spiral. The growth rate is derived from the arm's own
      // start and end radii rather than authored separately, so an arm
      // always spans exactly the range the data claims.
      const r = arm.rStart * Math.exp(armGrowth(arm) * t * arm.sweep)
      if (r > DISC_RADIUS * 1.12) continue

      const scatter = arm.width * (0.55 + t * 0.9)
      const dx = gaussian(rand) * scatter
      const dz = gaussian(rand) * scatter
      // The disc flares outward and is thin: ~1 kly against a 100 kly width.
      const dy = gaussian(rand) * (0.30 + t * 0.55)

      const x = Math.cos(theta) * r + dx
      const z = Math.sin(theta) * r + dz

      // Young blue stars concentrate in the arms, older yellow ones between.
      const inArm = Math.exp(-(dx * dx + dz * dz) / (2 * scatter * scatter))
      const c = new THREE.Color().copy(YOUNG).lerp(MID, 1 - inArm * 0.85)
      c.lerp(OLD, Math.max(0, 1 - r / (DISC_RADIUS * 0.55)) * 0.6)
      // Dust lanes: a thin dark band on the inner edge of each arm.
      const dust = Math.exp(-Math.pow((dx + dz) * 0.5 + scatter * 0.45, 2) / (0.4 * scatter * scatter))
      c.multiplyScalar(0.45 + 0.75 * (1 - dust * 0.7) * (0.6 + rand() * 0.7))

      push(x, dy, z, c, 0.5 + Math.pow(rand(), 3) * 2.4)
    }
  }

  // --- Central bar -------------------------------------------------------
  for (let i = 0; i < 16_000; i++) {
    const u = rand() * 2 - 1
    const along = u * BAR_LENGTH * 0.5
    const across = gaussian(rand) * 2.6 * (1 - Math.abs(u) * 0.55)
    const h = gaussian(rand) * 1.5 * (1 - Math.abs(u) * 0.5)
    // The bar sits at about 27° to the Sun–centre line.
    const a = 0.47
    const x = along * Math.cos(a) - across * Math.sin(a)
    const z = along * Math.sin(a) + across * Math.cos(a)
    const c = new THREE.Color().copy(OLD).lerp(CORE, Math.pow(1 - Math.abs(u), 2))
    c.multiplyScalar(0.6 + rand() * 0.7)
    push(x, h, z, c, 0.5 + Math.pow(rand(), 3) * 2.0)
  }

  // --- Bulge -------------------------------------------------------------
  for (let i = 0; i < 24_000; i++) {
    // Steeply concentrated toward the centre.
    const r = Math.pow(rand(), 2.3) * BULGE_RADIUS
    const u = rand() * 2 - 1
    const phi = rand() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    const c = new THREE.Color().copy(CORE).lerp(OLD, rand() * 0.8)
    c.multiplyScalar(0.55 + rand() * 0.8)
    push(s * Math.cos(phi) * r, u * r * 0.62, s * Math.sin(phi) * r, c, 0.5 + Math.pow(rand(), 3) * 2.2)
  }

  // --- Halo and globular clusters ---------------------------------------
  for (let i = 0; i < 6_000; i++) {
    const r = BULGE_RADIUS + Math.pow(rand(), 1.6) * DISC_RADIUS * 1.5
    const u = rand() * 2 - 1
    const phi = rand() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    const c = new THREE.Color().copy(OLD).multiplyScalar(0.25 + rand() * 0.35)
    push(s * Math.cos(phi) * r, u * r, s * Math.sin(phi) * r, c, 0.4 + rand() * 0.9)
  }

  return {
    position: new Float32Array(pos),
    colour: new Float32Array(col),
    size: new Float32Array(siz),
    count: siz.length,
  }
}
