import { describe, expect, it } from 'vitest'
import { ALL_BODIES, DWARFS, MOONS, PLANETS, SUN, getBody, moonsOf } from './bodies'
import { STARS, getStar } from './stars'
import { LOCAL_GROUP } from './localGroup'
import { WEB_NODES } from './cosmicWeb'
import { BELTS, OUTER_MARKERS, PROBES, SHELLS } from './outerSystem'
import { LANDMARKS } from './galaxy'
import { LEVEL_IDS } from './scales'

/** Every id-bearing collection in the atlas, named for readable failures. */
const COLLECTIONS: [name: string, items: readonly { id: string }[]][] = [
  ['bodies', ALL_BODIES],
  ['stars', STARS],
  ['localGroup', LOCAL_GROUP],
  ['cosmicWeb', WEB_NODES],
  ['belts', BELTS],
  ['shells', SHELLS],
  ['probes', PROBES],
  ['outerMarkers', OUTER_MARKERS],
  ['landmarks', LANDMARKS],
]

const duplicates = (ids: string[]): string[] =>
  ids.filter((id, k) => ids.indexOf(id) !== k)

describe('identifiers', () => {
  it.each(COLLECTIONS)('are unique within %s', (_name, items) => {
    expect(duplicates(items.map((o) => o.id))).toEqual([])
  })

  it('are unique across the whole catalogue', () => {
    // Selections are keyed by id across levels, so one id can only ever mean
    // one object — 'sun' the body and 'sol' the star are deliberately split.
    const all = COLLECTIONS.flatMap(([name, items]) =>
      items.map((o) => ({ id: o.id, name })),
    )
    const clashes = all
      .filter((o, k) => all.findIndex((x) => x.id === o.id) !== k)
      .map((o) => o.id)
    expect(clashes).toEqual([])
  })

  it('are non-empty, lowercase, hyphenated slugs', () => {
    for (const [, items] of COLLECTIONS) {
      for (const o of items) expect(o.id).toMatch(/^[a-z0-9][a-z0-9-]*$/)
    }
  })
})

