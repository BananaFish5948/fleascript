import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
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
    <html lang="ja" className={`${notoSansJP.className} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
