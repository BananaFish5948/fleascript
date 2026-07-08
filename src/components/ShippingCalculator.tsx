'use client';

import { useState, useEffect } from 'react';
import { AFFILIATE_ADS } from '@/lib/affiliateData';
import NativeAdCard from '@/components/NativeAdCard';
import { Truck, Settings2 } from 'lucide-react';

// デフォルトのフォールバック運賃データ（JSONフェッチ失敗時用）
const FALLBACK_SHIPPING_METHODS = [
  { id: 'yupacket_mini', name: 'ゆうパケットポストmini', maxThickness: 3.0, maxWeight: 2000, price: 160 },
  { id: 'nekoposu', name: 'ネコポス', maxThickness: 3.0, maxWeight: 1000, price: 210 },
  { id: 'yupacket', name: 'ゆうパケットポスト', maxThickness: 3.0, maxWeight: 2000, price: 215 },
  { id: 'taku_compact', name: '宅急便コンパクト', maxThickness: 5.0, maxWeight: -1, price: 450 },
  { id: 'taku_60', name: '宅急便60サイズ', maxThickness: 999, maxWeight: 2000, price: 750 },
];

export type ShippingMethod = typeof FALLBACK_SHIPPING_METHODS[0];

interface ShippingCalculatorProps {
  subscriptionStatus?: string;
}

