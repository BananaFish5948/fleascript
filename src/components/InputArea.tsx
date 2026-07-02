'use client'

interface InputAreaProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  maxLength?: number
}

export default function InputArea({ value, onChange, disabled, maxLength = 300 }: InputAreaProps) {
  const isDanger = maxLength - value.length <= 50

  return (
    <div className="card p-4 relative">
      <textarea
        className="w-full h-32 bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none resize-none"
        placeholder="例：iPhone 14、画面に少し傷あり、箱なし、早く売りたい"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        disabled={disabled}
      />
      <div 
        className="absolute bottom-4 right-4 text-sm"
        style={{ color: isDanger ? 'var(--color-danger)' : 'var(--color-text-muted)' }}
      >
        {value.length} / {maxLength}
      </div>
    </div>
  )
}
