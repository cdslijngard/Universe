import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { level } from '../data/scales'
import { useNav } from '../state/navigation'

interface Props {
  controls: React.RefObject<OrbitControlsImpl | null>
}

/**
 * Each level has its own default framing, and OrbitControls would otherwise
 * carry the previous level's distance across the cut — leaving you buried
 * inside Earth when you step out to the planetary system. This eases the
 * orbit radius to the incoming level's distance while preserving whichever
 * direction the user was looking from.
 */
export function CameraRig({ controls }: Props) {
  const current = useNav((s) => s.current)
  const reducedMotion = useNav((s) => s.reducedMotion)
  const camera = useThree((s) => s.camera)

  const size = useThree((s) => s.size)
  const target = useRef(level(current).camera.distance)
  const snap = useRef(false)

  /**
   * The info panel covers the right of the screen. Rather than letting it
   * sit on top of whatever is selected, render a window shifted right, which
   * moves the subject left into the clear space. Only on viewports wide
   * enough for the panel to be a side panel rather than a sheet.
   */
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const panel = Math.min(368, size.width * 0.88)
    const wide = size.width >= 860
    if (wide) {
      cam.setViewOffset(size.width, size.height, panel * 0.42, 0, size.width, size.height)
    } else {
      cam.clearViewOffset()
    }
    cam.updateProjectionMatrix()
    return () => {
      cam.clearViewOffset()
      cam.updateProjectionMatrix()
    }
  }, [camera, size.width, size.height])

  useEffect(() => {
    target.current = level(current).camera.distance
    snap.current = reducedMotion
  }, [current, reducedMotion])

  useFrame(() => {
    const c = controls.current
    const cfg = level(current).camera

    // Widen the bounds before moving, so a tween that has to pass outside the
    // previous level's range is not clamped halfway.
    if (c) {
      c.minDistance = Math.min(cfg.min, camera.position.length())
      c.maxDistance = Math.max(cfg.max, camera.position.length())
    }

    const pivot = c?.target ?? ORIGIN
    const offset = camera.position.clone().sub(pivot)
    const d = offset.length()
    const want = target.current
    if (Math.abs(d - want) < want * 0.002) {
      if (c) {
        c.minDistance = cfg.min
        c.maxDistance = cfg.max
      }
      return
    }

    const next = snap.current ? want : d + (want - d) * 0.14
    camera.position.copy(pivot).add(offset.multiplyScalar(next / d))
    c?.update()
  })

  return null
}

const ORIGIN = new THREE.Vector3()
