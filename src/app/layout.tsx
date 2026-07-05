import type { Metadata } from 'next'
import { Zen_Maru_Gothic } from 'next/font/google'
import './globals.css'

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FleaScript | フリマ出品を1秒で。AIが利益計算と説明文を自動生成',
  description:
    'メルカリ・ヤフオク・ラクマ対応。送料・利益計算から最適化された説明文作成までを全自動化するMicro-SaaS。あなたのマイルールも記憶してパーソナライズ！',
  openGraph: {
    title: 'FleaScript | フリマ出品を1秒で。',
    description: '送料・利益計算から最適化された説明文作成までを全自動化する神ツール📦✨',
    url: 'https://fleascript.vercel.app',
    siteName: 'FleaScript',
    images: [
      {
        url: 'https://fleascript.vercel.app/og-image.png', // （仮）本番デプロイ時に画像を差し替える想定
        width: 1200,
        height: 630,
        alt: 'FleaScript OGP Image',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FleaScript | フリマ出品を1秒で。',
    description: '送料・利益計算から最適化された説明文作成までを全自動化する神ツール📦✨',
    images: ['https://fleascript.vercel.app/og-image.png'],
  },
}

import InAppBrowserWarning from '@/components/InAppBrowserWarning'

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${zenMaruGothic.className} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('theme');
                if (storedTheme && storedTheme !== 'kinfolk') {
                  document.documentElement.setAttribute('data-theme', storedTheme);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased relative overflow-x-hidden">
        {/* オーガニックな背景テクスチャと柔らかな環境光 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {/* ノイズテクスチャ（アナログな紙・布の質感） */}
          <div 
            className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />
          {/* 木漏れ日/サンセットの環境光（ゆっくり漂う） */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--color-accent)] opacity-20 blur-[100px] animate-ambient-1" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[var(--color-brand)] opacity-20 blur-[120px] animate-ambient-2" />
        </div>
        
        {/* メインコンテンツ */}
        <div className="relative z-10 flex flex-col min-h-full">
          {children}
        </div>

        {/* アプリ内ブラウザ脱出UI */}
        <InAppBrowserWarning />
      </body>
    </html>
  )
}
