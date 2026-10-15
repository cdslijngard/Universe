import * as THREE from 'three'
import type { Appearance } from '../../data/types'
import { NOISE_GLSL } from './noise'

/* ---- Cloud shell ------------------------------------------------------- */

const CLOUD_VERT = /* glsl */ `
varying vec3 vNormalO;
varying vec3 vNormalW;
varying vec3 vViewDir;
void main(){
  vNormalO = normalize(position);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

const CLOUD_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3  uSunDir;
uniform float uOpacity;
uniform float uFade;
uniform float uSeed;
uniform vec3  uTint;
/** 0 = broken cumulus (Earth), 1 = full overcast (Venus, Titan). */
uniform float uOvercast;

varying vec3 vNormalO;
varying vec3 vNormalW;
varying vec3 vViewDir;

${NOISE_GLSL}

vec3 spin(vec3 p, float a){
  float c = cos(a), s = sin(a);
  return vec3(c * p.x - s * p.z, p.y, s * p.x + c * p.z);
}

void main(){
  vec3 n = normalize(vNormalO);
  float lat = asin(clamp(n.y, -1.0, 1.0)) / 1.5707963;

  // Clouds drift with their own latitude-dependent wind, independent of the
  // surface below, which is what makes the two layers visibly decouple.
  vec3 adv = spin(n, uTime * 0.022 * (1.0 - 0.5 * abs(lat)));
  vec3 w = warp(adv * 2.0 + uSeed, 0.45);

  float d = fbm(w * 2.2 + vec3(0.0, uTime * 0.012, 0.0), 6, 2.1, 0.55);
  float wisps = fbm(adv * 7.0 - vec3(uTime * 0.02, 0.0, 0.0), 4, 2.0, 0.5);

  float cover = mix(
    smoothstep(0.03, 0.42, d + wisps * 0.22),      // broken
    smoothstep(-0.50, 0.55, d * 0.5 + 0.5),        // overcast
    uOvercast
  );

  // Banded structure near the equator for the thick-atmosphere worlds.
  cover *= mix(1.0, 0.72 + 0.28 * abs(sin(lat * 7.0 + d * 2.0)), uOvercast * 0.7);

  float ndl = dot(normalize(vNormalW), normalize(uSunDir));
  float lit = smoothstep(-0.18, 0.40, ndl);

  // Thin at the limb so the shell does not show a hard silhouette edge.
  float ndv = max(dot(normalize(vNormalW), normalize(vViewDir)), 0.0);
  float limb = smoothstep(0.0, 0.42, ndv);

  float a = cover * uOpacity * uFade * limb;
  vec3 col = uTint * (0.08 + 0.92 * lit) * (0.85 + 0.35 * wisps);

  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);

  // Raw ShaderMaterials do not get three's automatic output conversion, so
  // without these the linear-space colours are written straight to an sRGB
  // buffer and everything renders almost black.
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export function createCloudMaterial(app: Appearance, seed: number): THREE.ShaderMaterial {
  const overcast = app.surface === 'terrestrial' && (app.clouds ?? 0) > 0.75 ? 1 : 0
  return new THREE.ShaderMaterial({
    vertexShader: CLOUD_VERT,
    fragmentShader: CLOUD_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(1, 0.15, 0.4).normalize() },
      uOpacity: { value: app.clouds ?? 0 },
      uFade: { value: 1 },
      uSeed: { value: seed + 13.7 },
      uTint: { value: new THREE.Color(overcast ? app.palette[3] ?? '#ffffff' : '#ffffff') },
      uOvercast: { value: overcast },
    },
  })
}

/* ---- Atmospheric limb glow -------------------------------------------- */

const ATMO_VERT = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vViewDir;
void main(){
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

const ATMO_FRAG = /* glsl */ `
precision highp float;
uniform vec3  uColour;
uniform vec3  uSunDir;
uniform float uStrength;
uniform float uFade;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main(){
  vec3 n = normalize(vNormalW);
  // Rendered on the BACK faces of a slightly larger sphere: at the centre of
  // the disc the geometric normal points away from the camera, so a plain
  // max(dot(n, view), 0.0) reads 0 there and lights up the whole disc.
  // abs() gives 1 at the centre and 0 at the limb for either facing, which
  // is what actually confines the glow to the rim.
  float facing = abs(dot(n, normalize(vViewDir)));
  float fres = pow(1.0 - facing, 3.0);

  float ndl = dot(n, normalize(uSunDir));
  // Brightest just inside the terminator — that is where real limbs flare.
  float lit = smoothstep(-0.45, 0.30, ndl);
  float forward = pow(max(ndl, 0.0), 1.6) * 0.5 + 0.5;

  float a = fres * lit * forward * uStrength * uFade;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColour * (0.7 + 0.6 * forward), clamp(a, 0.0, 1.0));

  // Raw ShaderMaterials do not get three's automatic output conversion, so
  // without these the linear-space colours are written straight to an sRGB
  // buffer and everything renders almost black.
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export function createAtmosphereMaterial(colour: string, strength: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: ATMO_VERT,
    fragmentShader: ATMO_FRAG,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColour: { value: new THREE.Color(colour) },
      uSunDir: { value: new THREE.Vector3(1, 0.15, 0.4).normalize() },
      uStrength: { value: strength * 0.46 },
      uFade: { value: 1 },
    },
  })
}

