import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { STARS } from '../data/stars'
import { raDecToVec3, spectralColour, starMarkerSize } from '../lib/astro'
import { Label } from '../render/Label'
import { useLevelId } from '../render/LevelContext'
import { CircleRing } from '../render/OrbitPath'
import { Starfield } from '../render/Starfield'
import { fadeFor, useNav } from '../state/navigation'

/** One scene unit is one light year. */
const RINGS = [5, 10, 15, 20, 25]

/**
 * The stellar neighbourhood in real three dimensions: every star placed from
 * its catalogued right ascension, declination and parallax distance, sized
 * by absolute magnitude and tinted by spectral class. The concentric rings
 * are there because depth alone is almost impossible to judge by eye.
 */
export default function LocalStarsLevel() {
  const showLabels = useNav((s) => s.showLabels)
  const select = useNav((s) => s.select)
  const selection = useNav((s) => s.selectionByLevel.stars)

  const placed = useMemo(
    () =>
      STARS.map((s) => ({
        star: s,
        pos: s.dist === 0 ? new THREE.Vector3() : raDecToVec3(s.ra, s.dec, s.dist),
        size: starMarkerSize(s.absMag),
        colour: spectralColour(s.spectral),
      })),
    [],
  )

  return (
    <>
      <Starfield count={4_000} radius={900} intensity={0.55} />

      {RINGS.map((r) => (
        <CircleRing key={r} radius={r} colour="#3f5a8c" opacity={0.16} dashed width={0.8} />
      ))}
      {showLabels &&
        RINGS.map((r) => (
          <Label key={r} position={[r * 0.72, 0, r * 0.72]} dim>
            {r} ly
          </Label>
        ))}

      <StarPoints placed={placed} />

      {placed.map(({ star, pos, size }) => (
        <group key={star.id} position={pos}>
          {/* An invisible, slightly larger sphere makes the star clickable;
              raycasting a points cloud is unreliable at these sizes. */}
          <mesh
            onClick={() => select({ id: star.id, kind: 'star' })}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          >
            <sphereGeometry args={[Math.max(size * 0.35, 0.55), 10, 10]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          {showLabels && (star.notable || selection?.id === star.id) && (
            <Label
              position={[0, size * 0.3 + 0.5, 0]}
              selected={selection?.id === star.id}
              onClick={() => select({ id: star.id, kind: 'star' })}
              dim={!star.notable}
            >
              {star.name}
            </Label>
          )}
        </group>
      ))}
    </>
  )
}

interface Placed {
  star: (typeof STARS)[number]
  pos: THREE.Vector3
  size: number
  colour: THREE.Color
}

/** All stars as one additive point cloud, with a soft radial falloff. */
function StarPoints({ placed }: { placed: Placed[] }) {
  const levelId = useLevelId()

  const geo = useMemo(() => {
    const pos = new Float32Array(placed.length * 3)
    const col = new Float32Array(placed.length * 3)
    const size = new Float32Array(placed.length)
    placed.forEach((p, i) => {
      pos[i * 3] = p.pos.x
      pos[i * 3 + 1] = p.pos.y
      pos[i * 3 + 2] = p.pos.z
      col[i * 3] = p.colour.r
      col[i * 3 + 1] = p.colour.g
      col[i * 3 + 2] = p.colour.b
      size[i] = p.size
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aColour', new THREE.BufferAttribute(col, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    return g
  }, [placed])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uFade: { value: 1 }, uScale: { value: 1 } },
        vertexShader: /* glsl */ `
          attribute vec3 aColour;
          attribute float aSize;
          varying vec3 vColour;
          uniform float uScale;
          void main(){
            vColour = aColour;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uScale * 46.0 / max(-mv.z, 0.001);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          precision highp float;
          uniform float uFade;
          varying vec3 vColour;
          void main(){
            // Soft disc with a bright core, so stars read as points of light
            // rather than flat squares.
            vec2 d = gl_PointCoord - vec2(0.5);
            float r = length(d) * 2.0;
            if (r > 1.0) discard;
            float core = pow(1.0 - r, 2.2);
            float halo = pow(1.0 - r, 0.6) * 0.35;
            gl_FragColor = vec4(vColour * (core + halo) * 1.7, (core + halo) * uFade);

            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  )

  useFrame(() => {
    mat.uniforms.uFade.value = fadeFor(levelId)
  })

  return <points geometry={geo} material={mat} raycast={() => null} frustumCulled={false} />
}
