import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { getBody, moonsOf } from '../data/bodies'
import { AU, J2000 } from '../lib/constants'
import { positionAt, type Elements } from '../lib/kepler'
import { Label } from '../render/Label'
import { OrbitPath } from '../render/OrbitPath'
import { Planet } from '../render/Planet'
import { Starfield } from '../render/Starfield'
import { useNav } from '../state/navigation'
import type { Body } from '../data/types'

const SUN_DIR = new THREE.Vector3(0.82, 0.2, 0.4).normalize()

/** Where the innermost and outermost moon orbits land, in scene units. */
const INNER_EDGE = 2.8
const OUTER_EDGE = 10.5
/** The planet's own disc in compressed mode — a portrait, not a scale model. */
const PLANET_DISC = 1.45

/**
 * A planet and its moons in their real orbits. True scale puts Callisto 19
 * units out while Jupiter itself is only 0.7 units wide, so the default view
 * compresses the radial axis logarithmically — the toggle shows what that
 * compression is hiding.
 */
export default function SystemLevel() {
  const focusSystem = useNav((s) => s.focusSystem)
  const trueScale = useNav((s) => s.trueScale)
  const showLabels = useNav((s) => s.showLabels)
  const select = useNav((s) => s.select)
  const enter = useNav((s) => s.enter)
  const selection = useNav((s) => s.selectionByLevel.system)

  const planet = getBody(focusSystem) ?? getBody('earth')!
  const moons = useMemo(() => moonsOf(planet.id), [planet.id])

  /**
   * Scaling is normalised per system rather than fixed in physical units.
   * The Jovian system is 25 times wider than the Earth-Moon system, so one
   * shared unit either buries Earth's Moon in the middle or throws Callisto
   * off screen. Instead the outermost moon is pinned to a constant radius
   * and everything else is placed relative to it.
   */
  const { planetRadius, orbitOf, moonRadius } = useMemo(() => {
    const auRadii = moons.map((m) => m.orbit?.a ?? 0.001)
    const aMax = Math.max(...auRadii, 0.001)
    const aMin = Math.min(...auRadii, aMax)

    if (trueScale) {
      // Honest geometry: every length divided by the same number.
      const k = OUTER_EDGE / aMax
      const auPerMetre = 1 / AU
      return {
        planetRadius: Math.max(planet.radius * auPerMetre * k, 0.05),
        moonRadius: (m: Body) => Math.max(m.radius * auPerMetre * k, 0.035),
        orbitOf: (m: Body) => (m.orbit?.a ?? 0.001) * k,
      }
    }

    // Compressed: orbits spread by the log of their real distance, so the
    // ordering and the relative gaps survive but everything stays on screen.
    const span = Math.log10(aMax) - Math.log10(aMin)
    return {
      planetRadius: PLANET_DISC,
      moonRadius: (m: Body) =>
        THREE.MathUtils.clamp(Math.sqrt(m.radius / planet.radius) * PLANET_DISC * 0.6, 0.1, 0.5),
      orbitOf: (m: Body) => {
        const a = m.orbit?.a ?? 0.001
        if (span < 1e-6) return (INNER_EDGE + OUTER_EDGE) / 2
        const t = (Math.log10(a) - Math.log10(aMin)) / span
        return INNER_EDGE + t * (OUTER_EDGE - INNER_EDGE)
      },
    }
  }, [moons, planet, trueScale])

  return (
    <>
      <Starfield count={2_400} radius={300} intensity={0.7} />

      <Planet
        body={planet}
        radius={planetRadius}
        sunDir={SUN_DIR}
        segments={128}
        onClick={() => select({ id: planet.id, kind: 'body' })}
      />
      {showLabels && (
        <Label
          position={[0, planetRadius * 1.25, 0]}
          selected={selection?.id === planet.id}
          onClick={() => select({ id: planet.id, kind: 'body' })}
        >
          {planet.name}
        </Label>
      )}

      {moons.map((moon) => (
        <MoonInOrbit
          key={moon.id}
          moon={moon}
          planetTilt={planet.appearance.tilt ?? 0}
          orbitRadius={orbitOf(moon)}
          bodyRadius={moonRadius(moon)}
          showLabel={showLabels}
          selected={selection?.id === moon.id}
          onSelect={() => select({ id: moon.id, kind: 'body' })}
          onEnter={() => enter({ id: moon.id, kind: 'body' })}
        />
      ))}
    </>
  )
}

interface MoonProps {
  moon: Body
  planetTilt: number
  orbitRadius: number
  bodyRadius: number
  showLabel: boolean
  selected: boolean
  onSelect: () => void
  onEnter: () => void
}

const DEG = Math.PI / 180

function MoonInOrbit({
  moon,
  planetTilt,
  orbitRadius,
  bodyRadius,
  showLabel,
  selected,
  onSelect,
  onEnter,
}: MoonProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Moons orbit near their planet's equator, so the whole system inherits the
  // planet's axial tilt. This is why Uranus's moons circle it side-on.
  const systemTilt: [number, number, number] = [0, 0, planetTilt * DEG]

  // Rebuild the elements at the mapped radius so the drawn path and the moon
  // itself always agree, whichever scale mode is active.
  const elements: Elements = useMemo(
    () => ({
      a: orbitRadius,
      e: moon.orbit?.e ?? 0,
      i: moon.orbit?.i ?? 0,
      node: moon.orbit?.node ?? 0,
      periLon: moon.orbit?.periLon ?? 0,
      meanLon: moon.orbit?.meanLon ?? 0,
      period: moon.orbit?.period ?? 10,
    }),
    [moon.orbit, orbitRadius],
  )

  // Real periods span 7 hours to 79 days; compress so everything visibly
  // moves without the inner moons becoming a blur.
  const periodSeconds = Math.pow(Math.abs(elements.period), 0.55) * 7

  const radius = bodyRadius

  useFrame((state) => {
    if (!groupRef.current) return
    // Advance the date so one real revolution takes periodSeconds of wall
    // time, then let the same Kepler solver that drew the path place the moon.
    const revolutions = state.clock.elapsedTime / periodSeconds
    const date = new Date(J2000 + revolutions * elements.period * 86_400_000)
    groupRef.current.position.copy(positionAt(elements, date))
  })

  return (
    <group rotation={systemTilt}>
      <OrbitPath elements={elements} scale={1} opacity={0.22} colour="#86a0c8" />
      <group ref={groupRef}>
        <Planet
          body={moon}
          radius={radius}
          sunDir={SUN_DIR}
          segments={48}
          rings={false}
          spin={1.5}
          onClick={onSelect}
          onDoubleClick={onEnter}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        />
        {showLabel && (
          <Label
            position={[0, radius * 1.6 + 0.12, 0]}
            selected={selected}
            onClick={onSelect}
            dim={!selected}
          >
            {moon.name}
          </Label>
        )}
      </group>
    </group>
  )
}
