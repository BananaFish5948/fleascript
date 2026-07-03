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
          <h2 className="text-xl font-bold text-gray-800 mb-2">本日の無料作成枠が終了しました</h2>
          <p className="text-gray-600 mb-6 text-sm">
            月額300円（ジュース1本分！）で、作成回数を1日50回へ大幅拡張・広告とクレジットを完全非表示にしませんか？
          </p>
          
          <button 
            onClick={() => window.location.href = '/checkout'}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:scale-105 mb-4 flex items-center justify-center gap-2"
          >
            <span>👑 プレミアムに登録する</span>
          </button>
          
          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-gray-400 absolute">または</span>
          </div>

          <button 
            onClick={() => {
              if (onOpenShareModal) {
                onClose();
                onOpenShareModal();
              }
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-transform hover:scale-105 mb-4 flex items-center justify-center gap-2"
          >
            <span>🎁 SNSでシェアして今日だけ＋1回枠をもらう</span>
          </button>
          
          <div className="text-center text-xs text-green-700 font-medium mb-3 flex items-center justify-center gap-1">
            <span>✅</span> プレミアムはいつでも解約可能。違約金等の縛りはありません。
          </div>
          
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

