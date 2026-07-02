import type { Metadata } from 'next'
import { Zen_Maru_Gothic } from 'next/font/google'
import './globals.css'

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FleaScript — フリマ商品説明を一瞬で自動作成',
  description:
    'メモを貼り付けるだけで、メルカリ・ラクマ等に使えるプロ品質の商品説明文をAIが自動生成。完全無料・登録不要。',
  openGraph: {
    title: 'FleaScript — フリマ商品説明を一瞬で自動作成',
    description: 'メモを貼り付けるだけでAIが商品説明文を自動生成します。',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${zenMaruGothic.className} h-full`}>
      <body className="min-h-full flex flex-col antialiased relative overflow-x-hidden">
        {/* 背景のアンビエント・オーブ（光の玉） */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-pink-300/30 blur-[100px] animate-ambient-1" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-200/30 blur-[120px] animate-ambient-2" />
        </div>
        
        {/* メインコンテンツ */}
        <div className="relative z-10 flex flex-col min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
}
