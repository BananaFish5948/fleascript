import { Metadata } from 'next'
import Link from 'next/link'

type Props = {
  params: { uid: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wleptsbmrzorpnosrgiu.supabase.co'
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/temporary_shares/${params.uid}/monthly_report.jpg`
  
  return {
    title: '今月のフリマ成果！ - FleaScript',
    description: 'フリマ出品の「めんどくさい」を1秒で消し去る魔法。AIがフリマ出品と利益計算を自動化します。',
    openGraph: {
      title: '今月のフリマ成果！ - FleaScript',
      description: 'フリマ出品の「めんどくさい」を1秒で消し去る魔法。',
      images: [
        {
          url: imageUrl,
          width: 1080,
          height: 1080,
          alt: 'Monthly Report',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '今月のフリマ成果！ - FleaScript',
      description: 'フリマ出品の「めんどくさい」を1秒で消し去る魔法。',
      images: [imageUrl],
    },
  }
}

export default function ReportPage({ params }: Props) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wleptsbmrzorpnosrgiu.supabase.co'
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/temporary_shares/${params.uid}/monthly_report.jpg`

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
        <div className="p-6 text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <span>📦 今月のフリマ成果</span>
          </h1>
          
          <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-inner mb-6">
            <img src={imageUrl} alt="Monthly Report" className="w-full h-full object-contain" />
          </div>

          <p className="text-sm text-gray-600 mb-6 font-medium">
            AIがフリマ出品と利益計算を1秒で終わらせる神ツール<br/>
            <span className="text-brand font-bold">FleaScript</span> で管理中！
          </p>
          
          <Link 
            href="/"
            className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
          >
            無料で使ってみる
          </Link>
        </div>
      </div>
    </div>
  )
}