/* ---- Ring system ------------------------------------------------------- */

const RING_VERT = /* glsl */ `
varying vec3 vLocal;
varying vec3 vWorld;
void main(){
  vLocal = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

/**
 * Rings are drawn on a flat annulus. Radial structure comes from layered
 * noise in the radius alone — real rings are banded radially and essentially
 * uniform in azimuth — plus explicit gaps at their measured positions.
 */
const RING_FRAG = /* glsl */ `
precision highp float;
uniform float uInner;
uniform float uOuter;
uniform float uOpacity;
uniform float uFade;
uniform vec3  uPal[4];
uniform vec3  uSunDir;
uniform vec3  uPlanetPos;
uniform float uPlanetR;
uniform vec4  uGaps;      // two gaps: (startA, endA, startB, endB)
uniform float uSeed;

varying vec3 vLocal;
varying vec3 vWorld;

${NOISE_GLSL}

void main(){
  float r = length(vLocal.xz);
  if (r < uInner || r > uOuter) discard;

  float t = (r - uInner) / max(uOuter - uInner, 1e-4);

  // Radial banding at several scales.
  float b1 = fbm(vec3(r * 7.0 + uSeed, 0.0, 0.0), 5, 2.0, 0.5);
  float b2 = fbm(vec3(r * 29.0 - uSeed, 0.0, 0.0), 4, 2.0, 0.5);
  float b3 = snoise(vec3(r * 120.0, 0.0, 0.0));
  float density = 0.5 + 0.34 * b1 + 0.2 * b2 + 0.08 * b3;

  // Measured gaps, with soft shoulders.
  float gapA = smoothstep(uGaps.x - 0.012, uGaps.x, r) * (1.0 - smoothstep(uGaps.y, uGaps.y + 0.012, r));
  float gapB = smoothstep(uGaps.z - 0.004, uGaps.z, r) * (1.0 - smoothstep(uGaps.w, uGaps.w + 0.004, r));
  density *= (1.0 - gapA * 0.93) * (1.0 - gapB * 0.85);

  // Thin out toward both edges.
  density *= smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.88, 1.0, t));
  density = clamp(density, 0.0, 1.0);

  vec3 col = mix(uPal[1], uPal[3], density * 0.8 + b2 * 0.2);

  // The planet's shadow falling across the ring plane: project the fragment
  // onto the sun direction and test its perpendicular distance from the axis.
  vec3 rel = vWorld - uPlanetPos;
  vec3 sd = normalize(uSunDir);
  float along = dot(rel, sd);
  float perp = length(rel - sd * along);
  float shadow = (along < 0.0 && perp < uPlanetR)
    ? smoothstep(uPlanetR, uPlanetR * 0.72, perp)
    : 0.0;
  col *= 1.0 - 0.80 * shadow;

  float a = density * uOpacity * uFade;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);

  // Raw ShaderMaterials do not get three's automatic output conversion, so
  // without these the linear-space colours are written straight to an sRGB
  // buffer and everything renders almost black.
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export function createRingMaterial(app: Appearance): THREE.ShaderMaterial {
  const rings = app.rings!
  const gaps = rings.gaps ?? []
  const pal = [0, 1, 2, 3].map(
    (i) => new THREE.Color(app.palette[i] ?? app.palette[app.palette.length - 1]),
  )
  return new THREE.ShaderMaterial({
    vertexShader: RING_VERT,
    fragmentShader: RING_FRAG,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      uInner: { value: rings.innerR },
      uOuter: { value: rings.outerR },
      uOpacity: { value: rings.opacity ?? 0.9 },
      uFade: { value: 1 },
      uPal: { value: pal },
      uSunDir: { value: new THREE.Vector3(1, 0.15, 0.4).normalize() },
      uPlanetPos: { value: new THREE.Vector3() },
      uPlanetR: { value: 1 },
      uGaps: {
        value: new THREE.Vector4(
          gaps[0]?.[0] ?? -9, gaps[0]?.[1] ?? -9,
          gaps[1]?.[0] ?? -9, gaps[1]?.[1] ?? -9,
        ),
      },
      uSeed: { value: 3.7 },
    },
  })
}

/* ---- Boundary bubble --------------------------------------------------- */

const BUBBLE_FRAG = /* glsl */ `
precision highp float;
uniform vec3  uColour;
uniform float uStrength;
uniform float uFade;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main(){
  // Pure Fresnel, no lighting: these are boundaries in a plasma, not lit
  // surfaces. Only the grazing rim registers, so the bubble reads as a
  // shell you can see through rather than a solid ball.
  float facing = abs(dot(normalize(vNormalW), normalize(vViewDir)));
  float rim = pow(1.0 - facing, 3.4);
  float a = rim * uStrength * uFade;
  if (a < 0.002) discard;
  gl_FragColor = vec4(uColour, clamp(a, 0.0, 1.0));

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

/** A translucent boundary surface — the termination shock, the heliopause. */
export function createBubbleMaterial(colour: string, strength: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: ATMO_VERT,
    fragmentShader: BUBBLE_FRAG,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColour: { value: new THREE.Color(colour) },
      uStrength: { value: strength },
      uFade: { value: 1 },
    },
  })
}