describe('bodies', () => {
  it('resolves every parent reference to a real body', () => {
    const ids = new Set(ALL_BODIES.map((b) => b.id))
    const dangling = ALL_BODIES.filter((b) => b.parent && !ids.has(b.parent))
    expect(dangling.map((b) => `${b.id} → ${b.parent}`)).toEqual([])
  })

  it('gives everything but the Sun a parent, and never itself', () => {
    for (const b of ALL_BODIES) {
      expect(b.parent).not.toBe(b.id)
      if (b.id !== 'sun') expect(b.parent).toBeTruthy()
    }
    expect(SUN.parent).toBeUndefined()
  })

  it('walks every parent chain back to the Sun without looping', () => {
    for (const body of ALL_BODIES) {
      const seen = new Set<string>([body.id])
      let cursor = body
      while (cursor.parent) {
        expect(seen.has(cursor.parent)).toBe(false)
        seen.add(cursor.parent)
        cursor = getBody(cursor.parent)!
      }
      expect(cursor.id).toBe('sun')
    }
  })

  it('gives every palette at least four entries', () => {
    // The surface shaders index palette[0..3] unconditionally; a short
    // palette renders as undefined colour rather than failing loudly.
    for (const b of ALL_BODIES) {
      expect(b.appearance.palette.length).toBeGreaterThanOrEqual(4)
      for (const hex of b.appearance.palette) expect(hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('keeps every orbit elliptical', () => {
    for (const b of ALL_BODIES) {
      if (!b.orbit) continue
      expect(b.orbit.e, `${b.id}`).toBeGreaterThanOrEqual(0)
      expect(b.orbit.e, `${b.id}`).toBeLessThan(1)
      expect(b.orbit.a, `${b.id}`).toBeGreaterThan(0)
      // A negative period is meaningful: it runs the mean anomaly backwards,
      // which is how Triton's retrograde orbit is stored. Zero is not.
      expect(b.orbit.period, `${b.id}`).not.toBe(0)
    }
  })

  it('reserves retrograde orbits for moons, and Triton is one', () => {
    const retrograde = ALL_BODIES.filter((b) => b.orbit && b.orbit.period < 0)
    expect(retrograde.map((b) => b.id)).toContain('triton')
    for (const b of retrograde) expect(b.kind).toBe('moon')
  })

  it('orbits everything except the Sun', () => {
    for (const b of ALL_BODIES) {
      if (b.id === 'sun') expect(b.orbit).toBeUndefined()
      else expect(b.orbit, `${b.id} has no orbit`).toBeDefined()
    }
  })

  it('has a positive radius and plausible physical figures', () => {
    for (const b of ALL_BODIES) {
      expect(b.radius).toBeGreaterThan(0)
      if (b.mass !== undefined) expect(b.mass).toBeGreaterThan(0)
      if (b.gravity !== undefined) expect(b.gravity).toBeGreaterThan(0)
      if (b.temp !== undefined) expect(b.temp).toBeGreaterThan(0)
      if (b.appearance.flattening !== undefined) {
        expect(b.appearance.flattening).toBeGreaterThanOrEqual(0)
        expect(b.appearance.flattening).toBeLessThan(0.5)
      }
      if (b.appearance.day !== undefined) expect(b.appearance.day).not.toBe(0)
    }
  })

  it('names a real level in every `deepest` hint', () => {
    for (const b of ALL_BODIES) {
      if (b.deepest) expect(LEVEL_IDS).toContain(b.deepest)
    }
  })

  it('carries the eight planets in order of distance', () => {
    expect(PLANETS.map((p) => p.id)).toEqual([
      'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune',
    ])
    for (let k = 1; k < PLANETS.length; k++) {
      expect(PLANETS[k].orbit!.a).toBeGreaterThan(PLANETS[k - 1].orbit!.a)
    }
  })

  it('attaches every moon to a planet or dwarf, never to the Sun', () => {
    const hosts = new Set([...PLANETS, ...DWARFS].map((b) => b.id))
    for (const m of MOONS) {
      expect(m.kind).toBe('moon')
      expect(hosts.has(m.parent!), `${m.id} orbits ${m.parent}`).toBe(true)
    }
  })

  it('agrees with its lookup helpers', () => {
    expect(ALL_BODIES).toHaveLength(1 + PLANETS.length + MOONS.length + DWARFS.length)
    for (const b of ALL_BODIES) expect(getBody(b.id)).toBe(b)
    expect(getBody('nope')).toBeUndefined()
    expect(moonsOf('jupiter').map((m) => m.id)).toEqual(['io', 'europa', 'ganymede', 'callisto'])
    expect(moonsOf('venus')).toEqual([])
  })
})

describe('stars', () => {
  it('keeps right ascension, declination and distance in range', () => {
    for (const s of STARS) {
      expect(s.ra).toBeGreaterThanOrEqual(0)
      expect(s.ra).toBeLessThan(24)
      expect(s.dec).toBeGreaterThanOrEqual(-90)
      expect(s.dec).toBeLessThanOrEqual(90)
      expect(s.dist).toBeGreaterThanOrEqual(0)
      expect(s.spectral).not.toBe('')
    }
  })

  it('puts at least two members in every multiple system', () => {
    const systems = new Map<string, number>()
    for (const s of STARS) {
      if (s.system) systems.set(s.system, (systems.get(s.system) ?? 0) + 1)
    }
    expect(systems.size).toBeGreaterThan(0)
    for (const [id, n] of systems) expect(n, `system ${id}`).toBeGreaterThan(1)
  })

  it('agrees with its lookup helper', () => {
    for (const s of STARS) expect(getStar(s.id)).toBe(s)
    expect(getStar('nope')).toBeUndefined()
  })
})

describe('deep sky', () => {
  it('gives every Local Group member and web node a size and a blurb', () => {
    for (const o of [...LOCAL_GROUP, ...WEB_NODES]) {
      expect(o.diameter).toBeGreaterThan(0)
      expect(o.dist).toBeGreaterThanOrEqual(0)
      expect(o.blurb.length).toBeGreaterThan(20)
      expect(o.colour).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('gives the belts a positive width and the shells a positive radius', () => {
    for (const b of BELTS) {
      expect(b.outer, b.id).toBeGreaterThan(b.inner)
      expect(b.inner, b.id).toBeGreaterThan(0)
      expect(b.count, b.id).toBeGreaterThan(0)
    }
    for (const s of SHELLS) {
      expect(s.radius, s.id).toBeGreaterThan(0)
      expect(s.opacity, s.id).toBeGreaterThan(0)
    }
    // Ordered outward, so the Kuiper level stacks them correctly.
    for (let k = 1; k < SHELLS.length; k++) {
      expect(SHELLS[k].radius).toBeGreaterThan(SHELLS[k - 1].radius)
    }
  })
})

describe('prose', () => {
  it('gives every object a name and something to say about it', () => {
    for (const [, items] of COLLECTIONS) {
      for (const o of items as readonly { id: string; name?: string; blurb?: string }[]) {
        expect(o.name, `${o.id} has no name`).toBeTruthy()
        if (o.blurb !== undefined) expect(o.blurb.length).toBeGreaterThan(20)
      }
    }
  })

  it('leaves no fact row empty', () => {
    for (const [, items] of COLLECTIONS) {
      for (const o of items as readonly { id: string; facts?: { label: string; value: string }[] }[]) {
        for (const f of o.facts ?? []) {
          expect(f.label, `${o.id}`).toBeTruthy()
          expect(f.value, `${o.id} / ${f.label}`).toBeTruthy()
        }
      }
    }
  })
})
