'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import SummaryCard from '@/components/SummaryCard'
import InventoryForm from '@/components/InventoryForm'
import InventoryList from '@/components/InventoryList'
import FooterFeedback from '@/components/FooterFeedback'
import StatusBar from '@/components/StatusBar'
import AuthModal from '@/components/AuthModal'
import LimitModal from '@/components/LimitModal'
import CustomShareModal from '@/components/CustomShareModal'
import ManagePlanModal from '@/components/ManagePlanModal'
import { InventoryItem, InventoryStatus } from '@/types/inventory'

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // ユーザー状態
  const [remaining, setRemaining] = useState<number | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // モーダル状態
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [showManagePlanModal, setShowManagePlanModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

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
      if (data.isPremium !== undefined) setIsPremium(data.isPremium);
      
      if (data.isLoggedIn) {
        await fetchInventory();
      }
    } catch (e) {
      console.error("Failed to fetch user status", e);
    } finally {
      setIsAuthLoading(false);
    }
  }, [fetchInventory]);

  useEffect(() => {
    fetchUserStatus();
  }, [fetchUserStatus]);

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
      
      if (result.limitReached) {
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

        <StatusBar 
          remaining={remaining} 
          isPremium={isPremium} 
          isLoggedIn={isLoggedIn}
          isDevMode={false} // DevModeトグルは外すか固定
          onUpgradeClick={() => window.location.href = '/checkout'} 
          onManagePlanClick={() => setShowManagePlanModal(true)}
          onLogoutClick={handleLogout}
          onLoginClick={() => {}}
          onOpenShareModal={() => setShowShareModal(true)}
        />

        <div className="glow-line mb-8" />

        {/* Auth Check */}
        {!isAuthLoading && !isLoggedIn && (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-700 mb-4">ご利用にはログインが必要です</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              FleaScriptは無料で始められる在庫管理手帳です。大切なデータを保存するため、アカウント登録（無料）をお願いします。
            </p>
          </div>
        )}

        {/* Dashboard Content */}
        {!isAuthLoading && isLoggedIn && (
          <div className="flex flex-col gap-6">
            <SummaryCard items={items} remaining={remaining} isPremium={isPremium} />
            
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in-up">
                {error}
              </div>
            )}

            <InventoryForm 
              onAdd={handleAdd} 
              isLoading={isLoading} 
              disabled={remaining === 0} 
            />
            
            <InventoryList 
              items={items}
              onUpdateStatus={handleUpdateStatus}
              onUpdateDescription={handleUpdateDescription}
              onDelete={handleDelete}
            />
          </div>
        )}

        <div className="flex-1" />

        {/* Legal Links */}
        <div className="mt-12 mb-4 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <Link href="/legal/terms" className="hover:text-gray-600 hover:underline">利用規約</Link>
          <Link href="/legal/privacy" className="hover:text-gray-600 hover:underline">プライバシーポリシー</Link>
          <Link href="/legal/tokushoho" className="hover:text-gray-600 hover:underline">特定商取引法に基づく表記</Link>
        </div>
      </main>

      <AuthModal 
        isOpen={!isAuthLoading && !isLoggedIn} 
        onClose={() => {}} // 閉じられないようにする
      />

      <LimitModal 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)} 
        onOpenShareModal={() => setShowShareModal(true)}
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
      />
    </>
  )
}
