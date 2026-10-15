import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, lazy, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { level, type LevelId } from '../data/scales'
import { LevelContext } from '../render/LevelContext'
import { activeLevels, clock, scaleFor, useNav } from '../state/navigation'

const BodyLevel = lazy(() => import('./BodyLevel'))
const SystemLevel = lazy(() => import('./SystemLevel'))
const SolarSystemLevel = lazy(() => import('./SolarSystemLevel'))
const KuiperLevel = lazy(() => import('./KuiperLevel'))
const LocalStarsLevel = lazy(() => import('./LocalStarsLevel'))
const MilkyWayLevel = lazy(() => import('./MilkyWayLevel'))
const LocalGroupLevel = lazy(() => import('./LocalGroupLevel'))
const CosmicWebLevel = lazy(() => import('./CosmicWebLevel'))

const LEVEL_COMPONENTS: Record<LevelId, React.ComponentType> = {
  body: BodyLevel,
  system: SystemLevel,
  solar: SolarSystemLevel,
  kuiper: KuiperLevel,
  stars: LocalStarsLevel,
  galaxy: MilkyWayLevel,
  localgroup: LocalGroupLevel,
  cosmic: CosmicWebLevel,
}

/** Applies the transition scale to one level's whole subtree. */
function LevelGroup({ id }: { id: LevelId }) {
  const groupRef = useRef<THREE.Group>(null)
  const Component = LEVEL_COMPONENTS[id]

  useFrame(() => {
    if (groupRef.current) {
      const s = scaleFor(id)
      groupRef.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={groupRef}>
      <LevelContext.Provider value={id}>
        <Suspense fallback={null}>
          <Component />
        </Suspense>
      </LevelContext.Provider>
    </group>
  )
}

/**
 * Mounts the current level, plus the outgoing one while a transition runs,
 * and advances the transition clock. Also eases the camera between the two
 * levels' default framings.
 */
export function LevelHost() {
  const current = useNav((s) => s.current)
  const transition = useNav((s) => s.transition)
  const endTransition = useNav((s) => s.endTransition)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera

  const targetFov = useRef(level(current).camera.fov)

  useEffect(() => {
    targetFov.current = level(current).camera.fov
  }, [current])

  useFrame(() => {
    if (transition) {
      const elapsed = performance.now() - transition.startedAt
      clock.t = Math.min(1, elapsed / transition.duration)
      if (clock.t >= 1) endTransition()
    }
    // Ease the field of view toward the level's own framing.
    const fov = camera.fov + (targetFov.current - camera.fov) * 0.12
    if (Math.abs(fov - camera.fov) > 0.002) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  })

  const levels = activeLevels(current, transition)

  return (
    <>
      {levels.map((id) => (
        <LevelGroup key={id} id={id} />
      ))}
    </>
  )
}
