'use client'

import { useState } from 'react'
import InputArea from '@/components/InputArea'
import GenerateButton from '@/components/GenerateButton'
import OutputArea from '@/components/OutputArea'
import FeedbackPanel from '@/components/FeedbackPanel'
import FooterFeedback from '@/components/FooterFeedback'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [logId, setLogId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!inputText.trim() || inputText.length > 500 || isLoading) return
    setIsLoading(true)
    setError(null)
    setOutputText('')
    setLogId(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText }),
      })
      const data = await res.json()

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

  return (
    <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
      {/* Header */}
      <header className="mb-8 text-center relative">
        <div className="inline-block relative">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-accent)] bg-clip-text text-transparent mb-3">
            FleaScript ✨
          </h1>
          <span className="absolute -top-3 -right-12 bg-[var(--color-brand)]/20 text-[var(--color-brand)] text-xs font-bold px-2 py-0.5 rounded border border-[var(--color-brand)]/30">
            ✦ Beta
          </span>
        </div>
        <p className="text-[var(--color-text-secondary)] text-sm md:text-base font-medium">
          「メモを貼るだけで、売れる文章に。」
        </p>
      </header>

      <div className="glow-line mb-8" />

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        <InputArea 
          value={inputText} 
          onChange={setInputText} 
          disabled={isLoading} 
        />
        
        <GenerateButton 
          onClick={handleGenerate} 
          isLoading={isLoading} 
          disabled={!inputText.trim() || inputText.length > 500} 
        />

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

      {/* Footer */}
      <FooterFeedback />
    </main>
  )
}
