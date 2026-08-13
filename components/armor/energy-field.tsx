'use client'

import { useEffect, useRef } from 'react'

type Comet = { p: number; speed: number; len: number; size: number }
type RingPulse = { ring: number; a: number; speed: number; len: number }
type Dust = { x: number; y: number; vx: number; vy: number; r: number; o: number }
type Beam = { x: number; life: number; ttl: number; h: number }

const RING_RATIOS = [0.3, 0.44, 0.58, 0.72]

/**
 * 背景能量场：地平线能量流、地面光环脉冲、上升粒子与能量光柱。
 * 使用 canvas + 叠加混合模式，营造高科技动态氛围。
 */
export function EnergyField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 1
    let h = 1

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth || 1
      h = canvas.clientHeight || 1
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    // 地平线弧线：中间隆起
    const horizonY = (p: number) => h * 0.578 - h * 0.05 * Math.sin(Math.PI * p)

    const comets: Comet[] = Array.from({ length: 6 }, () => ({
      p: Math.random(),
      speed: 0.055 + Math.random() * 0.075,
      len: 0.1 + Math.random() * 0.14,
      size: 1 + Math.random() * 1.6,
    }))

    const pulses: RingPulse[] = Array.from({ length: 10 }, () => {
      const ring = Math.floor(Math.random() * RING_RATIOS.length)
      return {
        ring,
        a: Math.random() * Math.PI * 2,
        speed: (0.16 + Math.random() * 0.24) * (Math.random() > 0.5 ? 1 : -1),
        len: 0.14 + Math.random() * 0.26,
      }
    })

    const dust: Dust[] = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.008,
      vy: -(0.006 + Math.random() * 0.018),
      r: 0.4 + Math.random() * 1.5,
      o: 0.15 + Math.random() * 0.6,
    }))

    const beams: Beam[] = []

    let raf = 0
    let last = performance.now()
    let elapsed = 0

    const drawComets = (dt: number) => {
      for (const c of comets) {
        c.p += c.speed * dt
        if (c.p > 1 + c.len) c.p = -c.len

        const steps = 26
        for (let i = 0; i < steps; i++) {
          const t = i / steps
          const p = c.p - c.len * t
          if (p < 0 || p > 1) continue
          const x = p * w
          const y = horizonY(p)
          const fade = (1 - t) ** 2
          ctx.beginPath()
          ctx.arc(x, y, c.size * (0.5 + fade), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(150, 220, 255, ${0.5 * fade})`
          ctx.fill()
        }

        if (c.p >= 0 && c.p <= 1) {
          const x = c.p * w
          const y = horizonY(c.p)
          const r = 26 * c.size
          const g = ctx.createRadialGradient(x, y, 0, x, y, r)
          g.addColorStop(0, 'rgba(225, 245, 255, 0.7)')
          g.addColorStop(0.28, 'rgba(90, 175, 255, 0.22)')
          g.addColorStop(1, 'rgba(40, 110, 220, 0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const drawRingPulses = (dt: number) => {
      const cx = w / 2
      const cy = h * 0.795
      for (const p of pulses) {
        p.a += p.speed * dt
        const rx = w * RING_RATIOS[p.ring]
        const ry = rx * 0.19
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, p.a, p.a + p.len * Math.sign(p.speed))
        const head = {
          x: cx + rx * Math.cos(p.a),
          y: cy + ry * Math.sin(p.a),
        }
        const tail = {
          x: cx + rx * Math.cos(p.a + p.len * Math.sign(p.speed)),
          y: cy + ry * Math.sin(p.a + p.len * Math.sign(p.speed)),
        }
        const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y)
        grad.addColorStop(0, 'rgba(170, 225, 255, 0.4)')
        grad.addColorStop(1, 'rgba(60, 140, 255, 0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.4
        ctx.lineCap = 'round'
        ctx.stroke()

        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 14)
        glow.addColorStop(0, 'rgba(215, 242, 255, 0.45)')
        glow.addColorStop(1, 'rgba(60, 140, 255, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(head.x, head.y, 14, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawDust = (dt: number) => {
      for (const d of dust) {
        d.x += d.vx * dt
        d.y += d.vy * dt
        if (d.y < -0.05) {
          d.y = 1.05
          d.x = Math.random()
        }
        if (d.x < -0.05) d.x = 1.05
        if (d.x > 1.05) d.x = -0.05
        const twinkle = 0.6 + 0.4 * Math.sin(elapsed * 2 + d.x * 40)
        ctx.beginPath()
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 225, 255, ${d.o * twinkle})`
        ctx.fill()
      }
    }

    const drawBeams = (dt: number) => {
      if (beams.length < 4 && Math.random() < dt * 1.1) {
        const edge = Math.random() > 0.5
        beams.push({
          x: edge ? 0.04 + Math.random() * 0.26 : 0.7 + Math.random() * 0.26,
          life: 0,
          ttl: 1.6 + Math.random() * 1.4,
          h: 0.22 + Math.random() * 0.3,
        })
      }
      for (let i = beams.length - 1; i >= 0; i--) {
        const b = beams[i]
        b.life += dt
        if (b.life > b.ttl) {
          beams.splice(i, 1)
          continue
        }
        const t = b.life / b.ttl
        const alpha = Math.sin(Math.PI * t) * 0.5
        const baseY = horizonY(b.x) + h * 0.02
        const topY = baseY - h * b.h * Math.min(1, t * 2.2)
        const g = ctx.createLinearGradient(b.x * w, baseY, b.x * w, topY)
        g.addColorStop(0, `rgba(160, 220, 255, ${alpha})`)
        g.addColorStop(1, 'rgba(60, 140, 255, 0)')
        ctx.strokeStyle = g
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(b.x * w, baseY)
        ctx.lineTo(b.x * w, topY)
        ctx.stroke()
      }
    }

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      elapsed += dt

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      drawComets(dt)
      drawRingPulses(dt)
      drawDust(dt)
      drawBeams(dt)
      ctx.globalCompositeOperation = 'source-over'

      raf = requestAnimationFrame(frame)
    }

    if (reduced) {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      drawComets(0)
      drawRingPulses(0)
      drawDust(0)
      ctx.globalCompositeOperation = 'source-over'
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className={className} />
}
