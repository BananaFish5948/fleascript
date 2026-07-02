'use client'

import { useState } from 'react'

export default function FooterFeedback() {
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSending) return

    setIsSending(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: 'anonymous',
          feedback: 'comment',
          reason: inputValue.trim(),
        }),
      })
      setInputValue('')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('[FooterFeedback] Error:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="border-t border-[var(--color-border)] mt-12 pt-6 pb-2 text-center text-[var(--color-text-muted)]">
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto flex items-center gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="「こんな機能があったら嬉しい...」など、なんでもどうぞ"
          disabled={isSending || showSuccess}
          className="flex-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isSending || showSuccess}
          className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:bg-[var(--color-brand-dim)] hover:text-[var(--color-brand)] rounded-md px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
        >
          {showSuccess ? '送信しました！' : '送る'}
        </button>
      </form>
      <div className="text-xs">
        &copy; {new Date().getFullYear()} FleaScript. All rights reserved.
      </div>
    </div>
  )
}
