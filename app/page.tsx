'use client'

import { useEffect, useState } from 'react'
import { RotateCcw, User, Users, Download, Server, Cpu, Waypoints, Zap, CloudCog } from 'lucide-react'
import { ArmorLogo } from '@/components/armor/armor-logo'
import { SceneBackground } from '@/components/armor/scene-background'
import { AiGlobe } from '@/components/armor/ai-globe'

const apps = [
  { icon: '虫', name: '虫虫助手', type: '应用分发', tone: 'red' },
  { icon: '7', name: '7723 游戏盒子', type: '游戏平台', tone: 'green' },
  { icon: '游', name: '鲸云漫游', type: '云游戏', tone: 'violet' },
  { icon: '游', name: 'Cato Game', type: '游戏服务', tone: 'yellow' },
  { icon: 'P', name: 'PlayMods', type: '内容社区', tone: 'blue' },
  { icon: 'CC', name: 'CC 加速器', type: '网络服务', tone: 'cyan' },
  { icon: '岛', name: 'Widget Island', type: '桌面组件', tone: 'peach' },
  { icon: '闪', name: '闪玩', type: '云端游戏', tone: 'amber' },
  { icon: '格来', name: '格来云游戏', type: '云游戏', tone: 'mint' },
]

/** 每个应用节点相对核心球体的连接线终点（百分比坐标，viewBox 0-100） */
const nodeAnchors = [
  { x: 17, y: 33, tone: 'cyan' },
  { x: 46, y: 16, tone: 'orange' },
  { x: 81, y: 33, tone: 'cyan' },
  { x: 88, y: 53, tone: 'cyan' },
  { x: 80, y: 75, tone: 'orange' },
  { x: 63, y: 89, tone: 'cyan' },
  { x: 44, y: 91, tone: 'cyan' },
  { x: 19, y: 67, tone: 'cyan' },
  { x: 11, y: 51, tone: 'cyan' },
]

const metrics = [
  { icon: User, value: '1800', unit: '万+', label: '每月活跃用户' },
  { icon: Users, value: '3.17', unit: '亿+', label: '平台用户量' },
  { icon: Download, value: '24.8', unit: '亿+', label: '应用下载量' },
]

const leftItems = [
  { icon: Server, small: '边缘异构高阶效', big: '算力集群' },
  { icon: Cpu, small: 'ARM架构', big: '处理器' },
  { icon: Waypoints, small: '端云协同', big: '调度算法' },
  { icon: Zap, small: '并行渲染', big: 'GPU及AI加速单元' },
  { icon: CloudCog, small: '低延时 高并发', big: '云端服务能力' },
]

const points = [
  ['提高46%服务性能，降低客户硬件投入', 'tone-yellow'],
  ['实现跨终端协同与手势交互，提升远程效率', 'tone-blue'],
  ['弹性资源池，支持主流AI框架，降低算力成本', 'tone-cyan'],
]

// 首屏开场流程开关。
const ENABLE_INTRO_SCREEN = true

