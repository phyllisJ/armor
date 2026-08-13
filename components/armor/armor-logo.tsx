const LETTERS = ['A', 'R', 'M', 'O', 'R']
const LETTER_BASE_DELAY = 0.55
const LETTER_STEP = 0.11

const letterIn = (i: number) =>
  `armor-letter-in 1.05s cubic-bezier(0.16, 1, 0.3, 1) ${
    LETTER_BASE_DELAY + i * LETTER_STEP
  }s both`

/** 金属字：每个字母独立承载渐变与流光，避免 transform 打断背景裁剪 */
function Wordmark({ variant }: { variant: 'fill' | 'outline' }) {
  return (
    <>
      {LETTERS.map((letter, i) => (
        <span
          key={`${variant}-${letter}-${i}`}
          className={`inline-block will-change-transform ${
            variant === 'fill' ? 'armor-chrome' : 'armor-outline'
          }`}
          style={{
            animation:
              variant === 'fill'
                ? `${letterIn(i)}, armor-shine 6s cubic-bezier(0.4, 0, 0.2, 1) ${
                    2 + i * 0.12
                  }s infinite`
                : letterIn(i),
          }}
        >
          {letter}
        </span>
      ))}
    </>
  )
}

/**
 * 主视觉 Logo：斯巴达头盔 + ARMOR 金属字 + 中文标语，均带进场动效。
 */
export function ArmorLogo() {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center"
        style={{ fontSize: 'clamp(2.6rem, 16.2vw, 9.5rem)' }}
      >
        {/* 头盔徽标 */}
        <img
          src="/images/armor-helmet.png"
          alt="ARMOR 斯巴达头盔徽标"
          className="h-[1.12em] w-auto shrink-0 will-change-transform"
          style={{
            animation: 'armor-helmet-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
            filter:
              'drop-shadow(0 0 18px color-mix(in oklab, var(--glow) 45%, transparent)) drop-shadow(0 0 60px color-mix(in oklab, var(--primary) 45%, transparent))',
          }}
        />

        {/* 金属字 ARMOR */}
        <div
          className="relative font-mecha font-black leading-none tracking-[0.03em]"
          style={{ transform: 'skewX(-4deg)' }}
        >
          <span aria-hidden="true" className="absolute inset-0 whitespace-nowrap">
            <Wordmark variant="outline" />
          </span>
          <h1 className="relative whitespace-nowrap">
            <span className="sr-only">ARMOR</span>
            <span aria-hidden="true">
              <Wordmark variant="fill" />
            </span>
          </h1>
        </div>
      </div>

      {/* 标语 */}
      <div
        className="mt-[clamp(1rem,3vw,2.5rem)] flex w-full items-center justify-center gap-[clamp(0.75rem,2vw,1.75rem)]"
        style={{ maxWidth: 'min(92vw, 46rem)' }}
      >
        <span
          className="h-px flex-1 origin-right will-change-transform"
          style={{
            background:
              'linear-gradient(90deg, transparent, color-mix(in oklab, var(--glow) 70%, transparent))',
            animation: 'armor-rule-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) 1.35s both',
          }}
        />
        <p
          className="whitespace-nowrap text-center font-sans text-[clamp(0.7rem,1.5vw,1.05rem)] font-light tracking-[0.5em] text-foreground/90 will-change-transform"
          style={{
            animation: 'armor-fade-up 1.4s cubic-bezier(0.16, 1, 0.3, 1) 1.5s both',
            textShadow: '0 0 18px color-mix(in oklab, var(--primary) 60%, transparent)',
          }}
        >
          智算未来　安全无界
        </p>
        <span
          className="h-px flex-1 origin-left will-change-transform"
          style={{
            background:
              'linear-gradient(90deg, color-mix(in oklab, var(--glow) 70%, transparent), transparent)',
            animation: 'armor-rule-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) 1.35s both',
          }}
        />
      </div>
    </div>
  )
}
