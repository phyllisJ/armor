import { EnergyField } from './energy-field'
import { HudRings } from './hud-rings'

/**
 * 场景背景：底图缓慢呼吸位移 + 极光流动 + HUD 环 + 能量场 + 扫描线与暗角。
 */
export function SceneBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 底图：缓慢缩放位移，形成整体呼吸感 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: 'url(/images/armor-bg.png)',
          filter: 'brightness(0.76) contrast(1.24) saturate(1.3)',
          animation: 'armor-bg-drift 26s ease-in-out infinite',
        }}
      />

      {/* 色相统一层：把底图残留的暖色（地平线光弧）强制拉回冷蓝 */}
      <div
        className="absolute inset-0 opacity-90 mix-blend-color"
        style={{ backgroundColor: 'oklch(0.52 0.16 248)' }}
      />

      {/* 极光：左右两侧缓慢流动的蓝色星云（叠加混合，不提亮暗部） */}
      <div className="absolute inset-0 mix-blend-screen">
        <div
          className="absolute -left-[20%] top-[4%] h-[62%] w-[46%] rounded-full opacity-40 blur-3xl will-change-transform"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in oklab, var(--primary) 30%, transparent), transparent 75%)',
            animation: 'armor-aurora-a 19s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -right-[18%] top-[0%] h-[66%] w-[42%] rounded-full opacity-40 blur-3xl will-change-transform"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in oklab, var(--glow) 22%, transparent), transparent 74%)',
            animation: 'armor-aurora-b 23s ease-in-out infinite',
          }}
        />
        <div
          className="absolute left-1/2 top-[-26%] h-[54%] w-[72%] -translate-x-1/2 rounded-[50%] opacity-25 blur-3xl will-change-transform"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in oklab, var(--primary) 24%, transparent), transparent 70%)',
            animation: 'armor-aurora-b 31s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* 顶部 HUD 同心环 */}
      <HudRings />

      {/* 地平线光带 */}
      <div
        className="absolute left-1/2 top-[57.2%] h-[2px] w-[94%] -translate-x-1/2 rounded-[50%] will-change-[opacity]"
        style={{
          background:
            'linear-gradient(90deg, transparent, color-mix(in oklab, var(--glow) 80%, white) 24%, #ffffff 50%, color-mix(in oklab, var(--glow) 80%, white) 76%, transparent)',
          boxShadow: '0 0 32px 4px color-mix(in oklab, var(--primary) 45%, transparent)',
          animation: 'armor-horizon-pulse 6s ease-in-out infinite',
        }}
      />

      {/* 能量场粒子层 */}
      <EnergyField className="absolute inset-0 h-full w-full" />

      {/* 扫描线：极淡的一道光幕自上而下掠过 */}
      <div
        className="absolute inset-x-0 top-0 h-[30vh] will-change-transform"
        style={{
          background:
            'linear-gradient(to bottom, transparent, color-mix(in oklab, var(--glow) 4%, transparent) 80%, color-mix(in oklab, var(--glow) 9%, transparent))',
          animation: 'armor-scan 11s linear 1.2s infinite',
        }}
      />

      {/* 暗角 + 中心压暗，保证主体清晰 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,color-mix(in_oklab,var(--background)_62%,transparent)_0%,color-mix(in_oklab,var(--background)_42%,transparent)_36%,var(--background)_98%)]" />
    </div>
  )
}
