import { describe, expect, it } from 'vitest'
import { orbitPath, positionAt, radiusAt, simpleElements, type Elements } from './kepler'
import { J2000 } from './constants'
import { DWARFS, PLANETS } from '../data/bodies'

const DAY_MS = 86_400_000
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`)

/** Every catalogued body that carries a real J2000 element set. */
const withElements: { id: string; el: Elements }[] = [...PLANETS, ...DWARFS]
  .filter((b) => b.orbit)
  .map((b) => ({ id: b.id, el: b.orbit! }))

const earth = withElements.find((b) => b.id === 'earth')!.el

/**
 * Exact apsis epochs from the elements alone: perihelion is M = 0, aphelion
 * M = π, and M advances linearly from M₀ = L − ϖ at J2000.
 */
const apsisDate = (el: Elements, meanAnomaly: number): Date => {
  const m0 = ((el.meanLon - el.periLon) * Math.PI) / 180
  const turns = (meanAnomaly - m0) / (2 * Math.PI)
  return new Date(J2000 + turns * el.period * DAY_MS)
}

/** Day-by-day scan of a calendar year, as a sanity check on the closed form. */
function scanYear(el: Elements, year: number) {
  let peri = { r: Infinity, date: new Date(0) }
  let aphe = { r: -Infinity, date: new Date(0) }
  const start = Date.UTC(year, 0, 1)
  for (let k = 0; k < 365; k++) {
    const date = new Date(start + k * DAY_MS)
    const r = radiusAt(el, date)
    if (r < peri.r) peri = { r, date }
    if (r > aphe.r) aphe = { r, date }
  }
  return { peri, aphe }
}

describe('positionAt', () => {
  it("matches Earth's heliocentric distance on 2026-10-15", () => {
    expect(radiusAt(earth, utc('2026-10-15'))).toBeCloseTo(0.99731, 4)
  })

  it("finds Earth's 2026 perihelion in early January and aphelion in early July", () => {
    const { peri, aphe } = scanYear(earth, 2026)

    expect(peri.r).toBeCloseTo(0.98329, 4)
    expect(peri.date.getUTCMonth()).toBe(0)
    expect(peri.date.getUTCDate()).toBeLessThanOrEqual(7)

    expect(aphe.r).toBeCloseTo(1.01671, 4)
    expect(aphe.date.getUTCMonth()).toBe(6)
    expect(aphe.date.getUTCDate()).toBeLessThanOrEqual(7)
  })

  it.each(withElements)('closes its orbit after exactly one period ($id)', ({ el }) => {
    const t = utc('2026-03-04')
    const before = positionAt(el, t)
    const after = positionAt(el, new Date(t.getTime() + el.period * DAY_MS))
    expect(before.distanceTo(after)).toBeLessThan(1e-9)
  })

  it.each(withElements)('reaches a(1∓e) at its apsides ($id)', ({ el }) => {
    expect(radiusAt(el, apsisDate(el, 0))).toBeCloseTo(el.a * (1 - el.e), 9)
    expect(radiusAt(el, apsisDate(el, Math.PI))).toBeCloseTo(el.a * (1 + el.e), 9)
  })

  it('stays in the ecliptic plane for a zero-inclination orbit', () => {
    const flat = simpleElements(1, 365.25, 0, 0)
    for (let k = 0; k < 8; k++) {
      const p = positionAt(flat, new Date(J2000 + k * 45 * DAY_MS))
      expect(Math.abs(p.y)).toBeLessThan(1e-12)
      expect(p.length()).toBeCloseTo(1, 12)
    }
  })
})

/**
 * The element-convention regression. `periLon` is the longitude of perihelion
 * ϖ = Ω + ω and `meanLon` the mean longitude L, not the argument of periapsis
 * and the mean anomaly. Reading them as the latter leaves the perihelion
 * *distance* untouched — so no radius check catches it — while sliding the
 * body months along its orbit. Earth's perihelion moves from 4 January to
 * 21 September. Pinning the month is what makes that visible.
 */
describe('element convention', () => {
  /** Earth's elements as they would behave if ϖ and L were read as ω and M₀. */
  const misread: Elements = {
    ...earth,
    periLon: earth.node + earth.periLon,
    meanLon: earth.node + earth.periLon + earth.meanLon,
  }

  it('puts Earth at perihelion in January, not September', () => {
    const { peri } = scanYear(earth, 2026)
    expect(peri.date.getUTCMonth()).toBe(0)
  })

  it('is not detectable from the perihelion distance alone', () => {
    // Both conventions bottom out at the same 0.98329 AU — they differ only
    // in where the day grid falls relative to the true perihelion. This is
    // why the convention needs a test of its own rather than riding along
    // with the distance assertions.
    expect(scanYear(misread, 2026).peri.r).toBeCloseTo(scanYear(earth, 2026).peri.r, 5)
  })

  it('would move the perihelion to September if the two were swapped', () => {
    expect(scanYear(misread, 2026).peri.date.getUTCMonth()).toBe(8)
  })
})

/**
 * Published perihelion and aphelion distances from the NASA planetary fact
 * sheets, in AU. The fact-sheet extremes are osculating values for a given
 * epoch rather than a(1∓e) of the mean J2000 elements, and for the outer
 * planets the two genuinely differ by a few parts per thousand — hence the
 * 1% tolerance. It is still tight enough to catch a mistranscribed a or e.
 */
const FACT_SHEET: Record<string, [peri: number, aphe: number]> = {
  mercury: [0.30750, 0.46670],
  venus: [0.71843, 0.72823],
  earth: [0.98327, 1.01673],
  mars: [1.38137, 1.66621],
  jupiter: [4.95056, 5.45706],
  saturn: [9.07469, 10.07050],
  uranus: [18.26690, 20.06310],
  neptune: [29.88720, 30.47400],
  pluto: [29.65840, 49.30500],
}

describe('catalogued elements', () => {
  it.each(Object.entries(FACT_SHEET))(
    'reproduces the published apsis distances for %s',
    (id, [peri, aphe]) => {
      const el = withElements.find((b) => b.id === id)!.el
      expect(el.a * (1 - el.e)).toBeGreaterThan(peri * 0.99)
      expect(el.a * (1 - el.e)).toBeLessThan(peri * 1.01)
      expect(el.a * (1 + el.e)).toBeGreaterThan(aphe * 0.99)
      expect(el.a * (1 + el.e)).toBeLessThan(aphe * 1.01)
    },
  )

  it('covers every body that has elements', () => {
    // Guards against a planet quietly losing its orbit in the dataset.
    expect(withElements.map((b) => b.id)).toEqual(
      expect.arrayContaining(Object.keys(FACT_SHEET)),
    )
    expect(withElements).toHaveLength(13)
  })
})

describe('orbitPath', () => {
  it('returns segments + 1 points that start and end at the same place', () => {
    const pts = orbitPath(earth, 64)
    expect(pts).toHaveLength(65)
    expect(pts[0].distanceTo(pts[64])).toBeLessThan(1e-9)
  })

  it('spans the full radial range of the orbit', () => {
    const r = orbitPath(withElements.find((b) => b.id === 'pluto')!.el, 2_000).map((p) => p.length())
    expect(Math.min(...r)).toBeCloseTo(39.48211675 * (1 - 0.2488273), 2)
    expect(Math.max(...r)).toBeCloseTo(39.48211675 * (1 + 0.2488273), 2)
  })
})

describe('simpleElements', () => {
  it('builds a circular orbit at the requested radius and period', () => {
    const el = simpleElements(0.00257, 27.32, 5.145, 90)
    expect(el.e).toBe(0)
    expect(el.a).toBe(0.00257)
    expect(el.period).toBe(27.32)
    expect(radiusAt(el, utc('2026-10-15'))).toBeCloseTo(0.00257, 12)
  })

  it('falls back to a one-year period rather than dividing by zero', () => {
    expect(simpleElements(1, 0).period).toBe(365.25)
    expect(Number.isFinite(radiusAt(simpleElements(1, 0), utc('2026-10-15')))).toBe(true)
  })
})
