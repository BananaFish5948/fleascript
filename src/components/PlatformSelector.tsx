'use client'

import { PlatformType } from '@/lib/openai'

interface PlatformSelectorProps {
  platform: PlatformType;
  onChange: (platform: PlatformType) => void;
  disabled?: boolean;
}

export default function PlatformSelector({ platform, onChange, disabled }: PlatformSelectorProps) {
  const options: { value: PlatformType; label: string; icon: string }[] = [
    { value: 'mercari', label: 'メルカリ系', icon: '📦' },
    { value: 'yahoo', label: 'ヤフオク系', icon: '🔨' },
    { value: 'minne', label: 'ハンドメイド', icon: '🧶' }
  ];

  return (
    <div className="flex bg-[var(--color-bg-elevated)] p-1 rounded-xl border border-[var(--color-border)] w-full mb-4 animate-fade-in-up">
      {options.map((opt) => {
        const isSelected = platform === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`
              flex-1 py-2 px-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5
              ${isSelected 
                ? 'bg-white text-[var(--color-brand)] shadow-sm' 
                : 'text-[var(--color-text-secondary)] hover:bg-black/5 hover:text-[var(--color-text-primary)]'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="text-base">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
