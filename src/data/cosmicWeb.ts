import { GLY, MLY } from '../lib/constants'
import type { Fact } from './types'

/**
 * Large-scale structure. Positions are J2000 RA (hours) / Dec (degrees) with
 * distance in Mly. Scene unit at this level is 10 Mly.
 */
export interface WebNode {
  id: string
  name: string
  ra: number
  dec: number
  /** Distance in millions of light years. */
  dist: number
  /** Diameter in millions of light years. */
  diameter: number
  kind: 'cluster' | 'supercluster' | 'void' | 'wall' | 'group' | 'attractor'
  colour: string
  blurb: string
  facts?: Fact[]
  notable?: boolean
}

export const WEB_NODES: WebNode[] = [
  {
    id: 'local-group', name: 'Local Group', ra: 0, dec: 0, dist: 0,
    diameter: 10, kind: 'group', colour: '#ffe8c4', notable: true,
    blurb: 'Us, and everything at the levels below this one — a modest cluster of eighty galaxies on the outskirts of something far larger.',
  },
  {
    id: 'virgo-cluster', name: 'Virgo Cluster', ra: 12.45, dec: 12.72, dist: 53.8,
    diameter: 15, kind: 'cluster', colour: '#9fd0ff', notable: true,
    blurb:
      'The nearest large cluster, with over 1,300 galaxies — and the gravitational centre our own Local Group is slowly falling toward at 400 km/s. Its dominant galaxy M87 hosts the first black hole ever imaged.',
    facts: [
      { label: 'Distance', value: '54 million light years' },
      { label: 'Galaxies', value: '1,300+' },
      { label: 'Mass', value: '1.2 × 10¹⁵ M☉' },
      { label: 'M87*', value: 'First black hole ever imaged, 2019' },
    ],
  },
  {
    id: 'fornax-cluster', name: 'Fornax Cluster', ra: 3.63, dec: -35.45, dist: 62,
    diameter: 6, kind: 'cluster', colour: '#a8c8f0',
    blurb: 'The second-nearest cluster of any size, and a well-studied laboratory for how galaxies change when they fall into dense environments.',
  },
  {
    id: 'virgo-supercluster', name: 'Virgo Supercluster', ra: 12.45, dec: 12.72, dist: 54,
    diameter: 110, kind: 'supercluster', colour: '#7fa8e0', notable: true,
    blurb:
      'The supercluster containing the Local Group — about 110 million light years across, holding roughly a hundred galaxy groups. For decades it was thought to be the largest structure we belonged to. It is not.',
    facts: [
      { label: 'Diameter', value: '110 million light years' },
      { label: 'Galaxy groups', value: '~100' },
      { label: 'Status', value: 'A lobe of Laniakea, not independent' },
    ],
  },
  {
    id: 'hydra-centaurus', name: 'Hydra–Centaurus Supercluster', ra: 12.8, dec: -41.3, dist: 160,
    diameter: 100, kind: 'supercluster', colour: '#8fbce0',
    blurb: 'The nearest neighbouring supercluster, lying between us and the Great Attractor and falling the same way we are.',
  },
  {
    id: 'great-attractor', name: 'Great Attractor', ra: 10.53, dec: -46.0, dist: 250,
    diameter: 30, kind: 'attractor', colour: '#ffb37a', notable: true,
    blurb:
      'A gravitational anomaly pulling the Milky Way and thousands of other galaxies toward it at 600 km/s. It sits behind the plane of our own galaxy — the "Zone of Avoidance" — so we have never had a clear view of what it actually is.',
    facts: [
      { label: 'Distance', value: '~250 million light years' },
      { label: 'Our infall speed', value: '600 km/s' },
      { label: 'Obscured by', value: 'The Milky Way\'s own disc' },
    ],
  },
  {
    id: 'laniakea', name: 'Laniakea Supercluster', ra: 10.53, dec: -46.0, dist: 250,
    diameter: 520, kind: 'supercluster', colour: '#6d8fd0', notable: true,
    blurb:
      'Our home supercluster, defined in 2014 not by where galaxies are but by which way they are flowing — everything whose motion converges on the Great Attractor. It spans 520 million light years and contains about 100,000 galaxies. The name is Hawaiian for "immeasurable heaven".',
    facts: [
      { label: 'Diameter', value: '520 million light years' },
      { label: 'Galaxies', value: '~100,000' },
      { label: 'Defined', value: '2014, by galaxy flow rather than position' },
      { label: 'Mass', value: '~10¹⁷ M☉' },
    ],
  },
  {
    id: 'coma-cluster', name: 'Coma Cluster', ra: 12.998, dec: 27.98, dist: 321,
    diameter: 20, kind: 'cluster', colour: '#b0d8ff', notable: true,
    blurb:
      'A dense cluster of over a thousand galaxies, and the place dark matter was first inferred: in 1933 Fritz Zwicky found its galaxies moving far too fast for the visible mass to hold them together.',
    facts: [
      { label: 'Distance', value: '321 million light years' },
      { label: 'Galaxies', value: '1,000+' },
      { label: 'Historic', value: 'Where dark matter was first inferred, 1933' },
    ],
  },
  {
    id: 'perseus-pisces', name: 'Perseus–Pisces Supercluster', ra: 2.5, dec: 41.5, dist: 250,
    diameter: 300, kind: 'supercluster', colour: '#88a8d8',
    blurb: 'One of the largest structures known, a chain of clusters stretching 300 million light years across the northern sky.',
  },
  {
    id: 'shapley', name: 'Shapley Supercluster', ra: 13.42, dec: -31.0, dist: 650,
    diameter: 260, kind: 'supercluster', colour: '#7a9ad0',
    blurb:
      'The most massive concentration of galaxies in our part of the universe — far beyond the Great Attractor, and probably much of the reason we are being pulled that way at all.',
    facts: [{ label: 'Distance', value: '650 million light years' }],
  },
  {
    id: 'bootes-void', name: 'Boötes Void', ra: 14.83, dec: 46.0, dist: 700,
    diameter: 330, kind: 'void', colour: '#2a2f4a', notable: true,
    blurb:
      'A sphere 330 million light years across containing almost nothing — about 60 galaxies where there should be 2,000. If the Milky Way sat at its centre, we would not have known other galaxies existed until the 1960s.',
    facts: [
      { label: 'Diameter', value: '330 million light years' },
      { label: 'Galaxies found', value: '~60, where ~2,000 were expected' },
      { label: 'Discovered', value: '1981' },
    ],
  },
  {
    id: 'sloan-great-wall', name: 'Sloan Great Wall', ra: 11.0, dec: 8.0, dist: 1_000,
    diameter: 1_370, kind: 'wall', colour: '#90b0e0',
    blurb:
      'A sheet of galaxies 1.37 billion light years long — one of the largest structures ever mapped, and large enough that its existence strains the standard picture of how quickly structure can grow.',
    facts: [{ label: 'Length', value: '1.37 billion light years' }],
  },
]

