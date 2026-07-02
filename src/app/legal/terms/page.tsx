import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 | FleaScript',
  description: 'FleaScriptの利用規約です。',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7fafc] text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
          利用規約
        </h1>
        
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <p className="text-gray-400 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200 text-center">
            [ここに利用規約の本文を入力してください]<br/>
            例：本規約は、[運営者名]（以下、「当方」といいます。）が提供するサービス「FleaScript」の利用条件を定めるものです。
          </p>
          
          {/* ダミーのセクション例 */}
          <h2 className="font-bold text-lg text-gray-900 mt-6">第1条（適用）</h2>
          <p>1. 本規約は、ユーザーと当方との間の本サービスの利用に関わる一切の関係に適用されるものとします。</p>
          
          <h2 className="font-bold text-lg text-gray-900 mt-6">第2条（禁止事項）</h2>
          <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
            <li>その他、当方が不適切と判断する行為</li>
          </ul>

          <h2 className="font-bold text-lg text-gray-900 mt-6">第3条（免責事項）</h2>
          <p>当方は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。</p>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-[var(--color-brand)] font-bold hover:underline">
            ← トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
