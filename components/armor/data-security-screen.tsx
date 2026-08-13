'use client'

import { SecurityCore } from '@/components/armor/security-core'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Feature = { id: string; title: string; icon: 'audit' | 'assess' | 'privacy' | 'detect' | 'harden' }

const leftFeatures: Feature[] = [
  { id: 'l1', title: '个人信息保护合规审计', icon: 'audit' },
  { id: 'l2', title: '个人信息保护影响评估', icon: 'assess' },
]

const rightFeatures: Feature[] = [
  { id: 'r1', title: 'APP隐私合规检测', icon: 'privacy' },
  { id: 'r2', title: '移动应用安全检测', icon: 'detect' },
  { id: 'r3', title: '移动应用安全加固', icon: 'harden' },
]

function PedestalBase() {
  return (
    <span className="ds-pedestal" aria-hidden="true">
      <i className="ds-pedestal-glow" />
      <i className="ds-pedestal-ring ds-pedestal-ring-a" />
      <i className="ds-pedestal-ring ds-pedestal-ring-b" />
      <i className="ds-pedestal-disk" />
    </span>
  )
}

function FeatureIcon({ type }: { type: Feature['icon'] }) {
  const common = { viewBox: '0 0 64 64', className: 'ds-feature-svg', 'aria-hidden': true as const }
  if (type === 'audit') {
    return (
      <svg {...common}>
        <rect x="10" y="12" width="32" height="40" rx="4" fill="#1a4a78" stroke="#5ec8ff" strokeWidth="2" />
        <path d="M16 22h20M16 30h16M16 38h18" stroke="#8adfff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="42" cy="40" r="12" fill="#0d2a48" stroke="#5ec8ff" strokeWidth="2.5" />
        <circle cx="42" cy="40" r="5" fill="none" stroke="#b8f0ff" strokeWidth="2" />
        <path d="M50 48l6 6" stroke="#b8f0ff" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === 'assess') {
    return (
      <svg {...common}>
        <rect x="12" y="14" width="40" height="36" rx="5" fill="#1a4a78" stroke="#5ec8ff" strokeWidth="2" />
        <path d="M32 20l12 6v8c0 8-5.5 14-12 16-6.5-2-12-8-12-16v-8z" fill="#d8ecf8" stroke="#8adfff" strokeWidth="1.5" />
        <path d="M26 34l4 4 8-9" fill="none" stroke="#0a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (type === 'privacy') {
    return (
      <svg {...common}>
        <rect x="18" y="8" width="28" height="48" rx="5" fill="#1a4a78" stroke="#5ec8ff" strokeWidth="2" />
        <rect x="24" y="14" width="16" height="28" rx="2" fill="#0d2a48" />
        <circle cx="32" cy="48" r="2.5" fill="#8adfff" />
        <path d="M40 28l10-4v8c0 6-4 10-10 12" fill="none" stroke="#b8f0ff" strokeWidth="2.2" />
        <path d="M42 32l3 3 6-7" fill="none" stroke="#5ec8ff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === 'detect') {
    return (
      <svg {...common}>
        <rect x="18" y="8" width="28" height="48" rx="5" fill="#1a4a78" stroke="#5ec8ff" strokeWidth="2" />
        <rect x="24" y="14" width="16" height="28" rx="2" fill="#0d2a48" />
        <circle cx="32" cy="48" r="2.5" fill="#8adfff" />
        <rect x="38" y="26" width="16" height="14" rx="2" fill="#0d2a48" stroke="#5ec8ff" strokeWidth="1.8" />
        <path d="M42 33h8M46 29v8" stroke="#b8f0ff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="18" y="8" width="28" height="48" rx="5" fill="#1a4a78" stroke="#5ec8ff" strokeWidth="2" />
      <rect x="24" y="14" width="16" height="28" rx="2" fill="#0d2a48" />
      <circle cx="32" cy="48" r="2.5" fill="#8adfff" />
      <path d="M44 22v6h10l-4 14H40l2-8h-6z" fill="#d8ecf8" stroke="#5ec8ff" strokeWidth="1.2" />
    </svg>
  )
}

function FeatureNode({ feature, index }: { feature: Feature; index: number }) {
  return (
    <div className="ds-feature" style={{ '--ds-i': index } as React.CSSProperties}>
      <div className="ds-feature-visual">
        <span className="ds-feature-icon">
          <FeatureIcon type={feature.icon} />
        </span>
        <PedestalBase />
      </div>
      <strong>{feature.title}</strong>
    </div>
  )
}

function Satellite({ label, side }: { label: string; side: 'left' | 'right' }) {
  return (
    <div className={`ds-satellite ds-satellite-${side}`}>
      <div className="ds-satellite-visual">
        <span className="ds-satellite-badge" aria-hidden="true">
          <svg viewBox="0 0 72 72" className="ds-satellite-svg">
            <defs>
              <linearGradient id={`satGrad-${side}`} x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#f0f8ff" />
                <stop offset="100%" stopColor="#9ec4e8" />
              </linearGradient>
            </defs>
            <path d="M36 8l22 10v22c0 14-9 24-22 28-13-4-22-14-22-28V18z" fill={`url(#satGrad-${side})`} stroke="#7ec8ff" strokeWidth="2" />
            <rect x="22" y="28" width="28" height="18" rx="3" fill="#0a1a2e" />
            <text x="36" y="41" textAnchor="middle" fill="#7adfff" fontSize="11" fontWeight="700" fontFamily="sans-serif">
              AI
            </text>
          </svg>
        </span>
        <PedestalBase />
      </div>
      <strong>{label}</strong>
    </div>
  )
}

export function DataSecurityScreen({ active }: { active: boolean }) {
  return (
    <div className={`ds-body ${active ? 'ds-active' : ''}`}>
      <div className="ds-orbit-ring ds-orbit-a" aria-hidden="true" />
      <div className="ds-orbit-ring ds-orbit-b" aria-hidden="true" />

      <aside className="ds-side ds-side-left reveal delay-2">
        <div className="ds-rail" aria-hidden="true" />
        <h3 className="ds-side-title">个人信息保护平台</h3>
        <div className="ds-feature-list">
          {leftFeatures.map((f, i) => (
            <FeatureNode key={f.id} feature={f} index={i} />
          ))}
        </div>
      </aside>

      <div className="ds-core reveal delay-3">
        <button type="button" className="ds-chevron ds-chevron-left" aria-label="上一项" tabIndex={-1}>
          <ChevronLeft size={28} strokeWidth={1.6} />
        </button>
        <div className="ds-core-stage">
          <Satellite label="AI审计大模型" side="left" />
          <SecurityCore />
          <Satellite label="AI风险识别引擎" side="right" />
        </div>
        <button type="button" className="ds-chevron ds-chevron-right" aria-label="下一项" tabIndex={-1}>
          <ChevronRight size={28} strokeWidth={1.6} />
        </button>
      </div>

      <aside className="ds-side ds-side-right reveal delay-4">
        <div className="ds-rail" aria-hidden="true" />
        <div className="ds-feature-list">
          {rightFeatures.map((f, i) => (
            <FeatureNode key={f.id} feature={f} index={i} />
          ))}
        </div>
        <h3 className="ds-side-title">隐私安全检测平台</h3>
      </aside>
    </div>
  )
}
