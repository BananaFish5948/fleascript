'use client';

import { useState } from 'react';

interface CustomShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
}

export default function CustomShareModal({ isOpen, onClose, referralCode }: CustomShareModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [referralMessage, setReferralMessage] = useState('');

  if (!isOpen) return null;

  const shareText = "フリマ出品を1秒でラクにするツール FleaScript！\nhttps://fleascript.vercel.app";
  const shareUrl = "https://fleascript.vercel.app";

  const trackShare = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'API Error');
      }
      return null;
    } catch (error: any) {
      console.error('[Share Error]', error);
      return error.message;
    }
  };

  const finishShareAction = () => {
    setIsProcessing(false);
    onClose();
    // シェア枠反映のために画面リロード
    window.location.reload();
  };

  const handleInstagramShare = async () => {
    setIsProcessing(true);
    const errMsg = await trackShare();
    if (errMsg) {
      alert(`エラーが発生しました: ${errMsg}`);
      setIsProcessing(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        window.open('https://instagram.com/', '_blank');
        finishShareAction();
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      alert("クリップボードへのコピーに失敗しました。");
    }
  };

  const handleXShare = async () => {
    setIsProcessing(true);
    const errMsg = await trackShare();
    if (errMsg) {
      alert(`エラーが発生しました: ${errMsg}`);
      setIsProcessing(false);
      return;
    }
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    finishShareAction();
  };

  const handleThreadsShare = async () => {
    setIsProcessing(true);
    const errMsg = await trackShare();
    if (errMsg) {
      alert(`エラーが発生しました: ${errMsg}`);
      setIsProcessing(false);
      return;
    }
    window.open(`https://threads.net/intent/post?text=${encodeURIComponent(shareText)}`, '_blank');
    finishShareAction();
  };

  const handleLineShare = async () => {
    setIsProcessing(true);
    const errMsg = await trackShare();
    if (errMsg) {
      alert(`エラーが発生しました: ${errMsg}`);
      setIsProcessing(false);
      return;
    }
    // LINEのシェア用URLスキーム
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    finishShareAction();
  };

  const handleCopyLink = async () => {
    setIsProcessing(true);
    const errMsg = await trackShare();
    if (errMsg) {
      alert(`エラーが発生しました: ${errMsg}`);
      setIsProcessing(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(shareText);
      alert("クリップボードにコピーしました！アカウントにボーナス枠が永続的に1つ追加されました。");
    } catch (e) {
      console.error(e);
    }
    finishShareAction();
  };

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setIsProcessing(true);
    setReferralMessage('');
    
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode.trim() })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setReferralMessage(`❌ ${data.error}`);
      } else {
        setReferralMessage('✅ 紹介コードが適用されました！(枠+3)');
        setTimeout(() => {
          finishShareAction();
        }, 2000);
      }
    } catch (error) {
      setReferralMessage('❌ サーバーエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          disabled={isProcessing || showToast}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          ✕
        </button>
        
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">シェアして枠を増やす 🎁</h2>
          <p className="text-gray-500 mb-6 text-xs leading-relaxed">
            SNSでシェアすると、アカウントに無料作成枠が<span className="text-amber-600 font-bold">永続で＋1回</span>追加されます！(1アカウント1回限り)
          </p>
          
          <div className="flex flex-col gap-3 relative">
            {showToast && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl">
                <div className="bg-gray-800 text-white text-sm font-bold px-4 py-3 rounded-lg shadow-lg animate-fade-in-up">
                  ✅ テキストをコピーしました！<br/>Instagramを開いてペーストしてください。
                </div>
              </div>
            )}

            <button 
              onClick={handleInstagramShare}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>📸 Instagramを開く (自動コピー)</span>
            </button>

            <button 
              onClick={handleXShare}
              disabled={isProcessing}
              className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🐦 X(Twitter)でシェア</span>
            </button>

            <button 
              onClick={handleThreadsShare}
              disabled={isProcessing}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🧵 Threadsでシェア</span>
            </button>
            
            <button 
              onClick={handleLineShare}
              disabled={isProcessing}
              className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>💬 LINEでシェア</span>
            </button>

            <button 
              onClick={handleCopyLink}
              disabled={isProcessing}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🔗 テキストをコピー</span>
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-left">
            <h3 className="text-sm font-bold text-gray-800 mb-2">🤝 友達を招待する (双方向に枠+3)</h3>
            {referralCode ? (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">あなたの招待コード：</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={referralCode} 
                    className="flex-1 bg-amber-50 border border-amber-200 text-amber-800 font-mono text-sm rounded-lg px-3 py-2 outline-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(referralCode);
                      alert('招待コードをコピーしました！');
                    }}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 rounded-lg text-xs font-bold transition-colors"
                  >
                    コピー
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-4">招待コードを読み込み中...</p>
            )}
            
            <form onSubmit={handleSubmitReferral} className="mt-4">
              <p className="text-xs text-gray-500 mb-1">招待コードを持っている場合：</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="コードを入力..." 
                  disabled={isProcessing}
                  className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
                <button 
                  type="submit"
                  disabled={isProcessing || !inputCode.trim()}
                  className="bg-gray-800 hover:bg-black text-white px-4 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  適用
                </button>
              </div>
              {referralMessage && (
                <p className={`text-xs mt-2 font-bold ${referralMessage.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {referralMessage}
                </p>
              )}
            </form>
          </div>
          
        </div>
      </div>
    </div>
  )
}
