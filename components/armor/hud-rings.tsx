/**
 * 顶部 HUD 同心环：多层圆环以不同速度与虚线节奏旋转，构建科技仪表感。
 */
export function HudRings() {
  const rings = [
    { r: 262, dash: '2 10', width: 1, opacity: 0.5, duration: 60, reverse: false },
    { r: 300, dash: '46 14 6 14', width: 1.4, opacity: 0.65, duration: 90, reverse: true },
    { r: 330, dash: '1 7', width: 1, opacity: 0.32, duration: 120, reverse: false },
    { r: 364, dash: '120 40 8 40', width: 1.6, opacity: 0.5, duration: 150, reverse: true },
    { r: 396, dash: '3 16', width: 1, opacity: 0.25, duration: 200, reverse: false },
  ]

  return (
    <div className="absolute left-1/2 top-[-30%] aspect-square w-[min(150vh,120vw)] -translate-x-1/2">
      <svg viewBox="0 0 800 800" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="hud-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--glow)" stopOpacity="0.95" />
            <stop offset="55%" stopColor="var(--primary)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {rings.map((ring) => (
          <g
            key={ring.r}
            style={{
              transformOrigin: '400px 400px',
              animation: `${ring.reverse ? 'armor-spin-rev' : 'armor-spin'} ${ring.duration}s linear infinite`,
            }}
          >
            <circle
              cx="400"
              cy="400"
              r={ring.r}
              fill="none"
              stroke="url(#hud-stroke)"
              strokeWidth={ring.width}
              strokeDasharray={ring.dash}
              opacity={ring.opacity}
            />
          </g>
        ))}
        {/* 顶部指针刻度 */}
        <g opacity="0.7">
          <line
            x1="400"
            y1="404"
            x2="400"
            y2="470"
            stroke="var(--glow)"
            strokeWidth="1"
            opacity="0.4"
          />
          <circle cx="400" cy="404" r="3.5" fill="var(--glow)" />
        </g>
      </svg>
    </div>
  )
}
