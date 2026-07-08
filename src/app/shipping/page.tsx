import { Metadata } from 'next'
import Link from 'next/link'
import ShippingCalculator from '@/components/ShippingCalculator'
import { ArrowRight, Package, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'フリマ送料比較シミュレーター | 最安発送方法をAI判定 【無料・登録不要】 - FleaScript',
  description:
    '厚さと重さを入力するだけで、ネコポス・ゆうパケット・宅急便コンパクト・ゆうパック等から最も安い発送方法を瞬時に計算。メルカリやヤフオクの出品利益を最大化する送料判定ツール。',
  openGraph: {
    title: 'フリマ送料比較シミュレーター | 最安発送方法をAI判定 【無料・登録不要】 - FleaScript',
    description: '厚さと重さを入力するだけで、最も安い発送方法を瞬時に計算して利益を最大化！📦✨',
    url: 'https://fleascript.vercel.app/shipping',
    type: 'website',
  },
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col selection:bg-stone-200">
      {/* シンプルなヘッダー */}
      <header className="w-full bg-white border-b border-stone-200 py-4 shadow-sm relative z-20">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="text-stone-700 font-bold text-base flex items-center gap-2 tracking-wide hover:opacity-85 transition-opacity">
            <Package className="w-5 h-5 text-[var(--color-brand)]" />
            <span>FleaScript</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors">
            AI商品説明作成ツールはこちら →
          </Link>
        </div>
      </header>

      {/* メインエリア */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full relative z-10">
        <div className="text-center mb-10">
          <span className="text-[var(--color-brand)] font-bold tracking-widest text-[10px] uppercase bg-[var(--color-brand-dim)] px-4 py-1.5 rounded-full border border-[var(--color-brand)]/10">
            Free Tools
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold text-stone-800 tracking-tight mt-4 mb-4">
            フリマ最安送料シミュレーター
          </h1>
          <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            荷物の厚さと重さを入力するだけで、メルカリやヤフオク、ラクマで使えるすべての配送方法から一番安い送料を一瞬で計算します。
          </p>
        </div>

        {/* 送料シミュレーターコンポーネント (ログイン不要として起動) */}
        <ShippingCalculator subscriptionStatus="free" />

        {/* 強力なCTA（コンバージョン誘導カード） */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-accent)]/20 rounded-3xl p-6 md:p-8 shadow-[var(--shadow-card)] text-center mt-10 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-accent)]"></div>
          
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[var(--color-brand-dim)] text-[var(--color-brand)] items-center justify-center mb-6 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-lg md:text-xl font-bold text-stone-800 mb-3 tracking-wide">
            手元に残る利益が分かったら、次はAIで「商品説明文」を作りませんか？
          </h2>
          <p className="text-xs md:text-sm text-stone-600 max-w-md mx-auto mb-8 leading-relaxed">
            FleaScriptなら、商品のメモを書くだけで、売れやすい商品説明文をAIが1秒で自動生成。フリマの出品時間を90%削減します。
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-bold text-white bg-[var(--color-brand)] rounded-full hover:bg-[var(--color-brand-light)] hover:-translate-y-0.5 transition-all shadow-md cursor-pointer"
          >
            <span>無料でAI商品説明文を作成する</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* フッター */}
      <footer className="w-full bg-stone-100 border-t border-stone-200 py-10 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-between gap-4 text-center">
          <div className="text-stone-500 font-bold text-sm flex items-center gap-2 tracking-wide justify-center">
            <Package className="w-5 h-5" />
            FleaScript
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-stone-500 my-2">
            <Link href="/legal/terms" className="hover:text-stone-800 transition-colors">利用規約</Link>
            <Link href="/legal/privacy" className="hover:text-stone-800 transition-colors">プライバシーポリシー</Link>
            <Link href="/legal/tokushoho" className="hover:text-stone-800 transition-colors">特定商取引法に基づく表記</Link>
          </div>
          <p className="text-[10px] text-stone-400 mt-4">© {new Date().getFullYear()} FleaScript. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
