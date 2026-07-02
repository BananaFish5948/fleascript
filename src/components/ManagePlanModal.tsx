import { useState } from 'react'

interface ManagePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null;
  onCanceled: () => void;
}

export default function ManagePlanModal({ isOpen, onClose, deviceId, onCanceled }: ManagePlanModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  if (!isOpen) return null

  const handleCancelSubscription = async () => {
    if (!deviceId) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/cancel-subscription-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      })

      if (res.ok) {
        alert('プランの解約が完了しました。無料プランへ移行します。')
        onCanceled()
      } else {
        alert('解約処理に失敗しました。')
      }
    } catch (err) {
      alert('通信エラーが発生しました。')
    } finally {
      setIsLoading(false)
      setIsConfirming(false)
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
            <p className="text-lg font-bold text-[var(--color-brand)] mb-2">✨ FleaScript Premium</p>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li>1日の作成回数 50回</li>
              <li>入力文字数 1500文字</li>
              <li>広告・クレジット非表示</li>
            </ul>
          </div>

          {!isConfirming ? (
            <div className="space-y-3">
              <button 
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
              >
                閉じる
              </button>
              <button 
                onClick={() => setIsConfirming(true)}
                className="w-full text-red-500 hover:text-red-700 font-bold py-2 px-6 transition-colors text-sm underline"
              >
                サブスクリプションを解約する
              </button>
              <p className="text-xs text-gray-400 mt-2">
                ※解約すると即座に無料プランに戻ります。
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in-up bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-sm text-red-700 font-bold mb-3">
                本当に解約しますか？<br/>即座に無料プラン（広告あり・1日3回）に戻ります。
              </p>
              <button 
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className={`w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? '解約処理中...' : 'はい、解約します (Mock)'}
              </button>
              <button 
                onClick={() => setIsConfirming(false)}
                disabled={isLoading}
                className="w-full bg-transparent text-gray-600 hover:text-gray-900 font-bold py-2 px-6 transition-colors text-sm"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
