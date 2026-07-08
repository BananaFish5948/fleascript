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
          <p>
            本利用規約（以下「本規約」といいます。）は、FleaScript運営事務局（以下「当事務局」といいます。）が提供するサービス「FleaScript」（以下「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆様（以下「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。
          </p>
          
          <h2 className="font-bold text-lg text-gray-900 mt-6">第1条（適用）</h2>
          <p>1. 本規約は、ユーザーと当事務局との間の本サービスの利用に関わる一切の関係に適用されるものとします。</p>
          <p>2. 当事務局が本サービス上で掲載するルールやガイドライン等は、本規約の一部を構成するものとします。</p>
          
          <h2 className="font-bold text-lg text-gray-900 mt-6">第2条（利用登録とアカウント管理）</h2>
          <p>1. 本サービスの利用を希望する者は、本規約に同意の上、当事務局の定める方法によって利用登録を行うものとします。</p>
          <p>2. ユーザーは、自己の責任においてアカウントおよびログイン情報を管理するものとします。いかなる場合も、これらを第三者に譲渡または貸与することはできません。</p>
          
          <h2 className="font-bold text-lg text-gray-900 mt-6">第3条（利用料金および決済）</h2>
          <p>1. ユーザーは、本サービスの有料プランを利用する場合、当事務局が定める利用料金を支払うものとします。</p>
          <p>2. 利用料金の支払いは、Stripe等の外部決済サービスを通じたクレジットカード、またはその他当事務局が指定する方法により行われます。</p>
          
          <h2 className="font-bold text-lg text-gray-900 mt-6">第4条（禁止事項）</h2>
          <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>法令または公序良俗に違反する行為、あるいは犯罪行為に関連する行為</li>
            <li>本サービスおよびコンテンツに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
            <li>本サービスのサーバーやネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>他のユーザーのアカウントを不正に使用する行為</li>
            <li>その他、当事務局が不適切と判断する行為</li>
          </ul>
 
          <h2 className="font-bold text-lg text-gray-900 mt-6">第5条（サービスの提供停止・変更・中断）</h2>
          <p>当事務局は、システムの保守点検、火災・停電、天災地変、またはAPI（OpenAIやSupabase等）の障害や仕様変更により、ユーザーに事前に通知することなく本サービスの提供を中断、変更、または廃止することができるものとし、これによってユーザーに生じた不利益について一切の責任を負いません。</p>

          <h2 className="font-bold text-lg text-gray-900 mt-6">第6条（免責事項）</h2>
          <p>1. 当事務局は、本サービス（AIによって生成された商品説明文を含みます）に事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどの欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。</p>
          <p>2. ユーザーが本サービスにより生成した文章を使用した結果、メルカリ等のフリマプラットフォームにおいてアカウント規制や取引上のトラブルが生じた場合であっても、当事務局は一切の責任を負わないものとします。</p>

          <h2 className="font-bold text-lg text-gray-900 mt-6">第7条（規約の変更）</h2>
          <p>当事務局は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の利用規約は、本サービス上に表示された時点より効力を生じるものとします。</p>
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
