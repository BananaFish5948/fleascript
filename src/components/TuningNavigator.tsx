'use client'

import { useState, useEffect } from 'react'

interface URLSchemes {
  mercari: { edit: string; search: string };
  yahoo: { edit: string; search: string };
}

interface TuningNavigatorProps {
  platform: 'mercari' | 'yahoo';
  targetPrice: number;
  itemName: string;
  itemId?: string; // 編集用のID（取得できている場合）
}

export function TuningNavigator({ platform, targetPrice, itemName, itemId }: TuningNavigatorProps) {
  const [isTuning, setIsTuning] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [schemes, setSchemes] = useState<URLSchemes | null>(null);

  useEffect(() => {
    // 【動的リンクマッピング基盤】
    // 本来は Supabase(app_settings) や Firebase Remote Config から取得し、
    // ストア審査なしにURLスキームを変更可能にする。今回は初期値としてセット。
    const fetchSchemes = async () => {
      setSchemes({
        mercari: { edit: "mercari://item/edit?id=", search: "mercari://search?keyword=" },
        yahoo: { edit: "yahooauctions://item/edit?id=", search: "yahooauctions://search?query=" }
      });
    };
    fetchSchemes();
  }, []);

  const handleTuneAndNavigate = async () => {
    if (!schemes) return;

    // 1. クリップボードへ適正価格をコピー（シームレス・マニュアルリンク）
    try {
      await navigator.clipboard.writeText(targetPrice.toString());
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }

    // 2. ライフハック感の演出：「調律（チューニング）メーター」アニメーション開始
    setIsTuning(true);

    // 3. メーターアニメーション完了後(1.2s)、認知エラー対策の「南京錠アンロック」(0.5s)
    setTimeout(() => {
      setIsUnlocked(true);
      
      // アンロックアニメーション後(0.5s)にディープリンク発火
      setTimeout(() => {
        let deepLink = '';
        if (itemId) {
          // 編集画面へのディープリンク
          deepLink = `${schemes[platform].edit}${itemId}`;
        } else {
          // 階層が深い場合やID不明時は商品タイトル検索URLへフォールバック
          deepLink = `${schemes[platform].search}${encodeURIComponent(itemName)}`;
        }

        // リンク発火
        window.location.href = deepLink;

        // 【インテリジェント・フォールバック】
        // アプリ未インストール等の理由で遷移が遮断された場合、Web版の検索画面へ飛ばす
        setTimeout(() => {
          if (document.hasFocus()) { // ページがアクティブなままなら遷移失敗とみなす
            if (platform === 'mercari') {
              window.location.href = `https://jp.mercari.com/search?keyword=${encodeURIComponent(itemName)}`;
            } else {
              window.location.href = `https://auctions.yahoo.co.jp/search/search?p=${encodeURIComponent(itemName)}`;
            }
          }
        }, 1500);

        // 状態リセット
        setTimeout(() => {
          setIsTuning(false);
          setIsUnlocked(false);
        }, 1000);

      }, 500);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[var(--color-bg-surface)] rounded-3xl shadow-card border border-[var(--color-border)] animate-fade-in-up">
      <div className="text-center mb-6">
        <p className="text-sm text-[var(--color-text-secondary)] mb-1 tracking-wide">AIが算出した適正価格</p>
        <p className="text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
          ¥{targetPrice.toLocaleString()}
        </p>
      </div>

      <div className="relative w-full max-w-xs mb-6 h-32 flex items-end justify-center overflow-hidden border-b border-[var(--color-border)]">
        {/* 調律メーター（半円）UI */}
        <svg className="absolute bottom-0 w-64 h-32" viewBox="0 0 200 100">
          <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="var(--color-border)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="var(--color-brand-dim)" strokeWidth="8" strokeLinecap="round" strokeDasharray="280" strokeDashoffset="140" />
        </svg>
        {/* メーターの針 */}
        <div className={`absolute bottom-0 w-[4px] h-24 bg-[var(--color-brand)] rounded-t-full origin-bottom ${isTuning ? 'animate-tuning' : 'rotate-[-45deg]'}`}></div>
        
        {/* 南京錠アイコン（セッション切れ対策・認知エラー緩和） */}
        <div className="absolute top-4 right-4 text-[var(--color-text-muted)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" className={isUnlocked ? 'animate-unlock-shackle' : ''} />
          </svg>
        </div>
      </div>

      <button
        onClick={handleTuneAndNavigate}
        disabled={isTuning}
        className="w-full py-4 px-6 rounded-full font-bold text-white bg-[var(--color-brand)] hover:brightness-110 hover:scale-[1.02] transition-all duration-300 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isTuning ? (
          <span className="tracking-widest">市場価格を調律中...</span>
        ) : (
          <span>価格をコピーしてアプリを開く</span>
        )}
      </button>
    </div>
  )
}
