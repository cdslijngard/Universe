import { AU, EARTH_MASS, KM, MLY } from '../lib/constants'
import { formatDistance, formatMass, formatPeriod, formatTemp } from '../lib/format'
import { spectralTemp } from '../lib/astro'
import type { Selection } from '../state/navigation'
import { getBody } from './bodies'
import { CMB_TRUE_DISTANCE, OBSERVABLE_UNIVERSE, COSMIC_BLURB, WEB_NODES } from './cosmicWeb'
import { LANDMARKS, MILKY_WAY_BLURB, MILKY_WAY_FACTS } from './galaxy'
import { LOCAL_GROUP, LOCAL_GROUP_BLURB, LOCAL_GROUP_FACTS } from './localGroup'
import { BELTS, OUTER_MARKERS, PROBES, probeDistanceAU, SHELLS } from './outerSystem'
import { getStar } from './stars'
import type { Fact } from './types'

export interface Described {
  name: string
  kind: string
  blurb: string
  facts: Fact[]
  /** Relative size bar: 0–1 against a sensible reference for the kind. */
  sizeBar?: { label: string; value: number; caption: string }
}

const KIND_LABELS: Record<string, string> = {
  star: 'Star',
  planet: 'Planet',
  dwarf: 'Dwarf planet',
  moon: 'Moon',
  belt: 'Belt',
  boundary: 'Boundary',
  probe: 'Spacecraft',
  galaxy: 'Galaxy',
  cluster: 'Cluster',
  structure: 'Structure',
  nebula: 'Nebula',
}

/**
 * Turns any selection — a planet, a probe, a supercluster — into the rows
 * the info panel renders. Derived facts (gravity in g, mass in Earths,
 * live probe distance) are computed here rather than duplicated in the data.
 */