export default function ShippingCalculator({ subscriptionStatus = 'free' }: ShippingCalculatorProps) {
  const [thickness, setThickness] = useState<number>(3.0);
  const [weight, setWeight] = useState<number>(500);
  const [methods, setMethods] = useState<ShippingMethod[]>(FALLBACK_SHIPPING_METHODS);
  const [showSettings, setShowSettings] = useState(false);
  const [affiliateAds, setAffiliateAds] = useState<any[]>(AFFILIATE_ADS);

  // アフィリエイト広告の動的取得
  useEffect(() => {
    const fetchAffiliateAds = async () => {
      try {
        const res = await fetch('/api/affiliate');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAffiliateAds(data);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch affiliate ads in calculator:', err);
      }
    };
    fetchAffiliateAds();
  }, []);

  // GitHub Pagesからのハイブリッド同期（IndexedDB/LocalStorage）
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const localData = localStorage.getItem('flea_shipping_rates');
        let currentData = localData ? JSON.parse(localData) : null;
        
        // ユーザーが独自にカスタマイズした設定がある場合はそれを優先
        const customRates = localStorage.getItem('flea_custom_rates');
        if (customRates) {
          setMethods(JSON.parse(customRates));
          return;
        }

        // GitHub Pages（現在はローカルの public フォルダからシミュレート）から最新データをフェッチ
        // 実際には https://raw.githubusercontent.com/... 等を使用
        const res = await fetch('/shipping_rates.json?t=' + Date.now()); 
        if (res.ok) {
          const remoteData = await res.json();
          // 更新日時の比較（変更があった場合のみLocalStorageを更新）
          if (!currentData || currentData.updatedAt !== remoteData.updatedAt) {
            localStorage.setItem('flea_shipping_rates', JSON.stringify(remoteData));
            setMethods(remoteData.rates);
          } else {
            setMethods(currentData.rates);
          }
        }
      } catch (e) {
        console.error('Failed to sync shipping rates', e);
      }
    };
    fetchRates();
  }, []);

  // ユーザー独自のカスタム運賃の保存
  const handleSaveCustomRates = (newMethods: ShippingMethod[]) => {
    localStorage.setItem('flea_custom_rates', JSON.stringify(newMethods));
    setMethods(newMethods);
    alert('カスタム運賃を保存しました。');
  };

  const handleResetCustomRates = () => {
    if (window.confirm('カスタム設定をリセットし、公式の運賃データに戻しますか？')) {
      localStorage.removeItem('flea_custom_rates');
      const localData = localStorage.getItem('flea_shipping_rates');
      setMethods(localData ? JSON.parse(localData).rates : FALLBACK_SHIPPING_METHODS);
      alert('リセットしました。');
    }
  };

  // カスタムUIの設定変更ハンドラー
  const updateMethodPrice = (id: string, price: number) => {
    const newMethods = methods.map(m => m.id === id ? { ...m, price } : m);
    setMethods(newMethods);
  };

  // 最安ルート計算 (一撃パリィ判定)
  const bestMethod = methods
    .filter(m => thickness <= m.maxThickness && (m.maxWeight === -1 || weight <= m.maxWeight))
    .sort((a, b) => a.price - b.price)[0];

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] rounded-2xl p-6 mb-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[var(--color-text-primary)] font-medium tracking-[0.2em] flex items-center gap-2">
          <Truck size={20} strokeWidth={1.5} className="text-[var(--color-info)]" /> 最安送料シミュレーター
        </h3>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="text-[10px] bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border border-[var(--color-border)] px-3 py-1.5 rounded-full hover:border-[var(--color-text-primary)] transition-colors font-medium tracking-widest shadow-sm flex items-center gap-1"
        >
          <Settings2 size={12} strokeWidth={1.5} /> 運賃カスタマイズ
        </button>
      </div>
      
      {showSettings ? (
        <div className="bg-[var(--color-bg-base)] rounded-xl p-4 border border-[var(--color-border)] mb-4 animate-fade-in-up shadow-sm">
          <p className="text-[10px] text-[var(--color-text-secondary)] mb-3 tracking-widest">公式運賃の改定や、あなた独自の特例運賃に合わせて価格をカスタマイズできます。</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {methods.map(m => (
              <div key={m.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                <span className="text-xs font-bold text-gray-700">{m.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">¥</span>
                  <input 
                    type="number" 
                    value={m.price} 
                    onChange={e => updateMethodPrice(m.id, Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={handleResetCustomRates} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 font-medium tracking-widest">リセット</button>
            <button onClick={() => { handleSaveCustomRates(methods); setShowSettings(false); }} className="text-xs bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-light)] px-4 py-1.5 rounded-full shadow-sm transition-colors font-medium tracking-widest">保存</button>
          </div>
        </div>
      ) : null}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">厚さ (cm)</label>
            <div className="flex gap-2">
              {[1, 3, 5, 7].map(t => (
                <button
                  key={t}
                  onClick={() => setThickness(t)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-widest transition-all ${thickness === t ? 'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info)] shadow-sm' : 'bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-text-primary)]'}`}
                >
                  {t}cm
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">重量 (g)</label>
            <input 
              type="range" 
              min="100" max="2000" step="100" 
              value={weight} 
              onChange={e => setWeight(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="text-right text-xs text-gray-500 font-bold mt-1">{weight} g</div>
          </div>
        </div>

        <div className="bg-[var(--color-bg-base)] rounded-xl p-4 border border-[var(--color-border)] flex flex-col justify-center items-center text-center">
          <span className="text-[10px] text-[var(--color-text-secondary)] font-medium tracking-widest mb-1">最安の発送ルート</span>
          {bestMethod ? (
            <>
              <span className="text-xl font-medium tracking-wider text-[var(--color-info)] mb-1">{bestMethod.name}</span>
              <span className="text-sm font-medium tracking-wide text-[var(--color-text-primary)]">送料: ¥{bestMethod.price}</span>
            </>
          ) : (
            <span className="text-[var(--color-danger)] font-medium text-sm">該当する配送方法が見つかりません</span>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--color-border)] w-full">
        {bestMethod && (
          <NativeAdCard 
            ad={
              affiliateAds.find(a => a.sizeTarget?.includes(bestMethod.name)) 
              || affiliateAds.find(a => a.id === 'ad-measure')
              || AFFILIATE_ADS.find(a => a.id === 'ad-measure')!
            }
            subscriptionStatus={subscriptionStatus} 
            forceShowPremium={true}
          />
        )}
      </div>
    </div>
  );
}
