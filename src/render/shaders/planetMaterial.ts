import * as THREE from 'three'
import type { Appearance, SurfaceKind } from '../../data/types'
import { NOISE_GLSL } from './noise'

export const SURFACE_INDEX: Record<SurfaceKind, number> = {
  star: 0,
  gasGiant: 1,
  iceGiant: 2,
  terrestrial: 3,
  rocky: 4,
  icy: 5,
  volcanic: 6,
}

const VERT = /* glsl */ `
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

const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3  uSunDir;
uniform vec3  uPal[4];
uniform int   uKind;
uniform float uRough;
uniform float uFade;
uniform float uSeed;
uniform float uStormLat;
uniform float uStormSize;
uniform vec3  uStormCol;
uniform float uHasStorm;

varying vec3 vNormalO;
varying vec3 vNormalW;
varying vec3 vViewDir;

${NOISE_GLSL}

const float PI = 3.141592653589793;

/** Rotate a point about the Y axis. */
vec3 spin(vec3 p, float a){
  float c = cos(a), s = sin(a);
  return vec3(c * p.x - s * p.z, p.y, s * p.x + c * p.z);
}

/** Four-stop palette ramp. */
vec3 ramp(float t){
  t = clamp(t, 0.0, 1.0) * 3.0;
  if (t < 1.0) return mix(uPal[0], uPal[1], t);
  if (t < 2.0) return mix(uPal[1], uPal[2], t - 1.0);
  return mix(uPal[2], uPal[3], t - 2.0);
}

/* ---- Gas and ice giants ------------------------------------------------ */
vec3 bandedGiant(vec3 n, float lat, float bands, float turbAmt){
  // Zonal winds: fastest at the equator, which shears the bands past each
  // other over time instead of rotating them as one rigid texture.
  float wind = (1.0 - 0.65 * abs(lat)) * uTime * 0.016;
  vec3 adv = spin(n, wind);

  // Domain-warp the sample first: real belts billow and curl into each
  // other at their boundaries rather than running as clean stripes.
  vec3 curled = warp(adv * 1.4 + uSeed, 0.55);
  float turb = fbm(curled * 2.2 + vec3(0.0, lat * 2.5, 0.0), 5, 2.1, 0.58);
  float fine = fbm(adv * 8.0 + vec3(0.0, uTime * 0.012, uSeed), 4, 2.0, 0.5);
  float eddies = fbm(adv * 16.0 - vec3(uTime * 0.02, 0.0, 0.0), 3, 2.0, 0.5);

  float phase = lat * bands * PI + turb * 3.1 * turbAmt + fine * 0.9 * turbAmt;
  float band = 0.5 + 0.5 * sin(phase);

  // Sharpen the edges a little so they still read as distinct belts, then
  // break them up again with small-scale eddies.
  band = mix(band, smoothstep(0.22, 0.78, band), 0.5);
  band += eddies * 0.09 * turbAmt;
  // Pull the extremes in. Real belts and zones differ in tone, not in the
  // near-black-to-near-white range a raw ramp produces.
  band = mix(0.5, band, 0.80);
  return ramp(clamp(band, 0.0, 1.0) * 0.9 + fine * 0.1);
}

/** An oval vortex that rotates and deforms. */
vec3 applyStorm(vec3 col, vec3 n, float lat){
  if (uHasStorm < 0.5) return col;

  float lon = atan(n.z, n.x);
  float stormLon = -PI * 0.35 + uTime * 0.004;

  // Wrap the longitude difference into -PI..PI.
  float dl = atan(sin(lon - stormLon), cos(lon - stormLon));
  vec2 d = vec2(dl * 0.62, lat - uStormLat);
  float r = length(d) / max(uStormSize, 1e-3);
  if (r > 1.25) return col;

  // Swirl the sampling coordinates harder toward the centre.
  float swirl = (1.0 - clamp(r, 0.0, 1.0));
  float a = swirl * swirl * 5.0 + uTime * 0.28;
  vec2 sd = vec2(d.x * cos(a) - d.y * sin(a), d.x * sin(a) + d.y * cos(a));
  float curl = fbm(vec3(sd * 11.0, uTime * 0.05 + uSeed), 4, 2.0, 0.5);

  float mask = smoothstep(1.15, 0.35, r);
  vec3 storm = uStormCol * (0.78 + 0.42 * curl);
  // A brighter collar at the edge, as the real spots have.
  storm += vec3(0.10, 0.06, 0.03) * smoothstep(0.55, 1.0, r);
  return mix(col, storm, mask);
}

/* ---- Rocky, icy, terrestrial ------------------------------------------- */
vec3 terrestrial(vec3 n, float lat){
  vec3 w = warp(n * 1.5 + uSeed, 0.4);
  float h = fbm(w * 1.5, 6, 2.0, 0.5);
  float detail = fbm(n * 9.0 + uSeed, 4, 2.0, 0.5);

  // Sea level sits well above the noise midpoint: Earth is 71% ocean, and a
  // threshold of 0 would split it half and half.
  float sea = 0.085;
  float land = smoothstep(sea, sea + 0.055, h + detail * 0.05);
  vec3 ocean = mix(uPal[0], uPal[1], smoothstep(-0.30, sea, h) * 0.85 + detail * 0.12);
  // Vegetation in the lowlands, bare rock and sand only on the high ground.
  float arid = smoothstep(sea + 0.04, sea + 0.30, h) * 0.85 + detail * 0.18;
  vec3 ground = mix(uPal[2], uPal[3], clamp(arid, 0.0, 1.0));

  vec3 col = mix(ocean, ground, land);

  // Polar caps, pushed outward where the land is high.
  float ice = smoothstep(0.74, 0.95, abs(lat) + max(h, 0.0) * 0.14);
  col = mix(col, vec3(0.93, 0.95, 0.99), ice * 0.92);
  return col;
}

vec3 rocky(vec3 n){
  float base = fbm(n * 3.2 + uSeed, 5, 2.0, 0.5);
  // Two crater scales; the rim highlight is what makes them read as craters.
  float c1 = worley(n * 11.0 + uSeed);
  float c2 = worley(n * 26.0 + uSeed * 2.0);
  float craters = min(c1, c2 * 1.3);
  float rim = smoothstep(0.02, 0.16, craters) * (1.0 - smoothstep(0.16, 0.42, craters));
  float floorDark = 1.0 - smoothstep(0.0, 0.12, craters);

  float t = 0.45 + base * 0.5;
  t += rim * 0.30 * uRough;
  t -= floorDark * 0.26 * uRough;
  return ramp(t);
}

vec3 icy(vec3 n){
  float base = fbm(n * 2.4 + uSeed, 5, 2.0, 0.5);
  // Lineae: thin dark fractures, Europa-style.
  float r = ridged(n * 4.2 + uSeed, 4);
  float cracks = 1.0 - smoothstep(0.0, 0.055, abs(r - 0.60));
  float speckle = fbm(n * 18.0, 3, 2.0, 0.5);

  vec3 col = ramp(0.55 + base * 0.45 + speckle * 0.08);
  col = mix(col, uPal[0] * 0.85, cracks * 0.55 * uRough);
  return col;
}

vec3 volcanic(vec3 n){
  vec3 w = warp(n * 2.2 + uSeed, 0.5);
  float base = fbm(w * 2.0, 5, 2.0, 0.5);
  float mottle = fbm(n * 6.5 + uSeed * 3.0, 4, 2.0, 0.5);
  vec3 col = ramp(0.5 + base * 0.5 + mottle * 0.2);

  // Hot spots that pulse — Io resurfaces itself constantly.
  float v = worley(n * 9.0 + uSeed);
  float hot = 1.0 - smoothstep(0.0, 0.10, v);
  float pulse = 0.65 + 0.35 * sin(uTime * 0.9 + v * 30.0);
  col = mix(col, vec3(1.0, 0.28, 0.06), hot * 0.75 * pulse);
  return col;
}

vec3 starSurface(vec3 n, float ndv){
  // Granulation at two scales, convecting.
  float g1 = fbm(n * 7.0 + vec3(0.0, uTime * 0.05, 0.0), 4, 2.0, 0.5);
  float g2 = fbm(n * 20.0 - vec3(uTime * 0.03, 0.0, 0.0), 3, 2.0, 0.5);
  float t = 0.55 + g1 * 0.38 + g2 * 0.22;

  vec3 col = ramp(t);
  // Limb darkening: the edge of the disc is cooler and dimmer.
  float limb = pow(clamp(ndv, 0.0, 1.0), 0.45);
  col *= 0.55 + 0.75 * limb;
  return col * 1.35;
}

void main(){
  vec3 n = normalize(vNormalO);
  float lat = asin(clamp(n.y, -1.0, 1.0)) / (PI * 0.5);
  float ndv = max(dot(normalize(vNormalW), normalize(vViewDir)), 0.0);

  vec3 col;
  bool emissive = (uKind == 0);

  if (uKind == 0)      col = starSurface(n, ndv);
  else if (uKind == 1) col = applyStorm(bandedGiant(n, lat, 11.0, uRough), n, lat);
  else if (uKind == 2) col = applyStorm(bandedGiant(n, lat, 5.0, max(uRough, 0.08)), n, lat);
  else if (uKind == 3) col = terrestrial(n, lat);
  else if (uKind == 4) col = rocky(n);
  else if (uKind == 5) col = icy(n);
  else                 col = volcanic(n);

  if (!emissive){
    float ndl = dot(normalize(vNormalW), normalize(uSunDir));
    // A soft terminator rather than a hard line — real limbs are gradual.
    float lambert = smoothstep(-0.12, 0.42, ndl);
    // Faint night side so the dark limb stays readable against space.
    col *= 0.035 + 0.965 * lambert;

    // Grazing-angle sheen. Kept subtle: bodies with an atmosphere already
    // get a limb glow from the shell above, and the two stack into a thick
    // grey ring if this is heavy-handed.
    float sheen = pow(1.0 - ndv, 4.0) * lambert * (1.0 - uRough) * 0.12;
    col += sheen * vec3(0.5, 0.65, 0.9);
  }

  gl_FragColor = vec4(col, uFade);

  // Raw ShaderMaterials do not get three's automatic output conversion, so
  // without these the linear-space colours are written straight to an sRGB
  // buffer and everything renders almost black.
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

const toVec3 = (hex: string) => new THREE.Color(hex)

export interface PlanetUniforms {
  [k: string]: THREE.IUniform
}

/** Builds a material for one body. Each body gets its own seed. */
export function createPlanetMaterial(app: Appearance, seed: number): THREE.ShaderMaterial {
  const pal = [0, 1, 2, 3].map((i) => toVec3(app.palette[i] ?? app.palette[app.palette.length - 1]))

  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(1, 0.15, 0.4).normalize() },
      uPal: { value: pal },
      uKind: { value: SURFACE_INDEX[app.surface] },
      uRough: { value: app.roughness ?? 0.5 },
      uFade: { value: 1 },
      uSeed: { value: seed },
      uStormLat: { value: app.storm?.lat ?? 0 },
      uStormSize: { value: app.storm?.size ?? 0.15 },
      uStormCol: { value: toVec3(app.storm?.colour ?? '#ffffff') },
      uHasStorm: { value: app.storm ? 1 : 0 },
    } satisfies PlanetUniforms,
  })
}

/** Stable per-body seed so a planet looks the same every visit. */
export function seedFor(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 97
}
