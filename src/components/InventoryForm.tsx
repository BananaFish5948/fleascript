'use client';

import { useState, useEffect, useRef } from 'react';
import { InventoryStatus, InventoryItem } from '@/types/inventory';
import { PackagePlus, Crown, Lightbulb, Bot, Settings2, Camera, Loader2 } from 'lucide-react';
import type { ImageWorkerRequest, ImageWorkerResponse } from '@/workers/imageWorker';

interface InventoryFormProps {
  onAdd: (data: any) => Promise<void>;
  isLoading: boolean;
  disabled: boolean;
  subscriptionStatus?: string;
  boxCapacity?: number;
  currentItems?: InventoryItem[];
  sellerRules?: string;
}

const STATUS_OPTIONS: { value: InventoryStatus; label: string; defaultFee: number }[] = [
  { value: 'hand', label: '手元保管', defaultFee: 10.0 },
  { value: 'mercari', label: 'メルカリ出品中', defaultFee: 10.0 },
  { value: 'yahoo', label: 'ヤフオク出品中', defaultFee: 8.8 },
  { value: 'sold', label: '売却済', defaultFee: 10.0 },
];

export default function InventoryForm({ onAdd, isLoading, disabled, subscriptionStatus = 'free', boxCapacity = 20, currentItems = [], sellerRules = '' }: InventoryFormProps) {
  const [itemName, setItemName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  const [postage, setPostage] = useState<number | ''>('');
  const [status, setStatus] = useState<InventoryStatus>('hand');
  const [feeRate, setFeeRate] = useState<number>(10.0);
  const [boxNumber, setBoxNumber] = useState('');
  const [locationTag, setLocationTag] = useState('');
  const [localSellerRules, setLocalSellerRules] = useState(sellerRules);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPriceEstimated, setIsPriceEstimated] = useState(false);
  const [isPostageEstimated, setIsPostageEstimated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    setLocalSellerRules(sellerRules);
  }, [sellerRules]);

  const handleSaveRules = async () => {
    setIsSavingRules(true);
    try {
      const res = await fetch('/api/user-status/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_rules: localSellerRules }),
      });
      if (!res.ok) throw new Error('保存に失敗しました');
      alert('マイルールを保存しました！AI説明文に反映されます。');
    } catch (e) {
      alert('保存に失敗しました');
    } finally {
      setIsSavingRules(false);
    }
  };

  // 収納キャパシティ計算
  const activeBoxItemsCount = currentItems.filter(i => i.status !== 'sold' && i.box_number === boxNumber).length;
  const remainingBoxCapacity = boxCapacity - activeBoxItemsCount;
  const isBoxFullWarning = boxNumber && remainingBoxCapacity <= (boxCapacity * 0.2);

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
      location_tag: locationTag || 'home',
    });

    // Reset form
    setItemName('');
    setPurchasePrice('');
    setTargetPrice('');
    setPostage('');
    setBoxNumber('');
    setLocationTag('');
    setStatus('hand');
    setIsPriceEstimated(false);
    setIsPostageEstimated(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // UIをフリーズさせないための初期化
    setIsAnalyzing(true);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      // 1. Web Workerに画像を投げてオフスクリーンでリサイズとBase64化を実行
      const worker = new Worker(new URL('@/workers/imageWorker', import.meta.url));
      
      const workerResult = await new Promise<ImageWorkerResponse>((resolve, reject) => {
        worker.onmessage = (event: MessageEvent<ImageWorkerResponse>) => resolve(event.data);
        worker.onerror = (err) => reject(err);
        worker.postMessage({ file } as ImageWorkerRequest);
      });
      
      worker.terminate();

      if (!workerResult.success || !workerResult.base64) {
        throw new Error(workerResult.error || '画像の処理に失敗しました');
      }

      // 2. Base64文字列を /api/analyze-image に送信して特徴量抽出
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: workerResult.base64 }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '画像解析に失敗しました');
      }

      // 3. 抽出結果を「商品名」に自動セット
      const f = data.features;
      const newNameParts = [];
      if (f.brand) newNameParts.push(f.brand);
      if (f.category) newNameParts.push(f.category);
      if (f.color) newNameParts.push(f.color);
      if (f.condition) newNameParts.push(`(${f.condition})`);
      
      const newName = newNameParts.join(' ') || '特徴を検出できませんでした';
      setItemName(newName);
      
      // 相場と送料の自動入力（仮値）
      if (typeof f.estimated_target_price === 'number') {
        setTargetPrice(f.estimated_target_price);
        setIsPriceEstimated(true);
      }
      if (typeof f.estimated_postage === 'number') {
        setPostage(f.estimated_postage);
        setIsPostageEstimated(true);
      }
      
      if (workerResult.isDegraded) {
        console.warn("Worker execution time exceeded limit. Degraded mode was activated.");
      }

    } catch (error: any) {
      let errorMessage = error.message || '画像の処理中にエラーが発生しました。';
      
      // Workerからのエラーコードをユーザーフレンドリーな日本語に変換
      switch (errorMessage) {
        case 'TOO_BRIGHT':
          errorMessage = '画像が明るすぎます（白飛び）。もう少し暗い場所で撮影してください。';
          break;
        case 'TOO_DARK':
          errorMessage = '画像が暗すぎます。もう少し明るい場所で撮影してください。';
          break;
        case 'UNSUPPORTED_BROWSER':
          errorMessage = 'お使いのブラウザは画像解析に対応していません。';
          break;
        case 'CANVAS_ERROR':
          errorMessage = '画像の読み込みに失敗しました。別の画像をお試しください。';
          break;
      }

      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] rounded-2xl p-6 relative overflow-hidden">
      <h3 className="text-sm font-medium tracking-[0.2em] text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
        <PackagePlus size={18} strokeWidth={1.5} className="text-[var(--color-brand)]" />
        <span>新規アイテム登録</span>
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* 画像アップロード UI */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-stone-50 border border-stone-200 rounded-xl">
          <button
            type="button"
            disabled={isAnalyzing || disabled}
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-50 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            画像からAI自動入力
          </button>
          <p className="text-[10px] text-stone-500 leading-tight">
            写真を撮るだけで、ブランド名や<br/>カテゴリなどの特徴を自動抽出します。
          </p>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium tracking-widest text-[var(--color-text-secondary)] mb-1">商品名 <span className="text-[var(--color-danger)]">*</span></label>
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
            <label className="block text-[10px] font-medium tracking-widest text-[var(--color-text-secondary)] mb-1">仕入れ値 (¥)</label>
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
            <label className="block text-[10px] font-medium tracking-widest text-[var(--color-text-secondary)] mb-1 flex items-center justify-between">
              <span>目標売価 (¥)</span>
              {isPriceEstimated && <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold ml-1 flex items-center gap-0.5"><Bot size={8} />AI推測（仮）</span>}
            </label>
            <input 
              type="number" 
              value={targetPrice} 
              onChange={e => {
                setTargetPrice(e.target.value ? Number(e.target.value) : '');
                setIsPriceEstimated(false); // 手動変更でフラグ解除
              }} 
              disabled={disabled}
              placeholder="0" 
              className={`w-full bg-white border ${isPriceEstimated ? 'border-purple-300 ring-1 ring-purple-300 bg-purple-50/30' : 'border-gray-200'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow disabled:opacity-50`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium tracking-widest text-[var(--color-text-secondary)] mb-1 flex items-center justify-between">
              <span>想定送料 (¥)</span>
              {isPostageEstimated && <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold ml-1 flex items-center gap-0.5"><Bot size={8} />AI推測（仮）</span>}
            </label>
            <input 
              type="number" 
              value={postage} 
              onChange={e => {
                setPostage(e.target.value ? Number(e.target.value) : '');
                setIsPostageEstimated(false); // 手動変更でフラグ解除
              }} 
              disabled={disabled}
              placeholder="0" 
              className={`w-full bg-white border ${isPostageEstimated ? 'border-purple-300 ring-1 ring-purple-300 bg-purple-50/30' : 'border-gray-200'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow disabled:opacity-50`}
            />
          </div>
          <div className="relative">
            <label className="block text-[10px] font-medium tracking-widest text-[var(--color-text-secondary)] mb-1">保管箱番号</label>
            <input 
              type="text" 
              value={boxNumber} 
              onChange={e => setBoxNumber(e.target.value)} 
              disabled={disabled}
              placeholder="例: A-1" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow disabled:opacity-50"
            />
            {isBoxFullWarning && (
              <div className="absolute -bottom-6 left-0 right-0">
                <p className="text-[10px] text-[var(--color-warning)] font-medium tracking-wide whitespace-nowrap flex items-center gap-1">
                  <Lightbulb size={10} strokeWidth={1.5} /> {boxNumber}の空きはあと{Math.max(0, remainingBoxCapacity)}個です。
                </p>
                <p className="text-[9px] text-[var(--color-warning)] font-medium mt-0.5 leading-tight flex items-center gap-1">
                  <Bot size={10} strokeWidth={1.5} /> AI提案: 古い在庫の値下げ・処分を検討しましょう。
                </p>
              </div>
            )}
          </div>
          {subscriptionStatus === 'premium' && (
            <div>
              <label className="block text-[10px] font-medium tracking-widest text-[var(--color-warning)] mb-1 flex items-center gap-1">
                保管ロケーション <Crown size={12} strokeWidth={1.5} />
              </label>
              <input 
                type="text" 
                value={locationTag} 
                onChange={e => setLocationTag(e.target.value)} 
                disabled={disabled}
                placeholder="例: 自宅 / 実家" 
                className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow disabled:opacity-50"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium tracking-widest text-[var(--color-text-secondary)] mb-1">ステータス</label>
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
              <label className="block text-[10px] font-medium tracking-widest text-[var(--color-text-secondary)] mb-1">手数料率 (%)</label>
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
          
          <div className="bg-[var(--color-bg-base)] rounded-xl px-4 py-2.5 border border-[var(--color-border)] flex justify-between items-center h-[42px]">
            <span className="text-xs font-medium tracking-widest text-[var(--color-text-secondary)]">純利益予測</span>
            <span className={`font-medium tracking-wide ${profit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
              ¥ {Math.floor(profit).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!itemName.trim() || disabled || isLoading}
            className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-light)] disabled:opacity-50 text-white font-medium tracking-widest py-3 px-6 rounded-full shadow-[var(--shadow-card)] transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>在庫に登録する</span>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
        <h4 className="text-xs font-medium tracking-[0.2em] text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
          <Settings2 size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          <span>出品マイルール（AIパーソナライズ）</span>
        </h4>
        <p className="text-[10px] tracking-wide text-[var(--color-text-secondary)] mb-4 leading-relaxed">
          「タバコ吸いません」「即購入OK」「値下げ不可」など、あなた独自のルールを設定しておくと、AIが自動で全プラットフォーム向けの説明文に組み込みます。
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={localSellerRules}
            onChange={(e) => setLocalSellerRules(e.target.value)}
            placeholder="例: ペットなし、喫煙者なし。即購入大歓迎です！"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-shadow"
          />
          <button
            type="button"
            onClick={handleSaveRules}
            disabled={isSavingRules}
            className="bg-[var(--color-text-primary)] text-white px-5 py-2 rounded-full text-xs font-medium tracking-widest shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isSavingRules ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
