'use client';

import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventory';
import { Sparkles, TrendingUp, Clock, Loader2, AlertCircle, Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface PremiumInsightPanelProps {
  items: InventoryItem[];
  aiInsights: {
    best_selling_time_advice?: string;
    pricing_strategy?: string;
    insights?: string[];
  } | null;
  lastAiAnalysisAt: string | null;
  isAnalyzing: boolean;
  onUpdateAnalysis: () => Promise<void>;
}

export default function PremiumInsightPanel({ 
  items, 
  aiInsights, 
  lastAiAnalysisAt, 
  isAnalyzing, 
  onUpdateAnalysis 
}: PremiumInsightPanelProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // カウントダウン処理
  useEffect(() => {
    if (!lastAiAnalysisAt) {
      setTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      const lastTime = new Date(lastAiAnalysisAt).getTime();
      const limit = 24 * 60 * 60 * 1000; // 24時間
      const diff = Date.now() - lastTime;

      if (diff < limit) {
        setTimeLeft(limit - diff);
      } else {
        setTimeLeft(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lastAiAnalysisAt]);

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}時間${minutes}分${seconds}秒`;
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeItems = items.filter(item => item.status !== 'sold');
  const expectedTotalSales = activeItems.reduce((acc, item) => acc + item.target_price, 0);

  return (
    <div className="bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-base)] border border-[var(--color-brand)]/20 shadow-[var(--shadow-card)] rounded-2xl p-6 relative overflow-hidden group">
      {/* プレミアム感のある背景グラデーション（テラコッタの薄い膜） */}
      <div className="absolute inset-0 bg-[var(--color-brand-dim)] pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--color-brand)]/5 blur-3xl rounded-full" />
      
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <div className="w-8 h-8 rounded-full bg-[var(--color-brand-dim)] flex items-center justify-center text-[var(--color-brand)] shadow-inner">
          <Sparkles size={16} strokeWidth={2} className="animate-pulse" />
        </div>
        <div>
          <h3 className="text-xs font-bold tracking-[0.2em] text-[var(--color-text-secondary)] uppercase">AIコンシェルジュ</h3>
          <h4 className="text-sm font-semibold tracking-wider text-[var(--color-text-primary)]">フリマ販売診断インサイト</h4>
        </div>
        <span className="ml-auto text-[9px] bg-[var(--color-brand)] text-white px-3 py-1 rounded-full font-bold tracking-widest shadow-md">
          PREMIUM
        </span>
      </div>

      {/* コンテンツエリア */}
      <div className="relative z-10 space-y-6">
        
        {/* 基本ダッシュボードデータ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-[var(--color-border)]">
          <div className="flex flex-col gap-1 border-r border-[var(--color-border)] last:border-r-0 pr-2">
            <span className="text-[10px] text-[var(--color-text-secondary)] tracking-widest flex items-center gap-1">
              <TrendingUp size={12} className="text-[var(--color-brand)]" /> 出品中・保管中の想定総売上
            </span>
            <span className="text-xl font-bold text-[var(--color-text-primary)]">
              ¥ {expectedTotalSales.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-1 pl-2">
            <span className="text-[10px] text-[var(--color-text-secondary)] tracking-widest flex items-center gap-1">
              <Calendar size={12} className="text-[var(--color-brand)]" /> 前回AI分析日時
            </span>
            <span className="text-sm font-medium text-[var(--color-text-primary)] py-0.5">
              {lastAiAnalysisAt ? formatDate(lastAiAnalysisAt) : '未実行'}
            </span>
          </div>
        </div>

        {/* AI診断結果表示 */}
        {isAnalyzing ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand)]" />
            <p className="text-xs text-[var(--color-text-secondary)] font-medium tracking-widest animate-pulse">
              AIがあなたの出品データを診断中... (約10〜15秒かかります)
            </p>
          </div>
        ) : aiInsights ? (
          <div className="space-y-6 animate-fade-in-up">
            
            {/* 診断インサイト（箇条書き） */}
            {aiInsights.insights && aiInsights.insights.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-[11px] font-bold tracking-widest text-[var(--color-text-secondary)] flex items-center gap-1.5 border-b border-[var(--color-border)] pb-1.5">
                  <CheckCircle2 size={13} className="text-[var(--color-success)]" />
                  経営・販売状況の気づき
                </h5>
                <ul className="space-y-2.5">
                  {aiInsights.insights.map((insight, idx) => (
                    <li key={idx} className="text-xs text-[var(--color-text-primary)] leading-relaxed flex items-start gap-2 bg-[var(--color-bg-base)]/40 p-2.5 rounded-lg border border-[var(--color-border)]">
                      <ArrowUpRight size={14} className="text-[var(--color-brand)] shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 売れ筋タイム診断 */}
              {aiInsights.best_selling_time_advice && (
                <div className="bg-[var(--color-info-bg)] border border-[var(--color-info)]/20 p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-info)] tracking-wider">
                    <Clock size={14} />
                    <span>おすすめ再出品タイム</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-primary)] leading-relaxed font-medium">
                    {aiInsights.best_selling_time_advice}
                  </p>
                </div>
              )}

              {/* 価格戦略アドバイス */}
              {aiInsights.pricing_strategy && (
                <div className="bg-[var(--color-brand-dim)] border border-[var(--color-brand)]/20 p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-brand)] tracking-wider">
                    <TrendingUp size={14} />
                    <span>値付け＆価格戦略</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-primary)] leading-relaxed font-medium">
                    {aiInsights.pricing_strategy}
                  </p>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* 未実行（またはデータ不足）時の表示 */
          <div className="bg-white/40 border border-[var(--color-border)] rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 border-dashed animate-fade-in-up">
            <div className="w-12 h-12 bg-[var(--color-brand-dim)] border border-[var(--color-brand)]/20 text-[var(--color-brand)] rounded-full flex items-center justify-center shadow-inner">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div className="max-w-xs">
              <h5 className="text-xs font-bold text-[var(--color-text-primary)] tracking-widest mb-1.5">
                AI販売診断が未実行です
              </h5>
              <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
                現在の全在庫データをAIコンシェルジュが分析し、具体的な売れ筋タイムや価格戦略のアドバイスを出力します。
              </p>
            </div>
          </div>
        )}

        {/* コスト防御・更新エリア */}
        <div className="pt-4 border-t border-[var(--color-border)]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-secondary)]">
            <AlertCircle size={12} className="text-[var(--color-text-muted)]" />
            <span>AI分析は24時間に1回まで実行できます。</span>
          </div>
          
          <button
            type="button"
            onClick={onUpdateAnalysis}
            disabled={isAnalyzing || timeLeft !== null || items.length === 0}
            className="w-full sm:w-auto bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-light)] disabled:opacity-50 disabled:hover:opacity-50 px-6 py-2.5 rounded-full font-bold tracking-widest shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>分析中...</span>
              </>
            ) : timeLeft !== null ? (
              <span>次回更新まで: {formatTimeLeft(timeLeft)}</span>
            ) : (
              <>
                <Sparkles size={14} />
                <span>AI販売診断を実行する</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
