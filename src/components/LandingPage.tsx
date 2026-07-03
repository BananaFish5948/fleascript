'use client'

import { Sparkles, Edit3, ClipboardCopy, ArrowRight, Bot, Truck, LayoutDashboard, BrainCircuit, TrendingUp, Gift } from 'lucide-react'

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-b from-white to-gray-50/50">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-6 leading-tight">
          フリマの「めんどくさい」を<br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">1秒で消し去る魔法。</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          送料で損してませんか？FleaScriptなら、利益計算からプラットフォーム別の最適化された説明文作成までをAIが完全自動化。もう出品で悩む必要はありません。
        </p>
        <button
          onClick={onLoginClick}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full overflow-hidden shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2">
            完全無料で始める
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </section>

      {/* Features Grid Section (New) */}
      <section className="py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-bold tracking-wider text-sm uppercase bg-orange-100/50 px-4 py-1.5 rounded-full border border-orange-200/50">All-in-One</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-6 text-gray-900">
              フリマ出品に必要なすべてを、この1つに。
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">
              ただの文章作成ツールではありません。在庫管理から利益最大化の分析まで、あなたのフリマライフを劇的に効率化します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">AI商品説明自動作成</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                箇条書きのメモから、メルカリ・ヤフオク・ラクマそれぞれのプラットフォームに最適化された魅力的な説明文を1秒で生成します。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">最安送料＆利益計算</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                商品の厚さと重さを入力するだけで、最も安い発送方法をAIが即座に判定。手数料を引いた手元に残る「本当の利益」を可視化します。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">軽快な在庫ダッシュボード</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                出品待ちから売却済まで、すべてのアイテムのステータスと利益を一元管理。アプリよりも見やすく、手帳よりもスマートに。
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">マイルール記憶</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                「非喫煙者」「ペットなし」「即購入OK」など、あなた独自のルールをシステムが記憶し、毎回の文章生成時に自動で組み込みます。
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl">Premium</div>
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">売れ筋タイム分析</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                あなたの過去の売却データから「一番売れやすい曜日・時間帯」をAIが算出。勘に頼らない、最適な出品タイミングを提案します。
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">お友達招待で枠が拡張</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                あなた専用の招待コードをお友達が使うと、双方の無料作成枠が永続的に増加。広告費ゼロで広がるバイラルシステムを搭載。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
              使い方は、たった3ステップ
            </h2>
            <p className="text-gray-500 mt-4">直感的な操作で、誰でもすぐに使いこなせます。</p>
          </div>
          
          <div className="relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 opacity-30"></div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-3xl border-2 border-orange-100 shadow-lg shadow-orange-100/50 flex items-center justify-center mb-6 z-10 relative">
                  <Edit3 className="w-10 h-10 text-orange-500" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">1</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">情報をメモする</h3>
                <p className="text-gray-500 leading-relaxed text-sm">商品の特徴や状態、サイズなどを<br/>簡単な箇条書きで入力します。</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl shadow-lg shadow-orange-500/30 flex items-center justify-center mb-6 z-10 relative">
                  <Sparkles className="w-10 h-10 text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">2</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">AIが自動計算＆整形</h3>
                <p className="text-gray-500 leading-relaxed text-sm">1クリックで最安送料を判定し、<br/>魅力的な文章へ魔法のように変換。</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-3xl border-2 border-orange-100 shadow-lg shadow-orange-100/50 flex items-center justify-center mb-6 z-10 relative">
                  <ClipboardCopy className="w-10 h-10 text-orange-500" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">3</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">コピペで出品完了</h3>
                <p className="text-gray-500 leading-relaxed text-sm">あとはメルカリなどのアプリに<br/>貼り付けて出品ボタンを押すだけ。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            さあ、フリマ出品をハックしよう。
          </h2>
          <p className="text-gray-500 mb-10">
            初期費用も月額料金も不要。Googleアカウントですぐに始められます。
          </p>
          <button
            onClick={onLoginClick}
            className="inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-bold text-white bg-gray-900 rounded-full shadow-xl hover:bg-black hover:-translate-y-1 transition-all duration-300"
          >
            完全無料で始める
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full bg-gray-50 border-t border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-400 font-bold text-sm flex items-center gap-2">
            📦 FleaScript
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
            <a href="/legal/terms" className="hover:text-gray-800 transition-colors">利用規約</a>
            <a href="/legal/privacy" className="hover:text-gray-800 transition-colors">プライバシーポリシー</a>
            <a href="/legal/tokushoho" className="hover:text-gray-800 transition-colors">特定商取引法に基づく表記</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
