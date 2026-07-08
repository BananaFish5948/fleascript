'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { InventoryItem } from '@/types/inventory';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
}

export default function MonthlyReportModal({ isOpen, onClose, items }: MonthlyReportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Canvasアセット画像キャッシュ用の参照
  const boxImgRef = useRef<HTMLImageElement | null>(null);
  const leafImgRef = useRef<HTMLImageElement | null>(null);

  const [stats, setStats] = useState({
    monthlyProfit: 0,
    freedSpace: 0,
    itemsSold: 0,
    monthStr: ''
  });

  useEffect(() => {
    if (!isOpen) {
      setShareUrl(null);
      return;
    }
    
    // 統計の計算 (今月分)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthStr = `${currentYear}年${currentMonth + 1}月`;
    
    let monthlyProfit = 0;
    let itemsSold = 0;
    
    items.forEach(item => {
      if (item.status === 'sold') {
        const itemDate = new Date(item.updated_at || item.created_at);
        if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
          const profit = item.target_price - item.purchase_price - item.postage - (item.target_price * (item.fee_rate / 100));
          monthlyProfit += Math.max(0, profit);
          itemsSold++;
        }
      }
    });

    // 想定解放スペース（1アイテムあたり適当に0.05平米と仮定）
    const freedSpace = parseFloat((itemsSold * 0.05).toFixed(2));

    setStats({ monthlyProfit, freedSpace, itemsSold, monthStr });
  }, [isOpen, items]);

  useEffect(() => {
    if (!isOpen) return;
    
    // すでにインスタンス作成済みの場合は再生成せず即時描画
    if (boxImgRef.current && leafImgRef.current) {
      drawCanvas();
      return;
    }

    if (typeof window !== 'undefined') {
      let boxLoaded = false;
      let leafLoaded = false;

      const checkAndDraw = () => {
        if (boxLoaded && leafLoaded) {
          drawCanvas();
        }
      };

      const boxImg = new Image();
      boxImg.onload = () => {
        boxLoaded = true;
        checkAndDraw();
      };
      boxImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23A05E4C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/><polyline points='3.27 6.96 12 12.01 20.73 6.96'/><line x1='12' y1='22.08' x2='12' y2='12'/></svg>";
      boxImgRef.current = boxImg;

      const leafImg = new Image();
      leafImg.onload = () => {
        leafLoaded = true;
        checkAndDraw();
      };
      leafImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2373795C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58-1 9.58A7 7 0 0 1 11 20z'/><path d='M19 2c-3 3-7 5.58-11 7'/></svg>";
      leafImgRef.current = leafImg;
      
      if (boxImg.complete) boxLoaded = true;
      if (leafImg.complete) leafLoaded = true;
      checkAndDraw();
    }
  }, [isOpen, stats]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズ
    canvas.width = 1080;
    canvas.height = 1080;

    // 背景描画（Kinfolk風のエクリュ〜グレージュ系グラデーション）
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#FAF8F5');
    gradient.addColorStop(1, '#EFECE6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 装飾の円 (セージグリーン＆テラコッタ)
    ctx.beginPath();
    ctx.arc(900, 200, 300, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(115, 121, 92, 0.15)'; // セージグリーン調の透過
    ctx.fill();

    ctx.beginPath();
    ctx.arc(150, 950, 400, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(160, 94, 76, 0.12)'; // テラコッタ調の透過
    ctx.fill();

    // 中央のカード背景
    ctx.shadowColor = 'rgba(44, 43, 41, 0.08)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(140, 240, 800, 600, 40);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // タイトルテキスト
    ctx.fillStyle = '#2C2B29'; // オフブラック
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${stats.monthStr}のフリマ成果`, 540, 345);

    // 利益 (フォントサイズを下げ、Y座標を上にあげて被りを解消)
    ctx.fillStyle = '#A05E4C'; // テラコッタ
    ctx.font = 'bold 100px sans-serif';
    ctx.fillText(`¥ ${Math.floor(stats.monthlyProfit).toLocaleString()}`, 540, 470);
    
    // ラベル (Y座標を下げて十分な余白を確保)
    ctx.fillStyle = '#73795C'; // セージ/オリーブ
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('獲得した純利益', 540, 545);

    // サブステータス (Y座標を再配分しフォントサイズを微調整して重なりを防止)
    ctx.font = 'bold 36px sans-serif';
    
    // 1. 売却数のアイコン(テラコッタ色の箱)を描画
    const boxImg = boxImgRef.current;
    if (boxImg) {
      ctx.drawImage(boxImg, 240, 665, 42, 42);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#2C2B29';
    ctx.fillText(`売却した数:`, 300, 700);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#73795C';
    ctx.fillText(`${stats.itemsSold} 個`, 840, 700);

    // 2. 解放スペースのアイコン(オリーブグリーンの葉)を描画
    const leafImg = leafImgRef.current;
    if (leafImg) {
      ctx.drawImage(leafImg, 240, 745, 42, 42);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#2C2B29';
    ctx.fillText(`部屋の解放スペース:`, 300, 780);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#73795C';
    ctx.fillText(`約 ${stats.freedSpace} ㎡`, 840, 780);

    // フッター
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9C9B98';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Generated by FleaScript', 540, 1000);
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsGenerating(false);
        return;
      }
      // ネイティブシェアではなく、常にURLを発行してSNSボタンを表示する仕様に統一
      await uploadToSupabase(blob);
      setIsGenerating(false);
    }, 'image/jpeg', 0.9);
  };

  const uploadToSupabase = async (blob: Blob) => {
    setIsUploading(true);
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが必要です");

      const filePath = `${user.id}/monthly_report.jpg`;
      const { data, error } = await supabase.storage
        .from('temporary_shares')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;

      // OGP(Twitter Card)対応のため、画像の直リンクではなく専用の公開ページURLを発行
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://fleascript.vercel.app';
      const pageUrl = `${baseUrl}/report/${user.id}`;

      setShareUrl(pageUrl);
    } catch (e: any) {
      console.error(e);
      alert('画像のアップロードに失敗しました: ' + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 z-10 shadow-sm"
        >
          ✕
        </button>
        
        <div className="p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 text-center flex items-center justify-center gap-2">
            <span>🪴 {stats.monthStr}の成果レポート</span>
          </h2>
          
          {/* Canvas（非表示にしてプレビューはimgタグ等で表示することも可能だが、今回は縮小して表示） */}
          <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-inner mb-6 relative">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="space-y-3">
            {!shareUrl ? (
              <button 
                onClick={handleShare}
                disabled={isGenerating || isUploading}
                className="w-full bg-[var(--color-brand)] hover:opacity-90 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating || isUploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>🔗 画像の共有URLを発行する</span>
                )}
              </button>
            ) : (
              <div className="flex flex-col gap-3 relative animate-fade-in-up">
                {showToast && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl">
                    <div className="bg-gray-800 text-white text-sm font-bold px-4 py-3 rounded-lg shadow-lg animate-fade-in-up">
                      ✅ テキストをコピーしました！<br/>Instagramを開いてペーストしてください。
                    </div>
                  </div>
                )}
                
                <p className="text-sm font-bold text-gray-800 text-center mb-1">画像の準備ができました！</p>

                <button 
                  onClick={async () => {
                    const text = `今月のフリマ成果！📦✨\n\n画像はこちら: ${shareUrl}\n\nFleaScriptで管理中！\nhttps://fleascript.vercel.app`;
                    await navigator.clipboard.writeText(text);
                    setShowToast(true);
                    setTimeout(() => {
                      setShowToast(false);
                      window.open('https://instagram.com/', '_blank');
                    }, 2000);
                  }}
                  className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span>📸 Instagramを開く (自動コピー)</span>
                </button>

                <button 
                  onClick={() => {
                    const text = `今月のフリマ成果！📦✨\n\n画像はこちら: ${shareUrl}\n\nFleaScriptで管理中！\nhttps://fleascript.vercel.app`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span>🐦 X(Twitter)でシェア</span>
                </button>

                <button 
                  onClick={() => {
                    const text = `今月のフリマ成果！📦✨\n\n画像はこちら: ${shareUrl}\n\nFleaScriptで管理中！\nhttps://fleascript.vercel.app`;
                    window.open(`https://threads.net/intent/post?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span>🧵 Threadsでシェア</span>
                </button>
                
                <button 
                  onClick={() => {
                    const text = `今月のフリマ成果！📦✨\n\n画像はこちら: ${shareUrl}\n\nFleaScriptで管理中！\nhttps://fleascript.vercel.app`;
                    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span>💬 LINEでシェア</span>
                </button>

                <button 
                  onClick={() => {
                    const text = `今月のフリマ成果！📦✨\n\n画像はこちら: ${shareUrl}\n\nFleaScriptで管理中！\nhttps://fleascript.vercel.app`;
                    navigator.clipboard.writeText(text);
                    alert('テキストと画像URLをコピーしました！');
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span>🔗 テキストをコピー</span>
                </button>
              </div>
            )}
            
            <p className="text-[10px] text-gray-400 text-center leading-tight">
              ※AI画像生成APIを使わず、お使いの端末（ブラウザ）のパワーだけで超高速に合成しています。エコでサステナブルな設計です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
