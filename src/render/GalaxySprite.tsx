import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { NOISE_GLSL } from './shaders/noise'
import { fadeFor } from '../state/navigation'
import { useLevelId } from './LevelContext'

export type GalaxyShape = 'spiral' | 'barred' | 'elliptical' | 'irregular' | 'dwarf'

const SHAPE_INDEX: Record<GalaxyShape, number> = {
  spiral: 0,
  barred: 1,
  elliptical: 2,
  irregular: 3,
  dwarf: 4,
}

const VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/**
 * A galaxy drawn entirely in the fragment shader: spiral arms from a
 * logarithmic phase term, a bulge from a radial falloff, and noise to break
 * up the regularity. Cheaper and sharper at any zoom than a sprite texture.
 */
const FRAG = /* glsl */ `
precision highp float;
uniform vec3  uColour;
uniform int   uShape;
uniform float uFade;
uniform float uSeed;
uniform float uTime;
uniform float uIncline;   // 0 face-on, 1 edge-on
uniform float uSelected;
varying vec2 vUv;

${NOISE_GLSL}

const float PI = 3.141592653589793;

void main(){
  vec2 p = (vUv - 0.5) * 2.0;
  // Foreshorten to fake an inclined disc, then square up for the radius.
  p.y /= max(1.0 - uIncline * 0.88, 0.12);

  float r = length(p);
  if (r > 1.0) discard;

  float a = atan(p.y, p.x);
  float bright = 0.0;

  if (uShape == 2 || uShape == 4){
    // Elliptical and dwarf: a smooth concentration, no structure.
    float k = (uShape == 4) ? 3.4 : 2.4;
    bright = exp(-r * k) * 1.15;
    bright *= 0.75 + 0.5 * fbm(vec3(p * 4.0, uSeed), 3, 2.0, 0.5);
  } else if (uShape == 3){
    // Irregular: clumpy star-forming knots, no symmetry at all.
    vec3 w = warp(vec3(p * 2.2, uSeed), 0.7);
    float n = fbm(w * 1.8, 5, 2.1, 0.55);
    bright = smoothstep(-0.15, 0.55, n) * exp(-r * 1.5) * 1.5;
  } else {
    // Spiral and barred: arms are a sinusoid in (angle - k·ln r).
    float arms = (uShape == 1) ? 2.0 : 4.0;
    float wind = (uShape == 1) ? 3.4 : 2.6;
    float phase = a * arms * 0.5 + wind * log(max(r, 0.04));
    float spiral = 0.5 + 0.5 * cos(phase * 2.0);
    spiral = pow(spiral, 2.2);

    float n = fbm(vec3(p * 5.0, uSeed), 4, 2.0, 0.5);
    spiral *= 0.65 + 0.7 * n;

    float disc = exp(-r * 2.1);
    float bulge = exp(-r * 7.0) * 1.5;

    bright = spiral * disc * 1.35 + bulge;

    if (uShape == 1){
      // A bar across the core, at an angle to the arms.
      vec2 b = vec2(p.x * cos(0.5) - p.y * sin(0.5), p.x * sin(0.5) + p.y * cos(0.5));
      bright += exp(-abs(b.y) * 16.0 - abs(b.x) * 3.2) * 0.85;
    }
  }

  // Soft outer edge so the quad never shows its corners.
  bright *= 1.0 - smoothstep(0.72, 1.0, r);
  bright = max(bright, 0.0);

  // Young blue arms, warm old core.
  vec3 col = mix(uColour, vec3(1.0, 0.86, 0.62), exp(-r * 4.5));
  col = mix(col * vec3(0.78, 0.86, 1.08), col, smoothstep(0.0, 0.5, r));
  col += uSelected * vec3(0.10, 0.22, 0.40) * bright;

  float alpha = clamp(bright, 0.0, 1.0) * uFade;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(col * bright, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

interface Props {
  position: [number, number, number]
  /** Diameter in scene units. */
  size: number
  colour: string
  shape: GalaxyShape
  roll?: number
  incline?: number
  seed?: number
  selected?: boolean
  onClick?: () => void
}

/** A billboarded procedural galaxy. */
export function GalaxySprite({
  position,
  size,
  colour,
  shape,
  roll = 0,
  incline = 0.4,
  seed = 1,
  selected = false,
  onClick,
}: Props) {
  const levelId = useLevelId()
  const ref = useRef<THREE.Mesh>(null)

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uColour: { value: new THREE.Color(colour) },
          uShape: { value: SHAPE_INDEX[shape] },
          uFade: { value: 1 },
          uSeed: { value: seed },
          uTime: { value: 0 },
          uIncline: { value: incline },
          uSelected: { value: 0 },
        },
      }),
    [colour, shape, seed, incline],
  )

  useFrame((state) => {
    mat.uniforms.uFade.value = fadeFor(levelId)
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uSelected.value = selected ? 1 : 0
    // Billboard toward the camera, keeping each galaxy's own roll so they
    // are not all oriented identically.
    if (ref.current) {
      ref.current.quaternion.copy(state.camera.quaternion)
      ref.current.rotateZ(roll)
    }
  })

  return (
    <mesh ref={ref} position={position} material={mat} onClick={onClick}>
      <planeGeometry args={[size, size]} />
    </mesh>
  )
}
