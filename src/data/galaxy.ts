import { LY } from '../lib/constants'
import type { Fact } from './types'

/** Scene unit at the galaxy level is 1,000 ly, so these are kly. */
export const SUN_GALACTIC_RADIUS = 26.0
export const DISC_RADIUS = 50.0
export const BULGE_RADIUS = 10.0
export const BAR_LENGTH = 27.0

/** A logarithmic spiral arm. Angles in radians. */
export interface ArmDef {
  id: string
  name: string
  /** Where the arm starts, radians. */
  startAngle: number
  /** How far it wraps, radians. */
  sweep: number
  /** Starting and ending radius, kly. The winding rate follows from these. */
  rStart: number
  rEnd: number
  width: number
  count: number
  colour: string
  blurb: string
}

export const ARMS: ArmDef[] = [
  {
    id: 'scutum-centaurus', name: 'Scutum–Centaurus Arm',
    startAngle: 0.0, sweep: 3.5, rStart: 9, rEnd: 48,
    width: 2.2, count: 26_000, colour: '#8fb6ff',
    blurb: 'One of the Milky Way\'s two dominant arms, rich in star formation and anchored to the end of the central bar.',
  },
  {
    id: 'perseus', name: 'Perseus Arm',
    startAngle: Math.PI, sweep: 3.5, rStart: 9, rEnd: 48,
    width: 2.2, count: 26_000, colour: '#a8c4ff',
    blurb: 'The major arm just outside our own position, about 6,400 light years beyond the Sun.',
  },
  {
    id: 'sagittarius', name: 'Sagittarius Arm',
    startAngle: Math.PI * 0.55, sweep: 2.9, rStart: 11, rEnd: 40,
    width: 1.3, count: 12_000, colour: '#9ddcff',
    blurb: 'A minor arm lying inward of us, between the Sun and the galactic centre. Its brightest nebulae dominate the summer sky.',
  },
  {
    id: 'norma', name: 'Norma Arm',
    startAngle: Math.PI * 1.55, sweep: 2.9, rStart: 11, rEnd: 40,
    width: 1.3, count: 12_000, colour: '#b5e2ff',
    blurb: 'A minor inner arm on the far side of the galactic centre, hidden from us behind the bulge.',
  },
  {
    id: 'orion', name: 'Orion Arm (Local Arm)',
    startAngle: Math.PI * 1.08, sweep: 1.1, rStart: 20, rEnd: 33,
    width: 1.0, count: 7_000, colour: '#ffe7b0',
    blurb: 'Our own arm — a spur rather than a major arm, about 3,500 light years across and 10,000 long. Everything you can see with the naked eye is in it.',
  },
]

export interface GalacticLandmark {
  id: string
  name: string
  /** Distance from the Sun, light years. */
  distFromSun: number
  /** Galactic longitude and latitude, degrees. */
  l: number
  b: number
  kind: 'nebula' | 'cluster' | 'blackhole' | 'star' | 'structure' | 'remnant'
  colour: string
  size: number
  blurb: string
  facts?: Fact[]
  notable?: boolean
}

