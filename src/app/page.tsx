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
import LandingPage from '@/components/LandingPage'
import NativeAdCard from '@/components/NativeAdCard'
import { AFFILIATE_ADS } from '@/lib/affiliateData'

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // ユーザー状態
  const [remaining, setRemaining] = useState<number | null>(null)
  const [maxLimit, setMaxLimit] = useState<number>(3)
  const [isPremium, setIsPremium] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free')
  const [preferences, setPreferences] = useState<{box_capacity: number; bonus_slots?: number}>({ box_capacity: 20 })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [roadmapProgress, setRoadmapProgress] = useState(35)

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
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base font-medium">
            超軽量・シンプル・低価格な在庫・利益・保管箱管理手帳
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
          onOpenShareModal={(preferences?.bonus_slots || 0) < 1 ? () => setShowShareModal(true) : undefined}
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
                <div className="flex gap-4 flex-wrap">
                  <button onClick={() => window.open('/api/premium/export', '_blank')} className="bg-white text-amber-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition flex items-center gap-2">
                    📥 CSVエクスポート
                  </button>
                  <button onClick={async () => {
                    try {
                      const res = await fetch('/api/premium/analytics');
                      const data = await res.json();
                      if (data.analytics) {
                        alert(`【簡易利益分析】\n登録総数: ${data.analytics.totalItems}件\n売却済: ${data.analytics.soldCount}件\n想定利益総額: ¥${data.analytics.totalProfitEstimate.toLocaleString()}`);
                      } else {
                        alert('分析データの取得に失敗しました');
                      }
                    } catch(e) {
                      alert('エラーが発生しました');
                    }
                  }} className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition flex items-center gap-2">
                    📊 簡易利益分析レポートを生成
                  </button>
                </div>
              </div>
            )}
            
            <InventoryList 
              items={items}
              onUpdateStatus={handleUpdateStatus}
              onUpdateDescription={handleUpdateDescription}
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
