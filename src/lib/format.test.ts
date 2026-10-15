import { describe, expect, it } from 'vitest'
import {
  formatDistance,
  formatDistanceTerse,
  formatMass,
  formatPeriod,
  formatSci,
  formatTemp,
} from './format'
import { AU, EARTH_MASS, GLY, JUPITER_MASS, KM, LY, MLY, SUN_MASS } from './constants'

/** `1.2e+9`, `3e-4` — the thing a readout must never show the user. */
const SCIENTIFIC = /\d[eE][+-]?\d/

/** One metre to a hundred billion light years, every half decade. */
const fullRange: number[] = []
for (let exp = 0; exp <= 27; exp += 1) {
  fullRange.push(10 ** exp, 3.16 * 10 ** exp)
}

describe('formatDistanceTerse', () => {
  it.each(fullRange)('produces a readable string for %s m', (metres) => {
    const out = formatDistanceTerse(metres)
    expect(out).not.toBe('')
    expect(out).not.toMatch(/NaN|Infinity|undefined/)
    expect(out).not.toMatch(SCIENTIFIC)
    expect(out).toMatch(/^[\d,.\sM-]+(m|km|AU|ly|kly|Mly|Gly)$/)
  })

  it('picks the unit the level rail expects', () => {
    expect(formatDistanceTerse(1.5)).toBe('1.5 m')
    expect(formatDistanceTerse(6_371 * KM)).toBe('6,371 km')
    expect(formatDistanceTerse(5 * AU)).toBe('5 AU')
    expect(formatDistanceTerse(100 * LY)).toBe('100 ly')
    expect(formatDistanceTerse(2_000 * LY)).toBe('2 kly')
    expect(formatDistanceTerse(100 * MLY)).toBe('100 Mly')
    expect(formatDistanceTerse(GLY)).toBe('1 Gly')
  })

  it('handles zero and negative offsets without breaking', () => {
    expect(formatDistanceTerse(0)).toBe('0 m')
    expect(formatDistanceTerse(-5 * AU)).toBe('-5 AU')
  })

  it('switches to an M suffix instead of scientific notation past a million', () => {
    expect(formatDistanceTerse(0.1 * AU)).toBe('15M km')
  })
})

describe('formatDistance', () => {
  it.each(fullRange)('produces a readable string for %s m', (metres) => {
    const out = formatDistance(metres)
    expect(out).not.toBe('')
    expect(out).not.toMatch(/NaN|Infinity|undefined/)
    expect(out).not.toMatch(SCIENTIFIC)
  })

  it('crosses each unit boundary where it should', () => {
    expect(formatDistance(999)).toBe('999 m')
    expect(formatDistance(KM)).toBe('1 km')
    expect(formatDistance(0.1 * AU)).toBe('0.1 AU')
    expect(formatDistance(LY)).toBe('1 ly')
    expect(formatDistance(100 * MLY)).toBe('100 Mly')
    expect(formatDistance(46.5 * GLY)).toBe('46.5 Gly')
  })
})

describe('formatPeriod', () => {
  it('reads short periods as minutes and hours', () => {
    expect(formatPeriod(0.001)).toBe('1.44 min')
    expect(formatPeriod(1)).toBe('24 h')
    expect(formatPeriod(1.5)).toBe('36 h')
  })

  it('reads long periods as days and years', () => {
    expect(formatPeriod(365.25)).toBe('365 days')
    expect(formatPeriod(90_560)).toBe('248 years')
  })

  it("marks a negative period retrograde and reports its magnitude", () => {
    // Venus turns backwards once every 243 days; the sign carries that fact.
    expect(formatPeriod(-243.025)).toBe('243 days (retrograde)')
    expect(formatPeriod(-0.5)).toBe('12 h (retrograde)')
    expect(formatPeriod(-1_000)).toBe('2.74 years (retrograde)')
  })

  it('never leaks a minus sign into the number itself', () => {
    for (const days of [-0.001, -0.04, -1, -400, -1e6]) {
      const out = formatPeriod(days)
      expect(out).toMatch(/\(retrograde\)$/)
      expect(out.replace(' (retrograde)', '')).not.toMatch(/^-/)
    }
  })
})

describe('formatSci', () => {
  it('uses a real × and real Unicode superscripts', () => {
    expect(formatSci(3.828e26)).toBe('3.83 × 10²⁶')
    expect(formatSci(1.2e15)).toBe('1.20 × 10¹⁵')
  })

  it('renders a negative exponent with a superscript minus', () => {
    expect(formatSci(6.6e-11)).toBe('6.60 × 10⁻¹¹')
  })

  it('never falls back to an ASCII e notation', () => {
    for (const v of [1e-30, 1e-3, 1, 7, 1e5, 1e22, 9.9e99]) {
      expect(formatSci(v)).not.toMatch(/[eE][+-]/)
      expect(formatSci(v)).toContain(' × 10')
    }
  })

  it('honours the requested digit count', () => {
    expect(formatSci(1.23456e8, 4)).toBe('1.2346 × 10⁸')
    expect(formatSci(1.23456e8, 0)).toBe('1 × 10⁸')
  })
})

describe('formatMass', () => {
  it('chooses the unit the object is usually quoted in', () => {
    expect(formatMass(SUN_MASS)).toBe('1 M☉')
    expect(formatMass(JUPITER_MASS)).toBe('1 M♃')
    expect(formatMass(EARTH_MASS)).toBe('1 M⊕')
  })
})

describe('formatTemp', () => {
  it('gives kelvin and celsius together', () => {
    expect(formatTemp(288)).toBe('288 K · 15 °C')
    expect(formatTemp(5_772)).toBe('5772 K · 5499 °C')
  })
})
