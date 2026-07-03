'use client';

import { useState, useEffect } from 'react';

export default function InAppBrowserWarning() {
  const [isIAB, setIsIAB] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 判定ロジック
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    
    // 対象のアプリ内ブラウザ（Instagram, TikTok, LINE, Facebook, X/Twitter, Threads）
    const iabRegex = /Instagram|TikTok|Line|FBAV|FBAN|Twitter|Threads/i;
    
    if (iabRegex.test(userAgent)) {
      setIsIAB(true);
    }
  }, []);

  if (!isIAB || isDismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 text-center border-4 border-amber-400">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
          ブラウザを切り替えて<br/>ご利用ください
        </h2>
        <p className="text-gray-600 mb-6 text-sm text-left leading-relaxed">
          現在お使いの<strong>アプリ内ブラウザ</strong>では、以下の機能が正常に動作しない可能性が高いです。
        </p>
        
        <ul className="text-left text-xs text-red-600 font-bold mb-6 space-y-2 bg-red-50 p-4 rounded-lg">
          <li>❌ クリップボードへのコピー</li>
          <li>❌ プレミアムプランの登録・決済</li>
          <li>❌ Googleアカウントでのログイン</li>
        </ul>

        <div className="bg-gray-100 rounded-lg p-4 mb-6 text-sm text-gray-700">
          <p className="font-bold mb-1">【解決方法】</p>
          <p>画面の右上（または右下）のメニューボタン <span className="font-serif">「︙」</span> や <span className="font-serif">「…」</span> を押し、<br/>
          <strong className="text-amber-600">「Safari（またはブラウザ）で開く」</strong> を選択してください。</p>
        </div>
        
        <button 
          onClick={() => setIsDismissed(true)}
          className="text-gray-400 text-xs hover:text-gray-600 underline"
        >
          自己責任でそのまま使う（非推奨）
        </button>
      </div>
    </div>
  );
}
