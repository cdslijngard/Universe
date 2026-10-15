import { describe, expect, it } from 'vitest'
import { galacticToVec3, raDecToVec3, spectralColour, spectralTemp, starMarkerSize } from './astro'

describe('raDecToVec3', () => {
  it('returns a vector of the requested length', () => {
    for (const [ra, dec, dist] of [
      [0, 0, 1],
      [6.5, 34, 4.2465],
      [18.25, -62.68, 642],
      [23.99, 89.9, 0.001],
    ]) {
      expect(raDecToVec3(ra, dec, dist).length()).toBeCloseTo(dist, 10)
    }
  })

  it('puts the vernal equinox on +x', () => {
    const v = raDecToVec3(0, 0, 1)
    expect(v.x).toBeCloseTo(1, 12)
    expect(v.y).toBeCloseTo(0, 12)
    expect(v.z).toBeCloseTo(0, 12)
  })

  it('puts the celestial north pole on +y', () => {
    const v = raDecToVec3(0, 90, 1)
    expect(v.y).toBeCloseTo(1, 12)
    expect(Math.hypot(v.x, v.z)).toBeCloseTo(0, 12)
  })

  it('puts the south pole on -y and RA 12h on -x', () => {
    expect(raDecToVec3(0, -90, 1).y).toBeCloseTo(-1, 12)
    expect(raDecToVec3(12, 0, 1).x).toBeCloseTo(-1, 12)
  })

  it('advances RA towards -z, so the sky turns the right way', () => {
    expect(raDecToVec3(6, 0, 1).z).toBeCloseTo(-1, 12)
  })

  it('collapses to the origin at zero distance', () => {
    expect(raDecToVec3(9.1, 42, 0).length()).toBe(0)
  })
})

describe('galacticToVec3', () => {
  it('shares the frame convention with raDecToVec3', () => {
    expect(galacticToVec3(0, 0, 3).x).toBeCloseTo(3, 12)
    expect(galacticToVec3(0, 90, 3).y).toBeCloseTo(3, 12)
    expect(galacticToVec3(90, 0, 3).z).toBeCloseTo(-3, 12)
    expect(galacticToVec3(123, -45, 7).length()).toBeCloseTo(7, 10)
  })
})

describe('spectralColour', () => {
  it('reads the class off the front of a full MK type', () => {
    expect(spectralColour('G2V').getHexString()).toBe(spectralColour('G').getHexString())
    expect(spectralColour('M5.5Ve').getHexString()).toBe(spectralColour('M').getHexString())
  })

  it('is case- and whitespace-insensitive', () => {
    expect(spectralColour(' k3iii ').getHexString()).toBe(spectralColour('K').getHexString())
  })

  it('runs blue through red across the main sequence', () => {
    const o = spectralColour('O')
    const m = spectralColour('M')
    expect(o.b).toBeGreaterThan(o.r)
    expect(m.r).toBeGreaterThan(m.b)
  })

  it('falls back to white for an unknown class', () => {
    for (const unknown of ['', '  ', '?', 'Q7', 'sdB', '42']) {
      expect(spectralColour(unknown).getHexString()).toBe('ffffff')
    }
  })
})

describe('spectralTemp', () => {
  it('falls monotonically from O to M', () => {
    const seq = ['O', 'B', 'A', 'F', 'G', 'K', 'M'].map(spectralTemp)
    for (let k = 1; k < seq.length; k++) expect(seq[k]).toBeLessThan(seq[k - 1])
  })

  it('falls back to a solar temperature for an unknown class', () => {
    expect(spectralTemp('Q')).toBe(5_600)
    expect(spectralTemp('')).toBe(5_600)
  })
})

describe('starMarkerSize', () => {
  it('stays inside its clamp at both extremes', () => {
    for (const absMag of [-30, -5, 0, 4.83, 15.6, 20, 100]) {
      const s = starMarkerSize(absMag)
      expect(s).toBeGreaterThanOrEqual(0.55)
      expect(s).toBeLessThanOrEqual(2.0)
    }
  })

  it('makes brighter stars bigger', () => {
    expect(starMarkerSize(-1)).toBeGreaterThan(starMarkerSize(4.83))
    expect(starMarkerSize(4.83)).toBeGreaterThan(starMarkerSize(15.6))
  })
})
