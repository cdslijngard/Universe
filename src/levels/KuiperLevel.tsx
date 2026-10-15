import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { DWARFS, PLANETS, SUN } from '../data/bodies'
import { BELTS, OUTER_MARKERS, PROBES, probeDistanceAU, SHELLS } from '../data/outerSystem'
import { raDecToVec3 } from '../lib/astro'
import { positionAt } from '../lib/kepler'
import { Label } from '../render/Label'
import { CircleRing, OrbitPath } from '../render/OrbitPath'
import { ParticleBelt } from '../render/ParticleBelt'
import { Planet } from '../render/Planet'
import { createBubbleMaterial } from '../render/shaders/shellMaterials'
import { Starfield } from '../render/Starfield'
import { fadeFor } from '../state/navigation'
import { useLevelId } from '../render/LevelContext'
import { useNav } from '../state/navigation'

/** One scene unit is 10 AU here. */
const U = (au: number) => au / 10

const OUTER_PLANETS = PLANETS.filter((p) => p.orbit!.a > 4)

/**
 * The Sun's frozen frontier: the Kuiper belt, the scattered disc, the
 * heliosphere boundaries and the three spacecraft that have crossed them.
 * Probe distances are computed from their measured speeds, so they are
 * current for today rather than baked in.
 */
export default function KuiperLevel() {
  const showLabels = useNav((s) => s.showLabels)
  const select = useNav((s) => s.select)
  const enter = useNav((s) => s.enter)
  const selection = useNav((s) => s.selectionByLevel.kuiper)

  const kuiper = BELTS.find((b) => b.id === 'kuiper-belt')!
  const scattered = BELTS.find((b) => b.id === 'scattered-disc')!

  return (
    <>
      <Starfield count={3_200} radius={900} intensity={0.85} />

      <Planet
        body={SUN}
        radius={0.26}
        segments={48}
        rings={false}
        onClick={() => select({ id: 'sun', kind: 'body' })}
      />

      {/* The giant planets' orbits, as the inner reference for everything else. */}
      {OUTER_PLANETS.map((p) => (
        <OrbitPath
          key={p.id}
          elements={{ ...p.orbit!, a: U(p.orbit!.a) }}
          scale={1}
          colour="#5f7aa8"
          opacity={p.id === 'neptune' ? 0.42 : 0.2}
        />
      ))}

      <ParticleBelt
        inner={U(kuiper.inner)} outer={U(kuiper.outer)} count={kuiper.count}
        colour={kuiper.colour} thickness={kuiper.thickness} spread={kuiper.spread}
        size={0.055} opacity={0.75} seed={11} spin={0.002}
      />
      <ParticleBelt
        inner={U(scattered.inner)} outer={U(scattered.outer)} count={scattered.count}
        colour={scattered.colour} thickness={scattered.thickness} spread={scattered.spread}
        size={0.05} opacity={0.4} seed={23} spin={0.0012}
      />

      {/* Dwarf planets out here get their real, steeply inclined orbits. */}
      {DWARFS.filter((d) => d.orbit!.a > 20).map((d) => (
        <DwarfMarker key={d.id} id={d.id} name={d.name}
          elements={{ ...d.orbit!, a: U(d.orbit!.a) }}
          selected={selection?.id === d.id}
          showLabel={showLabels}
          onSelect={() => select({ id: d.id, kind: 'body' })}
          onEnter={() => enter({ id: d.id, kind: 'body' })}
        />
      ))}

      {SHELLS.map((shell) => {
        // The heliosphere boundaries sit at their true radius. The Oort
        // cloud does not fit — its outer edge is 100,000 AU, ten thousand
        // scene units — so it is drawn as a symbolic shell just beyond the
        // rest, and its info panel says so.
        const symbolic = shell.radius > 500
        // Placed just beyond the heliopause so they are actually on screen
        // at this level's framing, rather than at a true radius that would
        // put them far outside it.
        const radius = symbolic
          ? (shell.id === 'oort-inner' ? 16.5 : 20.5)
          : U(shell.radius)
        return (
          <HelioShell
            key={shell.id}
            radius={radius}
            colour={shell.colour}
            opacity={symbolic ? shell.opacity * 1.6 : shell.opacity}
            label={showLabels ? shell.name : null}
            selected={selection?.id === shell.id}
            onSelect={() => select({ id: shell.id, kind: 'shell' })}
          />
        )
      })}

      {PROBES.map((probe) => {
        const au = probeDistanceAU(probe)
        const pos = raDecToVec3(probe.ra, probe.dec, U(au))
        return (
          <group key={probe.id}>
            <ProbeTrail to={pos} colour={probe.colour} />
            <mesh position={pos} onClick={() => select({ id: probe.id, kind: 'probe' })}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshBasicMaterial color={probe.colour} transparent />
            </mesh>
            {showLabels && (
              <Label
                position={[pos.x, pos.y + 0.3, pos.z]}
                selected={selection?.id === probe.id}
                onClick={() => select({ id: probe.id, kind: 'probe' })}
              >
                {probe.name} · {au.toFixed(0)} AU
              </Label>
            )}
          </group>
        )
      })}

      {OUTER_MARKERS.map((m) => (
        <group key={m.id}>
          <mesh
            position={[U(m.distAU) * 0.7, U(m.distAU) * 0.12, -U(m.distAU) * 0.7]}
            onClick={() => select({ id: m.id, kind: 'body' })}
          >
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshBasicMaterial color="#cfd8ea" transparent />
          </mesh>
        </group>
      ))}

      <CircleRing radius={U(50)} colour="#7fa0c8" opacity={0.18} dashed />
    </>
  )
}