export const LANDMARKS: GalacticLandmark[] = [
  {
    id: 'sgr-a', name: 'Sagittarius A*', distFromSun: 26_000, l: 0, b: 0,
    kind: 'blackhole', colour: '#ffcf6b', size: 2.4, notable: true,
    blurb:
      'The supermassive black hole at the centre of the Milky Way — 4.3 million solar masses inside a region smaller than Mercury\'s orbit. Stars whip around it at a few percent of the speed of light, and in 2022 the Event Horizon Telescope imaged its shadow.',
    facts: [
      { label: 'Mass', value: '4.3 million M☉' },
      { label: 'Distance', value: '26,000 light years' },
      { label: 'Imaged', value: '2022, Event Horizon Telescope' },
      { label: 'Schwarzschild radius', value: '~12.7 million km' },
    ],
  },
  {
    id: 'orion-nebula', name: 'Orion Nebula', distFromSun: 1_344, l: 209, b: -19.4,
    kind: 'nebula', colour: '#ff9ec0', size: 1.5, notable: true,
    blurb:
      'The nearest region of massive star formation, and the closest thing to watching planetary systems being born — roughly 700 stars are forming inside it right now. Visible to the unaided eye as the middle "star" of Orion\'s sword.',
    facts: [
      { label: 'Distance', value: '1,344 light years' },
      { label: 'Diameter', value: '24 light years' },
      { label: 'Protostars', value: '~700 forming' },
    ],
  },
  {
    id: 'pleiades', name: 'Pleiades', distFromSun: 444, l: 166.6, b: -23.5,
    kind: 'cluster', colour: '#b8d4ff', size: 1.1, notable: true,
    blurb:
      'A young open cluster of about a thousand stars, only 100 million years old, still wrapped in the blue reflection nebula of the dust it is passing through. Named in nearly every ancient culture that wrote anything down.',
    facts: [
      { label: 'Distance', value: '444 light years' },
      { label: 'Age', value: '~100 million years' },
      { label: 'Members', value: '~1,000 stars' },
    ],
  },
  {
    id: 'eta-carinae', name: 'Eta Carinae', distFromSun: 7_500, l: 287.6, b: -0.6,
    kind: 'star', colour: '#ffb37a', size: 1.0,
    blurb:
      'A pair of enormous stars, the larger perhaps 100 solar masses, which erupted in 1843 to become the second-brightest star in the sky without actually exploding. It is one of the nearest candidates for a future supernova.',
    facts: [
      { label: 'Mass', value: '~100 + 30 M☉' },
      { label: 'Great Eruption', value: '1843 — survived it' },
    ],
  },
  {
    id: 'crab-nebula', name: 'Crab Nebula', distFromSun: 6_500, l: 184.6, b: -5.8,
    kind: 'remnant', colour: '#8fe0c8', size: 0.9,
    blurb:
      'The wreckage of a star that exploded in 1054 — bright enough that Chinese and Arab astronomers recorded it in daylight. At its heart a neutron star spins thirty times a second.',
    facts: [
      { label: 'Supernova seen', value: '1054 CE, recorded worldwide' },
      { label: 'Pulsar', value: '30 rotations per second' },
    ],
  },
  {
    id: 'omega-centauri', name: 'Omega Centauri', distFromSun: 15_800, l: 309.1, b: 15.0,
    kind: 'cluster', colour: '#ffe8c0', size: 1.3,
    blurb:
      'The largest globular cluster in the Milky Way — ten million stars in a ball 150 light years across. Its stars are of mixed ages, which suggests it is not a cluster at all but the stripped core of a dwarf galaxy we consumed.',
    facts: [
      { label: 'Stars', value: '~10 million' },
      { label: 'Age', value: '12 billion years' },
      { label: 'Likely origin', value: 'Core of a captured dwarf galaxy' },
    ],
  },
  {
    id: 'carina-nebula', name: 'Carina Nebula', distFromSun: 8_500, l: 287.4, b: -0.6,
    kind: 'nebula', colour: '#ffa8b8', size: 1.4,
    blurb: 'A vast star-forming complex four times the size of the Orion Nebula, and the subject of some of the most widely seen images from both Hubble and Webb.',
  },
  {
    id: 'local-bubble', name: 'Local Bubble', distFromSun: 0, l: 0, b: 0,
    kind: 'structure', colour: '#6a7fc0', size: 0.0,
    blurb:
      'The Sun sits inside a cavity about 1,000 light years across, blown clear of gas by a series of supernovae over the past 14 million years. Its walls are where nearly all nearby star formation is happening.',
    facts: [
      { label: 'Diameter', value: '~1,000 light years' },
      { label: 'Carved by', value: '~15 supernovae over 14 Myr' },
    ],
  },
]

export const MILKY_WAY_FACTS: Fact[] = [
  { label: 'Type', value: 'Barred spiral, SBbc' },
  { label: 'Diameter', value: '~100,000 light years' },
  { label: 'Disc thickness', value: '~1,000 ly (thin disc)' },
  { label: 'Stars', value: '100–400 billion' },
  { label: 'Mass', value: '~1.5 × 10¹² M☉ including dark matter' },
  { label: 'Sun\'s distance from centre', value: '26,000 light years' },
  { label: 'Galactic year', value: '~230 million years' },
  { label: 'Sun\'s orbital speed', value: '230 km/s' },
  { label: 'Age', value: '13.6 billion years' },
]

export const MILKY_WAY_BLURB =
  'A barred spiral about 100,000 light years across, holding a few hundred billion stars and far more mass again in dark matter. We sit two-thirds of the way out, in a minor spur called the Orion Arm, taking 230 million years to complete one lap. Because we are inside the disc looking through it, we could not establish its shape until the twentieth century.'

export const DISC_RADIUS_METRES = DISC_RADIUS * 1e3 * LY
