import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { orbitPath, type Elements } from '../lib/kepler'
import { fadeFor } from '../state/navigation'
import { useLevelId } from './LevelContext'

/** drei's Line exposes its material; we drive opacity from the level fade. */
type LineRef = { material: THREE.Material & { opacity: number } }

interface Props {
  elements: Elements
  /** Scene units per AU. */
  scale: number
  colour?: string
  opacity?: number
  /** Tilt the whole orbit, e.g. into a planet's equatorial plane. */
  rotation?: [number, number, number]
  segments?: number
  width?: number
}

/** The traced path of an orbit, from the same elements that place the body. */
export function OrbitPath({
  elements,
  scale,
  colour = '#7f9ac4',
  opacity = 0.3,
  rotation,
  segments = 220,
  width = 1,
}: Props) {
  const levelId = useLevelId()
  const ref = useRef<LineRef>(null)

  const points = useMemo(
    () => orbitPath(elements, segments).map((p) => p.multiplyScalar(scale)),
    [elements, scale, segments],
  )

  useFrame(() => {
    if (ref.current) ref.current.material.opacity = fadeFor(levelId) * opacity
  })

  return (
    <Line
      ref={ref as never}
      points={points}
      color={colour}
      lineWidth={width}
      transparent
      opacity={opacity}
      depthWrite={false}
      rotation={rotation}
      raycast={() => null}
    />
  )
}

/** A plain circle in the XZ plane — for belts, shells and distance rings. */
export function CircleRing({
  radius,
  colour = '#5f7aa4',
  opacity = 0.25,
  segments = 180,
  rotation,
  width = 1,
  dashed = false,
}: {
  radius: number
  colour?: string
  opacity?: number
  segments?: number
  rotation?: [number, number, number]
  width?: number
  dashed?: boolean
}) {
  const levelId = useLevelId()
  const ref = useRef<LineRef>(null)

  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    return pts
  }, [radius, segments])

  useFrame(() => {
    if (ref.current) ref.current.material.opacity = fadeFor(levelId) * opacity
  })

  return (
    <Line
      ref={ref as never}
      points={points}
      color={colour}
      lineWidth={width}
      transparent
      opacity={opacity}
      depthWrite={false}
      rotation={rotation}
      dashed={dashed}
      dashSize={radius * 0.03}
      gapSize={radius * 0.02}
      raycast={() => null}
    />
  )
}
