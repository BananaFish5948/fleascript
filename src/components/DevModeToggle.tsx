'use client'

import { useState } from 'react'

interface DevModeToggleProps {
  initialDevMode: boolean
}

export default function DevModeToggle({ initialDevMode }: DevModeToggleProps) {
  const [isDevMode, setIsDevMode] = useState(initialDevMode)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const nextState = !isDevMode
      const res = await fetch('/api/dev-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: nextState })
      })
      
      if (res.ok) {
        setIsDevMode(nextState)
        alert(`開発者モードを ${nextState ? 'ON' : 'OFF'} にしました。テスト画面を開き直してください。`)
      } else {
        alert("エラーが発生しました。")
      }
    } catch (err) {
      console.error(err)
      alert("通信エラーが発生しました。")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        px-4 py-2 rounded-lg font-bold text-sm transition-colors border
        ${isDevMode 
          ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' 
          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
        }
      `}
    >
      {isLoading ? '処理中...' : (isDevMode ? '👑 開発者モード: ON' : '開発者モード: OFF')}
    </button>
  )
}
