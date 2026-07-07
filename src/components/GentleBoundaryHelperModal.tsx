'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Upload, AlertTriangle, Clipboard, Check, Sparkles, Smile, ShieldAlert, FileText, ArrowRight, CornerDownLeft } from 'lucide-react'

interface GentleBoundaryHelperModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptionStatus: string
}

type Step = 'upload' | 'scanning' | 'edit_text' | 'analyzing' | 'result'

interface AnalysisResult {
  fact: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  reason: string
  suggestedResponse: string
}

const statusMessages = [
  'やり取りの雰囲気をそっと読み取っています...',
  '対話の言葉を優しく集めています...',
  '背景にある不要なノイズをクリアにしています...',
  '穏やかに境界線を保つお返事を考えています...'
]

export default function GentleBoundaryHelperModal({ isOpen, onClose, subscriptionStatus }: GentleBoundaryHelperModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [scannedText, setScannedText] = useState('')
  const [statusIdx, setStatusIdx] = useState(0)
  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // スキャン中のメッセージローテーション
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (step === 'scanning') {
      interval = setInterval(() => {
        setStatusIdx((prev) => (prev + 1) % statusMessages.length)
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [step])

  // クローズ時にステートをリセットする
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('upload')
        setImage(null)
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
        setScannedText('')
        setAnalysisResult(null)
        setError(null)
        setCopySuccess(false)
        setStatusIdx(0)
      }, 300)
    }
  }, [isOpen])

  if (!isOpen) return null

  // ドラッグ＆ドロップ処理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        processFile(file)
      } else {
        setError('画像ファイルのみアップロード可能です。')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    setImage(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setError(null)
    startOcr(file)
  }

  // クライアントサイドOCR (Tesseract.js遅延ロード)
  const startOcr = async (file: File) => {
    setStep('scanning')
    setIsOcrLoading(true)
    try {
      // tesseract.js を動的インポート
      const Tesseract = await import('tesseract.js')
      
      const worker = await Tesseract.createWorker('jpn+eng')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      if (text && text.trim()) {
        setScannedText(text)
      } else {
        setScannedText('')
        setError('文字をうまく認識できませんでした。テキストを直接編集または入力してください。')
      }
      setStep('edit_text')
    } catch (err: any) {
      console.error('OCR Error:', err)
      setScannedText('')
      setError('画像から文字を読み取れませんでした。やり取りの内容を直接入力してください。')
      setStep('edit_text')
    } finally {
      setIsOcrLoading(false)
    }
  }

  // テキスト直接入力モードへのジャンプ
  const handleSkipOcr = () => {
    setScannedText('')
    setImage(null)
    setImagePreview(null)
    setStep('edit_text')
  }

  // AI解析リクエスト
  const handleAnalyze = async () => {
    if (!scannedText.trim()) {
      setError('解析するやり取りのテキストを入力してください。')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scannedText }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || '解析に失敗しました。')
      }

      setAnalysisResult(data.analysis)
      if (data.remaining !== undefined) {
        setRemaining(data.remaining)
      }
      setStep('result')
    } catch (err: any) {
      console.error('BNC Analysis Error:', err)
      setError(err.message || '通信エラーが発生しました。再度お試しください。')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // コピペ
  const handleCopyToClipboard = () => {
    if (analysisResult?.suggestedResponse) {
      navigator.clipboard.writeText(analysisResult.suggestedResponse)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      {/* アニメーション用Style埋め込み */}
      <style>{`
        @keyframes bncScan {
          0% { top: 0%; opacity: 0.2; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.2; }
        }
        .animate-bnc-scan {
          animation: bncScan 4s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* モーダルヘッダー */}
        <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--color-success-bg)] rounded-xl text-[var(--color-accent)]">
              <Smile size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-text-primary)] tracking-wider">穏やかな対話境界線ヘルパー</h2>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">購入者とのやり取りスクショから摩擦リスクを判定し、穏やかに対応します</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* コンテンツ本体 */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-[var(--color-danger-bg)] border border-[var(--color-danger)] text-[var(--color-danger)] text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* STEP 1: 画像アップロード */}
          {step === 'upload' && (
            <div className="space-y-5">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  dragActive 
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-dim)] scale-[0.99]' 
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-success-bg)]/30'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="p-4 bg-[var(--color-bg-base)] rounded-full text-[var(--color-text-secondary)] mb-4">
                  <Upload size={32} strokeWidth={1.2} />
                </div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">取引コメント・メッセージのスクショを選択</h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-sm">
                  ドラッグ＆ドロップするか、ここをクリックして画像を選択してください。<br />
                  画像はサーバーに送信されず、ローカルで文字認識を行います。
                </p>
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={handleSkipOcr}
                  className="text-xs text-[var(--color-brand)] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FileText size={14} />
                  画像を使わずに、やり取りのテキストを直接入力する
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: スキャン中 */}
          {step === 'scanning' && (
            <div className="flex flex-col items-center justify-center py-8">
              {imagePreview && (
                <div className="relative max-h-56 max-w-xs rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md mb-6 bg-stone-100 flex items-center justify-center">
                  <img src={imagePreview} alt="Scan preview" className="max-h-56 w-auto object-contain opacity-70 blur-[1px]" />
                  {/* スキャンライン */}
                  <div className="absolute left-0 right-0 h-0.5 bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)] animate-bnc-scan" />
                </div>
              )}
              <div className="text-center space-y-2 max-w-sm">
                <div className="flex justify-center mb-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
                </div>
                <h4 className="text-sm font-bold text-[var(--color-text-primary)] animate-pulse">文字データを解析中...</h4>
                <p className="text-xs text-[var(--color-text-secondary)] min-h-[1.5rem] tracking-wider transition-opacity duration-300">
                  {statusMessages[statusIdx]}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: テキスト修正・直接入力 */}
          {step === 'edit_text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-primary)] tracking-widest mb-2">
                  認識されたやり取りテキスト（必要に応じて編集してください）
                </label>
                <textarea
                  value={scannedText}
                  onChange={(e) => setScannedText(e.target.value)}
                  placeholder="ここに相手からのメッセージや、現在のやり取り内容を入力してください..."
                  className="w-full h-44 p-4 rounded-xl border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] bg-[var(--color-bg-base)]/20 text-sm leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => setStep('upload')}
                  className="px-5 py-2.5 rounded-full border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)]/50 transition-all"
                >
                  前に戻る
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !scannedText.trim()}
                  className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-light)] disabled:opacity-50 text-white font-medium tracking-widest py-2.5 px-6 rounded-full text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin mr-1" />
                      対話を分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      対話の空気を分析する
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: API解析中 */}
          {step === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-14 space-y-4">
              <div className="w-10 h-10 rounded-full border-2 border-[var(--color-brand)] border-t-transparent animate-spin mb-2" />
              <h4 className="text-sm font-bold text-[var(--color-text-primary)]">AIが対話のニュアンスを調律しています</h4>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed text-center max-w-xs">
                メッセージから感情のトーンやトラブルの芽を識別し、穏やかな境界線を設計しています。今しばらくお待ちください。
              </p>
            </div>
          )}

          {/* STEP 5: 結果表示 */}
          {step === 'result' && analysisResult && (
            <div className="space-y-6">
              {/* Fact: 事実要約 */}
              <div className="bg-[var(--color-success-bg)] border border-[var(--color-border)] rounded-2xl p-4.5">
                <h4 className="text-xs font-bold text-[var(--color-success)] tracking-widest mb-1.5 flex items-center gap-1.5">
                  <FileText size={14} /> 客観的な事実の整理
                </h4>
                <p className="text-xs text-[var(--color-text-primary)] leading-relaxed font-normal">
                  {analysisResult.fact}
                </p>
              </div>

              {/* Risk Level: トラブルリスク度 */}
              <div className="border border-[var(--color-border)] bg-[var(--color-bg-base)]/20 rounded-2xl p-4.5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[var(--color-text-primary)] tracking-widest flex items-center gap-1.5">
                    <ShieldAlert size={14} className={
                      analysisResult.riskLevel === 'high' 
                        ? 'text-[var(--color-danger)]' 
                        : analysisResult.riskLevel === 'medium'
                        ? 'text-[var(--color-warning)]'
                        : 'text-[var(--color-accent)]'
                    } /> 
                    摩擦・トラブルリスク判定
                  </h4>
                  
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                    analysisResult.riskLevel === 'high'
                      ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]'
                      : analysisResult.riskLevel === 'medium'
                      ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning)]'
                      : 'bg-[var(--color-success-bg)] text-[var(--color-accent)] border border-[var(--color-accent)]'
                  }`}>
                    {analysisResult.riskLevel === 'high' ? '高リスク' : analysisResult.riskLevel === 'medium' ? '中リスク' : '低リスク'}
                  </span>
                </div>
                
                {/* プログレスバー */}
                <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      analysisResult.riskLevel === 'high'
                        ? 'bg-[var(--color-danger)]'
                        : analysisResult.riskLevel === 'medium'
                        ? 'bg-[var(--color-warning)]'
                        : 'bg-[var(--color-accent)]'
                    }`}
                    style={{ width: `${analysisResult.riskScore}%` }}
                  />
                </div>
                
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {analysisResult.reason}
                </p>
              </div>

              {/* Response: 穏やか防衛文 */}
              <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden bg-[var(--color-bg-surface)] shadow-sm">
                <div className="bg-[var(--color-bg-base)]/40 px-4.5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--color-text-primary)] tracking-widest flex items-center gap-1.5">
                    <Smile size={14} className="text-[var(--color-accent)]" /> 穏やかに境界線を引く返答文
                  </h4>
                  <button
                    onClick={handleCopyToClipboard}
                    className="text-[10px] font-bold tracking-widest text-[var(--color-brand)] hover:text-[var(--color-brand-light)] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copySuccess ? (
                      <>
                        <Check size={12} />
                        コピー完了
                      </>
                    ) : (
                      <>
                        <Clipboard size={12} />
                        コピペする
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4.5 bg-[var(--color-bg-surface)]">
                  <p className="text-xs text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap select-all font-normal">
                    {analysisResult.suggestedResponse}
                  </p>
                </div>
              </div>

              {/* フッターアクション */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => setStep('edit_text')}
                  className="px-5 py-2.5 rounded-full border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)]/50 transition-all flex items-center gap-1"
                >
                  テキストを書き直す
                </button>
                
                <button
                  onClick={onClose}
                  className="bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-medium tracking-widest py-2.5 px-6 rounded-full text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  確認して閉じる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
