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

function PedestalRing({
  radius,
  tube,
  y,
  speed,
  color,
  opacity,
  tilt = 0,
}: {
  radius: number
  tube: number
  y: number
  speed: number
  color: string
  opacity: number
  tilt?: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed
  })
  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <torusGeometry args={[radius, tube, 12, 128]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
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
    <group position={[0, -1.5, 0]}>
      <mesh position={[0, -0.19, 0]}>
        <cylinderGeometry args={[2.05, 2.28, 0.14, 96]} />
        <meshStandardMaterial color="#041127" metalness={0.94} roughness={0.27} emissive="#052147" emissiveIntensity={0.42} />
      </mesh>
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[1.72, 2.04, 0.12, 96]} />
        <meshStandardMaterial color="#06162d" metalness={0.92} roughness={0.24} emissive="#082b58" emissiveIntensity={0.46} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.18, 1.55, 0.18, 96]} />
        <meshStandardMaterial color="#071a35" metalness={0.9} roughness={0.2} emissive="#0b3e75" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.76, 1.02, 0.12, 96]} />
        <meshStandardMaterial color="#092142" metalness={0.88} roughness={0.18} emissive="#0d568f" emissiveIntensity={0.7} />
      </mesh>

      <GlassPanel radius={0.98} y={0.24} opacity={0.28} />
      <mesh ref={glow} position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.68, 64]} />
        <meshBasicMaterial color="#2389c7" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <HexHalo />

      <group ref={clockwise}>
        <RadialTicks count={48} radius={1.48} length={0.18} y={0.05} />
        <RadialTicks count={24} radius={2.05} length={0.22} y={-0.13} />
        <PedestalRing radius={0.82} tube={0.022} y={0.29} speed={0} color="#8fcfff" opacity={0.78} />
        <PedestalRing radius={1.12} tube={0.014} y={0.2} speed={0} color="#2d8fc7" opacity={0.68} />
        <PedestalRing radius={1.58} tube={0.011} y={0.07} speed={0} color="#1766ad" opacity={0.52} />
        <ScanArc radius={1.35} y={0.06} arc={Math.PI * 0.62} speed={0.28} color="#bfe8ff" opacity={0.4} />
      </group>
      <group ref={counterClockwise}>
        <RadialTicks count={32} radius={1.78} length={0.14} y={-0.05} />
        <PedestalRing radius={1.82} tube={0.009} y={-0.08} speed={0} color="#2d8fc7" opacity={0.44} />
        <PedestalRing radius={2.27} tube={0.007} y={-0.27} speed={0} color="#1766ad" opacity={0.58} />
        <PedestalRing radius={2.42} tube={0.005} y={-0.39} speed={0} color="#1766ad" opacity={0.26} />
        <ScanArc radius={2.0} y={-0.1} arc={Math.PI * 0.45} speed={0.2} color="#5aa8e0" opacity={0.32} reverse />
      </group>

      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.1, 0.65, 2.05, 48, 1, true]} />
        <meshBasicMaterial color="#2d8fc7" transparent opacity={0.065} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 0.45, 0]} intensity={2.1} distance={6} color="#2d8fc7" />
      <pointLight position={[0, 1.7, 0.6]} intensity={0.85} distance={5} color="#8fcfff" />
    </group>
  )
}

function GlassPanel({ radius, y, opacity }: { radius: number; y: number; opacity: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 96]} />
      <meshPhysicalMaterial
        color="#0d3a66"
        transparent
        opacity={opacity}
        transmission={0.55}
        roughness={0.18}
        thickness={0.4}
        ior={1.15}
        clearcoat={0.6}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
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
