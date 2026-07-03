'use client';

import { useState } from 'react';

// 送料マスターデータ (外部APIを使わずフロントで解決)
const SHIPPING_METHODS = [
  { id: 'yupacket_mini', name: 'ゆうパケットポストmini', maxThickness: 3.0, maxWeight: 2000, price: 160 },
  { id: 'nekoposu', name: 'ネコポス', maxThickness: 3.0, maxWeight: 1000, price: 210 },
  { id: 'yupacket', name: 'ゆうパケットポスト', maxThickness: 3.0, maxWeight: 2000, price: 215 },
  { id: 'taku_compact', name: '宅急便コンパクト', maxThickness: 5.0, maxWeight: -1, price: 450 }, // -1 is no limit conceptually, but usually limited by box
  { id: 'taku_60', name: '宅急便60サイズ', maxThickness: 999, maxWeight: 2000, price: 750 },
];

import { AFFILIATE_ADS } from '@/lib/affiliateData';
import NativeAdCard from '@/components/NativeAdCard';

interface ShippingCalculatorProps {
  subscriptionStatus?: string;
}

export default function ShippingCalculator({ subscriptionStatus = 'free' }: ShippingCalculatorProps) {
  const [thickness, setThickness] = useState<number>(3.0);
  const [weight, setWeight] = useState<number>(500);

  // 最安ルート計算 (一撃パリィ判定)
  const bestMethod = SHIPPING_METHODS
    .filter(m => thickness <= m.maxThickness && (m.maxWeight === -1 || weight <= m.maxWeight))
    .sort((a, b) => a.price - b.price)[0];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm rounded-2xl p-6 mb-6">
      <h3 className="text-blue-800 font-bold mb-4 flex items-center gap-2">
        <span>🚚 最安送料シミュレーター</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">厚さ (cm)</label>
            <div className="flex gap-2">
              {[1, 3, 5, 7].map(t => (
                <button
                  key={t}
                  onClick={() => setThickness(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${thickness === t ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
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

        <div className="bg-white rounded-xl p-4 border border-blue-100 flex flex-col justify-center items-center text-center">
          <span className="text-xs text-gray-500 font-bold mb-1">最安の発送ルート</span>
          {bestMethod ? (
            <>
              <span className="text-xl font-extrabold text-blue-600 mb-1">{bestMethod.name}</span>
              <span className="text-sm font-bold text-gray-700">送料: ¥{bestMethod.price}</span>
            </>
          ) : (
            <span className="text-red-500 font-bold">該当する配送方法が見つかりません</span>
          )}

        </div>
      </div>

      {/* アフィリエイトへのスマート誘導（レイアウトをグリッド外に出し、全幅で表示） */}
      <div className="mt-6 pt-6 border-t border-blue-100 w-full">
        {bestMethod && (
          <NativeAdCard 
            ad={
              AFFILIATE_ADS.find(a => a.sizeTarget?.includes(bestMethod.name)) 
              || AFFILIATE_ADS.find(a => a.id === 'ad-measure')!
            }
            subscriptionStatus={subscriptionStatus} 
          />
        )}
      </div>
    </div>
  );
}