export default function Home() {
  const [showEcosystem, setShowEcosystem] = useState(!ENABLE_INTRO_SCREEN)
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    if (!ENABLE_INTRO_SCREEN) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setShowEcosystem(true), reduced ? 1200 : 3800)
    return () => window.clearTimeout(timer)
  }, [runId])

  const replay = () => {
    if (!ENABLE_INTRO_SCREEN) {
      setRunId((value) => value + 1)
      return
    }

    setShowEcosystem(false)
    setRunId((value) => value + 1)
  }

  return (
    <main className="armor-stage" aria-live="polite">
      {ENABLE_INTRO_SCREEN && (
        <section key={`intro-${runId}`} className={`intro-screen ${showEcosystem ? 'screen-exit' : 'screen-active'}`} aria-hidden={showEcosystem}>
          <SceneBackground />
          <div
            aria-hidden="true"
            className="armor-flash"
            style={{
              background:
                'radial-gradient(ellipse at 50% 44%, color-mix(in oklab, var(--glow) 70%, white), transparent 62%)',
              animation: 'armor-flash 1.6s ease-out 0.45s both',
            }}
          />
          <div className="intro-logo">
            <div key={runId} className="intro-logo-inner">
              <ArmorLogo />
            </div>
          </div>
        </section>
      )}

      <section key={`ecosystem-${runId}`} className={`ecosystem-screen ${showEcosystem ? 'screen-active' : 'screen-waiting'}`} aria-hidden={!showEcosystem}>
        <div className="ambient ambient-left" /><div className="ambient ambient-right" />
        <header className="screen-header reveal delay-1">
          <div className="header-banner">
            <img src="/images/ecosystem-header/title-bg.png" alt="" className="header-banner-bg" aria-hidden="true" />
            <div className="header-banner-content">
              <img src="/images/ecosystem-header/title-text.png" alt="铠甲业务生态" className="header-banner-title" />
              <nav aria-label="业务分类"><span className="active">AI应用</span><span>AI网络安全</span><span>AI数据安全</span></nav>
            </div>
          </div>
        </header>
        <div className="screen-layout">
          <aside className="left-panel reveal delay-2">
            <PanelTitle title="夯实算力基座" />
            <div className="capability-list">
              {leftItems.map(({ icon: Icon, small, big }, index) => (
                <div className="capability" style={{ '--capability-index': index } as React.CSSProperties} key={big}>
                  <span className="capability-visual">
                    <span className="capability-icon"><Icon aria-hidden="true" size={20} /></span>
                    <span className="capability-base" aria-hidden="true"><i /><i /></span>
                  </span>
                  <div className="capability-copy"><small>{small}</small><strong>{big}</strong></div>
                </div>
              ))}
            </div>
            <div className="rings">
              <Ring value={50} label="成本下降" tone="blue" active={showEcosystem} delay={2420} />
              <Ring value={30} label="性能提升" tone="cyan" active={showEcosystem} delay={2580} />
            </div>
          </aside>
          <div className="core-panel reveal delay-3">
            <div className="core-divider core-divider-left" aria-hidden="true"><i /><b /></div>
            <div className="core-divider core-divider-right" aria-hidden="true"><i /><b /></div>
            <div className="metric-row">
              {metrics.map((m, index) => <Metric key={m.label} {...m} active={showEcosystem} delay={620 + index * 140} />)}
            </div>
            <div className="core-orbit">
            <svg className="node-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <filter id="laser-glow"><feGaussianBlur stdDeviation="0.7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              {nodeAnchors.map((n, index) => {
                const path = `M50,44 Q${(50 + n.x) / 2},${(44 + n.y) / 2 + (index % 2 === 0 ? -6 : 6)} ${n.x},${n.y}`
                const color = n.tone === 'orange' ? '#ff8a2a' : '#30c8ff'
                return (
                  <g key={index}>
                    <path id={`node-path-${index}`} className={`link-path link-${n.tone}`} style={{ animationDelay: `${1 + index * 0.16}s` }} d={path} />
                    {[0, 1, 2].map((dot) => (
                      <circle key={dot} className="laser-dot" r={dot === 0 ? 0.75 : 0.48} fill={color} filter="url(#laser-glow)">
                        <animateMotion dur={`${2.8 + index * 0.07}s`} begin={`${dot * 0.7 + index * 0.08}s`} repeatCount="indefinite" path={path} />
                      </circle>
                    ))}
                  </g>
                )
              })}
            </svg>
            <div className="core-halo" /><AiGlobe />
            {apps.map((app, index) => (
              <div className={`app-node node-${index + 1}`} style={{ '--i': index } as React.CSSProperties} key={app.name}>
                <div className="app-spotlight" aria-hidden="true" />
                <div className="app-platform" aria-hidden="true"><i /><i /></div>
                <div className={`app-icon ${app.tone}`}>{app.icon}</div>
                <strong>{app.name}</strong><small>{app.type}</small>
              </div>
            ))}
            </div>
          </div>
          <aside className="right-panel reveal delay-4">
            <PanelTitle title="拓展B端场景" />
            <div className="clouds">
              <span className="deco deco-1" /><span className="deco deco-2" /><span className="deco deco-3" />
              <div className="cloud cloud-render"><span className="cloud-fluid" aria-hidden="true" /><span className="cloud-gloss" aria-hidden="true" /><b>云渲染</b></div>
              <div className="cloud cloud-office"><span className="cloud-fluid" aria-hidden="true" /><span className="cloud-gloss" aria-hidden="true" /><b>云办公</b></div>
              <div className="cloud cloud-power"><span className="cloud-fluid" aria-hidden="true" /><span className="cloud-gloss" aria-hidden="true" /><b>云算力</b></div>
            </div>
            <div className="points">{points.map(([text, tone]) => <p key={text} className={tone}><i />{text}</p>)}</div>
          </aside>
        </div>
      </section>

      <button type="button" className="replay-button" onClick={replay} aria-label="重新播放双屏动��"><RotateCcw aria-hidden="true" />重播动效</button>
    </main>
  )
}

function PanelTitle({ title }: { title: string }) { return <h3 className="panel-title"><span>◆</span>{title}<span>◆</span></h3> }
function Metric({ icon: Icon, value, label, unit, active, delay }: { icon: typeof User; value: string; label: string; unit: string; active: boolean; delay: number }) {
  const target = Number(value)
  const decimals = value.includes('.') ? value.split('.')[1].length : 0
  const [displayValue, setDisplayValue] = useState(decimals ? `0.${'0'.repeat(decimals)}` : '0')

  useEffect(() => {
    if (!active) {
      setDisplayValue(decimals ? `0.${'0'.repeat(decimals)}` : '0')
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplayValue(target.toFixed(decimals))
      return
    }

    let frame = 0
    const duration = 1500
    const timer = window.setTimeout(() => {
      const startedAt = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        setDisplayValue((target * eased).toFixed(decimals))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, delay)

    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [active, decimals, delay, target])

  return (
    <div className="metric">
      <span className="metric-icon"><Icon aria-hidden="true" size={22} strokeWidth={1.8} /></span>
      <div className="metric-text"><span>{label}</span><div><b>{displayValue}</b><small>{unit}</small></div></div>
    </div>
  )
}
function Ring({ value, label, tone, active, delay }: { value: number; label: string; tone: 'blue' | 'cyan'; active: boolean; delay: number }) {
  const color = tone === 'blue' ? '#28d8f5' : '#1ce8b0'
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setDisplayValue(0)
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplayValue(value)
      return
    }

    let frame = 0
    const duration = 1500
    const timer = window.setTimeout(() => {
      const startedAt = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        setDisplayValue(value * eased)
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, delay)

    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [active, delay, value])

  return (
    <div className="ring-wrap">
      <div className="liquid-ball" style={{ '--level': `${100 - displayValue}%`, '--liquid-color': color } as React.CSSProperties}>
        <div className="liquid-fill" aria-hidden="true">
          <i className="liquid-wave liquid-wave-back" />
          <i className="liquid-wave liquid-wave-front" />
        </div>
        <span className="liquid-gloss" aria-hidden="true" />
        <b>{Math.round(displayValue)}%</b>
      </div>
      <span className="ring-label">{label}</span>
    </div>
  )
}
