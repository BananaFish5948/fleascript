'use client';

import { InventoryItem } from '@/types/inventory';
import { Image as ImageIcon, AlertTriangle } from 'lucide-react';

interface SummaryCardProps {
  items: InventoryItem[];
  remaining: number | null;
  maxLimit: number;
  isPremium: boolean;
  onOpenReportModal?: () => void;
}

export default function SummaryCard({ items, remaining, maxLimit, isPremium, onOpenReportModal }: SummaryCardProps) {
  const activeItems = items.filter(item => item.status !== 'sold');
  const soldItems = items.filter(item => item.status === 'sold');
  const currentCount = items.length;

  // JSTでの今年の判定
  const isThisYearJST = (utcDateString: string) => {
    const date = new Date(utcDateString);
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const currentJstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return jstDate.getUTCFullYear() === currentJstDate.getUTCFullYear();
  };

  // 当年の売却済アイテム利益
  const thisYearProfit = soldItems
    .filter(item => isThisYearJST(item.created_at || new Date().toISOString()))
    .reduce((acc, item) => {
      const profit = item.target_price - item.purchase_price - item.postage - (item.target_price * (item.fee_rate / 100));
      return acc + Math.max(0, profit);
    }, 0);

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
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] rounded-2xl p-6 md:p-8 relative overflow-hidden group">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <h3 className="text-xs font-medium tracking-[0.2em] text-[var(--color-text-secondary)] mb-3">現在の在庫数</h3>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-medium tracking-wide text-[var(--color-brand)]">{activeItems.length}</span>
          <span className="text-[var(--color-text-muted)] font-normal mb-1 tracking-widest">件</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>登録枠使用率</span>
            <span>{currentCount} / {maxLimit} 件</span>
          </div>
          <div className="w-full bg-[var(--color-bg-base)] rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-1000 ${currentCount >= maxLimit ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-brand)]'}`} 
              style={{ width: `${Math.min(100, (currentCount / maxLimit) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 利益サマリー */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] rounded-2xl p-6 md:p-8 relative overflow-hidden group">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <h3 className="text-xs font-medium tracking-[0.2em] text-[var(--color-text-secondary)] mb-3">見込み利益合計</h3>
        <div className="flex items-end gap-2">
          <span className="text-[var(--color-text-muted)] font-normal mb-1">¥</span>
          <span className="text-4xl font-medium tracking-wide text-[var(--color-text-primary)]">{Math.floor(expectedProfit).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs font-normal text-[var(--color-text-muted)] flex items-center gap-2 tracking-wide">
            <span>今月の確定利益</span>
            <span className="text-[var(--color-success)] font-medium">¥ {Math.floor(realizedProfit).toLocaleString()}</span>
          </p>
          {onOpenReportModal && (
            <button 
              onClick={onOpenReportModal}
              className="text-[10px] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium tracking-widest px-4 py-2 rounded-full hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-all flex items-center"
            >
              <ImageIcon size={14} strokeWidth={1.5} className="mr-1.5" />
              <span>レポート生成</span>
            </button>
          )}
        </div>
      </div>

      {/* 20万円の壁 アラート (全幅) */}
      <div className="md:col-span-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-xs font-medium tracking-[0.2em] text-[var(--color-text-secondary)]">当年累計利益 (20万円の壁)</h3>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-medium tracking-wide text-[var(--color-text-primary)]">¥ {Math.floor(thisYearProfit).toLocaleString()}</span>
            <span className="text-xs text-[var(--color-text-muted)] mb-1 tracking-wider">/ ¥ 200,000</span>
          </div>
        </div>
        <div className="w-full bg-[var(--color-bg-base)] rounded-full h-1.5 mb-3">
          <div 
            className={`h-1.5 rounded-full transition-all duration-1000 ${
              thisYearProfit >= 180000 ? 'bg-[var(--color-danger)]' : 
              thisYearProfit >= 150000 ? 'bg-[var(--color-warning)]' : 
              'bg-stone-300'
            }`} 
            style={{ width: `${Math.min(100, (thisYearProfit / 200000) * 100)}%` }}
          />
        </div>
        {thisYearProfit >= 180000 && (
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-danger)] flex items-center mt-2">
            <AlertTriangle size={12} strokeWidth={1.5} className="mr-1.5" />
            警告: あと ¥{(200000 - thisYearProfit).toLocaleString()} で20万円の壁に到達します。計画的な出品調整をおすすめします。
          </p>
        )}
      </div>
    </div>
  );
}
