import { KM, SUN_MASS, SUN_RADIUS } from '../lib/constants'
import { simpleElements } from '../lib/kepler'
import type { Body } from './types'

const AU_KM = 1.495_978_707e8
/** Moon semi-major axes are published in km; the app works in AU throughout. */
const auFromKm = (km: number) => km / AU_KM

export const SUN: Body = {
  id: 'sun',
  name: 'Sun',
  kind: 'star',
  radius: SUN_RADIUS,
  mass: SUN_MASS,
  gravity: 274,
  temp: 5_772,
  appearance: {
    surface: 'star',
    palette: ['#ff6a00', '#ffb03a', '#ffe08a', '#fffdf0'],
    emissive: true,
    day: 25.05,
    tilt: 7.25,
    atmosphere: { colour: '#ffcb6b', strength: 2.4 },
  },
  blurb:
    'A G-type main-sequence star holding 99.86% of the mass of the solar system. It fuses about 600 million tonnes of hydrogen every second, and the light reaching you now left its surface eight minutes ago — but took tens of thousands of years to struggle out of the core before that.',
  facts: [
    { label: 'Spectral type', value: 'G2V' },
    { label: 'Core temperature', value: '15.7 million K' },
    { label: 'Luminosity', value: '3.828 × 10²⁶ W' },
    { label: 'Age', value: '4.6 billion years' },
    { label: 'Composition', value: '73% hydrogen, 25% helium' },
  ],
  notable: true,
}

