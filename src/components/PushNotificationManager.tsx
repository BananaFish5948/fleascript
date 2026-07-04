'use client'

import { useState, useEffect } from 'react'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      if (!sub) {
        setShowPrompt(true)
      }
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      setSubscription(sub)
      setShowPrompt(false)
      // TODO: Send subscription to server
    } catch (error) {
      console.error('Subscription failed:', error)
    }
  }

  // VAPIDキー変換ユーティリティ
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/\\-/g, '+')
      .replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  if (!isSupported || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-card z-50 animate-fade-in-up">
      <div className="flex flex-col space-y-3">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
          🔔 重要なお知らせを受け取る
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)]">
          取引のステータスや価格調律の完了をプッシュ通知でお知らせします。Appleの「メールを非公開」をご利用の方には特に設定をおすすめします。
        </p>
        <div className="flex space-x-2">
          <button
            onClick={subscribeToPush}
            className="flex-1 py-2 text-xs font-bold bg-[var(--color-brand)] text-white rounded-full hover:brightness-110 transition-all"
          >
            通知を許可する
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="px-4 py-2 text-xs font-medium bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] rounded-full hover:bg-[var(--color-border)] transition-all"
          >
            あとで
          </button>
        </div>
      </div>
    </div>
  )
}
