'use client'

import { useState } from 'react'
import { seoCategories } from '@/data/seoCategories'
import Link from 'next/link'

export default function FooterFeedback() {
  const [complaint, setComplaint] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!complaint.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feedback: 'comment', 
          reason: '(匿名意見)', 
          complaint 
        }),
      })

      if (res.ok) {
        setIsSuccess(true)
        setComplaint('')
        setTimeout(() => setIsSuccess(false), 5000)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="mt-12 text-center text-[var(--color-text-muted)] text-sm space-y-8">
      {/* Template Links for SEO */}
      <div className="pt-8 border-t border-[var(--color-border)]">
        <p className="font-bold mb-4 text-gray-500">人気のカテゴリ別 テンプレート</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
          {Object.values(seoCategories).map((cat) => (
            <Link 
              key={cat.id} 
              href={`/template/${cat.id}`}
              className="text-xs text-[var(--color-brand)] hover:underline bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm transition-colors hover:bg-orange-50"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Anonymous Feedback Form */}
      <div className="bg-[var(--color-bg-elevated)] p-6 rounded-2xl border border-[var(--color-border)] max-w-md mx-auto">
        <h3 className="font-bold text-[var(--color-text-primary)] mb-2">開発者への匿名意見箱 📮</h3>
        <p className="text-xs mb-4">「ここが使いにくい」「こんな機能が欲しい」など、何でもお気軽にどうぞ！</p>
        
        {isSuccess ? (
          <div className="text-[var(--color-brand)] font-bold animate-fade-in-up py-2">
            送信完了しました。ありがとうございます！
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="1行で自由に書く"
              className="flex-1 bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50"
              maxLength={100}
            />
            <button
              type="submit"
              disabled={!complaint.trim() || isSubmitting}
              className="bg-[var(--color-text-secondary)] hover:bg-[var(--color-text-primary)] text-[var(--color-bg-base)] px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              送る
            </button>
          </form>
        )}
      </div>

      <p className="pb-8">&copy; 2026 FleaScript. All rights reserved.</p>
    </footer>
  )
}