export const PLANETS: Body[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    kind: 'planet',
    parent: 'sun',
    radius: 2_439.7 * KM,
    mass: 3.3011e23,
    gravity: 3.7,
    temp: 440,
    orbit: {
      a: 0.38709927, e: 0.20563593, i: 7.00497902,
      node: 48.33076593, periLon: 77.45779628, meanLon: 252.2503235,
      period: 87.9691,
    },
    appearance: {
      surface: 'rocky',
      palette: ['#4a443f', '#7d746b', '#a89d92', '#cfc5ba'],
      roughness: 0.95,
      day: 58.646,
      tilt: 0.034,
    },
    blurb:
      'The smallest planet and the fastest, rounding the Sun every 88 days. It turns on its axis just three times for every two orbits, so a single solar day on Mercury lasts two Mercurian years. With almost no atmosphere to move heat around, noon and midnight differ by nearly 600 °C.',
    facts: [
      { label: 'Temperature range', value: '−173 °C to 427 °C' },
      { label: 'Solar day', value: '176 Earth days' },
      { label: 'Moons', value: 'None' },
      { label: 'Atmosphere', value: 'Trace sodium, oxygen, hydrogen' },
    ],
    notable: true,
  },
  {
    id: 'venus',
    name: 'Venus',
    kind: 'planet',
    parent: 'sun',
    radius: 6_051.8 * KM,
    mass: 4.8675e24,
    gravity: 8.87,
    temp: 737,
    orbit: {
      a: 0.72333566, e: 0.00677672, i: 3.39467605,
      node: 76.67984255, periLon: 131.60246718, meanLon: 181.9790995,
      period: 224.701,
    },
    appearance: {
      surface: 'terrestrial',
      palette: ['#8a6033', '#c89a5b', '#e8c38a', '#f6e4c0'],
      clouds: 0.95,
      roughness: 0.25,
      day: -243.025,
      tilt: 177.36,
      atmosphere: { colour: '#ffd79a', strength: 1.5 },
    },
    blurb:
      'Earth-sized and hellish. A runaway greenhouse of carbon dioxide holds the surface at 464 °C — hotter than Mercury despite being twice as far from the Sun — under 92 atmospheres of pressure. Its clouds of sulphuric acid circle the planet in four days while the solid body takes 243 days to turn, backwards.',
    facts: [
      { label: 'Surface pressure', value: '92 × Earth' },
      { label: 'Rotation', value: 'Retrograde, 243 days' },
      { label: 'Moons', value: 'None' },
      { label: 'Atmosphere', value: '96% CO₂, clouds of H₂SO₄' },
    ],
    notable: true,
  },
  {
    id: 'earth',
    name: 'Earth',
    kind: 'planet',
    parent: 'sun',
    radius: 6_371.0 * KM,
    mass: 5.9722e24,
    gravity: 9.807,
    temp: 288,
    orbit: {
      a: 1.00000261, e: 0.01671123, i: -0.00001531,
      node: 0.0, periLon: 102.93768193, meanLon: 100.46457166,
      period: 365.256363,
    },
    appearance: {
      surface: 'terrestrial',
      palette: ['#0a2d5c', '#14538c', '#3c7d3a', '#c8b48a'],
      clouds: 0.55,
      roughness: 0.5,
      day: 0.99726968,
      tilt: 23.44,
      atmosphere: { colour: '#6fb4ff', strength: 1.9 },
    },
    blurb:
      'The only place known to carry life, and the only planet whose surface holds liquid water, rock and ice at once. Its 23.4° tilt gives us seasons; its unusually large Moon steadies that tilt over millions of years. Seventy-one percent of the surface is ocean.',
    facts: [
      { label: 'Moons', value: '1' },
      { label: 'Surface water', value: '71% of the surface' },
      { label: 'Atmosphere', value: '78% N₂, 21% O₂' },
      { label: 'Age', value: '4.54 billion years' },
      { label: 'Magnetic field', value: 'Strong, dipolar' },
    ],
    notable: true,
  },
  {
    id: 'mars',
    name: 'Mars',
    kind: 'planet',
    parent: 'sun',
    radius: 3_389.5 * KM,
    mass: 6.4171e23,
    gravity: 3.721,
    temp: 210,
    orbit: {
      a: 1.52371034, e: 0.0933941, i: 1.84969142,
      node: 49.55953891, periLon: -23.94362959, meanLon: -4.55343205,
      period: 686.98,
    },
    appearance: {
      surface: 'rocky',
      palette: ['#5a2412', '#9c4a24', '#c87a44', '#e8c0a0'],
      roughness: 0.7,
      clouds: 0.1,
      day: 1.02595676,
      tilt: 25.19,
      atmosphere: { colour: '#e0a070', strength: 0.8 },
    },
    blurb:
      'A cold desert with the tallest volcano and the deepest canyon in the solar system: Olympus Mons rises 22 km, and Valles Marineris runs 4,000 km along the equator. Dry riverbeds and clay minerals say it once had standing water. Its thin air still raises dust storms that can swallow the whole planet.',
    facts: [
      { label: 'Moons', value: '2 — Phobos and Deimos' },
      { label: 'Olympus Mons', value: '22 km tall' },
      { label: 'Atmosphere', value: '95% CO₂, 0.6% of Earth pressure' },
      { label: 'Day length', value: '24 h 37 min' },
    ],
    notable: true,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    kind: 'planet',
    parent: 'sun',
    radius: 69_911 * KM,
    mass: 1.8982e27,
    gravity: 24.79,
    temp: 165,
    orbit: {
      a: 5.202887, e: 0.04838624, i: 1.30439695,
      node: 100.47390909, periLon: 14.72847983, meanLon: 34.39644051,
      period: 4_332.589,
    },
    appearance: {
      surface: 'gasGiant',
      palette: ['#9a6334', '#c69163', '#e3c69c', '#f8efdc'],
      roughness: 0.85,
      day: 0.41354,
      flattening: 0.06487,
      tilt: 3.13,
      storm: { lat: -0.24, size: 0.23, colour: '#c0562f', name: 'Great Red Spot' },
      atmosphere: { colour: '#e8c89a', strength: 1.1 },
      rings: { innerR: 1.72, outerR: 2.55, opacity: 0.07 },
    },
    blurb:
      'More massive than every other planet combined, and the fastest rotator — one day lasts under ten hours, which is what flattens it visibly at the poles and shears its clouds into bands. The Great Red Spot is a storm wider than Earth that has been turning for at least 190 years.',
    facts: [
      { label: 'Moons', value: '95 confirmed' },
      { label: 'Day length', value: '9 h 56 min' },
      { label: 'Great Red Spot', value: '~16,000 km across' },
      { label: 'Composition', value: '90% hydrogen, 10% helium' },
      { label: 'Magnetic field', value: '20,000 × Earth' },
    ],
    notable: true,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    kind: 'planet',
    parent: 'sun',
    radius: 58_232 * KM,
    mass: 5.6834e26,
    gravity: 10.44,
    temp: 134,
    orbit: {
      a: 9.53667594, e: 0.05386179, i: 2.48599187,
      node: 113.66242448, periLon: 92.59887831, meanLon: 49.95424423,
      period: 10_759.22,
    },
    appearance: {
      surface: 'gasGiant',
      palette: ['#8a6a35', '#c9a469', '#e6cf9e', '#f8edd2'],
      roughness: 0.45,
      day: 0.44401,
      flattening: 0.09796,
      tilt: 26.73,
      atmosphere: { colour: '#f0dca8', strength: 1.0 },
      rings: {
        innerR: 1.11, outerR: 2.33, opacity: 0.95,
        // Cassini Division and Encke Gap, in planetary radii.
        gaps: [[1.95, 2.02], [2.21, 2.215]],
      },
    },
    blurb:
      'The least dense planet in the solar system — it would float in water — wearing the brightest ring system, 280,000 km wide and in places only ten metres thick. The rings are almost pure water ice, and they are young and temporary. At the north pole sits a six-sided jet stream 30,000 km across.',
    facts: [
      { label: 'Moons', value: '274 confirmed' },
      { label: 'Mean density', value: '0.687 g/cm³ — floats in water' },
      { label: 'Ring span', value: '~280,000 km' },
      { label: 'Ring thickness', value: '10 m to 1 km' },
      { label: 'Hexagon', value: '30,000 km polar jet stream' },
    ],
    notable: true,
  },
  {
    id: 'uranus',
    name: 'Uranus',
    kind: 'planet',
    parent: 'sun',
    radius: 25_362 * KM,
    mass: 8.681e25,
    gravity: 8.69,
    temp: 76,
    orbit: {
      a: 19.18916464, e: 0.04725744, i: 0.77263783,
      node: 74.01692503, periLon: 170.9542763, meanLon: 313.23810451,
      period: 30_685.4,
    },
    appearance: {
      surface: 'iceGiant',
      palette: ['#1d6a73', '#3fa3ab', '#8fd3d8', '#d8f2f4'],
      roughness: 0.12,
      day: -0.71833,
      flattening: 0.02293,
      tilt: 97.77,
      atmosphere: { colour: '#9ce0e6', strength: 1.4 },
      rings: { innerR: 1.64, outerR: 2.0, opacity: 0.25, tilt: 0 },
    },
    blurb:
      'An ice giant tipped onto its side — its axis leans 98°, so it rolls along its orbit and each pole gets 42 years of continuous sunlight followed by 42 years of dark. Methane in the upper atmosphere absorbs red light, which is what leaves it that flat cyan. It is the coldest planet, bottoming out at −224 °C.',
    facts: [
      { label: 'Moons', value: '28 confirmed' },
      { label: 'Axial tilt', value: '97.8° — rotates on its side' },
      { label: 'Coldest recorded', value: '−224 °C' },
      { label: 'Season length', value: '21 Earth years' },
      { label: 'Discovered', value: '1781 by William Herschel' },
    ],
    discovery: { year: 1781, by: 'William Herschel' },
    notable: true,
  },
  {
    id: 'neptune',
    name: 'Neptune',
    kind: 'planet',
    parent: 'sun',
    radius: 24_622 * KM,
    mass: 1.02413e26,
    gravity: 11.15,
    temp: 72,
    orbit: {
      a: 30.06992276, e: 0.00859048, i: 1.77004347,
      node: 131.78422574, periLon: 44.96476227, meanLon: -55.12002969,
      period: 60_189.0,
    },
    appearance: {
      surface: 'iceGiant',
      palette: ['#14306e', '#2a56b0', '#5a8ede', '#bcd6f7'],
      roughness: 0.3,
      day: 0.67125,
      flattening: 0.01708,
      tilt: 28.32,
      storm: { lat: -0.3, size: 0.18, colour: '#102a63', name: 'Great Dark Spot' },
      atmosphere: { colour: '#7fb0ff', strength: 1.6 },
      rings: { innerR: 1.7, outerR: 2.5, opacity: 0.1 },
    },
    blurb:
      'The farthest planet, and the windiest place in the solar system — its storms run at 2,100 km/h, close to the speed of sound on Earth. It was the first planet found by mathematics rather than by looking: Le Verrier predicted where it should be from the way Uranus was being pulled off course, and it was there.',
    facts: [
      { label: 'Moons', value: '16 confirmed' },
      { label: 'Fastest winds', value: '2,100 km/h' },
      { label: 'Orbital period', value: '164.8 Earth years' },
      { label: 'Discovered', value: '1846, predicted by Le Verrier' },
      { label: 'Internal heat', value: 'Radiates 2.6 × what it absorbs' },
    ],
    discovery: { year: 1846, by: 'Johann Galle, predicted by Urbain Le Verrier' },
    notable: true,
  },
]

