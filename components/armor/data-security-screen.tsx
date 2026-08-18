'use client'

import { useState, type CSSProperties } from 'react'
import { SecurityCore } from '@/components/armor/security-core'

type Feature = {
  id: string
  title: string
}

const leftFeatures: Feature[] = [
  { id: 'audit', title: '个人信息保护\n合规审计' },
  { id: 'assessment', title: '个人信息保护\n影响评估' },
]

const rightFeatures: Feature[] = [
  { id: 'privacy', title: 'APP隐私合规\n检测' },
  { id: 'detection', title: '移动应用安全\n检测' },
  { id: 'hardening', title: '移动应用安全\n加固' },
]

/** 竖排标题沿括号弧线排布：left=`(` / right=`)` */
function CurvedTitle({
  text,
  className,
  arc = 'left',
}: {
  text: string
  className?: string
  arc?: 'left' | 'right'
}) {
  const chars = Array.from(text)
  const last = Math.max(chars.length - 1, 1)
  const amplitude = 16
  const tilt = 6

  return (
    <h3 className={`ds-side-title ds-side-title-arc ds-side-title-arc-${arc} ${className ?? ''}`} aria-label={text}>
      {chars.map((ch, index) => {
        const t = index / last
        const bulge = Math.sin(Math.PI * t)
        const x = (arc === 'left' ? -1 : 1) * bulge * amplitude
        const rot = Math.cos(Math.PI * t) * (arc === 'left' ? tilt : -tilt)
        return (
          <span
            key={`${ch}-${index}`}
            style={
              {
                '--char-x': `${x.toFixed(1)}px`,
                '--char-rot': `${rot.toFixed(2)}deg`,
              } as CSSProperties
            }
          >
            {ch}
          </span>
        )
      })}
    </h3>
  )
}

function TechnologyNode({ feature, index, active, onSelect }: {
  feature: Feature
  index: number
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={`ds-feature ${active ? 'is-active' : ''}`}
      style={{ '--ds-i': index } as CSSProperties}
      onClick={onSelect}
      aria-pressed={active}
    >
      <span className="ds-feature-visual">
        <img src="/images/safe/des_icon.png" alt="" className="ds-feature-icon-img" aria-hidden="true" />
      </span>
      <strong>{feature.title}</strong>
    </button>
  )
}

function AiEngine({ label, side }: { label: string; side: 'left' | 'right' }) {
  const logo = side === 'left' ? '/images/safe/ai_logo_left.png' : '/images/safe/ai_logo_right.png'
  return (
    <div className={`ds-engine ds-engine-${side}`}>
      <img src={logo} alt="" className="ds-engine-logo" aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  )
}

export function DataSecurityScreen({ active }: { active: boolean }) {
  const [selected, setSelected] = useState('audit')

  return (
    <div className={`ds-body ${active ? 'ds-active' : ''}`}>
      <img src="/images/safe/bg_left.png" alt="" className="ds-side-bg ds-side-bg-left" aria-hidden="true" />
      <img src="/images/safe/bg_right.png" alt="" className="ds-side-bg ds-side-bg-right" aria-hidden="true" />

      <aside className="ds-side ds-side-left">
        <CurvedTitle text="个人信息保护平台" arc="left" />
        <div className="ds-feature-list">
          {leftFeatures.map((feature, index) => (
            <TechnologyNode key={feature.id} feature={feature} index={index} active={selected === feature.id} onSelect={() => setSelected(feature.id)} />
          ))}
        </div>
      </aside>

      <section className="ds-center" aria-label="AI 数据安全核心能力">
        <img src="/images/safe/left_arrow.png" alt="" className="ds-chevron ds-chevron-left" aria-hidden="true" />
        <div className="ds-center-layout">
          <AiEngine label="AI审计大模型" side="left" />
          <SecurityCore />
          <AiEngine label="AI风险识别引擎" side="right" />
        </div>
        <img src="/images/safe/right_arrow.png" alt="" className="ds-chevron ds-chevron-right" aria-hidden="true" />
      </section>

      <aside className="ds-side ds-side-right">
        <div className="ds-feature-list">
          {rightFeatures.map((feature, index) => (
            <TechnologyNode key={feature.id} feature={feature} index={index + 2} active={selected === feature.id} onSelect={() => setSelected(feature.id)} />
          ))}
        </div>
        <CurvedTitle text="隐私安全检测平台" arc="right" />
      </aside>
    </div>
  )
}
