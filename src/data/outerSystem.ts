import { AU, LY } from '../lib/constants'
import type { Fact } from './types'

/** A ring-shaped population drawn as instanced particles. */
export interface BeltDef {
  id: string
  name: string
  /** Inner and outer edge in AU. */
  inner: number
  outer: number
  /** Vertical thickness as a fraction of the mean radius. */
  thickness: number
  count: number
  colour: string
  /** Mean inclination spread, degrees. */
  spread: number
  blurb: string
  facts?: Fact[]
}

export const BELTS: BeltDef[] = [
  {
    id: 'asteroid-belt', name: 'Asteroid belt', inner: 2.2, outer: 3.3,
    thickness: 0.06, count: 2_600, colour: '#b8a894', spread: 10,
    blurb:
      'Between Mars and Jupiter, a few million bodies larger than a kilometre — and all of them together would make a moon smaller than ours. Jupiter\'s gravity never let a planet finish forming here.',
    facts: [
      { label: 'Total mass', value: '~4% of the Moon' },
      { label: 'Largest member', value: 'Ceres, 940 km across' },
      { label: 'Typical gap', value: 'Millions of km between bodies' },
    ],
  },
  {
    id: 'kuiper-belt', name: 'Kuiper belt', inner: 30, outer: 50,
    thickness: 0.18, count: 5_200, colour: '#9fc2d8', spread: 17,
    blurb:
      'A doughnut of ice and rock beyond Neptune, twenty times as wide as the asteroid belt and perhaps two hundred times as massive. It holds Pluto, Eris, Makemake and Haumea, over 3,000 catalogued objects, and an estimated 100,000 bodies wider than 100 km.',
    facts: [
      { label: 'Extent', value: '30–50 AU from the Sun' },
      { label: 'Known objects', value: '3,000+ catalogued' },
      { label: 'Estimated population', value: '100,000 bodies over 100 km' },
      { label: 'Named for', value: 'Gerard Kuiper, who predicted it in 1951' },
    ],
  },
  {
    id: 'scattered-disc', name: 'Scattered disc', inner: 48, outer: 140,
    thickness: 0.5, count: 2_200, colour: '#7c93b8', spread: 32,
    blurb:
      'Objects flung onto steep, stretched orbits by Neptune — the same population, scattered. Eris belongs to it, and it is where most short-period comets come from.',
    facts: [
      { label: 'Inclinations', value: 'Up to 40° from the ecliptic' },
      { label: 'Source of', value: 'Most short-period comets' },
    ],
  },
]

/** Spherical shells and surfaces — the heliosphere and the Oort cloud. */
export interface ShellDef {
  id: string
  name: string
  /** Radius in AU. */
  radius: number
  colour: string
  opacity: number
  blurb: string
  facts?: Fact[]
}

export const SHELLS: ShellDef[] = [
  {
    id: 'termination-shock', name: 'Termination shock', radius: 90,
    colour: '#ffb870', opacity: 0.1,
    blurb:
      'Where the solar wind, blowing outward at up to 700 km/s, abruptly slows below the speed of sound in the surrounding plasma. Voyager 1 crossed it at 94 AU in 2004; Voyager 2 at 84 AU in 2007 — the difference tells us the boundary is lopsided and breathes in and out.',
    facts: [
      { label: 'Voyager 1 crossing', value: '94 AU, December 2004' },
      { label: 'Voyager 2 crossing', value: '84 AU, August 2007' },
      { label: 'Solar wind speed', value: '400–700 km/s before the shock' },
    ],
  },
  {
    id: 'heliopause', name: 'Heliopause', radius: 123,
    colour: '#7fd0ff', opacity: 0.13,
    blurb:
      'The edge of the Sun\'s influence: the surface where the outward pressure of the solar wind finally balances the interstellar medium. Crossing it is the closest thing to leaving the solar system. Only two spacecraft have done it.',
    facts: [
      { label: 'Voyager 1 crossing', value: '121.6 AU, 25 August 2012' },
      { label: 'Voyager 2 crossing', value: '119 AU, 5 November 2018' },
      { label: 'Beyond it', value: 'Interstellar plasma, denser and colder' },
    ],
  },
  {
    id: 'oort-inner', name: 'Oort cloud (inner)', radius: 2_000,
    colour: '#aeb8e0', opacity: 0.05,
    blurb:
      'The inner, doughnut-shaped Hills cloud, beginning around 2,000 AU — fifty times beyond the Kuiper belt, and the suspected reservoir behind long-period comets.',
    facts: [{ label: 'Inner edge', value: '~2,000 AU' }],
  },
  {
    id: 'oort-outer', name: 'Oort cloud (outer)', radius: 100_000,
    colour: '#c8ccec', opacity: 0.035,
    blurb:
      'A spherical shell of perhaps a trillion icy bodies reaching out to 100,000 AU — 1.6 light years, a quarter of the way to Proxima Centauri. It has never been directly observed; we infer it entirely from the comets that fall out of it. This is the true outer boundary of the Sun\'s domain.',
    facts: [
      { label: 'Outer edge', value: '~100,000 AU = 1.6 light years' },
      { label: 'Estimated population', value: '~10¹² icy bodies' },
      { label: 'Status', value: 'Inferred, never directly imaged' },
      { label: 'Round trip for light', value: 'Over 3 years' },
    ],
  },
]

