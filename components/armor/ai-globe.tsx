'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.,0.)), f.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), f.x), f.y);
}
float fbm(vec2 p) {
  float v=0.; float a=.5;
  for(int i=0;i<5;i++){ v += a*noise(p); p=p*2.03+vec2(7.3,2.1); a*=.5; }
  return v;
}
void main() {
  vec2 p = vec2(vUv.x*7.2, vUv.y*4.2);
  float land = smoothstep(.49, .58, fbm(p + vec2(fbm(p*.72), fbm(p*.68+4.2))));
  float coast = smoothstep(.46,.54,fbm(p + vec2(fbm(p*.72), fbm(p*.68+4.2)))) - land;
  float city = step(.965, hash(floor(p*18.))) * land;
  vec3 ocean = mix(vec3(.005,.055,.20), vec3(.01,.24,.62), max(0., vNormal.z));
  vec3 continent = mix(vec3(.02,.38,.50), vec3(.08,.84,.70), noise(p*3.));
  vec3 color = mix(ocean, continent, land);
  color += coast * vec3(.08,.75,1.8);
  color += city * vec3(.8,1.5,2.2);
  float gridLat = smoothstep(.94,1.,cos(vUv.y*3.14159*24.));
  float gridLon = smoothstep(.955,1.,cos(vUv.x*6.28318*24.));
  color += (gridLat+gridLon)*.055*vec3(.1,.7,1.);
  float rim = pow(1.0-max(dot(normalize(vNormal),vec3(0.,0.,1.)),0.), 2.4);
  color += rim*vec3(.02,.55,1.4);
  gl_FragColor = vec4(color, .97);
}`

function GlobeMesh() {
  const globe = useRef<THREE.Group>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const particles = useMemo(() => {
    const points = new Float32Array(700 * 3)
    for (let index = 0; index < 700; index += 1) {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / 700)
      const theta = Math.PI * (1 + Math.sqrt(5)) * index
      const radius = 1.62 + Math.sin(index * 12.9898) * 0.08
      points[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
      points[index * 3 + 1] = radius * Math.cos(phi)
      points[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    return points
  }, [])

  useFrame((state, delta) => {
    if (!globe.current) return
    globe.current.rotation.y += delta * 0.22
    globe.current.rotation.x = -0.12 + Math.sin(state.clock.elapsedTime * 0.3) * 0.025
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <>
      <group ref={globe}>
        <mesh>
          <sphereGeometry args={[1.48, 96, 96]} />
          <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={{ uTime: { value: 0 } }} transparent />
        </mesh>
        <mesh scale={1.035}>
          <sphereGeometry args={[1.48, 48, 48]} />
          <meshBasicMaterial color="#31bcff" wireframe transparent opacity={0.11} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh rotation={[0.48, 0.3, 0.2]}>
          <torusGeometry args={[1.58, 0.012, 8, 180]} />
          <meshBasicMaterial color="#4bf1ff" transparent opacity={0.72} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[Math.PI / 2.25, 0.2, 0]}>
          <torusGeometry args={[1.62, 0.009, 8, 180]} />
          <meshBasicMaterial color="#7e50ff" transparent opacity={0.52} blending={THREE.AdditiveBlending} />
        </mesh>
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
          <pointsMaterial color="#35ddff" size={0.026} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>
      <mesh scale={1.17}>
        <sphereGeometry args={[1.48, 48, 48]} />
        <meshBasicMaterial color="#158cff" side={THREE.BackSide} transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <Html center style={{ pointerEvents: 'none' }}>
        <div className="globe-label"><span>AI</span><b>应用</b></div>
      </Html>
    </>
  )
}

export function AiGlobe() {
  return (
    <div className="ai-globe" aria-label="绕Y轴旋转的数字地球">
      <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }}>
        <GlobeMesh />
      </Canvas>
    </div>
  )
}