export const MOONS: Body[] = [
  {
    id: 'moon', name: 'The Moon', kind: 'moon', parent: 'earth',
    radius: 1_737.4 * KM, mass: 7.342e22, gravity: 1.62, temp: 220,
    orbit: simpleElements(auFromKm(384_400), 27.321661, 5.145, 20),
    appearance: {
      surface: 'rocky', palette: ['#3a3a3c', '#6e6e72', '#9a9a9e', '#cfcfd2'],
      roughness: 1.0, day: 27.321661, tilt: 6.68,
    },
    blurb:
      'Unusually large for the planet it circles — a quarter of Earth\'s diameter — and almost certainly the debris of a collision with a Mars-sized body 4.5 billion years ago. Tidal locking means it shows us one face forever, and it is drifting away at 3.8 cm a year.',
    facts: [
      { label: 'Distance', value: '384,400 km' },
      { label: 'Receding at', value: '3.8 cm per year' },
      { label: 'Surface gravity', value: '16.5% of Earth' },
      { label: 'Day length', value: '29.5 Earth days' },
    ],
    notable: true,
  },
  {
    id: 'phobos', name: 'Phobos', kind: 'moon', parent: 'mars',
    radius: 11.267 * KM, mass: 1.0659e16, gravity: 0.0057,
    orbit: simpleElements(auFromKm(9_376), 0.318910, 1.08, 0),
    appearance: { surface: 'rocky', palette: ['#38322c', '#5e564c', '#817869', '#a89d8c'], roughness: 1.0, day: 0.31891 },
    blurb:
      'A 22-kilometre lump of rock orbiting closer to its planet than any other moon in the solar system — so close that it rises and sets twice a day as seen from Mars, and so close that tides are dragging it down. In roughly 50 million years it will break apart into a ring.',
    facts: [{ label: 'Orbital period', value: '7 h 39 min' }, { label: 'Fate', value: 'Breakup in ~50 Myr' }],
    discovery: { year: 1877, by: 'Asaph Hall' },
  },
  {
    id: 'deimos', name: 'Deimos', kind: 'moon', parent: 'mars',
    radius: 6.2 * KM, mass: 1.4762e15, gravity: 0.003,
    orbit: simpleElements(auFromKm(23_463), 1.263, 1.79, 140),
    appearance: { surface: 'rocky', palette: ['#403a33', '#655c51', '#8b8070', '#aaa092'], roughness: 1.0, day: 1.263 },
    blurb: 'The smaller and outer of Mars\'s two moons, just 12 km across and so faint it took a dedicated search to find. Both are probably captured asteroids, or debris from an ancient impact.',
    discovery: { year: 1877, by: 'Asaph Hall' },
  },
  {
    id: 'io', name: 'Io', kind: 'moon', parent: 'jupiter',
    radius: 1_821.6 * KM, mass: 8.931938e22, gravity: 1.796, temp: 110,
    orbit: simpleElements(auFromKm(421_700), 1.769138, 0.05, 0),
    appearance: {
      surface: 'volcanic', palette: ['#5e3a08', '#b8831b', '#e8c948', '#fff4b0'],
      roughness: 0.6, day: 1.769138,
      storm: { lat: 0.1, size: 0.1, colour: '#ff4400', name: 'Loki Patera' },
    },
    blurb:
      'The most volcanically active world known. Squeezed between Jupiter\'s gravity and the pull of Europa and Ganymede, its interior is kneaded until it melts — over 400 active volcanoes throw sulphur plumes 500 km above the surface, repaving it faster than craters can accumulate.',
    facts: [
      { label: 'Active volcanoes', value: '400+' },
      { label: 'Plume height', value: 'up to 500 km' },
      { label: 'Surface age', value: 'Under 1 million years' },
    ],
    discovery: { year: 1610, by: 'Galileo Galilei' },
    notable: true,
  },
  {
    id: 'europa', name: 'Europa', kind: 'moon', parent: 'jupiter',
    radius: 1_560.8 * KM, mass: 4.799844e22, gravity: 1.314, temp: 102,
    orbit: simpleElements(auFromKm(671_034), 3.551181, 0.47, 60),
    appearance: {
      surface: 'icy', palette: ['#8a6a4a', '#cbb49a', '#e8dcc8', '#fbf6ee'],
      roughness: 0.2, day: 3.551181,
    },
    blurb:
      'The smoothest object in the solar system: a shell of water ice laced with rust-coloured cracks, hiding an ocean of liquid salt water perhaps 100 km deep. That ocean likely holds twice as much water as all of Earth\'s, and it is one of the best places to look for life.',
    facts: [
      { label: 'Subsurface ocean', value: '~100 km deep' },
      { label: 'Water volume', value: '2 × all of Earth\'s oceans' },
      { label: 'Surface', value: 'Water ice, almost no craters' },
    ],
    discovery: { year: 1610, by: 'Galileo Galilei' },
    notable: true,
  },
  {
    id: 'ganymede', name: 'Ganymede', kind: 'moon', parent: 'jupiter',
    radius: 2_634.1 * KM, mass: 1.4819e23, gravity: 1.428, temp: 110,
    orbit: simpleElements(auFromKm(1_070_412), 7.154553, 0.2, 150),
    appearance: {
      surface: 'icy', palette: ['#4a4438', '#7d7363', '#a9a394', '#d6d2c4'],
      roughness: 0.7, day: 7.154553,
    },
    blurb:
      'The largest moon in the solar system — bigger than Mercury — and the only one with a magnetic field of its own, generated by a molten iron core. It too hides a salt-water ocean, buried under 150 km of ice.',
    facts: [
      { label: 'Diameter', value: '5,268 km — larger than Mercury' },
      { label: 'Magnetic field', value: 'Only moon with its own' },
    ],
    discovery: { year: 1610, by: 'Galileo Galilei' },
    notable: true,
  },
  {
    id: 'callisto', name: 'Callisto', kind: 'moon', parent: 'jupiter',
    radius: 2_410.3 * KM, mass: 1.075938e23, gravity: 1.235, temp: 134,
    orbit: simpleElements(auFromKm(1_882_709), 16.689017, 0.19, 240),
    appearance: {
      surface: 'rocky', palette: ['#2e2a26', '#56504a', '#7e766c', '#ada498'],
      roughness: 1.0, day: 16.689017,
    },
    blurb:
      'The most heavily cratered surface in the solar system — geologically dead for four billion years, which makes it a preserved record of the early bombardment. It sits outside Jupiter\'s worst radiation, which has made it a favoured site for a future crewed base.',
    discovery: { year: 1610, by: 'Galileo Galilei' },
  },
  {
    id: 'titan', name: 'Titan', kind: 'moon', parent: 'saturn',
    radius: 2_574.73 * KM, mass: 1.3452e23, gravity: 1.352, temp: 94,
    orbit: simpleElements(auFromKm(1_221_870), 15.945, 0.33, 30),
    appearance: {
      surface: 'terrestrial', palette: ['#6b4a16', '#a8762a', '#d4a74e', '#f0d898'],
      clouds: 0.85, roughness: 0.3, day: 15.945,
      atmosphere: { colour: '#e8b85c', strength: 2.1 },
    },
    blurb:
      'The only moon with a substantial atmosphere — thicker than Earth\'s — and the only other world with liquid on its surface. At −179 °C that liquid is methane and ethane, falling as rain, carving river channels and pooling into lakes and seas near the poles.',
    facts: [
      { label: 'Surface pressure', value: '1.45 × Earth' },
      { label: 'Atmosphere', value: '95% nitrogen, 5% methane' },
      { label: 'Lakes', value: 'Liquid methane and ethane' },
      { label: 'Landed on', value: '2005, Huygens probe' },
    ],
    discovery: { year: 1655, by: 'Christiaan Huygens' },
    notable: true,
  },
  {
    id: 'enceladus', name: 'Enceladus', kind: 'moon', parent: 'saturn',
    radius: 252.1 * KM, mass: 1.080318e20, gravity: 0.113, temp: 75,
    orbit: simpleElements(auFromKm(237_948), 1.370218, 0.02, 200),
    appearance: {
      surface: 'icy', palette: ['#9fb6c4', '#cfdde6', '#eaf2f7', '#ffffff'],
      roughness: 0.15, day: 1.370218,
    },
    blurb:
      'A 500-kilometre ball of ice that sprays its ocean into space. More than a hundred geysers at the south pole vent water vapour, salts and organic molecules hundreds of kilometres up — feeding Saturn\'s E ring, and letting Cassini sample a subsurface sea by flying through the plume.',
    facts: [
      { label: 'Geysers', value: '100+ at the south pole' },
      { label: 'Albedo', value: '0.99 — most reflective body known' },
      { label: 'Plume contents', value: 'Water, salts, organics, silica' },
    ],
    discovery: { year: 1789, by: 'William Herschel' },
    notable: true,
  },
  {
    id: 'mimas', name: 'Mimas', kind: 'moon', parent: 'saturn',
    radius: 198.2 * KM, mass: 3.7493e19, gravity: 0.064,
    orbit: simpleElements(auFromKm(185_539), 0.942, 1.57, 90),
    appearance: { surface: 'icy', palette: ['#7d8894', '#aab5c0', '#d2dae2', '#f2f6fa'], roughness: 0.9, day: 0.942 },
    blurb: 'Dominated by Herschel, an impact crater 130 km wide on a moon only 396 km across — a third of its diameter. The impact came close to shattering it, and gives it an uncanny resemblance to a certain battle station.',
    facts: [{ label: 'Herschel crater', value: '130 km — a third of its width' }],
    discovery: { year: 1789, by: 'William Herschel' },
  },
  {
    id: 'iapetus', name: 'Iapetus', kind: 'moon', parent: 'saturn',
    radius: 734.5 * KM, mass: 1.805635e21, gravity: 0.223,
    orbit: simpleElements(auFromKm(3_560_820), 79.3215, 15.47, 300),
    appearance: { surface: 'icy', palette: ['#241c14', '#6e6252', '#bdb2a0', '#efe9dc'], roughness: 0.8, day: 79.3215 },
    blurb: 'Two-faced: one hemisphere is as dark as coal, the other as bright as snow, because it sweeps up dust on its leading side as it goes. A 1,300-km ridge runs along its equator like a seam, 20 km tall, and nobody is sure why.',
    facts: [{ label: 'Equatorial ridge', value: '1,300 km long, 20 km tall' }],
    discovery: { year: 1671, by: 'Giovanni Cassini' },
  },
  {
    id: 'titania', name: 'Titania', kind: 'moon', parent: 'uranus',
    radius: 788.4 * KM, mass: 3.4e21, gravity: 0.367,
    orbit: simpleElements(auFromKm(435_910), 8.706, 0.34, 0),
    appearance: { surface: 'icy', palette: ['#4a3a34', '#786459', '#a99484', '#d6c8bc'], roughness: 0.6, day: 8.706 },
    blurb: 'The largest Uranian moon, scarred by canyons up to 1,600 km long where its interior froze and expanded, cracking the crust from within.',
    discovery: { year: 1787, by: 'William Herschel' },
  },
  {
    id: 'miranda', name: 'Miranda', kind: 'moon', parent: 'uranus',
    radius: 235.8 * KM, mass: 6.59e19, gravity: 0.079,
    orbit: simpleElements(auFromKm(129_390), 1.413, 4.34, 70),
    appearance: { surface: 'icy', palette: ['#53535c', '#80808c', '#aaaab4', '#d8d8de'], roughness: 0.75, day: 1.413 },
    blurb: 'A jumble of mismatched terrain that looks assembled rather than formed, including Verona Rupes — a cliff up to 20 km high, the tallest known in the solar system. Stepping off it, you would fall for twelve minutes.',
    facts: [{ label: 'Verona Rupes', value: 'Up to 20 km tall cliff' }],
    discovery: { year: 1948, by: 'Gerard Kuiper' },
  },
  {
    id: 'triton', name: 'Triton', kind: 'moon', parent: 'neptune',
    radius: 1_353.4 * KM, mass: 2.1389e22, gravity: 0.779, temp: 38,
    orbit: simpleElements(auFromKm(354_759), -5.876854, 156.885, 110),
    appearance: {
      surface: 'icy', palette: ['#8c6a70', '#c2a3a6', '#e2d2d0', '#f8f2f0'],
      roughness: 0.35, day: 5.876854,
      atmosphere: { colour: '#cfd8ff', strength: 0.5 },
    },
    blurb:
      'The only large moon that orbits backwards, which means Neptune did not form it — it captured it, almost certainly from the Kuiper belt. Tides are slowly dragging it inward. At −235 °C it is one of the coldest places measured, and still it has nitrogen geysers.',
    facts: [
      { label: 'Orbit', value: 'Retrograde — captured, not formed' },
      { label: 'Surface temperature', value: '−235 °C' },
      { label: 'Fate', value: 'Tidal breakup into a ring' },
    ],
    discovery: { year: 1846, by: 'William Lassell' },
    notable: true,
  },
  {
    id: 'charon', name: 'Charon', kind: 'moon', parent: 'pluto',
    radius: 606 * KM, mass: 1.586e21, gravity: 0.288, temp: 53,
    orbit: simpleElements(auFromKm(19_591), 6.3872, 0.08, 0),
    appearance: { surface: 'icy', palette: ['#44403e', '#6f6a66', '#9b9490', '#c9c2bc'], roughness: 0.5, day: 6.3872 },
    blurb:
      'Half Pluto\'s diameter — so large, relatively, that the two orbit a point in the empty space between them. They are tidally locked to each other, each hanging motionless in the other\'s sky. Its north pole is stained red by tholins that drifted over from Pluto.',
    facts: [{ label: 'Size ratio', value: '51% of Pluto\'s diameter' }, { label: 'Barycentre', value: 'Outside both bodies' }],
    discovery: { year: 1978, by: 'James Christy' },
  },
]

