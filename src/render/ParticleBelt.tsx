import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { fadeFor } from '../state/navigation'
import { useLevelId } from './LevelContext'
import { mulberry32 } from './Starfield'

interface Props {
  /** Inner and outer radius in scene units. */
  inner: number
  outer: number
  count: number
  colour: string
  /** Vertical thickness as a fraction of mean radius. */
  thickness: number
  /** Inclination spread in degrees — widens the torus into a wedge. */
  spread?: number
  size?: number
  opacity?: number
  seed?: number
  /** Radians per second of bulk rotation. */
  spin?: number
}

/**
 * A torus of instanced points: the asteroid belt, the Kuiper belt, the
 * scattered disc, the Oort cloud. Bodies cluster toward the middle of the
 * band the way real populations do, rather than spreading uniformly.
 */
export function ParticleBelt({
  inner,
  outer,
  count,
  colour,
  thickness,
  spread = 0,
  size = 0.05,
  opacity = 0.85,
  seed = 1,
  spin = 0.004,
}: Props) {
  const levelId = useLevelId()
  const groupRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.PointsMaterial>(null)

  const geo = useMemo(() => {
    const rand = mulberry32(seed * 7919 + 13)
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const base = new THREE.Color(colour)
    const mid = (inner + outer) / 2

    for (let i = 0; i < count; i++) {
      // Triangular bias toward the middle of the band.
      const u = (rand() + rand()) / 2
      const r = inner + u * (outer - inner)
      const a = rand() * Math.PI * 2

      // Inclination spread: a few percent sit well off the plane.
      const incl = (rand() - 0.5) * (spread * Math.PI) / 180
      const y = Math.sin(incl) * r + (rand() - 0.5) * thickness * mid

      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(a) * r

      // Vary brightness so the band has texture rather than reading flat.
      const b = 0.45 + Math.pow(rand(), 1.8) * 0.85
      col[i * 3] = base.r * b
      col[i * 3 + 1] = base.g * b
      col[i * 3 + 2] = base.b * b
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [inner, outer, count, colour, thickness, spread, seed])

  useFrame((state, delta) => {
    if (matRef.current) matRef.current.opacity = fadeFor(levelId) * opacity
    if (groupRef.current) groupRef.current.rotation.y += delta * spin
    void state
  })

  return (
    <points ref={groupRef} geometry={geo} raycast={() => null} frustumCulled={false}>
      <pointsMaterial
        ref={matRef}
        size={size}
        sizeAttenuation
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
