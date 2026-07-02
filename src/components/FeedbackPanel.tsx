'use client'

import { useState } from 'react'

interface FeedbackPanelProps {
  logId: string
  onFeedbackSent?: () => void
}

export default function FeedbackPanel({ logId, onFeedbackSent }: FeedbackPanelProps) {
  const [status, setStatus] = useState<'idle' | 'thumbsDown' | 'sent'>('idle')
  const [isSending, setIsSending] = useState(false)

  const sendFeedback = async (feedback: 'positive' | 'negative', reason?: string) => {
    setIsSending(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, feedback, reason }),
      })
    } catch (error) {
      console.error('[FeedbackPanel] Error:', error)
    } finally {
      setIsSending(false)
      setStatus('sent')
      if (onFeedbackSent) onFeedbackSent()
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center p-4 animate-fade-in-up text-[var(--color-brand)] font-medium">
        ありがとうございます！😊
      </div>
    )
  }

  if (status === 'thumbsDown') {
    return (
      <div className="card p-4 animate-fade-in-up text-center border-[var(--color-danger)]/30">
        <p className="text-sm text-[var(--color-text-secondary)] mb-3">どの部分が不自然でしたか？</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['文体', 'スペック', 'ハッシュタグ', 'その他'].map((reason) => (
            <button
              key={reason}
              disabled={isSending}
              onClick={() => sendFeedback('negative', reason)}
              className="px-3 py-1.5 rounded-full text-xs border border-[var(--color-border)] hover:border-[var(--color-brand)] text-[var(--color-text-primary)] hover:bg-[var(--color-brand-dim)] transition-colors disabled:opacity-50"
            >
              {reason}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 animate-fade-in-up mt-2">
      <p className="text-sm text-[var(--color-text-secondary)]">この文章はどうでしたか？</p>
      <div className="flex items-center gap-4">
        <button
          disabled={isSending}
          onClick={() => sendFeedback('positive')}
          className="p-3 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-dim)] transition-colors text-xl disabled:opacity-50"
          title="良かった"
        >
          👍
        </button>
        <button
          disabled={isSending}
          onClick={() => setStatus('thumbsDown')}
          className="p-3 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors text-xl disabled:opacity-50"
          title="いまいち"
        >
          👎
        </button>
      </div>
    </div>
  )
}
