'use client'

import { useState, useEffect } from 'react'

export default function PremiumToggle() {
  const [status, setStatus] = useState<'free' | 'standard' | 'premium' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/user-status')
      .then(res => res.json())
      .then(data => setStatus(data.subscriptionStatus || 'free'))
      .catch(console.error)
  }, [])

  const handleStatusChange = async (newStatus: 'free' | 'standard' | 'premium') => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/toggle-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus)
      } else {
        alert("プラン変更に失敗しました")
      }
    } catch (error) {
      console.error(error)
      alert("通信エラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === null) {
    return <div className="text-sm text-gray-500">Loading...</div>
  }

  return (
    <div className="flex items-center gap-3 bg-[var(--color-bg-surface)] p-2 rounded-xl border border-[var(--color-border)] shadow-sm">
      <span className="text-xs font-bold text-[var(--color-text-secondary)] tracking-wider">テスト用プラン設定:</span>
      <div className="flex items-center gap-1 bg-[var(--color-bg-base)]/50 p-1 rounded-lg border border-[var(--color-border)]/50">
        <button
          onClick={() => handleStatusChange('free')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
            status === 'free'
              ? 'bg-[var(--color-text-primary)] text-white shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-base)]'
          }`}
        >
          FREE
        </button>
        <button
          onClick={() => handleStatusChange('standard')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
            status === 'standard'
              ? 'bg-[var(--color-accent)] text-white shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-base)]'
          }`}
        >
          STANDARD
        </button>
        <button
          onClick={() => handleStatusChange('premium')}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
            status === 'premium'
              ? 'bg-[var(--color-brand)] text-white shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-base)]'
          }`}
        >
          PREMIUM 👑
        </button>
      </div>
    </div>
  )
}
