'use client';

import { useState } from 'react';
import { InventoryItem, InventoryStatus } from '@/types/inventory';


interface InventoryListProps {
  items: InventoryItem[];
  onUpdateStatus: (id: string, status: InventoryStatus) => Promise<void>;
  onUpdateDescription: (id: string, text: string) => Promise<void>;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function InventoryList({ items, onUpdateStatus, onUpdateDescription, onUpdateItem, onDelete }: InventoryListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
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
      <div className="text-center py-10 text-gray-400 bg-white/50 rounded-2xl border border-dashed border-gray-200">
        <p>在庫アイテムはまだ登録されていません</p>
      </div>
    );
  }

  const STATUS_LABELS: Record<InventoryStatus, { label: string; color: string }> = {
    hand: { label: '手元保管', color: 'bg-gray-100 text-gray-600' },
    mercari: { label: 'メルカリ出品中', color: 'bg-red-100 text-red-600' },
    yahoo: { label: 'ヤフオク出品中', color: 'bg-yellow-100 text-yellow-700' },
    sold: { label: '売却済', color: 'bg-emerald-100 text-emerald-600' },
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>📋 在庫一覧</span>
      </h3>
      
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_LABELS[item.status].color}`}>
                        {STATUS_LABELS[item.status].label}
                      </span>
                      {item.box_number && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                          📦 箱: {item.box_number}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-800 text-base">{item.item_name}</h4>
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
                {editId === item.id ? (
                  <>
                    <button
                      onClick={async () => {
                        setLoadingId(item.id);
                        await onUpdateItem(item.id, editData);
                        setEditId(null);
                        setLoadingId(null);
                      }}
                      disabled={loadingId === item.id}
                      className="text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      disabled={loadingId === item.id}
                      className="text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
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
                        className="text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
                      >
                        売却済にする
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="text-xs font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-100"
                    >
                      {expandedId === item.id ? '閉じる' : '説明文AI'}
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
                      className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={loadingId === item.id}
                      className="text-xs p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="削除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 拡張エリア (AI文章ストッカー) */}
          {expandedId === item.id && (
            <div className="bg-gray-50 p-4 sm:p-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-700">✍️ AI説明文ストック</span>
                <button
                  onClick={() => handleGenerateText(item)}
                  disabled={generatingId === item.id || loadingId === item.id}
                  className="text-xs font-bold bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-light)] text-white px-3 py-1.5 rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1"
                >
                  {generatingId === item.id ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>✨ AI一括生成</span>
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
