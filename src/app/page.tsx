'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import InputArea from '@/components/InputArea'
import GenerateButton from '@/components/GenerateButton'
import OutputArea from '@/components/OutputArea'
import FeedbackPanel from '@/components/FeedbackPanel'
import FooterFeedback from '@/components/FooterFeedback'
import StatusBar from '@/components/StatusBar'
import AdCard from '@/components/AdCard'
import LimitModal from '@/components/LimitModal'
import CustomShareModal from '@/components/CustomShareModal'
import PlatformSelector from '@/components/PlatformSelector'
import ManagePlanModal from '@/components/ManagePlanModal'
import AuthModal from '@/components/AuthModal'
import { useDeviceId } from '@/hooks/useDeviceId'
import { PlatformType } from '@/lib/openai'
import { seoCategories } from '@/data/seoCategories'

export default function Home() {
  const deviceId = useDeviceId()
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [pageLoadId] = useState(() => Date.now().toString() + Math.random().toString().slice(2, 6))
  const [logId, setLogId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [platform, setPlatform] = useState<PlatformType>('mercari')
  
  // State for rate limit & premium status
  const [remaining, setRemaining] = useState<number | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDevMode, setIsDevMode] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [showUpgradeToast, setShowUpgradeToast] = useState(false)
  const [showManagePlanModal, setShowManagePlanModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // Client-side initialization of dev mode & status
  useEffect(() => {
    setIsDevMode(document.cookie.includes('FLEA_DEV_MODE=1'))
    
    const params = new URLSearchParams(window.location.search)
    
    // upgraded=trueの検知
    if (params.get('upgraded') === 'true') {
      setShowUpgradeToast(true)
      window.history.replaceState({}, document.title, window.location.pathname)
      setTimeout(() => setShowUpgradeToast(false), 5000)
    }

    // templateパラメータの検知
    const templateId = params.get('template')
    if (templateId && seoCategories[templateId]) {
      setInputText(seoCategories[templateId].exampleInput)
      // URLをクリーンにする（任意）
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const fetchUserStatus = useCallback(() => {
    if (deviceId) {
      fetch(`/api/user-status?deviceId=${deviceId}&pageLoadId=${pageLoadId}`)
        .then(res => res.json())
        .then(data => {
          if (data.remaining !== undefined) setRemaining(data.remaining)
          if (data.isPremium !== undefined) setIsPremium(data.isPremium)
          if (data.isLoggedIn !== undefined) setIsLoggedIn(data.isLoggedIn)
        })
        .catch(console.error)
    }
  }, [deviceId])

  useEffect(() => {
    fetchUserStatus()
  }, [fetchUserStatus])

  const handleCanceled = () => {
    setShowManagePlanModal(false)
    fetchUserStatus()
  }

  const maxLength = isDevMode || isPremium ? 1500 : 300

  const handleGenerate = async () => {
    if (!inputText.trim() || inputText.length > maxLength || isLoading) return
    setIsLoading(true)
    setError(null)
    setOutputText('')
    setLogId(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText, deviceId, platform, pageLoadId }),
      })
      const data = await res.json()

      if (data.remaining !== undefined) setRemaining(data.remaining)
      if (data.isPremium !== undefined) setIsPremium(data.isPremium)

      if (data.limitReached) {
        setShowLimitModal(true)
        setIsLoading(false)
        return
      }

      if (!res.ok) {
        setError(data.error ?? '予期せぬエラーが発生しました。')
        return
      }

      setOutputText(data.outputText)
      setLogId(data.logId)
    } catch {
      setError('ネットワークエラーが発生しました。接続を確認して再試行してください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgradeClick = () => {
    window.location.href = '/checkout'
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <>
      {showUpgradeToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-fade-in-up flex items-center gap-2">
          🎉 プレミアムプランへのアップグレードが完了しました！
        </div>
      )}
      <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-6 text-center relative mt-4">
          <div className="inline-block relative">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-brand)] mb-3">
              ✨ フリマ出品ジェネレーター
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base font-medium">
            商品の状態をメモするだけ！AIが売れる文章を自動で作ります🪄
          </p>
        </header>

        <StatusBar 
          remaining={remaining} 
          isPremium={isPremium} 
          isLoggedIn={isLoggedIn}
          isDevMode={isDevMode}
          onUpgradeClick={handleUpgradeClick} 
          onManagePlanClick={() => setShowManagePlanModal(true)}
          onLogoutClick={handleLogout}
          onLoginClick={() => setShowAuthModal(true)}
          onOpenShareModal={() => setShowShareModal(true)}
        />

        <div className="glow-line mb-8" />

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          <PlatformSelector 
            platform={platform} 
            onChange={setPlatform} 
            disabled={isLoading || remaining === 0} 
          />

          <InputArea 
            value={inputText} 
            onChange={setInputText} 
            disabled={isLoading || remaining === 0} 
            maxLength={maxLength}
          />
          
          <GenerateButton 
            onClick={handleGenerate} 
            isLoading={isLoading} 
            disabled={!inputText.trim() || inputText.length > maxLength || remaining === 0} 
          />

          {!isPremium && <AdCard logId={logId} />}

          {error && (
            <div className="p-4 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm animate-fade-in-up">
              {error}
            </div>
          )}

          {outputText && (
            <div className="flex flex-col gap-4">
              <OutputArea text={outputText} />
              {logId && <FeedbackPanel logId={logId} />}
            </div>
          )}
        </div>

        <div className="flex-1" /> {/* Spacer */}

        {/* SEO Categories Footer Links for Crawlers & Users */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 mb-4 text-center">人気の出品テンプレート</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(seoCategories).map((cat) => (
              <a 
                key={cat.id} 
                href={`/template/${cat.id}`}
                className="text-xs text-gray-500 hover:text-[var(--color-brand)] bg-gray-50 hover:bg-[var(--color-brand)]/5 px-3 py-1.5 rounded-full transition-colors"
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <FooterFeedback />

        {/* Legal Links */}
        <div className="mt-8 mb-4 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <Link href="/legal/terms" className="hover:text-gray-600 hover:underline">利用規約</Link>
          <Link href="/legal/privacy" className="hover:text-gray-600 hover:underline">プライバシーポリシー</Link>
          <Link href="/legal/tokushoho" className="hover:text-gray-600 hover:underline">特定商取引法に基づく表記</Link>
        </div>
      </main>

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
        deviceId={deviceId}
        onCanceled={handleCanceled}
      />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          setShowAuthModal(false)
          fetchUserStatus() // ログイン完了時にステータスを更新
        }} 
      />
    </>
  )
}
