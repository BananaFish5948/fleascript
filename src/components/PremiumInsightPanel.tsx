'use client';

import { InventoryItem } from '@/types/inventory';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';

interface PremiumInsightPanelProps {
  items: InventoryItem[];
}

export default function PremiumInsightPanel({ items }: PremiumInsightPanelProps) {
  const activeItems = items.filter(item => item.status !== 'sold');
  
  // 簡易的な分析ロジック
  const expectedTotalSales = activeItems.reduce((acc, item) => acc + item.target_price, 0);
  
  const highValueItem = activeItems.length > 0 
    ? activeItems.reduce((prev, current) => (prev.target_price > current.target_price) ? prev : current)
    : null;

  return (
    <div className="bg-gradient-to-r from-[var(--color-bg-surface)] to-[var(--color-bg-base)] border border-[var(--color-brand)]/30 shadow-[var(--shadow-card)] rounded-2xl p-5 relative overflow-hidden group">
      {/* プレミアム感のある背景エフェクト */}
      <div className="absolute inset-0 bg-[var(--color-brand)]/5 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-brand)]/10 blur-3xl rounded-full" />
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Sparkles size={16} className="text-[var(--color-brand)]" />
        <h3 className="text-xs font-medium tracking-[0.2em] text-[var(--color-text-primary)]">AI コンシェルジュ・インサイト</h3>
        <span className="ml-auto text-[10px] bg-[var(--color-brand)] text-white px-2 py-0.5 rounded-full font-bold tracking-widest shadow-sm">
          PREMIUM
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-secondary)] tracking-widest">
            <TrendingUp size={12} />
            <span>出品待機中の想定総売上</span>
          </div>
          <span className="text-lg font-medium text-[var(--color-text-primary)]">¥{expectedTotalSales.toLocaleString()}</span>
        </div>

        {highValueItem ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-secondary)] tracking-widest">
              <Clock size={12} />
              <span>注目のアイテム</span>
            </div>
            <span className="text-sm font-medium text-[var(--color-brand)] line-clamp-1">{highValueItem.item_name}</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">週末の夜19-22時頃の出品がおすすめです。</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 justify-center">
            <span className="text-xs text-[var(--color-text-muted)]">現在出品待機中のアイテムはありません。</span>
          </div>
        )}
      </div>
    </div>
  );
}
