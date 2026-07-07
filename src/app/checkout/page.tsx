'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthModal from '@/components/AuthModal'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get('plan') === 'standard' ? 'standard' : 'premium'
  const [targetPlan, setTargetPlan] = useState<'standard' | 'premium'>(initialPlan)
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    const isLocal = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    setIsDev(isLocal)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setShowAuthModal(true)
        setIsCheckingAuth(false)
        return
      }

      // 既に指定のプランかどうかをチェック
      try {
        const res = await fetch('/api/user-status')
        const data = await res.json()
        if (data.subscriptionStatus === targetPlan) {
          router.replace('/')
          return
        }
      } catch (err) {
        console.error('Failed to check premium status:', err)
      }

      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [supabase, router, targetPlan])

  const handleCheckout = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPlan }),
      })

      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setErrorMessage(data.error || "決済処理に失敗しました。")
        setIsLoading(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "通信エラーが発生しました。")
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          // ログインせずに閉じた場合はトップに戻す
          setShowAuthModal(false)
          router.push('/')
        }} 
      />

      <div className="flex justify-center mb-6">
        <div className="bg-gray-200/80 p-1.5 rounded-full flex gap-1 shadow-inner">
          <button 
            onClick={() => setTargetPlan('standard')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${targetPlan === 'standard' ? 'bg-white shadow-sm text-gray-900 scale-105' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Standard
          </button>
          <button 
            onClick={() => setTargetPlan('premium')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${targetPlan === 'premium' ? 'bg-white shadow-sm text-amber-600 scale-105' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Premium ✨
          </button>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          {targetPlan === 'premium' ? '✨ FleaScript Premium' : '⭐ FleaScript Standard'}
        </h2>
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 font-bold text-sm mb-4 border border-amber-200">
          月額 <span className="text-xl mx-1">{targetPlan === 'premium' ? '¥1,000' : '¥500'}</span> (税込)
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
            <p className="font-bold text-orange-800 mb-3 text-center">🎁 {targetPlan === 'premium' ? 'プレミアムの特典' : 'スタンダードの特典'}</p>
            <ul className="text-sm text-orange-900 space-y-2">
              <li className="flex items-center gap-2"><span>✅</span> 1日の作成回数が<span className="font-bold">{targetPlan === 'premium' ? '50回' : '15回'}</span>に拡張</li>
              <li className="flex items-center gap-2"><span>✅</span> 登録できる在庫枠が<span className="font-bold">{targetPlan === 'premium' ? '500件' : '100件'}</span>に拡張</li>
              <li className="flex items-center gap-2"><span>✅</span> 入力文字数が<span className="font-bold">1500文字</span>に拡張</li>
              {targetPlan === 'premium' && (
                <>
                  <li className="flex items-center gap-2"><span>✅</span> すべての広告を非表示</li>
                  <li className="flex items-center gap-2"><span>✅</span> 簡易利益分析レポート機能の解放</li>
                </>
              )}
              <li className="flex items-center gap-2"><span>✅</span> 生成文末尾のバイラルクレジットを削除</li>
            </ul>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-left">
              <h3 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span> {errorMessage}
              </h3>
              <p className="text-sm text-red-700 mb-3 leading-relaxed">
                ご不便をおかけして申し訳ありません。<br />
                決済システム（Stripe）の仕様上、お客様の資金は安全に保護されており、「お金だけ引き落とされて利用できない」という事態は発生しませんのでご安心ください。
              </p>
              <p className="text-sm text-red-700 font-bold mb-3 leading-relaxed">
                万が一、決済が完了しているのにプレミアムが有効にならない場合は、お手数ですが以下のフォームよりご連絡ください。迅速に100%安全な返金またはプランの有効化をいたします。
              </p>
              <a 
                href="https://forms.gle/5A4UobMkRcBf7uPW9" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-red-100 text-red-800 font-bold hover:bg-red-200 transition-colors text-sm border border-red-300 shadow-sm"
              >
                📩 決済に関するお問い合わせはこちら
              </a>
            </div>
          )}

          <div className="space-y-4">
            {isDev ? (
              <>
                {/* 開発環境（Local Mock用）: Apple Pay風ボタンとクレジットカード風フォーム */}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl shadow-md text-base font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? '処理中...' : 'Apple Pay / Google Pay で支払う（Mock）'}
                </button>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">💳 クレジットカードで支払う（モック）</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">カード番号</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" disabled />
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="w-full mt-4 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md animate-pulse-glow"
                    >
                      {isLoading ? '処理中...' : '決済する（Mock）'}
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                  ※現在はデモ環境のため、クリックすると即座に決済成功となります。
                </p>
              </>
            ) : (
              /* 本番環境用: Stripe Checkoutリダイレクトボタン */
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
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
                    <span>💳 クレジットカード / Google Pay / Apple Pay で支払う</span>
                  )}
                </button>
                <p className="text-center text-xs text-gray-500 leading-relaxed">
                  ※Stripe経由での安全な決済となります。<br />
                  各種クレジットカード、Google Pay、Apple Pay に対応しています。
                </p>
              </div>
            )}
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7fafc] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
