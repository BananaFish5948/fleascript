'use client'

interface GenerateButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled: boolean
}

export default function GenerateButton({ onClick, isLoading, disabled }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        w-full py-4 px-6 rounded-full text-lg font-bold transition-all duration-300
        ${isLoading || disabled 
          ? 'opacity-40 cursor-not-allowed bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]' 
          : 'bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-light)] text-white hover:scale-[1.02] hover:brightness-110 shadow-lg animate-pulse-glow'
        }
      `}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          🪄 AIが魅力的な文章を考え中...
        </span>
      ) : (
        '✨ AIにおまかせ！一発で売れる文章を作る'
      )}
    </button>
  )
}
