interface StatusBarProps {
  remaining: number | null;
  isPremium: boolean;
  isLoggedIn?: boolean;
  isDevMode?: boolean;
  onUpgradeClick: () => void;
  onManagePlanClick: () => void;
  onLogoutClick?: () => void;
  onLoginClick?: () => void;
}

export default function StatusBar({ remaining, isPremium, isLoggedIn, isDevMode, onUpgradeClick, onManagePlanClick, onLogoutClick, onLoginClick }: StatusBarProps) {
  if (remaining === null) {
    return <div className="h-10"></div> // placeholder
  }

  return (
    <div className="flex items-center justify-between bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[var(--color-border)] animate-fade-in-up">
      <div className="flex flex-col">
        <span className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-wider mb-1">
          {isDevMode ? 'Developer Tier' : (isPremium ? 'Premium Tier' : 'Free Tier')}
        </span>
        <div className="font-bold text-[var(--color-text-primary)]">
          {isDevMode 
            ? <span className="text-amber-500">👑 開発者モード (テスト用)</span>
            : (isPremium 
                ? <span>残り <span className="text-[var(--color-brand)] text-lg">{remaining}</span>/50 回</span> 
                : <span>残り <span className="text-[var(--color-brand)] text-lg">{remaining}</span>/3 回</span>
              )
          }
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!isLoggedIn && onLoginClick && (
          <button 
            onClick={onLoginClick}
            className="text-gray-500 font-bold hover:bg-gray-100 px-3 py-1 rounded-full transition-colors text-xs"
          >
            ログイン
          </button>
        )}

        {isLoggedIn && onLogoutClick && (
          <button 
            onClick={onLogoutClick}
            className="text-gray-500 font-bold hover:bg-gray-100 px-3 py-1 rounded-full transition-colors text-xs"
          >
            ログアウト
          </button>
        )}

        {!isPremium && !isDevMode && (
          <button 
            onClick={onUpgradeClick}
            className="text-[var(--color-brand)] font-bold hover:bg-[var(--color-brand)]/10 px-3 py-1 rounded-full transition-colors text-xs flex items-center gap-1"
          >
            <span>アップグレード</span>
            <span className="text-[10px]">✨</span>
          </button>
        )}

        {isPremium && !isDevMode && (
          <button 
            onClick={onManagePlanClick}
            className="text-gray-500 font-bold hover:bg-gray-100 px-3 py-1 rounded-full transition-colors text-xs flex items-center gap-1"
          >
            <span>⚙️ プラン管理</span>
          </button>
        )}
      </div>
    </div>
  )
}
