'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import SummaryCard from '@/components/SummaryCard'
import InventoryForm from '@/components/InventoryForm'
import InventoryList from '@/components/InventoryList'
import ShippingCalculator from '@/components/ShippingCalculator'
import FooterFeedback from '@/components/FooterFeedback'
import StatusBar from '@/components/StatusBar'
import AuthModal from '@/components/AuthModal'
import LimitModal from '@/components/LimitModal'
import CustomShareModal from '@/components/CustomShareModal'
import ManagePlanModal from '@/components/ManagePlanModal'
import RoadmapGauge from '@/components/RoadmapGauge'
import MonthlyReportModal from '@/components/MonthlyReportModal'
import { InventoryItem, InventoryStatus } from '@/types/inventory'
import PremiumChart from '@/components/PremiumChart'
import LandingPage from '@/components/LandingPage'
import NativeAdCard from '@/components/NativeAdCard'
import PremiumInsightPanel from '@/components/PremiumInsightPanel'
import { AFFILIATE_ADS } from '@/lib/affiliateData'
import BottomNav, { TabType } from '@/components/BottomNav'
import { Archive, Crown, Download, RefreshCw, Sparkles, AlertCircle } from 'lucide-react'
import { seoCategories } from '@/data/seoCategories'

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDataLocked, setIsDataLocked] = useState(false)
  
  // ユーザー状態
  const [remaining, setRemaining] = useState<number | null>(null)
  const [maxLimit, setMaxLimit] = useState<number>(3)
  const [isPremium, setIsPremium] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free')
  const [preferences, setPreferences] = useState<{box_capacity: number; bonus_slots?: number; seller_rules?: string; referral_code?: string; customSignature?: string}>({ box_capacity: 20 })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [roadmapProgress, setRoadmapProgress] = useState(35)
  const [imageAnalysisRemaining, setImageAnalysisRemaining] = useState<number>(0)
  const [imageAnalysisMax, setImageAnalysisMax] = useState<number>(0)
  type MarkdownSuggestion = {
    id: string;
    item_name: string;
    current_price: number;
    suggested_price: number;
    days_elapsed: number;
    reason: string;
  };
  type ChartData = {
    name: string;
    value: number;
    fill: string;
  };
  const [analytics, setAnalytics] = useState<{
    totalItems: number;
    soldCount: number;
    totalProfitEstimate: number;
    bestSellingTime?: string;
    markdownSuggestions?: MarkdownSuggestion[];
    chartData?: ChartData[];
    aiInsights?: any;
    lastAiAnalysisAt?: string | null;
  } | null>(null)

  // モーダル状態
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [showManagePlanModal, setShowManagePlanModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  // タブ状態とキーボード検知
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [templateInput, setTemplateInput] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const templateId = searchParams.get('template');
      if (templateId && seoCategories[templateId]) {
        setActiveTab('add');
        setTemplateInput(seoCategories[templateId].exampleInput);
        
        // パラメータを消してURLを綺麗にする
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setIsKeyboardOpen(true);
      }
    };
    const handleBlur = () => setIsKeyboardOpen(false);
    
    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);
    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // データフェッチ
  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setIsDataLocked(data.isLocked || false);
      }
    } catch (e) {
      console.error("Failed to fetch inventory", e);
    }
  }, []);

  const fetchUserStatus = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const res = await fetch(`/api/user-status`);
      const data = await res.json();
      if (data.isLoggedIn !== undefined) setIsLoggedIn(data.isLoggedIn);
      if (data.remaining !== undefined) setRemaining(data.remaining);
      if (data.maxLimit !== undefined) setMaxLimit(data.maxLimit);
      if (data.isPremium !== undefined) setIsPremium(data.isPremium);
      if (data.subscriptionStatus !== undefined) setSubscriptionStatus(data.subscriptionStatus);
      if (data.preferences !== undefined) setPreferences(data.preferences);
      if (data.imageAnalysisRemaining !== undefined) setImageAnalysisRemaining(data.imageAnalysisRemaining);
      if (data.imageAnalysisMax !== undefined) setImageAnalysisMax(data.imageAnalysisMax);
      
      if (data.isLoggedIn) {
        await fetchInventory();
        if (data.subscriptionStatus === 'premium') {
          try {
            const aRes = await fetch('/api/premium/analytics');
            const aData = await aRes.json();
            if (aData.analytics) setAnalytics(aData.analytics);
          } catch(e) {
            console.error(e);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch user status", e);
    } finally {
      setIsAuthLoading(false);
    }
  }, [fetchInventory]);

  const fetchRoadmapProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/roadmap');
      if (res.ok) {
        const data = await res.json();
        setRoadmapProgress(data.progress || 35);
      }
    } catch (e) {
      console.error("Failed to fetch roadmap progress", e);
    }
  }, []);

  useEffect(() => {
    fetchUserStatus();
    fetchRoadmapProgress();
  }, [fetchUserStatus, fetchRoadmapProgress]);

  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);

  const handleUpdateAIAnalysis = async () => {
    setIsAIAnalyzing(true);
    try {
      const res = await fetch('/api/premium/analytics', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'AI分析に失敗しました。');
        return;
      }
      
      // 最新の集計・分析結果を再ロードして反映
      const aRes = await fetch('/api/premium/analytics');
      const aData = await aRes.json();
      if (aData.analytics) {
        setAnalytics(aData.analytics);
      }
      alert('AIコンシェルジュ分析が更新されました！');
    } catch (e) {
      console.error(e);
      alert('通信エラーが発生しました。');
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  // アクションハンドラー
  const handleAdd = async (data: any) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (res.status === 402 || result.limitReached) {
        setShowLimitModal(true);
        return;
      }
      
      if (!res.ok) throw new Error(result.error || '追加に失敗しました');
      
      setItems(prev => [result.item, ...prev]);
      await fetchUserStatus(); // limit更新用
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: InventoryStatus) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      }
    } catch (e) {
      console.error(e);
      alert('更新に失敗しました');
    }
  };

  const handleUpdateTargetPrice = async (id: string, target_price: number) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_price }),
      });
      if (res.ok) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, target_price } : item));
        // サジェストをリストから消す
        setAnalytics(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            markdownSuggestions: prev.markdownSuggestions?.filter(sug => sug.id !== id)
          }
        });
        alert('システム上の価格を更新しました。\\n※実際のフリマアプリ上でも手動で価格を変更してください。');
      } else {
        throw new Error('Update failed');
      }
    } catch (e) {
      console.error(e);
      alert('更新に失敗しました');
    }
  };

  const handleUpdateDescription = async (id: string, description_stock: string) => {
    try {
      setItems(prev => prev.map(item => item.id === id ? { ...item, description_stock } : item));
      await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description_stock }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const { item } = await res.json();
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
      } else {
        throw new Error('Update failed');
      }
    } catch (e) {
      console.error(e);
      alert('更新に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
        await fetchUserStatus(); // limit更新用
      }
    } catch (e) {
      console.error(e);
      alert('削除に失敗しました');
    }
  };

  const handleAddSample = async () => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: 'Apple AirPods Pro (第2世代) 🔰',
          purchase_price: 15000,
          target_price: 25000,
          postage: 450,
          status: 'hand',
          description_stock: JSON.stringify({
            mercari: '【美品】Apple AirPods Pro 第2世代です。\n数回使用しましたが、耳に合わなかったため出品します。\n付属品完備。動作確認済みです。\n※アルコール消毒済み',
            yahoo: 'Apple AirPods Pro 第2世代の出品です。\n数回使用の美品。付属品は全て揃っています。',
            rakuma: 'Apple AirPods Pro 第2世代\n数回使用しましたが綺麗な状態です。'
          })
        })
      });
      if (res.ok) {
        await fetchUserStatus(); // 更新
        alert('✨ サンプルデータを追加しました！\n\nまずはリストにある商品の「説明文AI」や「編集」ボタンを押して、FleaScriptの機能を試してみましょう。');
        setActiveTab('list');
      } else {
        const err = await res.json();
        alert(err.error || 'サンプル追加に失敗しました');
      }
    } catch (e) {
      console.error(e);
      alert('通信エラーが発生しました');
    }
  };

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (!isAuthLoading && !isLoggedIn) {
    return (
      <>
        <LandingPage onLoginClick={() => setShowAuthModal(true)} />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  return (
    <>
      <main className="max-w-3xl mx-auto w-full px-4 md:px-8 pt-10 pb-28 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-10 text-center relative mt-6">
          <div className="inline-block relative">
            <h1 className="text-3xl md:text-4xl font-medium tracking-wide text-[var(--color-brand)] mb-3 flex items-center justify-center gap-3">
              <Archive strokeWidth={1.2} size={32} />
              FleaScript 在庫管理
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base font-normal tracking-wider mt-2">
            フリマ出品の「めんどくさい」を1秒で消し去る魔法
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in-up">
            {error}
          </div>
        )}

        {isDataLocked && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] text-sm animate-fade-in-up flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-medium tracking-widest">現在のプラン上限（{maxLimit}件）を超過しています</p>
              <p className="mt-1 opacity-80 text-xs">超過分のデータは安全に保護されていますが、現在は閲覧・編集がロックされています。<br />すべてのデータにアクセスするには、プランをアップグレードしてください。</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-8">
            {activeTab === 'home' && (
              <div className="animate-fade-in-up flex flex-col gap-8">
                <SummaryCard 
                  items={items} 
                  remaining={remaining} 
                  maxLimit={maxLimit} 
                  isPremium={isPremium} 
                  onOpenReportModal={() => setShowReportModal(true)}
                />
                
                {subscriptionStatus !== 'premium' && (
                  <NativeAdCard 
                    ad={AFFILIATE_ADS.find(a => a.id === 'ad-measure')!} 
                    subscriptionStatus={subscriptionStatus} 
                  />
                )}
                {subscriptionStatus === 'premium' && (
                  <PremiumInsightPanel 
                    items={items} 
                    aiInsights={analytics?.aiInsights || null}
                    lastAiAnalysisAt={analytics?.lastAiAnalysisAt || null}
                    isAnalyzing={isAIAnalyzing}
                    onUpdateAnalysis={handleUpdateAIAnalysis}
                  />
                )}
              </div>
            )}

            {activeTab === 'list' && (
              <div className="animate-fade-in-up flex flex-col gap-8">
                <InventoryList 
                  items={items}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdateDescription={handleUpdateDescription}
                  onUpdateItem={handleUpdateItem}
                  onDelete={handleDelete}
                  onGoToAddTab={() => setActiveTab('add')}
                  onAddSample={handleAddSample}
                  isDataLocked={isDataLocked}
                />
              </div>
            )}

            {activeTab === 'add' && (
              <div className="animate-fade-in-up flex flex-col gap-8">
                <ShippingCalculator subscriptionStatus={subscriptionStatus} />
                <InventoryForm 
                  onAdd={handleAdd} 
                  isLoading={isLoading} 
                  disabled={remaining === 0} 
                  subscriptionStatus={subscriptionStatus}
                  boxCapacity={preferences.box_capacity}
                  currentItems={items}
                  sellerRules={preferences.seller_rules || ''}
                  customSignature={preferences.customSignature || ''}
                  imageAnalysisRemaining={imageAnalysisRemaining}
                  imageAnalysisMax={imageAnalysisMax}
                  onAnalysisUsed={() => setImageAnalysisRemaining(prev => Math.max(0, prev - 1))}
                  initialItemName={templateInput}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="animate-fade-in-up flex flex-col gap-8">
                {subscriptionStatus === 'premium' ? (
                  <div className="bg-[var(--color-bg-surface)] border border-[var(--color-warning)] rounded-2xl p-6 md:p-8 shadow-sm">
                    <h3 className="text-[var(--color-text-primary)] font-medium tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Crown strokeWidth={1.5} size={20} className="text-[var(--color-warning)]" /> プレミアム分析ダッシュボード
                    </h3>
                    
                    {analytics ? (
                      <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <PremiumChart data={analytics.chartData} />
                        <div className="grid grid-cols-2 flex-1 gap-4">
                          <div className="bg-[var(--color-bg-base)] p-4 rounded-xl text-center border border-[var(--color-border)] flex flex-col justify-center">
                            <div className="text-xs text-[var(--color-text-secondary)] font-medium tracking-widest mb-1">登録総数</div>
                            <div className="text-xl font-medium tracking-wide text-[var(--color-text-primary)]">{analytics.totalItems} <span className="text-sm font-normal text-[var(--color-text-muted)]">件</span></div>
                          </div>
                          <div className="bg-[var(--color-bg-base)] p-4 rounded-xl text-center border border-[var(--color-border)] flex flex-col justify-center">
                            <div className="text-xs text-[var(--color-text-secondary)] font-medium tracking-widest mb-1">売却済</div>
                            <div className="text-xl font-medium tracking-wide text-[var(--color-text-primary)]">{analytics.soldCount} <span className="text-sm font-normal text-[var(--color-text-muted)]">件</span></div>
                          </div>
                          <div className="bg-[var(--color-bg-base)] p-4 rounded-xl text-center border border-[var(--color-border)] flex flex-col justify-center col-span-2">
                            <div className="text-xs text-[var(--color-text-secondary)] font-medium tracking-widest mb-1">想定利益総額</div>
                            <div className="text-2xl font-medium tracking-wide text-[var(--color-success)]">¥ {analytics.totalProfitEstimate.toLocaleString()}</div>
                          </div>
                          <div className="bg-[var(--color-brand)] text-white p-4 rounded-xl text-center shadow-md relative overflow-hidden col-span-2 flex flex-col justify-center">
                            <div className="text-xs font-medium tracking-widest mb-1 opacity-90 text-white/80 flex items-center justify-center gap-1">
                              <Sparkles size={14} strokeWidth={1.5} /> 最も売れる時間
                            </div>
                            <div className="text-lg font-medium tracking-wide mt-1">{analytics.bestSellingTime || 'データ不足'}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[var(--color-text-secondary)] text-sm mb-4 tracking-wide">分析データを読み込み中...</div>
                    )}

                    <div className="flex gap-4 flex-wrap">
                      <button onClick={() => window.open('/api/premium/export', '_blank')} className="bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] px-5 py-2.5 rounded-full text-xs font-medium tracking-widest hover:border-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2">
                        <Download size={14} strokeWidth={1.5} /> CSVエクスポート
                      </button>
                      <button onClick={async () => {
                        try {
                          const res = await fetch('/api/premium/analytics');
                          const data = await res.json();
                          if (data.analytics) {
                            setAnalytics(data.analytics);
                            alert('データを最新に更新しました');
                          }
                        } catch(e) {
                          alert('エラーが発生しました');
                        }
                      }} className="bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] px-5 py-2.5 rounded-full text-xs font-medium tracking-widest hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors flex items-center gap-2">
                        <RefreshCw size={14} strokeWidth={1.5} /> データ更新
                      </button>
                    </div>
                    
                    {/* AI Markdown Suggestions */}
                    {analytics?.markdownSuggestions && analytics.markdownSuggestions.length > 0 && (
                      <div className="mt-8 border-t border-[var(--color-border)] pt-8 animate-fade-in-up">
                        <h4 className="text-xs font-medium tracking-[0.2em] text-[var(--color-text-primary)] mb-5 flex items-center gap-2">
                          <Sparkles size={16} strokeWidth={1.5} className="text-[var(--color-brand)]" /> AI値下げサジェスト（上位表示ハック）
                        </h4>
                        <div className="flex flex-col gap-3">
                          {analytics.markdownSuggestions.map(sug => (
                            <div key={sug.id} className="bg-white rounded-xl p-4 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
                               <div className="flex-1">
                                 <div className="font-bold text-gray-800">{sug.item_name}</div>
                                 <div className="text-xs text-amber-600 mt-1">{sug.reason}</div>
                               </div>
                               <div className="flex items-center gap-4">
                                 <div className="text-right flex flex-col items-end">
                                   <div className="text-xs text-gray-400 line-through">¥{sug.current_price.toLocaleString()}</div>
                                   <div className="text-lg font-bold text-red-500">¥{sug.suggested_price.toLocaleString()}</div>
                                 </div>
                                 <button
                                   onClick={() => handleUpdateTargetPrice(sug.id, sug.suggested_price)}
                                   className="border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] px-5 py-2 rounded-full text-xs font-medium tracking-widest transition-all whitespace-nowrap"
                                 >
                                   この価格に変更
                                 </button>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[var(--color-bg-surface)] p-8 rounded-2xl text-center shadow-sm border border-[var(--color-border)]">
                    <div className="text-[var(--color-brand)] mb-4 flex justify-center">
                      <Crown size={48} strokeWidth={1} />
                    </div>
                    <h3 className="text-xl font-medium tracking-wide text-gray-800 mb-2">プレミアム分析機能</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">最も商品が売れやすい時間帯の分析や、AIによる値下げ自動サジェストなど、売上を最大化する機能がアンロックされます。</p>
                    <button onClick={() => window.location.href = '/checkout?plan=standard'} className="bg-[var(--color-brand)] text-white font-medium tracking-widest py-3 px-8 rounded-full shadow-[var(--shadow-card)] hover:bg-[var(--color-brand-light)] transition-colors inline-block mt-4">
                      詳細を見る
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="animate-fade-in-up flex flex-col gap-8">
                <StatusBar 
                  remaining={remaining} 
                  maxLimit={maxLimit}
                  isPremium={isPremium} 
                  isLoggedIn={isLoggedIn}
                  isDevMode={false}
                  subscriptionStatus={subscriptionStatus}
                  onUpgradeClick={() => window.location.href = '/checkout?plan=standard'} 
                  onManagePlanClick={() => setShowManagePlanModal(true)}
                  onLogoutClick={handleLogout}
                  onLoginClick={() => {}}
                  onOpenShareModal={() => setShowShareModal(true)}
                />
                
                <div className="mt-4">
                  <RoadmapGauge progress={roadmapProgress} />
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                  <Link href="/legal/terms" className="hover:text-gray-600 hover:underline">利用規約</Link>
                  <Link href="/legal/privacy" className="hover:text-gray-600 hover:underline">プライバシーポリシー</Link>
                  <Link href="/legal/tokushoho" className="hover:text-gray-600 hover:underline">特定商取引法に基づく表記</Link>
                </div>
              </div>
            )}
        </div>
        
        <FooterFeedback />
      </main>

      {!isKeyboardOpen && (
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      )}

      <LimitModal 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)} 
        onOpenShareModal={(preferences?.bonus_slots || 0) < 1 ? () => setShowShareModal(true) : undefined}
      />

      <CustomShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        referralCode={preferences?.referral_code}
      />

      <ManagePlanModal
        isOpen={showManagePlanModal}
        onClose={() => setShowManagePlanModal(false)}
        deviceId="" // deviceIdは廃止されたため空文字（バックエンドでは不要になったが、コンポーネントのProps変更対応が必要なら空で渡す）
        onCanceled={fetchUserStatus}
        subscriptionStatus={subscriptionStatus}
      />

      <MonthlyReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        items={items}
      />
    </>
  )
}