/**
 * Interstellar spacecraft. Distance is computed from a measured reference
 * epoch plus a constant heliocentric speed — they are no longer accelerating,
 * so this stays accurate to well under a percent.
 */
export interface ProbeDef {
  id: string
  name: string
  launched: string
  /** Reference epoch for the distance below. */
  epoch: string
  /** Heliocentric distance at the epoch, AU. */
  distAU: number
  /** Heliocentric speed, km/s. */
  speedKms: number
  /** Direction of travel: RA hours, Dec degrees. */
  ra: number
  dec: number
  colour: string
  blurb: string
  facts?: Fact[]
}

export const PROBES: ProbeDef[] = [
  {
    id: 'voyager1', name: 'Voyager 1', launched: '1977-09-05', epoch: '2025-01-01',
    distAU: 165.9, speedKms: 16.99, ra: 17.2, dec: 12.2, colour: '#ffd166',
    blurb:
      'The most distant human-made object, in interstellar space since 2012 and still returning data on a few watts of plutonium heat. Its radio signal takes over a day to reach us each way.',
    facts: [
      { label: 'Launched', value: '5 September 1977' },
      { label: 'Left the heliosphere', value: '25 August 2012' },
      { label: 'Speed', value: '17.0 km/s — 3.6 AU per year' },
      { label: 'Power source', value: 'Plutonium-238, fading ~4 W/year' },
    ],
  },
  {
    id: 'voyager2', name: 'Voyager 2', launched: '1977-08-20', epoch: '2025-01-01',
    distAU: 138.3, speedKms: 15.37, ra: 19.9, dec: -58.9, colour: '#ffb3c6',
    blurb:
      'The only spacecraft to visit all four giant planets, and the second to reach interstellar space. It left on a southward path, which is why its heliopause crossing came at a different distance from its twin\'s.',
    facts: [
      { label: 'Launched', value: '20 August 1977' },
      { label: 'Visited', value: 'Jupiter, Saturn, Uranus, Neptune' },
      { label: 'Left the heliosphere', value: '5 November 2018' },
      { label: 'Speed', value: '15.4 km/s' },
    ],
  },
  {
    id: 'new-horizons', name: 'New Horizons', launched: '2006-01-19', epoch: '2025-01-01',
    distAU: 60.1, speedKms: 13.78, ra: 19.3, dec: -20.5, colour: '#9fe6a0',
    blurb:
      'Flew past Pluto in 2015 and then past Arrokoth, the most distant object ever visited up close. It is still crossing the Kuiper belt and has fuel for another target if one is found.',
    facts: [
      { label: 'Pluto flyby', value: '14 July 2015' },
      { label: 'Arrokoth flyby', value: '1 January 2019, at 43 AU' },
      { label: 'Speed', value: '13.8 km/s' },
    ],
  },
]

/** Live heliocentric distance in AU for a probe, from its reference epoch. */
export function probeDistanceAU(p: ProbeDef, now: Date = new Date()): number {
  const years = (now.getTime() - new Date(p.epoch).getTime()) / (365.25 * 86_400_000)
  const auPerYear = (p.speedKms * 365.25 * 86_400) / (AU / 1_000)
  return p.distAU + auPerYear * years
}

/** Notable distant objects shown as single markers at this level. */
export const OUTER_MARKERS = [
  {
    id: 'sedna', name: 'Sedna', distAU: 506, radiusKm: 498,
    blurb:
      'On an orbit so stretched it takes 11,400 years to complete, reaching 937 AU at its farthest. Nothing in the known solar system can explain how it got there, which is part of why some astronomers suspect an undiscovered perturber.',
    facts: [
      { label: 'Aphelion', value: '937 AU' },
      { label: 'Orbital period', value: '11,400 years' },
      { label: 'Discovered', value: '2003' },
    ],
  },
  {
    id: 'arrokoth', name: 'Arrokoth', distAU: 44.6, radiusKm: 18,
    blurb:
      'A contact binary shaped like two pancakes stuck together, and the most distant object ever visited by a spacecraft. It is a pristine planetesimal — a leftover building block that never got incorporated into anything larger.',
    facts: [
      { label: 'Visited', value: '1 January 2019, New Horizons' },
      { label: 'Shape', value: 'Two flattened lobes, gently joined' },
      { label: 'Age', value: 'Unchanged for 4.5 billion years' },
    ],
  },
]

export const PROXIMA_DIST_AU = (4.2465 * LY) / AU
