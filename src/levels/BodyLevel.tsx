import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { getBody, moonsOf } from '../data/bodies'
import { Label } from '../render/Label'
import { Planet } from '../render/Planet'
import { Starfield } from '../render/Starfield'
import { useNav } from '../state/navigation'

const SUN_DIR = new THREE.Vector3(0.78, 0.22, 0.46).normalize()

/**
 * A portrait of one world: the body at unit radius, lit from a fixed
 * direction so the terminator stays put as you orbit it, with its larger
 * moons circling nearby for a sense of life.
 *
 * Satellite distances here are compressed for framing — Callisto's true
 * orbit is 27 planetary radii out, far off screen. The system level draws
 * the real geometry, and the info panel states the real figures.
 */
export default function BodyLevel() {
  const focusBody = useNav((s) => s.focusBody)
  const select = useNav((s) => s.select)
  const selection = useNav((s) => s.selectionByLevel.body)
  const showLabels = useNav((s) => s.showLabels)

  const body = getBody(focusBody) ?? getBody('earth')!
  const moons = useMemo(() => moonsOf(body.id).slice(0, 6), [body.id])

  return (
    <>
      <Starfield count={2_600} radius={420} intensity={0.75} />

      <Planet
        body={body}
        radius={1}
        sunDir={SUN_DIR}
        segments={160}
        onClick={() => select({ id: body.id, kind: 'body' })}
      />

      {moons.map((moon, i) => (
        <Satellite
          key={moon.id}
          index={i}
          total={moons.length}
          moonId={moon.id}
          parentRadius={body.radius}
          selected={selection?.id === moon.id}
          showLabel={showLabels && moons.length <= 5}
          onSelect={() => select({ id: moon.id, kind: 'body' })}
        />
      ))}
    </>
  )
}

interface SatelliteProps {
  index: number
  total: number
  moonId: string
  parentRadius: number
  selected: boolean
  showLabel: boolean
  onSelect: () => void
}

function Satellite({
  index,
  total,
  moonId,
  parentRadius,
  selected,
  showLabel,
  onSelect,
}: SatelliteProps) {
  const groupRef = useRef<THREE.Group>(null)
  const moon = getBody(moonId)!

  // Fan the moons out across a readable band, preserving their real ordering
  // but not their real spacing.
  const orbitR = 1.55 + (index / Math.max(1, total - 1 || 1)) * 1.15
  // Signed period carries the direction: Triton and Phobos really do go the
  // other way round, and the compression must not throw that away.
  const signedPeriod = moon.orbit?.period ?? 10
  const period = Math.max(Math.abs(signedPeriod), 0.05)
  const direction = signedPeriod < 0 ? -1 : 1
  const angularSpeed = (0.6 / Math.pow(period, 0.4)) * direction
  const inclination = ((index % 3) - 1) * 0.1
  const phase = (index / Math.max(total, 1)) * Math.PI * 2

  // Moons are drawn to true relative size against the parent, with a floor so
  // a 6 km rock like Deimos is still a visible speck.
  const radius = Math.max(0.012, (moon.radius / parentRadius) * 1.0)

  useFrame((state) => {
    if (!groupRef.current) return
    const a = phase + state.clock.elapsedTime * angularSpeed
    groupRef.current.position.set(
      Math.cos(a) * orbitR,
      Math.sin(a) * orbitR * inclination,
      Math.sin(a) * orbitR,
    )
  })

  return (
    <group ref={groupRef}>
      <Planet
        body={moon}
        radius={radius}
        sunDir={SUN_DIR}
        segments={32}
        rings={false}
        spin={2}
        onClick={onSelect}
      />
      {showLabel && (
        <Label position={[0, radius * 1.4 + 0.03, 0]} selected={selected} onClick={onSelect} dim>
          {moon.name}
        </Label>
      )}
    </group>
  )
}
