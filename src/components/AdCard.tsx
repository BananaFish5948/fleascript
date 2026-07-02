'use client'

interface AdCardProps {
  logId?: string | null;
}

export default function AdCard({ logId }: AdCardProps) {
  const handleClick = () => {
    if (logId) {
      fetch('/api/ad-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      }).catch(console.error);
    }
    // ダミーの広告先へ遷移
    alert("広告クリック: 梱包資材の購入ページへ遷移します");
  }

  return (
    <div 
      onClick={handleClick}
      className="card mt-4 p-4 border-[var(--color-brand)]/20 hover:border-[var(--color-brand)]/50 transition-colors group cursor-pointer animate-fade-in-up relative overflow-hidden"
    >
      {/* 広告ラベル */}
      <div className="absolute top-0 right-0 bg-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
        スポンサー
      </div>
      
      <div className="flex items-center gap-4">
        {/* アイコン部分のプレースホルダー */}
        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center flex-shrink-0 border border-amber-300">
          <span className="text-2xl">📦</span>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1 group-hover:text-[var(--color-brand)] transition-colors">
            梱包資材まとめ買いがお得！
          </h3>
          <p className="text-[var(--color-text-secondary)] text-xs mb-2 line-clamp-2">
            フリマ出品に必須のダンボールや緩衝材。今なら初回限定20%OFFでご提供中です。
          </p>
          <div className="flex justify-between items-center">
            <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded">
              詳細を見る →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
