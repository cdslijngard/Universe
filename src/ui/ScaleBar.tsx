import { useFrame, useThree } from '@react-three/fiber'
import type { PerspectiveCamera } from 'three'
import { useRef } from 'react'
import { metresPerUnitFor } from '../data/scales'
import { getBody } from '../data/bodies'
import { useNav } from '../state/navigation'

/**
 * Measures the true physical width of what is on screen. Across twenty
 * orders of magnitude this is the only honest anchor the user has: the
 * geometry is compressed at nearly every level, but this number never is.
 * Lives inside the Canvas; the bar that displays it does not.
 */
export function ScaleProbe({ onChange }: { onChange: (metres: number) => void }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const current = useNav((s) => s.current)
  const focusBody = useNav((s) => s.focusBody)
  const last = useRef(0)

  useFrame(() => {
    const cam = camera as PerspectiveCamera
    const dist = cam.position.length()
    // Visible width at the distance of the origin, in scene units.
    const halfHeight = Math.tan((cam.fov * Math.PI) / 360) * dist
    const widthUnits = halfHeight * 2 * (size.width / size.height)
    const metres = widthUnits * metresPerUnitFor(current, getBody(focusBody)?.radius)
    // Only push to React when it changes meaningfully.
    if (Math.abs(Math.log10(metres / (last.current || 1))) > 0.004) {
      last.current = metres
      onChange(metres)
    }
  })

  return null
}
