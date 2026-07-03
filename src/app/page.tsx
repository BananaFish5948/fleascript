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
import { InventoryItem, InventoryStatus } from '@/types/inventory'
import PremiumChart from '@/components/PremiumChart'
import LandingPage from '@/components/LandingPage'
import NativeAdCard from '@/components/NativeAdCard'
import { AFFILIATE_ADS } from '@/lib/affiliateData'

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
  const [preferences, setPreferences] = useState<{box_capacity: number; bonus_slots?: number; seller_rules?: string; referral_code?: string}>({ box_capacity: 20 })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [roadmapProgress, setRoadmapProgress] = useState(35)
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
  const [analytics, setAnalytics] = useState<{totalItems: number, soldCount: number, totalProfitEstimate: number, bestSellingTime?: string, markdownSuggestions?: MarkdownSuggestion[], chartData?: ChartData[]} | null>(null)

  // モーダル状態
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [showManagePlanModal, setShowManagePlanModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

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
      <main className="max-w-3xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-6 text-center relative mt-4">
          <div className="inline-block relative">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-brand)] mb-3">
              📦 FleaScript 在庫管理
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base font-medium mt-2">
            フリマ出品の「めんどくさい」を1秒で消し去る魔法
          </p>
        </header>

        <div className="mb-8">
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
        </div>

        <div className="glow-line mb-8" />

        {/* Dashboard Content */}
        <div className="flex flex-col gap-6">
            <SummaryCard items={items} remaining={remaining} maxLimit={maxLimit} isPremium={isPremium} />
            
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in-up">
                {error}
              </div>
            )}

            <ShippingCalculator subscriptionStatus={subscriptionStatus} />

            <InventoryForm 
              onAdd={handleAdd} 
              isLoading={isLoading} 
              disabled={remaining === 0} 
              subscriptionStatus={subscriptionStatus}
              boxCapacity={preferences.box_capacity}
              currentItems={items}
              sellerRules={preferences.seller_rules || ''}
            />
            
            {/* Dashboard Native Ad for Free Users */}
            {subscriptionStatus === 'free' && (
              <NativeAdCard 
                ad={AFFILIATE_ADS.find(a => a.id === 'ad-measure')!} 
                subscriptionStatus={subscriptionStatus} 
              />
            )}
            
            {subscriptionStatus === 'premium' && (
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2">👑 プレミアム分析ダッシュボード</h3>
                
                {analytics ? (
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <PremiumChart data={analytics.chartData} />
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div className="bg-white/60 p-4 rounded-xl text-center shadow-sm border border-amber-100 flex flex-col justify-center">
                        <div className="text-xs text-amber-700 font-bold mb-1">登録総数</div>
                        <div className="text-xl font-bold text-gray-800">{analytics.totalItems} <span className="text-sm font-normal">件</span></div>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl text-center shadow-sm border border-amber-100 flex flex-col justify-center">
                        <div className="text-xs text-amber-700 font-bold mb-1">売却済</div>
                        <div className="text-xl font-bold text-gray-800">{analytics.soldCount} <span className="text-sm font-normal">件</span></div>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl text-center shadow-sm border border-amber-100 flex flex-col justify-center col-span-2">
                        <div className="text-xs text-amber-700 font-bold mb-1">想定利益総額</div>
                        <div className="text-2xl font-bold text-emerald-600">¥ {analytics.totalProfitEstimate.toLocaleString()}</div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-4 rounded-xl text-center shadow-md relative overflow-hidden col-span-2 flex flex-col justify-center">
                        <div className="text-xs font-bold mb-1 opacity-90 text-amber-100">🔥 最も売れる時間</div>
                        <div className="text-lg font-bold mt-1">{analytics.bestSellingTime || 'データ不足'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-amber-700 text-sm mb-4">分析データを読み込み中...</div>
                )}

                <div className="flex gap-4 flex-wrap">
                  <button onClick={() => window.open('/api/premium/export', '_blank')} className="bg-white text-amber-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition flex items-center gap-2">
                    📥 CSVエクスポート
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
                  }} className="bg-amber-200/50 text-amber-800 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-200 transition flex items-center gap-2 border border-amber-300">
                    🔄 データ更新
                  </button>
                </div>
                
                {/* AI Markdown Suggestions */}
                {analytics?.markdownSuggestions && analytics.markdownSuggestions.length > 0 && (
                  <div className="mt-6 border-t border-amber-200/50 pt-6 animate-fade-in-up">
                    <h4 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
                      🤖 AI値下げサジェスト（上位表示ハック）
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
                               className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap border border-red-100"
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
            )}
            
            {isDataLocked && (
              <div className="p-4 mb-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in-up flex items-start gap-3 shadow-sm">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold text-red-700">現在のプラン上限（{maxLimit}件）を超過しています</p>
                  <p className="mt-1 text-red-600/90 text-xs">超過分のデータは安全に保護されていますが、現在は閲覧・編集がロックされています。<br />すべてのデータにアクセスするには、プランをアップグレードしてください。</p>
                </div>
              </div>
            )}
            
            <InventoryList 
              items={items}
              onUpdateStatus={handleUpdateStatus}
              onUpdateDescription={handleUpdateDescription}
              onUpdateItem={handleUpdateItem}
              onDelete={handleDelete}
            />
          </div>

        <div className="flex-1" />

        {/* Roadmap Gauge (New Location) */}
        <div className="mt-12 mb-4 px-2">
          <RoadmapGauge progress={roadmapProgress} />
        </div>

        {/* Legal Links */}
        <div className="mt-12 mb-4 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <Link href="/legal/terms" className="hover:text-gray-600 hover:underline">利用規約</Link>
          <Link href="/legal/privacy" className="hover:text-gray-600 hover:underline">プライバシーポリシー</Link>
          <Link href="/legal/tokushoho" className="hover:text-gray-600 hover:underline">特定商取引法に基づく表記</Link>
        </div>
      </main>

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
    </>
  )
}
