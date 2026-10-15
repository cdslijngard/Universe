import { MLY } from '../lib/constants'
import type { Fact } from './types'

/**
 * Local Group members. Positions are given as J2000 RA (hours) / Dec
 * (degrees) plus distance in Mly, so the relative 3D geometry is real rather
 * than decorative. Scene unit at this level is 100,000 ly = 0.1 Mly.
 */
export interface LocalGroupMember {
  id: string
  name: string
  ra: number
  dec: number
  /** Distance in millions of light years. */
  dist: number
  /** Diameter in thousands of light years. */
  diameter: number
  shape: 'spiral' | 'barred' | 'elliptical' | 'irregular' | 'dwarf'
  colour: string
  /** Billboard roll, radians, so not every galaxy faces the same way. */
  roll: number
  /** 0 = face on, 1 = edge on. */
  incline: number
  blurb: string
  facts?: Fact[]
  notable?: boolean
}

export const LOCAL_GROUP: LocalGroupMember[] = [
  {
    id: 'milkyway', name: 'Milky Way', ra: 0, dec: 0, dist: 0,
    diameter: 100, shape: 'barred', colour: '#ffe8c4', roll: 0.3, incline: 0.55,
    notable: true,
    blurb: 'Our own galaxy, and one of the two gravitational anchors of the Local Group. Everything at the inner levels of this atlas is inside it.',
    facts: [
      { label: 'Diameter', value: '~100,000 light years' },
      { label: 'Stars', value: '100–400 billion' },
    ],
  },
  {
    id: 'andromeda', name: 'Andromeda (M31)', ra: 0.7122, dec: 41.2692, dist: 2.537,
    diameter: 220, shape: 'spiral', colour: '#dce6ff', roll: 1.2, incline: 0.85,
    notable: true,
    blurb:
      'The largest galaxy in the Local Group and the most distant thing visible to the unaided eye — a trillion stars, spread across six full Moons of sky. It is approaching us at 110 km/s and will merge with the Milky Way in about 4.5 billion years.',
    facts: [
      { label: 'Distance', value: '2.54 million light years' },
      { label: 'Diameter', value: '~220,000 light years' },
      { label: 'Stars', value: '~1 trillion' },
      { label: 'Approaching at', value: '110 km/s' },
      { label: 'Collision', value: 'In ~4.5 billion years' },
    ],
  },
  {
    id: 'triangulum', name: 'Triangulum (M33)', ra: 1.5639, dec: 30.6602, dist: 2.73,
    diameter: 60, shape: 'spiral', colour: '#cfe0ff', roll: -0.6, incline: 0.72,
    notable: true,
    blurb:
      'The third-largest member, and possibly a satellite of Andromeda. It has no central bulge and an unusually high rate of star formation for its size.',
    facts: [
      { label: 'Distance', value: '2.73 million light years' },
      { label: 'Stars', value: '~40 billion' },
    ],
  },
  {
    id: 'lmc', name: 'Large Magellanic Cloud', ra: 5.3928, dec: -69.7561, dist: 0.163,
    diameter: 32, shape: 'irregular', colour: '#ffd9e0', roll: 0.8, incline: 0.4,
    notable: true,
    blurb:
      'The Milky Way\'s largest satellite, a bright smudge in the southern sky with a single stubby bar — it was probably a spiral before our gravity pulled it apart. It hosts the Tarantula Nebula, the most active star-forming region known in the Local Group.',
    facts: [
      { label: 'Distance', value: '163,000 light years' },
      { label: 'Tarantula Nebula', value: 'Most active starburst nearby' },
      { label: 'SN 1987A', value: 'Nearest supernova in 400 years' },
    ],
  },
  {
    id: 'smc', name: 'Small Magellanic Cloud', ra: 0.8772, dec: -72.8003, dist: 0.206,
    diameter: 18, shape: 'irregular', colour: '#ffe2d0', roll: -0.4, incline: 0.5,
    notable: true,
    blurb:
      'A dwarf irregular being torn apart by the Milky Way and the LMC together — the Magellanic Stream, a trail of gas spanning half the sky, is the debris.',
    facts: [{ label: 'Distance', value: '206,000 light years' }],
  },
  {
    id: 'sagittarius-dwarf', name: 'Sagittarius Dwarf', ra: 18.9222, dec: -30.4783, dist: 0.065,
    diameter: 10, shape: 'dwarf', colour: '#e8d8ff', roll: 0.2, incline: 0.3,
    blurb: 'Currently being swallowed. It has already been stretched into a stream wrapping right around the Milky Way, and its passes through our disc may have triggered waves of star formation — possibly including the Sun\'s.',
    facts: [{ label: 'Status', value: 'Actively merging with the Milky Way' }],
  },
  {
    id: 'ngc6822', name: "Barnard's Galaxy (NGC 6822)", ra: 19.7489, dec: -14.8025, dist: 1.63,
    diameter: 7, shape: 'irregular', colour: '#d8f0e0', roll: 1.0, incline: 0.35,
    blurb: 'A small irregular galaxy resembling a scaled-down Small Magellanic Cloud, and one of the first objects shown to lie beyond the Milky Way.',
  },
  {
    id: 'ic10', name: 'IC 10', ra: 0.3381, dec: 59.2917, dist: 2.2,
    diameter: 5, shape: 'irregular', colour: '#ffe0c8', roll: -0.9, incline: 0.45,
    blurb: 'The only starburst galaxy in the Local Group — it is producing massive stars at a furious rate, hidden behind the dust of our own disc.',
  },
  {
    id: 'ic1613', name: 'IC 1613', ra: 1.08, dec: 2.1333, dist: 2.38,
    diameter: 5, shape: 'irregular', colour: '#e4e8ff', roll: 0.5, incline: 0.25,
    blurb: 'An unusually dust-free dwarf irregular, which makes it a valuable clean laboratory for calibrating cosmic distances.',
  },
  {
    id: 'm32', name: 'M32', ra: 0.7117, dec: 40.8656, dist: 2.65,
    diameter: 6, shape: 'elliptical', colour: '#fff0d8', roll: 0, incline: 0.1,
    blurb: 'A compact elliptical hugging Andromeda — probably the stripped core of a once much larger galaxy that M31 has eaten.',
  },
  {
    id: 'm110', name: 'M110', ra: 0.6728, dec: 41.6853, dist: 2.69,
    diameter: 17, shape: 'elliptical', colour: '#f8ecd8', roll: 0.6, incline: 0.6,
    blurb: 'A dwarf elliptical satellite of Andromeda, unusual among ellipticals for containing clouds of dust and signs of recent star formation.',
  },
  {
    id: 'ngc185', name: 'NGC 185', ra: 0.6494, dec: 48.3372, dist: 2.05,
    diameter: 8, shape: 'elliptical', colour: '#f0e8dc', roll: -0.3, incline: 0.3,
    blurb: 'A dwarf elliptical companion of Andromeda, and one of the closest galaxies with an active nucleus.',
  },
  {
    id: 'ngc147', name: 'NGC 147', ra: 0.5533, dec: 48.5083, dist: 2.53,
    diameter: 10, shape: 'elliptical', colour: '#ece4d8', roll: 0.9, incline: 0.65,
    blurb: 'A dwarf spheroidal paired with NGC 185, both bound to Andromeda.',
  },
  {
    id: 'wlm', name: 'WLM', ra: 0.0328, dec: -15.4611, dist: 3.04,
    diameter: 8, shape: 'irregular', colour: '#dcecf8', roll: -1.1, incline: 0.8,
    blurb: 'An isolated dwarf on the outskirts of the Local Group, far enough from everything else that it has evolved largely undisturbed — and a favourite early Webb target for that reason.',
  },
  {
    id: 'fornax-dwarf', name: 'Fornax Dwarf', ra: 2.6664, dec: -34.4489, dist: 0.46,
    diameter: 3, shape: 'dwarf', colour: '#e8e0f0', roll: 0.1, incline: 0.2,
    blurb: 'A dwarf spheroidal satellite of the Milky Way, notable for carrying six globular clusters of its own.',
  },
  {
    id: 'sculptor-dwarf', name: 'Sculptor Dwarf', ra: 1.0025, dec: -33.7089, dist: 0.287,
    diameter: 3, shape: 'dwarf', colour: '#e0e0ec', roll: -0.2, incline: 0.2,
    blurb: 'One of the first dwarf spheroidals ever found, and almost entirely made of ancient stars — it stopped forming new ones billions of years ago.',
  },
  {
    id: 'draco-dwarf', name: 'Draco Dwarf', ra: 17.3367, dec: 57.915, dist: 0.258,
    diameter: 3, shape: 'dwarf', colour: '#dcdcf0', roll: 0.4, incline: 0.2,
    blurb: 'Among the most dark-matter-dominated objects known — its stars account for barely a thousandth of its mass.',
    facts: [{ label: 'Dark matter', value: 'Mass-to-light ratio ~300' }],
  },
  {
    id: 'leo1', name: 'Leo I', ra: 10.1411, dec: 12.3053, dist: 0.82,
    diameter: 3, shape: 'dwarf', colour: '#f0e8e0', roll: -0.5, incline: 0.2,
    blurb: 'A distant Milky Way satellite that appears to hold a surprisingly massive black hole at its centre for something so small.',
  },
  {
    id: 'leo2', name: 'Leo II', ra: 11.2247, dec: 22.1517, dist: 0.7,
    diameter: 2.5, shape: 'dwarf', colour: '#ece4e0', roll: 0.7, incline: 0.2,
    blurb: 'A faint dwarf spheroidal that formed most of its stars in a single early burst and has been quiet ever since.',
  },
  {
    id: 'carina-dwarf', name: 'Carina Dwarf', ra: 6.6936, dec: -50.9661, dist: 0.33,
    diameter: 2, shape: 'dwarf', colour: '#e4ece8', roll: -0.8, incline: 0.2,
    blurb: 'Unusual among dwarf spheroidals for having formed stars in several distinct episodes separated by billions of years.',
  },
  {
    id: 'ursa-minor-dwarf', name: 'Ursa Minor Dwarf', ra: 15.1531, dec: 67.2225, dist: 0.225,
    diameter: 2, shape: 'dwarf', colour: '#e0e8f0', roll: 0.3, incline: 0.2,
    blurb: 'An ancient, almost purely old-star satellite being slowly stretched by the Milky Way\'s tides.',
  },
  {
    id: 'phoenix-dwarf', name: 'Phoenix Dwarf', ra: 1.8517, dec: -44.4453, dist: 1.44,
    diameter: 2, shape: 'dwarf', colour: '#f0e4e8', roll: -0.1, incline: 0.2,
    blurb: 'A transitional dwarf, caught between the gas-rich irregulars and the gas-free spheroidals.',
  },
  {
    id: 'ngc3109', name: 'NGC 3109', ra: 10.0519, dec: -26.1581, dist: 4.3,
    diameter: 25, shape: 'irregular', colour: '#d8e4f0', roll: 1.3, incline: 0.9,
    blurb: 'A small barred spiral right at the edge of the Local Group — possibly just outside it, leading its own small cluster of companions.',
  },
]

export const LOCAL_GROUP_FACTS: Fact[] = [
  { label: 'Diameter', value: '~10 million light years' },
  { label: 'Members', value: '80+ known galaxies' },
  { label: 'Dominant members', value: 'Milky Way and Andromeda' },
  { label: 'Total mass', value: '~2 × 10¹² M☉' },
  { label: 'Part of', value: 'Virgo Supercluster → Laniakea' },
]

export const LOCAL_GROUP_BLURB =
  'Two large spirals, one middling one, and eighty-odd dwarfs bound together across ten million light years. The Milky Way and Andromeda are falling toward each other and will merge in about 4.5 billion years. Unlike the rest of the universe, the Local Group is not expanding — gravity here has already won.'

export const LOCAL_GROUP_SPAN = 10 * MLY
