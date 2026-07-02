import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | FleaScript',
  description: 'FleaScriptのプライバシーポリシーです。',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f7fafc] text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
          プライバシーポリシー
        </h1>
        
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <p className="text-gray-400 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200 text-center">
            [ここにプライバシーポリシーの本文を入力してください]<br/>
            例：[運営者名]（以下、「当方」といいます。）は、本ウェブサイト上で提供するサービスにおける、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシーを定めます。
          </p>
          
          <h2 className="font-bold text-lg text-gray-900 mt-6">第1条（個人情報の収集方法）</h2>
          <p>当方は、ユーザーが利用登録をする際に氏名、メールアドレスなどの個人情報をお尋ねすることがあります。また、ユーザーが入力したプロンプト（テキスト情報）は、サービスの改善およびAIの生成処理のために送信・保存されます。</p>
          
          <h2 className="font-bold text-lg text-gray-900 mt-6">第2条（個人情報を収集・利用する目的）</h2>
          <p>当方が個人情報を収集・利用する目的は、以下のとおりです。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>当方サービスの提供・運営のため</li>
            <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
            <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
            <li>上記の利用目的に付随する目的</li>
          </ul>

          <h2 className="font-bold text-lg text-gray-900 mt-6">第3条（個人情報の第三者提供）</h2>
          <p>当方は、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。なお、テキスト生成のためにOpenAI等の外部APIにデータを送信しますが、オプトアウト設定により学習利用はされません。</p>
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
