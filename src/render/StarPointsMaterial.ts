import * as THREE from 'three'

/**
 * Shared point material for every star-like cloud in the app: the galaxy,
 * the Local Group, the cosmic web. Points are soft discs with a bright core
 * and a faint halo, scaled by distance so they behave like real light
 * sources rather than fixed-size sprites.
 */
export function createStarPointsMaterial(scale = 46): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uFade: { value: 1 },
      uScale: { value: scale },
      uBrightness: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColour;
      attribute float aSize;
      varying vec3 vColour;
      uniform float uScale;
      void main(){
        vColour = aColour;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(aSize * uScale / max(-mv.z, 0.001), 0.6);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uFade;
      uniform float uBrightness;
      varying vec3 vColour;
      void main(){
        vec2 d = gl_PointCoord - vec2(0.5);
        float r = length(d) * 2.0;
        if (r > 1.0) discard;
        float core = pow(1.0 - r, 2.4);
        float halo = pow(1.0 - r, 0.7) * 0.3;
        float a = (core + halo);
        gl_FragColor = vec4(vColour * a * uBrightness, a * uFade);

        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
}

/** Builds the geometry these materials expect. */
export function starPointsGeometry(
  position: Float32Array,
  colour: Float32Array,
  size: Float32Array,
): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(position, 3))
  g.setAttribute('aColour', new THREE.BufferAttribute(colour, 3))
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  return g
}
