import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { level } from './data/scales'
import { LevelHost } from './levels/LevelHost'
import { CameraRig } from './render/CameraRig'
import { useKeyboard } from './state/useKeyboard'
import { useNav } from './state/navigation'
import { Breadcrumb } from './ui/Breadcrumb'
import { InfoPanel } from './ui/InfoPanel'
import { LevelRail } from './ui/LevelRail'
import { ObjectList } from './ui/ObjectList'
import { OptionsBar } from './ui/OptionsBar'
import { ScaleProbe } from './ui/ScaleBar'
import { ScaleBar } from './ui/ScaleBarDom'
import { ZoomControls } from './ui/ZoomControls'

export function App() {
  const current = useNav((s) => s.current)
  const setReducedMotion = useNav((s) => s.setReducedMotion)
  const controls = useRef<OrbitControlsImpl>(null)
  const [span, setSpan] = useState<number | null>(null)
  const start = level(current).camera

  useKeyboard()

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const on = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [setReducedMotion])

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#04060f]">
      <Canvas
        camera={{
          position: [0, start.distance * 0.3, start.distance],
          fov: start.fov,
          near: 0.008,
          far: 9000,
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <LevelHost />
        <CameraRig controls={controls} />
        <ScaleProbe onChange={setSpan} />
        <OrbitControls
          ref={controls}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.5}
          zoomSpeed={0.65}
        />
      </Canvas>

      {/* Edge scrims: the UI sits over whatever the scene happens to be, and
          a bright planet behind the rail makes it unreadable without them. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-56 bg-gradient-to-r from-black/70 via-black/35 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-black/70 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-black/50 to-transparent"
      />

      <Breadcrumb />
      <LevelRail />
      <OptionsBar />
      <InfoPanel />
      <ZoomControls />
      <ScaleBar span={span} />
      <ObjectList />
    </div>
  )
}
