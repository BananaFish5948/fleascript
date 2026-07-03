'use client';

import { InventoryItem } from '@/types/inventory';

interface SummaryCardProps {
  items: InventoryItem[];
  remaining: number | null;
  isPremium: boolean;
}

export default function SummaryCard({ items, remaining, isPremium }: SummaryCardProps) {
  const activeItems = items.filter(item => item.status !== 'sold');
  const soldItems = items.filter(item => item.status === 'sold');
  const maxLimit = isPremium ? 500 : 3;
  const currentCount = items.length;

  // 売却済アイテムの実績利益
  const realizedProfit = soldItems.reduce((acc, item) => {
    const profit = item.target_price - item.purchase_price - item.postage - (item.target_price * (item.fee_rate / 100));
    return acc + Math.max(0, profit);
  }, 0);

  // 出品中/手元アイテムの見込み利益
  const expectedProfit = activeItems.reduce((acc, item) => {
    const profit = item.target_price - item.purchase_price - item.postage - (item.target_price * (item.fee_rate / 100));
    return acc + Math.max(0, profit);
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* 在庫ステータス */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h3 className="text-sm font-bold text-gray-500 mb-2">現在の在庫数</h3>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-extrabold text-[var(--color-brand)]">{activeItems.length}</span>
          <span className="text-gray-400 font-medium mb-1">件</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>登録枠使用率</span>
            <span>{currentCount} / {maxLimit} 件</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-1000 ${currentCount >= maxLimit ? 'bg-red-400' : 'bg-[var(--color-brand)]'}`} 
              style={{ width: `${Math.min(100, (currentCount / maxLimit) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 利益サマリー */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h3 className="text-sm font-bold text-gray-500 mb-2">見込み利益合計</h3>
        <div className="flex items-end gap-2">
          <span className="text-gray-400 font-medium mb-1">¥</span>
          <span className="text-4xl font-extrabold text-amber-500">{Math.floor(expectedProfit).toLocaleString()}</span>
        </div>
        <p className="text-xs font-medium text-gray-400 mt-3 flex justify-between">
          <span>今月の確定利益</span>
          <span className="text-emerald-500 font-bold">¥ {Math.floor(realizedProfit).toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
