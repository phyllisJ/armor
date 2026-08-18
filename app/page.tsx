'use client'

import { useEffect, useState } from 'react'
import { RotateCcw, User, Users, Download, Server, Cpu, Waypoints, Zap, CloudCog } from 'lucide-react'
import { ArmorLogo } from '@/components/armor/armor-logo'
import { SceneBackground } from '@/components/armor/scene-background'
import { AiGlobe } from '@/components/armor/ai-globe'
import { DataSecurityScreen } from '@/components/armor/data-security-screen'

type BizTab = 'app' | 'network' | 'data'

const TABS: { id: BizTab; label: string }[] = [
  { id: 'app', label: 'AI应用' },
  { id: 'network', label: 'AI网络安全' },
  { id: 'data', label: 'AI数据安全' },
]

const apps = [
  { icon: '/images/ecosystem-header/chongchong_icon.png', name: '虫虫助手', type: '应用分发', tone: 'red' },
  { icon: '/images/ecosystem-header/7723_icon.png', name: '7723 游戏盒子', type: '游戏平台', tone: 'green' },
  { icon: '/images/ecosystem-header/jingyun_icon.png', name: '鲸云漫游', type: '云游戏', tone: 'violet' },
  { icon: '/images/ecosystem-header/cato_icon.png', name: 'Cato Game', type: '游戏服务', tone: 'yellow' },
  { icon: '/images/ecosystem-header/playmodes_icon.png', name: 'PlayMods', type: '内容社区', tone: 'blue' },
  { icon: '/images/ecosystem-header/cc_icon.png', name: 'CC 加速器', type: '网络服务', tone: 'cyan' },
  { icon: '/images/ecosystem-header/widget_icon.png', name: 'Widget Island', type: '桌面组件', tone: 'peach' },
  { icon: '/images/ecosystem-header/shanwan_icon.png', name: '闪玩', type: '云端游戏', tone: 'amber' },
  { icon: '/images/ecosystem-header/gelai_icon.png', name: '格来云游戏', type: '云游戏', tone: 'mint' },
]

const ORBIT = { cx: 50, cy: 44, rx: 40, ry: 37 }
/** 从顶部顺时针排列，与参考图一致：7723 在 12 点方向 */
const ORBIT_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 0]

function getOrbitPosition(index: number) {
  const slot = ORBIT_ORDER.indexOf(index)
  const angle = (-90 + slot * (360 / apps.length)) * (Math.PI / 180)
  // 上下方向额外拉开；仅 7723 比拉开后的位置内收约 20px，避免遮挡
  const verticalFactor = Math.pow(Math.abs(Math.sin(angle)), 1.35)
  const stretchY = 1 + verticalFactor * 0.34
  const stretchX = 1 + verticalFactor * 0.06
  let x = ORBIT.cx + ORBIT.rx * Math.cos(angle) * stretchX
  let y = ORBIT.cy + ORBIT.ry * Math.sin(angle) * stretchY
  if (index === 1) {
    // core-orbit 高度约 430px，20px ≈ 4.65%
    y += 4.65
  }
  return { x, y, tone: x >= 49 ? 'orange' as const : 'cyan' as const }
}

/** 磁力线弧度：向外扇开且控制角不超过相邻半角距，避免交叉 */
function getLinkPath(target: { x: number; y: number }) {
  const { cx: sx, cy: sy } = ORBIT
  const ex = target.x
  const ey = target.y
  const dx = ex - sx
  const dy = ey - sy
  const len = Math.hypot(dx, dy) || 1
  const theta = Math.atan2(dy, dx)

  const halfGap = (Math.PI * 2) / apps.length / 2
  const sideWeight = Math.min(1, Math.abs(Math.cos(theta)) * 1.05)
  const sideSign = Math.abs(dx) < 2 ? (dy < 0 ? 1 : -1) * 0.45 : Math.sign(dx || 1)
  const fan = sideSign * Math.min(halfGap * 0.72, 0.07 + sideWeight * 0.18)

  const r1 = len * 0.3
  const r2 = len * 0.74
  const a1 = theta + fan
  const a2 = theta + fan * 0.42
  const c1x = sx + Math.cos(a1) * r1
  const c1y = sy + Math.sin(a1) * r1
  const c2x = sx + Math.cos(a2) * (r2 + len * 0.04)
  const c2y = sy + Math.sin(a2) * (r2 + len * 0.04)

  return `M${sx.toFixed(2)},${sy.toFixed(2)} C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${ex.toFixed(2)},${ey.toFixed(2)}`
}

