import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ARMS, DISC_RADIUS, LANDMARKS, SUN_GALACTIC_RADIUS } from '../data/galaxy'
import { galacticToVec3 } from '../lib/astro'
import { armGrowth, buildMilkyWay } from '../render/galaxyGeometry'
import { Label } from '../render/Label'
import { useLevelId } from '../render/LevelContext'
import { CircleRing } from '../render/OrbitPath'
import { Starfield } from '../render/Starfield'
import { createStarPointsMaterial, starPointsGeometry } from '../render/StarPointsMaterial'
import { fadeFor, useNav } from '../state/navigation'

/** One scene unit is 1,000 light years. */

/**
 * The Milky Way seen from outside — which no one has ever done. Roughly
 * 90,000 points stand in for a few hundred billion stars, laid out on
 * logarithmic arms with a bar, a bulge and a halo. The Sun is marked at
 * 26,000 light years out in the Orion Arm.
 */
export default function MilkyWayLevel() {
  const showLabels = useNav((s) => s.showLabels)
  const select = useNav((s) => s.select)
  const selection = useNav((s) => s.selectionByLevel.galaxy)

  // Galactic longitude zero points from the Sun toward the galactic centre,
  // and galacticToVec3 maps l=0 to +x. With the centre at the origin, that
  // fixes the Sun on the -x axis — otherwise every landmark placed by
  // galactic coordinates lands in the wrong part of the disc.
  const sunPos = useMemo<[number, number, number]>(
    () => [-SUN_GALACTIC_RADIUS, 0.02, 0],
    [],
  )

  return (
    <>
      <Starfield count={2_000} radius={1_400} intensity={0.35} />
      <GalaxyCloud />

      {/* Sagittarius A* at the centre. */}
      <group>
        {/* A dark core inside a bright accretion glow, rather than a big
            black disc punched out of the bulge. */}
        <mesh onClick={() => select({ id: 'sgr-a', kind: 'landmark' })}>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh raycast={() => null} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 1.5, 48]} />
          <meshBasicMaterial
            color="#ffcf6b"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        {showLabels && (
          <Label
            position={[0, 2.6, 0]}
            selected={selection?.id === 'sgr-a'}
            onClick={() => select({ id: 'sgr-a', kind: 'landmark' })}
          >
            Sagittarius A*
          </Label>
        )}
      </group>

      {/* Where we are. The whole point of the level. */}
      <group position={sunPos}>
        <mesh onClick={() => select({ id: 'sol', kind: 'star' })}>
          <sphereGeometry args={[0.55, 14, 14]} />
          <meshBasicMaterial color="#ffe9a8" />
        </mesh>
        <mesh raycast={() => null}>
          <ringGeometry args={[1.6, 1.9, 48]} />
          <meshBasicMaterial color="#ffd166" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
        {showLabels && (
          <Label position={[0, 1.4, 0]} selected={selection?.id === 'sol'} onClick={() => select({ id: 'sol', kind: 'star' })}>
            The Sun — you are here
          </Label>
        )}
      </group>

      {/* The Sun's orbit around the galactic centre: one lap per 230 Myr. */}
      <CircleRing radius={SUN_GALACTIC_RADIUS} colour="#ffd166" opacity={0.17} dashed width={0.8} />
      <CircleRing radius={DISC_RADIUS} colour="#5a74aa" opacity={0.12} width={0.8} />

      {LANDMARKS.filter((l) => l.size > 0 && l.id !== 'sgr-a').map((l) => {
        // Landmark positions are given relative to the Sun, so offset them.
        const rel = galacticToVec3(l.l, l.b, l.distFromSun / 1_000)
        const p: [number, number, number] = [
          sunPos[0] + rel.x,
          sunPos[1] + rel.y,
          sunPos[2] + rel.z,
        ]
        return (
          <group key={l.id} position={p}>
            <mesh onClick={() => select({ id: l.id, kind: 'landmark' })}>
              <sphereGeometry args={[Math.max(l.size * 0.45, 0.45), 14, 14]} />
              <meshBasicMaterial
                color={l.colour}
                transparent
                opacity={0.55}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            {showLabels && (l.notable || selection?.id === l.id) && (
              <Label
                position={[0, l.size * 0.7 + 0.6, 0]}
                selected={selection?.id === l.id}
                onClick={() => select({ id: l.id, kind: 'landmark' })}
                dim={!l.notable}
              >
                {l.name}
              </Label>
            )}
          </group>
        )
      })}

      {showLabels &&
        ARMS.map((arm) => {
          const theta = arm.startAngle + arm.sweep * 0.93
          const r = arm.rStart * Math.exp(armGrowth(arm) * 0.93 * arm.sweep)
          if (r > DISC_RADIUS) return null
          return (
            <Label key={arm.id} position={[Math.cos(theta) * r, 1.2, Math.sin(theta) * r]} dim>
              {arm.name}
            </Label>
          )
        })}
    </>
  )
}

function GalaxyCloud() {
  const levelId = useLevelId()
  const ref = useRef<THREE.Points>(null)
  const buffers = useMemo(() => buildMilkyWay(), [])
  const geo = useMemo(
    () => starPointsGeometry(buffers.position, buffers.colour, buffers.size),
    [buffers],
  )
  const mat = useMemo(() => createStarPointsMaterial(300), [])

  useFrame((_, delta) => {
    mat.uniforms.uFade.value = fadeFor(levelId)
    // The disc turns, slowly. A full lap would take 230 million years.
    if (ref.current) ref.current.rotation.y += delta * 0.006
  })

  return <points ref={ref} geometry={geo} material={mat} raycast={() => null} frustumCulled={false} />
}
