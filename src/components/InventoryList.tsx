'use client';

import { useState } from 'react';
import { InventoryItem, InventoryStatus } from '@/types/inventory';
import { List, Archive, AlertCircle, RefreshCw, PenTool, Sparkles, Trash2, Edit2, Zap } from 'lucide-react';


interface InventoryListProps {
  items: InventoryItem[];
  onUpdateStatus: (id: string, status: InventoryStatus) => Promise<void>;
  onUpdateDescription: (id: string, text: string) => Promise<void>;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onGoToAddTab?: () => void;
  onAddSample?: () => Promise<void>;
  isDataLocked?: boolean;
}

export default function InventoryList({ 
  items, 
  onUpdateStatus, 
  onUpdateDescription, 
  onUpdateItem, 
  onDelete, 
  onGoToAddTab, 
  onAddSample,
  isDataLocked = false 
}: InventoryListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isSampleAdding, setIsSampleAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mercari' | 'yahoo' | 'rakuma'>('mercari');
  
  // 編集用ステート
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<InventoryItem>>({});

  const isThreeDaysPassed = (utcDateString: string | undefined) => {
    if (!utcDateString) return false;
    const date = new Date(utcDateString);
    const now = new Date();
    return (now.getTime() - date.getTime()) > 3 * 24 * 60 * 60 * 1000;
  };

  const handleStatusChange = async (id: string, status: InventoryStatus) => {
    setLoadingId(id);
    await onUpdateStatus(id, status);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('本当に削除しますか？')) return;
    setLoadingId(id);
    await onDelete(id);
    setLoadingId(null);
  };

  const handleGenerateText = async (item: InventoryItem) => {
    setGeneratingId(item.id);
    try {
      // 既存のAI生成APIエンドポイントを利用
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inputText: `商品名: ${item.item_name}\n仕入れ値: ${item.purchase_price}円\n目標売価: ${item.target_price}円\n`
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || '生成に失敗しました');
        return;
      }

      if (data.outputData) {
        await onUpdateDescription(item.id, JSON.stringify(data.outputData));
      }

    } catch (error) {
      alert('ネットワークエラーが発生しました');
    } finally {
      setGeneratingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-[var(--color-bg-surface)] rounded-2xl border border-dashed border-[var(--color-border)] flex flex-col items-center">
        <div className="w-16 h-16 bg-[var(--color-brand)]/10 rounded-full flex items-center justify-center text-[var(--color-brand)] mb-4">
          <Sparkles size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">在庫はまだ登録されていません</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8 max-w-sm leading-relaxed">
          まずはここから、魔法のように出品文を作ってみましょう ✨
        </p>
        
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onGoToAddTab}
            className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-light)] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <PenTool size={18} strokeWidth={2} /> 新しいアイテムを追加
          </button>
          
          <button
            onClick={async () => {
              if (onAddSample) {
                setIsSampleAdding(true);
                await onAddSample();
                setIsSampleAdding(false);
              }
            }}
            disabled={isSampleAdding}
            className="w-full bg-[var(--color-bg-elevated)] hover:bg-stone-100 text-[var(--color-text-primary)] border border-[var(--color-border)] font-medium py-3 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            {isSampleAdding ? (
              <div className="w-4 h-4 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>🔰 サンプルデータで機能を試す</>
            )}
          </button>
        </div>
      </div>
    );
  }

  const STATUS_LABELS: Record<InventoryStatus, { label: string; color: string }> = {
    hand: { label: '手元保管', color: 'bg-stone-100 text-[var(--color-text-secondary)]' },
    mercari: { label: 'メルカリ出品中', color: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]' },
    yahoo: { label: 'ヤフオク出品中', color: 'bg-[var(--color-info-bg)] text-[var(--color-info)]' },
    sold: { label: '売却済', color: 'bg-[var(--color-success-bg)] text-[var(--color-success)]' },
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium tracking-[0.2em] text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
        <List size={18} strokeWidth={1.5} />
        <span>在庫一覧</span>
      </h3>
      
      {items.map((item) => (
        <div 
          key={item.id} 
          className={`bg-[var(--color-bg-surface)] rounded-2xl shadow-sm border ${
            isDataLocked 
              ? 'border-red-100 opacity-70' 
              : 'border-[var(--color-border)] hover:shadow-[var(--shadow-card)]'
          } overflow-hidden transition-all`}
        >
          <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* 商品情報 (通常モード or 編集モード) */}
              <div className="flex-1">
                {editId === item.id ? (
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">商品名</label>
                      <input 
                        type="text" 
                        value={editData.item_name || ''} 
                        onChange={e => setEditData({ ...editData, item_name: e.target.value })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[var(--color-brand)]"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">仕入 (¥)</label>
                        <input type="number" value={editData.purchase_price ?? ''} onChange={e => setEditData({ ...editData, purchase_price: Number(e.target.value) })} className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[var(--color-brand)]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">売価 (¥)</label>
                        <input type="number" value={editData.target_price ?? ''} onChange={e => setEditData({ ...editData, target_price: Number(e.target.value) })} className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[var(--color-brand)]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">送料 (¥)</label>
                        <input type="number" value={editData.postage ?? ''} onChange={e => setEditData({ ...editData, postage: Number(e.target.value) })} className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[var(--color-brand)]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">箱番号</label>
                        <input type="text" value={editData.box_number || ''} onChange={e => setEditData({ ...editData, box_number: e.target.value })} className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[var(--color-brand)]" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {isDataLocked ? (
                        <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)] flex items-center gap-1 shadow-sm font-bold">
                          <AlertCircle size={10} strokeWidth={2} />
                          ロック中
                        </span>
                      ) : (
                        <>
                          <span className={`text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full ${STATUS_LABELS[item.status].color}`}>
                            {STATUS_LABELS[item.status].label}
                          </span>
                          {item.box_number && (
                            <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-[var(--color-text-secondary)] border border-[var(--color-border)] flex items-center">
                              <Archive size={10} strokeWidth={1.5} className="mr-1" />
                              箱: {item.box_number}
                            </span>
                          )}
                          {(item.status === 'mercari' || item.status === 'yahoo') && isThreeDaysPassed(item.updated_at || item.created_at) && (
                            <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning)] animate-pulse shadow-sm flex items-center gap-1 opacity-80">
                              <AlertCircle size={10} strokeWidth={1.5} />
                              3日経過（スタミナ切れ）
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <h4 className="font-medium tracking-wide text-[var(--color-text-primary)] text-base">{item.item_name}</h4>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>仕入: ¥{item.purchase_price.toLocaleString()}</span>
                      <span>売価: ¥{item.target_price.toLocaleString()}</span>
                      <span>送料: ¥{item.postage.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              {/* アクションボタン */}
              <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto mt-2 sm:mt-0">
                {isDataLocked ? (
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={loadingId === item.id}
                    className="text-xs font-bold tracking-widest border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 shadow-sm"
                    title="このアイテムを削除して枠を空ける"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    <span>削除して枠を空ける</span>
                  </button>
                ) : editId === item.id ? (
                  <>
                    <button
                      onClick={async () => {
                        setLoadingId(item.id);
                        await onUpdateItem(item.id, editData);
                        setEditId(null);
                        setLoadingId(null);
                      }}
                      disabled={loadingId === item.id}
                      className="text-xs font-medium tracking-wider bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-light)] px-3 py-1.5 rounded-full transition-colors shadow-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      disabled={loadingId === item.id}
                      className="text-xs font-medium tracking-wider bg-stone-100 text-[var(--color-text-secondary)] hover:bg-stone-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    {item.status !== 'sold' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'sold')}
                        disabled={loadingId === item.id}
                        className="text-xs font-medium tracking-wider bg-[var(--color-success-bg)] text-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-[var(--color-bg-base)] px-3 py-1.5 rounded-full transition-colors border border-[var(--color-success)]"
                      >
                        売却済にする
                      </button>
                    )}
                    {(item.status === 'mercari' || item.status === 'yahoo') && isThreeDaysPassed(item.updated_at || item.created_at) && (
                      <button
                        onClick={() => {
                          const text = item.description_stock || '';
                          let copyText = text;
                          try {
                            const parsed = JSON.parse(text);
                            if (parsed && typeof parsed === 'object') {
                              copyText = parsed[item.status] || text;
                            }
                          } catch (e) {}
                          navigator.clipboard.writeText(copyText);
                          alert('説明文をコピーしました。フリマアプリで再出品を行ってください！');
                        }}
                        className="text-[10px] font-medium tracking-wide border border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white px-3 py-1.5 rounded-full transition-colors shadow-sm flex items-center gap-1"
                      >
                        <RefreshCw size={12} strokeWidth={1.5} /> 再出品アシスト
                      </button>
                    )}
                    <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="text-xs font-medium tracking-wider border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                    >
                      {expandedId === item.id ? '閉じる' : <><Zap size={12} strokeWidth={1.5} /> 説明文AI</>}
                    </button>
                    <button
                      onClick={() => {
                        setEditId(item.id);
                        setEditData({
                          item_name: item.item_name,
                          purchase_price: item.purchase_price,
                          target_price: item.target_price,
                          postage: item.postage,
                          box_number: item.box_number || '',
                        });
                        setExpandedId(null);
                      }}
                      className="text-xs font-medium tracking-wider border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                    >
                      <Edit2 size={12} strokeWidth={1.5} /> 編集
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={loadingId === item.id}
                      className="text-xs p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 拡張エリア (AI文章ストッカー) */}
          {expandedId === item.id && !isDataLocked && (
            <div className="bg-gray-50 p-4 sm:p-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium tracking-[0.2em] text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <PenTool size={14} strokeWidth={1.5} /> AI説明文ストック
                </span>
                <button
                  onClick={() => handleGenerateText(item)}
                  disabled={generatingId === item.id || loadingId === item.id}
                  className="text-xs font-medium tracking-widest border border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white px-3 py-1.5 rounded-full shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {generatingId === item.id ? (
                    <div className="w-3 h-3 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Sparkles size={12} strokeWidth={1.5} /> AI一括生成</>
                  )}
                </button>
              </div>
              
              {(() => {
                let parsedData: any = null;
                const rawDesc = item.description_stock || '';
                try {
                  parsedData = JSON.parse(rawDesc);
                  if (typeof parsedData !== 'object' || !parsedData.mercari) {
                    parsedData = null;
                  }
                } catch {
                  parsedData = null; // レガシーテキストフォーマット
                }

                if (parsedData) {
                  return (
                    <div className="flex flex-col h-full">
                      <div className="flex border-b border-gray-200 mb-3">
                        {(['mercari', 'yahoo', 'rakuma'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-xs font-bold transition-colors ${activeTab === tab ? 'text-[var(--color-brand)] border-b-2 border-[var(--color-brand)]' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            {tab === 'mercari' ? 'メルカリ' : tab === 'yahoo' ? 'ヤフオク' : 'ラクマ'}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={parsedData[activeTab] || ''}
                        onChange={(e) => {
                          const updated = { ...parsedData, [activeTab]: e.target.value };
                          onUpdateDescription(item.id, JSON.stringify(updated));
                        }}
                        className="w-full h-32 p-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
                      />
                    </div>
                  );
                } else {
                  return (
                    <textarea
                      value={rawDesc}
                      onChange={(e) => onUpdateDescription(item.id, e.target.value)}
                      placeholder="「AI一括生成」ボタンを押すと、各プラットフォーム向けの説明文がここにストックされます。"
                      className="w-full h-32 p-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
                    />
                  );
                }
              })()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