export function describe(sel: Selection | undefined): Described | null {
  if (!sel) return null

  // --- Bodies ------------------------------------------------------------
  const body = getBody(sel.id)
  if (body) {
    const facts: Fact[] = []
    facts.push({ label: 'Radius', value: `${(body.radius / KM).toLocaleString('en-US', { maximumFractionDigits: 0 })} km` })
    if (body.mass) {
      facts.push({ label: 'Mass', value: formatMass(body.mass) })
      if (body.kind !== 'star') {
        facts.push({
          label: 'Mass vs Earth',
          value: `${(body.mass / EARTH_MASS).toPrecision(3)} ×`,
        })
      }
    }
    if (body.gravity) {
      facts.push({ label: 'Surface gravity', value: `${body.gravity.toFixed(2)} m/s² · ${(body.gravity / 9.807).toFixed(2)} g` })
    }
    if (body.temp) facts.push({ label: 'Mean temperature', value: formatTemp(body.temp) })
    if (body.appearance.day !== undefined) {
      facts.push({ label: 'Rotation period', value: formatPeriod(body.appearance.day) })
    }
    if (body.appearance.tilt !== undefined) {
      facts.push({ label: 'Axial tilt', value: `${body.appearance.tilt}°` })
    }
    if (body.orbit) {
      const parent = body.parent ? getBody(body.parent) : undefined
      facts.push({
        label: parent ? `Distance from ${parent.name}` : 'Semi-major axis',
        value: body.kind === 'moon'
          ? `${(body.orbit.a * AU / KM).toLocaleString('en-US', { maximumFractionDigits: 0 })} km`
          : `${body.orbit.a.toFixed(3)} AU`,
      })
      facts.push({ label: 'Orbital period', value: formatPeriod(body.orbit.period) })
      if (body.orbit.e > 0.0001) {
        facts.push({ label: 'Eccentricity', value: body.orbit.e.toFixed(4) })
      }
      if (Math.abs(body.orbit.i) > 0.01) {
        facts.push({ label: 'Orbital inclination', value: `${Math.abs(body.orbit.i).toFixed(2)}°` })
      }
    }
    if (body.discovery?.year) {
      facts.push({
        label: 'Discovered',
        value: body.discovery.by ? `${body.discovery.year} · ${body.discovery.by}` : String(body.discovery.year),
      })
    }

    return {
      name: body.name,
      kind: KIND_LABELS[body.kind] ?? body.kind,
      blurb: body.blurb,
      facts: [...(body.facts ?? []), ...facts],
      sizeBar:
        body.kind === 'star'
          ? undefined
          : {
              label: 'Size vs Earth',
              value: Math.min(body.radius / 6.371e6 / 12, 1),
              caption: `${(body.radius / 6.371e6).toPrecision(3)} × Earth's radius`,
            },
    }
  }

  // --- Stars -------------------------------------------------------------
  const star = getStar(sel.id)
  if (star) {
    const facts: Fact[] = []
    if (star.dist > 0) {
      facts.push({ label: 'Distance', value: `${star.dist.toFixed(2)} light years` })
      facts.push({ label: 'Light travel time', value: `${star.dist.toFixed(1)} years` })
    }
    facts.push({ label: 'Spectral type', value: star.spectral })
    facts.push({ label: 'Effective temperature', value: `≈ ${spectralTemp(star.spectral).toLocaleString('en-US')} K` })
    facts.push({ label: 'Absolute magnitude', value: star.absMag.toFixed(2) })
    if (star.appMag !== undefined) {
      facts.push({
        label: 'Apparent magnitude',
        value: `${star.appMag.toFixed(2)}${star.appMag > 6 ? ' — invisible to the eye' : ''}`,
      })
    }
    if (star.planets) facts.push({ label: 'Known planets', value: String(star.planets) })

    return {
      name: star.name,
      kind: 'Star',
      blurb: star.blurb,
      facts: [...(star.facts ?? []), ...facts],
    }
  }

  // --- Belts, shells, probes, outer markers ------------------------------
  const belt = BELTS.find((b) => b.id === sel.id)
  if (belt) {
    return {
      name: belt.name,
      kind: 'Belt',
      blurb: belt.blurb,
      facts: [
        ...(belt.facts ?? []),
        { label: 'Inner edge', value: `${belt.inner} AU` },
        { label: 'Outer edge', value: `${belt.outer} AU` },
        { label: 'Width', value: formatDistance((belt.outer - belt.inner) * AU) },
      ],
    }
  }

  const shell = SHELLS.find((s) => s.id === sel.id)
  if (shell) {
    const lightHours = (shell.radius * AU) / 2.998e8 / 3600
    // Anything past the heliosphere is thousands of scene units out and is
    // drawn symbolically, so the panel has to say which it is looking at.
    const symbolic = shell.radius > 500
    return {
      name: shell.name,
      kind: 'Boundary',
      blurb: shell.blurb,
      facts: [
        ...(shell.facts ?? []),
        { label: 'Radius', value: `${shell.radius.toLocaleString('en-US')} AU` },
        {
          label: 'Light travel time',
          value: lightHours > 48
            ? `${(lightHours / 24 / 365.25).toFixed(2)} years`
            : `${lightHours.toFixed(1)} hours`,
        },
        ...(symbolic
          ? [{ label: 'Shown', value: 'Not to scale — it would be 10,000 units out' }]
          : []),
      ],
    }
  }

  const probe = PROBES.find((p) => p.id === sel.id)
  if (probe) {
    const au = probeDistanceAU(probe)
    const lightHours = (au * AU) / 2.998e8 / 3600
    return {
      name: probe.name,
      kind: 'Spacecraft',
      blurb: probe.blurb,
      facts: [
        ...(probe.facts ?? []),
        { label: 'Distance now', value: `${au.toFixed(1)} AU · ${formatDistance(au * AU)}` },
        { label: 'Signal delay', value: `${lightHours.toFixed(1)} hours each way` },
        {
          label: 'Time since launch',
          value: `${((Date.now() - new Date(probe.launched).getTime()) / (365.25 * 86_400_000)).toFixed(1)} years`,
        },
      ],
    }
  }

  const marker = OUTER_MARKERS.find((m) => m.id === sel.id)
  if (marker) {
    return {
      name: marker.name,
      kind: 'Distant object',
      blurb: marker.blurb,
      facts: [
        ...(marker.facts ?? []),
        { label: 'Current distance', value: `${marker.distAU} AU` },
        { label: 'Radius', value: `${marker.radiusKm} km` },
      ],
    }
  }

  // --- Galactic landmarks -------------------------------------------------
  const landmark = LANDMARKS.find((l) => l.id === sel.id)
  if (landmark) {
    return {
      name: landmark.name,
      kind: KIND_LABELS[landmark.kind] ?? 'Landmark',
      blurb: landmark.blurb,
      facts: [
        ...(landmark.facts ?? []),
        ...(landmark.distFromSun > 0
          ? [{ label: 'Distance from the Sun', value: `${landmark.distFromSun.toLocaleString('en-US')} light years` }]
          : []),
      ],
    }
  }

  // --- Local Group members ------------------------------------------------
  const member = LOCAL_GROUP.find((m) => m.id === sel.id)
  if (member) {
    return {
      name: member.name,
      kind: 'Galaxy',
      blurb: member.blurb,
      facts: [
        ...(member.facts ?? []),
        ...(member.dist > 0
          ? [{ label: 'Distance', value: `${member.dist.toFixed(3)} Mly · ${formatDistance(member.dist * MLY)}` }]
          : []),
        { label: 'Diameter', value: `${member.diameter.toLocaleString('en-US')} thousand ly` },
        { label: 'Morphology', value: MORPHOLOGY[member.shape] },
      ],
      sizeBar: {
        label: 'Size vs the Milky Way',
        value: Math.min(member.diameter / 220, 1),
        caption: `${(member.diameter / 100).toPrecision(2)} × the Milky Way's diameter`,
      },
    }
  }

  // --- Large-scale structure ----------------------------------------------
  const node = WEB_NODES.find((n) => n.id === sel.id)
  if (node) {
    return {
      name: node.name,
      kind: KIND_LABELS[node.kind] ?? 'Structure',
      blurb: node.blurb,
      facts: [
        ...(node.facts ?? []),
        ...(node.dist > 0 ? [{ label: 'Distance', value: `${node.dist.toLocaleString('en-US')} Mly` }] : []),
        { label: 'Diameter', value: `${node.diameter.toLocaleString('en-US')} Mly` },
        { label: 'Light crossing time', value: `${node.diameter.toLocaleString('en-US')} million years` },
      ],
    }
  }

  if (sel.id === 'cmb') {
    return {
      name: 'Cosmic microwave background',
      kind: 'Horizon',
      blurb:
        'Not an edge in space but a limit in time: the oldest light there is, released 380,000 years after the Big Bang when the universe cooled enough to turn transparent. It surrounds us in every direction, and everything we can ever observe lies inside it. Drawn here at a symbolic radius — its true comoving distance is 46.5 billion light years, far outside everything else at this level.',
      facts: [
        ...OBSERVABLE_UNIVERSE,
        { label: 'True comoving distance', value: formatDistance(CMB_TRUE_DISTANCE) },
      ],
    }
  }

  return null
}

