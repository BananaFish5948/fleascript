'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Heart, MessageCircle, Repeat2, Bookmark, Share, ArrowLeft, ArrowRight } from 'lucide-react'

export default function XCarouselMock() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const slidesCount = 4

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slidesCount)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slidesCount) % slidesCount)
  }, [])

  // 自動スライド
  useEffect(() => {
    if (!isAutoPlay) return
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlay, nextSlide])

  // 手動操作されたら自動スライドを一時停止
  const handleManualChange = (direction: 'next' | 'prev') => {
    setIsAutoPlay(false)
    if (direction === 'next') nextSlide()
    else prevSlide()
  }

  // 1枚目：ドット矢印SVG
  const DotArrowIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--color-brand)] animate-fade-in-out">
      <circle cx="8" cy="6" r="1" fill="currentColor" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
      <circle cx="8" cy="18" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="0.8" fill="currentColor" opacity="0.5" />
    </svg>
  )

  return (
    <div className="w-full max-w-2xl mx-auto my-12 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-4 md:p-6 shadow-sm selection:bg-[var(--color-brand-dim)] text-left">
      {/* Xポストヘッダー */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[var(--color-brand-dim)] border border-[var(--color-brand)]/10 flex items-center justify-center text-[var(--color-brand)] font-bold shrink-0">
          FS
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[var(--color-text-primary)] text-sm md:text-base">FleaScript 公式</span>
            <span className="text-xs text-[var(--color-text-secondary)]">@FleaScript_app</span>
            <span className="text-xs text-[var(--color-text-muted)]">· 1時間</span>
          </div>
          <p className="text-xs md:text-sm text-[var(--color-text-primary)] mt-1.5 leading-relaxed">
            暮らしを整え、フリマを調律する。<br />
            「忙しさに奪われた時間」を、1タップで余白の体験へとコンパイルする物語。
          </p>
        </div>
      </div>

      {/* カルーセルコンテナー */}
      <div className="relative w-full aspect-square md:aspect-[4/3] rounded-xl overflow-hidden border border-black/5 dark:border-white/5 bg-[var(--color-bg-base)] transition-colors duration-300">
        
        {/* スライドラッパー */}
        <div 
          className="w-full h-full flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* 1枚目: ファーストビュー */}
          <div className="w-full h-full shrink-0 flex flex-col justify-between p-6 md:p-8 relative">
            <div className="absolute inset-0 border-[1px] border-black/10 dark:border-white/10 pointer-events-none rounded-xl"></div>
            <div className="mt-8 md:mt-12 text-left">
              <span className="text-[var(--color-brand)] text-xs md:text-sm font-semibold tracking-widest block mb-4 uppercase">
                // System Tuning
              </span>
              <h2 className="text-2xl md:text-4xl font-extralight text-[var(--color-text-primary)] tracking-wide leading-snug md:leading-normal">
                あなたの暮らしは、<br />
                あと何時間調律できる？
              </h2>
            </div>
            
            {/* 中央右の明滅ドット矢印 */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <DotArrowIcon />
            </div>

            <div className="flex justify-between items-center mt-auto">
              <span className="text-xs font-mono text-[var(--color-text-secondary)] tracking-widest">
                FleaScript
              </span>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                1 / 4
              </span>
            </div>
          </div>

          {/* 2枚目: 損失の可視化 */}
          <div className="w-full h-full shrink-0 flex flex-col justify-between p-6 md:p-8 relative">
            <div className="absolute inset-0 border-[1px] border-black/10 dark:border-white/10 pointer-events-none rounded-xl"></div>
            <div>
              <span className="text-[var(--color-danger)] text-xs md:text-sm font-semibold tracking-widest block mb-2 uppercase">
                // Opportunities Lost
              </span>
              <h3 className="text-lg md:text-xl font-medium text-[var(--color-text-primary)]">
                「価格設定の迷子」による月間機会損失
              </h3>
            </div>

            {/* 精密なグリッドグラフ (SVG) */}
            <div className="w-full flex-1 flex flex-col justify-center my-4">
              <svg className="w-full h-32 md:h-40 overflow-visible" viewBox="0 0 400 120">
                {/* グリッド背景線 */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="400" y2="110" stroke="var(--color-border)" strokeWidth="0.5" />
                
                {/* グラフ縦線（週） */}
                <line x1="80" y1="0" x2="80" y2="110" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="1 3" />
                <line x1="160" y1="0" x2="160" y2="110" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="1 3" />
                <line x1="240" y1="0" x2="240" y2="110" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="1 3" />
                <line x1="320" y1="0" x2="320" y2="110" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="1 3" />

                {/* 損失折れ線（赤系グラデーション） */}
                <path 
                  d="M 20 90 L 80 85 L 160 55 L 240 45 L 320 25 L 380 15" 
                  fill="none" 
                  stroke="var(--color-danger)" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />

                {/* 各プロットドット */}
                <circle cx="20" cy="90" r="3" fill="var(--color-danger)" />
                <circle cx="80" cy="85" r="3" fill="var(--color-danger)" />
                <circle cx="160" cy="55" r="3" fill="var(--color-danger)" />
                <circle cx="240" cy="45" r="3" fill="var(--color-danger)" />
                <circle cx="320" cy="25" r="3" fill="var(--color-danger)" />
                <circle cx="380" cy="15" r="4" fill="var(--color-danger)" className="animate-ping" style={{ transformOrigin: '380px 15px' }} />
                <circle cx="380" cy="15" r="4" fill="var(--color-danger)" />

                {/* グラフテキストラベル */}
                <text x="20" y="118" fill="var(--color-text-secondary)" fontSize="7" fontFamily="monospace">Week 1</text>
                <text x="160" y="118" fill="var(--color-text-secondary)" fontSize="7" fontFamily="monospace">Week 3</text>
                <text x="320" y="118" fill="var(--color-text-secondary)" fontSize="7" fontFamily="monospace">Week 5</text>
                
                <text x="330" y="10" fill="var(--color-danger)" fontSize="8" fontWeight="bold">損失スタミナ: Max</text>
              </svg>
              <p className="text-[10px] md:text-xs text-[var(--color-text-secondary)] text-center mt-2 leading-relaxed">
                商品説明作成や配送手段の調査に費やす時間は、1ヶ月で平均 <span className="font-semibold text-[var(--color-danger)]">約5時間以上</span> の余剰スタミナを浪費します。
              </p>
            </div>

            <div className="flex justify-between items-center mt-auto">
              <span className="text-xs font-mono text-[var(--color-text-secondary)] tracking-widest">
                Opportunity Cost
              </span>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                2 / 4
              </span>
            </div>
          </div>

          {/* 3枚目: 解決策のドロップ */}
          <div className="w-full h-full shrink-0 flex flex-col justify-between p-6 md:p-8 relative">
            <div className="absolute inset-0 border-[1px] border-black/10 dark:border-white/10 pointer-events-none rounded-xl"></div>
            <div>
              <span className="text-[var(--color-success)] text-xs md:text-sm font-semibold tracking-widest block mb-2 uppercase">
                // The Compilation
              </span>
              <h3 className="text-lg md:text-xl font-medium text-[var(--color-text-primary)]">
                ワンタップ調律：15分から1秒の圧縮
              </h3>
            </div>

            {/* 比較＆価値置換グラフィックス */}
            <div className="w-full flex-1 flex flex-col justify-center my-4">
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full items-center">
                <div className="bg-[var(--color-bg-surface)] p-3 rounded-lg border border-[var(--color-border)] text-center">
                  <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-secondary)] block">Manual Time</span>
                  <span className="text-2xl font-extralight text-[var(--color-text-secondary)] line-through block mt-1">15 min</span>
                  <span className="text-[9px] text-[var(--color-text-muted)] block mt-1">悩む・調べる・書く</span>
                </div>
                <div className="bg-[var(--color-success-bg)] p-3 rounded-lg border border-[var(--color-success)]/20 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[var(--color-success)] text-white text-[7px] px-1.5 py-0.5 rounded-bl">Active</div>
                  <span className="text-[9px] uppercase tracking-widest text-[var(--color-success)] block font-semibold">FleaScript</span>
                  <span className="text-2xl font-bold text-[var(--color-success)] block mt-1">1 sec</span>
                  <span className="text-[9px] text-[var(--color-success)] block mt-1">自動最適化＆調律</span>
                </div>
              </div>
              <p className="text-[10px] md:text-xs text-[var(--color-text-secondary)] text-center mt-4 max-w-sm mx-auto leading-relaxed">
                無駄なエネルギーを1秒でコンパイル。回収したスタミナを「お気に入りの本を読む」「淹れたての珈琲を味わう」といった自分だけの豊かさへ。
              </p>
            </div>

            <div className="flex justify-between items-center mt-auto">
              <span className="text-xs font-mono text-[var(--color-text-secondary)] tracking-widest">
                Optimized Life
              </span>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                3 / 4
              </span>
            </div>
          </div>

          {/* 4枚目: コンバージョン */}
          <div className="w-full h-full shrink-0 flex flex-col justify-between p-6 md:p-8 relative">
            <div className="absolute inset-0 border-[1px] border-black/10 dark:border-white/10 pointer-events-none rounded-xl"></div>
            
            <div className="flex flex-col items-center justify-center flex-1 text-center my-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand)] flex items-center justify-center text-white text-3xl font-extrabold shadow-sm mb-4">
                FS
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-wide">
                FleaScript
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 tracking-widest uppercase">
                フリマ商品説明ジェネレーター
              </p>
              
              <div className="mt-6 px-6 py-2 border border-[var(--color-brand)]/20 bg-[var(--color-brand-dim)] rounded-full text-xs font-semibold text-[var(--color-brand)] tracking-widest">
                事前登録受付中
              </div>

              <p className="text-[10px] md:text-xs text-[var(--color-text-secondary)] mt-4 max-w-xs leading-relaxed">
                プロフィールの固定リンクから、最優先で余白を手に入れましょう。
              </p>
            </div>

            <div className="flex justify-between items-center mt-auto">
              <span className="text-xs font-mono text-[var(--color-text-secondary)] tracking-widest">
                Get Started
              </span>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                4 / 4
              </span>
            </div>
          </div>
        </div>

        {/* 左右ナビゲーション矢印 */}
        <button 
          onClick={() => handleManualChange('prev')}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-sm border border-black/5 dark:border-white/5 flex items-center justify-center text-[var(--color-text-primary)] hover:bg-white dark:hover:bg-black/60 transition-all cursor-pointer z-20 shadow-sm"
          aria-label="前へ"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleManualChange('next')}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-sm border border-black/5 dark:border-white/5 flex items-center justify-center text-[var(--color-text-primary)] hover:bg-white dark:hover:bg-black/60 transition-all cursor-pointer z-20 shadow-sm"
          aria-label="次へ"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* ドットインジケーター（画像内下部） */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {Array.from({ length: slidesCount }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlay(false)
                setCurrentSlide(idx)
              }}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx 
                  ? 'w-4 bg-[var(--color-brand)]' 
                  : 'w-1 bg-[var(--color-text-muted)] opacity-50'
              }`}
              aria-label={`スライド ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Xポストフッター（アクションバー） */}
      <div className="flex items-center justify-between mt-4 px-1 text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-3 text-xs md:text-sm">
        <button className="flex items-center gap-1 hover:text-[var(--color-brand)] transition-colors cursor-pointer">
          <MessageCircle className="w-4 h-4 md:w-4.5 md:h-4.5" />
          <span>12</span>
        </button>
        <button className="flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors cursor-pointer">
          <Repeat2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
          <span>34</span>
        </button>
        <button className="flex items-center gap-1 hover:text-[var(--color-danger)] transition-colors cursor-pointer">
          <Heart className="w-4 h-4 md:w-4.5 md:h-4.5" />
          <span>89</span>
        </button>
        <button className="flex items-center gap-1 hover:text-[var(--color-brand)] transition-colors cursor-pointer">
          <Bookmark className="w-4 h-4 md:w-4.5 md:h-4.5" />
          <span>45</span>
        </button>
        <button className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">
          <Share className="w-4 h-4 md:w-4.5 md:h-4.5" />
        </button>
      </div>
    </div>
  )
}