const nodeAnchors = apps.map((_, index) => getOrbitPosition(index))

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
  const [activeTab, setActiveTab] = useState<BizTab>('app')

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
              <nav aria-label="业务分类">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={activeTab === tab.id ? 'active' : undefined}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {activeTab === 'app' && (
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
            <div className="core-divider core-divider-left" aria-hidden="true"><i /><em /><b /></div>
            <div className="core-divider core-divider-right" aria-hidden="true"><i /><em /><b /></div>
            <div className="metric-row">
              {metrics.map((m, index) => <Metric key={m.label} {...m} active={showEcosystem} delay={620 + index * 140} />)}
            </div>
            <div className="core-orbit">
            <svg className="node-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <filter id="aurora-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="aurora-soft" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
                  <feMerge><feMergeNode in="blur" /></feMerge>
                </filter>
                <filter id="laser-halo" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.55" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <radialGradient id="laser-core-cyan" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="45%" stopColor="#8ebfff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#1575f5" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="laser-core-orange" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="45%" stopColor="#ffc58a" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f97a00" stopOpacity="0" />
                </radialGradient>
              </defs>
              {nodeAnchors.map((n, index) => {
                const path = getLinkPath(n)
                const isOrange = n.tone === 'orange'
                const delay = `${1 + index * 0.16}s`
                const coreFill = isOrange ? 'url(#laser-core-orange)' : 'url(#laser-core-cyan)'
                const haloFill = isOrange ? '#f97a00' : '#1575f5'
                return (
                  <g key={index} className={`link-group link-${n.tone}`} style={{ '--link-delay': delay } as React.CSSProperties}>
                    <path className="link-aurora link-aurora-bloom" d={path} filter="url(#aurora-soft)" />
                    <path className="link-aurora link-aurora-mid" d={path} filter="url(#aurora-glow)" />
                    <path className="link-aurora link-aurora-core" d={path} />
                    <path className="link-aurora link-aurora-flow" d={path} />
                    {[0, 1, 2].map((dot) => {
                      const begin = `${0.9 + dot * 0.85 + index * 0.06}s`
                      const dur = `${2.6 + index * 0.05 + dot * 0.12}s`
                      const coreR = dot === 0 ? 0.42 : 0.28
                      const haloR = dot === 0 ? 0.95 : 0.68
                      return (
                        <g key={dot} className="laser-dot">
                          <circle className="laser-halo" r={haloR} fill={haloFill} filter="url(#laser-halo)" opacity={0.55}>
                            <animateMotion dur={dur} begin={begin} repeatCount="indefinite" path={path} />
                          </circle>
                          <circle className="laser-core" r={coreR} fill={coreFill}>
                            <animateMotion dur={dur} begin={begin} repeatCount="indefinite" path={path} />
                          </circle>
                        </g>
                      )
                    })}
                  </g>
                )
              })}
            </svg>
            <AiGlobe />
            {apps.map((app, index) => {
              const orbit = getOrbitPosition(index)
              return (
              <div
                className="app-node"
                style={{ '--i': index, '--orbit-x': `${orbit.x}%`, '--orbit-y': `${orbit.y}%` } as React.CSSProperties}
                key={app.name}
              >
                <div className="app-visual">
                  <img src="/images/ecosystem-header/icon_bg.png" alt="" className="app-base" aria-hidden="true" />
                  <div className={`app-icon ${app.tone}`}><img src={app.icon} alt={app.name} className="app-icon-img" /></div>
                </div>
                <strong>{app.name}</strong>
              </div>
              )
            })}
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
            <div className="points">
              {points.map(([text, tone], index) => (
                <p key={text} className={tone} style={{ '--scene-index': index } as React.CSSProperties}><i />{text}</p>
              ))}
            </div>
          </aside>
        </div>
        )}

        {activeTab === 'network' && (
          <div className="tab-placeholder reveal delay-2" role="status">
            <p>AI网络安全</p>
            <span>内容建设中</span>
          </div>
        )}

        {activeTab === 'data' && <DataSecurityScreen active={showEcosystem} />}
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
  const color = tone === 'blue' ? '#34d0ef' : '#2adcb8'
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
    const duration = 2200
    const timer = window.setTimeout(() => {
      const startedAt = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
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
