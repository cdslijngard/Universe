/** Physical constants in SI. Everything in the app reduces to metres. */

export const M = 1
export const KM = 1_000
/** IAU 2012 definition, exact. */
export const AU = 1.495_978_707e11
/** Julian light-year, exact by definition. */
export const LY = 9.460_730_472_580_8e15
export const PC = 3.085_677_581_491_367e16
export const KLY = 1e3 * LY
export const MLY = 1e6 * LY
export const GLY = 1e9 * LY

export const EARTH_RADIUS = 6_371 * KM
export const EARTH_MASS = 5.972_2e24
export const JUPITER_MASS = 1.898_2e27
export const SUN_MASS = 1.988_41e30
export const SUN_RADIUS = 696_340 * KM

/** Days in a Julian year. */
export const YEAR_DAYS = 365.25
export const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0)
