import { useState } from 'react'

interface ManagePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null;
  onCanceled: () => void;
  subscriptionStatus?: string;
}

export default function ManagePlanModal({ isOpen, onClose, deviceId, onCanceled, subscriptionStatus = 'free' }: ManagePlanModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'downgrade', targetPlan: string } | null>(null)

  if (!isOpen) return null

  const handleChangePlan = async (targetPlan: string) => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/change-plan-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPlan }),
      })

      if (res.ok) {
        alert(targetPlan === 'free' ? 'プランの解約が完了しました。' : 'プランの変更が完了しました。')
        onCanceled()
        onClose()
      } else {
        alert('処理に失敗しました。')
      }
    } catch (err) {
      alert('通信エラーが発生しました。')
    } finally {
      setIsLoading(false)
      setConfirmAction(null)
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

          {!confirmAction ? (
            <div className="space-y-3">
              <button 
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
              >
                閉じる
              </button>
              
              {subscriptionStatus === 'standard' && (
                <button 
                  onClick={() => window.location.href = '/checkout?plan=premium'}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-transform hover:scale-105 mt-2"
                >
                  👑 Premiumへアップグレード
                </button>
              )}

              {subscriptionStatus === 'premium' && (
                <button 
                  onClick={() => setConfirmAction({ type: 'downgrade', targetPlan: 'standard' })}
                  className="w-full text-orange-500 hover:text-orange-700 font-bold py-2 px-6 transition-colors text-sm underline mt-2"
                >
                  Standardプランへダウングレードする
                </button>
              )}

              <button 
                onClick={() => setConfirmAction({ type: 'cancel', targetPlan: 'free' })}
                className="w-full text-red-500 hover:text-red-700 font-bold py-2 px-6 transition-colors text-sm underline"
              >
                サブスクリプションを解約する
              </button>
              <p className="text-xs text-gray-400 mt-2">
                ※解約・変更は即座に反映されます（モック仕様）。
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in-up bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-sm text-red-700 font-bold mb-3">
                {confirmAction.type === 'cancel' 
                  ? '本当に解約しますか？即座に無料プランに戻ります。' 
                  : 'Standardプランへダウングレードしますか？'}
              </p>
              <button 
                onClick={() => handleChangePlan(confirmAction.targetPlan)}
                disabled={isLoading}
                className={`w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? '処理中...' : 'はい、実行します (Mock)'}
              </button>
              <button 
                onClick={() => setConfirmAction(null)}
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
