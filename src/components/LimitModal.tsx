'use client';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShareModal?: () => void;
}

export default function LimitModal({ isOpen, onClose, onOpenShareModal }: LimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">無料枠（上限）に到達しました</h2>
          <p className="text-gray-600 mb-6 text-sm">
            FleaScriptの全機能を解放して、面倒な計算や在庫管理から解放されませんか？
          </p>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <button 
              onClick={() => window.location.href = '/checkout'}
              className="w-full bg-white border-2 border-indigo-500 hover:bg-indigo-50 text-indigo-700 font-bold py-3 px-6 rounded-xl transition-transform hover:scale-105 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-sm">Standard プラン (月額500円)</span>
              <span className="text-xs font-normal">在庫枠100件 / 基本機能解放 / 手数料自動計算</span>
            </button>
            <button 
              onClick={() => window.location.href = '/checkout?plan=premium'}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:scale-105 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-sm">👑 Premium プラン (月額1,000円)</span>
              <span className="text-xs font-normal">在庫枠500件 / 利益分析 / CSV出力 / 保管タグ</span>
            </button>
          </div>
          
          {onOpenShareModal && (
            <div className="mb-6">
              <button
                onClick={onOpenShareModal}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-3 px-6 rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-2"
              >
                <span>🎁 SNSでシェアして枠を1つ増やす</span>
              </button>
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="text-gray-400 text-sm hover:text-gray-600 underline"
          >
            今はやめておく
          </button>
        </div>
      </div>
    </div>
  )
}

