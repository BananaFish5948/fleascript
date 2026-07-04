'use client'

import { Sparkles, Edit3, ClipboardCopy, ArrowRight, Bot, Truck, LayoutDashboard, BrainCircuit, TrendingUp, Gift, Package } from 'lucide-react'

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-stone-50 selection:bg-stone-200">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-extrabold text-stone-800 tracking-tight mb-6 leading-tight">
          フリマの「めんどくさい」を<br className="md:hidden" />
          <span className="text-orange-800">1秒で消し去る魔法。</span>
        </h1>
        <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          送料で損してませんか？FleaScriptなら、利益計算からプラットフォーム別の最適化された説明文作成までをAIが完全自動化。もう出品で悩む必要はありません。
        </p>
        <button
          onClick={onLoginClick}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-orange-800 rounded-full overflow-hidden shadow-md shadow-orange-900/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2 tracking-wide">
            完全無料で始める
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 h-full w-full bg-orange-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-800 font-bold tracking-widest text-xs uppercase bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">All-in-One</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-6 text-stone-800">
              フリマ出品に必要なすべてを、この1つに。
            </h2>
            <p className="text-stone-600 mt-4 max-w-2xl mx-auto leading-relaxed">
              ただの文章作成ツールではありません。在庫管理から利益最大化の分析まで、あなたのフリマライフを劇的に効率化します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-white text-stone-700 border border-stone-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">AI商品説明自動作成</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                箇条書きのメモから、メルカリ・ヤフオク・ラクマそれぞれのプラットフォームに最適化された魅力的な説明文を1秒で生成します。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-white text-stone-700 border border-stone-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">最安送料＆利益計算</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                商品の厚さと重さを入力するだけで、最も安い発送方法をAIが即座に判定。手数料を引いた手元に残る「本当の利益」を可視化します。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-white text-stone-700 border border-stone-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">軽快な在庫ダッシュボード</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                出品待ちから売却済まで、すべてのアイテムのステータスと利益を一元管理。アプリよりも見やすく、手帳よりもスマートに。
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-white text-stone-700 border border-stone-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">マイルール記憶</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                「非喫煙者」「ペットなし」「即購入OK」など、あなた独自のルールをシステムが記憶し、毎回の文章生成時に自動で組み込みます。
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl border-2 border-teal-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-teal-800 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-bl-xl">Premium</div>
              <div className="w-12 h-12 bg-teal-50 text-teal-800 border border-teal-100 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">売れ筋タイム分析</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                あなたの過去の売却データから「一番売れやすい曜日・時間帯」をAIが算出。勘に頼らない、最適な出品タイミングを提案します。
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-white text-stone-700 border border-stone-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">お友達招待で枠が拡張</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                あなた専用の招待コードをお友達が使うと、双方の無料作成枠が永続的に増加。広告費ゼロで広がるバイラルシステムを搭載。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-800">
              使い方は、たった3ステップ
            </h2>
            <p className="text-stone-600 mt-4">直感的な操作で、誰でもすぐに使いこなせます。</p>
          </div>
          
          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[1px] bg-stone-200"></div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="relative flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center justify-center mb-6 z-10 relative">
                  <Edit3 className="w-8 h-8 text-stone-700" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-stone-800 text-stone-50 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">1</div>
                </div>
                <h3 className="text-lg font-bold mb-3 text-stone-800">情報をメモする</h3>
                <p className="text-stone-600 leading-relaxed text-sm">商品の特徴や状態、サイズなどを<br/>簡単な箇条書きで入力します。</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-orange-800 rounded-2xl shadow-md flex items-center justify-center mb-6 z-10 relative">
                  <Sparkles className="w-8 h-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-stone-800 text-stone-50 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">2</div>
                </div>
                <h3 className="text-lg font-bold mb-3 text-stone-800">AIが自動計算＆整形</h3>
                <p className="text-stone-600 leading-relaxed text-sm">1クリックで最安送料を判定し、<br/>魅力的な文章へスマートに変換。</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center justify-center mb-6 z-10 relative">
                  <ClipboardCopy className="w-8 h-8 text-stone-700" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-stone-800 text-stone-50 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">3</div>
                </div>
                <h3 className="text-lg font-bold mb-3 text-stone-800">コピペで出品完了</h3>
                <p className="text-stone-600 leading-relaxed text-sm">あとはメルカリなどのアプリに<br/>貼り付けて出品ボタンを押すだけ。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 bg-stone-100 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-6 tracking-tight">
            さあ、フリマ出品をハックしよう。
          </h2>
          <p className="text-stone-600 mb-10">
            初期費用も月額料金も不要。Googleアカウントなどですぐに始められます。
          </p>
          <button
            onClick={onLoginClick}
            className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-bold text-white bg-stone-800 rounded-full shadow-md hover:bg-stone-900 hover:-translate-y-0.5 transition-all duration-300"
          >
            完全無料で始める
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full bg-stone-50 border-t border-stone-200 py-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-stone-500 font-bold text-sm flex items-center gap-2 tracking-wide">
            <Package className="w-5 h-5" />
            FleaScript
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-stone-500">
            <a href="/legal/terms" className="hover:text-stone-800 transition-colors">利用規約</a>
            <a href="/legal/privacy" className="hover:text-stone-800 transition-colors">プライバシーポリシー</a>
            <a href="/legal/tokushoho" className="hover:text-stone-800 transition-colors">特定商取引法に基づく表記</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
