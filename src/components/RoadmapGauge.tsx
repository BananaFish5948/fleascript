'use client';
import { Rocket } from 'lucide-react';

interface RoadmapGaugeProps {
  progress: number; // 0-100
}

export default function RoadmapGauge({ progress }: RoadmapGaugeProps) {
  // プログレスバーの幅を制限
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] rounded-3xl p-5 relative overflow-hidden mt-8 mb-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-end mb-4 relative z-10">
        <div>
          <h2 className="text-sm font-medium tracking-[0.2em] text-[var(--color-text-primary)] flex items-center gap-2">
            <Rocket size={18} strokeWidth={1.5} className="text-[var(--color-brand)]" />
            <span>開発ロードマップ</span>
          </h2>
          <p className="text-[10px] text-[var(--color-text-secondary)] tracking-widest mt-1">プレミアムサポーターの力でシステムが進化します</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-medium tracking-wide text-[var(--color-brand)]">
            {safeProgress}%
          </span>
        </div>
      </div>

      <div className="relative pt-2 pb-6">
        {/* ベースのトラック */}
        <div className="w-full bg-[var(--color-bg-base)] rounded-full h-2.5 overflow-hidden relative shadow-inner border border-[var(--color-border)]">
          {/* 伸びるバー */}
          <div 
            className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-1000 ease-out relative"
            style={{ width: `${safeProgress}%` }}
          >
            {/* バーの先端の光 */}
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/40 to-transparent blur-[1px]" />
          </div>
        </div>

        {/* マイルストーンマーカー */}
        <div className="absolute top-1.5 bottom-0 left-0 right-0 pointer-events-none px-2">
          {/* 35% */}
          <div className="absolute h-full flex flex-col items-center group pointer-events-auto cursor-help" style={{ left: '35%', transform: 'translateX(-50%)' }}>
            <div className={`w-1 h-2.5 rounded-full ${safeProgress >= 35 ? 'bg-white shadow-sm' : 'bg-[var(--color-border)]'}`} />
            <div className={`text-[9px] mt-1.5 whitespace-nowrap text-center font-medium tracking-widest transition-colors ${safeProgress >= 35 ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'}`}>
              在庫コア機能<br/>(解放済)
            </div>
            {/* ツールチップ */}
            <div className="absolute bottom-full mb-2 w-48 p-2 bg-[var(--color-text-primary)] text-white text-[10px] tracking-wide rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center pointer-events-none before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-[var(--color-text-primary)]">
              現在の在庫・利益管理と保管箱メモの基本機能です。
            </div>
          </div>
          
          {/* 60% */}
          <div className="absolute h-full flex flex-col items-center group pointer-events-auto cursor-help" style={{ left: '60%', transform: 'translateX(-50%)' }}>
            <div className={`w-1 h-2.5 rounded-full ${safeProgress >= 60 ? 'bg-white shadow-sm' : 'bg-[var(--color-border)]'}`} />
            <div className={`text-[9px] mt-1.5 whitespace-nowrap text-center font-medium tracking-widest transition-colors ${safeProgress >= 60 ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'}`}>
              最安送料判定AI<br/>(ロック中)
            </div>
            {/* ツールチップ */}
            <div className="absolute bottom-full mb-2 w-48 p-2 bg-[var(--color-text-primary)] text-white text-[10px] tracking-wide rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center pointer-events-none before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-[var(--color-text-primary)]">
              荷物のサイズと重量から、最安の配送方法と送料を瞬時にAI判定する機能です。
            </div>
          </div>
          
          {/* 100% */}
          <div className="absolute h-full flex flex-col items-end group pointer-events-auto cursor-help" style={{ right: '0' }}>
            <div className={`w-1 h-2.5 rounded-full mr-1 ${safeProgress >= 100 ? 'bg-white shadow-sm' : 'bg-[var(--color-border)]'}`} />
            <div className={`text-[9px] mt-1.5 text-right font-medium tracking-widest transition-colors ${safeProgress >= 100 ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'}`}>
              処分価格サジェスト<br/>(最終ゴール)
            </div>
            {/* ツールチップ */}
            <div className="absolute bottom-full right-0 mb-2 w-56 p-2 bg-[var(--color-text-primary)] text-white text-[10px] tracking-wide rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-left pointer-events-none before:content-[''] before:absolute before:top-full before:right-4 before:border-4 before:border-transparent before:border-t-[var(--color-text-primary)]">
              3日間売れ残った商品を自動検知し、売れやすい価格をAIが自動提案します。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
