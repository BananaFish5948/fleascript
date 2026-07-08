'use client'

import { useState, useEffect } from 'react'
import { NativeAdData } from '@/lib/affiliateData'
import { Plus, Trash2, Edit2, Check, X, RefreshCw, AlertCircle } from 'lucide-react'

// 利用可能な標準配送サイズ
const SHIPPING_SIZES = [
  'ネコポス',
  'ゆうパケット',
  'ゆうパケットポスト',
  'クリックポスト',
  '宅急便コンパクト',
  'ゆうパケットプラス'
]

export default function AdminAffiliateManager() {
  const [ads, setAds] = useState<NativeAdData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 編集中の広告データ
  const [editingAd, setEditingAd] = useState<Partial<NativeAdData> | null>(null)
  // 新規作成中の広告データ
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  // 広告リストを取得
  const fetchAds = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/affiliate', { cache: 'no-store' })
      if (!res.ok) throw new Error('広告データの取得に失敗しました')
      const data = await res.json()
      setAds(data)
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  // 保存処理 (新規作成 / 編集)
  const handleSave = async (adData: Partial<NativeAdData>) => {
    if (!adData.id || !adData.title || !adData.description || !adData.imageUrl || !adData.affiliateUrl || !adData.context) {
      alert('必須項目をすべて入力してください')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', ad: adData })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || '保存に失敗しました')
      
      alert(result.message || '保存しました')
      setEditingAd(null)
      setIsAdding(false)
      fetchAds() // リスト再取得
    } catch (err: any) {
      alert(err.message || 'エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  // 削除処理
  const handleDelete = async (ad: NativeAdData) => {
    if (!confirm(`広告「${ad.title}」を削除してもよろしいですか？`)) {
      return
    }

    try {
      const res = await fetch('/api/admin/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ad })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || '削除に失敗しました')
      
      alert(result.message || '削除しました')
      fetchAds()
    } catch (err: any) {
      alert(err.message || 'エラーが発生しました')
    }
  }

  // 配送サイズ選択時の処理
  const handleSizeToggle = (size: string, currentSizes: string[] = []) => {
    if (currentSizes.includes(size)) {
      return currentSizes.filter(s => s !== size)
    } else {
      return [...currentSizes, size]
    }
  }

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">🛍️ アフィリエイト広告・ネイティブ広告管理</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            配送シミュレーター下部やダッシュボード等に表示する広告URL・製品写真を動的に編集します。
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchAds}
            className="p-2 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] transition-colors"
            title="再読み込み"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => {
              setIsAdding(true)
              setEditingAd({
                id: `ad-${Date.now()}`,
                title: '',
                description: '',
                priceText: '',
                imageUrl: '',
                affiliateUrl: '',
                context: 'dashboard',
                sizeTarget: []
              })
            }}
            className="inline-flex items-center gap-1 bg-[var(--color-brand)] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> 新規広告作成
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] rounded-xl flex items-center gap-2 mb-6 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !isAdding && !editingAd ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)] text-sm">
          データをロード中...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: 広告一覧 */}
          <div className="lg:col-span-2 space-y-4">
            {ads.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-secondary)] text-sm">
                登録されているアフィリエイト広告がありません。
              </div>
            ) : (
              ads.map(ad => (
                <div 
                  key={ad.id} 
                  className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-2xl transition-all ${
                    editingAd?.id === ad.id 
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand-dim)]/5' 
                      : 'border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-[var(--color-brand)]/50'
                  }`}
                >
                  <div className="w-20 h-20 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded ${
                        ad.context === 'shipping' 
                          ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' 
                          : 'bg-[var(--color-info)]/10 text-[var(--color-info)]'
                      }`}>
                        {ad.context === 'shipping' ? '配送画面' : 'ダッシュボード'}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">{ad.id}</span>
                    </div>
                    <h4 className="font-semibold text-sm mt-1 text-[var(--color-text-primary)] truncate">{ad.title}</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-relaxed">{ad.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ad.priceText && (
                        <span className="text-[10px] font-medium text-[var(--color-brand)] bg-[var(--color-brand)]/5 px-2 py-0.5 rounded">
                          {ad.priceText}
                        </span>
                      )}
                      {ad.sizeTarget && ad.sizeTarget.length > 0 && ad.sizeTarget.map(size => (
                        <span key={size} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col justify-end items-center gap-2 border-t sm:border-t-0 sm:border-l border-[var(--color-border)] pt-3 sm:pt-0 sm:pl-4">
                    <button 
                      onClick={() => {
                        setIsAdding(false)
                        setEditingAd({ ...ad })
                      }}
                      className="p-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl hover:bg-[var(--color-bg-base)] transition-colors"
                      title="編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(ad)}
                      className="p-2 border border-[var(--color-danger)]/30 text-[var(--color-danger)] rounded-xl hover:bg-[var(--color-danger-bg)] transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 右側: 編集 / 作成パネル */}
          <div className="lg:col-span-1">
            {editingAd ? (
              <div className="border border-[var(--color-brand)] bg-[var(--color-bg-surface)] rounded-2xl p-5 sticky top-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                  <h3 className="font-bold text-sm text-[var(--color-brand)]">
                    {isAdding ? '✨ 新規広告作成' : '📝 広告データ編集'}
                  </h3>
                  <button 
                    onClick={() => {
                      setEditingAd(null)
                      setIsAdding(false)
                    }}
                    className="p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-base)] rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-sm text-left">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">広告ID (重複不可)</label>
                    <input 
                      type="text" 
                      value={editingAd.id || ''}
                      onChange={e => setEditingAd({ ...editingAd, id: e.target.value })}
                      disabled={!isAdding}
                      className="w-full text-xs font-mono p-2 border border-[var(--color-border)] rounded-xl focus:border-[var(--color-brand)] outline-none bg-[var(--color-bg-base)] disabled:opacity-60"
                      placeholder="ad-custom-item"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">タイトル</label>
                    <input 
                      type="text" 
                      value={editingAd.title || ''}
                      onChange={e => setEditingAd({ ...editingAd, title: e.target.value })}
                      className="w-full text-xs p-2 border border-[var(--color-border)] rounded-xl focus:border-[var(--color-brand)] outline-none"
                      placeholder="商品名など"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">説明文</label>
                    <textarea 
                      value={editingAd.description || ''}
                      onChange={e => setEditingAd({ ...editingAd, description: e.target.value })}
                      className="w-full text-xs p-2 border border-[var(--color-border)] rounded-xl focus:border-[var(--color-brand)] outline-none h-20 resize-none"
                      placeholder="商品のメリットや特徴"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">価格表示テキスト (任意)</label>
                    <input 
                      type="text" 
                      value={editingAd.priceText || ''}
                      onChange={e => setEditingAd({ ...editingAd, priceText: e.target.value })}
                      className="w-full text-xs p-2 border border-[var(--color-border)] rounded-xl focus:border-[var(--color-brand)] outline-none"
                      placeholder="約 ￥1,200 や ￥800 など"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">商品画像URL</label>
                    <input 
                      type="text" 
                      value={editingAd.imageUrl || ''}
                      onChange={e => setEditingAd({ ...editingAd, imageUrl: e.target.value })}
                      className="w-full text-xs p-2 border border-[var(--color-border)] rounded-xl focus:border-[var(--color-brand)] outline-none"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">アフィリエイトURL</label>
                    <input 
                      type="text" 
                      value={editingAd.affiliateUrl || ''}
                      onChange={e => setEditingAd({ ...editingAd, affiliateUrl: e.target.value })}
                      className="w-full text-xs p-2 border border-[var(--color-border)] rounded-xl focus:border-[var(--color-brand)] outline-none"
                      placeholder="Amazonや楽天のアフィリエイトURL"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">掲載場所（コンテキスト）</label>
                    <select
                      value={editingAd.context || 'dashboard'}
                      onChange={e => setEditingAd({ ...editingAd, context: e.target.value as any })}
                      className="w-full text-xs p-2 border border-[var(--color-border)] rounded-xl focus:border-[var(--color-brand)] outline-none"
                    >
                      <option value="dashboard">ダッシュボード (General)</option>
                      <option value="shipping">配送シミュレーター (Shipping)</option>
                    </select>
                  </div>

                  {editingAd.context === 'shipping' && (
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">紐づける配送サイズ (複数選択可)</label>
                      <div className="grid grid-cols-2 gap-1.5 p-2 bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-xl max-h-36 overflow-y-auto">
                        {SHIPPING_SIZES.map(size => {
                          const checked = editingAd.sizeTarget?.includes(size) || false
                          return (
                            <label key={size} className="flex items-center gap-1 text-[11px] text-[var(--color-text-primary)] cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={checked}
                                onChange={() => {
                                  const nextSizes = handleSizeToggle(size, editingAd.sizeTarget)
                                  setEditingAd({ ...editingAd, sizeTarget: nextSizes })
                                }}
                                className="accent-[var(--color-brand)] rounded"
                              />
                              {size}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-[var(--color-border)]">
                  <button 
                    onClick={() => {
                      setEditingAd(null)
                      setIsAdding(false)
                    }}
                    className="flex-1 py-2 text-xs border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] rounded-xl transition-colors font-medium"
                    disabled={saving}
                  >
                    キャンセル
                  </button>
                  <button 
                    onClick={() => handleSave(editingAd)}
                    className="flex-1 py-2 text-xs bg-[var(--color-brand)] hover:opacity-90 text-white rounded-xl transition-opacity font-semibold inline-flex justify-center items-center gap-1"
                    disabled={saving}
                  >
                    {saving ? '保存中...' : (
                      <>
                        <Check className="w-3.5 h-3.5" /> 保存する
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-[var(--color-border)] rounded-2xl p-6 text-center text-[var(--color-text-secondary)] text-sm sticky top-6 bg-[var(--color-bg-base)]/30">
                広告を選択するか、「新規広告作成」ボタンから新しく追加できます。
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
