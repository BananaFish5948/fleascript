import { Metadata } from 'next'
import { seoCategories } from '@/data/seoCategories'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Next.js 15+ Params are Promises
type Props = {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return Object.keys(seoCategories).map((id) => ({
    id: id,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const category = seoCategories[id]
  if (!category) return {}

  return {
    title: category.title,
    description: category.description,
    openGraph: {
      title: category.title,
      description: category.description,
    }
  }
}

export default async function TemplatePage({ params }: Props) {
  const { id } = await params;
  const category = seoCategories[id]

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] text-gray-900">
      <main className="max-w-3xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--color-brand)] mb-6 leading-tight">
            {category.name}の出品文、<br className="md:hidden"/>5秒で完成。
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {category.description}
          </p>
          
          <Link href={`/?template=${id}`} className="inline-flex items-center justify-center py-4 px-8 rounded-full shadow-lg text-lg font-bold text-white bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 hover:-translate-y-1 transition-all">
            ✨ 無料で {category.name} の説明文を作る
          </Link>
        </div>

        {/* 独自コンテンツ（Tips） */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>💡</span> フリマで高く・早く売るためのポイント
          </h2>
          <div className="space-y-4">
            {category.tips.map((tip, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)] flex items-center justify-center font-bold text-sm mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 使い方プレビュー */}
        <div className="w-full text-center">
          <h3 className="text-lg font-bold text-gray-600 mb-4">入力例</h3>
          <div className="bg-gray-100 rounded-xl p-4 text-left font-mono text-sm text-gray-700 mb-8 border border-gray-200">
            {category.exampleInput.split('\n').map((line, i) => (
              <p key={i} className="mb-1">{line}</p>
            ))}
          </div>
          
          <Link href={`/?template=${id}`} className="text-[var(--color-brand)] font-bold hover:underline">
            このテンプレートでさっそく作成する →
          </Link>
        </div>

      </main>
      
      {/* フッター */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-200">
        <Link href="/" className="hover:underline">FleaScript トップページ</Link>
      </footer>
    </div>
  )
}
