import type { Star } from './types'

/**
 * Stars within roughly 26 light years, plus a few bright and notable systems
 * a little beyond. Positions are J2000 right ascension (hours) and
 * declination (degrees); distances are from Gaia DR3 / RECONS parallaxes.
 */
export const STARS: Star[] = [
  {
    id: 'sol', name: 'The Sun', ra: 0, dec: 0, dist: 0, spectral: 'G2V', absMag: 4.83, appMag: -26.74,
    planets: 8, notable: true,
    blurb: 'Us. A single yellow dwarf, unremarkable except that we are standing on one of its planets.',
  },
  {
    id: 'proxima', name: 'Proxima Centauri', ra: 14.4954, dec: -62.6794, dist: 4.2465,
    spectral: 'M5.5Ve', absMag: 15.6, appMag: 11.13, planets: 3, notable: true, system: 'alpha-cen',
    blurb: 'The closest star to the Sun, and far too faint to see without a telescope. It is a flare star — it can brighten by a factor of ten in minutes. Proxima b orbits in its habitable zone, 4.2 light years away.',
    facts: [
      { label: 'Planets', value: '3 known, one potentially habitable' },
      { label: 'Mass', value: '12% of the Sun' },
      { label: 'Flares', value: 'Can brighten 10× in minutes' },
    ],
  },
  {
    id: 'alpha-cen-a', name: 'Alpha Centauri A', ra: 14.6601, dec: -60.8356, dist: 4.365,
    spectral: 'G2V', absMag: 4.38, appMag: -0.01, notable: true, system: 'alpha-cen',
    blurb: 'A near-twin of the Sun and the fourth-brightest star in the night sky. With its companion B it forms the closest stellar system to us; the two circle each other every 80 years.',
    facts: [{ label: 'Binary period', value: '79.9 years with Alpha Cen B' }],
  },
  {
    id: 'alpha-cen-b', name: 'Alpha Centauri B', ra: 14.6603, dec: -60.8373, dist: 4.365,
    spectral: 'K1V', absMag: 5.71, appMag: 1.33, system: 'alpha-cen',
    blurb: 'A slightly cooler, smaller orange companion to Alpha Centauri A, separated from it by between 11 and 36 AU as they orbit.',
  },
  {
    id: 'barnard', name: "Barnard's Star", ra: 17.9635, dec: 4.6933, dist: 5.963,
    spectral: 'M4.0Ve', absMag: 13.22, appMag: 9.51, planets: 4, notable: true,
    blurb: 'The fastest-moving star in our sky, crossing a Moon-width every 180 years. It is also one of the oldest things nearby — perhaps 10 billion years — and in 2024 four small planets were confirmed around it.',
    facts: [
      { label: 'Proper motion', value: '10.3 arcsec/year — the largest known' },
      { label: 'Age', value: '~10 billion years' },
      { label: 'Planets', value: '4 sub-Earth-mass, confirmed 2024' },
    ],
  },
  {
    id: 'wolf359', name: 'Wolf 359', ra: 10.9414, dec: 7.0085, dist: 7.856,
    spectral: 'M6.0V', absMag: 16.55, appMag: 13.54, planets: 2,
    blurb: 'A dim red dwarf near the bottom of the main sequence, radiating about a thousandth of the Sun\'s light.',
  },
  {
    id: 'lalande', name: 'Lalande 21185', ra: 11.0556, dec: 35.9699, dist: 8.307,
    spectral: 'M2.0V', absMag: 10.44, appMag: 7.52, planets: 3,
    blurb: 'The brightest red dwarf in the northern sky, and still invisible to the unaided eye. It hosts at least three planets.',
  },
  {
    id: 'sirius-a', name: 'Sirius A', ra: 6.7525, dec: -16.7161, dist: 8.659,
    spectral: 'A1V', absMag: 1.42, appMag: -1.46, notable: true, system: 'sirius',
    blurb: 'The brightest star in the night sky — not because it is especially luminous, but because it is close and hot. Twice the Sun\'s mass, 25 times its light.',
    facts: [
      { label: 'Apparent magnitude', value: '−1.46, brightest in the sky' },
      { label: 'Luminosity', value: '25 × the Sun' },
    ],
  },
  {
    id: 'sirius-b', name: 'Sirius B', ra: 6.7526, dec: -16.7163, dist: 8.659,
    spectral: 'DA2', absMag: 11.18, appMag: 8.44, notable: true, system: 'sirius',
    blurb: 'A white dwarf the size of Earth holding the mass of the Sun — a teaspoon of it would weigh several tonnes. It is the burnt-out core of a star that was once more massive than Sirius A.',
    facts: [
      { label: 'Radius', value: '0.0084 × Sun — about Earth-sized' },
      { label: 'Mass', value: '1.02 × the Sun' },
      { label: 'Surface gravity', value: '400,000 × Earth' },
    ],
  },
  {
    id: 'luyten726', name: 'Luyten 726-8', ra: 1.6503, dec: -17.9572, dist: 8.73,
    spectral: 'M5.5V', absMag: 15.4,
    blurb: 'A pair of red dwarfs, one of which (UV Ceti) is the prototype flare star — it can double in brightness in seconds.',
  },
  {
    id: 'ross154', name: 'Ross 154', ra: 18.8303, dec: -23.8365, dist: 9.7,
    spectral: 'M3.5V', absMag: 13.07,
    blurb: 'A young, rapidly flaring red dwarf in Sagittarius, under a billion years old.',
  },
  {
    id: 'ross248', name: 'Ross 248', ra: 23.6986, dec: 44.1773, dist: 10.3,
    spectral: 'M5.5V', absMag: 14.8,
    blurb: 'In about 36,000 years, its own motion will briefly make it the closest star to the Sun — and Voyager 2 will pass within 1.7 light years of it.',
  },
  {
    id: 'eps-eri', name: 'Epsilon Eridani', ra: 3.5489, dec: -9.4581, dist: 10.475,
    spectral: 'K2V', absMag: 6.19, appMag: 3.73, planets: 1, notable: true,
    blurb: 'A young orange dwarf, under a billion years old, still surrounded by two asteroid belts and a dusty debris disc — a solar system caught in the middle of being built.',
    facts: [
      { label: 'Age', value: '~800 million years' },
      { label: 'Debris', value: 'Two asteroid belts and a dust disc' },
    ],
  },
  {
    id: 'lacaille9352', name: 'Lacaille 9352', ra: 23.0978, dec: -35.8515, dist: 10.72,
    spectral: 'M0.5V', absMag: 9.75, planets: 4,
    blurb: 'A red dwarf with one of the largest proper motions known, and a growing family of detected planets.',
  },
  {
    id: 'ross128', name: 'Ross 128', ra: 11.7956, dec: 0.8017, dist: 11.007,
    spectral: 'M4.0V', absMag: 13.51, planets: 1,
    blurb: 'A quiet red dwarf — unusually calm for its class — with an Earth-mass planet orbiting every 9.9 days.',
  },
  {
    id: '61cyg-a', name: '61 Cygni A', ra: 21.115, dec: 38.7497, dist: 11.4,
    spectral: 'K5V', absMag: 7.49, appMag: 5.21, notable: true, system: '61-cyg',
    blurb: 'The first star ever to have its distance measured, by Friedrich Bessel in 1838 — the measurement that first gave the universe a scale.',
    facts: [{ label: 'Historic', value: 'First stellar parallax, Bessel 1838' }],
  },
  {
    id: '61cyg-b', name: '61 Cygni B', ra: 21.1156, dec: 38.7419, dist: 11.4,
    spectral: 'K7V', absMag: 8.33, system: '61-cyg',
    blurb: 'The fainter half of the 61 Cygni pair, orbiting its companion over roughly 678 years.',
  },
  {
    id: 'procyon-a', name: 'Procyon A', ra: 7.655, dec: 5.225, dist: 11.46,
    spectral: 'F5IV-V', absMag: 2.66, appMag: 0.38, notable: true,
    blurb: 'The eighth-brightest star in the sky, already swelling off the main sequence as it exhausts its core hydrogen. It too has a white dwarf companion.',
  },
  {
    id: 'struve2398', name: 'Struve 2398', ra: 18.7131, dec: 59.6258, dist: 11.52,
    spectral: 'M3.0V', absMag: 11.18, planets: 1,
    blurb: 'A binary pair of red dwarfs in Draco, each about a third of the Sun\'s mass.',
  },
  {
    id: 'groombridge34', name: 'Groombridge 34', ra: 0.3064, dec: 44.0173, dist: 11.62,
    spectral: 'M1.5V', absMag: 10.33, planets: 2,
    blurb: 'A red dwarf binary in Andromeda; the primary hosts two known planets.',
  },
  {
    id: 'eps-indi', name: 'Epsilon Indi', ra: 22.0561, dec: -56.7847, dist: 11.87,
    spectral: 'K5Ve', absMag: 6.89, planets: 1,
    blurb: 'An orange dwarf with a cold Jupiter-like planet and two brown dwarf companions trailing far behind it.',
  },
  {
    id: 'tau-ceti', name: 'Tau Ceti', ra: 1.7344, dec: -15.9375, dist: 11.912,
    spectral: 'G8.5V', absMag: 5.69, appMag: 3.5, planets: 4, notable: true,
    blurb: 'The nearest single star that is genuinely Sun-like, and a fixture of science fiction for that reason. It is older than the Sun and ringed by a debris disc ten times as dense, which would mean a heavy bombardment for any planets.',
    facts: [
      { label: 'Mass', value: '78% of the Sun' },
      { label: 'Debris disc', value: '10 × denser than our own' },
      { label: 'Planets', value: '4 candidates' },
    ],
  },
  {
    id: 'gj1061', name: 'GJ 1061', ra: 3.5999, dec: -44.5109, dist: 11.98,
    spectral: 'M5.5V', absMag: 15.26, planets: 3,
    blurb: 'A faint red dwarf with three planets, one of them temperate and close to Earth\'s mass.',
  },
  {
    id: 'yz-ceti', name: 'YZ Ceti', ra: 1.2086, dec: -16.98, dist: 12.13,
    spectral: 'M4.5V', absMag: 14.17, planets: 3,
    blurb: 'Three planets crammed inside what would be Mercury\'s orbit, circling in two, three and five days.',
  },
  {
    id: 'luyten', name: "Luyten's Star", ra: 7.4567, dec: 5.2253, dist: 12.35,
    spectral: 'M3.5V', absMag: 11.97, planets: 2,
    blurb: 'A red dwarf that happens to lie very near Procyon in the sky, with a super-Earth in its habitable zone.',
  },
  {
    id: 'teegarden', name: "Teegarden's Star", ra: 2.8836, dec: 16.8832, dist: 12.5,
    spectral: 'M7.0V', absMag: 17.22, planets: 2, notable: true,
    blurb: 'One of the smallest and coolest stars known, overlooked until 2003 despite being this close. Both of its planets are close to Earth\'s mass and temperate.',
    facts: [{ label: 'Mass', value: '9% of the Sun — near the fusion limit' }],
  },
  {
    id: 'kapteyn', name: "Kapteyn's Star", ra: 5.1947, dec: -45.0169, dist: 12.83,
    spectral: 'M1.5V', absMag: 10.89,
    blurb: 'A halo star moving backwards through the galaxy — it was probably stripped from a dwarf galaxy the Milky Way swallowed. At around 11 billion years old it is nearly as old as the galaxy itself.',
    facts: [{ label: 'Origin', value: 'Likely a captured dwarf galaxy star' }],
  },
  {
    id: 'lacaille8760', name: 'Lacaille 8760', ra: 21.2875, dec: -38.8672, dist: 12.95,
    spectral: 'M0.0V', absMag: 8.69,
    blurb: 'One of the largest and brightest red dwarfs known, and still only a hundredth as luminous as the Sun.',
  },
  {
    id: 'kruger60', name: 'Kruger 60', ra: 22.4666, dec: 57.6969, dist: 13.08,
    spectral: 'M3.0V', absMag: 11.58,
    blurb: 'A close red dwarf binary whose two stars orbit every 44.6 years, near enough to watch them move.',
  },
  {
    id: 'ross614', name: 'Ross 614', ra: 6.4897, dec: -2.8375, dist: 13.35,
    spectral: 'M4.0V', absMag: 13.09,
    blurb: 'A binary whose faint secondary is one of the least massive stars with a well-measured mass.',
  },
  {
    id: 'wolf1061', name: 'Wolf 1061', ra: 16.505, dec: -12.6597, dist: 14.05,
    spectral: 'M3.0V', absMag: 11.94, planets: 3,
    blurb: 'A red dwarf with three planets, the middle one orbiting within the habitable zone.',
  },
  {
    id: 'van-maanen', name: "Van Maanen's Star", ra: 0.8194, dec: 5.395, dist: 14.07,
    spectral: 'DZ8', absMag: 14.21, notable: true,
    blurb: 'The nearest solitary white dwarf, and the third discovered. Metals in its atmosphere are the shredded remains of a planetary system it has been eating.',
    facts: [{ label: 'Pollution', value: 'Metal lines from accreted planetary debris' }],
  },
  {
    id: 'gliese1', name: 'Gliese 1', ra: 0.0903, dec: -37.3572, dist: 14.17,
    spectral: 'M1.5V', absMag: 10.35,
    blurb: 'A metal-poor old red dwarf, the first entry in the classic Gliese catalogue of nearby stars.',
  },
  {
    id: 'tz-arietis', name: 'TZ Arietis', ra: 2.0036, dec: 13.0533, dist: 14.6,
    spectral: 'M4.5V', absMag: 14.03, planets: 1,
    blurb: 'A flare star with a Neptune-mass planet on a wide, eccentric orbit.',
  },
  {
    id: 'gliese687', name: 'Gliese 687', ra: 17.6072, dec: 68.3522, dist: 14.84,
    spectral: 'M3.0V', absMag: 10.89, planets: 2,
    blurb: 'A nearby red dwarf in Draco with two planets, one of them Neptune-like.',
  },
  {
    id: 'gliese674', name: 'Gliese 674', ra: 17.4778, dec: -46.8936, dist: 14.81,
    spectral: 'M2.5V', absMag: 11.09, planets: 1,
    blurb: 'An active red dwarf with a Neptune-mass planet on a 4.7-day orbit.',
  },
  {
    id: 'gj1002', name: 'GJ 1002', ra: 0.1119, dec: -7.5325, dist: 15.81,
    spectral: 'M5.5V', absMag: 15.41, planets: 2,
    blurb: 'Two Earth-mass planets, both in the habitable zone of a very faint, very quiet red dwarf.',
  },
  {
    id: 'gliese876', name: 'Gliese 876', ra: 22.8881, dec: -14.2558, dist: 15.25,
    spectral: 'M3.5V', absMag: 11.78, planets: 4, notable: true,
    blurb: 'The first red dwarf found to host a giant planet, and home to a rare three-body orbital resonance — its inner planets lock into a 1:2:4 rhythm.',
    facts: [{ label: 'Resonance', value: 'Laplace 1:2:4 chain' }],
  },
  {
    id: '40-eri', name: '40 Eridani (Keid)', ra: 4.2544, dec: -7.6392, dist: 16.26,
    spectral: 'K0.5V', absMag: 5.92, appMag: 4.43, planets: 1,
    blurb: 'A triple system — orange dwarf, white dwarf and red dwarf — and the easiest white dwarf to see in a small telescope. Star Trek placed Vulcan here.',
  },
  {
    id: '70-oph', name: '70 Ophiuchi', ra: 18.0908, dec: 2.5, dist: 16.6,
    spectral: 'K0V', absMag: 5.5,
    blurb: 'A bright binary of orange dwarfs with an 88-year orbit, a favourite of amateur observers.',
  },
  {
    id: 'altair', name: 'Altair', ra: 19.8464, dec: 8.8683, dist: 16.73,
    spectral: 'A7V', absMag: 2.22, appMag: 0.76, notable: true,
    blurb: 'Spinning so fast — one turn in nine hours — that it is visibly squashed, 25% wider at the equator than pole to pole. One corner of the Summer Triangle.',
    facts: [{ label: 'Rotation', value: '~9 hours; flattened by 25%' }],
  },
  {
    id: 'sigma-dra', name: 'Sigma Draconis', ra: 19.5394, dec: 69.6611, dist: 18.8,
    spectral: 'K0V', absMag: 5.87,
    blurb: 'A quiet orange dwarf often listed among the better nearby targets for a habitable planet search.',
  },
  {
    id: 'eta-cas', name: 'Eta Cassiopeiae', ra: 0.8183, dec: 57.815, dist: 19.33,
    spectral: 'F9V', absMag: 4.59,
    blurb: 'A Sun-like star paired with an orange dwarf, orbiting every 480 years.',
  },
  {
    id: '82-eri', name: '82 Eridani', ra: 3.3322, dec: -43.0678, dist: 19.71,
    spectral: 'G6V', absMag: 5.35, planets: 3,
    blurb: 'An old, metal-poor Sun-like star with at least three super-Earths.',
  },
  {
    id: 'delta-pav', name: 'Delta Pavonis', ra: 20.1456, dec: -66.1819, dist: 19.89,
    spectral: 'G8IV', absMag: 4.62,
    blurb: 'A Sun-like star just beginning to leave the main sequence — a preview of our own future, and often named as a prime target for interstellar study.',
  },
  {
    id: 'vega', name: 'Vega', ra: 18.6156, dec: 38.7837, dist: 25.04,
    spectral: 'A0V', absMag: 0.58, appMag: 0.03, notable: true,
    blurb: 'The zero point of the magnitude system, and the first star ever photographed. A dusty debris disc surrounds it. In 12,000 years precession will make it the pole star again.',
    facts: [
      { label: 'Luminosity', value: '40 × the Sun' },
      { label: 'Historic', value: 'First star photographed, 1850' },
    ],
  },
  {
    id: 'fomalhaut', name: 'Fomalhaut', ra: 22.9608, dec: -29.6222, dist: 25.13,
    spectral: 'A3V', absMag: 1.72, appMag: 1.16, notable: true,
    blurb: 'Encircled by a sharp-edged ring of dust and debris that Webb has resolved into three nested belts — a planetary system still under construction.',
    facts: [{ label: 'Debris belts', value: 'Three nested rings, imaged by JWST' }],
  },
  {
    id: 'trappist1', name: 'TRAPPIST-1', ra: 23.1081, dec: -5.0414, dist: 40.66,
    spectral: 'M8V', absMag: 18.4, planets: 7, notable: true,
    blurb: 'Seven Earth-sized planets around a star barely larger than Jupiter, three or four of them temperate — the most planets found in one habitable-zone-rich system. All seven would fit well inside Mercury\'s orbit.',
    facts: [
      { label: 'Planets', value: '7, all roughly Earth-sized' },
      { label: 'System size', value: 'Smaller than Mercury\'s orbit' },
      { label: 'Star radius', value: '12% of the Sun' },
    ],
  },
]

const starIndex = new Map(STARS.map((s) => [s.id, s]))
export const getStar = (id: string): Star | undefined => starIndex.get(id)
