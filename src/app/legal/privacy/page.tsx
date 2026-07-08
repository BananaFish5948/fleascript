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
          <p>
            FleaScript運営事務局（以下「当事務局」といいます。）は、本ウェブサイト上で提供するサービス「FleaScript」（以下「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
          </p>
          
          <h2 className="font-bold text-lg text-gray-900 mt-6">第1条（個人情報の収集方法）</h2>
          <p>1. 当事務局は、ユーザーが利用登録をする際に、メールアドレスおよび外部サービス連携に伴う認証情報（Google等のソーシャルログイン機能経由）を収集することがあります。</p>
          <p>2. ユーザーが本サービスに入力した商品説明作成用のメモやテキスト情報は、AI（OpenAI API）による生成処理および本サービス内での一時的な保存・管理のために収集されます。</p>
          
          <h2 className="font-bold text-lg text-gray-900 mt-6">第2条（個人情報を収集・利用する目的）</h2>
          <p>当事務局が個人情報を収集・利用する目的は、以下のとおりです。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>本サービス（AI文章生成、最安送料計算、在庫ダッシュボード）の適切な提供・運営のため</li>
            <li>ユーザー本人確認およびユーザーからのお問い合わせに対応するため</li>
            <li>有料プランの契約管理および決済手続き（外部サービスStripeと連携）のため</li>
            <li>利用規約に違反したユーザーや、不正利用を試みるユーザーを特定し、ご利用をお断りするため</li>
            <li>上記の利用目的に付随する目的</li>
          </ul>

          <h2 className="font-bold text-lg text-gray-900 mt-6">第3条（個人情報の安全管理および外部API送信）</h2>
          <p>1. 当事務局は、収集した個人情報の漏洩、紛失、破壊、改ざんを防ぐため、適切な安全管理措置を講じます。</p>
          <p>2. 本サービスでは、商品説明文の生成を行うためにOpenAI社のAPIへユーザーの入力テキストを送信します。なお、送信されたデータはAPIの契約仕様に基づき、AIの学習データとして使用されることはありません。</p>

          <h2 className="font-bold text-lg text-gray-900 mt-6">第4条（個人情報の第三者提供）</h2>
          <p>当事務局は、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合、または裁判所、警察等からの適法な開示請求があった場合を除きます。</p>

          <h2 className="font-bold text-lg text-gray-900 mt-6">第5条（アフィリエイトプログラムについて）</h2>
          <p>本サービスは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。アフィリエイトID（fleascript-22）を利用したリンク生成、およびネイティブ広告枠の表示が行われます。</p>

          <h2 className="font-bold text-lg text-gray-900 mt-6">第6条（お問い合わせ窓口）</h2>
          <p>本ポリシーに関するお問い合わせは、特定商取引法に基づく表記に記載のメールアドレス、または本サービス内のお問い合わせ窓口までご連絡ください。</p>
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
