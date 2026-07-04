'use client';
import { Crown, Gift, Sparkles, Settings2 } from 'lucide-react';

interface StatusBarProps {
  remaining: number | null;
  maxLimit: number;
  isPremium: boolean;
  isLoggedIn?: boolean;
  isDevMode?: boolean;
  subscriptionStatus?: string;
  onUpgradeClick: () => void;
  onManagePlanClick: () => void;
  onLogoutClick?: () => void;
  onLoginClick?: () => void;
  onOpenShareModal?: () => void;
}

export default function StatusBar({ remaining, maxLimit, isPremium, isLoggedIn, isDevMode, subscriptionStatus = 'free', onUpgradeClick, onManagePlanClick, onLogoutClick, onLoginClick, onOpenShareModal }: StatusBarProps) {
  if (remaining === null) {
    return <div className="h-10"></div> // placeholder
  }

  return (
    <div className="flex items-center justify-between bg-[var(--color-bg-surface)] p-4 rounded-xl border border-[var(--color-border)] animate-fade-in-up shadow-[var(--shadow-card)]">
      <div className="flex flex-col">
        <span className="text-[var(--color-text-secondary)] text-[10px] font-medium uppercase tracking-[0.2em] mb-1">
          {isDevMode ? 'Developer Tier' : (subscriptionStatus === 'premium' ? 'Premium Tier' : (subscriptionStatus === 'standard' ? 'Standard Tier' : 'Free Tier'))}
        </span>
        <div className="font-medium text-[var(--color-text-primary)] tracking-wide">
          {isDevMode 
            ? <div className="flex flex-col">
                <span className="text-[var(--color-warning)] text-xs flex items-center gap-1"><Crown size={12} strokeWidth={1.5} /> 開発者モード (テスト用)</span>
                <span className="text-sm mt-0.5">残り <span className="text-[var(--color-brand)] font-medium text-lg">{remaining}</span>/{maxLimit} 回</span>
              </div>
            : <div className="flex flex-col">
                <span>残り <span className="text-[var(--color-brand)] text-lg">{remaining}</span>/{maxLimit} 回</span>
                {onOpenShareModal && (
                  <button 
                    onClick={onOpenShareModal}
                    className="text-[10px] text-[#1DA1F2] hover:opacity-80 flex items-center gap-1 mt-0.5 w-fit transition-opacity tracking-widest font-normal"
                  >
                    <Gift size={12} strokeWidth={1.5} /> お友達招待・シェア
                  </button>
                )}
              </div>
          }
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!isLoggedIn && onLoginClick && (
          <button 
            onClick={onLoginClick}
            className="text-[var(--color-text-secondary)] font-medium tracking-widest hover:text-[var(--color-text-primary)] px-3 py-1 rounded-full transition-colors text-[10px]"
          >
            ログイン
          </button>
        )}

        {isLoggedIn && onLogoutClick && (
          <button 
            onClick={onLogoutClick}
            className="text-[var(--color-text-secondary)] font-medium tracking-widest hover:text-[var(--color-text-primary)] px-3 py-1 rounded-full transition-colors text-[10px]"
          >
            ログアウト
          </button>
        )}

        {subscriptionStatus === 'free' && (
          <button 
            onClick={onUpgradeClick}
            className="text-[var(--color-brand)] font-medium tracking-widest hover:bg-[var(--color-bg-base)] border border-transparent hover:border-[var(--color-brand)] px-3 py-1.5 rounded-full transition-colors text-[10px] flex items-center gap-1"
          >
            <span>アップグレード</span>
            <Sparkles size={12} strokeWidth={1.5} />
          </button>
        )}

        {(subscriptionStatus === 'standard' || subscriptionStatus === 'premium') && (
          <button 
            onClick={onManagePlanClick}
            className="text-[var(--color-text-secondary)] font-medium tracking-widest hover:text-[var(--color-text-primary)] px-3 py-1 rounded-full transition-colors text-[10px] flex items-center gap-1"
          >
            <Settings2 size={12} strokeWidth={1.5} />
            <span>プラン管理</span>
          </button>
        )}
      </div>
    </div>
  )
}
