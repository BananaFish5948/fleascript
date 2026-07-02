'use client'

import { useState, useEffect } from 'react'
import { useDeviceId } from '@/hooks/useDeviceId'

export default function PremiumToggle() {
  const deviceId = useDeviceId()
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (deviceId) {
      fetch(`/api/user-status?deviceId=${deviceId}`)
        .then(res => res.json())
        .then(data => setIsPremium(!!data.isPremium))
        .catch(console.error)
    }
  }, [deviceId])

  const togglePremium = async () => {
    if (!deviceId) return
    setIsLoading(true)
    const newStatus = isPremium ? 'free' : 'premium'
    try {
      const res = await fetch('/api/toggle-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, status: newStatus }),
      })
      if (res.ok) {
        setIsPremium(!isPremium)
      } else {
        alert("ステータス変更に失敗しました")
      }
    } catch (error) {
      console.error(error)
      alert("通信エラー")
    } finally {
      setIsLoading(false)
    }
  }

  if (isPremium === null) {
    return <div className="text-sm text-gray-500">Loading...</div>
  }

  return (
    <div className="flex items-center gap-2 bg-[var(--color-bg-base)] p-2 rounded border border-[var(--color-border)]">
      <span className="text-sm font-medium">自分のプレミアム状態:</span>
      <button
        onClick={togglePremium}
        disabled={isLoading}
        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
          isPremium 
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isPremium ? '👑 有料プラン (ON)' : '🆓 無料プラン (OFF)'}
      </button>
    </div>
  )
}
