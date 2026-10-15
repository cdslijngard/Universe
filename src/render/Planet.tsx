import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Body } from '../data/types'
import { fadeFor } from '../state/navigation'
import { useLevelId } from './LevelContext'
import { createPlanetMaterial, seedFor } from './shaders/planetMaterial'
import {
  createAtmosphereMaterial,
  createCloudMaterial,
  createRingMaterial,
} from './shaders/shellMaterials'

interface Props {
  body: Body
  /** Rendered radius in scene units. */
  radius: number
  position?: [number, number, number]
  /** Direction to the Sun, world space. */
  sunDir?: THREE.Vector3
  /** Multiplier on rotation speed, so distant views still show motion. */
  spin?: number
  segments?: number
  onClick?: (e: THREE.Event) => void
  onDoubleClick?: (e: THREE.Event) => void
  onPointerOver?: () => void
  onPointerOut?: () => void
  /** Draw the ring system, if the body has one. */
  rings?: boolean
  children?: React.ReactNode
}

const DEG = Math.PI / 180

/**
 * One procedurally shaded world: surface, optional cloud shell, limb glow and
 * rings. Nothing is textured — every appearance comes out of the shaders.
 */
export function Planet({
  body,
  radius,
  position = [0, 0, 0],
  sunDir,
  spin = 1,
  segments = 96,
  onClick,
  onDoubleClick,
  onPointerOver,
  onPointerOut,
  rings = true,
  children,
}: Props) {
  const levelId = useLevelId()
  const app = body.appearance
  const seed = useMemo(() => seedFor(body.id), [body.id])

  const surfaceRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)

  const surfaceMat = useMemo(() => createPlanetMaterial(app, seed), [app, seed])
  const cloudMat = useMemo(
    () => ((app.clouds ?? 0) > 0 ? createCloudMaterial(app, seed) : null),
    [app, seed],
  )
  const atmoMat = useMemo(
    () =>
      app.atmosphere
        ? createAtmosphereMaterial(app.atmosphere.colour, app.atmosphere.strength)
        : null,
    [app],
  )
  const ringMat = useMemo(() => (app.rings && rings ? createRingMaterial(app) : null), [app, rings])

  const ringGeo = useMemo(() => {
    if (!app.rings || !rings) return null
    const g = new THREE.RingGeometry(app.rings.innerR, app.rings.outerR, 192, 1)
    // RingGeometry is built in XY; lay it flat into the equatorial plane.
    g.rotateX(-Math.PI / 2)
    return g
  }, [app.rings, rings])

  // Sidereal rotation, scaled so that even a 243-day rotator visibly turns.
  const rotPerSecond = useMemo(() => {
    const days = app.day ?? 1
    const sign = Math.sign(days) || 1
    const mag = Math.abs(days)
    // Compress the enormous spread of rotation periods logarithmically.
    return (sign * 0.22) / (1 + Math.log10(1 + mag) * 1.8)
  }, [app.day])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const fade = fadeFor(levelId)
    const dir = sunDir ?? DEFAULT_SUN

    for (const m of [surfaceMat, cloudMat, atmoMat, ringMat]) {
      if (!m) continue
      if (m.uniforms.uTime) m.uniforms.uTime.value = t
      if (m.uniforms.uFade) m.uniforms.uFade.value = fade
      if (m.uniforms.uSunDir) (m.uniforms.uSunDir.value as THREE.Vector3).copy(dir)
    }

    if (surfaceRef.current) surfaceRef.current.rotation.y += delta * rotPerSecond * spin
    // The cloud deck runs a little ahead of the surface beneath it.
    if (cloudRef.current) cloudRef.current.rotation.y += delta * rotPerSecond * spin * 1.25

    if (ringMat) {
      ringMat.uniforms.uPlanetR.value = radius
      ;(ringMat.uniforms.uPlanetPos.value as THREE.Vector3).set(...position)
    }
  })

  const tilt = (app.tilt ?? 0) * DEG
  // Spin flattens a giant at the poles; rings and moons stay circular.
  const squash = 1 - (app.flattening ?? 0)

  return (
    <group position={position} rotation={[0, 0, tilt]}>
      <mesh
        ref={surfaceRef}
        material={surfaceMat}
        scale={[1, squash, 1]}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[radius, segments, Math.max(16, segments / 2)]} />
      </mesh>

      {cloudMat && (
        <mesh ref={cloudRef} material={cloudMat} scale={[1, squash, 1]} raycast={() => null}>
          <sphereGeometry args={[radius * 1.016, segments, Math.max(16, segments / 2)]} />
        </mesh>
      )}

      {atmoMat && (
        <mesh material={atmoMat} scale={[1, squash, 1]} raycast={() => null}>
          {/* Earth's atmosphere is ~1% of its radius; a 10% shell reads as a
              cartoon halo, so the glow sits just above the surface. */}
          <sphereGeometry args={[radius * 1.045, 64, 32]} />
        </mesh>
      )}

      {ringGeo && ringMat && (
        <mesh
          geometry={ringGeo}
          material={ringMat}
          scale={radius}
          raycast={() => null}
        />
      )}

      {children}
    </group>
  )
}

export const DEFAULT_SUN = new THREE.Vector3(1, 0.18, 0.45).normalize()
