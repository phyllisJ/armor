'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** 与 CSS `.security-ring` / logo 共用的呼吸周期（秒） */
const BREATH_PERIOD = 3.6

function useSafeTexture(src: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    let active = true
    loader.load(src, (tex) => {
      if (!active) {
        tex.dispose()
        return
      }
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      setTexture(tex)
    })
    return () => {
      active = false
      setTexture((prev) => {
        prev?.dispose()
        return null
      })
    }
  }, [src])

  return texture
}

function breathOffset(elapsed: number, amplitude: number) {
  // 0 → 1 → 0，与 ease-in-out 上下呼吸同频
  const wave = (1 - Math.cos((elapsed * Math.PI * 2) / BREATH_PERIOD)) / 2
  return wave * amplitude
}

function SecuritySphere() {
  const sphere = useRef<THREE.Group>(null)
  const emblem = useRef<THREE.Group>(null)
  const sparks = useRef<THREE.PointsMaterial>(null)
  const logoTex = useSafeTexture('/images/safe/logo.png')
  const logoBaseTex = useSafeTexture('/images/safe/logo_base.png')

  const { wire, positions } = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1.42, 2)
    const wireGeometry = new THREE.WireframeGeometry(geometry)
    const source = geometry.attributes.position
    const dots = new Float32Array(source.count * 3)

    for (let index = 0; index < source.count; index += 1) {
      dots[index * 3] = source.getX(index)
      dots[index * 3 + 1] = source.getY(index)
      dots[index * 3 + 2] = source.getZ(index)
    }

    geometry.dispose()
    return { wire: wireGeometry, positions: dots }
  }, [])

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime
    const lift = breathOffset(elapsed, 0.09)

    if (emblem.current) {
      emblem.current.position.y = 0.02 + lift
    }
    if (sphere.current) {
      sphere.current.rotation.y += delta * 0.12
      sphere.current.rotation.x = 0.05 + Math.sin(elapsed * 0.3) * 0.03
      // 球体整体轻微跟随呼吸，幅度小于 logo
      sphere.current.position.y = lift * 0.35
    }
    if (sparks.current) sparks.current.opacity = 0.42 + Math.sin(elapsed * 1.25) * 0.1
  })

  return (
    <group position={[0, 0.42, 0]} scale={0.945}>
      <mesh>
        <sphereGeometry args={[1.3, 48, 48]} />
        <meshBasicMaterial color="#041830" transparent opacity={0.55} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      <group ref={emblem} position={[0, 0.02, 0.08]}>
        {logoTex && (
          <mesh position={[0, 0.16, 0]} renderOrder={1}>
            <planeGeometry args={[1.38, 1.54]} />
            <meshBasicMaterial map={logoTex} transparent opacity={0.96} depthWrite={false} toneMapped={false} />
          </mesh>
        )}
        {logoBaseTex && (
          <mesh position={[0, -0.52, -0.02]} renderOrder={1}>
            <planeGeometry args={[1.72, 1.33]} />
            <meshBasicMaterial
              map={logoBaseTex}
              transparent
              opacity={0.92}
              depthWrite={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>

      <group ref={sphere}>
        <lineSegments geometry={wire} renderOrder={2}>
          <lineBasicMaterial
            color="#158cff"
            transparent
            opacity={0.28}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            linewidth={1}
          />
        </lineSegments>
        <points renderOrder={2}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={sparks}
            color="#29a8ff"
            size={0.02}
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        <mesh renderOrder={3}>
          <sphereGeometry args={[1.33, 40, 40]} />
          <meshBasicMaterial color="#0a4a9a" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh renderOrder={3}>
          <sphereGeometry args={[1.38, 32, 32]} />
          <meshBasicMaterial
            color="#076cff"
            transparent
            opacity={0.08}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  )
}

const STAR_COUNT = 28

function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, index) => {
        const t = index / STAR_COUNT
        return {
          id: index,
          left: `${8 + ((index * 37) % 84)}%`,
          bottom: `${12 + ((index * 53) % 72)}%`,
          size: 1.5 + (index % 4) * 0.9,
          delay: `${(t * BREATH_PERIOD).toFixed(2)}s`,
          duration: `${(1.8 + (index % 5) * 0.45).toFixed(2)}s`,
          drift: `${((index % 2 === 0 ? 1 : -1) * (6 + (index % 5) * 3)).toFixed(1)}px`,
        }
      }),
    [],
  )

  return (
    <div className="security-starfield" aria-hidden="true">
      {stars.map((star) => (
        <i
          key={star.id}
          style={
            {
              '--star-left': star.left,
              '--star-bottom': star.bottom,
              '--star-size': `${star.size}px`,
              '--star-delay': star.delay,
              '--star-duration': star.duration,
              '--star-drift': star.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function SecurityCore() {
  return (
    <div className="security-core" aria-label="AI数据安全三维核心" style={{ '--breath-period': `${BREATH_PERIOD}s` } as React.CSSProperties}>
      <img src="/images/safe/bg.png" alt="" className="security-bg" aria-hidden="true" />

      <div className="security-sphere-stage">
        <Canvas
          className="security-sphere-canvas"
          camera={{ position: [0, 0.35, 5.1], fov: 40, near: 0.1, far: 30 }}
          dpr={[1, 1.55]}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.55} />
          <SecuritySphere />
        </Canvas>
        <span className="security-sphere-rim" aria-hidden="true" />
      </div>

      <Starfield />

      <img src="/images/safe/ring.png" alt="" className="security-ring" aria-hidden="true" />
      <img src="/images/safe/base.png" alt="" className="security-base" aria-hidden="true" />
    </div>
  )
}
