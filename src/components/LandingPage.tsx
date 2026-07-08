'use client'

import { Sparkles, Edit3, ClipboardCopy, ArrowRight, Bot, Truck, LayoutDashboard, BrainCircuit, TrendingUp, Gift, Package, Check } from 'lucide-react'
import XCarouselMock from './XCarouselMock'

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
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-[var(--color-brand)] rounded-full overflow-hidden shadow-md shadow-stone-900/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-2 tracking-wide">
            無料で試してみる
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 h-full w-full bg-[var(--color-brand-light)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </section>

      {/* X (Twitter) Carousel Mock Section */}
      <section className="py-20 bg-stone-100/40 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-[var(--color-brand)] font-bold tracking-widest text-xs uppercase bg-[var(--color-brand-dim)] px-4 py-1.5 rounded-full border border-[var(--color-brand)]/10">
            Concept Preview
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mt-6 text-[var(--color-text-primary)]">
            SNSで話題の「暮らしの調律」体験
          </h2>
          <p className="text-sm md:text-base text-[var(--color-text-secondary)] mt-4 mb-10 max-w-lg mx-auto leading-relaxed">
            アースカラーの美学で体験する、フリマライフのハック＆最適化。
          </p>
          <XCarouselMock />
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[var(--color-brand)] font-bold tracking-widest text-xs uppercase bg-[var(--color-brand-dim)] px-4 py-1.5 rounded-full border border-[var(--color-brand)]/10">All-in-One</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-6 text-[var(--color-text-primary)]">
              フリマ出品に必要なすべてを、この1つに。
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-4 max-w-2xl mx-auto leading-relaxed">
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
            <div className="bg-[var(--color-bg-surface)] p-8 rounded-2xl border-2 border-[var(--color-brand)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[var(--color-brand)] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-bl-xl">Premium</div>
              <div className="w-12 h-12 bg-[var(--color-brand-dim)] text-[var(--color-brand)] border border-[var(--color-brand)]/10 rounded-xl flex items-center justify-center mb-6 shadow-sm">
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
                <div className="w-20 h-20 bg-[var(--color-brand)] rounded-2xl shadow-md flex items-center justify-center mb-6 z-10 relative">
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

      {/* Pricing Section */}
      <section className="py-24 bg-white border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[var(--color-brand)] font-bold tracking-widest text-xs uppercase bg-[var(--color-brand-dim)] px-4 py-1.5 rounded-full border border-[var(--color-brand)]/10">PRICING</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-6 text-[var(--color-text-primary)]">
              シンプルで透明な料金プラン
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-4 max-w-2xl mx-auto leading-relaxed">
              定額の月額課金のみ。追加のトークン課金や隠れた費用は一切ありません。<br />
              まずは無料プランでツールの使い心地をお試しください。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-[var(--color-bg-base)]/30 rounded-2xl p-8 border border-[var(--color-border)] shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">フリー (Free)</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-6 leading-relaxed">まずは気軽に使い心地を試したい方に</p>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-[var(--color-text-primary)]">¥0</span>
                  <span className="text-xs text-[var(--color-text-muted)] ml-1">/ 永続</span>
                </div>
                <ul className="space-y-3.5 text-xs text-[var(--color-text-secondary)] mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-accent)] shrink-0" strokeWidth={2.5} />
                    <span>在庫登録上限: <strong>3件</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-accent)] shrink-0" strokeWidth={2.5} />
                    <span>AI文章生成: 日常利用可能</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-accent)] shrink-0" strokeWidth={2.5} />
                    <span>最安送料判定 ＆ 利益計算</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-accent)] shrink-0" strokeWidth={2.5} />
                    <span>マイルール記憶機能</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onLoginClick}
                className="w-full py-3 px-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-xs tracking-widest hover:bg-[var(--color-bg-base)] transition-colors cursor-pointer"
              >
                無料で始める
              </button>
            </div>

            {/* Standard Plan */}
            <div className="bg-[var(--color-bg-surface)] rounded-2xl p-8 border border-[var(--color-accent)]/30 shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-[var(--color-accent)] text-white text-[9px] font-bold tracking-widest px-3 py-1 rounded-full uppercase shadow-sm">
                Standard
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">スタンダード</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-6 leading-relaxed">一般の出品者・整理整頓を進めたい方に</p>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-[var(--color-text-primary)]">¥500</span>
                  <span className="text-xs text-[var(--color-text-muted)] ml-1">/ 月 (税込)</span>
                </div>
                <ul className="space-y-3.5 text-xs text-[var(--color-text-secondary)] mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-accent)] shrink-0" strokeWidth={2.5} />
                    <span>在庫登録上限: <strong>100件</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-accent)] shrink-0" strokeWidth={2.5} />
                    <span>1日のAI生成回数: <strong>15回</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-accent)] shrink-0" strokeWidth={2.5} />
                    <span>入力文字数上限: <strong>1,500文字</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-accent)] shrink-0" strokeWidth={2.5} />
                    <span>文章末尾のコピーライト非表示</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onLoginClick}
                className="w-full py-3 px-4 rounded-xl bg-[var(--color-accent)] text-white font-bold text-xs tracking-widest hover:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-[var(--color-accent)]/10"
              >
                スタンダードを選択
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-[var(--color-bg-surface)] rounded-2xl p-8 border-2 border-[var(--color-brand)] shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-[var(--color-brand)] text-white text-[9px] font-bold tracking-widest px-3 py-1 rounded-full uppercase shadow-sm">
                イチオシ
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">プレミアム</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-6 leading-relaxed">販売を本格化・利益を最大化させたい方に</p>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-[var(--color-text-primary)]">¥1,000</span>
                  <span className="text-xs text-[var(--color-text-muted)] ml-1">/ 月 (税込)</span>
                </div>
                <ul className="space-y-3.5 text-xs text-[var(--color-text-secondary)] mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-brand)] shrink-0" strokeWidth={2.5} />
                    <span>在庫登録上限: <strong>500件</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-brand)] shrink-0" strokeWidth={2.5} />
                    <span>1日のAI生成回数: <strong>50回</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-brand)] shrink-0" strokeWidth={2.5} />
                    <span>すべてのAI高度診断機能</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--color-brand)] shrink-0" strokeWidth={2.5} />
                    <span>プレミアム限定カスタム署名</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onLoginClick}
                className="w-full py-3 px-4 rounded-xl bg-[var(--color-brand)] text-white font-bold text-xs tracking-widest hover:bg-[var(--color-brand-light)] transition-colors cursor-pointer shadow-sm shadow-[var(--color-brand)]/10"
              >
                プレミアムを選択
              </button>
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
            無料プランから気軽にお試し可能。いつでもプラン切り替え・解約が可能です。
          </p>
          <button
            onClick={onLoginClick}
            className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-bold text-white bg-[var(--color-brand)] rounded-full shadow-md hover:bg-[var(--color-brand-light)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            無料で試してみる
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SEO Template Links Section */}
      <section className="py-12 bg-stone-50 border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] text-center mb-6">
            AI商品説明テンプレート一覧
          </h3>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3.5 text-xs font-medium text-stone-500">
            <a href="/template/smartphone" className="hover:text-[var(--color-brand)] transition-colors">📱 スマートフォン</a>
            <a href="/template/sneaker" className="hover:text-[var(--color-brand)] transition-colors">👟 スニーカー</a>
            <a href="/template/tradingcard" className="hover:text-[var(--color-brand)] transition-colors">🃏 トレーディングカード</a>
            <a href="/template/bag" className="hover:text-[var(--color-brand)] transition-colors">👜 ブランドバッグ</a>
            <a href="/template/game" className="hover:text-[var(--color-brand)] transition-colors">🎮 ゲーム機本体</a>
            <a href="/template/book" className="hover:text-[var(--color-brand)] transition-colors">📚 本・コミック</a>
            <a href="/template/apparel" className="hover:text-[var(--color-brand)] transition-colors">👕 洋服・古着</a>
            <a href="/template/cosmetics" className="hover:text-[var(--color-brand)] transition-colors">💄 コスメ・香水</a>
          </div>
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
