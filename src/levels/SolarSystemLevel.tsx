import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { DWARFS, PLANETS, SUN } from '../data/bodies'
import { BELTS } from '../data/outerSystem'
import type { Body } from '../data/types'
import { positionAt } from '../lib/kepler'
import { Label } from '../render/Label'
import { OrbitPath } from '../render/OrbitPath'
import { ParticleBelt } from '../render/ParticleBelt'
import { Planet } from '../render/Planet'
import { Starfield } from '../render/Starfield'
import { useNav } from '../state/navigation'

/**
 * Radial compression. Neptune sits 78 times farther out than Mercury, so a
 * linear plot leaves the inner planets in a dot at the centre. A power
 * mapping keeps all eight legible while preserving their ordering and the
 * visible eccentricity of each orbit.
 */
const RADIAL_EXP = 0.62
/** Chosen so Neptune lands at ~40 units, which the level's framing covers. */
const RADIAL_GAIN = 4.6
const compress = (au: number) => Math.pow(au, RADIAL_EXP) * RADIAL_GAIN

/** Planet discs need a floor, or Mercury is a single pixel next to the Sun. */
const bodyRadius = (b: Body) => {
  const earthRadii = b.radius / 6.371e6
  return 0.26 + Math.pow(earthRadii, 0.42) * 0.36
}

const CERES = DWARFS.find((d) => d.id === 'ceres')!
const PLUTO = DWARFS.find((d) => d.id === 'pluto')!

/**
 * The Sun and its planets at their real positions for today's date, computed
 * from J2000 elements. Orbits are drawn from the same elements, so a planet
 * always sits exactly on its own traced path.
 */
export default function SolarSystemLevel() {
  const showLabels = useNav((s) => s.showLabels)
  const trueScale = useNav((s) => s.trueScale)
  const select = useNav((s) => s.select)
  const enter = useNav((s) => s.enter)
  const selection = useNav((s) => s.selectionByLevel.solar)

  // True scale is a different kind of honest: Mercury vanishes, but you see
  // just how empty the outer system is.
  const scaleAu = (au: number) => (trueScale ? au * 1.35 : compress(au))
  const bodies = useMemo(() => [...PLANETS, CERES, PLUTO], [])

  return (
    <>
      <Starfield count={3_000} radius={620} intensity={0.8} />

      {/* The Sun lights everything here, so each planet gets its own
          direction vector pointing back at the origin. */}
      <Planet
        body={SUN}
        radius={1.3}
        segments={96}
        rings={false}
        onClick={() => select({ id: 'sun', kind: 'body' })}
      />
      <pointLight position={[0, 0, 0]} intensity={2} distance={0} />
      {showLabels && (
        <Label position={[0, 1.7, 0]} selected={selection?.id === 'sun'} onClick={() => select({ id: 'sun', kind: 'body' })}>
          Sun
        </Label>
      )}

      {BELTS.filter((b) => b.id === 'asteroid-belt').map((belt) => (
        <ParticleBelt
          key={belt.id}
          inner={scaleAu(belt.inner)}
          outer={scaleAu(belt.outer)}
          count={belt.count}
          colour={belt.colour}
          thickness={belt.thickness}
          spread={belt.spread}
          size={0.085}
          opacity={0.55}
          seed={3}
        />
      ))}

      {bodies.map((body, i) => (
        <PlanetInOrbit
          key={body.id}
          body={body}
          labelTier={i % 3}
          scaleAu={scaleAu}
          showLabel={showLabels}
          selected={selection?.id === body.id}
          onSelect={() => select({ id: body.id, kind: 'body' })}
          onEnter={() => enter({ id: body.id, kind: 'body' })}
        />
      ))}
    </>
  )
}

interface OrbitProps {
  body: Body
  scaleAu: (au: number) => number
  showLabel: boolean
  selected: boolean
  /** Staggers the label height so neighbouring planets do not collide. */
  labelTier: number
  onSelect: () => void
  onEnter: () => void
}

/** Seconds of wall time per Earth year, so the whole system visibly turns. */
const SECONDS_PER_YEAR = 14

function PlanetInOrbit({ body, scaleAu, showLabel, selected, labelTier, onSelect, onEnter }: OrbitProps) {
  const groupRef = useRef<THREE.Group>(null)
  const sunDir = useRef(new THREE.Vector3(1, 0, 0))

  // Rescale the semi-major axis but keep every other element, so the orbit
  // keeps its true eccentricity, inclination and orientation.
  const elements = useMemo(
    () => ({ ...body.orbit!, a: scaleAu(body.orbit!.a) }),
    [body.orbit, scaleAu],
  )

  const radius = bodyRadius(body)
  const isDwarf = body.kind === 'dwarf'

  useFrame((state) => {
    if (!groupRef.current) return
    const years = state.clock.elapsedTime / SECONDS_PER_YEAR
    const date = new Date(Date.now() + years * 365.25 * 86_400_000)
    const p = positionAt(elements, date)
    groupRef.current.position.copy(p)
    // Lit from the Sun at the origin.
    sunDir.current.copy(p).normalize()
  })

  return (
    <>
      <OrbitPath
        elements={elements}
        scale={1}
        colour={isDwarf ? '#6a7fa8' : '#7f9ac4'}
        opacity={isDwarf ? 0.18 : 0.3}
      />
      <group ref={groupRef}>
        <Planet
          body={body}
          radius={radius}
          sunDir={sunDir.current}
          segments={isDwarf ? 40 : 64}
          spin={3}
          onClick={onSelect}
          onDoubleClick={onEnter}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        />
        {showLabel && (
          <Label
            position={[0, radius * 1.3 + 0.2 + labelTier * 0.95, 0]}
            selected={selected}
            onClick={onSelect}
            dim={isDwarf}
          >
            {body.name}
          </Label>
        )}
      </group>
    </>
  )
}