export const DWARFS: Body[] = [
  {
    id: 'pluto', name: 'Pluto', kind: 'dwarf', parent: 'sun',
    radius: 1_188.3 * KM, mass: 1.303e22, gravity: 0.62, temp: 44,
    orbit: { a: 39.48211675, e: 0.2488273, i: 17.14001206, node: 110.30393684, periLon: 224.06891629, meanLon: 238.92903833, period: 90_560 },
    appearance: {
      surface: 'icy', palette: ['#4a3528', '#937258', '#d8b89a', '#f4e6d4'],
      roughness: 0.4, day: 6.3872, tilt: 122.53,
      atmosphere: { colour: '#9fb8e0', strength: 0.6 },
    },
    blurb:
      'Reclassified as a dwarf planet in 2006, and then revealed by New Horizons in 2015 as anything but inert: a 1,000-km heart of nitrogen ice that convects and resurfaces itself, water-ice mountains 3 km tall, and a blue haze of hydrocarbons. Its orbit is tilted 17° and crosses inside Neptune\'s.',
    facts: [
      { label: 'Moons', value: '5 — Charon, Nix, Hydra, Kerberos, Styx' },
      { label: 'Orbital period', value: '248 Earth years' },
      { label: 'Sputnik Planitia', value: 'Convecting nitrogen-ice plain' },
      { label: 'Visited', value: '2015, New Horizons' },
    ],
    discovery: { year: 1930, by: 'Clyde Tombaugh' },
    notable: true,
  },
  {
    id: 'ceres', name: 'Ceres', kind: 'dwarf', parent: 'sun',
    radius: 469.7 * KM, mass: 9.3839e20, gravity: 0.27, temp: 168,
    orbit: { a: 2.7675, e: 0.0758, i: 10.59, node: 80.33, periLon: 153.33, meanLon: 95.99, period: 1_681.63 },
    appearance: { surface: 'rocky', palette: ['#3e3a35', '#696259', '#948c80', '#c4bbaf'], roughness: 0.85, day: 0.3781 },
    blurb:
      'The largest object in the asteroid belt and the only dwarf planet in the inner solar system, holding a quarter of the belt\'s entire mass. Bright carbonate deposits in Occator crater are salt left behind by briny water reaching the surface geologically recently.',
    facts: [
      { label: 'Share of belt mass', value: '~25%' },
      { label: 'Occator crater', value: 'Bright carbonate salt deposits' },
      { label: 'Visited', value: '2015–2018, Dawn' },
    ],
    discovery: { year: 1801, by: 'Giuseppe Piazzi' },
    notable: true,
  },
  {
    id: 'eris', name: 'Eris', kind: 'dwarf', parent: 'sun',
    radius: 1_163 * KM, mass: 1.6466e22, gravity: 0.82, temp: 42,
    orbit: { a: 67.864, e: 0.43607, i: 44.04, node: 35.95, periLon: 187.15, meanLon: 204.16, period: 203_830 },
    appearance: { surface: 'icy', palette: ['#5a5a62', '#9a9aa4', '#cdcdd6', '#f2f2f8'], roughness: 0.3, day: 15.79 },
    blurb:
      'Slightly smaller than Pluto but 27% more massive, and the discovery that forced the question of what a planet is — the 2006 reclassification is its doing. Its steeply tilted orbit carries it out to 97 AU, where its nitrogen atmosphere freezes onto the ground.',
    facts: [
      { label: 'Aphelion', value: '97.5 AU' },
      { label: 'Orbital period', value: '558 Earth years' },
      { label: 'Moon', value: 'Dysnomia' },
    ],
    discovery: { year: 2005, by: 'Mike Brown, Chad Trujillo, David Rabinowitz' },
    notable: true,
  },
  {
    id: 'makemake', name: 'Makemake', kind: 'dwarf', parent: 'sun',
    radius: 715 * KM, mass: 3.1e21, gravity: 0.4, temp: 30,
    orbit: { a: 45.43, e: 0.159, i: 29.0, node: 79.38, periLon: 374.36, meanLon: 165.51, period: 111_845 },
    appearance: { surface: 'icy', palette: ['#6b4a42', '#a8827a', '#d4b8b0', '#f0e2dc'], roughness: 0.35, day: 0.9511 },
    blurb: 'A bright, reddish Kuiper belt object covered in methane ice, and the second-brightest after Pluto. It has one small dark moon, nicknamed MK 2.',
    discovery: { year: 2005, by: 'Mike Brown et al.' },
  },
  {
    id: 'haumea', name: 'Haumea', kind: 'dwarf', parent: 'sun',
    radius: 816 * KM, mass: 4.006e21, gravity: 0.44, temp: 32,
    orbit: { a: 43.13, e: 0.19126, i: 28.21, node: 122.16, periLon: 361.1, meanLon: 206.77, period: 103_774 },
    appearance: { surface: 'icy', palette: ['#5a5a54', '#908e86', '#c2c0b6', '#eceade'], roughness: 0.3, day: 0.16389 },
    blurb:
      'Spinning once every four hours — so fast that it has been pulled into an ellipsoid roughly twice as long as it is wide. It is the only Kuiper belt object known to have a ring, plus two moons, and the collision that spun it up left a family of icy fragments behind.',
    facts: [
      { label: 'Rotation period', value: '3.9 hours' },
      { label: 'Shape', value: 'Ellipsoid, ~2,100 × 1,000 km' },
      { label: 'Rings', value: 'One, discovered 2017' },
    ],
    discovery: { year: 2004, by: 'Mike Brown / José Luis Ortiz' },
  },
]

export const ALL_BODIES: Body[] = [SUN, ...PLANETS, ...MOONS, ...DWARFS]

const bodyIndex = new Map(ALL_BODIES.map((b) => [b.id, b]))
export const getBody = (id: string): Body | undefined => bodyIndex.get(id)
export const moonsOf = (id: string): Body[] => MOONS.filter((m) => m.parent === id)