/** A faint line from the Sun to a probe, showing its escape direction. */
function ProbeTrail({ to, colour }: { to: THREE.Vector3; colour: string }) {
  const levelId = useLevelId()
  const ref = useRef<{ material: THREE.Material & { opacity: number } }>(null)
  const points = useMemo(() => [new THREE.Vector3(0, 0, 0), to.clone()], [to])

  useFrame(() => {
    if (ref.current) ref.current.material.opacity = fadeFor(levelId) * 0.3
  })

  return (
    <Line
      ref={ref as never}
      points={points}
      color={colour}
      lineWidth={1}
      transparent
      opacity={0.3}
      depthWrite={false}
      raycast={() => null}
    />
  )
}

function DwarfMarker({
  id, name, elements, selected, showLabel, onSelect, onEnter,
}: {
  id: string
  name: string
  elements: Parameters<typeof OrbitPath>[0]['elements']
  selected: boolean
  showLabel: boolean
  onSelect: () => void
  onEnter: () => void
}) {
  const ref = useRef<THREE.Group>(null)
  const body = DWARFS.find((d) => d.id === id)!

  useFrame((state) => {
    if (!ref.current) return
    // These take centuries; nudge them along so the scene is not static.
    const years = state.clock.elapsedTime * 2.5
    const date = new Date(Date.now() + years * 365.25 * 86_400_000)
    ref.current.position.copy(positionAt(elements, date))
  })

  return (
    <>
      <OrbitPath elements={elements} scale={1} colour="#6d86b4" opacity={0.22} />
      <group ref={ref}>
        <Planet body={body} radius={0.14} segments={24} rings={false} spin={4}
          onClick={onSelect} onDoubleClick={onEnter} />
        {showLabel && (
          <Label position={[0, 0.28, 0]} selected={selected} onClick={onSelect} dim>
            {name}
          </Label>
        )}
      </group>
    </>
  )
}

function HelioShell({
  radius, colour, opacity, label, selected, onSelect,
}: {
  radius: number
  colour: string
  opacity: number
  label: string | null
  selected: boolean
  onSelect: () => void
}) {
  const levelId = useLevelId()
  const mat = useMemo(() => createBubbleMaterial(colour, opacity * 9), [colour, opacity])

  useFrame(() => {
    mat.uniforms.uFade.value = fadeFor(levelId)
  })

  return (
    <group>
      {/* The heliosphere is blunt on the side facing the Sun's motion through
          the interstellar medium and drawn out into a tail behind it, so the
          shell is stretched rather than spherical. */}
      <mesh
        scale={[1, 0.93, 1.3]}
        position={[0, 0, -radius * 0.22]}
        material={mat}
        onClick={onSelect}
      >
        <sphereGeometry args={[radius, 64, 40]} />
      </mesh>
      {label && (
        <Label
          position={[radius * 0.70, radius * 0.52, 0]}
          selected={selected}
          onClick={onSelect}
          dim
        >
          {label}
        </Label>
      )}
    </group>
  )
}
