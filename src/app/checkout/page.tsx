'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDeviceId } from '@/hooks/useDeviceId'
import { createClient } from '@/lib/supabase/client'
import AuthModal from '@/components/AuthModal'

export default function CheckoutPage() {
  const router = useRouter()
  const deviceId = useDeviceId()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setShowAuthModal(true)
        setIsCheckingAuth(false)
        return
      }

      // Premium契約済みであればトップページへ強制リダイレクト
      try {
        const url = deviceId ? `/api/user-status?deviceId=${deviceId}` : '/api/user-status'
        const res = await fetch(url)
        const data = await res.json()
        if (data.isPremium) {
          router.replace('/')
          return
        }
      } catch (err) {
        console.error('Failed to check premium status:', err)
      }

      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [supabase, deviceId, router])

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/checkout-success-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }), // The server will also check cookies for user auth
      })

      if (res.ok) {
        router.push('/?upgraded=true')
      } else {
        alert("決済エラー（モック）が発生しました。")
        setIsLoading(false)
      }
    } catch (err) {
      alert("通信エラーが発生しました。")
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          // ログインせずに閉じた場合はトップに戻す
          setShowAuthModal(false)
          router.push('/')
        }} 
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          ✨ FleaScript Premium
        </h2>
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 font-bold text-sm mb-4 border border-amber-200">
          月額 <span className="text-xl mx-1">¥300</span> (税込)
        </div>
        <p className="text-sm text-gray-500 font-medium">
          いつでも1クリックで解約可能。違約金等はありません。
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-2xl border border-gray-100">
          
          {/* Trust Badges */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-xl">🔒</span>
              <p className="text-sm text-blue-900 font-bold">
                Stripeによる最高クラスの安全な決済
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xl">📱</span>
              <p className="text-sm text-gray-700 font-bold">
                カード番号の入力不要！1タップで完了
              </p>
            </div>
          </div>

          <div className="mb-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
            <p className="font-bold text-orange-800 mb-3 text-center">🎁 プレミアムの特典</p>
            <ul className="text-sm text-orange-900 space-y-2">
              <li className="flex items-center gap-2"><span>✅</span> 1日の作成回数が<span className="font-bold">50回</span>に拡張</li>
              <li className="flex items-center gap-2"><span>✅</span> 入力文字数が<span className="font-bold">1500文字</span>に拡張</li>
              <li className="flex items-center gap-2"><span>✅</span> すべての広告を非表示</li>
              <li className="flex items-center gap-2"><span>✅</span> 生成文末尾のバイラルクレジットを削除</li>
            </ul>
          </div>

          <div className="space-y-4">
            {/* Apple Pay / Google Pay Button (Mock) */}
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl shadow-md text-base font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  処理中...
                </span>
              ) : (
                <>
                  <span className="font-semibold">Apple Pay</span> / <span className="font-semibold">Google Pay</span> で支払う（Mock）
                </>
              )}
            </button>

            {/* Credit Card Button (Mock) */}
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
            >
              クレジットカードで支払う（Mock）
            </button>
            
            <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
              ※本番環境では、このボタンを押すとStripeの安全な決済画面へ移動します。<br/>現在はデモ環境のため、クリックすると即座に決済成功となります。
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors px-4 py-2 rounded-full hover:bg-gray-100"
          >
            ← トップページへ戻る
          </button>
        </div>
      </div>
    </div>
  )
}
