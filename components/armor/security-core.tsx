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

function Pedestal() {
  const spin = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.35
    if (glow.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.06
      glow.current.scale.set(s, 1, s)
      const mat = glow.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.22 + Math.sin(state.clock.elapsedTime * 2) * 0.06
    }
  })

  return (
    <group position={[0, -1.55, 0]}>
      {/* 厚实体台面 */}
      <mesh position={[0, 0.08, 0]} rotation={[-0.08, 0, 0]}>
        <cylinderGeometry args={[1.55, 1.72, 0.22, 64]} />
        <meshStandardMaterial color="#071428" metalness={0.75} roughness={0.35} emissive="#0a2a55" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, -0.12, 0]} rotation={[-0.08, 0, 0]}>
        <cylinderGeometry args={[1.72, 1.95, 0.28, 64]} />
        <meshStandardMaterial color="#050f1e" metalness={0.7} roughness={0.4} emissive="#071a33" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.38, 0]} rotation={[-0.08, 0, 0]}>
        <cylinderGeometry args={[1.95, 2.15, 0.32, 64]} />
        <meshStandardMaterial color="#040c18" metalness={0.65} roughness={0.45} emissive="#061428" emissiveIntensity={0.25} />
      </mesh>

      {/* 中心发光盘 */}
      <mesh ref={glow} position={[0, 0.22, 0]} rotation={[-Math.PI / 2 - 0.08, 0, 0]}>
        <circleGeometry args={[0.72, 48]} />
        <meshBasicMaterial color="#3db8ff" transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2 - 0.08, 0, 0]}>
        <ringGeometry args={[0.55, 0.78, 64]} />
        <meshBasicMaterial color="#7adfff" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <group ref={spin}>
        <PedestalRing radius={1.05} tube={0.018} y={0.28} speed={0.55} color="#5ad4ff" opacity={0.85} />
        <PedestalRing radius={1.28} tube={0.014} y={0.18} speed={-0.32} color="#2a8fff" opacity={0.7} />
        <PedestalRing radius={1.52} tube={0.012} y={0.05} speed={0.22} color="#4ec8ff" opacity={0.55} />
        <PedestalRing radius={1.78} tube={0.01} y={-0.12} speed={-0.18} color="#1e6fd0" opacity={0.45} />
        <PedestalRing radius={2.02} tube={0.009} y={-0.32} speed={0.14} color="#3aa0ff" opacity={0.35} />
      </group>

      {/* 向上光柱 */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.08, 0.55, 2.2, 24, 1, true]} />
        <meshBasicMaterial color="#4ec8ff" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 0.6, 0]} intensity={2.4} distance={6} color="#4ec8ff" />
      <pointLight position={[0, 1.8, 0.4]} intensity={1.2} distance={5} color="#8adfff" />
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
      <pointsMaterial color="#6ad8ff" size={0.03} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function SecurityScene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 2]} intensity={0.8} color="#c8e8ff" />
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
        camera={{ position: [0, 1.05, 6.2], fov: 38, near: 0.1, far: 40 }}
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
