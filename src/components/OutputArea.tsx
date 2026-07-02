'use client'

import { useState } from 'react'

interface OutputAreaProps {
  text: string
}

export default function OutputArea({ text }: OutputAreaProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // バイラルクレジットの分割
  const parts = text.split('\n\n【FleaScript無料版で自動作成】')
  const mainText = parts[0]
  const creditText = parts.length > 1 ? `\n\n【FleaScript無料版で自動作成】${parts[1]}` : ''

  return (
    <div className="card animate-fade-in-up flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]">
        <div className="flex items-center gap-2 font-bold text-[var(--color-brand)]">
          ✅ 生成完了
        </div>
        <button
          onClick={handleCopy}
          className={`
            text-sm px-4 py-2 rounded-lg font-medium transition-colors
            ${isCopied 
              ? 'bg-[var(--color-brand)] text-[var(--color-bg-base)]' 
              : 'bg-[var(--color-bg-elevated)] hover:bg-[var(--color-brand-dim)] text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }
          `}
        >
          {isCopied ? '✅ コピー完了！' : '📋 ワンクリックでコピー'}
        </button>
      </div>
      <div className="p-4 bg-[#fffdfa] text-[var(--color-text-primary)] min-h-[150px]">
        <pre className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed">
          {mainText}
          {creditText && (
            <span className="text-[var(--color-text-muted)] text-xs mt-4 block">
              {creditText}
            </span>
          )}
        </pre>
      </div>
    </div>
  )
}
