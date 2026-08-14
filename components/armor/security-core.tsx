'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WireSphere() {
  const group = useRef<THREE.Group>(null)
  const sparkMat = useRef<THREE.PointsMaterial>(null)

  const { wire, points, colors } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.42, 2)
    const wireGeo = new THREE.WireframeGeometry(geo)
    const pos = geo.attributes.position
    const count = pos.count
    const pts = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      pts[i * 3] = pos.getX(i)
      pts[i * 3 + 1] = pos.getY(i)
      pts[i * 3 + 2] = pos.getZ(i)
      const t = 0.55 + (i % 7) * 0.06
      cols[i * 3] = 0.35 * t
      cols[i * 3 + 1] = 0.85 * t
      cols[i * 3 + 2] = 1.0 * t
    }
    geo.dispose()
    return { wire: wireGeo, points: pts, colors: cols }
  }, [])

  useFrame((state, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.18
    group.current.rotation.x = 0.08 + Math.sin(state.clock.elapsedTime * 0.35) * 0.04
    if (sparkMat.current) {
      sparkMat.current.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 1.4) * 0.18
    }
  })

  return (
    <group ref={group} position={[0, 0.55, 0]}>
      <mesh>
        <sphereGeometry args={[1.28, 48, 48]} />
        <meshBasicMaterial color="#061a36" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.34, 32, 32]} />
        <meshBasicMaterial
          color="#1a6fff"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={wire}>
        <lineBasicMaterial color="#4ec8ff" transparent opacity={0.55} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={sparkMat}
          size={0.038}
          transparent
          opacity={0.72}
          depthWrite={false}
          vertexColors
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

function Tier({
  topRadius,
  bottomRadius,
  top,
  height,
  bodyColor,
  emissive,
  emissiveIntensity,
  surfaceColor,
  surfaceOpacity,
  rimColor,
  rimOpacity,
}: {
  topRadius: number
  bottomRadius: number
  top: number
  height: number
  bodyColor: string
  emissive: string
  emissiveIntensity: number
  surfaceColor: string
  surfaceOpacity: number
  rimColor: string
  rimOpacity: number
}) {
  // 1px 描边：场景中约 105px/单位，总宽 0.0095 单位
  const rimHalf = 0.00475
  const rimInner = topRadius - rimHalf
  const rimOuter = topRadius + rimHalf

  return (
    <group>
      {/* 玻璃侧壁 */}
      <mesh position={[0, top - height / 2, 0]}>
        <cylinderGeometry args={[topRadius, bottomRadius, height, 128]} />
        <meshPhysicalMaterial
          color={bodyColor}
          transparent
          opacity={0.16}
          transmission={0.94}
          thickness={0.35}
          ior={1.3}
          roughness={0.07}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity * 0.32}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 玻璃顶面 */}
      <mesh position={[0, top + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[topRadius, 128]} />
        <meshPhysicalMaterial
          color={surfaceColor}
          transparent
          opacity={surfaceOpacity * 0.26}
          transmission={0.92}
          thickness={0.15}
          ior={1.25}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 顶面 1px 描边光环 */}
      <mesh position={[0, top + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[rimInner, rimOuter, 200]} />
        <meshBasicMaterial color={rimColor} transparent opacity={rimOpacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function DashedRing({
  radius,
  y,
  count,
  dashLength,
  thickness,
  color,
  opacity,
}: {
  radius: number
  y: number
  count: number
  dashLength: number
  thickness: number
  color: string
  opacity: number
}) {
  return (
    <group position={[0, y, 0]}>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
            <boxGeometry args={[dashLength, 0.008, thickness]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        )
      })}
    </group>
  )
}

