'use client'

import { Sparkles, Edit3, ClipboardCopy, ArrowRight } from 'lucide-react'

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-b from-white to-gray-50/50">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-6 leading-tight">
          箇条書きメモが、<br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">3秒で売れる出品文</span>に。
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          フリマ出品の「面倒」をAIでゼロに。メルカリ・ヤフオク・ラクマ向けの説明文を完全自動生成。もう、何を書くか悩む必要はありません。
        </p>
        <button
          onClick={onLoginClick}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full overflow-hidden shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2">
            完全無料で試す（1日3回まで）
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16 text-[var(--color-text-primary)]">
            こんな「面倒くさい」<br className="md:hidden" />ありませんか？
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 text-xl">😩</div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">出品文を考えるのが面倒</h3>
              <p className="text-sm text-gray-500 mb-4 line-through decoration-red-400/50">「何を書けばいいかわからない…」</p>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-orange-600">→ キーワードを並べるだけでAIが完璧な文章を作成。</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-xl">📱</div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">サイト毎の書き分けが大変</h3>
              <p className="text-sm text-gray-500 mb-4 line-through decoration-blue-400/50">「メルカリとヤフオクでルールが違う…」</p>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-orange-600">→ AIが各サイトの特性に合わせて自動調整。</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 text-xl">⏳</div>
              <h3 className="text-lg font-bold mb-3 text-gray-800">とにかく時間をかけたくない</h3>
              <p className="text-sm text-gray-500 mb-4 line-through decoration-green-400/50">「出品作業だけで疲れる…」</p>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-orange-600">→ 3ステップ・最短30秒で出品準備完了。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16 text-[var(--color-text-primary)]">
            たった3ステップで完了
          </h2>
          <div className="relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 opacity-30"></div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-3xl border-2 border-orange-100 shadow-lg shadow-orange-100/50 flex items-center justify-center mb-6 z-10 relative">
                  <Edit3 className="w-10 h-10 text-orange-500" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">1</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">メモを書く</h3>
                <p className="text-gray-500 leading-relaxed text-sm">商品の特徴や状態を<br/>簡単な箇条書きで入力するだけ。</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl shadow-lg shadow-orange-500/30 flex items-center justify-center mb-6 z-10 relative">
                  <Sparkles className="w-10 h-10 text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">2</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">AIが整形</h3>
                <p className="text-gray-500 leading-relaxed text-sm">1クリックでAIが<br/>魅力的な文章へ魔法のように変換。</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-3xl border-2 border-orange-100 shadow-lg shadow-orange-100/50 flex items-center justify-center mb-6 z-10 relative">
                  <ClipboardCopy className="w-10 h-10 text-orange-500" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">3</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">コピペで出品</h3>
                <p className="text-gray-500 leading-relaxed text-sm">あとはフリマアプリに<br/>貼り付けて出品ボタンを押すだけ。</p>
              </div>
            </div>
          </div>
          
          <div className="mt-20 text-center">
             <button
                onClick={onLoginClick}
                className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-full shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                さっそく使ってみる
              </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <a href="/legal/terms" className="hover:text-gray-600 hover:underline">利用規約</a>
          <a href="/legal/privacy" className="hover:text-gray-600 hover:underline">プライバシーポリシー</a>
          <a href="/legal/tokushoho" className="hover:text-gray-600 hover:underline">特定商取引法に基づく表記</a>
        </div>
      </footer>
    </div>
  )
}