const MORPHOLOGY: Record<string, string> = {
  spiral: 'Spiral',
  barred: 'Barred spiral',
  elliptical: 'Elliptical',
  irregular: 'Irregular',
  dwarf: 'Dwarf spheroidal',
}

/** Shown when nothing is selected: context for the level itself. */
export const LEVEL_OVERVIEW: Record<
  string,
  { title: string; blurb: string; facts: Fact[] }
> = {
  body: {
    title: 'A single world',
    blurb:
      'One body, lit from a fixed direction so the terminator holds still while you orbit it. Everything you see is generated procedurally — the bands, the clouds and the storms are running simulations of noise, not photographs, so they keep moving.',
    facts: [{ label: 'Tip', value: 'Drag to orbit · double-click a moon to visit it' }],
  },
  system: {
    title: 'A planetary system',
    blurb:
      'A planet with its moons in their real orbits, inheriting its axial tilt — which is why the Uranian system lies on its side. Orbital radii are compressed by default so the innermost and outermost moons both fit; switch to true scale to see how much of this picture is empty space.',
    facts: [{ label: 'Tip', value: 'Toggle true scale to see the real spacing' }],
  },
  solar: {
    title: 'The solar system',
    blurb:
      "The Sun and its planets at their actual positions for today, computed from J2000 orbital elements. Distances from the Sun are compressed by a power law — at true scale Mercury would sit inside a pixel of the Sun while Neptune left the screen entirely.",
    facts: [
      { label: 'Planets', value: '8, plus 5 recognised dwarf planets' },
      { label: 'Age', value: '4.568 billion years' },
      { label: 'Width to Neptune', value: '60 AU — 8.3 light hours' },
      { label: 'Tip', value: "Positions are live — they match today's sky" },
    ],
  },
  kuiper: {
    title: 'The Kuiper belt and the heliosphere',
    blurb:
      "Beyond Neptune the solar system does not end so much as thin out. A belt of ice, a scattered disc, two boundaries where the solar wind gives way to interstellar space — and three spacecraft still moving outward through it, their distances here computed from their measured speeds.",
    facts: [
      { label: 'Kuiper belt', value: '30–50 AU' },
      { label: 'Heliopause', value: '~123 AU' },
      { label: 'Oort cloud', value: 'Out to 100,000 AU — 1.6 light years' },
    ],
  },
  stars: {
    title: 'The stellar neighbourhood',
    blurb:
      'Every star here is placed from its real right ascension, declination and parallax distance, so this is the actual three-dimensional arrangement of our neighbours. Most are red dwarfs far too faint to see from Earth — the familiar bright stars are the rare exceptions.',
    facts: [
      { label: 'Nearest star', value: 'Proxima Centauri, 4.25 ly' },
      { label: 'Stars within 25 ly', value: 'Around 100, mostly red dwarfs' },
      { label: 'Tip', value: 'The rings mark 5, 10, 15, 20 and 25 light years' },
    ],
  },
  galaxy: {
    title: 'The Milky Way',
    blurb: MILKY_WAY_BLURB,
    facts: MILKY_WAY_FACTS,
  },
  localgroup: {
    title: 'The Local Group',
    blurb: LOCAL_GROUP_BLURB,
    facts: LOCAL_GROUP_FACTS,
  },
  cosmic: {
    title: 'The cosmic web',
    blurb: COSMIC_BLURB,
    facts: OBSERVABLE_UNIVERSE,
  },
}
