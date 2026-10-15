import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { fadeFor } from '../state/navigation'
import { useLevelId } from './LevelContext'

/** A simple hash-based PRNG so the sky is identical on every visit. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STAR_TINTS = [
  [0.70, 0.78, 1.0],
  [0.85, 0.90, 1.0],
  [1.0, 1.0, 1.0],
  [1.0, 0.95, 0.85],
  [1.0, 0.86, 0.68],
  [1.0, 0.76, 0.56],
]

interface Props {
  count?: number
  radius?: number
  /** Overall brightness, so inner levels can sit against a quieter sky. */
  intensity?: number
}

/**
 * The background sky. Drawn on a large shell with depth writing off, so it
 * sits behind everything regardless of level scale.
 */
export function Starfield({ count = 3_200, radius = 900, intensity = 1 }: Props) {
  const levelId = useLevelId()
  const matRef = useRef<THREE.PointsMaterial>(null)

  const geo = useMemo(() => {
    const rand = mulberry32(0x5eed)
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const size = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Uniform on the sphere — naive lat/lon sampling clumps at the poles.
      const u = rand() * 2 - 1
      const theta = rand() * Math.PI * 2
      const r = Math.sqrt(1 - u * u)
      pos[i * 3] = r * Math.cos(theta) * radius
      pos[i * 3 + 1] = u * radius
      pos[i * 3 + 2] = r * Math.sin(theta) * radius

      const tint = STAR_TINTS[Math.floor(rand() * STAR_TINTS.length)]
      // Magnitudes are heavily skewed toward the faint end.
      const mag = Math.pow(rand(), 2.8)
      const b = 0.25 + mag * 0.85
      col[i * 3] = tint[0] * b
      col[i * 3 + 1] = tint[1] * b
      col[i * 3 + 2] = tint[2] * b
      size[i] = 0.6 + mag * 3.4
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    return g
  }, [count, radius])

  useFrame(() => {
    if (matRef.current) matRef.current.opacity = fadeFor(levelId) * intensity
  })

  return (
    <points geometry={geo} raycast={() => null} frustumCulled={false}>
      <pointsMaterial
        ref={matRef}
        size={radius * 0.0028}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        opacity={intensity}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
