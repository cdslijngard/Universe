import { AU, GLY, KM, LY, MLY, EARTH_MASS, JUPITER_MASS, SUN_MASS, YEAR_DAYS } from './constants'

const sig = (v: number, digits = 3): string => {
  if (v === 0) return '0'
  const abs = Math.abs(v)
  // Keep integers looking like integers; otherwise use significant digits.
  if (abs >= 100) return Math.round(v).toLocaleString('en-US')
  return parseFloat(v.toPrecision(digits)).toLocaleString('en-US')
}

/**
 * Pick a humane unit for any distance from a metre to the observable horizon.
 * This is what makes a 20-order-of-magnitude app legible.
 */
export function formatDistance(metres: number): string {
  const a = Math.abs(metres)
  if (a < KM) return `${sig(metres)} m`
  if (a < 0.01 * AU) return `${sig(metres / KM)} km`
  if (a < 0.1 * LY) return `${sig(metres / AU)} AU`
  if (a < 1_000 * LY) return `${sig(metres / LY)} ly`
  if (a < MLY) return `${sig(metres / (1_000 * LY))} kly`
  if (a < GLY) return `${sig(metres / MLY)} Mly`
  return `${sig(metres / GLY)} Gly`
}

/** Short form for the scale bar and the level rail — compact but readable. */
export function formatDistanceTerse(metres: number): string {
  const a = Math.abs(metres)
  const n = (v: number): string => {
    const av = Math.abs(v)
    if (av >= 1e6) return `${parseFloat((v / 1e6).toPrecision(3))}M`
    if (av >= 1000) return Math.round(v).toLocaleString('en-US')
    return String(parseFloat(v.toPrecision(2)))
  }
  if (a < KM) return `${n(metres)} m`
  if (a < AU) return `${n(metres / KM)} km`
  if (a < 0.5 * LY) return `${n(metres / AU)} AU`
  if (a < 1_000 * LY) return `${n(metres / LY)} ly`
  if (a < MLY) return `${n(metres / (1_000 * LY))} kly`
  if (a < GLY) return `${n(metres / MLY)} Mly`
  return `${n(metres / GLY)} Gly`
}

export function formatMass(kg: number): string {
  if (kg >= 0.05 * SUN_MASS) return `${sig(kg / SUN_MASS)} M☉`
  if (kg >= 0.05 * JUPITER_MASS) return `${sig(kg / JUPITER_MASS)} M♃`
  if (kg >= 1e-6 * EARTH_MASS) return `${sig(kg / EARTH_MASS)} M⊕`
  return `${kg.toExponential(2)} kg`
}

/** Orbital and rotation periods, given in days, read as hours/days/years. */
export function formatPeriod(days: number): string {
  const a = Math.abs(days)
  const retro = days < 0 ? ' (retrograde)' : ''
  if (a < 1 / 24) return `${sig(a * 1440)} min${retro}`
  if (a < 2) return `${sig(a * 24)} h${retro}`
  if (a < 2 * YEAR_DAYS) return `${sig(a)} days${retro}`
  const yr = a / YEAR_DAYS
  if (yr < 1e4) return `${sig(yr)} years${retro}`
  return `${yr.toExponential(2)} years${retro}`
}

export function formatTemp(kelvin: number): string {
  return `${Math.round(kelvin)} K · ${Math.round(kelvin - 273.15)} °C`
}

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
}

/** Scientific notation with a real × and a real superscript exponent. */
export function formatSci(v: number, digits = 2): string {
  const [m, e] = v.toExponential(digits).split('e')
  const exp = String(Number(e))
    .split('')
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join('')
  return `${m} × 10${exp}`
}
