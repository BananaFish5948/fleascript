import { useState, useEffect } from 'react'

interface ManagePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null;
  onCanceled: () => void;
  subscriptionStatus?: string;
}

export default function ManagePlanModal({ isOpen, onClose, deviceId, onCanceled, subscriptionStatus = 'free' }: ManagePlanModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    const isLocal = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    setIsDev(isLocal)
  }, [])

  if (!isOpen) return null

  const handleOpenPortal = async () => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/checkout/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'プラン管理の起動に失敗しました。')
      }
    } catch (err) {
      alert('通信エラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up border border-[var(--color-border)] p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">⚙️ プラン管理</h2>
          
          <div className="bg-amber-50 rounded-lg p-4 my-6 text-left border border-amber-100">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">現在のプラン</p>
            <p className="text-lg font-bold text-[var(--color-brand)] mb-2">
              {subscriptionStatus === 'premium' ? '✨ FleaScript Premium' : '⭐ FleaScript Standard'}
            </p>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              {subscriptionStatus === 'premium' ? (
                <>
                  <li>1日の作成回数 50回</li>
                  <li>在庫枠 500件</li>
                  <li>広告・クレジット非表示</li>
                  <li>利益分析レポート</li>
                </>
              ) : (
                <>
                  <li>1日の作成回数 15回</li>
                  <li>在庫枠 100件</li>
                  <li>基本機能解放</li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleOpenPortal}
              disabled={isLoading}
              className={`w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-light)] text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  処理中...
                </span>
              ) : (
                isDev ? 'プランを解約する (Mock)' : 'お支払い・プランの管理 (Stripe)'
              )}
            </button>
            
            {subscriptionStatus === 'standard' && (
              <button 
                onClick={() => window.location.href = '/checkout?plan=premium'}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-transform hover:scale-[1.02]"
              >
                👑 Premiumへアップグレード
              </button>
            )}

            <button 
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
