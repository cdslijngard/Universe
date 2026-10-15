import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CMB_SHELL_RADIUS, WEB_FIELD, WEB_NODES } from '../data/cosmicWeb'
import { raDecToVec3 } from '../lib/astro'
import { Label } from '../render/Label'
import { useLevelId } from '../render/LevelContext'
import { mulberry32 } from '../render/Starfield'
import { createBubbleMaterial } from '../render/shaders/shellMaterials'
import { createStarPointsMaterial, starPointsGeometry } from '../render/StarPointsMaterial'
import { fadeFor, useNav } from '../state/navigation'

/** One scene unit is 10 million light years. */
const U = 0.1

/**
 * Large-scale structure: galaxies strung along filaments and sheets that
 * wrap around near-empty voids. The filament field is procedural, but the
 * named clusters, superclusters and voids sit at their real positions, and
 * the sphere at the edge is the cosmic microwave background.
 */
export default function CosmicWebLevel() {
  const showLabels = useNav((s) => s.showLabels)
  const select = useNav((s) => s.select)
  const selection = useNav((s) => s.selectionByLevel.cosmic)

  return (
    <>
      <FilamentField />
      <CmbShell />

      {WEB_NODES.map((n) => {
        const pos =
          n.dist === 0
            ? new THREE.Vector3()
            : raDecToVec3(n.ra, n.dec, n.dist * U)
        const radius = Math.max(n.diameter * U * 0.5, 0.5)
        const isVoid = n.kind === 'void'
        return (
          <group key={n.id} position={pos}>
            <StructureBubble
              radius={radius}
              colour={n.colour}
              // A void is an absence; its rim is drawn cool and faint so it
              // reads as a hole in the field rather than an object in it.
              strength={isVoid ? 0.22 : 0.4}
              onClick={() => select({ id: n.id, kind: 'web' })}
            />
            {showLabels && (n.notable || selection?.id === n.id) && (
              <Label
                position={[0, radius * 0.8 + 0.6, 0]}
                selected={selection?.id === n.id}
                onClick={() => select({ id: n.id, kind: 'web' })}
                dim={!n.notable}
              >
                {n.name}
              </Label>
            )}
          </group>
        )
      })}
    </>
  )
}

/** A structure boundary: visible only at its grazing rim. */
function StructureBubble({
  radius, colour, strength, onClick,
}: {
  radius: number
  colour: string
  strength: number
  onClick: () => void
}) {
  const levelId = useLevelId()
  const mat = useMemo(() => createBubbleMaterial(colour, strength), [colour, strength])

  useFrame(() => {
    mat.uniforms.uFade.value = fadeFor(levelId)
  })

  return (
    <mesh
      material={mat}
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <sphereGeometry args={[radius, 40, 28]} />
    </mesh>
  )
}

/**
 * Filaments come from thresholded noise: cluster the field, carve out
 * everything below the threshold, and what remains is sheets and strands
 * around voids — the same structure gravity produces, by a cheaper route.
 */
function FilamentField() {
  const levelId = useLevelId()
  const ref = useRef<THREE.Points>(null)

  const geo = useMemo(() => {
    const rand = mulberry32(0xc05c1c)
    const pos: number[] = []
    const col: number[] = []
    const siz: number[] = []
    const warm = new THREE.Color('#ffd7a8')
    const cool = new THREE.Color(WEB_FIELD.colour)

    // Seed a set of attractors, then string points along the links between
    // nearby ones. That gives genuine filaments rather than isotropic noise.
    const nodeCount = WEB_FIELD.count
    const nodes: THREE.Vector3[] = []
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(
        new THREE.Vector3(
          (rand() * 2 - 1) * WEB_FIELD.extent,
          (rand() * 2 - 1) * WEB_FIELD.extent * 0.8,
          (rand() * 2 - 1) * WEB_FIELD.extent,
        ),
      )
    }

    const linkRange = WEB_FIELD.extent * 0.34
    for (let i = 0; i < nodeCount; i++) {
      // Cluster knot at each node.
      const knot = 120 + Math.floor(rand() * 180)
      for (let k = 0; k < knot; k++) {
        const r = Math.pow(rand(), 2.2) * WEB_FIELD.extent * 0.055
        const u = rand() * 2 - 1
        const phi = rand() * Math.PI * 2
        const s = Math.sqrt(1 - u * u)
        pos.push(
          nodes[i].x + s * Math.cos(phi) * r,
          nodes[i].y + u * r,
          nodes[i].z + s * Math.sin(phi) * r,
        )
        const c = warm.clone().lerp(cool, rand() * 0.75)
        const b = 0.4 + Math.pow(rand(), 2) * 0.9
        col.push(c.r * b, c.g * b, c.b * b)
        siz.push(0.5 + Math.pow(rand(), 3) * 2.0)
      }

      // Strands to nearby nodes.
      for (let j = i + 1; j < nodeCount; j++) {
        const d = nodes[i].distanceTo(nodes[j])
        if (d > linkRange) continue
        const n = Math.floor(90 * (1 - d / linkRange)) + 25
        for (let k = 0; k < n; k++) {
          const t = rand()
          const jitter = WEB_FIELD.extent * 0.022 * (0.4 + Math.sin(t * Math.PI))
          pos.push(
            nodes[i].x + (nodes[j].x - nodes[i].x) * t + (rand() - 0.5) * jitter,
            nodes[i].y + (nodes[j].y - nodes[i].y) * t + (rand() - 0.5) * jitter,
            nodes[i].z + (nodes[j].z - nodes[i].z) * t + (rand() - 0.5) * jitter,
          )
          const c = cool.clone().lerp(warm, rand() * 0.3)
          // Strands carry the structure, so they need to be close in
          // brightness to the knots or the web reads as isolated clumps.
          const b = 0.45 + Math.pow(rand(), 1.8) * 0.75
          col.push(c.r * b, c.g * b, c.b * b)
          siz.push(0.45 + Math.pow(rand(), 2.6) * 1.5)
        }
      }
    }

    return starPointsGeometry(
      new Float32Array(pos),
      new Float32Array(col),
      new Float32Array(siz),
    )
  }, [])

  const mat = useMemo(() => createStarPointsMaterial(300), [])

  useFrame(() => {
    mat.uniforms.uFade.value = fadeFor(levelId)
  })

  return <points ref={ref} geometry={geo} material={mat} raycast={() => null} frustumCulled={false} />
}

/** The observable horizon, drawn at a symbolic radius. */
function CmbShell() {
  const levelId = useLevelId()
  const select = useNav((s) => s.select)
  const showLabels = useNav((s) => s.showLabels)
  const mat = useMemo(() => createBubbleMaterial('#ff9a6b', 0.55), [])

  useFrame(() => {
    mat.uniforms.uFade.value = fadeFor(levelId)
  })

  return (
    <group>
      <mesh material={mat} onClick={() => select({ id: 'cmb', kind: 'structure' })}>
        <sphereGeometry args={[CMB_SHELL_RADIUS, 64, 40]} />
      </mesh>
      {showLabels && (
        <Label
          position={[CMB_SHELL_RADIUS * 0.62, CMB_SHELL_RADIUS * 0.6, 0]}
          onClick={() => select({ id: 'cmb', kind: 'structure' })}
        >
          Cosmic microwave background
        </Label>
      )}
    </group>
  )
}
