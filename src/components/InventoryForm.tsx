'use client';

import { useState, useEffect } from 'react';
import { InventoryStatus } from '@/types/inventory';

interface InventoryFormProps {
  onAdd: (data: any) => Promise<void>;
  isLoading: boolean;
  disabled: boolean;
}

const STATUS_OPTIONS: { value: InventoryStatus; label: string; defaultFee: number }[] = [
  { value: 'hand', label: '手元保管', defaultFee: 10.0 },
  { value: 'mercari', label: 'メルカリ出品中', defaultFee: 10.0 },
  { value: 'yahoo', label: 'ヤフオク出品中', defaultFee: 8.8 },
  { value: 'sold', label: '売却済', defaultFee: 10.0 },
];

export default function InventoryForm({ onAdd, isLoading, disabled }: InventoryFormProps) {
  const [itemName, setItemName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  const [postage, setPostage] = useState<number | ''>('');
  const [status, setStatus] = useState<InventoryStatus>('hand');
  const [feeRate, setFeeRate] = useState<number>(10.0);
  const [boxNumber, setBoxNumber] = useState('');

  // ステータス変更時にデフォルト手数料をセット
  useEffect(() => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    if (option) {
      setFeeRate(option.defaultFee);
    }
  }, [status]);

  const calcProfit = () => {
    const t = Number(targetPrice) || 0;
    const p = Number(purchasePrice) || 0;
    const s = Number(postage) || 0;
    const fee = t * (feeRate / 100);
    return t - p - s - fee;
  };

  const profit = calcProfit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || disabled || isLoading) return;

    await onAdd({
      item_name: itemName,
      purchase_price: Number(purchasePrice) || 0,
      target_price: Number(targetPrice) || 0,
      postage: Number(postage) || 0,
      fee_rate: feeRate,
      status,
      box_number: boxNumber || null,
    });

    // Reset form
    setItemName('');
    setPurchasePrice('');
    setTargetPrice('');
    setPostage('');
    setBoxNumber('');
    setStatus('hand');
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 relative overflow-hidden">
      <h3 className="text-lg font-bold text-[var(--color-brand)] mb-4 flex items-center gap-2">
        <span>📦 新規アイテム登録</span>
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">商品名 <span className="text-red-400">*</span></label>
          <input 
            type="text" 
            required 
            value={itemName} 
            onChange={e => setItemName(e.target.value)} 
            disabled={disabled}
            placeholder="例: Apple AirPods Pro 第2世代" 
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent transition-shadow disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">仕入れ値 (¥)</label>
            <input 
              type="number" 
              value={purchasePrice} 
              onChange={e => setPurchasePrice(e.target.value ? Number(e.target.value) : '')} 
              disabled={disabled}
              placeholder="0" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">目標売価 (¥)</label>
            <input 
              type="number" 
              value={targetPrice} 
              onChange={e => setTargetPrice(e.target.value ? Number(e.target.value) : '')} 
              disabled={disabled}
              placeholder="0" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">想定送料 (¥)</label>
            <input 
              type="number" 
              value={postage} 
              onChange={e => setPostage(e.target.value ? Number(e.target.value) : '')} 
              disabled={disabled}
              placeholder="0" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">保管箱番号</label>
            <input 
              type="text" 
              value={boxNumber} 
              onChange={e => setBoxNumber(e.target.value)} 
              disabled={disabled}
              placeholder="例: A-1" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ステータス</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as InventoryStatus)}
                disabled={disabled}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow disabled:opacity-50"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">手数料率 (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={feeRate} 
                onChange={e => setFeeRate(Number(e.target.value))} 
                disabled={disabled}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 flex justify-between items-center h-[42px]">
            <span className="text-xs font-bold text-gray-500">純利益予測</span>
            <span className={`font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              ¥ {Math.floor(profit).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!itemName.trim() || disabled || isLoading}
            className="w-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-light)] hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>在庫に登録する</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