function RadialTicks({ count, radius, length, y }: { count: number; radius: number; length: number; y: number }) {
  return (
    <group position={[0, y, 0]}>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2
        return (
          <mesh
            key={index}
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.025, 0.018, index % 4 === 0 ? length * 1.65 : length]} />
            <meshBasicMaterial
              color={index % 4 === 0 ? '#8fcfff' : '#1766ad'}
              transparent
              opacity={index % 4 === 0 ? 0.72 : 0.38}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function Pedestal() {
  const clockwise = useRef<THREE.Group>(null)
  const counterClockwise = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (clockwise.current) clockwise.current.rotation.y += delta * 0.34
    if (counterClockwise.current) counterClockwise.current.rotation.y -= delta * 0.2
    if (glow.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.045
      glow.current.scale.set(pulse, 1, pulse)
      ;(glow.current.material as THREE.MeshBasicMaterial).opacity = 0.28 + Math.sin(state.clock.elapsedTime * 2) * 0.07
    }
  })

  return (
    <group position={[0, -1.35, 0]}>
      {/* 地面细虚线环 + 静态外圈光环 */}
      <DashedRing radius={2.62} y={-0.46} count={120} dashLength={0.05} thickness={0.11} color="#2f8fd0" opacity={0.55} />
      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.51525, 2.52475, 200]} />
        <meshBasicMaterial color="#2a86cf" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* 阶梯发光平台，由宽到窄逐层抬升 */}
      <Tier
        topRadius={2.18}
        bottomRadius={2.34}
        top={-0.32}
        height={0.14}
        bodyColor="#0a2647"
        emissive="#123f78"
        emissiveIntensity={0.6}
        surfaceColor="#1c5c9c"
        surfaceOpacity={0.32}
        rimColor="#5cb6f5"
        rimOpacity={0.7}
      />
      <Tier
        topRadius={1.7}
        bottomRadius={1.9}
        top={-0.16}
        height={0.16}
        bodyColor="#0c2e57"
        emissive="#17579c"
        emissiveIntensity={0.72}
        surfaceColor="#2472b8"
        surfaceOpacity={0.36}
        rimColor="#77caff"
        rimOpacity={0.8}
      />
      <Tier
        topRadius={1.16}
        bottomRadius={1.4}
        top={0.02}
        height={0.18}
        bodyColor="#0e3868"
        emissive="#1c6ab5"
        emissiveIntensity={0.9}
        surfaceColor="#2f8fd8"
        surfaceOpacity={0.42}
        rimColor="#9adcff"
        rimOpacity={0.9}
      />
      <Tier
        topRadius={0.78}
        bottomRadius={1.02}
        top={0.2}
        height={0.18}
        bodyColor="#124a86"
        emissive="#2f8fd8"
        emissiveIntensity={1.15}
        surfaceColor="#5cbcf0"
        surfaceOpacity={0.5}
        rimColor="#cdeeff"
        rimOpacity={1}
      />

      {/* 中心高亮能量核心 */}
      <mesh ref={glow} position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 96]} />
        <meshBasicMaterial color="#a9e2ff" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 64]} />
        <meshBasicMaterial color="#f0fbff" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <HexHalo />

      {/* 齿轮刻度环，随台面旋转 */}
      <group ref={clockwise}>
        <RadialTicks count={56} radius={1.5} length={0.16} y={0.03} />
        <ScanArc radius={1.32} y={0.05} arc={Math.PI * 0.6} speed={0.3} color="#cdeeff" opacity={0.5} />
      </group>
      <group ref={counterClockwise}>
        <RadialTicks count={40} radius={2.0} length={0.13} y={-0.31} />
        <ScanArc radius={2.24} y={-0.44} arc={Math.PI * 0.5} speed={0.22} color="#6cbdf0" opacity={0.4} reverse />
      </group>

      {/* 中心向上能量光柱 */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.12, 0.5, 1.9, 48, 1, true]} />
        <meshBasicMaterial color="#8fd4ff" transparent opacity={0.09} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 0.5, 0]} intensity={2.6} distance={6} color="#5cbcf0" />
      <pointLight position={[0, 1.7, 0.6]} intensity={0.9} distance={5} color="#a9e2ff" />
    </group>
  )
}

function ScanArc({
  radius,
  y,
  arc,
  speed,
  color,
  opacity,
  reverse = false,
}: {
  radius: number
  y: number
  arc: number
  speed: number
  color: string
  opacity: number
  reverse?: boolean
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed * (reverse ? -1 : 1)
  })
  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.02, radius + 0.02, 64, 1, 0, arc]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function HexHalo() {
  const ref = useRef<THREE.Group>(null)
  const positions = useMemo(() => {
    const total = 72
    const arr = new Float32Array(total * 3)
    for (let i = 0; i < total; i += 1) {
      const a = (i / total) * Math.PI * 2
      const r = 1.35 + Math.sin(i * 1.7) * 0.06
      arr[i * 3] = Math.cos(a) * r
      arr[i * 3 + 1] = 0
      arr[i * 3 + 2] = Math.sin(a) * r
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * -0.12
    const mat = (ref.current.children[0] as THREE.Points)?.material as THREE.PointsMaterial
    if (mat) mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 1.2) * 0.14
  })

  return (
    <group ref={ref} position={[0, 0.62, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#a9dcff"
          size={0.032}
          transparent
          opacity={0.36}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

function FloatingDust() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(90 * 3)
    for (let i = 0; i < 90; i += 1) {
      const a = (i / 90) * Math.PI * 2
      const r = 1.6 + (i % 5) * 0.22
      arr[i * 3] = Math.cos(a) * r
      arr[i * 3 + 1] = -0.2 + (i % 7) * 0.28
      arr[i * 3 + 2] = Math.sin(a) * r * 0.55
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.08
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#8fcfff" size={0.025} transparent opacity={0.34} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function SecurityScene() {
  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={[3, 5, 2]} intensity={0.48} color="#8fcfff" />
      <WireSphere />
      <Pedestal />
      <FloatingDust />
    </>
  )
}

function ShieldLogo() {
  return (
    <svg className="security-shield-svg" viewBox="0 0 120 140" aria-hidden="true">
      <defs>
        <linearGradient id="shieldFill" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#f4fbff" />
          <stop offset="45%" stopColor="#d8ecf8" />
          <stop offset="100%" stopColor="#9eb8d0" />
        </linearGradient>
        <filter id="shieldGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M60 8 L104 28 V68 C104 98 84 118 60 130 C36 118 16 98 16 68 V28 Z"
        fill="url(#shieldFill)"
        stroke="#8ec8ef"
        strokeWidth="2.5"
        filter="url(#shieldGlow)"
      />
      <circle cx="60" cy="62" r="22" fill="#0a1a2e" stroke="#5a7a98" strokeWidth="3" />
      <path d="M60 50 C54 50 50 54 50 60 C50 65 53 68 57 69 V78 H63 V69 C67 68 70 65 70 60 C70 54 66 50 60 50 Z" fill="#d8ecf8" />
    </svg>
  )
}

export function SecurityCore() {
  return (
    <div className="security-core" aria-label="AI数据安全三维核心">
      <Canvas
        camera={{ position: [0, 0.58, 6.4], fov: 38, near: 0.1, far: 40 }}
        dpr={[1, 1.6]}
        gl={{ alpha: true, antialias: true }}
      >
        <SecurityScene />
      </Canvas>
      <div className="security-shield" aria-hidden="true">
        <ShieldLogo />
      </div>
    </div>
  )
}
