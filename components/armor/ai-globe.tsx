'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BASE_RADIUS = 1.48
const LAND_RADIUS = 1.545

const sharedNoise = `
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
float landMask(vec2 uv) {
  vec2 p = vec2(uv.x*7.2, uv.y*4.2);
  return smoothstep(.49, .58, fbm(p + vec2(fbm(p*.72), fbm(p*.68+4.2))));
}
`

const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vViewNormal = normalize((modelViewMatrix * vec4(normal, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

/** 球体底座：深蓝半透明，光晕偏向 #1575f5 */
const baseFragmentShader = `
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
${sharedNoise}
void main() {
  float facing = max(dot(normalize(vViewNormal), vec3(0.,0.,1.)), 0.);
  float rim = pow(1.0 - facing, 2.1);

  // 深蓝球体，略带体积感
  vec3 deep = vec3(0.01, 0.05, 0.16);
  vec3 mid = vec3(0.04, 0.14, 0.36);
  vec3 color = mix(deep, mid, facing * 0.85);

  // 以 #1575f5 为主，右侧保留可见的一点紫调
  float side = clamp(vNormal.x * 0.5 + 0.5, 0., 1.);
  vec3 cyanGlow = vec3(0.12, 0.58, 0.98);
  vec3 blueGlow = vec3(0.082, 0.459, 0.961); // #1575f5
  vec3 softPurple = vec3(0.55, 0.22, 0.95);
  vec3 rightGlow = mix(blueGlow, softPurple, 0.42);
  vec3 sideGlow = mix(cyanGlow, rightGlow, smoothstep(0.28, 0.82, side));
  color += sideGlow * rim * 1.05;
  color += cyanGlow * pow(max(-vNormal.x, 0.), 1.6) * 0.2;
  color += rightGlow * pow(max(vNormal.x, 0.), 1.55) * 0.2;

  // 表面极淡陆影，增强与浮层的层次关系
  float land = landMask(vUv);
  color = mix(color, color * vec3(0.55, 0.7, 0.95), land * 0.28);

  float alpha = mix(0.78, 0.92, facing);
  gl_FragColor = vec4(color, alpha);
}`

/** 陆地浮层：略高于球面，亮青色点阵大陆 */
const landFragmentShader = `
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
${sharedNoise}
void main() {
  vec2 p = vec2(vUv.x*7.2, vUv.y*4.2);
  float land = landMask(vUv);
  if (land < 0.08) discard;

  float facing = max(dot(normalize(vViewNormal), vec3(0.,0.,1.)), 0.);
  float rim = pow(1.0 - facing, 2.8);

  float cell = 72.0;
  vec2 gp = fract(vUv * vec2(cell * 1.8, cell));
  float dotMask = smoothstep(0.42, 0.18, length(gp - 0.5));
  float spark = step(0.55, hash(floor(vUv * vec2(cell * 1.8, cell)) + floor(uTime * 1.5)));
  float density = mix(0.35, 1.0, land) * (0.55 + dotMask * 0.85 + spark * 0.35);

  vec3 landCyan = mix(vec3(0.0, 0.72, 0.92), vec3(0.35, 1.0, 1.0), noise(p * 4.0));
  vec3 coast = vec3(0.55, 0.95, 1.0);
  float edge = smoothstep(0.08, 0.35, land) * (1.0 - smoothstep(0.55, 0.95, land));
  vec3 color = mix(landCyan, coast, edge * 0.55);
  color *= 0.75 + facing * 0.55;
  color += rim * vec3(0.2, 0.85, 1.0) * 0.45;

  float alpha = density * land * mix(0.55, 0.95, facing);
  if (alpha < 0.04) discard;
  gl_FragColor = vec4(color, alpha);
}`

function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function noise2(x: number, y: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = hash2(ix, iy)
  const b = hash2(ix + 1, iy)
  const c = hash2(ix, iy + 1)
  const d = hash2(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

function fbm2(x: number, y: number) {
  let v = 0
  let a = 0.5
  let px = x
  let py = y
  for (let i = 0; i < 5; i += 1) {
    v += a * noise2(px, py)
    const nx = px * 2.03 + 7.3
    const ny = py * 2.03 + 2.1
    px = nx
    py = ny
    a *= 0.5
  }
  return v
}

function landMaskCpu(u: number, v: number) {
  const x = u * 7.2
  const y = v * 4.2
  const warpX = fbm2(x * 0.72, y * 0.72)
  const warpY = fbm2(x * 0.68 + 4.2, y * 0.68 + 4.2)
  const value = fbm2(x + warpX, y + warpY)
  const t = (value - 0.49) / 0.09
  return Math.min(1, Math.max(0, t))
}

function GlobeMesh() {
  const globe = useRef<THREE.Group>(null)
  const baseMat = useRef<THREE.ShaderMaterial>(null)
  const landMat = useRef<THREE.ShaderMaterial>(null)

  const landPoints = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const samples = 5200
    for (let i = 0; i < samples; i += 1) {
      const u = (i % 90) / 90
      const v = Math.floor(i / 90) / (samples / 90)
      const jitterU = u + (hash2(i, 1.7) - 0.5) * 0.01
      const jitterV = v + (hash2(i, 3.1) - 0.5) * 0.01
      const mask = landMaskCpu(jitterU, jitterV)
      if (mask < 0.42 || hash2(i, 9.2) > mask * 0.92) continue

      const phi = jitterV * Math.PI
      const theta = jitterU * Math.PI * 2
      const radius = LAND_RADIUS + 0.012 + hash2(i, 5.5) * 0.018
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.sin(theta)
      positions.push(x, y, z)

      const bright = 0.65 + mask * 0.35
      colors.push(0.15 * bright, 0.95 * bright, 1.0 * bright)
    }
    return {
      position: new Float32Array(positions),
      color: new Float32Array(colors),
    }
  }, [])

  const auraPoints = useMemo(() => {
    const points = new Float32Array(520 * 3)
    for (let index = 0; index < 520; index += 1) {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / 520)
      const theta = Math.PI * (1 + Math.sqrt(5)) * index
      const radius = 1.68 + Math.sin(index * 12.9898) * 0.08
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
    const t = state.clock.elapsedTime
    if (baseMat.current) baseMat.current.uniforms.uTime.value = t
    if (landMat.current) landMat.current.uniforms.uTime.value = t
  })

  return (
    <>
      <group ref={globe}>
        {/* 深蓝球体底座 */}
        <mesh>
          <sphereGeometry args={[BASE_RADIUS, 96, 96]} />
          <shaderMaterial
            ref={baseMat}
            vertexShader={vertexShader}
            fragmentShader={baseFragmentShader}
            uniforms={{ uTime: { value: 0 } }}
            transparent
            depthWrite
          />
        </mesh>

        {/* 陆地浮层壳体：略高于球面 */}
        <mesh>
          <sphereGeometry args={[LAND_RADIUS, 128, 128]} />
          <shaderMaterial
            ref={landMat}
            vertexShader={vertexShader}
            fragmentShader={landFragmentShader}
            uniforms={{ uTime: { value: 0 } }}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* 陆地点云：进一步强化浮层立体感 */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[landPoints.position, 3]} />
            <bufferAttribute attach="attributes-color" args={[landPoints.color, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.022}
            transparent
            opacity={0.95}
            depthWrite={false}
            vertexColors
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>

        <mesh rotation={[0.48, 0.3, 0.2]}>
          <torusGeometry args={[1.58, 0.012, 8, 180]} />
          <meshBasicMaterial color="#4bf1ff" transparent opacity={0.72} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[Math.PI / 2.25, 0.2, 0]}>
          <torusGeometry args={[1.62, 0.009, 8, 180]} />
          <meshBasicMaterial color="#7a58f5" transparent opacity={0.48} blending={THREE.AdditiveBlending} />
        </mesh>

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[auraPoints, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#35ddff" size={0.022} transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>

      <mesh scale={1.17}>
        <sphereGeometry args={[BASE_RADIUS, 48, 48]} />
        <meshBasicMaterial color="#1575f5" side={THREE.BackSide} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={1.2}>
        <sphereGeometry args={[BASE_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#7b52f0" side={THREE.BackSide} transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  )
}

export function AiGlobe() {
  return (
    <div className="ai-globe" aria-label="绕Y轴旋转的数字地球">
      <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }}>
        <GlobeMesh />
      </Canvas>
      <div className="globe-label" aria-hidden="false">
        <img src="/images/ecosystem-header/ai_text.png" alt="AI 应用" className="globe-label-img" />
      </div>
    </div>
  )
}