/** Procedural filament field parameters for the cosmic web background. */
export const WEB_FIELD = {
  /** Half-extent of the generated cube, in scene units (10 Mly each). */
  extent: 175,
  /** Number of cluster nodes the filaments are strung between. */
  count: 240,
  /** Scale of the clustering noise. */
  noiseScale: 0.055,
  /** Density below this is carved out into voids. */
  threshold: 0.52,
  colour: '#8ea8dc',
}

export const OBSERVABLE_UNIVERSE: Fact[] = [
  { label: 'Comoving radius', value: '46.5 billion light years' },
  { label: 'Diameter', value: '93 billion light years' },
  { label: 'Age of the universe', value: '13.787 billion years' },
  { label: 'Galaxies', value: 'At least 2 trillion' },
  { label: 'Observable mass', value: '~10⁵³ kg' },
  { label: 'CMB temperature', value: '2.725 K' },
  { label: 'Composition', value: '68% dark energy, 27% dark matter, 5% ordinary' },
]

export const COSMIC_BLURB =
  'At the largest scale the universe is not clumpy but structured: galaxies gather along filaments and sheets that wrap around vast empty voids, like soap film around bubbles. Everything we can see is bounded by the cosmic microwave background — not an edge in space but a limit in time, the moment 380,000 years after the Big Bang when the universe first turned transparent.'

/**
 * The CMB shell is drawn at a symbolic radius. Its true comoving distance is
 * 46.5 Gly, roughly 3,000 scene units away — far outside anything else at
 * this level — so it is the one place in the app where the geometry is
 * deliberately compressed, and the label says so.
 */
export const CMB_SHELL_RADIUS = 265
export const CMB_TRUE_DISTANCE = 46.5 * GLY
export const COSMIC_SPAN = 1_400 * MLY
